"""Lead Management — CRUD, scoring, sources, dashboard stats."""

import logging
import re
import uuid
from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field, EmailStr, field_validator
from slowapi import Limiter
from slowapi.util import get_remote_address

import config
from security import db, audit_log, require_crm_access, sanitize_text

logger = logging.getLogger("zebick.leads")
router = APIRouter(prefix="/api")
limiter = Limiter(key_func=get_remote_address, enabled=config.RATE_LIMIT_ENABLED)

LEAD_STATUS = ["new", "contacted", "meeting_scheduled", "offer_sent", "won", "lost"]
LEAD_SOURCES = ["website", "chatbot", "linkedin", "google_ads", "referral", "seo", "other"]


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# ============== Lead Scoring ==============

def compute_score(lead: Dict[str, Any]) -> int:
    """Simple lead scoring 0-100 based on budget, source, status, recency, completeness."""
    score = 0
    # Budget weighting (40 max)
    budget = lead.get("budget") or 0
    try:
        budget = float(budget)
    except (TypeError, ValueError):
        budget = 0
    if budget >= 50000:
        score += 40
    elif budget >= 20000:
        score += 30
    elif budget >= 10000:
        score += 22
    elif budget >= 5000:
        score += 15
    elif budget >= 1000:
        score += 8
    # Source weighting (20 max)
    src_weights = {
        "referral": 20, "linkedin": 15, "google_ads": 12, "website": 10,
        "seo": 10, "chatbot": 7, "other": 3,
    }
    score += src_weights.get(lead.get("source") or "other", 3)
    # Status weighting (20 max)
    status_weights = {
        "won": 20, "offer_sent": 15, "meeting_scheduled": 12,
        "contacted": 8, "new": 4, "lost": 0,
    }
    score += status_weights.get(lead.get("status") or "new", 0)
    # Completeness (10 max)
    fields = ["name", "email", "phone", "company", "service"]
    completed = sum(1 for f in fields if lead.get(f))
    score += completed * 2
    # Recency (10 max)
    try:
        ca = lead.get("created_at")
        if ca:
            ts = datetime.fromisoformat(ca.replace("Z", "+00:00"))
            days = (datetime.now(timezone.utc) - ts).days
            if days <= 1:
                score += 10
            elif days <= 7:
                score += 6
            elif days <= 30:
                score += 3
    except Exception:
        pass
    return min(100, max(0, int(score)))


# ============== Auto-capture from contact form / tool widgets ==============

async def create_lead_from_submission(
    *, name: str, email: str, phone: Optional[str], company: Optional[str],
    service: Optional[str], budget_str: Optional[str], message: Optional[str],
    origin_tag: str, request: Request,
) -> None:
    """Best-effort: turn a contact-form/tool submission into a CRM lead too.

    Never raises — a failure here must never affect the contact-form response
    the visitor actually waits on (same posture as the auto-reply/activity-log
    calls right next to this one in routes/public.py).
    """
    try:
        email_l = email.lower().strip()
        # Dedup: an identical email with a lead created in the last 5 minutes
        # is almost certainly a double-click/network retry, not a second real
        # inquiry — skip it. Anything older is a genuine new lead, even from
        # the same person (don't silently merge real repeat contacts).
        window_start = (datetime.now(timezone.utc) - timedelta(minutes=5)).isoformat()
        recent = await db.leads.find_one({"email": email_l, "created_at": {"$gte": window_start}})
        if recent:
            return

        budget: Optional[float] = None
        if budget_str:
            try:
                budget = float(budget_str)
            except (TypeError, ValueError):
                budget = None  # don't invent a number from unparseable input

        doc = {
            "id": str(uuid.uuid4()),
            "name": name, "email": email_l, "phone": phone, "company": company,
            "service": service, "budget": budget, "message": message,
            "status": "new", "source": "website", "tags": [origin_tag],
            "notes": None, "appointment_at": None, "assigned_to": None,
            "created_at": _now_iso(), "updated_at": _now_iso(),
            "created_by": "public",
        }
        doc["score"] = compute_score(doc)
        await db.leads.insert_one(doc)

        from routes.crm import log_activity
        await log_activity(
            "lead_created", f"Neuer Lead: {name}",
            description=f"Herkunft: {origin_tag}",
            actor="public", related_id=doc["id"], related_type="lead",
        )
        # Only an id + email in meta — never the message/phone/etc. in logs.
        await audit_log("lead_created", "public", request, {"id": doc["id"], "email": email_l})
    except Exception as e:  # noqa: BLE001
        logger.error(f"Lead creation from submission failed: {e}")


# ============== Models ==============

class LeadIn(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    company: Optional[str] = Field(None, max_length=200)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=60)
    service: Optional[str] = Field(None, max_length=120)
    budget: Optional[float] = Field(None, ge=0, le=10_000_000)
    message: Optional[str] = Field(None, max_length=5000)
    status: str = "new"
    source: str = "website"
    appointment_at: Optional[str] = Field(None, max_length=40)
    assigned_to: Optional[str] = Field(None, max_length=200)
    tags: List[str] = Field(default_factory=list)
    notes: Optional[str] = Field(None, max_length=10_000)

    @field_validator("name", "company", "service", "message", "notes")
    @classmethod
    def _clean(cls, v):
        return sanitize_text(v, 10000) if v else v

    @field_validator("status")
    @classmethod
    def _v_status(cls, v):
        if v not in LEAD_STATUS:
            raise ValueError(f"status must be one of {LEAD_STATUS}")
        return v

    @field_validator("source")
    @classmethod
    def _v_source(cls, v):
        if v not in LEAD_SOURCES:
            raise ValueError(f"source must be one of {LEAD_SOURCES}")
        return v


class PublicLeadIn(BaseModel):
    """Public lead-capture (e.g. chatbot, embed forms)."""
    name: str = Field(min_length=1, max_length=200)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=60)
    company: Optional[str] = Field(None, max_length=200)
    service: Optional[str] = Field(None, max_length=120)
    budget: Optional[float] = Field(None, ge=0, le=10_000_000)
    message: Optional[str] = Field(None, max_length=5000)
    source: str = "website"

    @field_validator("name", "company", "service", "message")
    @classmethod
    def _clean(cls, v):
        return sanitize_text(v, 5000) if v else v


# ============== Admin Endpoints ==============

@router.get("/admin/leads")
async def list_leads(
    status: Optional[str] = None,
    source: Optional[str] = None,
    q: Optional[str] = None,
    min_score: Optional[int] = None,
    skip: int = 0,
    limit: int = 200,
    current: dict = Depends(require_crm_access),
):
    query: Dict[str, Any] = {}
    if status:
        query["status"] = status
    if source:
        query["source"] = source
    if q:
        q_safe = re.escape(q[:200])
        query["$or"] = [
            {"name": {"$regex": q_safe, "$options": "i"}},
            {"email": {"$regex": q_safe, "$options": "i"}},
            {"company": {"$regex": q_safe, "$options": "i"}},
        ]
    if min_score is not None:
        # Filters on the score persisted at create/update time; the score shown
        # below is recomputed and its recency part (max 10) decays over time.
        query["score"] = {"$gte": min_score}
    total = await db.leads.count_documents(query)
    rows = await db.leads.find(query, {"_id": 0}).sort("created_at", -1)         .skip(max(0, skip)).limit(min(max(1, limit), 500)).to_list(500)
    # Recompute score on fly (cheap)
    for r in rows:
        r["score"] = compute_score(r)
    return {"total": total, "leads": rows}


@router.get("/admin/leads/dashboard")
async def leads_dashboard(current: dict = Depends(require_crm_access)):
    by_status = {s: 0 for s in LEAD_STATUS}
    by_source = {s: 0 for s in LEAD_SOURCES}
    total = 0
    # A missing status counts as "new"; an explicit null counts nowhere.
    status_expr = {"$cond": [{"$eq": [{"$type": "$status"}, "missing"]}, "new", "$status"]}
    async for g in db.leads.aggregate([
        {"$group": {"_id": {"status": status_expr, "source": "$source"}, "count": {"$sum": 1}}},
    ]):
        total += g["count"]
        st, src = g["_id"]["status"], g["_id"].get("source")
        if st in by_status:
            by_status[st] += g["count"]
        by_source[src if src in by_source else "other"] += g["count"]
    won = by_status["won"]

    # Score is time-dependent (recency), so it's recomputed per lead. Streamed
    # with a narrow projection instead of loading the collection into a list.
    score_fields = {"_id": 0, "budget": 1, "source": 1, "status": 1, "name": 1,
                    "email": 1, "phone": 1, "company": 1, "service": 1, "created_at": 1}
    score_sum = 0
    qualified = 0  # score >= 50 OR status in {meeting_scheduled, offer_sent, won}
    async for r in db.leads.find({}, score_fields):
        sc = compute_score(r)
        score_sum += sc
        if r.get("status", "new") in ("meeting_scheduled", "offer_sent", "won") or sc >= 50:
            qualified += 1
    conversion_rate = round((won / total) * 100, 1) if total else 0.0
    avg_score = round(score_sum / total, 1) if total else 0.0

    # Recent timeline (last 30 days, daily count)
    now = datetime.now(timezone.utc)
    days = [(now - timedelta(days=i)).date().isoformat() for i in range(29, -1, -1)]
    per_day = {
        g["_id"]: g["count"]
        async for g in db.leads.aggregate([
            {"$match": {"created_at": {"$gte": days[0]}}},
            {"$group": {"_id": {"$substrCP": ["$created_at", 0, 10]}, "count": {"$sum": 1}}},
        ])
    }
    timeline = [{"date": d, "count": per_day.get(d, 0)} for d in days]
    return {
        "total": total,
        "new": by_status["new"],
        "qualified": qualified,
        "won": won,
        "lost": by_status["lost"],
        "conversion_rate": conversion_rate,
        "avg_score": avg_score,
        "by_status": by_status,
        "by_source": by_source,
        "timeline": timeline,
    }


@router.post("/admin/leads")
async def create_lead(
    payload: LeadIn, request: Request,
    current: dict = Depends(require_crm_access),
):
    doc = {
        "id": str(uuid.uuid4()),
        **payload.model_dump(),
        "created_at": _now_iso(),
        "updated_at": _now_iso(),
        "created_by": current.get("email"),
    }
    doc["score"] = compute_score(doc)
    await db.leads.insert_one(doc)
    await audit_log("lead_created", current.get("email"), request, {"id": doc["id"], "email": doc["email"]})
    doc.pop("_id", None)
    return doc


@router.get("/admin/leads/{lid}")
async def get_lead(lid: str, current: dict = Depends(require_crm_access)):
    doc = await db.leads.find_one({"id": lid}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Lead nicht gefunden")
    doc["score"] = compute_score(doc)
    return doc


@router.patch("/admin/leads/{lid}")
async def update_lead(
    lid: str, payload: LeadIn, request: Request,
    current: dict = Depends(require_crm_access),
):
    updates = payload.model_dump(exclude_unset=True)
    updates["updated_at"] = _now_iso()
    # Merge to recompute score
    existing = await db.leads.find_one({"id": lid}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Lead nicht gefunden")
    merged = {**existing, **updates}
    updates["score"] = compute_score(merged)
    await db.leads.update_one({"id": lid}, {"$set": updates})
    await audit_log("lead_updated", current.get("email"), request, {"id": lid, "fields": list(updates.keys())})
    return {"message": "Aktualisiert", "id": lid, "score": updates["score"]}


@router.delete("/admin/leads/{lid}")
async def delete_lead(
    lid: str, request: Request, current: dict = Depends(require_crm_access),
):
    res = await db.leads.delete_one({"id": lid})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Lead nicht gefunden")
    await audit_log("lead_deleted", current.get("email"), request, {"id": lid})
    return {"message": "Gelöscht"}


@router.post("/admin/leads/{lid}/convert-to-customer")
async def convert_to_customer(
    lid: str, request: Request, current: dict = Depends(require_crm_access),
):
    lead = await db.leads.find_one({"id": lid}, {"_id": 0})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead nicht gefunden")
    # Check existing customer by email
    existing = await db.customers.find_one({"email": lead["email"]}, {"_id": 0})
    if existing:
        cust_id = existing["id"]
    else:
        cust_id = str(uuid.uuid4())
        await db.customers.insert_one({
            "id": cust_id,
            "name": lead["name"],
            "email": lead["email"],
            "phone": lead.get("phone"),
            "company": lead.get("company"),
            "address": "",
            "notes": lead.get("notes") or "",
            "tags": lead.get("tags") or [],
            "source": lead.get("source"),
            "created_at": _now_iso(),
            "updated_at": _now_iso(),
        })
    await db.leads.update_one({"id": lid}, {"$set": {"status": "won", "customer_id": cust_id, "updated_at": _now_iso()}})
    await audit_log("lead_converted", current.get("email"), request, {"id": lid, "customer_id": cust_id})
    return {"message": "Konvertiert", "customer_id": cust_id}


# ============== Public capture ==============

@router.post("/leads/capture")
@limiter.limit("10/minute")
async def capture_lead(payload: PublicLeadIn, request: Request):
    """Public endpoint — any external form (website, chatbot, embed) can post leads here."""
    if payload.source not in LEAD_SOURCES:
        raise HTTPException(status_code=400, detail="Unbekannte Quelle")
    doc = {
        "id": str(uuid.uuid4()),
        **payload.model_dump(),
        "status": "new",
        "created_at": _now_iso(),
        "updated_at": _now_iso(),
        "captured_ip": (request.client.host if request.client else None),
    }
    doc["score"] = compute_score(doc)
    await db.leads.insert_one(doc)
    # Optional auto-email confirmation (best effort)
    try:
        from services import send_email
        settings = await db.site_settings.find_one({"id": "global"}, {"_id": 0}) or {}
        company = settings.get("company_name") or "Zebick"
        await send_email(
            payload.email,
            f"Vielen Dank für deine Anfrage – {company}",
            f"<p>Hallo {payload.name},</p><p>vielen Dank für deine Anfrage. Wir melden uns innerhalb von 24 Stunden.</p><p>Dein {company}-Team</p>",
        )
    except Exception as e:  # noqa: BLE001
        logger.info(f"Lead auto-email skipped: {e}")
    return {"message": "Anfrage gespeichert", "id": doc["id"]}
