"""IMAP inbox fetcher — pulls emails from SiteGround mailbox into MongoDB.

Runs every N minutes via scheduler. Skips if no credentials configured.
Stores in collection `inbox_emails` with de-duplication by (mailbox, uid).
"""

import os
import logging
import asyncio
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List

from security import db, audit_log, sanitize_email_html

logger = logging.getLogger("zebick.inbox")


def _fetch_sync() -> List[Dict[str, Any]]:
    """Synchronous IMAP fetch, runs in executor."""
    host = os.environ.get("IMAP_HOST")
    port = int(os.environ.get("IMAP_PORT", "993"))
    user = os.environ.get("IMAP_USERNAME")
    password = os.environ.get("IMAP_PASSWORD")

    if not all([host, user, password]):
        return []

    from imap_tools import MailBox, AND

    emails: List[Dict[str, Any]] = []
    with MailBox(host, port=port).login(user, password) as mailbox:
        # Fetch last 100 emails from INBOX, mark_seen=False to keep original flags
        for msg in mailbox.fetch(AND(all=True), reverse=True, limit=100, mark_seen=False):
            attachments = [
                {"filename": a.filename or "attachment", "size": a.size, "content_type": a.content_type}
                for a in (msg.attachments or [])
            ]
            # Fallback to now() if date header missing or invalid
            msg_date = msg.date if (msg.date and msg.date.year > 1970) else datetime.now(timezone.utc)
            emails.append({
                "uid": str(msg.uid) if msg.uid else None,
                "mailbox": user,
                "from_email": msg.from_ or "",
                "from_name": (msg.from_values.name if msg.from_values else "") or "",
                "to": list(msg.to) if msg.to else [],
                "subject": msg.subject or "(ohne Betreff)",
                "date": msg_date.isoformat(),
                "body_text": (msg.text or "")[:20000],
                # Raw IMAP HTML is attacker-controlled (anyone can email the inbox) and
                # gets rendered via dangerouslySetInnerHTML in the admin UI — sanitize
                # once here so every consumer (inbox view, quoted replies) is safe.
                "body_html": sanitize_email_html(msg.html, 50000),
                "attachments": attachments,
                "attachments_count": len(attachments),
                "flags": list(msg.flags) if msg.flags else [],
                "is_seen": "\\Seen" in (msg.flags or []),
                "folder": "INBOX",
            })
    return emails


async def fetch_new_emails() -> Dict[str, Any]:
    """Fetch IMAP mails, upsert into Mongo. Returns stats."""
    if not os.environ.get("IMAP_HOST"):
        logger.info("IMAP not configured, skipping inbox fetch")
        return {"status": "skipped", "reason": "no_credentials"}

    started = datetime.now(timezone.utc)
    try:
        loop = asyncio.get_running_loop()
        emails = await loop.run_in_executor(None, _fetch_sync)
    except Exception as e:  # noqa: BLE001
        logger.error(f"IMAP fetch failed: {e}")
        await audit_log("inbox_fetch_failed", "scheduler", None, {"error": str(e)})
        return {"status": "failed", "error": str(e)}

    inserted = 0
    updated = 0
    for e in emails:
        if not e["uid"]:
            continue
        existing = await db.inbox_emails.find_one(
            {"mailbox": e["mailbox"], "uid": e["uid"]}, {"_id": 0, "id": 1, "is_seen": 1}
        )
        if existing:
            # Update seen flag only (preserve admin starred/read states)
            if existing.get("is_seen") != e["is_seen"]:
                await db.inbox_emails.update_one(
                    {"mailbox": e["mailbox"], "uid": e["uid"]},
                    {"$set": {"is_seen": e["is_seen"], "flags": e["flags"]}},
                )
                updated += 1
        else:
            doc = {
                "id": str(uuid.uuid4()),
                **e,
                "starred": False,
                "read": e["is_seen"],
                "archived": False,
                "fetched_at": datetime.now(timezone.utc).isoformat(),
            }
            await db.inbox_emails.insert_one(doc)
            inserted += 1

    result = {
        "status": "success",
        "started_at": started.isoformat(),
        "finished_at": datetime.now(timezone.utc).isoformat(),
        "fetched": len(emails),
        "inserted": inserted,
        "updated": updated,
    }
    logger.info(f"Inbox fetch: {result}")
    return result


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    print(asyncio.run(fetch_new_emails()))
