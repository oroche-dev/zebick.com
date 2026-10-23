"""Background scheduler for automated tasks (backups, cleanup).

Uses APScheduler AsyncIOScheduler — runs in the same event loop as FastAPI.
"""

import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from scripts.backup import run_backup, run_weekly_email_backup
from scripts.inbox_fetch import fetch_new_emails

logger = logging.getLogger("zebick.scheduler")

_scheduler: AsyncIOScheduler | None = None


def start_scheduler() -> None:
    global _scheduler
    if _scheduler and _scheduler.running:
        return
    _scheduler = AsyncIOScheduler(timezone="UTC")
    # Daily backup at 03:00 UTC (local only)
    _scheduler.add_job(
        run_backup,
        CronTrigger(hour=3, minute=0),
        id="daily_backup",
        name="Daily local backup",
        replace_existing=True,
        max_instances=1,
        misfire_grace_time=3600,
    )
    # Weekly email backup every Sunday at 03:15 UTC
    _scheduler.add_job(
        run_weekly_email_backup,
        CronTrigger(day_of_week="sun", hour=3, minute=15),
        id="weekly_email_backup",
        name="Weekly email backup",
        replace_existing=True,
        max_instances=1,
        misfire_grace_time=3600,
    )
    # Inbox IMAP fetch every 5 minutes (skips silently if not configured)
    _scheduler.add_job(
        fetch_new_emails,
        CronTrigger(minute="*/5"),
        id="inbox_fetch",
        name="IMAP inbox fetch",
        replace_existing=True,
        max_instances=1,
        misfire_grace_time=240,
    )
    _scheduler.start()
    logger.info("Scheduler started — daily backup 03:00, weekly email 03:15 Sun, inbox every 5 min (all UTC)")


def stop_scheduler() -> None:
    global _scheduler
    if _scheduler and _scheduler.running:
        _scheduler.shutdown(wait=False)
        logger.info("Scheduler stopped")
