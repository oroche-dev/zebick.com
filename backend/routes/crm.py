"""CRM endpoints (admin-only): Customers, Funnel/Pipeline, Activity Feed, Dashboard Overview.

Phase 1 — Sales & Leads.
"""

import logging
import re
from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Request

from security import db, audit_log, require_crm_access, sanitize_text
from models import (
    CustomerCreate, CustomerUpdate, Customer,
    ContactStatusUpdate, Activity,
)

logger = logging.getLogger("zebick.crm")
router = APIRouter(prefix="/api")

# Funnel pipeline order (used for grouping + UI)
FUNNEL_STAGES = ["new", "contacted", "offer_sent", "won", "lost"]
FUNNEL_LABELS = {
    "new": "Neue Anfrage",
    "contacted": "Kontaktiert",
    "offer_sent": "Angebot gesendet",
    "won": "Gewonnen",
    "lost": "Verloren",
}


async def log_activity(
    activity_type: str,
    title: str,
    description: Optional[str] = None,
    actor: Optional[str] = None,
    related_id: Optional[str] = None,
    related_type: Optional[str] = None,
) -> None:
    """Insert an activity feed entry."""
    activity = Activity(
        type=activity_type, title=title, description=description,
        actor=actor or "system",
        related_id=related_id, related_type=related_type,
    )
    doc = activity.model_dump()
    doc["timestamp"] = doc["timestamp"].isoformat()
    try:
        await db.activities.insert_one(doc)
    except Exception as e:  # noqa: BLE001
        logger.error(f"Activity log failed: {e}")


def _parse_budget_avg(budget_str: Optional[str]) -> float:
    """Parse strings like '5k-10k' or '50k+' into an EUR average estimate."""
    if not budget_str:
        return 0.0
    s = budget_str.lower().replace(" ", "").replace("€", "").replace(".", "")
    try:
        if "+" in s:
            return float(s.replace("k", "").replace("+", "")) * 1000
        if "-" in s:
            a, b = s.split("-", 1)
            av = float(a.replace("k", "")) * (1000 if "k" in a else 1)
            bv = float(b.replace("k", "")) * (1000 if "k" in b else 1)
            return (av + bv) / 2
        return float(s.replace("k", "")) * (1000 if "k" in s else 1)
    except Exception:  # noqa: BLE001
        return 0.0


async def _stage_totals(statuses: List[str]) -> Dict[str, tuple]:
    """{status: (count, value)} for contact_forms, computed server-side.

    Value prefers a truthy deal_value, else the parsed budget estimate. Budget
    strings can't be parsed in Mongo, so rows without a deal_value are grouped
    by their (low-cardinality) budget string and parsed once per group here.
    """
    no_deal = {"$in": [{"$ifNull": ["$deal_value", 0]}, [0, "", False]]}
    pipe = [
        {"$match": {"status": {"$in": statuses}}},
        {"$group": {
            "_id": {
                "status": "$status",
                "budget": {"$cond": [no_deal, {"$ifNull": ["$budget", None]}, None]},
                "no_deal": no_deal,
            },
            "count": {"$sum": 1},
            "deal_sum": {"$sum": {"$cond": [no_deal, 0, {"$convert": {
                "input": "$deal_value", "to": "double", "onError": 0, "onNull": 0}}]}},
        }},
    ]
    totals = {st: [0, 0.0] for st in statuses}
    async for g in db.contact_forms.aggregate(pipe):
        t = totals[g["_id"]["status"]]
        t[0] += g["count"]
        t[1] += g["deal_sum"]
        if g["_id"]["no_deal"]:
            t[1] += g["count"] * _parse_budget_avg(g["_id"].get("budget"))
    return {st: (c, v) for st, (c, v) in totals.items()}


# ================= FUNNEL / PIPELINE =================

@router.get("/admin/funnel/overview")
async def funnel_overview(current: dict = Depends(require_crm_access)):
    """Return pipeline counts + deal value per stage."""
    stage_totals = await _stage_totals(FUNNEL_STAGES)
    stages = []
    total_pipeline = 0.0
    total_won = 0.0
    for stage in FUNNEL_STAGES:
        count, value = stage_totals[stage]
        stages.append({
            "key": stage,
            "label": FUNNEL_LABELS[stage],
            "count": count,
            "value": round(value, 2),
        })
        if stage == "won":
            total_won = value
        elif stage in ("new", "contacted", "offer_sent"):
            total_pipeline += value

    # Conversion rate: won / (won + lost + offer_sent + contacted + new) ratio
    total_all = sum(s["count"] for s in stages)
    won_count = next((s["count"] for s in stages if s["key"] == "won"), 0)
    conversion = round((won_count / total_all * 100) if total_all else 0, 1)

    return {
        "stages": stages,
        "total_pipeline_value": round(total_pipeline, 2),
        "total_won_value": round(total_won, 2),
        "total_requests": total_all,
        "conversion_rate": conversion,
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }


# ================= DASHBOARD OVERVIEW =================

@router.get("/admin/dashboard/overview")
async def dashboard_overview(current: dict = Depends(require_crm_access)):
    """One-shot dashboard data: today's stats, pipeline, recent activities."""
    now = datetime.now(timezone.utc)
    today_iso = now.replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
    seven_days_ago = (now - timedelta(days=7)).isoformat()
    thirty_days_ago = (now - timedelta(days=30)).isoformat()

    # New requests today / week / month
    new_today = await db.contact_forms.count_documents({"submitted_at": {"$gte": today_iso}})
    new_week = await db.contact_forms.count_documents({"submitted_at": {"$gte": seven_days_ago}})
    new_month = await db.contact_forms.count_documents({"submitted_at": {"$gte": thirty_days_ago}})

    # Open requests by status
    new_count = await db.contact_forms.count_documents({"status": "new"})
    contacted = await db.contact_forms.count_documents({"status": "contacted"})
    offer_sent = await db.contact_forms.count_documents({"status": "offer_sent"})
    won = await db.contact_forms.count_documents({"status": "won"})
    lost = await db.contact_forms.count_documents({"status": "lost"})

    # Revenue (sum of deal_value on won + fallback budget parse) and
    # open pipeline value (new + contacted + offer_sent)
    totals = await _stage_totals(["won", "new", "contacted", "offer_sent"])
    revenue_won = totals["won"][1]
    pipeline_value = sum(totals[st][1] for st in ("new", "contacted", "offer_sent"))

    # Customers
    customers_total = await db.customers.count_documents({"status": "active"})
    customers_new_month = await db.customers.count_documents({"created_at": {"$gte": thirty_days_ago}})

    # Newsletter
    newsletter_active = await db.newsletter_subscribers.count_documents({"status": "active"})

    # Recent activities
    activities = await db.activities.find({}, {"_id": 0}) \
        .sort("timestamp", -1).limit(15).to_list(15)

    # Top services from recent contacts
    pipe = [
        {"$match": {"service": {"$nin": [None, ""]}}},
        {"$group": {"_id": "$service", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 6},
    ]
    top_services = [
        {"service": r["_id"], "count": r["count"]}
        async for r in db.contact_forms.aggregate(pipe)
    ]

    return {
        "requests": {
            "today": new_today, "week": new_week, "month": new_month,
            "new": new_count, "contacted": contacted, "offer_sent": offer_sent,
            "won": won, "lost": lost,
        },
        "revenue": {
            "won_total": round(revenue_won, 2),
            "pipeline_open": round(pipeline_value, 2),
        },
        "customers": {"total": customers_total, "new_this_month": customers_new_month},
        "newsletter": {"active": newsletter_active},
        "top_services": top_services,
        "activities": activities,
        "generated_at": now.isoformat(),
    }


# ================= ACTIVITIES =================

@router.get("/admin/activities")
async def list_activities(
    limit: int = 50,
    current: dict = Depends(require_crm_access),
):
    rows = await db.activities.find({}, {"_id": 0}) \
        .sort("timestamp", -1).limit(min(max(1, limit), 500)).to_list(500)
    return {"total": len(rows), "activities": rows}


# ================= CUSTOMERS (CRM) =================

@router.get("/admin/customers")
async def list_customers(
    q: str = "", status: str = "all", skip: int = 0, limit: int = 100,
    current: dict = Depends(require_crm_access),
):
    query: Dict[str, Any] = {}
    if status != "all":
        query["status"] = sanitize_text(status, 20)
    if q:
        safe = re.escape(sanitize_text(q, 100) or "")
        query["$or"] = [
            {"name": {"$regex": safe, "$options": "i"}},
            {"email": {"$regex": safe, "$options": "i"}},
            {"company": {"$regex": safe, "$options": "i"}},
        ]
    rows = await db.customers.find(query, {"_id": 0}) \
        .sort("created_at", -1).skip(max(0, skip)).limit(min(max(1, limit), 500)).to_list(500)
    total = await db.customers.count_documents(query)
    return {"total": total, "customers": rows}


@router.get("/admin/customers/stats")
async def customer_stats(current: dict = Depends(require_crm_access)):
    return {
        "total": await db.customers.count_documents({}),
        "active": await db.customers.count_documents({"status": "active"}),
        "archived": await db.customers.count_documents({"status": "archived"}),
    }


@router.post("/admin/customers", response_model=Customer)
async def create_customer(
    payload: CustomerCreate,
    request: Request,
    current: dict = Depends(require_crm_access),
):
    existing = await db.customers.find_one({"email": payload.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Kunde mit dieser E-Mail existiert bereits")
    customer = Customer(**payload.model_dump(), )
    customer.email = payload.email.lower()
    doc = customer.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    doc["updated_at"] = doc["updated_at"].isoformat()
    await db.customers.insert_one(doc)
    await audit_log("customer_created", current.get("email"), request,
                    {"customer_id": customer.id, "email": customer.email})
    await log_activity(
        "customer_created",
        f"Neuer Kunde: {customer.name}",
        description=customer.company or customer.email,
        actor=current.get("email"),
        related_id=customer.id, related_type="customer",
    )
    return customer


@router.get("/admin/customers/{customer_id}")
async def get_customer(customer_id: str, current: dict = Depends(require_crm_access)):
    customer = await db.customers.find_one({"id": customer_id}, {"_id": 0})
    if not customer:
        raise HTTPException(status_code=404, detail="Kunde nicht gefunden")
    # Attach related requests + projects
    requests_list = await db.contact_forms.find(
        {"customer_id": customer_id}, {"_id": 0}
    ).sort("submitted_at", -1).to_list(500)
    projects = await db.projects_crm.find(
        {"customer_id": customer_id}, {"_id": 0}
    ).sort("created_at", -1).to_list(500)
    return {"customer": customer, "requests": requests_list, "projects": projects}


@router.patch("/admin/customers/{customer_id}")
async def update_customer(
    customer_id: str,
    payload: CustomerUpdate,
    request: Request,
    current: dict = Depends(require_crm_access),
):
    updates = {k: v for k, v in payload.model_dump(exclude_unset=True).items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="Keine Änderungen")
    if "email" in updates:
        updates["email"] = updates["email"].lower()
    updates["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.customers.update_one({"id": customer_id}, {"$set": updates})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Kunde nicht gefunden")
    await audit_log("customer_updated", current.get("email"), request,
                    {"customer_id": customer_id, "fields": list(updates.keys())})
    return {"message": "Kunde aktualisiert", "id": customer_id}


@router.delete("/admin/customers/{customer_id}")
async def delete_customer(
    customer_id: str, request: Request, current: dict = Depends(require_crm_access),
):
    result = await db.customers.delete_one({"id": customer_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Kunde nicht gefunden")
    # Unlink related contacts (don't delete the contact rows themselves)
    await db.contact_forms.update_many(
        {"customer_id": customer_id}, {"$unset": {"customer_id": ""}}
    )
    await audit_log("customer_deleted", current.get("email"), request, {"customer_id": customer_id})
    return {"message": "Kunde gelöscht", "id": customer_id}


@router.post("/admin/customers/from-contact/{contact_id}", response_model=Customer)
async def create_customer_from_contact(
    contact_id: str, request: Request,
    current: dict = Depends(require_crm_access),
):
    """Convert a contact request into a CRM customer (or reuse existing one)."""
    contact = await db.contact_forms.find_one({"id": contact_id}, {"_id": 0})
    if not contact:
        raise HTTPException(status_code=404, detail="Anfrage nicht gefunden")

    email = (contact.get("email") or "").lower()
    existing = await db.customers.find_one({"email": email}, {"_id": 0})
    if existing:
        # Reuse + just link the contact to existing customer
        await db.contact_forms.update_one(
            {"id": contact_id}, {"$set": {"customer_id": existing["id"]}}
        )
        await db.customers.update_one(
            {"id": existing["id"]},
            {"$inc": {"request_count": 1},
             "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}},
        )
        return Customer(**existing)

    customer = Customer(
        name=contact.get("name") or email,
        email=email,
        phone=contact.get("phone"),
        company=contact.get("company"),
        source="contact_form",
        request_count=1,
    )
    doc = customer.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    doc["updated_at"] = doc["updated_at"].isoformat()
    await db.customers.insert_one(doc)
    # Link contact -> customer
    await db.contact_forms.update_one(
        {"id": contact_id}, {"$set": {"customer_id": customer.id}}
    )
    await audit_log("customer_created_from_contact", current.get("email"), request,
                    {"customer_id": customer.id, "contact_id": contact_id})
    await log_activity(
        "customer_created",
        f"Neuer Kunde aus Anfrage: {customer.name}",
        description=customer.company or customer.email,
        actor=current.get("email"),
        related_id=customer.id, related_type="customer",
    )
    return customer


# ================= ENRICHED CONTACT STATUS UPDATE =================

@router.patch("/admin/contact/{contact_id}")
async def update_contact_enriched(
    contact_id: str,
    payload: ContactStatusUpdate,
    request: Request,
    current: dict = Depends(require_crm_access),
):
    """Update contact status, deal_value, assigned_to, notes. Logs activity if status changes."""
    contact = await db.contact_forms.find_one({"id": contact_id}, {"_id": 0})
    if not contact:
        raise HTTPException(status_code=404, detail="Anfrage nicht gefunden")

    updates: Dict[str, Any] = {}
    data = payload.model_dump(exclude_unset=True)
    if "status" in data and data["status"]:
        if data["status"] not in FUNNEL_STAGES + ["read", "replied"]:
            raise HTTPException(status_code=400, detail=f"Ungültiger Status: {data['status']}")
        updates["status"] = data["status"]
    if "deal_value" in data and data["deal_value"] is not None:
        updates["deal_value"] = float(data["deal_value"])
    if "assigned_to" in data and data["assigned_to"] is not None:
        updates["assigned_to"] = sanitize_text(data["assigned_to"], 200)
    if "notes" in data and data["notes"] is not None:
        updates["notes"] = sanitize_text(data["notes"], 5000)

    if not updates:
        raise HTTPException(status_code=400, detail="Keine Änderungen")

    await db.contact_forms.update_one({"id": contact_id}, {"$set": updates})

    # If transitioning to "won" — bump customer revenue if linked
    if updates.get("status") == "won" and contact.get("customer_id"):
        win_value = updates.get("deal_value") or contact.get("deal_value") or _parse_budget_avg(contact.get("budget"))
        if win_value:
            await db.customers.update_one(
                {"id": contact["customer_id"]},
                {"$inc": {"total_revenue": float(win_value)}},
            )

    await audit_log("contact_updated", current.get("email"), request,
                    {"contact_id": contact_id, "fields": list(updates.keys())})

    if "status" in updates and updates["status"] != contact.get("status"):
        await log_activity(
            "status_changed",
            f"{contact.get('name','Anfrage')} → {FUNNEL_LABELS.get(updates['status'], updates['status'])}",
            description=f"Service: {contact.get('service','-')}",
            actor=current.get("email"),
            related_id=contact_id, related_type="contact",
        )

    return {"message": "Aktualisiert", "id": contact_id, "updates": updates}
