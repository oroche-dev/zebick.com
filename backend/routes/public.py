"""Public (no-auth) endpoints: contact, newsletter, testimonials submit, leads, chat, game, status."""

import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import List, Optional

import bleach
from fastapi import APIRouter, Depends, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

import config
from security import db, sanitize_text, get_current_user
from models import (
    StatusCheck, StatusCheckCreate,
    NewsletterSubscribe, NewsletterSubscriber,
    ContactFormSubmit, ContactFormEntry,
    LeadCreate, Lead,
    ChatMessage, ChatResponse,
    GameScoreCreate, GameScore, LeaderboardEntry,
    TestimonialCreate, Testimonial, TestimonialPublic,
)
from services import (
    get_or_create_chat_session, chat_send_message, FALLBACK_CHAT, send_email,
)
from email_templates import send_template_email

import logging
logger = logging.getLogger("zebick.public")

router = APIRouter(prefix="/api")
limiter = Limiter(key_func=get_remote_address, enabled=config.RATE_LIMIT_ENABLED)


@router.get("/")
async def root():
    return {"message": "Zebick API online", "status": "ok"}


@router.get("/health")
async def health():
    try:
        await db.command("ping")
        return {"status": "healthy", "db": "connected"}
    except Exception as e:  # noqa: BLE001
        # Log the real error server-side only — this endpoint is public and
        # unauthenticated, so the raw exception text (which can contain
        # internal hostnames/connection details) must never reach the caller.
        logger.error(f"Health check failed: {e}")
        return {"status": "unhealthy", "db": "disconnected"}


@router.post("/status", response_model=StatusCheck)
@limiter.limit("30/minute")
async def create_status_check(request: Request, input: StatusCheckCreate):
    s = StatusCheck(client_name=sanitize_text(input.client_name, 200))
    doc = s.model_dump()
    doc["timestamp"] = doc["timestamp"].isoformat()
    await db.status_checks.insert_one(doc)
    return s


@router.get("/status", response_model=List[StatusCheck])
async def list_status(skip: int = 0, limit: int = 100, current: dict = Depends(get_current_user)):
    rows = await db.status_checks.find({}, {"_id": 0}) \
        .sort("timestamp", -1).skip(max(0, skip)).limit(min(max(1, limit), 100)).to_list(100)
    for r in rows:
        if isinstance(r.get("timestamp"), str):
            r["timestamp"] = datetime.fromisoformat(r["timestamp"])
    return rows


# ---------------- LEADS (create public; read protected elsewhere) ----------------

@router.post("/leads", response_model=Lead)
@limiter.limit("10/minute")
async def create_lead(request: Request, lead_input: LeadCreate):
    lead = Lead(**lead_input.model_dump())
    doc = lead.model_dump()
    doc["timestamp"] = doc["timestamp"].isoformat()
    await db.leads.insert_one(doc)
    try:
        budget_line = f"Budget: {lead.budget}\n" if lead.budget else ""
        await send_template_email(
            "lead_confirmation", lead.email,
            {"name": lead.name, "email": lead.email,
             "service": lead.service or "Allgemeine Anfrage",
             "company": lead.company or "", "budget_line": budget_line},
        )
    except Exception as e:  # noqa: BLE001
        logger.error(f"Lead auto-reply failed: {e}")
    return lead


# ---------------- CHAT ----------------

@router.post("/chat", response_model=ChatResponse)
@limiter.limit("15/minute")
async def chat_with_bot(request: Request, chat_input: ChatMessage):
    msg = sanitize_text(chat_input.message, 2000)
    if not msg:
        raise HTTPException(status_code=400, detail="Nachricht darf nicht leer sein")
    session_id, history = get_or_create_chat_session(chat_input.session_id)
    if history is None:
        return ChatResponse(session_id=session_id, response=FALLBACK_CHAT)
    try:
        response = await chat_send_message(session_id, history, msg)
    except Exception as e:  # noqa: BLE001
        logger.error(f"LLM error: {e}")
        response = FALLBACK_CHAT
    try:
        await db.chat_messages.insert_one({
            "session_id": session_id,
            "user_message": msg,
            "bot_response": response,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })
    except Exception:  # noqa: BLE001
        pass
    return ChatResponse(session_id=session_id, response=response)


# ---------------- GAME ----------------

@router.post("/game/score", response_model=GameScore)
@limiter.limit("30/minute")
async def submit_score(request: Request, score_input: GameScoreCreate):
    g = GameScore(
        player_name=sanitize_text(score_input.player_name, 20),
        score=score_input.score,
        game_id=sanitize_text(score_input.game_id, 50),
    )
    doc = g.model_dump()
    doc["timestamp"] = doc["timestamp"].isoformat()
    await db.game_scores.insert_one(doc)
    return g


@router.get("/game/leaderboard", response_model=List[LeaderboardEntry])
async def get_leaderboard(game_id: str = "space-defender", limit: int = 10):
    rows = await db.game_scores.find(
        {"game_id": sanitize_text(game_id, 50)},
        {"_id": 0, "player_name": 1, "score": 1, "timestamp": 1},
    ).sort("score", -1).limit(min(max(1, limit), 50)).to_list(50)
    return [
        LeaderboardEntry(
            rank=i + 1,
            player_name=r["player_name"],
            score=r["score"],
            timestamp=r["timestamp"] if isinstance(r["timestamp"], str) else r["timestamp"].isoformat(),
        )
        for i, r in enumerate(rows)
    ]


@router.get("/game/leaderboard/rank")
async def get_player_rank(player_name: str, score: int, game_id: str = "space-defender"):
    higher = await db.game_scores.count_documents(
        {"game_id": sanitize_text(game_id, 50), "score": {"$gt": score}}
    )
    return {"rank": higher + 1, "score": score, "player_name": sanitize_text(player_name, 20)}


# ---------------- NEWSLETTER (double opt-in: subscribe/confirm/unsubscribe) ----------------

NEWSLETTER_GENERIC_RESPONSE = {
    "message": "Bitte bestätige deine Anmeldung über den Link, den wir dir per E-Mail geschickt haben."
}


@router.post("/newsletter/subscribe")
@limiter.limit("5/minute")
async def subscribe_newsletter(request: Request, data: NewsletterSubscribe):
    email = data.email.lower().strip()
    existing = await db.newsletter_subscribers.find_one({"email": email})

    # Same response whether this email is new, pending, unsubscribed, or
    # already confirmed — never leak registration status (see audit brief).
    if not existing or existing.get("status") != "confirmed":
        token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        expires_at = (
            datetime.now(timezone.utc) + timedelta(hours=config.NEWSLETTER_CONFIRM_TOKEN_HOURS)
        ).isoformat()

        if existing:
            await db.newsletter_subscribers.update_one(
                {"email": email},
                {"$set": {
                    "status": "pending",
                    "subscribed_at": datetime.now(timezone.utc).isoformat(),
                    "confirm_token_hash": token_hash,
                    "confirm_token_expires_at": expires_at,
                }},
            )
        else:
            s = NewsletterSubscriber(email=email)
            doc = s.model_dump()
            doc["subscribed_at"] = doc["subscribed_at"].isoformat()
            doc["confirm_token_hash"] = token_hash
            doc["confirm_token_expires_at"] = expires_at
            await db.newsletter_subscribers.insert_one(doc)

        confirm_url = f"{config.PUBLIC_SITE_URL}/newsletter/bestaetigen?token={token}"
        try:
            await send_template_email("newsletter_confirm_doi", email, {"email": email, "confirm_url": confirm_url})
        except Exception as e:  # noqa: BLE001
            logger.error(f"Newsletter confirm-request email failed: {e}")

    return NEWSLETTER_GENERIC_RESPONSE


@router.get("/newsletter/confirm")
@limiter.limit("10/minute")
async def confirm_newsletter(request: Request, token: str):
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    now_iso = datetime.now(timezone.utc).isoformat()
    existing = await db.newsletter_subscribers.find_one({"confirm_token_hash": token_hash})
    if not existing or existing.get("confirm_token_expires_at", "") < now_iso:
        logger.warning("Newsletter confirm: invalid or expired token")
        raise HTTPException(status_code=400, detail="Der Bestätigungslink ist ungültig oder abgelaufen.")

    email = existing["email"]
    await db.newsletter_subscribers.update_one(
        {"email": email},
        {
            "$set": {"status": "confirmed", "confirmed_at": now_iso},
            "$unset": {"confirm_token_hash": "", "confirm_token_expires_at": ""},
        },
    )
    try:
        await send_template_email("newsletter_confirmation", email, {"email": email})
    except Exception as e:  # noqa: BLE001
        logger.error(f"Newsletter welcome email failed: {e}")
    return {"message": "Bestätigt"}


@router.post("/newsletter/unsubscribe")
@limiter.limit("10/minute")
async def unsubscribe_newsletter(request: Request, data: NewsletterSubscribe):
    email = data.email.lower().strip()
    existing = await db.newsletter_subscribers.find_one({"email": email})
    if not existing:
        raise HTTPException(status_code=404, detail="E-Mail nicht gefunden")
    await db.newsletter_subscribers.update_one(
        {"email": email},
        {"$set": {"status": "unsubscribed",
                  "unsubscribed_at": datetime.now(timezone.utc).isoformat()}},
    )
    return {"message": "Erfolgreich abgemeldet", "email": email}


# ---------------- CONTACT FORM (public submit) ----------------

@router.post("/contact/submit", response_model=ContactFormEntry)
@limiter.limit("5/minute")
async def submit_contact_form(request: Request, form_data: ContactFormSubmit):
    contact = ContactFormEntry(**form_data.model_dump())
    doc = contact.model_dump()
    doc["submitted_at"] = doc["submitted_at"].isoformat()
    await db.contact_forms.insert_one(doc)

    # Activity log
    try:
        from routes.crm import log_activity
        await log_activity(
            "contact_created",
            f"Neue Anfrage von {contact.name}",
            description=f"Service: {contact.service or '-'} | Budget: {contact.budget or '-'}",
            actor="public",
            related_id=contact.id, related_type="contact",
        )
    except Exception as e:  # noqa: BLE001
        logger.error(f"Contact activity log failed: {e}")

    # Also capture every inbound request as a CRM lead (scoring, status
    # pipeline, convert-to-customer) — origin inferred server-side from the
    # same signals already used for the auto-reply greeting above.
    from routes.leads import create_lead_from_submission
    if contact.name.endswith("-Lead"):
        origin_tag = f"Tool: {contact.service}" if contact.service else "Tool"
    elif contact.service == "Erstgespräch":
        origin_tag = "Beratung"
    else:
        origin_tag = "Kontaktformular"
    await create_lead_from_submission(
        name=contact.name, email=contact.email, phone=contact.phone, company=contact.company,
        service=contact.service, budget_str=contact.budget, message=contact.message,
        origin_tag=origin_tag, request=request,
    )

    # Auto-reply to customer
    try:
        preview = (contact.message or "")[:200] + ("..." if len(contact.message or "") > 200 else "")
        subject_row = (
            f"<tr><td style='font-size:13px;color:#666;padding-top:6px'>Betreff</td>"
            f"<td style='font-size:14px;color:#333;text-align:right;padding-top:6px'>{bleach.clean(contact.service)}</td></tr>"
        ) if contact.service else ""
        received_at = contact.submitted_at.strftime("%d.%m.%Y, %H:%M Uhr")
        # Tool widgets (Kostenrechner, DSGVO-Check, ...) only collect an email,
        # not a name, and fill this field with a placeholder like
        # "Kostenrechner-Lead" so admins can spot the source in the contact
        # list. That placeholder shouldn't greet the customer by name in their
        # own confirmation email — use a neutral greeting instead.
        greeting_name = f"Hallo {bleach.clean(contact.name)}," if not contact.name.endswith("-Lead") else "Hallo,"
        await send_template_email(
            "contact_confirmation",
            contact.email,
            {"name": contact.name, "email": contact.email, "greeting_name": greeting_name,
             "message_preview": preview, "service": contact.service or "",
             "company": contact.company or "",
             "reference_id": contact.id, "subject_row": subject_row, "received_at": received_at},
        )
    except Exception as e:  # noqa: BLE001
        logger.error(f"Contact auto-reply failed: {e}")

    is_support = contact.service == "support"
    notify_email = config.SUPPORT_NOTIFICATION_EMAIL if is_support else config.ADMIN_NOTIFICATION_EMAIL
    if notify_email:
        try:
            subject = f"{'Support-Anfrage' if is_support else 'Neue Kontaktanfrage'} von {contact.name}"
            html = f"""<html><body><h2>{'Support-Anfrage' if is_support else 'Neue Kontaktanfrage'}</h2>
            <p><b>Name:</b> {bleach.clean(contact.name)}</p>
            <p><b>E-Mail:</b> {bleach.clean(contact.email)}</p>
            <p><b>Service:</b> {bleach.clean(contact.service or '-')}</p>
            <p><b>Nachricht:</b><br>{bleach.clean(contact.message).replace(chr(10), '<br>')}</p>
            </body></html>"""
            await send_email(notify_email, subject, html)
        except Exception as e:  # noqa: BLE001
            logger.error(f"Admin notification failed: {e}")
    return contact


# ---------------- TESTIMONIALS (public submit + approved read) ----------------

@router.post("/testimonials/submit", response_model=Testimonial)
@limiter.limit("3/minute")
async def submit_testimonial(request: Request, data: TestimonialCreate):
    t = Testimonial(**data.model_dump())
    doc = t.model_dump()
    doc["submitted_at"] = doc["submitted_at"].isoformat()
    if doc.get("approved_at"):
        doc["approved_at"] = doc["approved_at"].isoformat()
    await db.testimonials.insert_one(doc)
    # Auto-reply if email was provided
    if t.email:
        try:
            preview = (t.content or "")[:200]
            await send_template_email(
                "testimonial_thankyou", t.email,
                {"name": t.name, "rating": t.rating, "content_preview": preview,
                 "company": t.company or "", "email": t.email},
            )
        except Exception as e:  # noqa: BLE001
            logger.error(f"Testimonial auto-reply failed: {e}")
    return t


@router.get("/testimonials/approved", response_model=List[TestimonialPublic])
async def get_approved_testimonials(limit: int = 20):
    return await db.testimonials.find(
        {"status": "approved"},
        {"_id": 0, "id": 1, "name": 1, "company": 1, "position": 1, "content": 1, "rating": 1},
    ).sort("approved_at", -1).limit(min(max(1, limit), 50)).to_list(50)
