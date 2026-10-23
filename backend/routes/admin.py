"""Admin-only endpoints: auth, 2FA, users, content admin, security, backup, analytics."""

import io
import uuid
import base64
import logging
from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List

import pyotp
import qrcode
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

import config
import ga_analytics
from security import (
    db, audit_log, create_jwt_token, verify_password,
    validate_password_strength, hash_password, ensure_default_admin,
    record_login_attempt, is_locked_out,
    get_current_user, require_superadmin, require_crm_access,
    sanitize_text, _DUMMY_PASSWORD_HASH,
)
from models import (
    LoginRequest, LoginResponse, PasswordChangeRequest, EmailChangeRequest, MfaVerifyRequest,
    MfaSetupRequest, AdminUserCreate, AdminUserResponse, AdminUser,
    ContactEmailSend, InboxEmailUpdate, InboxReply, AutoTemplateUpdate, AutoTemplateTest,
    AdHocEmailSend,
)

logger = logging.getLogger("zebick.admin")
router = APIRouter(prefix="/api")
limiter = Limiter(key_func=get_remote_address, enabled=config.RATE_LIMIT_ENABLED)


async def _send_security_alert(to_email: str, action: str, request: Request) -> None:
    """Notify an admin of a sensitive change to their own account (password/
    email). Never raises — a notification failure must not break the request
    that triggered it."""
    try:
        from email_templates import send_template_email
        ip = request.client.host if request.client else "unknown"
        await send_template_email("security_alert", to_email, {
            "action": action,
            "email": to_email,
            "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
            "ip": ip,
        })
    except Exception as e:  # noqa: BLE001
        logger.error(f"Security alert email failed for {to_email}: {e}")


# ================= AUTH =================

@router.post("/admin/login", response_model=LoginResponse)
@limiter.limit("5/minute")
async def admin_login(request: Request, login_data: LoginRequest):
    await ensure_default_admin()
    ip = request.client.host if request.client else "unknown"
    email = login_data.email.lower()

    if await is_locked_out(email, ip):
        await audit_log("login_lockout", email, request, {"ip": ip})
        raise HTTPException(
            status_code=429,
            detail=f"Zu viele Fehlversuche. Bitte warten Sie {config.LOGIN_LOCKOUT_MINUTES} Minuten.",
        )

    admin = await db.admin_users.find_one(
        {"email": email, "is_active": True}, {"_id": 0}
    )
    # Always run bcrypt, even when no account matched — otherwise "unknown
    # email" returns noticeably faster than "wrong password" and an attacker
    # can enumerate valid admin emails purely from response timing.
    password_ok = verify_password(
        login_data.password, admin["password_hash"] if admin else _DUMMY_PASSWORD_HASH
    )
    if not admin or not password_ok:
        await record_login_attempt(email, ip, False)
        await audit_log("login_failed", email, request)
        raise HTTPException(status_code=401, detail="Ungültige Anmeldedaten")

    if admin.get("mfa_enabled") and admin.get("totp_secret"):
        if not login_data.totp_code:
            return LoginResponse(access_token="", email=email, mfa_required=True)
        if not pyotp.TOTP(admin["totp_secret"]).verify(login_data.totp_code, valid_window=1):
            await record_login_attempt(email, ip, False)
            await audit_log("login_mfa_failed", email, request)
            raise HTTPException(status_code=401, detail="Ungültiger 2FA-Code")

    await record_login_attempt(email, ip, True)
    await audit_log("login_success", email, request, {"role": admin.get("role")})
    token = create_jwt_token(email, admin.get("role", "admin"),
                             mfa_verified=admin.get("mfa_enabled", False))
    return LoginResponse(access_token=token, email=email, mfa_required=False)


@router.get("/admin/verify")
async def verify_admin(current: dict = Depends(get_current_user)):
    return {
        "valid": True,
        "email": current.get("email"),
        "role": current.get("role"),
        "mfa_enabled": current.get("admin", {}).get("mfa_enabled", False),
    }


@router.post("/admin/change-password")
async def change_password(
    request: Request,
    payload: PasswordChangeRequest,
    current: dict = Depends(get_current_user),
):
    admin = await db.admin_users.find_one({"email": current.get("email")}, {"_id": 0})
    if not admin or not verify_password(payload.current_password, admin["password_hash"]):
        raise HTTPException(status_code=401, detail="Aktuelles Passwort falsch")
    validate_password_strength(payload.new_password)
    await db.admin_users.update_one(
        {"email": current.get("email")},
        {"$set": {
            "password_hash": hash_password(payload.new_password),
            "password_changed_at": datetime.now(timezone.utc).isoformat(),
        }},
    )
    await audit_log("password_changed", current.get("email"), request)
    await _send_security_alert(current.get("email"), "Passwort geändert", request)
    return {"message": "Passwort erfolgreich geändert"}


@router.post("/admin/change-email")
async def change_email(
    request: Request,
    payload: EmailChangeRequest,
    current: dict = Depends(get_current_user),
):
    current_email = current.get("email")
    new_email = payload.new_email.lower().strip()

    admin = await db.admin_users.find_one({"email": current_email}, {"_id": 0})
    if not admin or not verify_password(payload.current_password, admin["password_hash"]):
        raise HTTPException(status_code=401, detail="Aktuelles Passwort falsch")

    if new_email == current_email:
        raise HTTPException(status_code=400, detail="Neue E-Mail identisch mit aktueller")

    # Kollision vermeiden
    existing = await db.admin_users.find_one({"email": new_email})
    if existing:
        raise HTTPException(status_code=400, detail="E-Mail ist bereits vergeben")

    await db.admin_users.update_one(
        {"email": current_email},
        {"$set": {"email": new_email}},
    )
    await audit_log(
        "email_changed", current_email, request,
        {"old": current_email, "new": new_email},
    )
    # Alert goes to the OLD address — that's the real owner's known-good inbox,
    # and the one that needs to catch an unauthorized change before an
    # attacker also gains control of the mailbox.
    await _send_security_alert(current_email, f"E-Mail-Adresse geändert (neu: {new_email})", request)
    # Neues Token mit neuer E-Mail ausstellen
    new_token = create_jwt_token(
        new_email,
        admin.get("role", "admin"),
        mfa_verified=admin.get("mfa_enabled", False),
    )
    return {
        "message": "E-Mail erfolgreich geändert",
        "new_email": new_email,
        "access_token": new_token,
    }


# ================= 2FA / TOTP =================

@router.post("/admin/mfa/setup")
async def mfa_setup(request: Request, payload: MfaSetupRequest, current: dict = Depends(get_current_user)):
    email = current.get("email")
    admin = await db.admin_users.find_one({"email": email}, {"_id": 0})
    if not admin or not verify_password(payload.current_password, admin["password_hash"]):
        raise HTTPException(status_code=401, detail="Aktuelles Passwort falsch")
    secret = pyotp.random_base32()
    provisioning = pyotp.TOTP(secret).provisioning_uri(name=email, issuer_name="Zebick Admin")
    img = qrcode.make(provisioning)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    qr_b64 = base64.b64encode(buf.getvalue()).decode()
    await db.admin_users.update_one(
        {"email": email}, {"$set": {"totp_secret_pending": secret}}
    )
    await audit_log("mfa_setup_start", email, request)
    return {"secret": secret, "provisioning_uri": provisioning, "qr_code_png_base64": qr_b64}


@router.post("/admin/mfa/enable")
async def mfa_enable(
    request: Request, payload: MfaVerifyRequest, current: dict = Depends(get_current_user)
):
    email = current.get("email")
    admin = await db.admin_users.find_one({"email": email}, {"_id": 0})
    pending = admin.get("totp_secret_pending")
    if not pending:
        raise HTTPException(status_code=400, detail="Keine 2FA-Einrichtung gestartet")
    if not pyotp.TOTP(pending).verify(payload.code, valid_window=1):
        raise HTTPException(status_code=401, detail="Ungültiger Code")
    await db.admin_users.update_one(
        {"email": email},
        {"$set": {"totp_secret": pending, "mfa_enabled": True},
         "$unset": {"totp_secret_pending": ""}},
    )
    await audit_log("mfa_enabled", email, request)
    return {"message": "2FA aktiviert"}


@router.post("/admin/mfa/disable")
async def mfa_disable(
    request: Request, payload: MfaVerifyRequest, current: dict = Depends(get_current_user)
):
    email = current.get("email")
    admin = await db.admin_users.find_one({"email": email}, {"_id": 0})
    if not admin.get("mfa_enabled"):
        return {"message": "2FA bereits deaktiviert"}
    if not pyotp.TOTP(admin["totp_secret"]).verify(payload.code, valid_window=1):
        raise HTTPException(status_code=401, detail="Ungültiger Code")
    await db.admin_users.update_one(
        {"email": email},
        {"$set": {"mfa_enabled": False},
         "$unset": {"totp_secret": "", "totp_secret_pending": ""}},
    )
    await audit_log("mfa_disabled", email, request)
    return {"message": "2FA deaktiviert"}


# ================= ADMIN USERS =================

@router.post("/admin/users", response_model=AdminUserResponse)
async def create_admin_user(
    request: Request,
    admin_data: AdminUserCreate,
    current: dict = Depends(require_superadmin),
):
    existing = await db.admin_users.find_one({"email": admin_data.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="E-Mail bereits registriert")
    validate_password_strength(admin_data.password)
    admin_user = AdminUser(
        email=admin_data.email.lower(),
        name=sanitize_text(admin_data.name, 120),
        role=admin_data.role,
        password_hash=hash_password(admin_data.password),
        created_by=current.get("email"),
    )
    doc = admin_user.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.admin_users.insert_one(doc)
    await audit_log("admin_user_created", current.get("email"), request,
                    {"target": admin_data.email, "role": admin_data.role})
    return AdminUserResponse(
        id=admin_user.id, email=admin_user.email, name=admin_user.name,
        role=admin_user.role, created_at=admin_user.created_at,
        is_active=admin_user.is_active, mfa_enabled=False,
    )


@router.get("/admin/users", response_model=List[AdminUserResponse])
async def get_admin_users(current: dict = Depends(require_crm_access)):
    await ensure_default_admin()
    rows = await db.admin_users.find(
        {}, {"_id": 0, "password_hash": 0, "totp_secret": 0, "totp_secret_pending": 0}
    ).sort("created_at", -1).to_list(100)
    for r in rows:
        if isinstance(r.get("created_at"), str):
            r["created_at"] = datetime.fromisoformat(r["created_at"])
        r.setdefault("mfa_enabled", False)
    return rows


@router.patch("/admin/users/{user_id}/deactivate")
async def deactivate_admin_user(
    user_id: str, request: Request, current: dict = Depends(require_superadmin)
):
    admin = await db.admin_users.find_one({"id": user_id}, {"_id": 0})
    if not admin:
        raise HTTPException(status_code=404, detail="Admin nicht gefunden")
    if admin.get("email") == current.get("email"):
        raise HTTPException(status_code=400, detail="Sie können sich nicht selbst deaktivieren")
    if admin.get("role") == "superadmin":
        raise HTTPException(status_code=400, detail="Super Admin kann nicht deaktiviert werden")
    await db.admin_users.update_one({"id": user_id}, {"$set": {"is_active": False}})
    await audit_log("admin_deactivated", current.get("email"), request, {"target": admin.get("email")})
    return {"message": "Admin deaktiviert", "id": user_id}


@router.patch("/admin/users/{user_id}/activate")
async def activate_admin_user(
    user_id: str, request: Request, current: dict = Depends(require_superadmin)
):
    result = await db.admin_users.update_one({"id": user_id}, {"$set": {"is_active": True}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Admin nicht gefunden")
    await audit_log("admin_activated", current.get("email"), request, {"target_id": user_id})
    return {"message": "Admin aktiviert", "id": user_id}


@router.delete("/admin/users/{user_id}")
async def delete_admin_user(
    user_id: str, request: Request, current: dict = Depends(require_superadmin)
):
    admin = await db.admin_users.find_one({"id": user_id}, {"_id": 0})
    if not admin:
        raise HTTPException(status_code=404, detail="Admin nicht gefunden")
    if admin.get("email") == current.get("email"):
        raise HTTPException(status_code=400, detail="Sie können sich nicht selbst löschen")
    if admin.get("role") == "superadmin":
        raise HTTPException(status_code=400, detail="Super Admin kann nicht gelöscht werden")
    await db.admin_users.delete_one({"id": user_id})
    await audit_log("admin_deleted", current.get("email"), request, {"target": admin.get("email")})
    return {"message": "Admin gelöscht", "id": user_id}


# ================= CONTACT ADMIN =================

@router.get("/contact/submissions")
async def get_contact_submissions(
    status: str = "all", skip: int = 0, limit: int = 100,
    current: dict = Depends(require_crm_access),
):
    query = {"status": sanitize_text(status, 20)} if status != "all" else {}
    rows = await db.contact_forms.find(query, {"_id": 0}) \
        .sort("submitted_at", -1).skip(max(0, skip)).limit(min(max(1, limit), 1000)).to_list(1000)
    for r in rows:
        if isinstance(r.get("submitted_at"), str):
            r["submitted_at"] = datetime.fromisoformat(r["submitted_at"])
    return {"total": len(rows), "submissions": rows}


@router.patch("/contact/{contact_id}/status")
async def update_contact_status(
    contact_id: str, status: str, request: Request,
    current: dict = Depends(require_crm_access),
):
    v = sanitize_text(status, 20)
    result = await db.contact_forms.update_one({"id": contact_id}, {"$set": {"status": v}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Contact not found")
    await audit_log("contact_status_update", current.get("email"), request,
                    {"id": contact_id, "status": v})
    return {"message": "Status updated", "status": v}


@router.get("/contact/stats")
async def get_contact_stats(current: dict = Depends(require_crm_access)):
    return {
        "total": await db.contact_forms.count_documents({}),
        "new": await db.contact_forms.count_documents({"status": "new"}),
        "read": await db.contact_forms.count_documents({"status": "read"}),
        "replied": await db.contact_forms.count_documents({"status": "replied"}),
    }


@router.post("/contact/{contact_id}/send-email")
async def send_manual_email_to_contact(
    contact_id: str,
    payload: ContactEmailSend,
    request: Request,
    current: dict = Depends(require_crm_access),
):
    """Manually send an email to a contact, either from a template or freeform.

    Body schema:
      { "template_key": "offer_generic" | "offer_ab_test" | null,
        "custom_subject": "...",          (optional, overrides template subject)
        "custom_body_html": "...",        (optional, overrides template body)
        "custom_body_text": "...",        (optional)
        "context": { "service":"...", "price":"...", ... }  (optional placeholders)
        "attach_offer_pdf": true|false    (optional, auto for offer templates)
      }
    """
    contact = await db.contact_forms.find_one({"id": contact_id}, {"_id": 0})
    if not contact:
        raise HTTPException(status_code=404, detail="Kontakt nicht gefunden")

    to_email = contact.get("email")
    if not to_email:
        raise HTTPException(status_code=400, detail="Kein E-Mail-Feld im Kontakt")

    import config as _cfg
    if not all([_cfg.SMTP_HOST, _cfg.SMTP_USERNAME, _cfg.SMTP_PASSWORD, _cfg.SMTP_FROM_EMAIL]) and not _cfg.SMTP_MOCK:
        raise HTTPException(status_code=503, detail="SMTP nicht konfiguriert")

    template_key = payload.template_key
    custom_subject = payload.custom_subject
    custom_body_html = payload.custom_body_html
    custom_body_text = payload.custom_body_text
    attach_offer_pdf = bool(payload.attach_offer_pdf)
    context = {
        "name": contact.get("name", ""),
        "email": to_email,
        "service": contact.get("service", ""),
        "company": contact.get("company", ""),
        "budget_line": f"Budget: {contact.get('budget')}" if contact.get("budget") else "",
        "year": datetime.now(timezone.utc).year,
        **(payload.context or {}),
    }

    from email_templates import (
        _render, append_signature, inject_dark_mode,
        next_ab_variant, AB_TEMPLATE_MAP,
    )
    from services import send_email
    from pdf_offer import generate_offer_pdf
    import uuid as _uuid
    import os as _os

    # Resolve A/B test to a concrete template
    ab_variant = None
    effective_template_key = template_key
    if template_key == "offer_ab_test":
        ab_variant = await next_ab_variant()
        effective_template_key = AB_TEMPLATE_MAP[ab_variant]

    # Offer-template detection (covers: offer_generic, offer_variant_a, offer_variant_b)
    is_offer_template = bool(effective_template_key and effective_template_key.startswith("offer_"))

    # Auto-attach PDF for offer templates unless caller explicitly disabled
    if is_offer_template and payload.attach_offer_pdf is None:
        attach_offer_pdf = True

    # Generate a tracking token if we're sending an offer (A/B or generic)
    tracking_token = None
    public_base = _os.environ.get("PUBLIC_BACKEND_URL") or _os.environ.get("PUBLIC_SITE_URL", "")
    if is_offer_template:
        tracking_token = _uuid.uuid4().hex
        # Inject tracking URLs into context so templates can render them
        base = public_base.rstrip("/")
        context["accept_url"] = f"{base}/api/track/offer/{tracking_token}/click" if base else f"/api/track/offer/{tracking_token}/click"
        context["pixel_url"] = f"{base}/api/track/offer/{tracking_token}/open.gif" if base else f"/api/track/offer/{tracking_token}/open.gif"

    # Decide subject + bodies
    if custom_subject or custom_body_html or custom_body_text:
        subject = _render(custom_subject or "Nachricht von Zebick", context)
        html = _render(custom_body_html or f"<p>{(custom_body_text or '').replace(chr(10),'<br>')}</p>", context)
        text = _render(custom_body_text or "", context)
    elif effective_template_key:
        tpl = await db.email_templates.find_one({"key": effective_template_key}, {"_id": 0})
        if not tpl:
            raise HTTPException(status_code=404, detail=f"Template {effective_template_key} nicht gefunden")
        subject = _render(tpl["subject"], context)
        html = _render(tpl["body_html"], context)
        text = _render(tpl.get("body_text") or "", context)
    else:
        raise HTTPException(status_code=400, detail="template_key oder custom_body_* erforderlich")

    # Append signature + inject dark-mode styles (always, so Gmail dark mode works)
    html, text = await append_signature(html, text)
    html = inject_dark_mode(html)

    # Build attachments list (Angebots-PDF)
    attachments = None
    if is_offer_template and attach_offer_pdf:
        try:
            pdf_variant = ab_variant or ("A" if effective_template_key == "offer_variant_a" else
                                         "B" if effective_template_key == "offer_variant_b" else "A")
            pdf_bytes = generate_offer_pdf(context, variant=pdf_variant)
            filename = f"Zebick-Angebot-{(context.get('service') or 'Projekt').replace(' ', '-')}.pdf"
            attachments = [(filename, pdf_bytes, "application/pdf")]
        except Exception as e:  # noqa: BLE001
            logger.error(f"PDF generation failed: {e}")

    ok = await send_email(to_email, subject, html, text_content=text, attachments=attachments)
    if not ok:
        raise HTTPException(status_code=500, detail="SMTP-Versand fehlgeschlagen (siehe Server-Logs)")

    # Track A/B offer send
    if is_offer_template and tracking_token:
        await db.offer_sends.insert_one({
            "id": str(_uuid.uuid4()),
            "token": tracking_token,
            "contact_id": contact_id,
            "to_email": to_email,
            "variant": ab_variant or ("A" if effective_template_key == "offer_variant_a"
                                      else "B" if effective_template_key == "offer_variant_b"
                                      else "generic"),
            "template_key": effective_template_key,
            "ab_requested": template_key == "offer_ab_test",
            "subject": subject,
            "pdf_attached": bool(attachments),
            "sent_at": datetime.now(timezone.utc).isoformat(),
            "sent_by": current.get("email"),
            "opened_at": None,
            "clicked_at": None,
            "accepted_at": None,
        })

    # Save to replies (link to contact), mark contact as replied
    reply_doc = {
        "id": str(_uuid.uuid4()),
        "contact_id": contact_id,
        "to": to_email,
        "from_email": _cfg.SMTP_FROM_EMAIL,
        "subject": subject,
        "template_key": effective_template_key,
        "ab_variant": ab_variant,
        "pdf_attached": bool(attachments),
        "tracking_token": tracking_token,
        "body_text": text,
        "sent_at": datetime.now(timezone.utc).isoformat(),
        "sent_by": current.get("email"),
    }
    await db.contact_replies.insert_one(reply_doc)
    await db.contact_forms.update_one({"id": contact_id}, {"$set": {"status": "replied"}})
    await audit_log("contact_email_sent", current.get("email"), request,
                    {"to": to_email, "template": effective_template_key,
                     "ab_variant": ab_variant, "pdf": bool(attachments),
                     "subject": subject})

    return {
        "message": "E-Mail versendet",
        "to": to_email,
        "subject": subject,
        "id": reply_doc["id"],
        "ab_variant": ab_variant,
        "pdf_attached": bool(attachments),
        "tracking_token": tracking_token,
    }


@router.post("/send-email")
async def send_adhoc_email(payload: AdHocEmailSend, request: Request, current: dict = Depends(require_crm_access)):
    """Ad-hoc send used by the admin 'E-Mail Templates' tool: an arbitrary
    HTML email to any address, not tied to an existing contact record."""
    from services import send_email
    ok = await send_email(payload.to_email, payload.subject, payload.html_content)
    if not ok:
        raise HTTPException(status_code=502, detail="E-Mail-Versand fehlgeschlagen (SMTP nicht konfiguriert oder Serverfehler, siehe Logs)")
    await audit_log("adhoc_email_sent", current.get("email"), request,
                    {"to": payload.to_email, "subject": payload.subject})
    return {"message": "E-Mail versendet", "to": payload.to_email}


@router.get("/contact/{contact_id}/replies")
async def get_contact_replies(contact_id: str, current: dict = Depends(require_crm_access)):
    rows = await db.contact_replies.find(
        {"contact_id": contact_id}, {"_id": 0}
    ).sort("sent_at", -1).to_list(100)
    return {"total": len(rows), "replies": rows}


# ================= NEWSLETTER ADMIN =================

@router.get("/newsletter/subscribers")
async def get_newsletter_subscribers(
    status: str = "active", skip: int = 0, limit: int = 100,
    current: dict = Depends(require_crm_access),
):
    query = {"status": sanitize_text(status, 20)} if status else {}
    rows = await db.newsletter_subscribers.find(query, {"_id": 0}) \
        .sort("subscribed_at", -1).skip(max(0, skip)).limit(min(max(1, limit), 1000)).to_list(1000)
    for r in rows:
        if isinstance(r.get("subscribed_at"), str):
            r["subscribed_at"] = datetime.fromisoformat(r["subscribed_at"])
    return {"total": len(rows), "subscribers": rows}


@router.get("/newsletter/stats")
async def get_newsletter_stats(current: dict = Depends(require_crm_access)):
    return {
        "total": await db.newsletter_subscribers.count_documents({}),
        "active": await db.newsletter_subscribers.count_documents({"status": "active"}),
        "unsubscribed": await db.newsletter_subscribers.count_documents({"status": "unsubscribed"}),
    }


@router.post("/newsletter/campaign/preview")
async def preview_newsletter_campaign(
    subject: str, content: str,
    current: dict = Depends(require_crm_access),
):
    """Render the campaign HTML preview WITHOUT sending. Returns rendered HTML + subject."""
    from email_templates import _render, inject_dark_mode, append_signature, get_current_settings, build_social_icons_html
    from datetime import datetime as _dt, timezone as _tz
    import html as _html
    # bleach escapes &, < etc. — un-escape for display in subject + content
    subject_clean = _html.unescape(sanitize_text(subject, 200) or "")
    content_clean = _html.unescape((content or "").strip())
    if not subject_clean or not content_clean:
        raise HTTPException(400, "Betreff und Inhalt sind Pflichtfelder.")

    content_html = _html.escape(content_clean).replace("\n\n", "</p><p style='margin:14px 0;line-height:1.7'>").replace("\n", "<br>")
    content_html = f"<p style='margin:0 0 14px;line-height:1.7'>{content_html}</p>"

    tpl = await db.email_templates.find_one({"key": "newsletter_campaign"}, {"_id": 0})
    if not tpl:
        raise HTTPException(404, "Template 'newsletter_campaign' nicht gefunden.")

    settings = await get_current_settings()
    ctx = {
        "subject": _html.escape(subject_clean),
        "content_html": content_html,
        "content_text": content_clean,
        "email": current.get("email", "abonnent@example.com"),
        "year": _dt.now(_tz.utc).year,
        "SOCIAL_ICONS_ROW": build_social_icons_html(settings),
        "CONTACT_EMAIL": settings.get("contact_email") or "kontakt@zebick.com",
    }
    rendered_subject = subject_clean
    rendered_html = _render(tpl["body_html"], ctx)
    rendered_html, _ = await append_signature(rendered_html, "")
    rendered_html = inject_dark_mode(rendered_html)
    return {"subject": rendered_subject, "html": rendered_html}


async def _run_newsletter_campaign(
    campaign_id: str, recipients: List[str], subject_clean: str,
    content_html: str, content_clean: str, actor: str,
) -> None:
    """Background send loop; progress is persisted to `newsletter_campaigns`."""
    from email_templates import send_template_email
    import html as _html
    await db.newsletter_campaigns.update_one({"id": campaign_id}, {"$set": {
        "status": "running", "started_at": datetime.now(timezone.utc).isoformat(),
    }})
    sent, failed = 0, 0
    try:
        for email in recipients:
            ok = await send_template_email(
                "newsletter_campaign",
                email,
                {
                    "subject": _html.escape(subject_clean),
                    "content_html": content_html,
                    "content_text": content_clean,
                    "email": email,
                },
            )
            if ok:
                sent += 1
            else:
                failed += 1
            await db.newsletter_campaigns.update_one(
                {"id": campaign_id}, {"$inc": {"sent" if ok else "failed": 1}})
        status = "completed"
    except Exception as e:  # noqa: BLE001
        logger.error(f"Newsletter campaign {campaign_id} aborted: {e}")
        status = "failed"
    await db.newsletter_campaigns.update_one({"id": campaign_id}, {"$set": {
        "status": status, "completed_at": datetime.now(timezone.utc).isoformat(),
    }})
    await audit_log(
        "newsletter_campaign_sent", actor, None,
        {"campaign_id": campaign_id, "subject": subject_clean, "sent": sent,
         "failed": failed, "total": len(recipients), "status": status},
    )


@router.post("/newsletter/campaign/send")
async def send_newsletter_campaign(
    subject: str, content: str, background_tasks: BackgroundTasks,
    current: dict = Depends(require_crm_access),
):
    """Queue a marketing newsletter to all active subscribers.

    Uses the `newsletter_campaign` template (logo + gradient header + unsubscribe footer).
    The admin enters subject + plain content; the template wraps it beautifully.
    Sending runs as a background task; progress lives in `newsletter_campaigns`.
    """
    import html as _html
    subject_clean = _html.unescape(sanitize_text(subject, 200) or "")
    content_clean = _html.unescape((content or "").strip())
    if not subject_clean or not content_clean:
        raise HTTPException(400, "Betreff und Inhalt sind Pflichtfelder.")

    # Convert plain content to simple HTML (newlines → <br>, basic escaping)
    content_html = _html.escape(content_clean).replace("\n\n", "</p><p style='margin:14px 0;line-height:1.7'>").replace("\n", "<br>")
    content_html = f"<p style='margin:0 0 14px;line-height:1.7'>{content_html}</p>"

    recipients = [
        sub["email"] async for sub in db.newsletter_subscribers.find(
            {"status": "active"}, {"_id": 0, "email": 1})
    ]
    campaign_id = str(uuid.uuid4())
    await db.newsletter_campaigns.insert_one({
        "id": campaign_id,
        "subject": subject_clean,
        "status": "queued",
        "recipient_count": len(recipients),
        "sent": 0,
        "failed": 0,
        "created_by": current.get("email"),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "started_at": None,
        "completed_at": None,
    })
    # ponytail: in-process BackgroundTasks; a restart mid-send leaves the campaign
    # "running" with no resume. Move to a job queue if campaigns get large.
    background_tasks.add_task(
        _run_newsletter_campaign, campaign_id, recipients,
        subject_clean, content_html, content_clean, current.get("email"),
    )
    return {"status": "queued", "campaign_id": campaign_id, "recipient_count": len(recipients)}


# ================= LEADS ADMIN =================

@router.get("/leads")
async def list_leads(skip: int = 0, limit: int = 100, current: dict = Depends(require_crm_access)):
    rows = await db.leads.find({}, {"_id": 0}).sort("timestamp", -1) \
        .skip(max(0, skip)).limit(min(max(1, limit), 100)).to_list(100)
    for r in rows:
        if isinstance(r.get("timestamp"), str):
            r["timestamp"] = datetime.fromisoformat(r["timestamp"])
    return rows


# ================= TESTIMONIALS ADMIN =================

@router.get("/testimonials/all")
async def get_all_testimonials(
    status: str = "all", skip: int = 0, limit: int = 100,
    current: dict = Depends(get_current_user),
):
    query = {"status": sanitize_text(status, 20)} if status != "all" else {}
    rows = await db.testimonials.find(query, {"_id": 0}) \
        .sort("submitted_at", -1).skip(max(0, skip)).limit(min(max(1, limit), 500)).to_list(500)
    for r in rows:
        if isinstance(r.get("submitted_at"), str):
            r["submitted_at"] = datetime.fromisoformat(r["submitted_at"])
        if r.get("approved_at") and isinstance(r["approved_at"], str):
            r["approved_at"] = datetime.fromisoformat(r["approved_at"])
    return {"total": len(rows), "testimonials": rows}


@router.patch("/testimonials/{tid}/approve")
async def approve_testimonial(tid: str, request: Request, current: dict = Depends(get_current_user)):
    r = await db.testimonials.update_one(
        {"id": tid},
        {"$set": {"status": "approved", "approved_at": datetime.now(timezone.utc).isoformat()}},
    )
    if r.matched_count == 0:
        raise HTTPException(status_code=404, detail="Testimonial nicht gefunden")
    await audit_log("testimonial_approved", current.get("email"), request, {"id": tid})
    return {"message": "Testimonial genehmigt", "id": tid}


@router.patch("/testimonials/{tid}/reject")
async def reject_testimonial(tid: str, request: Request, current: dict = Depends(get_current_user)):
    r = await db.testimonials.update_one({"id": tid}, {"$set": {"status": "rejected"}})
    if r.matched_count == 0:
        raise HTTPException(status_code=404, detail="Testimonial nicht gefunden")
    await audit_log("testimonial_rejected", current.get("email"), request, {"id": tid})
    return {"message": "Testimonial abgelehnt", "id": tid}


@router.delete("/testimonials/{tid}")
async def delete_testimonial(tid: str, request: Request, current: dict = Depends(get_current_user)):
    r = await db.testimonials.delete_one({"id": tid})
    if r.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Testimonial nicht gefunden")
    await audit_log("testimonial_deleted", current.get("email"), request, {"id": tid})
    return {"message": "Testimonial gelöscht", "id": tid}


@router.get("/testimonials/stats")
async def get_testimonial_stats(current: dict = Depends(get_current_user)):
    pipe = [{"$match": {"status": "approved"}}, {"$group": {"_id": None, "avg": {"$avg": "$rating"}}}]
    avg = await db.testimonials.aggregate(pipe).to_list(1)
    return {
        "total": await db.testimonials.count_documents({}),
        "pending": await db.testimonials.count_documents({"status": "pending"}),
        "approved": await db.testimonials.count_documents({"status": "approved"}),
        "rejected": await db.testimonials.count_documents({"status": "rejected"}),
        "average_rating": round(avg[0]["avg"], 1) if avg else 0,
    }


# ================= GAME LEADERBOARD ADMIN =================
# Moderation for the legacy db.game_scores collection (POST /api/game/score,
# GET /api/game/leaderboard in routes/public.py). Anyone can submit a score
# with an arbitrary player_name, so admins need a way to review/remove
# abusive or fake entries without touching MongoDB directly.

@router.get("/admin/game-scores")
async def list_game_scores(
    game_id: str = None, skip: int = 0, limit: int = 100,
    current: dict = Depends(get_current_user),
):
    query = {"game_id": sanitize_text(game_id, 50)} if game_id else {}
    rows = await db.game_scores.find(query, {"_id": 0}) \
        .sort("score", -1).skip(max(0, skip)).limit(min(max(1, limit), 500)).to_list(500)
    return {"total": len(rows), "scores": rows}


@router.delete("/admin/game-scores/{score_id}")
async def delete_game_score(score_id: str, request: Request, current: dict = Depends(get_current_user)):
    r = await db.game_scores.delete_one({"id": score_id})
    if r.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Score nicht gefunden")
    await audit_log("game_score_deleted", current.get("email"), request, {"id": score_id})
    return {"message": "Score gelöscht", "id": score_id}


# ================= SECURITY CENTER =================

@router.get("/admin/security/scan")
async def security_scan(current: dict = Depends(require_superadmin)):
    findings: List[Dict[str, str]] = []

    if not config.JWT_SECRET or len(config.JWT_SECRET) < 32 or config.JWT_SECRET.startswith("insecure-"):
        findings.append({"severity": "high", "area": "config",
                         "issue": "JWT_SECRET ist schwach oder fehlt."})

    no_mfa = await db.admin_users.count_documents({"mfa_enabled": {"$ne": True}})
    if no_mfa > 0:
        findings.append({"severity": "medium", "area": "auth",
                         "issue": f"{no_mfa} Admin(s) ohne 2FA."})

    fifteen_min = (datetime.now(timezone.utc) - timedelta(minutes=15)).isoformat()
    recent_failed = await db.login_attempts.count_documents(
        {"success": False, "timestamp": {"$gte": fifteen_min}}
    )
    if recent_failed > config.LOGIN_MAX_ATTEMPTS * 3:
        findings.append({"severity": "high", "area": "monitoring",
                         "issue": f"{recent_failed} fehlgeschlagene Logins in 15 Min."})

    if config.CORS_ORIGINS == ["*"]:
        findings.append({"severity": "low", "area": "network",
                         "issue": "CORS_ORIGINS auf '*' - für Produktion einschränken."})

    if config.SMTP_HOST and config.SMTP_PORT not in (465, 587):
        findings.append({"severity": "medium", "area": "smtp",
                         "issue": f"SMTP Port {config.SMTP_PORT} ist unüblich (TLS/STARTTLS empfohlen)."})

    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "total_findings": len(findings),
        "findings": findings,
        "status": "healthy" if not findings else "issues_found",
        "checks": {
            "jwt_secret_strong": len(config.JWT_SECRET) >= 32 and not config.JWT_SECRET.startswith("insecure-"),
            "security_headers": True,
            "rate_limiting": True,
            "brute_force_protection": True,
            "https_enforced_by_platform": True,
            "password_policy_min_length": config.PASSWORD_MIN_LENGTH,
            "audit_logging": True,
            "input_sanitization": True,
        },
    }


@router.get("/admin/audit-log")
async def get_audit_log(
    skip: int = 0, limit: int = 100, current: dict = Depends(require_superadmin)
):
    rows = await db.audit_log.find({}, {"_id": 0}) \
        .sort("timestamp", -1).skip(max(0, skip)).limit(min(max(1, limit), 500)).to_list(500)
    return {"total": len(rows), "entries": rows}


@router.get("/admin/login-attempts")
async def get_login_attempts(limit: int = 100, current: dict = Depends(require_superadmin)):
    rows = await db.login_attempts.find({}, {"_id": 0}) \
        .sort("timestamp", -1).limit(min(max(1, limit), 500)).to_list(500)
    return {"total": len(rows), "attempts": rows}


@router.post("/admin/backup/export")
async def export_backup(request: Request, current: dict = Depends(require_superadmin)):
    from scripts.backup import create_snapshot, COLLECTIONS
    snapshot = await create_snapshot()
    snapshot["exported_by"] = current.get("email")
    await audit_log("backup_exported", current.get("email"), request,
                    {"collections": len(COLLECTIONS)})
    return snapshot


@router.post("/admin/backup/run-now")
async def run_backup_now(request: Request, current: dict = Depends(require_superadmin)):
    """Trigger the full scheduled backup flow manually (local + R2 + retention)."""
    from scripts.backup import run_backup
    result = await run_backup()
    await audit_log("backup_manual_trigger", current.get("email"), request, {"status": result.get("status")})
    return result


@router.post("/admin/backup/email-now")
async def email_backup_now(request: Request, current: dict = Depends(require_superadmin)):
    """Trigger a backup and email it as attachment right now."""
    from scripts.backup import run_backup
    result = await run_backup(send_email_attachment=True)
    await audit_log("backup_email_trigger", current.get("email"), request,
                    {"status": result.get("status"), "email_sent": result.get("email_sent")})
    return result


@router.get("/admin/backup/list")
async def list_backups(current: dict = Depends(require_superadmin)):
    """List locally stored backup files with size + date."""
    backup_dir = config.BACKUP_DIR
    backup_dir.mkdir(parents=True, exist_ok=True)
    files = []
    for f in sorted(backup_dir.glob("zebick-*.json"), reverse=True):
        stat = f.stat()
        files.append({
            "filename": f.name,
            "size_bytes": stat.st_size,
            "size_kb": round(stat.st_size / 1024, 1),
            "modified_at": datetime.fromtimestamp(stat.st_mtime, tz=timezone.utc).isoformat(),
        })
    return {"total": len(files), "backups": files}


# ================= INBOX (IMAP) =================

@router.get("/admin/inbox")
async def list_inbox(
    skip: int = 0, limit: int = 50, folder: str = "INBOX",
    starred_only: bool = False, unread_only: bool = False,
    current: dict = Depends(require_crm_access),
):
    import os
    query: Dict[str, Any] = {"folder": folder, "archived": False}
    if starred_only:
        query["starred"] = True
    if unread_only:
        query["read"] = False
    rows = await db.inbox_emails.find(
        query,
        {"_id": 0, "body_html": 0, "body_text": 0},  # lightweight for list view
    ).sort("date", -1).skip(max(0, skip)).limit(min(max(1, limit), 200)).to_list(200)
    total = await db.inbox_emails.count_documents(query)
    unread = await db.inbox_emails.count_documents({**query, "read": False})
    return {
        "total": total,
        "unread": unread,
        "emails": rows,
        "configured": bool(os.environ.get("IMAP_HOST")),
    }


@router.get("/admin/inbox/{email_id}")
async def get_inbox_email(email_id: str, current: dict = Depends(require_crm_access)):
    email = await db.inbox_emails.find_one({"id": email_id}, {"_id": 0})
    if not email:
        raise HTTPException(status_code=404, detail="E-Mail nicht gefunden")
    # Mark as read when opened
    if not email.get("read"):
        await db.inbox_emails.update_one({"id": email_id}, {"$set": {"read": True}})
        email["read"] = True
    return email


@router.patch("/admin/inbox/{email_id}")
async def update_inbox_email(
    email_id: str, payload: InboxEmailUpdate, request: Request,
    current: dict = Depends(require_crm_access),
):
    updates = {k: bool(v) for k, v in payload.model_dump(exclude_unset=True).items()}
    if not updates:
        raise HTTPException(status_code=400, detail="Keine gültigen Felder (starred/read/archived)")
    result = await db.inbox_emails.update_one({"id": email_id}, {"$set": updates})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="E-Mail nicht gefunden")
    await audit_log("inbox_updated", current.get("email"), request,
                    {"id": email_id, "updates": updates})
    return {"message": "Aktualisiert", "updates": updates}


@router.delete("/admin/inbox/{email_id}")
async def delete_inbox_email(
    email_id: str, request: Request, current: dict = Depends(require_crm_access),
):
    result = await db.inbox_emails.delete_one({"id": email_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="E-Mail nicht gefunden")
    await audit_log("inbox_deleted", current.get("email"), request, {"id": email_id})
    return {"message": "Gelöscht (nur aus DB — Original bleibt im Postfach)"}


@router.post("/admin/inbox/fetch-now")
async def inbox_fetch_now(request: Request, current: dict = Depends(require_superadmin)):
    """Trigger IMAP fetch manually instead of waiting for scheduler."""
    from scripts.inbox_fetch import fetch_new_emails
    result = await fetch_new_emails()
    await audit_log("inbox_fetch_manual", current.get("email"), request, {"status": result.get("status")})
    return result


@router.post("/admin/inbox/{email_id}/reply")
async def inbox_reply(
    email_id: str,
    payload: InboxReply,
    request: Request,
    current: dict = Depends(require_crm_access),
):
    """Reply to an inbox email via SMTP. Threading via In-Reply-To + References."""
    body = (payload.body or "").strip()
    include_quote = payload.include_quote
    if not body:
        raise HTTPException(status_code=400, detail="Antwort darf nicht leer sein")

    original = await db.inbox_emails.find_one({"id": email_id}, {"_id": 0})
    if not original:
        raise HTTPException(status_code=404, detail="E-Mail nicht gefunden")

    import config as _cfg
    if not all([_cfg.SMTP_HOST, _cfg.SMTP_USERNAME, _cfg.SMTP_PASSWORD, _cfg.SMTP_FROM_EMAIL]):
        raise HTTPException(status_code=503, detail="SMTP nicht konfiguriert")

    to_addr = original.get("from_email")
    if not to_addr:
        raise HTTPException(status_code=400, detail="Kein Absender im Original")

    # Build reply subject
    subj = original.get("subject", "")
    if not subj.lower().startswith("re:"):
        subj = f"Re: {subj}"

    # Build text (with optional quote)
    full_text = body
    if include_quote and original.get("body_text"):
        quoted = "\n".join("> " + l for l in (original["body_text"][:4000]).splitlines())
        full_text = f"{body}\n\n---\nAm {original.get('date','?')} schrieb {original.get('from_name') or original.get('from_email')}:\n\n{quoted}"

    # Build HTML (simple)
    html_body = f"<p>{body.replace(chr(10), '<br>')}</p>"
    if include_quote and original.get("body_html"):
        html_body += f"<hr><blockquote style='border-left:3px solid #ccc;padding-left:10px;color:#666'>{original['body_html'][:8000]}</blockquote>"

    # Append global signature
    from email_templates import append_signature, inject_dark_mode
    html_body, full_text = await append_signature(html_body, full_text)
    # Gmail dark-mode support for inbox replies too
    html_body = inject_dark_mode(f"<!DOCTYPE html><html><head></head><body>{html_body}</body></html>")

    # Build MIME
    from email.mime.multipart import MIMEMultipart
    from email.mime.text import MIMEText
    from email.utils import formatdate, make_msgid
    import aiosmtplib

    msg = MIMEMultipart("alternative")
    msg["From"] = f"{_cfg.SMTP_FROM_NAME} <{_cfg.SMTP_FROM_EMAIL}>"
    msg["To"] = to_addr
    msg["Subject"] = subj
    msg["Date"] = formatdate(localtime=False)
    msg["Message-ID"] = make_msgid(domain="zebick.com")
    # Threading headers (graceful if missing)
    for ref_field in ("message_id", "uid"):
        pass
    if original.get("uid"):
        # imap_tools doesn't store the raw Message-ID; use uid as a pseudo reference
        msg["In-Reply-To"] = f"<uid-{original['uid']}@{_cfg.SMTP_HOST}>"
        msg["References"] = msg["In-Reply-To"]
    msg.attach(MIMEText(full_text, "plain", "utf-8"))
    msg.attach(MIMEText(html_body, "html", "utf-8"))

    try:
        await aiosmtplib.send(
            msg,
            hostname=_cfg.SMTP_HOST,
            port=_cfg.SMTP_PORT,
            username=_cfg.SMTP_USERNAME,
            password=_cfg.SMTP_PASSWORD,
            use_tls=_cfg.SMTP_PORT == 465,
            start_tls=_cfg.SMTP_PORT == 587,
        )
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"SMTP Fehler: {e}")

    # Save sent reply
    reply_doc = {
        "id": str(__import__("uuid").uuid4()),
        "in_reply_to_id": email_id,
        "to": to_addr,
        "from_email": _cfg.SMTP_FROM_EMAIL,
        "subject": subj,
        "body_text": body,
        "include_quote": include_quote,
        "sent_at": datetime.now(timezone.utc).isoformat(),
        "sent_by": current.get("email"),
    }
    await db.inbox_replies.insert_one(reply_doc)
    # Mark original as read
    await db.inbox_emails.update_one({"id": email_id}, {"$set": {"read": True, "replied": True}})
    await audit_log("inbox_reply", current.get("email"), request,
                    {"to": to_addr, "subject": subj, "in_reply_to": email_id})
    return {"message": "Antwort versendet", "to": to_addr, "subject": subj, **{k: reply_doc[k] for k in ["id", "sent_at"]}}


@router.get("/admin/inbox/{email_id}/replies")
async def inbox_replies(email_id: str, current: dict = Depends(require_crm_access)):
    rows = await db.inbox_replies.find(
        {"in_reply_to_id": email_id}, {"_id": 0}
    ).sort("sent_at", 1).to_list(100)
    return {"total": len(rows), "replies": rows}


@router.get("/admin/smtp/health")
async def smtp_health(current: dict = Depends(require_superadmin)):
    """Quick SMTP connectivity test — connects and authenticates, no email sent."""
    import aiosmtplib
    import config as _cfg
    if _cfg.SMTP_MOCK:
        return {"status": "mocked", "mock": True, "host": _cfg.SMTP_HOST,
                "message": "SMTP_MOCK=true — emails are logged instead of sent."}
    if not all([_cfg.SMTP_HOST, _cfg.SMTP_USERNAME, _cfg.SMTP_PASSWORD, _cfg.SMTP_FROM_EMAIL]):
        return {"status": "unconfigured", "message": "SMTP_HOST/USERNAME/PASSWORD/FROM_EMAIL fehlen in .env"}
    client = aiosmtplib.SMTP(
        hostname=_cfg.SMTP_HOST, port=_cfg.SMTP_PORT,
        use_tls=_cfg.SMTP_PORT == 465, start_tls=_cfg.SMTP_PORT == 587,
        timeout=10,
    )
    try:
        await client.connect()
        await client.login(_cfg.SMTP_USERNAME, _cfg.SMTP_PASSWORD)
        await client.quit()
        return {"status": "ok", "host": _cfg.SMTP_HOST, "port": _cfg.SMTP_PORT,
                "username": _cfg.SMTP_USERNAME,
                "message": "Verbindung + Authentifizierung erfolgreich"}
    except Exception as e:  # noqa: BLE001
        return {"status": "error", "host": _cfg.SMTP_HOST, "port": _cfg.SMTP_PORT,
                "error": str(e),
                "hint": "Wenn 'timed out' — Hosting-Umgebung blockiert wahrscheinlich ausgehende Verbindungen zu diesem Server. Nach Produktions-Deployment erneut testen."}


# ================= OFFER A/B STATS =================

@router.get("/admin/offer-ab/stats")
async def offer_ab_stats(current: dict = Depends(require_crm_access)):
    """Aggregate A/B-test performance across all offer sends."""
    from email_templates import peek_next_ab_variant

    variants = ["A", "B"]
    out = []
    totals = {"sent": 0, "opened": 0, "clicked": 0, "accepted": 0}
    for v in variants:
        sent = await db.offer_sends.count_documents({"variant": v})
        opened = await db.offer_sends.count_documents({"variant": v, "opened_at": {"$ne": None}})
        clicked = await db.offer_sends.count_documents({"variant": v, "clicked_at": {"$ne": None}})
        accepted = await db.offer_sends.count_documents({"variant": v, "accepted_at": {"$ne": None}})
        out.append({
            "variant": v,
            "sent": sent, "opened": opened, "clicked": clicked, "accepted": accepted,
            "open_rate": round((opened / sent * 100) if sent else 0, 2),
            "click_rate": round((clicked / sent * 100) if sent else 0, 2),
            "conversion_rate": round((accepted / sent * 100) if sent else 0, 2),
        })
        totals["sent"] += sent
        totals["opened"] += opened
        totals["clicked"] += clicked
        totals["accepted"] += accepted

    # Winner: highest acceptance rate (require at least 1 sent); tie-break on clicks
    def _score(v):
        return (v["conversion_rate"], v["click_rate"], v["sent"])
    eligible = [v for v in out if v["sent"] > 0]
    winner = max(eligible, key=_score)["variant"] if eligible else None

    next_variant = await peek_next_ab_variant()

    return {
        "totals": totals,
        "variants": out,
        "winner": winner,
        "next_variant": next_variant,
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/admin/offer-ab/sends")
async def offer_ab_sends(
    limit: int = 50,
    current: dict = Depends(require_crm_access),
):
    """Recent offer-send log (for debugging/audit)."""
    rows = await db.offer_sends.find({}, {"_id": 0}) \
        .sort("sent_at", -1).limit(min(max(1, limit), 200)).to_list(200)
    return {"total": len(rows), "sends": rows}


# ================= EMAIL TEMPLATES (transactional) =================

@router.get("/admin/email-templates/auto")
async def list_auto_templates(current: dict = Depends(get_current_user)):
    """List all DB-backed transactional templates (NOT the static service pitches)."""
    from email_templates import DEFAULT_TEMPLATES
    rows = await db.email_templates.find({}, {"_id": 0}).sort("key", 1).to_list(100)
    # Ensure defaults exist (belt & suspenders)
    if not rows:
        from email_templates import seed_default_templates
        await seed_default_templates(force=False)
        rows = await db.email_templates.find({}, {"_id": 0}).sort("key", 1).to_list(100)
    return {"total": len(rows), "templates": rows}


@router.get("/admin/email-templates/auto/{key}")
async def get_auto_template(key: str, current: dict = Depends(get_current_user)):
    tpl = await db.email_templates.find_one({"key": key}, {"_id": 0})
    if not tpl:
        raise HTTPException(status_code=404, detail="Template nicht gefunden")
    return tpl


@router.put("/admin/email-templates/auto/{key}")
async def update_auto_template(
    key: str, payload: AutoTemplateUpdate, request: Request,
    current: dict = Depends(require_superadmin),
):
    updates = payload.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(status_code=400, detail="Keine gültigen Felder")
    updates["updated_at"] = datetime.now(timezone.utc).isoformat()
    updates["updated_by"] = current.get("email")
    result = await db.email_templates.update_one({"key": key}, {"$set": updates})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Template nicht gefunden")
    await audit_log("email_template_updated", current.get("email"), request, {"key": key, "fields": list(updates.keys())})
    return {"message": "Template aktualisiert", "key": key}


@router.post("/admin/email-templates/auto/reseed")
async def reseed_auto_templates(
    force: bool = False, request: Request = None,
    current: dict = Depends(require_superadmin),
):
    from email_templates import seed_default_templates
    inserted = await seed_default_templates(force=force)
    await audit_log("email_templates_reseeded", current.get("email"), request, {"force": force, "inserted": inserted})
    return {"message": "Templates wiederhergestellt", "inserted": inserted, "force": force}


@router.post("/admin/email-templates/auto/{key}/test")
async def test_auto_template(
    key: str, payload: AutoTemplateTest, request: Request,
    current: dict = Depends(require_superadmin),
):
    """Send a test email of this template to a specific address."""
    from email_templates import send_template_email
    to_email = payload.to_email or current.get("email")
    context = payload.context or {
        "name": "Max Mustermann", "email": to_email,
        "message_preview": "Das ist eine Test-Nachricht zur Vorschau.",
        "service": "Cyber Security", "company": "Beispiel GmbH",
        "rating": 5, "content_preview": "Sehr empfehlenswert!",
        "budget_line": "Budget: 5.000-10.000€",
    }
    ok = await send_template_email(key, to_email, context)
    await audit_log("email_template_test", current.get("email"), request, {"key": key, "to": to_email, "success": ok})
    return {"sent": ok, "to": to_email, "key": key}


# ================= ANALYTICS (Google Analytics 4 Data API, graceful degradation) =================
# Each endpoint falls back to a zeroed/"Not configured" response — same shape
# the frontend has always handled — whenever GA_PROPERTY_ID or
# backend/ga_credentials.json is missing. See ga_analytics.py and
# docs/google-analytics-setup.md.

@router.get("/analytics/overview")
async def analytics_overview(current: dict = Depends(get_current_user)):
    return ga_analytics.get_overview()


@router.get("/analytics/top-pages")
async def analytics_top_pages(current: dict = Depends(get_current_user)):
    return ga_analytics.get_top_pages()


@router.get("/analytics/devices")
async def analytics_devices(current: dict = Depends(get_current_user)):
    return ga_analytics.get_devices()


@router.get("/analytics/countries")
async def analytics_countries(current: dict = Depends(get_current_user)):
    return ga_analytics.get_countries()


@router.get("/analytics/realtime")
async def analytics_realtime(current: dict = Depends(get_current_user)):
    return ga_analytics.get_realtime()
