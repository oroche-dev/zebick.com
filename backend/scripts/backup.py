"""Scheduled automatic backup to local disk + optional email delivery.

Features:
- Daily backup at 03:00 UTC (local disk, see config.BACKUP_DIR)
- Weekly email backup every Sunday 03:15 UTC → ADMIN_NOTIFICATION_EMAIL
  (attachment, via SiteGround SMTP, lands in Inbox → visible in Admin Panel)
- JSON snapshot of all collections (password_hashes + totp_secrets excluded)
- Standard retention: last 7 daily + last 4 weekly (Sunday) + last 12 monthly (day 1)
- Optional: Cloudflare R2 upload (if R2_* env set)
- Email notification to ADMIN_NOTIFICATION_EMAIL on failure
- Zero-downtime: runs in the same FastAPI process via APScheduler

Triggered by:
- Scheduler (automatic)
- CLI: python -m scripts.backup
"""

import os
import json
import gzip
import base64
import logging
import asyncio
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Any, Dict, List, Optional
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication

import aiosmtplib

import config
from security import db, audit_log
from services import send_email

logger = logging.getLogger("zebick.backup")

BACKUP_DIR = config.BACKUP_DIR
try:
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
except OSError as e:  # a bad path must not stop the API from starting
    logger.warning(f"BACKUP_DIR {BACKUP_DIR} not writable: {e}")

# Every collection that holds business data. Not included on purpose:
# inbox_emails / inbox_replies (the mailbox itself is the original),
# chat_history and game_events (bulky, regenerable). Uploaded FILES live on
# disk, not in MongoDB, and are not part of this JSON backup.
COLLECTIONS = [
    "admin_users", "contact_forms", "contact_replies", "newsletter_subscribers",
    "testimonials", "leads", "customers", "activities", "offers", "offer_sends",
    "projects", "projects_crm", "projects_mgmt", "blog_posts", "team_members",
    "faqs", "custom_services", "categories", "services_catalog", "service_pages",
    "site_content", "site_settings", "email_templates", "system_counters",
    "chatbot_config", "chatbot_qa", "chatbot_leads", "chat_messages",
    "tools_config", "tool_versions", "uploads",
    "players", "player_achievements", "achievements_catalog", "reward_codes",
    "game_scores", "status_checks", "audit_log", "login_attempts",
]

# Never written to a backup, whichever collection they appear in.
SECRET_FIELDS = {"password_hash": 0, "totp_secret": 0, "totp_secret_pending": 0}

# Retention policy (standard)
KEEP_DAILY = 7
KEEP_WEEKLY = 4
KEEP_MONTHLY = 12


# ================= CORE BACKUP =================

async def create_snapshot() -> Dict[str, Any]:
    """Dump all collections as JSON-serializable dict, excluding secrets."""
    snapshot: Dict[str, Any] = {
        "exported_at": datetime.now(timezone.utc).isoformat(),
        "exported_by": "scheduler",
        "version": "1.0",
        "collections": {},
    }
    for col in COLLECTIONS:
        rows = await db[col].find({}, {"_id": 0, **SECRET_FIELDS}).to_list(100000)
        snapshot["collections"][col] = rows
    return snapshot


def write_local(snapshot: Dict[str, Any]) -> Path:
    """Write snapshot to <BACKUP_DIR>/zebick-YYYY-MM-DD.json."""
    date_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    path = BACKUP_DIR / f"zebick-{date_str}.json"
    path.write_text(json.dumps(snapshot, indent=2, default=str), encoding="utf-8")
    return path


# ================= EMAIL BACKUP =================

async def email_backup(local_path: Path, snapshot: Dict[str, Any]) -> bool:
    """Send backup file as email attachment to ADMIN_NOTIFICATION_EMAIL."""
    if not all([config.SMTP_HOST, config.SMTP_USERNAME, config.SMTP_PASSWORD,
                config.SMTP_FROM_EMAIL, config.ADMIN_NOTIFICATION_EMAIL]):
        logger.warning("SMTP/admin email not configured, skipping email backup")
        return False

    # Compress for smaller attachment
    gz_path = local_path.with_suffix(".json.gz")
    with open(local_path, "rb") as src, gzip.open(gz_path, "wb", compresslevel=9) as dst:
        dst.write(src.read())

    try:
        msg = MIMEMultipart()
        msg["From"] = f"{config.SMTP_FROM_NAME} <{config.SMTP_FROM_EMAIL}>"
        msg["To"] = config.ADMIN_NOTIFICATION_EMAIL
        msg["Subject"] = f"[Zebick Backup] {datetime.now(timezone.utc).strftime('%Y-%m-%d')}"
        from email.utils import formatdate, make_msgid
        msg["Date"] = formatdate(localtime=False)
        msg["Message-ID"] = make_msgid(domain="zebick.com")

        counts = snapshot.get("collections", {})
        total = sum(len(v) for v in counts.values())
        summary = "\n".join([f"  {k}: {len(v)}" for k, v in counts.items()])

        body = f"""Hallo,

hier ist das automatische wöchentliche Zebick-Backup.

Datum:         {datetime.now(timezone.utc).strftime('%A, %d.%m.%Y %H:%M UTC')}
Dateiname:     {gz_path.name}
Größe:         {gz_path.stat().st_size / 1024:.1f} KB (gzip-komprimiert)
Einträge:      {total} Datensätze in {len(counts)} Collections

Details:
{summary}

--
Die Datei im Anhang enthält ALLE Website-Daten (Kontaktanfragen, Newsletter, Bewertungen,
Leads, Chat, Audit-Log, Admins). Passwort-Hashes und 2FA-Secrets sind ausgeschlossen.

Zum Entpacken: gunzip {gz_path.name} → ergibt {local_path.name}
Öffnen mit jedem Texteditor oder JSON-Viewer.

Diese Mail automatisch bei jedem wöchentlichen Backup vom Zebick-System gesendet.
Zeitpunkt der Versendung: {datetime.now(timezone.utc).isoformat()}
"""
        msg.attach(MIMEText(body, "plain", "utf-8"))

        with open(gz_path, "rb") as f:
            part = MIMEApplication(f.read(), Name=gz_path.name)
        part["Content-Disposition"] = f'attachment; filename="{gz_path.name}"'
        msg.attach(part)

        await aiosmtplib.send(
            msg,
            hostname=config.SMTP_HOST,
            port=config.SMTP_PORT,
            username=config.SMTP_USERNAME,
            password=config.SMTP_PASSWORD,
            use_tls=config.SMTP_PORT == 465,
            start_tls=config.SMTP_PORT == 587,
        )
        logger.info(f"Backup emailed to {config.ADMIN_NOTIFICATION_EMAIL}, size={gz_path.stat().st_size}")
        return True
    except Exception as e:  # noqa: BLE001
        logger.error(f"Email backup failed: {e}")
        raise
    finally:
        # Clean up the gz file so we don't bloat the backup folder
        try:
            gz_path.unlink()
        except Exception:  # noqa: BLE001
            pass


# ================= R2 / S3 UPLOAD =================

def upload_to_r2(local_path: Path) -> Optional[str]:
    """Upload backup to Cloudflare R2 (S3-compatible). Returns remote key or None."""
    access_key = os.environ.get("R2_ACCESS_KEY_ID")
    secret_key = os.environ.get("R2_SECRET_ACCESS_KEY")
    endpoint = os.environ.get("R2_ENDPOINT_URL")
    bucket = os.environ.get("R2_BUCKET")

    if not all([access_key, secret_key, endpoint, bucket]):
        logger.info("R2 credentials not configured, skipping cloud upload")
        return None

    try:
        import boto3
        from botocore.config import Config as BotoConfig

        s3 = boto3.client(
            "s3",
            endpoint_url=endpoint,
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            config=BotoConfig(signature_version="s3v4"),
            region_name="auto",
        )
        key = f"backups/{local_path.name}"
        s3.upload_file(str(local_path), bucket, key)
        logger.info(f"Uploaded to R2: s3://{bucket}/{key}")
        return key
    except Exception as e:  # noqa: BLE001
        logger.error(f"R2 upload failed: {e}")
        raise


# ================= RETENTION =================

def apply_retention() -> List[str]:
    """Delete old local backups per policy. Returns list of removed filenames."""
    files = sorted(BACKUP_DIR.glob("zebick-*.json"), reverse=True)
    if not files:
        return []

    # Parse date from filename
    parsed = []
    for f in files:
        try:
            d = datetime.strptime(f.stem.replace("zebick-", ""), "%Y-%m-%d").replace(tzinfo=timezone.utc)
            parsed.append((d, f))
        except ValueError:
            continue

    keep = set()

    # Last N daily
    for d, f in parsed[:KEEP_DAILY]:
        keep.add(f)

    # Last N weekly (Sundays, weekday()==6)
    sundays = [(d, f) for d, f in parsed if d.weekday() == 6]
    for _, f in sundays[:KEEP_WEEKLY]:
        keep.add(f)

    # Last N monthly (day 1)
    firsts = [(d, f) for d, f in parsed if d.day == 1]
    for _, f in firsts[:KEEP_MONTHLY]:
        keep.add(f)

    removed = []
    for _, f in parsed:
        if f not in keep:
            f.unlink()
            removed.append(f.name)

    if removed:
        logger.info(f"Retention removed {len(removed)} old backups: {removed}")
    return removed


# ================= RESTORE (used by tools self-heal) =================

def _latest_backup_file() -> Optional[Path]:
    files = sorted(BACKUP_DIR.glob("zebick-*.json"), reverse=True)
    return files[0] if files else None


async def restore_collection_from_latest_backup(collection: str) -> int:
    """Restore a single collection from the newest local backup snapshot.

    Only inserts documents that are missing (dedup by 'id' then 'slug').
    Returns number of documents inserted. 0 if no backup / nothing to restore.
    """
    path = _latest_backup_file()
    if not path:
        return 0
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        rows = (data.get("collections", {}) or {}).get(collection, []) or []
    except Exception as e:  # noqa: BLE001
        logger.error(f"Restore read failed for {collection} from {path.name}: {e}")
        return 0
    if not rows:
        return 0

    inserted = 0
    for doc in rows:
        doc.pop("_id", None)
        key = None
        if doc.get("id"):
            key = {"id": doc["id"]}
        elif doc.get("slug"):
            key = {"slug": doc["slug"]}
        if key and await db[collection].find_one(key):
            continue
        try:
            await db[collection].insert_one(doc)
            inserted += 1
        except Exception:  # noqa: BLE001 (e.g. unique slug clash) — skip
            continue
    if inserted:
        logger.info(f"Restored {inserted} docs into {collection} from {path.name}")
    return inserted


# ================= NOTIFY =================

async def notify_failure(error: str) -> None:
    """Send email to admin on backup failure (if SMTP configured)."""
    if not config.ADMIN_NOTIFICATION_EMAIL:
        logger.warning(f"Backup failed but no ADMIN_NOTIFICATION_EMAIL set: {error}")
        return
    html = f"""<html><body>
    <h2 style="color:#EF4444">🚨 Zebick Backup FEHLGESCHLAGEN</h2>
    <p><b>Zeitpunkt:</b> {datetime.now(timezone.utc).isoformat()}</p>
    <p><b>Fehler:</b></p>
    <pre style="background:#f5f5f5;padding:12px;border-radius:6px">{error}</pre>
    <p>Bitte prüfe den Server und die R2-Zugangsdaten.</p>
    </body></html>"""
    try:
        await send_email(
            config.ADMIN_NOTIFICATION_EMAIL,
            "🚨 Zebick Backup fehlgeschlagen",
            html,
            text_content=f"Backup failed at {datetime.now(timezone.utc).isoformat()}: {error}",
        )
    except Exception as e:  # noqa: BLE001
        logger.error(f"Failed to send failure notification: {e}")


# ================= ORCHESTRATOR =================

async def run_backup(send_email_attachment: bool = False) -> Dict[str, Any]:
    """Full backup flow: snapshot → local → (email) → (R2) → retention → audit.

    Args:
        send_email_attachment: If True, also email the backup as attachment.
                               Set True by weekly scheduler, False by daily.
    """
    result: Dict[str, Any] = {
        "started_at": datetime.now(timezone.utc).isoformat(),
        "status": "pending",
        "email_sent": False,
    }
    try:
        snapshot = await create_snapshot()
        local_path = write_local(snapshot)
        result["local_path"] = str(local_path)
        result["size_bytes"] = local_path.stat().st_size
        result["collections"] = {k: len(v) for k, v in snapshot["collections"].items()}

        if send_email_attachment:
            try:
                result["email_sent"] = await email_backup(local_path, snapshot)
            except Exception as e:  # noqa: BLE001
                result["email_error"] = str(e)

        loop = asyncio.get_running_loop()
        remote_key = await loop.run_in_executor(None, upload_to_r2, local_path)
        result["remote_key"] = remote_key

        removed = apply_retention()
        result["retention_removed"] = removed

        result["status"] = "success"
        result["finished_at"] = datetime.now(timezone.utc).isoformat()
        await audit_log("backup_automatic", "scheduler", None, result)
        logger.info(f"Backup complete: {result}")
    except Exception as e:  # noqa: BLE001
        result["status"] = "failed"
        result["error"] = str(e)
        result["finished_at"] = datetime.now(timezone.utc).isoformat()
        await audit_log("backup_failed", "scheduler", None, result)
        logger.error(f"Backup FAILED: {e}")
        await notify_failure(str(e))
    return result


async def run_weekly_email_backup() -> Dict[str, Any]:
    """Convenience wrapper used by the weekly scheduler."""
    return await run_backup(send_email_attachment=True)


# ================= STANDALONE RUN =================

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(run_backup())
