"""Transactional email templates — DB-backed, placeholder-substituted, admin-editable.

Collection: `email_templates`
Document schema:
  key           str (unique, e.g. "contact_confirmation")
  name          str (human label, e.g. "Kontaktformular-Bestätigung")
  description   str
  trigger       str (public endpoint that fires it, e.g. "/api/contact/submit")
  enabled       bool
  subject       str (with placeholders)
  body_text     str (plain text fallback)
  body_html     str (HTML version)
  available_vars list[str]  (documented placeholders)
  updated_at    iso str
  updated_by    str

Placeholder syntax: {{ var_name }} (Jinja-ish, but we do simple str.replace)
"""

import os
import re
import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List

from security import db
from services import send_email
import config

logger = logging.getLogger("zebick.templates")

# Public website URL (for logo + unsubscribe links in emails)
PUBLIC_URL = os.environ.get("PUBLIC_SITE_URL", "https://zebick.com")
LOGO_URL = f"{PUBLIC_URL}/logo.png"


from email_templates_defaults import build_templates, DARK_MODE_STYLE

DEFAULT_TEMPLATES = build_templates()


# -------------------------------------------------------------------------
# Dark-Mode CSS injector
# Ensures every outgoing HTML email supports Gmail/Apple Mail dark mode,
# even if an admin edited a template and dropped the <style> block.
# -------------------------------------------------------------------------

_DARK_STYLE_MARK = "Gmail / Apple Mail / Outlook Dark Mode Support"


# -------------------------------------------------------------------------
# Dynamic social icons row (built from admin settings at send time)
# -------------------------------------------------------------------------

_SOCIAL_PLATFORMS = [
    # (key in settings, label, svg path)
    ("social_linkedin",  "LinkedIn",  '<svg width="18" height="18" viewBox="0 0 24 24" fill="#fff" xmlns="http://www.w3.org/2000/svg"><path d="M20.4 20.4h-3.6v-5.4c0-1.3 0-2.9-1.8-2.9s-2 1.4-2 2.8v5.5H9.5V9.1h3.4v1.5h.1c.5-.9 1.6-1.8 3.3-1.8 3.6 0 4.2 2.3 4.2 5.4v6.2zM5.5 7.5a2 2 0 1 1 0-4.1 2 2 0 0 1 0 4.1zM7.3 20.4H3.6V9.1h3.7v11.3zM22.2 0H1.7C.8 0 0 .8 0 1.7v20.6c0 .9.8 1.7 1.7 1.7h20.5c1 0 1.8-.8 1.8-1.7V1.7C24 .8 23.2 0 22.2 0z"/></svg>'),
    ("social_twitter",   "X (Twitter)", '<svg width="16" height="16" viewBox="0 0 24 24" fill="#fff" xmlns="http://www.w3.org/2000/svg"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/></svg>'),
    ("social_instagram", "Instagram", '<svg width="18" height="18" viewBox="0 0 24 24" fill="#fff" xmlns="http://www.w3.org/2000/svg"><path d="M12 0C8.7 0 8.3 0 7 .1c-1.3 0-2.2.3-3 .6-.8.3-1.5.7-2.2 1.4C1 2.8.7 3.5.4 4.3.1 5.1 0 6 0 7.3 0 8.7 0 9.1 0 12.4s0 3.7.1 5c0 1.3.3 2.2.6 3 .3.8.7 1.5 1.4 2.2.7.7 1.4 1.1 2.2 1.4.8.3 1.7.5 3 .6 1.3 0 1.7.1 5 .1s3.7 0 5-.1c1.3 0 2.2-.3 3-.6.8-.3 1.5-.7 2.2-1.4.7-.7 1.1-1.4 1.4-2.2.3-.8.5-1.7.6-3 .1-1.3.1-1.7.1-5s0-3.7-.1-5c0-1.3-.3-2.2-.6-3-.3-.8-.7-1.5-1.4-2.2C21.2 1 20.5.7 19.7.4c-.8-.3-1.7-.5-3-.6C15.3 0 14.9 0 12 0zm0 2.2c3.2 0 3.6 0 4.9.1 1.2 0 1.8.3 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1.1.4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c0 1.2-.3 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1.1.4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2 0-1.8-.3-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1.1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c0-1.2.3-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1.1-.4 2.2-.4 1.3-.1 1.7-.1 4.8-.1zm0 3.7a6.1 6.1 0 1 0 0 12.2 6.1 6.1 0 0 0 0-12.2zm0 10a4 4 0 1 1 0-7.9 4 4 0 0 1 0 7.9zm7.8-10.2a1.4 1.4 0 1 1-2.9 0 1.4 1.4 0 0 1 2.9 0z"/></svg>'),
    ("social_facebook",  "Facebook",  '<svg width="18" height="18" viewBox="0 0 24 24" fill="#fff" xmlns="http://www.w3.org/2000/svg"><path d="M24 12.07A12 12 0 1 0 10.13 24v-8.44H7.08V12.07h3.05V9.41c0-3 1.8-4.67 4.53-4.67 1.3 0 2.68.23 2.68.23v2.96H15.83c-1.5 0-1.96.93-1.96 1.88v2.26h3.34l-.53 3.49h-2.81V24A12 12 0 0 0 24 12.07z"/></svg>'),
    ("social_youtube",   "YouTube",   '<svg width="18" height="18" viewBox="0 0 24 24" fill="#fff" xmlns="http://www.w3.org/2000/svg"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z"/></svg>'),
    ("social_tiktok",    "TikTok",    '<svg width="16" height="16" viewBox="0 0 24 24" fill="#fff" xmlns="http://www.w3.org/2000/svg"><path d="M19.6 6.7a5.7 5.7 0 0 1-3.4-1.1 5.7 5.7 0 0 1-2.2-4H10.5v13.2a3.3 3.3 0 1 1-2.4-3.2V8a6.7 6.7 0 1 0 5.7 6.6V8.9a8.6 8.6 0 0 0 5 1.6V7.1a5.6 5.6 0 0 1-3.2-.4z"/></svg>'),
    ("social_github",    "GitHub",    '<svg width="18" height="18" viewBox="0 0 24 24" fill="#fff" xmlns="http://www.w3.org/2000/svg"><path d="M12 0a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2 0 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.6 18.3 5 18.3 5c.7 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 0z"/></svg>'),
    ("social_xing",      "Xing",      '<svg width="16" height="16" viewBox="0 0 24 24" fill="#fff" xmlns="http://www.w3.org/2000/svg"><path d="M18.2 0c-.3 0-.4.2-.6.5l-7 12.4 4.4 8c.2.3.4.5.6.5h3.1c.2 0 .3-.1.4-.2 0 0 0-.1 0-.2L14.8 13l6.9-12.3c.1-.2.1-.4-.1-.6 0 0-.1 0-.2 0h-3.2zM4.2 5.4c-.2 0-.3 0-.4.2 0 0 0 .2 0 .3l2.1 3.6L2.6 15c0 .2 0 .4.2.5h.1c.1.1.3.2.4.2h3.2c.2 0 .4-.2.5-.5l3.5-6L8 5.6c-.1-.2-.3-.3-.5-.3H4.2z"/></svg>'),
]


def build_social_icons_html(settings: dict) -> str:
    """Build the <table> of social icon links, skipping platforms with empty URL.

    Only platforms whose admin-setting URL is non-empty are rendered.
    Returns empty string if no socials configured.
    """
    cells = []
    for key, name, svg in _SOCIAL_PLATFORMS:
        url = (settings.get(key) or "").strip()
        if not url:
            continue
        cells.append(
            f'<td style="padding:0 6px">'
            f'<a href="{url}" target="_blank" rel="noopener" title="{name}" '
            f'style="display:inline-block;width:38px;height:38px;line-height:38px;'
            f'background:#1a1a1a;border:1px solid rgba(255,107,0,0.25);'
            f'border-radius:8px;text-align:center;text-decoration:none">'
            f'<span style="display:inline-block;vertical-align:middle">{svg}</span>'
            f'</a></td>'
        )
    if not cells:
        return ""  # no socials → row is collapsed
    return (
        '<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto">'
        '<tr>' + "".join(cells) + '</tr></table>'
    )


async def get_current_settings() -> dict:
    """Read latest site_settings doc (used to populate social URLs in emails)."""
    return await db.site_settings.find_one({"id": "global"}, {"_id": 0}) or {}


def inject_dark_mode(html: str) -> str:
    """Insert DARK_MODE_STYLE into <head> if not already present."""
    if not html:
        return html
    if _DARK_STYLE_MARK in html:
        return html
    if "<head>" in html:
        return html.replace("<head>", f"<head>{DARK_MODE_STYLE}", 1)
    if "<head " in html:
        return re.sub(r"(<head\b[^>]*>)", r"\1" + DARK_MODE_STYLE, html, count=1)
    # No <head> — inject at the top
    return DARK_MODE_STYLE + html


async def seed_default_templates(force: bool = False) -> int:
    """Insert default templates if missing. Returns number inserted."""
    inserted = 0
    for tpl in DEFAULT_TEMPLATES:
        existing = await db.email_templates.find_one({"key": tpl["key"]}, {"_id": 0, "key": 1})
        if existing and not force:
            continue
        doc = {
            **tpl,
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "updated_by": "system-seed",
        }
        if existing and force:
            await db.email_templates.replace_one({"key": tpl["key"]}, doc)
        else:
            await db.email_templates.insert_one(doc)
            inserted += 1
    return inserted


def _render(template_str: str, context: Dict[str, Any]) -> str:
    """Simple {{var}} placeholder substitution. Missing vars -> empty string."""
    if not template_str:
        return ""
    def sub(match: re.Match) -> str:
        key = match.group(1).strip()
        return str(context.get(key, ""))
    return re.sub(r"\{\{\s*([a-zA-Z0-9_]+)\s*\}\}", sub, template_str)


async def get_signature() -> tuple[str, str]:
    """Return (html, text) of the active signature, or empty strings if none/disabled."""
    sig = await db.email_templates.find_one({"key": "signature"}, {"_id": 0})
    if not sig or not sig.get("enabled", True):
        return "", ""
    return sig.get("body_html", ""), sig.get("body_text", "")


async def append_signature(html: str, text: str) -> tuple[str, str]:
    """Append signature to html+text content if configured."""
    sig_html, sig_text = await get_signature()
    return (html + sig_html) if sig_html else html, (text + sig_text) if sig_text else text


# -------------------------------------------------------------------------
# A/B rotation
# -------------------------------------------------------------------------

AB_VARIANTS: List[str] = ["A", "B"]
AB_TEMPLATE_MAP = {"A": "offer_variant_a", "B": "offer_variant_b"}


async def next_ab_variant() -> str:
    """Round-robin counter stored in `system_counters` collection.

    Returns "A" or "B" and atomically increments.
    """
    doc = await db.system_counters.find_one_and_update(
        {"_id": "offer_ab"},
        {"$inc": {"count": 1}},
        upsert=True,
        return_document=True,
    )
    # After upsert on first call, count may be 1 (the increment happened)
    n = doc.get("count", 0) if doc else 1
    # Pick based on zero-based: count 1 -> index 0 -> "A", count 2 -> "B", ...
    return AB_VARIANTS[(n - 1) % len(AB_VARIANTS)]


async def peek_next_ab_variant() -> str:
    """Return the variant that would be used NEXT without incrementing."""
    doc = await db.system_counters.find_one({"_id": "offer_ab"}, {"_id": 0})
    n = (doc.get("count", 0) if doc else 0) + 1
    return AB_VARIANTS[(n - 1) % len(AB_VARIANTS)]


async def send_template_email(
    template_key: str,
    to_email: str,
    context: Optional[Dict[str, Any]] = None,
) -> bool:
    """Fetch template, render placeholders, send via SMTP. Never raises (logs only)."""
    if not to_email:
        return False
    settings = await get_current_settings()
    social_html = build_social_icons_html(settings)
    ctx = {
        "year": datetime.now(timezone.utc).year,
        "name": "",
        "email": to_email,
        "SOCIAL_ICONS_ROW": social_html,
        "CONTACT_EMAIL": settings.get("contact_email") or "kontakt@zebick.com",
        "CONTACT_PHONE": settings.get("contact_phone") or "",
        "WHATSAPP_LINK": settings.get("whatsapp_link") or "",
        "COMPANY_NAME": settings.get("company_name") or "Zebick",
        **(context or {}),
    }
    try:
        tpl = await db.email_templates.find_one({"key": template_key}, {"_id": 0})
        if not tpl:
            logger.warning(f"Template not found: {template_key}")
            return False
        if not tpl.get("enabled", True):
            logger.info(f"Template {template_key} is disabled, skipping")
            return False

        subject = _render(tpl["subject"], ctx)
        html = _render(tpl["body_html"], ctx)
        text = _render(tpl.get("body_text") or "", ctx)
        # Don't append signature to the signature template itself
        if template_key != "signature":
            html, text = await append_signature(html, text)

        # Always ensure dark-mode support for Gmail/Apple Mail
        html = inject_dark_mode(html)

        return await send_email(to_email, subject, html, text_content=text)
    except Exception as e:  # noqa: BLE001
        logger.error(f"send_template_email({template_key}) failed: {e}")
        return False
