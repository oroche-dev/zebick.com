"""Central configuration loaded from .env. Fail-fast on missing secrets."""

import os
import uuid
import logging
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("zebick")

# --- MongoDB ---
MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]

# --- Security-critical ---
STRICT_SECURITY = os.environ.get("ENFORCE_STRICT_SECURITY", "true").lower() == "true"

JWT_SECRET = os.environ.get("JWT_SECRET")
if not JWT_SECRET or len(JWT_SECRET) < 32:
    if STRICT_SECURITY:
        raise RuntimeError(
            "JWT_SECRET must be >=32 chars. Generate via: "
            "python -c \"import secrets; print(secrets.token_urlsafe(64))\""
        )
    JWT_SECRET = "insecure-dev-fallback-" + uuid.uuid4().hex

JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = int(os.environ.get("JWT_EXPIRATION_HOURS", "2"))

ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@zebick.com").lower()
ADMIN_PASSWORD_HASH = os.environ.get("ADMIN_PASSWORD_HASH")

# Local test runs log in far more than 5x/min; strict mode always keeps the limits on.
RATE_LIMIT_ENABLED = STRICT_SECURITY or os.environ.get("RATE_LIMIT_ENABLED", "true").lower() != "false"
LOGIN_MAX_ATTEMPTS = int(os.environ.get("LOGIN_MAX_ATTEMPTS", "5"))
LOGIN_LOCKOUT_MINUTES = int(os.environ.get("LOGIN_LOCKOUT_MINUTES", "15"))
PASSWORD_MIN_LENGTH = int(os.environ.get("PASSWORD_MIN_LENGTH", "12"))

# Local backup folder. Defaults to <backend>/backups so it works on any host;
# set BACKUP_DIR to keep using an absolute path (e.g. /var/backups/zebick).
BACKUP_DIR = Path(os.environ.get("BACKUP_DIR") or ROOT_DIR / "backups")

CORS_ORIGINS = [
    o.strip() for o in os.environ.get("CORS_ORIGINS", "*").split(",") if o.strip()
]

# --- Third-party (optional) ---
LLM_API_KEY = os.environ.get("LLM_API_KEY")
# Email transport, checked in this order — all three send over HTTPS, so
# they work on hosts (e.g. Render) that block outbound SMTP ports. Falls
# back to raw SMTP below when none of these are set.
# 1) Gmail API (keeps sending as your existing Google/Workspace address —
#    see docs/email-gmail-api-setup.md for how to get these three values).
GMAIL_CLIENT_ID = os.environ.get("GMAIL_CLIENT_ID")
GMAIL_CLIENT_SECRET = os.environ.get("GMAIL_CLIENT_SECRET")
GMAIL_REFRESH_TOKEN = os.environ.get("GMAIL_REFRESH_TOKEN")
# 2) Resend (see docs/email-resend-setup.md).
RESEND_API_KEY = os.environ.get("RESEND_API_KEY")
SMTP_HOST = os.environ.get("SMTP_HOST")
SMTP_PORT = int(os.environ.get("SMTP_PORT", "465"))
SMTP_USERNAME = os.environ.get("SMTP_USERNAME")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD")
SMTP_FROM_EMAIL = os.environ.get("SMTP_FROM_EMAIL")
SMTP_FROM_NAME = os.environ.get("SMTP_FROM_NAME", "Zebick")
SMTP_MOCK = os.environ.get("SMTP_MOCK", "false").lower() == "true"
ADMIN_NOTIFICATION_EMAIL = os.environ.get("ADMIN_NOTIFICATION_EMAIL")
# Where contact-form submissions with service="support" get routed instead
# of ADMIN_NOTIFICATION_EMAIL. Falls back to ADMIN_NOTIFICATION_EMAIL if unset.
SUPPORT_NOTIFICATION_EMAIL = os.environ.get("SUPPORT_NOTIFICATION_EMAIL") or ADMIN_NOTIFICATION_EMAIL

GA_PROPERTY_ID = os.environ.get("GA_PROPERTY_ID", "")
GA_CREDENTIALS_PATH = ROOT_DIR / "ga_credentials.json"
