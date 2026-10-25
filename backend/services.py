"""Email + LLM chatbot helpers."""

import logging
from typing import Any, Dict, Optional, List, Tuple
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders

import base64

import aiosmtplib
import httpx

import config

logger = logging.getLogger("zebick.services")

# --- Chatbot (OpenAI-compatible, optional) ---
try:
    from openai import AsyncOpenAI
    _LLM_AVAILABLE = True
except Exception:  # noqa: BLE001
    AsyncOpenAI = None  # type: ignore[assignment]
    _LLM_AVAILABLE = False

CHATBOT_SYSTEM_PROMPT = """Du bist der freundliche und professionelle Assistent von Zebick,
einer führenden Digitalagentur und Cyber Security Firma. Antworte prägnant auf Deutsch.
Services: Webentwicklung, App-Entwicklung, Cyber Security, UI/UX, Gaming, Chatbots,
Server & Cloud, Marketing & SEO, Grafikdesign. Zertifizierungen: ISO 27001, AWS, GCP.
Kontakt: kontakt@zebick.com."""

CHATBOT_MODEL = "gpt-4o-mini"
CHATBOT_MAX_HISTORY = 12  # last N messages (user+assistant) per session

FALLBACK_CHAT = (
    "Vielen Dank für Ihre Nachricht! Unser Team meldet sich schnellstmöglich. "
    "Kontakt: kontakt@zebick.com"
)

# In-memory session store: session_id -> list[{role, content}]
chat_sessions: Dict[str, List[Dict[str, str]]] = {}
_openai_client: Optional[Any] = None


def _get_openai_client():
    """Lazily build an OpenAI client. Returns None if not configured/available."""
    global _openai_client
    if not (_LLM_AVAILABLE and config.LLM_API_KEY):
        return None
    if _openai_client is not None:
        return _openai_client
    _openai_client = AsyncOpenAI(api_key=config.LLM_API_KEY)
    return _openai_client


def get_or_create_chat_session(session_id: Optional[str] = None):
    """Return (session_id, history_list_or_None). History is None when LLM is disabled."""
    import uuid
    # Simple LRU-ish trim
    if len(chat_sessions) > 100:
        for old in list(chat_sessions.keys())[:50]:
            del chat_sessions[old]
    if session_id and session_id in chat_sessions:
        return session_id, chat_sessions[session_id]
    new_session_id = session_id or str(uuid.uuid4())
    client = _get_openai_client()
    if client is None:
        return new_session_id, None
    chat_sessions[new_session_id] = []
    return new_session_id, chat_sessions[new_session_id]


async def chat_send_message(session_id: str, history: List[Dict[str, str]], user_message: str) -> str:
    """Send a user message through the configured LLM and return the assistant reply."""
    client = _get_openai_client()
    if client is None:
        return FALLBACK_CHAT
    history.append({"role": "user", "content": user_message})
    # Keep only the last N turns to bound tokens
    if len(history) > CHATBOT_MAX_HISTORY:
        del history[: len(history) - CHATBOT_MAX_HISTORY]
    messages = [{"role": "system", "content": CHATBOT_SYSTEM_PROMPT}, *history]
    completion = await client.chat.completions.create(
        model=CHATBOT_MODEL,
        messages=messages,
        temperature=0.6,
        max_tokens=400,
    )
    reply = (completion.choices[0].message.content or "").strip() or FALLBACK_CHAT
    history.append({"role": "assistant", "content": reply})
    return reply


# --- Email ---

def _smtp_configured() -> bool:
    if config.SMTP_MOCK:
        return True
    return all([config.SMTP_HOST, config.SMTP_USERNAME, config.SMTP_PASSWORD, config.SMTP_FROM_EMAIL])


def _build_message(
    to_email: str, subject: str, html_content: str, text_content: Optional[str],
    attachments: Optional[List[Tuple[str, bytes, str]]] = None,
) -> MIMEMultipart:
    """Build a MIME message with optional attachments.

    attachments: list of tuples (filename, data_bytes, mime_type) e.g.
        [("Angebot.pdf", b"...", "application/pdf")]
    """
    if attachments:
        root = MIMEMultipart("mixed")
        alt = MIMEMultipart("alternative")
        if text_content:
            alt.attach(MIMEText(text_content, "plain", "utf-8"))
        alt.attach(MIMEText(html_content, "html", "utf-8"))
        root.attach(alt)
        for filename, data, mime_type in attachments:
            main, _, sub = mime_type.partition("/")
            part = MIMEBase(main or "application", sub or "octet-stream")
            part.set_payload(data)
            encoders.encode_base64(part)
            part.add_header("Content-Disposition", f'attachment; filename="{filename}"')
            root.attach(part)
        msg = root
    else:
        msg = MIMEMultipart("alternative")
        if text_content:
            msg.attach(MIMEText(text_content, "plain", "utf-8"))
        msg.attach(MIMEText(html_content, "html", "utf-8"))
    msg["From"] = f"{config.SMTP_FROM_NAME} <{config.SMTP_FROM_EMAIL}>"
    msg["To"] = to_email
    msg["Subject"] = subject
    return msg


async def _send_via_resend(
    to_email: str, subject: str, html_content: str, text_content: Optional[str],
    attachments: Optional[List[Tuple[str, bytes, str]]],
) -> bool:
    payload: Dict[str, Any] = {
        "from": f"{config.SMTP_FROM_NAME} <{config.SMTP_FROM_EMAIL}>",
        "to": [to_email],
        "subject": subject,
        "html": html_content,
    }
    if text_content:
        payload["text"] = text_content
    if attachments:
        payload["attachments"] = [
            {"filename": filename, "content": base64.b64encode(data).decode()}
            for filename, data, _mime_type in attachments
        ]
    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.post(
            "https://api.resend.com/emails",
            headers={"Authorization": f"Bearer {config.RESEND_API_KEY}"},
            json=payload,
        )
    resp.raise_for_status()
    return True


async def send_email(
    to_email: str, subject: str, html_content: str, text_content: str = None,
    attachments: Optional[List[Tuple[str, bytes, str]]] = None,
) -> bool:
    if config.RESEND_API_KEY:
        try:
            return await _send_via_resend(to_email, subject, html_content, text_content, attachments)
        except Exception as e:  # noqa: BLE001
            logger.error(f"Resend send failed {to_email}: {e}")
            return False
    if not _smtp_configured():
        logger.warning("SMTP not configured - skipping email")
        return False
    if config.SMTP_MOCK:
        att_info = f" + {len(attachments)} attachment(s)" if attachments else ""
        logger.info(f"[SMTP_MOCK] to={to_email} subject={subject!r}{att_info}")
        return True
    try:
        message = _build_message(to_email, subject, html_content, text_content, attachments)
        await aiosmtplib.send(
            message,
            hostname=config.SMTP_HOST,
            port=config.SMTP_PORT,
            username=config.SMTP_USERNAME,
            password=config.SMTP_PASSWORD,
            use_tls=config.SMTP_PORT == 465,
            start_tls=config.SMTP_PORT == 587,
        )
        return True
    except Exception as e:  # noqa: BLE001
        logger.error(f"Email send failed {to_email}: {e}")
        return False
