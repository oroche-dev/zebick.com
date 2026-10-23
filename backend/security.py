"""Security helpers: DB client, JWT, passwords, bleach, audit, brute-force ledger."""

import re
import uuid
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional

import bcrypt
import bleach
import certifi
import jwt
from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorClient

import config

logger = logging.getLogger("zebick.security")

# --- DB singleton ---
# mongodb+srv:// (Atlas) always uses TLS — pin tlsCAFile to certifi's bundle
# there instead of relying on the OS trust store, since some minimal Docker
# base images (e.g. python:3.12-slim) ship a stale/incomplete ca-certificates
# package, which makes the handshake fail with "SSL: TLSV1_ALERT_INTERNAL_ERROR".
# Plain mongodb:// (local dev, no TLS) must NOT get tlsCAFile — passing any
# tls* option to pymongo implicitly turns TLS on, which breaks a local,
# unencrypted MongoDB.
_mongo_kwargs = {"tlsCAFile": certifi.where()} if config.MONGO_URL.startswith("mongodb+srv://") else {}
client = AsyncIOMotorClient(config.MONGO_URL, **_mongo_kwargs)
db = client[config.DB_NAME]

# --- Auth scheme ---
security = HTTPBearer()

# Staff roles allowed to hold an admin-panel session. Keep in sync with
# AdminUserCreate.role in models.py (which imports this set to build its
# validation pattern, so the two can't drift).
ADMIN_ROLES = {"admin", "superadmin", "employee", "designer", "developer", "support"}


# ================= INPUT SANITIZATION =================

def sanitize_text(text: Optional[str], max_length: int = 2000) -> Optional[str]:
    """Strip HTML (XSS protection) and cap length."""
    if text is None:
        return None
    cleaned = bleach.clean(text, tags=[], attributes={}, strip=True)
    return cleaned[:max_length].strip()


# Safe formatting tags for inbound email HTML: no script/style/iframe/svg/event
# handlers survive this, only structure. Applied once at IMAP ingestion so every
# consumer (admin inbox UI, quoted replies) gets already-clean HTML.
_EMAIL_HTML_TAGS = [
    "p", "br", "div", "span", "a", "b", "i", "u", "strong", "em",
    "ul", "ol", "li", "table", "thead", "tbody", "tr", "td", "th",
    "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "pre", "code", "hr", "img",
]
_EMAIL_HTML_ATTRS = {
    "a": ["href", "title"],
    "img": ["src", "alt", "width", "height"],
    "td": ["colspan", "rowspan"],
    "th": ["colspan", "rowspan"],
}


def sanitize_email_html(html: Optional[str], max_length: int = 50000) -> str:
    """Strip scripts/event handlers/dangerous tags from inbound email HTML."""
    if not html:
        return ""
    cleaned = bleach.clean(
        html, tags=_EMAIL_HTML_TAGS, attributes=_EMAIL_HTML_ATTRS,
        protocols=["http", "https", "mailto"], strip=True,
    )
    return cleaned[:max_length]


# ================= PASSWORD =================

def validate_password_strength(password: str) -> None:
    if len(password) < config.PASSWORD_MIN_LENGTH:
        raise HTTPException(
            status_code=400,
            detail=f"Passwort muss mindestens {config.PASSWORD_MIN_LENGTH} Zeichen lang sein.",
        )
    checks = {
        "Großbuchstabe": re.search(r"[A-Z]", password),
        "Kleinbuchstabe": re.search(r"[a-z]", password),
        "Ziffer": re.search(r"\d", password),
        "Sonderzeichen": re.search(r"[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>/?`~]", password),
    }
    missing = [n for n, m in checks.items() if not m]
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Passwort benötigt: {', '.join(missing)}.",
        )
    for bad in ("password", "passwort", "123456", "qwerty", "admin", "zebick"):
        if bad in password.lower():
            raise HTTPException(status_code=400, detail="Passwort zu leicht erratbar.")


def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt(rounds=12)).decode()


# Fixed dummy hash to compare against when no account was found — keeps the
# login response time for "unknown email" statistically close to "wrong
# password" (bcrypt.checkpw still runs the same cost factor), so timing
# can't be used to enumerate which admin emails exist.
_DUMMY_PASSWORD_HASH = hash_password(uuid.uuid4().hex)


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:  # noqa: BLE001
        return False


# ================= JWT =================

def create_jwt_token(email: str, role: str = "admin", mfa_verified: bool = False) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "email": email,
        "role": role,
        "mfa": mfa_verified,
        "exp": now + timedelta(hours=config.JWT_EXPIRATION_HOURS),
        "iat": now,
        "jti": uuid.uuid4().hex,
    }
    return jwt.encode(payload, config.JWT_SECRET, algorithm=config.JWT_ALGORITHM)


def verify_jwt_token(token: str) -> dict:
    try:
        return jwt.decode(token, config.JWT_SECRET, algorithms=[config.JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token abgelaufen")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Ungültiges Token")


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    token = credentials.credentials
    payload = verify_jwt_token(token)
    # Reject tokens not issued by the admin-login flow (e.g. a /api/player/* token
    # crafted with a victim admin's email — same JWT_SECRET, different role claim).
    if payload.get("role") not in ADMIN_ROLES:
        raise HTTPException(status_code=401, detail="Ungültiges Token")
    admin = await db.admin_users.find_one(
        {"email": payload.get("email"), "is_active": True},
        {"_id": 0, "password_hash": 0, "totp_secret": 0, "totp_secret_pending": 0},
    )
    if not admin:
        raise HTTPException(status_code=401, detail="Konto deaktiviert")
    # A password change stamps password_changed_at; any token issued before that
    # (iat, in epoch seconds) is a stale session and must be rejected even though
    # it hasn't expired yet.
    changed_at = admin.get("password_changed_at")
    if changed_at:
        try:
            changed_ts = datetime.fromisoformat(changed_at).timestamp()
        except (TypeError, ValueError):
            changed_ts = 0
        if payload.get("iat", 0) < changed_ts:
            raise HTTPException(status_code=401, detail="Sitzung abgelaufen, bitte erneut anmelden")
    # Role is authoritative from the DB, not the (potentially stale) JWT claim —
    # a role change takes effect immediately instead of waiting for token expiry.
    return {**payload, "role": admin.get("role", payload.get("role")), "admin": admin}


async def require_superadmin(current: dict = Depends(get_current_user)) -> dict:
    if current.get("role") != "superadmin":
        raise HTTPException(status_code=403, detail="Super-Admin erforderlich")
    return current


# Roles allowed to see customer-facing business data (CRM, contact forms,
# leads, offers/pricing) — deliberately excludes "designer"/"developer"/
# "employee", which previously had the same access as admin to this data
# purely because get_current_user() didn't distinguish roles beyond
# superadmin. "support" is included because reading/triaging contacts and
# leads is that role's actual job.
CRM_ROLES = {"admin", "superadmin", "support"}


async def require_crm_access(current: dict = Depends(get_current_user)) -> dict:
    if current.get("role") not in CRM_ROLES:
        raise HTTPException(status_code=403, detail="Keine Berechtigung für diesen Bereich")
    return current


# ================= AUDIT LOG =================

async def audit_log(
    action: str,
    actor: Optional[str],
    request: Optional[Request] = None,
    meta: Optional[dict] = None,
) -> None:
    try:
        entry = {
            "id": str(uuid.uuid4()),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "action": action,
            "actor": actor,
            "ip": request.client.host if request and request.client else None,
            "user_agent": request.headers.get("user-agent") if request else None,
            "meta": meta or {},
        }
        await db.audit_log.insert_one(entry)
    except Exception as e:  # noqa: BLE001
        logger.error(f"Audit log failure: {e}")


# ================= BRUTE-FORCE LEDGER =================

async def record_login_attempt(email: str, ip: str, success: bool) -> None:
    await db.login_attempts.insert_one({
        "id": str(uuid.uuid4()),
        "email": email.lower(),
        "ip": ip,
        "success": success,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })


async def is_locked_out(email: str, ip: str) -> bool:
    window_start = (
        datetime.now(timezone.utc) - timedelta(minutes=config.LOGIN_LOCKOUT_MINUTES)
    ).isoformat()
    failed = await db.login_attempts.count_documents({
        "$or": [{"email": email.lower()}, {"ip": ip}],
        "success": False,
        "timestamp": {"$gte": window_start},
    })
    return failed >= config.LOGIN_MAX_ATTEMPTS


# ================= ENSURE DEFAULT ADMIN =================

async def ensure_default_admin() -> None:
    count = await db.admin_users.count_documents({})
    if count == 0 and config.ADMIN_PASSWORD_HASH:
        await db.admin_users.insert_one({
            "id": str(uuid.uuid4()),
            "email": config.ADMIN_EMAIL,
            "name": "Super Admin",
            "role": "superadmin",
            "password_hash": config.ADMIN_PASSWORD_HASH,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "created_by": None,
            "is_active": True,
            "mfa_enabled": False,
            "totp_secret": None,
        })
        logger.info(f"Default super admin seeded: {config.ADMIN_EMAIL}")
