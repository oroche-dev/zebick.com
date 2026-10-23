"""File upload endpoint — uploads to Cloudflare R2 when configured (R2_* env
vars, same ones scripts/backup.py uses), otherwise falls back to local disk
under backend/uploads/. R2 is recommended for blog/portfolio images: they end
up embedded in public pages, so they need a stable public URL that survives
a redeploy — a VPS/Render disk works too, but R2 needs no persistent disk at
all and serves images off Cloudflare's CDN instead of the app server.
"""

import os
import uuid
import mimetypes
from pathlib import Path
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Request
from fastapi.responses import FileResponse

from security import db, audit_log, get_current_user

router = APIRouter(prefix="/api")

UPLOAD_DIR = Path(__file__).resolve().parent.parent / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def _r2_client():
    """Same credentials/pattern as scripts.backup.upload_to_r2. Returns
    (client, bucket, public_url) or None if R2 isn't configured."""
    access_key = os.environ.get("R2_ACCESS_KEY_ID")
    secret_key = os.environ.get("R2_SECRET_ACCESS_KEY")
    endpoint = os.environ.get("R2_ENDPOINT_URL")
    bucket = os.environ.get("R2_BUCKET")
    public_url = os.environ.get("R2_PUBLIC_URL")
    if not all([access_key, secret_key, endpoint, bucket, public_url]):
        return None
    import boto3
    from botocore.config import Config as BotoConfig
    client = boto3.client(
        "s3",
        endpoint_url=endpoint,
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        config=BotoConfig(signature_version="s3v4"),
        region_name="auto",
    )
    return client, bucket, public_url.rstrip("/")

MAX_BYTES = 25 * 1024 * 1024  # 25 MB
# .svg is deliberately excluded: an SVG can embed <script> and is served back
# to an unauthenticated GET with its real content-type, so an uploaded
# malicious SVG would execute script when opened directly (stored XSS). Raster
# formats (.png/.jpg/.webp/.gif) don't have this problem.
ALLOWED_EXT = {
    ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt", ".csv", ".md",
    ".png", ".jpg", ".jpeg", ".webp", ".gif",
    ".zip", ".rar", ".7z",
    ".mp3", ".mp4", ".mov", ".wav",
    ".json", ".xml",
}


@router.post("/admin/uploads")
async def upload_file(
    request: Request,
    file: UploadFile = File(...),
    current: dict = Depends(get_current_user),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Datei fehlt")
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXT:
        raise HTTPException(status_code=400, detail=f"Dateityp nicht erlaubt: {ext or '(ohne Endung)'}")
    # Read in chunks and bail out as soon as the cap is exceeded, instead of
    # buffering an arbitrarily large body into memory before checking its size.
    chunks = []
    total = 0
    while True:
        chunk = await file.read(1024 * 1024)
        if not chunk:
            break
        total += len(chunk)
        if total > MAX_BYTES:
            raise HTTPException(status_code=413, detail="Datei zu groß (max 25 MB)")
        chunks.append(chunk)
    content = b"".join(chunks)

    file_id = uuid.uuid4().hex
    safe_name = "".join(c for c in (file.filename or "file") if c.isalnum() or c in "._-")[-120:] or "file"
    stored_name = f"{file_id}_{safe_name}"
    content_type = mimetypes.guess_type(file.filename)[0] or "application/octet-stream"

    meta = {
        "id": file_id,
        "name": file.filename,
        "stored_name": stored_name,
        "size": len(content),
        # Derived from the (already extension-allowlisted) filename only — never trust
        # the client-supplied Content-Type header, which lets an attacker store e.g. a
        # .png with body text/html and have it served back as text/html later.
        "content_type": content_type,
        "uploaded_by": current.get("email"),
        "uploaded_at": datetime.now(timezone.utc).isoformat(),
    }

    r2 = _r2_client()
    if r2:
        client, bucket, public_url = r2
        key = f"uploads/{stored_name}"
        client.put_object(Bucket=bucket, Key=key, Body=content, ContentType=content_type)
        meta["storage"] = "r2"
        meta["r2_key"] = key
        url = f"{public_url}/{key}"
    else:
        target = UPLOAD_DIR / stored_name
        with open(target, "wb") as fh:
            fh.write(content)
        meta["storage"] = "local"
        # Images need to work in a plain public <img src>, which can't send an
        # Authorization header — serve those from the unauthenticated route.
        # Non-image files (CRM/project attachments) stay behind auth.
        url = f"/api/uploads/public/{file_id}" if content_type.startswith("image/") else f"/api/uploads/{file_id}"

    await db.uploads.insert_one(meta.copy())
    await audit_log("file_uploaded", current.get("email"), request, {"id": file_id, "name": file.filename, "size": meta["size"]})
    return {**meta, "url": url}


@router.get("/uploads/public/{file_id}")
async def get_upload_public(file_id: str):
    """Unauthenticated — only ever serves files whose stored content_type is
    an image, for embedding in public blog/portfolio pages. Everything else
    (PDFs, docs, …) stays behind get_upload below."""
    meta = await db.uploads.find_one({"id": file_id}, {"_id": 0})
    if not meta or not meta.get("content_type", "").startswith("image/"):
        raise HTTPException(status_code=404, detail="Datei nicht gefunden")
    path = UPLOAD_DIR / meta["stored_name"]
    if not path.exists():
        raise HTTPException(status_code=404, detail="Datei nicht auf Disk")
    return FileResponse(path, media_type=meta.get("content_type", "application/octet-stream"))


@router.get("/uploads/{file_id}")
async def get_upload(file_id: str, current: dict = Depends(get_current_user)):
    meta = await db.uploads.find_one({"id": file_id}, {"_id": 0})
    if not meta:
        raise HTTPException(status_code=404, detail="Datei nicht gefunden")
    path = UPLOAD_DIR / meta["stored_name"]
    if not path.exists():
        raise HTTPException(status_code=404, detail="Datei nicht auf Disk")
    return FileResponse(path, media_type=meta.get("content_type", "application/octet-stream"), filename=meta.get("name", "file"))


@router.delete("/admin/uploads/{file_id}")
async def delete_upload(
    file_id: str, request: Request, current: dict = Depends(get_current_user),
):
    meta = await db.uploads.find_one({"id": file_id}, {"_id": 0})
    if not meta:
        raise HTTPException(status_code=404, detail="Nicht gefunden")
    if meta.get("storage") == "r2":
        r2 = _r2_client()
        if r2:
            client, bucket, _ = r2
            client.delete_object(Bucket=bucket, Key=meta["r2_key"])
    else:
        try:
            os.remove(UPLOAD_DIR / meta["stored_name"])
        except FileNotFoundError:
            pass
    await db.uploads.delete_one({"id": file_id})
    await audit_log("file_deleted", current.get("email"), request, {"id": file_id})
    return {"message": "Gelöscht"}
