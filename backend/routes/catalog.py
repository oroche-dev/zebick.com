"""Service catalog (Categories + Services/Leistungen) + Settings + Chatbot Q&A."""

import logging
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field, ConfigDict, field_validator

from security import db, audit_log, get_current_user, require_crm_access, sanitize_text

logger = logging.getLogger("zebick.catalog")
router = APIRouter(prefix="/api")


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# ============== Models ==============

class CategoryIn(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    slug: Optional[str] = Field(None, max_length=120)
    description: Optional[str] = Field(None, max_length=2000)
    icon: Optional[str] = Field(None, max_length=80)  # lucide icon name
    image: Optional[str] = Field(None, max_length=5_000_000)  # data URI or URL
    color: Optional[str] = Field(None, max_length=20)
    order: int = 0
    is_active: bool = True

    @field_validator("name", "description", "icon", "color")
    @classmethod
    def _strip_html(cls, v):
        return sanitize_text(v, 4000) if v else v


class ServiceIn(BaseModel):
    category_id: str = Field(min_length=1, max_length=80)
    title: str = Field(min_length=1, max_length=200)
    slug: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = Field(None, max_length=4000)
    price_from: Optional[float] = Field(None, ge=0, le=10_000_000)
    duration: Optional[str] = Field(None, max_length=100)
    image: Optional[str] = Field(None, max_length=5_000_000)
    icon: Optional[str] = Field(None, max_length=80)
    benefits: List[str] = Field(default_factory=list)
    faqs: List[Dict[str, str]] = Field(default_factory=list)
    cta_label: Optional[str] = Field(None, max_length=80)
    cta_url: Optional[str] = Field(None, max_length=400)
    order: int = 0
    is_active: bool = True

    @field_validator("title", "description", "duration", "cta_label", "cta_url")
    @classmethod
    def _strip_html(cls, v):
        return sanitize_text(v, 4000) if v else v


def _slugify(text: str) -> str:
    import re
    s = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return s or uuid.uuid4().hex[:8]


# ============== CATEGORIES (admin) ==============

@router.get("/admin/categories")
async def admin_list_categories(current: dict = Depends(get_current_user)):
    rows = await db.categories.find({}, {"_id": 0}).sort("order", 1).to_list(500)
    return {"total": len(rows), "categories": rows}


@router.post("/admin/categories")
async def admin_create_category(
    payload: CategoryIn, request: Request,
    current: dict = Depends(get_current_user),
):
    slug = payload.slug or _slugify(payload.name)
    if await db.categories.find_one({"slug": slug}):
        slug = f"{slug}-{uuid.uuid4().hex[:6]}"
    doc = {
        "id": str(uuid.uuid4()),
        **payload.model_dump(),
        "slug": slug,
        "created_at": _now_iso(),
        "updated_at": _now_iso(),
    }
    await db.categories.insert_one(doc)
    await audit_log("category_created", current.get("email"), request, {"id": doc["id"]})
    doc.pop("_id", None)
    return doc


@router.patch("/admin/categories/{cat_id}")
async def admin_update_category(
    cat_id: str, payload: CategoryIn, request: Request,
    current: dict = Depends(get_current_user),
):
    updates = payload.model_dump(exclude_unset=True)
    updates["updated_at"] = _now_iso()
    res = await db.categories.update_one({"id": cat_id}, {"$set": updates})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Kategorie nicht gefunden")
    await audit_log("category_updated", current.get("email"), request, {"id": cat_id})
    return {"message": "Aktualisiert", "id": cat_id}


@router.delete("/admin/categories/{cat_id}")
async def admin_delete_category(
    cat_id: str, request: Request,
    current: dict = Depends(get_current_user),
):
    res = await db.categories.delete_one({"id": cat_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Kategorie nicht gefunden")
    # cascade: deactivate services
    await db.services_catalog.update_many({"category_id": cat_id}, {"$set": {"is_active": False}})
    await audit_log("category_deleted", current.get("email"), request, {"id": cat_id})
    return {"message": "Gelöscht", "id": cat_id}


@router.post("/admin/categories/reorder")
async def admin_reorder_categories(
    payload: Dict[str, List[str]], request: Request,
    current: dict = Depends(get_current_user),
):
    """Body: { "order": ["catid1", "catid2", ...] }"""
    order = payload.get("order", [])
    for i, cid in enumerate(order):
        await db.categories.update_one({"id": cid}, {"$set": {"order": i, "updated_at": _now_iso()}})
    await audit_log("categories_reordered", current.get("email"), request, {"count": len(order)})
    return {"message": "Reihenfolge aktualisiert"}


# ============== SERVICES (admin) ==============

@router.get("/admin/services")
async def admin_list_services(
    category_id: Optional[str] = None,
    current: dict = Depends(get_current_user),
):
    q = {}
    if category_id:
        q["category_id"] = category_id
    rows = await db.services_catalog.find(q, {"_id": 0}).sort("order", 1).to_list(1000)
    return {"total": len(rows), "services": rows}


@router.post("/admin/services")
async def admin_create_service(
    payload: ServiceIn, request: Request,
    current: dict = Depends(get_current_user),
):
    if not await db.categories.find_one({"id": payload.category_id}):
        raise HTTPException(status_code=400, detail="Kategorie existiert nicht")
    slug = payload.slug or _slugify(payload.title)
    if await db.services_catalog.find_one({"slug": slug}):
        slug = f"{slug}-{uuid.uuid4().hex[:6]}"
    doc = {
        "id": str(uuid.uuid4()),
        **payload.model_dump(),
        "slug": slug,
        "created_at": _now_iso(),
        "updated_at": _now_iso(),
    }
    await db.services_catalog.insert_one(doc)
    await audit_log("service_created", current.get("email"), request, {"id": doc["id"]})
    doc.pop("_id", None)
    return doc


@router.patch("/admin/services/{sid}")
async def admin_update_service(
    sid: str, payload: ServiceIn, request: Request,
    current: dict = Depends(get_current_user),
):
    updates = payload.model_dump(exclude_unset=True)
    updates["updated_at"] = _now_iso()
    res = await db.services_catalog.update_one({"id": sid}, {"$set": updates})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Leistung nicht gefunden")
    await audit_log("service_updated", current.get("email"), request, {"id": sid})
    return {"message": "Aktualisiert", "id": sid}


@router.delete("/admin/services/{sid}")
async def admin_delete_service(
    sid: str, request: Request,
    current: dict = Depends(get_current_user),
):
    res = await db.services_catalog.delete_one({"id": sid})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Leistung nicht gefunden")
    await audit_log("service_deleted", current.get("email"), request, {"id": sid})
    return {"message": "Gelöscht", "id": sid}


@router.post("/admin/services/reorder")
async def admin_reorder_services(
    payload: Dict[str, List[str]], request: Request,
    current: dict = Depends(get_current_user),
):
    order = payload.get("order", [])
    for i, sid in enumerate(order):
        await db.services_catalog.update_one({"id": sid}, {"$set": {"order": i, "updated_at": _now_iso()}})
    await audit_log("services_reordered", current.get("email"), request, {"count": len(order)})
    return {"message": "Reihenfolge aktualisiert"}


# ============== Public catalog ==============

@router.get("/catalog/categories")
async def public_categories():
    rows = await db.categories.find({"is_active": True}, {"_id": 0}).sort("order", 1).to_list(500)
    return {"total": len(rows), "categories": rows}


@router.get("/catalog/services")
async def public_services(category_slug: Optional[str] = None):
    q = {"is_active": True}
    if category_slug:
        cat = await db.categories.find_one({"slug": category_slug, "is_active": True})
        if not cat:
            return {"total": 0, "services": []}
        q["category_id"] = cat["id"]
    rows = await db.services_catalog.find(q, {"_id": 0}).sort("order", 1).to_list(1000)
    return {"total": len(rows), "services": rows}


# ============== SETTINGS (Site-wide config) ==============

class SiteSettings(BaseModel):
    company_name: Optional[str] = Field(None, max_length=200)
    logo_url: Optional[str] = Field(None, max_length=5_000_000)
    primary_color: Optional[str] = Field(None, max_length=20)
    secondary_color: Optional[str] = Field(None, max_length=20)
    language: Optional[str] = Field(None, max_length=10)
    contact_email: Optional[str] = Field(None, max_length=200)
    contact_phone: Optional[str] = Field(None, max_length=80)
    whatsapp_link: Optional[str] = Field(None, max_length=400)
    social_facebook: Optional[str] = Field(None, max_length=400)
    social_instagram: Optional[str] = Field(None, max_length=400)
    social_linkedin: Optional[str] = Field(None, max_length=400)
    social_twitter: Optional[str] = Field(None, max_length=400)
    social_youtube: Optional[str] = Field(None, max_length=400)
    social_github: Optional[str] = Field(None, max_length=400)
    social_tiktok: Optional[str] = Field(None, max_length=400)
    social_xing: Optional[str] = Field(None, max_length=400)
    impressum_text: Optional[str] = Field(None, max_length=50_000)
    datenschutz_text: Optional[str] = Field(None, max_length=200_000)


SETTINGS_DOC_ID = "global"


@router.get("/admin/settings")
async def admin_get_settings(current: dict = Depends(get_current_user)):
    doc = await db.site_settings.find_one({"id": SETTINGS_DOC_ID}, {"_id": 0})
    return doc or {"id": SETTINGS_DOC_ID}


@router.put("/admin/settings")
async def admin_update_settings(
    payload: SiteSettings, request: Request,
    current: dict = Depends(get_current_user),
):
    updates = payload.model_dump(exclude_unset=True)
    updates["updated_at"] = _now_iso()
    await db.site_settings.update_one(
        {"id": SETTINGS_DOC_ID},
        {"$set": updates, "$setOnInsert": {"id": SETTINGS_DOC_ID, "created_at": _now_iso()}},
        upsert=True,
    )
    await audit_log("settings_updated", current.get("email"), request, {"fields": list(updates.keys())})
    return {"message": "Einstellungen aktualisiert"}


@router.get("/settings/public")
async def public_settings():
    """Non-sensitive settings for frontend."""
    doc = await db.site_settings.find_one({"id": SETTINGS_DOC_ID}, {"_id": 0}) or {}
    safe = {k: v for k, v in doc.items() if k not in ("impressum_text",) or v}
    return safe


# ============== CHATBOT Q&A ==============

class ChatQAIn(BaseModel):
    question: str = Field(min_length=1, max_length=500)
    answer: str = Field(min_length=1, max_length=5000)
    keywords: List[str] = Field(default_factory=list)
    is_active: bool = True
    order: int = 0

    @field_validator("question", "answer")
    @classmethod
    def _strip_html(cls, v):
        return sanitize_text(v, 5000) if v else v


@router.get("/admin/chatbot/qa")
async def admin_list_qa(current: dict = Depends(get_current_user)):
    rows = await db.chatbot_qa.find({}, {"_id": 0}).sort("order", 1).to_list(500)
    return {"total": len(rows), "qa": rows}


@router.post("/admin/chatbot/qa")
async def admin_create_qa(
    payload: ChatQAIn, request: Request, current: dict = Depends(get_current_user),
):
    doc = {"id": str(uuid.uuid4()), **payload.model_dump(),
           "created_at": _now_iso(), "updated_at": _now_iso()}
    await db.chatbot_qa.insert_one(doc)
    await audit_log("chatbot_qa_created", current.get("email"), request, {"id": doc["id"]})
    doc.pop("_id", None)
    return doc


@router.patch("/admin/chatbot/qa/{qid}")
async def admin_update_qa(
    qid: str, payload: ChatQAIn, request: Request,
    current: dict = Depends(get_current_user),
):
    updates = payload.model_dump(exclude_unset=True)
    updates["updated_at"] = _now_iso()
    res = await db.chatbot_qa.update_one({"id": qid}, {"$set": updates})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Q&A nicht gefunden")
    await audit_log("chatbot_qa_updated", current.get("email"), request, {"id": qid})
    return {"message": "Aktualisiert"}


@router.delete("/admin/chatbot/qa/{qid}")
async def admin_delete_qa(
    qid: str, request: Request, current: dict = Depends(get_current_user),
):
    res = await db.chatbot_qa.delete_one({"id": qid})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Q&A nicht gefunden")
    await audit_log("chatbot_qa_deleted", current.get("email"), request, {"id": qid})
    return {"message": "Gelöscht"}


@router.get("/admin/chatbot/config")
async def admin_chatbot_config(current: dict = Depends(get_current_user)):
    doc = await db.chatbot_config.find_one({"id": "global"}, {"_id": 0})
    return doc or {"id": "global", "enabled": True, "welcome_message": "Hallo! Wie kann ich helfen?"}


class ChatbotConfigIn(BaseModel):
    enabled: bool = True
    welcome_message: Optional[str] = Field(None, max_length=1000)
    fallback_message: Optional[str] = Field(None, max_length=1000)


@router.put("/admin/chatbot/config")
async def admin_chatbot_config_update(
    payload: ChatbotConfigIn, request: Request,
    current: dict = Depends(get_current_user),
):
    updates = payload.model_dump(exclude_unset=True)
    updates["updated_at"] = _now_iso()
    await db.chatbot_config.update_one(
        {"id": "global"},
        {"$set": updates, "$setOnInsert": {"id": "global", "created_at": _now_iso()}},
        upsert=True,
    )
    await audit_log("chatbot_config_updated", current.get("email"), request)
    return {"message": "Konfiguration aktualisiert"}


@router.get("/admin/chatbot/leads")
async def admin_chatbot_leads(current: dict = Depends(require_crm_access)):
    rows = await db.chatbot_leads.find({}, {"_id": 0}).sort("created_at", -1).limit(500).to_list(500)
    return {"total": len(rows), "leads": rows}


@router.get("/admin/chatbot/conversations")
async def admin_chatbot_conversations(current: dict = Depends(require_crm_access)):
    rows = await db.chat_history.find({}, {"_id": 0}).sort("timestamp", -1).limit(200).to_list(200)
    return {"total": len(rows), "conversations": rows}
