"""Project management + Offers/Invoices."""

import io
import logging
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from pymongo.errors import DuplicateKeyError
from pydantic import BaseModel, Field, field_validator, EmailStr

from security import db, audit_log, require_crm_access, sanitize_text

logger = logging.getLogger("zebick.projects_mgmt")
router = APIRouter(prefix="/api")


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


PROJECT_STATUSES = ["planned", "in_progress", "review", "completed", "on_hold", "cancelled"]
PAYMENT_STATUSES = ["unpaid", "partial", "paid", "overdue"]


# ============== Project Models ==============

class TaskIn(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    done: bool = False
    assignee: Optional[str] = Field(None, max_length=200)
    due_date: Optional[str] = Field(None, max_length=40)


class ProjectFileIn(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    data_url: Optional[str] = Field(None, max_length=10_000_000)  # legacy inline (deprecated)
    url: Optional[str] = Field(None, max_length=600)  # /api/uploads/{id}
    size: Optional[int] = None
    id: Optional[str] = None


class ProjectIn(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    customer_id: Optional[str] = Field(None, max_length=80)
    category_id: Optional[str] = Field(None, max_length=80)
    description: Optional[str] = Field(None, max_length=10_000)
    start_date: Optional[str] = Field(None, max_length=40)
    deadline: Optional[str] = Field(None, max_length=40)
    status: str = "planned"
    payment_status: str = "unpaid"
    budget: Optional[float] = Field(None, ge=0, le=10_000_000)
    paid_amount: float = 0.0
    notes: Optional[str] = Field(None, max_length=20_000)
    tasks: List[TaskIn] = Field(default_factory=list)
    files: List[ProjectFileIn] = Field(default_factory=list)
    assigned_to: List[str] = Field(default_factory=list)

    @field_validator("name", "description", "notes")
    @classmethod
    def _strip(cls, v):
        return sanitize_text(v, 20000) if v else v


@router.get("/admin/projects-mgmt")
async def list_projects(
    status: Optional[str] = None,
    customer_id: Optional[str] = None,
    current: dict = Depends(require_crm_access),
):
    q: Dict[str, Any] = {}
    if status:
        q["status"] = status
    if customer_id:
        q["customer_id"] = customer_id
    rows = await db.projects_mgmt.find(q, {"_id": 0}).sort("created_at", -1).to_list(500)
    return {"total": len(rows), "projects": rows}


@router.post("/admin/projects-mgmt")
async def create_project(
    payload: ProjectIn, request: Request,
    current: dict = Depends(require_crm_access),
):
    if payload.status not in PROJECT_STATUSES:
        raise HTTPException(status_code=400, detail="Ungültiger Status")
    if payload.payment_status not in PAYMENT_STATUSES:
        raise HTTPException(status_code=400, detail="Ungültiger Zahlungsstatus")
    doc = {
        "id": str(uuid.uuid4()),
        **payload.model_dump(),
        "created_at": _now_iso(),
        "updated_at": _now_iso(),
    }
    # ensure each task/file has id
    for t in doc.get("tasks", []):
        t.setdefault("id", str(uuid.uuid4()))
    for f in doc.get("files", []):
        f.setdefault("id", str(uuid.uuid4()))
        f.setdefault("uploaded_at", _now_iso())
    await db.projects_mgmt.insert_one(doc)
    await audit_log("project_created", current.get("email"), request, {"id": doc["id"]})
    doc.pop("_id", None)
    return doc


@router.get("/admin/projects-mgmt/{pid}")
async def get_project(pid: str, current: dict = Depends(require_crm_access)):
    doc = await db.projects_mgmt.find_one({"id": pid}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Projekt nicht gefunden")
    return doc


@router.patch("/admin/projects-mgmt/{pid}")
async def update_project(
    pid: str, payload: ProjectIn, request: Request,
    current: dict = Depends(require_crm_access),
):
    updates = payload.model_dump(exclude_unset=True)
    if "status" in updates and updates["status"] not in PROJECT_STATUSES:
        raise HTTPException(status_code=400, detail="Ungültiger Status")
    if "payment_status" in updates and updates["payment_status"] not in PAYMENT_STATUSES:
        raise HTTPException(status_code=400, detail="Ungültiger Zahlungsstatus")
    for t in updates.get("tasks", []) or []:
        t.setdefault("id", str(uuid.uuid4()))
    for f in updates.get("files", []) or []:
        f.setdefault("id", str(uuid.uuid4()))
        f.setdefault("uploaded_at", _now_iso())
    updates["updated_at"] = _now_iso()
    res = await db.projects_mgmt.update_one({"id": pid}, {"$set": updates})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Projekt nicht gefunden")
    await audit_log("project_updated", current.get("email"), request, {"id": pid})
    return {"message": "Aktualisiert", "id": pid}


@router.delete("/admin/projects-mgmt/{pid}")
async def delete_project(
    pid: str, request: Request, current: dict = Depends(require_crm_access),
):
    res = await db.projects_mgmt.delete_one({"id": pid})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Projekt nicht gefunden")
    await audit_log("project_deleted", current.get("email"), request, {"id": pid})
    return {"message": "Gelöscht"}


# ============== OFFERS / INVOICES ==============

class LineItem(BaseModel):
    description: str = Field(min_length=1, max_length=400)
    quantity: float = Field(default=1, ge=0, le=100000)
    unit_price: float = Field(ge=0, le=10_000_000)
    tax_rate: float = Field(default=19, ge=0, le=100)  # 19 or 7 for DE


class OfferIn(BaseModel):
    type: str = "offer"  # offer or invoice
    number: Optional[str] = Field(None, max_length=80)
    customer_id: Optional[str] = Field(None, max_length=80)
    customer_name: Optional[str] = Field(None, max_length=200)
    customer_email: Optional[EmailStr] = Field(None, max_length=200)
    customer_address: Optional[str] = Field(None, max_length=500)
    project_id: Optional[str] = Field(None, max_length=80)
    title: str = Field(min_length=1, max_length=200)
    items: List[LineItem] = Field(default_factory=list)
    discount_percent: float = Field(default=0, ge=0, le=100)
    notes: Optional[str] = Field(None, max_length=10000)
    status: str = "draft"  # draft, sent, accepted, rejected, paid, overdue
    due_date: Optional[str] = Field(None, max_length=40)
    issued_at: Optional[str] = Field(None, max_length=40)
    payment_terms: Optional[str] = Field(None, max_length=200)

    @field_validator("customer_email", mode="before")
    @classmethod
    def _empty_email_to_none(cls, v):
        # Frontend sends "" when the field is left blank — EmailStr rejects
        # that, so treat blank the same as "not provided" instead of a 422.
        return v or None


def _calc_totals(items: List[Dict], discount_percent: float = 0):
    subtotal = sum(it["quantity"] * it["unit_price"] for it in items)
    discount = subtotal * (discount_percent / 100)
    net = subtotal - discount
    tax_total = 0.0
    if subtotal > 0:
        # apply ratio so discount distributed proportionally
        for it in items:
            line = it["quantity"] * it["unit_price"]
            line_after = line * (net / subtotal) if subtotal else line
            tax_total += line_after * (it.get("tax_rate", 19) / 100)
    return {
        "subtotal": round(subtotal, 2),
        "discount": round(discount, 2),
        "net": round(net, 2),
        "tax": round(tax_total, 2),
        "total": round(net + tax_total, 2),
    }


@router.get("/admin/offers")
async def list_offers(
    type: Optional[str] = None, status: Optional[str] = None,
    current: dict = Depends(require_crm_access),
):
    q: Dict[str, Any] = {}
    if type:
        q["type"] = type
    if status:
        q["status"] = status
    rows = await db.offers.find(q, {"_id": 0}).sort("created_at", -1).to_list(500)
    return {"total": len(rows), "offers": rows}


async def _next_number(prefix: str) -> str:
    """Atomic per-prefix/year counter in `system_counters` (same pattern as
    email_templates.next_ab_variant)."""
    year = datetime.now(timezone.utc).year
    key = f"offer_number_{prefix}_{year}"
    if not await db.system_counters.find_one({"_id": key}):
        # Seed once from the highest existing number so we never re-issue one.
        last = await db.offers.find_one(
            {"number": {"$regex": f"^{prefix}-{year}-[0-9]+$"}}, {"_id": 0, "number": 1},
            sort=[("number", -1)],
        )
        seed = int(last["number"].rsplit("-", 1)[1]) if last else 0
        try:
            await db.system_counters.update_one(
                {"_id": key}, {"$setOnInsert": {"count": seed}}, upsert=True)
        except DuplicateKeyError:
            pass  # concurrent first call already seeded it
    doc = await db.system_counters.find_one_and_update(
        {"_id": key}, {"$inc": {"count": 1}}, upsert=True, return_document=True,
    )
    return f"{prefix}-{year}-{doc['count']:04d}"


@router.post("/admin/offers")
async def create_offer(
    payload: OfferIn, request: Request,
    current: dict = Depends(require_crm_access),
):
    prefix = "INV" if payload.type == "invoice" else "OFF"
    number = payload.number or await _next_number(prefix)
    items_dump = [it.model_dump() for it in payload.items]
    totals = _calc_totals(items_dump, payload.discount_percent)
    doc = {
        "id": str(uuid.uuid4()),
        **payload.model_dump(),
        "items": items_dump,
        "number": number,
        "totals": totals,
        "created_at": _now_iso(),
        "updated_at": _now_iso(),
    }
    await db.offers.insert_one(doc)
    await audit_log(f"{payload.type}_created", current.get("email"), request, {"id": doc["id"]})
    doc.pop("_id", None)
    return doc


@router.get("/admin/offers/{oid}")
async def get_offer(oid: str, current: dict = Depends(require_crm_access)):
    doc = await db.offers.find_one({"id": oid}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Nicht gefunden")
    return doc


@router.patch("/admin/offers/{oid}")
async def update_offer(
    oid: str, payload: OfferIn, request: Request,
    current: dict = Depends(require_crm_access),
):
    updates = payload.model_dump(exclude_unset=True)
    if "items" in updates:
        updates["items"] = [it for it in updates["items"]]
        updates["totals"] = _calc_totals(updates["items"], updates.get("discount_percent", payload.discount_percent or 0))
    updates["updated_at"] = _now_iso()
    res = await db.offers.update_one({"id": oid}, {"$set": updates})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Nicht gefunden")
    await audit_log("offer_updated", current.get("email"), request, {"id": oid})
    return {"message": "Aktualisiert", "id": oid}


@router.delete("/admin/offers/{oid}")
async def delete_offer(
    oid: str, request: Request, current: dict = Depends(require_crm_access),
):
    res = await db.offers.delete_one({"id": oid})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Nicht gefunden")
    await audit_log("offer_deleted", current.get("email"), request, {"id": oid})
    return {"message": "Gelöscht"}


@router.get("/admin/offers/{oid}/pdf")
async def offer_pdf(oid: str, current: dict = Depends(require_crm_access)):
    doc = await db.offers.find_one({"id": oid}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Nicht gefunden")
    # Generate simple PDF with reportlab
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.units import mm
    from reportlab.pdfgen import canvas

    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    width, height = A4
    y = height - 25 * mm

    settings = await db.site_settings.find_one({"id": "global"}, {"_id": 0}) or {}
    company = settings.get("company_name") or "Zebick"

    is_invoice = doc.get("type") == "invoice"
    title = "Rechnung" if is_invoice else "Angebot"

    c.setFont("Helvetica-Bold", 18)
    c.drawString(20 * mm, y, f"{title} {doc.get('number', '')}")
    y -= 8 * mm
    c.setFont("Helvetica", 10)
    c.drawString(20 * mm, y, company)
    y -= 5 * mm
    if settings.get("contact_email"):
        c.drawString(20 * mm, y, settings["contact_email"])
        y -= 5 * mm

    # Customer
    y -= 5 * mm
    c.setFont("Helvetica-Bold", 11)
    c.drawString(20 * mm, y, "An:")
    y -= 5 * mm
    c.setFont("Helvetica", 10)
    c.drawString(20 * mm, y, doc.get("customer_name") or "-")
    y -= 5 * mm
    if doc.get("customer_address"):
        for line in (doc["customer_address"] or "").split("\n"):
            c.drawString(20 * mm, y, line)
            y -= 5 * mm

    y -= 6 * mm
    c.setFont("Helvetica-Bold", 12)
    c.drawString(20 * mm, y, doc.get("title", ""))
    y -= 8 * mm

    # Items table
    c.setFont("Helvetica-Bold", 9)
    c.drawString(20 * mm, y, "Beschreibung")
    c.drawString(110 * mm, y, "Menge")
    c.drawString(130 * mm, y, "Preis")
    c.drawString(155 * mm, y, "MwSt")
    c.drawString(175 * mm, y, "Summe")
    y -= 4 * mm
    c.line(20 * mm, y, 190 * mm, y)
    y -= 4 * mm
    c.setFont("Helvetica", 9)
    for it in doc.get("items", []):
        desc = it.get("description", "")[:60]
        c.drawString(20 * mm, y, desc)
        c.drawString(110 * mm, y, f"{it.get('quantity', 0)}")
        c.drawString(130 * mm, y, f"€{it.get('unit_price', 0):.2f}")
        c.drawString(155 * mm, y, f"{it.get('tax_rate', 19)}%")
        line_total = it.get("quantity", 0) * it.get("unit_price", 0)
        c.drawString(175 * mm, y, f"€{line_total:.2f}")
        y -= 6 * mm
        if y < 40 * mm:
            c.showPage()
            y = height - 25 * mm

    # Totals
    y -= 5 * mm
    c.line(20 * mm, y, 190 * mm, y)
    y -= 5 * mm
    totals = doc.get("totals") or _calc_totals(doc.get("items", []), doc.get("discount_percent", 0))
    c.setFont("Helvetica", 10)
    c.drawString(140 * mm, y, "Zwischensumme:")
    c.drawString(175 * mm, y, f"€{totals['subtotal']:.2f}")
    y -= 5 * mm
    if totals["discount"] > 0:
        c.drawString(140 * mm, y, f"Rabatt ({doc.get('discount_percent', 0)}%):")
        c.drawString(175 * mm, y, f"-€{totals['discount']:.2f}")
        y -= 5 * mm
    c.drawString(140 * mm, y, "Netto:")
    c.drawString(175 * mm, y, f"€{totals['net']:.2f}")
    y -= 5 * mm
    c.drawString(140 * mm, y, "MwSt:")
    c.drawString(175 * mm, y, f"€{totals['tax']:.2f}")
    y -= 5 * mm
    c.setFont("Helvetica-Bold", 11)
    c.drawString(140 * mm, y, "Gesamt:")
    c.drawString(175 * mm, y, f"€{totals['total']:.2f}")

    y -= 12 * mm
    c.setFont("Helvetica", 9)
    if doc.get("payment_terms"):
        c.drawString(20 * mm, y, f"Zahlungsbedingungen: {doc['payment_terms']}")
        y -= 5 * mm
    if doc.get("due_date"):
        c.drawString(20 * mm, y, f"Fällig am: {doc['due_date']}")
        y -= 5 * mm
    if doc.get("notes"):
        y -= 3 * mm
        c.drawString(20 * mm, y, "Hinweise:")
        y -= 5 * mm
        for line in (doc["notes"] or "").split("\n")[:5]:
            c.drawString(20 * mm, y, line[:90])
            y -= 5 * mm

    c.save()
    buf.seek(0)
    fname = f"{doc.get('type', 'offer')}-{doc.get('number', oid)}.pdf"
    return StreamingResponse(
        buf, media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={fname}"},
    )
