"""Public tracking endpoints for A/B-tested offer emails.

- GET /api/track/offer/{token}/click    -> redirect + mark clicked
- GET /api/track/offer/{token}/accept   -> redirect + mark accepted
- GET /api/track/offer/{token}/open.gif -> 1x1 pixel + mark opened (optional)
"""
import os
from datetime import datetime, timezone
from urllib.parse import quote

from fastapi import APIRouter, Request
from fastapi.responses import RedirectResponse, Response

from security import db

router = APIRouter(prefix="/api")


def _site_url() -> str:
    return os.environ.get("PUBLIC_SITE_URL", "").rstrip("/") or "about:blank"


def _admin_email() -> str:
    return os.environ.get("ADMIN_NOTIFICATION_EMAIL") \
        or os.environ.get("SMTP_FROM_EMAIL") \
        or os.environ.get("ADMIN_EMAIL", "")


# 1x1 transparent GIF
_PIXEL = bytes.fromhex(
    "47494638396101000100800000ffffff00000021f90401000000002c00000000"
    "010001000002024401003b"
)


async def _stamp(token: str, field: str) -> dict | None:
    """Set field to now() only if not already set. Returns the doc."""
    now = datetime.now(timezone.utc).isoformat()
    doc = await db.offer_sends.find_one({"token": token}, {"_id": 0})
    if not doc:
        return None
    if not doc.get(field):
        await db.offer_sends.update_one(
            {"token": token},
            {"$set": {field: now}},
        )
        doc[field] = now
    return doc


@router.get("/track/offer/{token}/click")
async def track_click(token: str, request: Request):
    doc = await _stamp(token, "clicked_at")
    if not doc:
        return RedirectResponse(_site_url(), status_code=302)

    admin_email = _admin_email()
    subject = f"Angebots-Annahme: {doc.get('subject', 'Ihr Angebot')}"
    body = (
        f"Guten Tag,%0D%0A%0D%0A"
        f"ich interessiere mich f\u00fcr das Angebot (Ref: {token[:8]})"
        f" und bitte um einen Termin zur Besprechung.%0D%0A%0D%0A"
        f"Viele Gr\u00fc\u00dfe"
    )
    if admin_email:
        mailto = f"mailto:{admin_email}?subject={quote(subject)}&body={body}"
        return RedirectResponse(mailto, status_code=302)
    return RedirectResponse(_site_url(), status_code=302)


@router.get("/track/offer/{token}/accept")
async def track_accept(token: str, request: Request):
    doc = await _stamp(token, "clicked_at")
    await _stamp(token, "accepted_at")
    site = _site_url()
    if not doc:
        return RedirectResponse(site, status_code=302)
    # Redirect to site with a confirmation flag
    sep = "&" if "?" in site else "?"
    return RedirectResponse(f"{site}{sep}angebot=accepted", status_code=302)


@router.get("/track/offer/{token}/open.gif")
async def track_open(token: str):
    await _stamp(token, "opened_at")
    return Response(content=_PIXEL, media_type="image/gif",
                    headers={"Cache-Control": "no-cache, no-store, must-revalidate"})
