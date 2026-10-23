"""Admin backup overview + on-demand backup trigger."""
from __future__ import annotations

import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

import config
from security import require_superadmin
from scripts.backup import BACKUP_DIR, run_backup

logger = logging.getLogger("zebick.backups")
router = APIRouter(prefix="/api")
limiter = Limiter(key_func=get_remote_address, enabled=config.RATE_LIMIT_ENABLED)


def _list_files():
    files = sorted(BACKUP_DIR.glob("zebick-*.json"), reverse=True)
    out = []
    for f in files:
        try:
            st = f.stat()
            out.append({
                "name": f.name,
                "size_bytes": st.st_size,
                "modified_at": datetime.fromtimestamp(st.st_mtime, tz=timezone.utc).isoformat(),
            })
        except OSError:
            continue
    return out


@router.get("/admin/backups")
async def list_backups(admin=Depends(require_superadmin)):
    files = _list_files()
    total = sum(f["size_bytes"] for f in files)
    return {
        "backups": files,
        "count": len(files),
        "total_size_bytes": total,
        "last_backup": files[0] if files else None,
        "schedule": "Täglich um 03:00 Uhr (automatisch)",
        "location": str(BACKUP_DIR),
    }


@router.post("/admin/backups/run")
@limiter.limit("3/minute")
async def trigger_backup(request: Request, admin=Depends(require_superadmin)):
    """Run a full backup right now."""
    try:
        result = await run_backup()
    except Exception as e:  # noqa: BLE001
        logger.error(f"Manual backup failed: {e}")
        raise HTTPException(status_code=500, detail=f"Backup fehlgeschlagen: {e}")
    return {
        "status": result.get("status"),
        "local_path": result.get("local_path"),
        "size_bytes": result.get("size_bytes"),
        "collections": result.get("collections", {}),
        "finished_at": result.get("finished_at"),
    }
