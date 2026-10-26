"""Tools / Berater Konfiguration — pro Service ein Berater + 6 universale Tools.

Schema (collection `tools_config`):
{
  id:           uuid (string)
  slug:         "ki-berater" | "web-berater" | "kostenrechner" ...    (eindeutig)
  service_id:   "general" | "web-development" | "cyber-security" | ...
  type:         "advisor" | "calculator" | "audit" | "dsgvo" | "booking"
  title:        "KI-Projektberater"
  description:  "Welche KI-/Automatisierungs-Lösung passt zu Ihrem Business?"
  icon:         "BrainCircuit"   (lucide-react Name)
  enabled:      bool
  featured:     bool
  order:        int

  # Pricing — optional (für Buchbare / Premium-Tools)
  pricing_enabled:  bool
  pricing_price:    "Kostenlos" | "49€" | "ab 99€" | ...
  pricing_label:    "Standard-Audit" | "Premium-Bericht" | ...
  pricing_features: ["PDF-Bericht", "30 Min Beratung", ...]

  # Advisor — Fragen + Empfehlungen
  questions: [
    { key: "goal", q: "Was ist Ihr Hauptziel?",
      options: [{ v: "lead-gen", l: "Mehr Leads", icon: "Target" }, ...] }
  ]
  recommendations: {
    "lead-gen": "KI-Vertriebsagent + Lead-Automatisierung – …",
    ...
    "_default": "Maßgeschneiderte Lösung – wir beraten Sie individuell.",
  }

  # Calculator (für 'calculator' type)
  calc_base:    { simple: 2500, mid: 6000, pro: 15000 }
  calc_features:{ blog: 800, shop: 4500, ... }

  # Audit (für 'audit' type)
  audit_intro:  "Wir prüfen Ihre Website auf …"
  audit_checks: [{ name: "Ladezeit" }, ...]
}
"""

from __future__ import annotations

import copy
import logging
import uuid
from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List, Optional
from urllib.parse import urlparse

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field, field_validator
from slowapi import Limiter
from slowapi.util import get_remote_address

import config
from security import db, get_current_user, sanitize_text

logger = logging.getLogger("zebick.tools")
router = APIRouter(prefix="/api")
limiter = Limiter(key_func=get_remote_address, enabled=config.RATE_LIMIT_ENABLED)

COL = db.tools_config
VERSIONS = db.tool_versions
AUDIT_CACHE = db.audit_cache
MAX_VERSIONS = 25
AUDIT_CACHE_HOURS = 24


async def _snapshot_version(existing: dict, admin_email: str, note: str = "") -> None:
    """Store a snapshot of a tool's current state before it is overwritten."""
    snap = _clean(dict(existing))
    await VERSIONS.insert_one({
        "id": str(uuid.uuid4()),
        "tool_id": existing.get("id"),
        "tool_slug": existing.get("slug"),
        "title": existing.get("title"),
        "note": note,
        "snapshot": snap,
        "saved_at": datetime.now(timezone.utc).isoformat(),
        "saved_by": admin_email,
    })
    # Keep only the newest MAX_VERSIONS per tool
    old = await VERSIONS.find({"tool_id": existing.get("id")}) \
        .sort([("saved_at", -1)]).skip(MAX_VERSIONS).to_list(500)
    if old:
        await VERSIONS.delete_many({"id": {"$in": [o["id"] for o in old]}})


# -------------------------- MODELS --------------------------

class ToolOption(BaseModel):
    v: str  # value
    l: str  # label
    icon: Optional[str] = None

    @field_validator("l")
    @classmethod
    def _strip_html(cls, v):
        return sanitize_text(v, 200) if v else v


class ToolQuestion(BaseModel):
    key: str
    q: str
    options: List[ToolOption] = []

    @field_validator("q")
    @classmethod
    def _strip_html(cls, v):
        return sanitize_text(v, 400) if v else v


class ToolPayload(BaseModel):
    slug: str = Field(..., min_length=2, max_length=80)
    service_id: str = Field(default="general", max_length=60)
    type: str = Field(default="advisor")  # advisor|calculator|audit|dsgvo|booking
    title: str = Field(..., max_length=120)
    description: str = Field(default="", max_length=400)
    icon: str = Field(default="Sparkles", max_length=40)
    enabled: bool = True
    featured: bool = False
    order: int = 0
    # Pricing
    pricing_enabled: bool = False
    pricing_price: str = "Kostenlos"
    pricing_label: str = ""
    pricing_features: List[str] = []
    # Advisor
    questions: List[ToolQuestion] = []
    recommendations: Dict[str, str] = {}
    # Calculator
    calc_base: Dict[str, float] = {}
    calc_features: Dict[str, float] = {}
    # Audit
    audit_intro: str = ""
    audit_checks: List[Dict[str, str]] = []

    @field_validator("title", "description", "pricing_label", "audit_intro")
    @classmethod
    def _strip_html(cls, v):
        return sanitize_text(v, 400) if v else v

    @field_validator("recommendations")
    @classmethod
    def _strip_html_recs(cls, v):
        return {k: (sanitize_text(val, 1000) or "") for k, val in v.items()} if v else v


# -------------------------- HELPERS --------------------------

def _clean(doc: dict) -> dict:
    doc.pop("_id", None)
    return doc


async def _ensure_tools() -> None:
    """Self-heal: if tools_config is empty, first restore custom tools from the
    latest backup, then fall back to reseeding the defaults."""
    if await COL.count_documents({}) > 0:
        return
    restored = 0
    try:
        from scripts.backup import restore_collection_from_latest_backup
        restored = await restore_collection_from_latest_backup("tools_config")
    except Exception as e:  # noqa: BLE001
        logger.error(f"Tools restore-from-backup failed: {e}")
    if await COL.count_documents({}) == 0:
        await seed_tools_if_empty()
    elif restored:
        logger.info(f"Tools self-healed from backup ({restored} restored)")


# -------------------------- PUBLIC --------------------------

@router.get("/tools")
async def list_public_tools(service_id: Optional[str] = None):
    """Public list — only enabled, optionally filtered by service_id.
    Self-heals: if the collection was ever emptied, tools are restored from the
    latest backup, else default tools are reseeded."""
    await _ensure_tools()
    q = {"enabled": True}
    if service_id:
        q["service_id"] = {"$in": [service_id, "general"]}
    docs = await COL.find(q).sort([("order", 1), ("title", 1)]).to_list(200)
    return [_clean(d) for d in docs]


@router.get("/tools/{slug}")
async def get_public_tool(slug: str):
    doc = await COL.find_one({"slug": slug, "enabled": True})
    if not doc:
        raise HTTPException(status_code=404, detail="Tool nicht gefunden")
    return _clean(doc)


# -------------------------- AUDIT (real PageSpeed Insights check) --------------------------

class AuditRequest(BaseModel):
    url: str = Field(..., max_length=500)
    checks: List[str] = Field(default=[], max_length=30)


# Exact check-label -> metric-key mapping for the two seeded audit tools
# (website-check, seo-audit). Unknown future labels fall back to "performance".
# "Backlink-Profil" has no PageSpeed-measurable equivalent — mapped to None on
# purpose rather than a fabricated/fallback score (see memory: never invent
# performance numbers).
CHECK_METRIC_MAP: Dict[str, Optional[str]] = {
    "Ladezeit": "performance",
    "Page Speed": "performance",
    "Mobile UX": "mobile",
    "Mobile Indexing": "mobile",
    "Barrierefreiheit": "accessibility",
    "SEO-Basics": "seo",
    "Technical-SEO": "seo",
    "On-Page SEO": "seo",
    "Meta-Tags": "seo",
    "Content-Qualität": "seo",
    "Structured Data": "seo",
    "Indexierung": "seo",
    "Sicherheit (HTTPS)": "security",
    "Bild-Optimierung": "images",
    "Core Web Vitals": "core_web_vitals",
    "Backlink-Profil": None,
}


def _is_safe_public_url(url: str) -> bool:
    try:
        p = urlparse(url)
    except ValueError:
        return False
    if p.scheme not in ("http", "https") or not p.hostname:
        return False
    host = p.hostname.lower()
    if host in ("localhost", "127.0.0.1", "0.0.0.0", "::1"):
        return False
    if host.startswith("192.168.") or host.startswith("10.") or host.startswith("169.254."):
        return False
    if host.startswith("172."):
        try:
            second = int(host.split(".")[1])
            if 16 <= second <= 31:
                return False
        except (IndexError, ValueError):
            pass
    return True


def _audit_score(v: Any) -> Optional[int]:
    """A Lighthouse score is 0.0-1.0 (or null if the audit didn't apply)."""
    if not isinstance(v, (int, float)):
        return None
    return round(v * 100)


def _extract_metrics(psi: Dict[str, Any]) -> Dict[str, Optional[int]]:
    categories = (psi.get("lighthouseResult") or {}).get("categories") or {}
    audits = (psi.get("lighthouseResult") or {}).get("audits") or {}

    def cat(name: str) -> Optional[int]:
        return _audit_score((categories.get(name) or {}).get("score"))

    def avg(*audit_ids: str) -> Optional[int]:
        scores = [_audit_score(audits[a]["score"]) for a in audit_ids if a in audits and audits[a].get("score") is not None]
        return round(sum(scores) / len(scores)) if scores else None

    performance = cat("performance")
    accessibility = cat("accessibility")
    mobile_parts = [s for s in (performance, accessibility) if s is not None]

    return {
        "performance": performance,
        "accessibility": accessibility,
        "seo": cat("seo"),
        "mobile": round(sum(mobile_parts) / len(mobile_parts)) if mobile_parts else None,
        "security": _audit_score((audits.get("is-on-https") or {}).get("score")),
        # "uses-optimized-images"/"modern-image-formats"/"uses-responsive-images" were
        # the pre-2025 Lighthouse audit ids; newer Lighthouse versions consolidate all
        # of that into this single "Insights"-style audit (verified against a live
        # response — the old ids no longer appear in the API output at all).
        "images": avg("image-delivery-insight"),
        "core_web_vitals": avg("largest-contentful-paint", "cumulative-layout-shift", "total-blocking-time"),
    }


async def _run_pagespeed(url: str) -> Dict[str, Optional[int]]:
    params = [
        ("url", url), ("strategy", "mobile"),
        ("category", "performance"), ("category", "accessibility"), ("category", "seo"),
        ("category", "best-practices"),
    ]
    if config.PAGESPEED_API_KEY:
        params.append(("key", config.PAGESPEED_API_KEY))
    async with httpx.AsyncClient(timeout=55) as client:
        resp = await client.get(
            "https://www.googleapis.com/pagespeedonline/v5/runPagespeed",
            params=params,
        )
    if resp.status_code != 200:
        logger.error(f"PageSpeed Insights error {resp.status_code}: {resp.text[:300]}")
        raise HTTPException(status_code=502, detail="Analyse fehlgeschlagen. Bitte später erneut versuchen.")
    return _extract_metrics(resp.json())


@router.post("/tools/audit")
@limiter.limit("3/minute")
async def run_audit(request: Request, payload: AuditRequest):
    url = payload.url.strip()
    if not _is_safe_public_url(url):
        raise HTTPException(status_code=400, detail="Bitte eine gültige, öffentliche http(s)-URL eingeben.")

    cache_key = url.lower().rstrip("/")
    cached = await AUDIT_CACHE.find_one({"url": cache_key})
    is_cached = False
    if cached:
        checked_at = datetime.fromisoformat(cached["checked_at"])
        if datetime.now(timezone.utc) - checked_at < timedelta(hours=AUDIT_CACHE_HOURS):
            metrics = cached["metrics"]
            is_cached = True
    if not is_cached:
        metrics = await _run_pagespeed(url)
        await AUDIT_CACHE.update_one(
            {"url": cache_key},
            {"$set": {"url": cache_key, "metrics": metrics, "checked_at": datetime.now(timezone.utc).isoformat()}},
            upsert=True,
        )

    results = []
    for name in payload.checks:
        metric_key = CHECK_METRIC_MAP.get(name, "performance")
        score = metrics.get(metric_key) if metric_key else None
        results.append({"name": name, "score": score})
    return {"results": results, "cached": is_cached}


# -------------------------- ADMIN --------------------------

@router.get("/admin/tools")
async def list_admin_tools(admin=Depends(get_current_user)):
    await _ensure_tools()
    docs = await COL.find({}).sort([("service_id", 1), ("order", 1)]).to_list(500)
    return [_clean(d) for d in docs]


@router.post("/admin/tools")
async def create_tool(payload: ToolPayload, admin=Depends(get_current_user)):
    if await COL.find_one({"slug": payload.slug}):
        raise HTTPException(status_code=400, detail="Slug existiert bereits")
    doc = payload.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    doc["updated_at"] = doc["created_at"]
    doc["updated_by"] = admin.get("email")
    await COL.insert_one(doc)
    return _clean(doc)


@router.get("/admin/tools/export")
async def export_tools(admin=Depends(get_current_user)):
    """Export all tools as a JSON payload (for download / backup).
    Declared BEFORE /admin/tools/{tool_id} so 'export' isn't matched as an id."""
    docs = await COL.find({}).sort([("service_id", 1), ("order", 1)]).to_list(500)
    tools = [_clean(d) for d in docs]
    return {
        "exported_at": datetime.now(timezone.utc).isoformat(),
        "exported_by": admin.get("email"),
        "version": "1.0",
        "count": len(tools),
        "tools": tools,
    }


class ImportPayload(BaseModel):
    tools: List[Dict[str, Any]] = []
    replace: bool = False  # True = wipe existing before import


@router.post("/admin/tools/import")
async def import_tools(payload: ImportPayload, admin=Depends(get_current_user)):
    """Import tools from a JSON payload. Upserts by slug.

    - replace=True wipes the collection first (full restore).
    - Each tool is validated against ToolPayload; invalid entries are skipped.
    """
    incoming = payload.tools or []
    if not incoming:
        raise HTTPException(status_code=400, detail="Keine Tools im Import gefunden")

    if payload.replace:
        await COL.delete_many({})

    created = updated = skipped = 0
    skip_reasons: List[Dict[str, Any]] = []
    now = datetime.now(timezone.utc).isoformat()
    for i, raw in enumerate(incoming):
        if not isinstance(raw, dict):
            skipped += 1
            skip_reasons.append({"index": i, "error": "Eintrag ist kein Objekt"})
            continue
        try:
            clean = {k: v for k, v in raw.items()
                     if k not in ("id", "_id", "created_at", "updated_at", "updated_by")}
            validated = ToolPayload(**clean).model_dump()
        except Exception as e:  # noqa: BLE001 — invalid entry
            skipped += 1
            skip_reasons.append({"index": i, "error": str(e)})
            continue
        existing = await COL.find_one({"slug": validated["slug"]})
        validated["updated_at"] = now
        validated["updated_by"] = admin.get("email")
        if existing:
            await COL.update_one({"slug": validated["slug"]}, {"$set": validated})
            updated += 1
        else:
            validated["id"] = str(uuid.uuid4())
            validated["created_at"] = now
            await COL.insert_one(validated)
            created += 1
    return {"created": created, "updated": updated, "skipped": skipped,
            "skip_reasons": skip_reasons, "total": len(incoming)}


@router.get("/admin/tools/{tool_id}")
async def get_admin_tool(tool_id: str, admin=Depends(get_current_user)):
    doc = await COL.find_one({"id": tool_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Tool nicht gefunden")
    return _clean(doc)


@router.put("/admin/tools/{tool_id}")
async def update_tool(tool_id: str, payload: ToolPayload, admin=Depends(get_current_user)):
    existing = await COL.find_one({"id": tool_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Tool nicht gefunden")
    # If slug changed, ensure uniqueness
    if payload.slug != existing["slug"] and await COL.find_one({"slug": payload.slug}):
        raise HTTPException(status_code=400, detail="Slug bereits vergeben")
    update = payload.model_dump()
    update["updated_at"] = datetime.now(timezone.utc).isoformat()
    update["updated_by"] = admin.get("email")
    # Save previous state to version history before overwriting
    await _snapshot_version(existing, admin.get("email"))
    await COL.update_one({"id": tool_id}, {"$set": update})
    doc = await COL.find_one({"id": tool_id})
    return _clean(doc)


@router.get("/admin/tools/{tool_id}/versions")
async def list_tool_versions(tool_id: str, admin=Depends(get_current_user)):
    """History of previous saved states for a tool (newest first)."""
    docs = await VERSIONS.find({"tool_id": tool_id}).sort([("saved_at", -1)]).to_list(MAX_VERSIONS)
    return [_clean(d) for d in docs]


@router.post("/admin/tools/{tool_id}/versions/{version_id}/restore")
async def restore_tool_version(tool_id: str, version_id: str, admin=Depends(get_current_user)):
    """Restore a tool to a previous version. The current state is snapshotted first."""
    existing = await COL.find_one({"id": tool_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Tool nicht gefunden")
    ver = await VERSIONS.find_one({"id": version_id, "tool_id": tool_id})
    if not ver:
        raise HTTPException(status_code=404, detail="Version nicht gefunden")
    snap = dict(ver.get("snapshot") or {})
    # Never overwrite identity/audit fields from the snapshot
    for k in ("id", "_id", "created_at"):
        snap.pop(k, None)
    # Guard against slug collision with a different tool
    if snap.get("slug") and snap["slug"] != existing["slug"]:
        clash = await COL.find_one({"slug": snap["slug"], "id": {"$ne": tool_id}})
        if clash:
            snap["slug"] = existing["slug"]
    # Snapshot current state so a restore is itself undoable
    await _snapshot_version(existing, admin.get("email"), note="vor Wiederherstellung")
    snap["updated_at"] = datetime.now(timezone.utc).isoformat()
    snap["updated_by"] = admin.get("email")
    await COL.update_one({"id": tool_id}, {"$set": snap})
    doc = await COL.find_one({"id": tool_id})
    return _clean(doc)


@router.delete("/admin/tools/{tool_id}")
async def delete_tool(tool_id: str, admin=Depends(get_current_user)):
    r = await COL.delete_one({"id": tool_id})
    if r.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Tool nicht gefunden")
    await VERSIONS.delete_many({"tool_id": tool_id})
    return {"ok": True}


@router.post("/admin/tools/reseed")
async def reseed_tools(admin=Depends(get_current_user)):
    """Wipe + reseed default 16 tools. Admin-only emergency action."""
    await COL.delete_many({})
    n = await seed_tools_if_empty(force=True)
    return {"reseeded": n}


# -------------------------- SEED --------------------------

def _t(slug, service_id, type_, title, desc, icon, order, **kw):
    base = {
        "id": str(uuid.uuid4()),
        "slug": slug, "service_id": service_id, "type": type_,
        "title": title, "description": desc, "icon": icon,
        "enabled": True, "featured": False, "order": order,
        "pricing_enabled": False, "pricing_price": "Kostenlos", "pricing_label": "",
        "pricing_features": [],
        "questions": [], "recommendations": {},
        "calc_base": {}, "calc_features": {},
        "audit_intro": "", "audit_checks": [],
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    base.update(kw)
    return base


# Advisor helper
def _advisor_q(key, q, opts):
    return {"key": key, "q": q, "options": [{"v": v, "l": l, "icon": ic} for (v, l, ic) in opts]}


BUDGET_Q = _advisor_q("budget", "Welches Budget steht zur Verfügung?", [
    ("<5k",     "< 5.000 €", "DollarSign"),
    ("5-15k",   "5.000 – 15.000 €", "DollarSign"),
    ("15-50k",  "15.000 – 50.000 €", "DollarSign"),
    (">50k",    "Mehr als 50.000 €", "DollarSign"),
])
TIMELINE_Q = _advisor_q("timeline", "Wann soll das Projekt starten?", [
    ("asap", "So schnell wie möglich", "Zap"),
    ("1-3m", "In 1–3 Monaten", "Clock"),
    ("3-6m", "In 3–6 Monaten", "Calendar"),
    ("flex", "Flexibel / unklar", "HelpCircle"),
])


SEED_TOOLS = [
    # ---------------- UNIVERSAL TOOLS (service_id="general") ----------------
    _t("kostenrechner", "general", "calculator",
       "Website-Kostenrechner",
       "Berechnen Sie in 30 Sekunden, was Ihre neue Website ungefähr kostet.",
       "Calculator", 1,
       featured=True,
       # Keys MUST match WebsiteCalculator.jsx's PROJECT_TYPES / FEATURES ids
       # (frontend/src/components/tools/WebsiteCalculator.jsx) — the calculator
       # looks these up by exact key, any mismatch silently falls back to its
       # hardcoded defaults and admin price edits have no effect.
       calc_base={"landing": 690, "business": 1490, "shop": 2500, "saas": 6900, "custom": 5400},
       calc_features={"cms": 490, "shop": 2200, "multilang": 690, "integrations": 1090,
                      "ai": 1490, "design": 990}),

    _t("website-check", "general", "audit",
       "Kostenloser Website-Check",
       "Wir analysieren Ihre Website auf Performance, SEO und UX – kostenlos.",
       "Globe", 2,
       audit_intro="Wir prüfen Ihre Website auf Performance, mobile Optimierung, UX und technische Fehler.",
       audit_checks=[{"name": "Ladezeit"}, {"name": "Mobile UX"},
                     {"name": "Barrierefreiheit"}, {"name": "SEO-Basics"},
                     {"name": "Sicherheit (HTTPS)"}, {"name": "Bild-Optimierung"},
                     {"name": "Technical-SEO"}, {"name": "Core Web Vitals"}]),

    _t("seo-audit", "general", "audit",
       "SEO-Audit",
       "Detaillierter SEO-Audit Ihrer Domain mit Quick-Wins und Roadmap.",
       "Search", 3,
       pricing_enabled=True, pricing_price="ab 49€", pricing_label="Premium-Bericht",
       pricing_features=["PDF-Report (15+ Seiten)", "Konkrete Handlungsempfehlungen",
                         "30 Min Strategiegespräch", "Wettbewerbs-Vergleich"],
       audit_intro="Umfassender SEO-Quick-Check Ihrer Domain mit konkreten Handlungsempfehlungen.",
       audit_checks=[{"name": "On-Page SEO"}, {"name": "Meta-Tags"},
                     {"name": "Content-Qualität"}, {"name": "Backlink-Profil"},
                     {"name": "Page Speed"}, {"name": "Mobile Indexing"},
                     {"name": "Structured Data"}, {"name": "Indexierung"}]),

    _t("dsgvo-check", "general", "dsgvo",
       "DSGVO-Check",
       "In 10 Fragen zur Datenschutz-Konformität Ihrer Website.",
       "Shield", 4),

    _t("ki-berater", "general", "advisor",
       "KI-Projektberater",
       "Welche KI-/Automatisierungs-Lösung passt zu Ihrem Business?",
       "BrainCircuit", 5,
       featured=True,
       questions=[
           _advisor_q("goal", "Was ist Ihr Hauptziel?", [
               ("customer-service", "Kundenservice automatisieren", "Bot"),
               ("lead-gen",         "Mehr Leads generieren", "Target"),
               ("internal",         "Interne Prozesse automatisieren", "Workflow"),
               ("knowledge",        "Wissen schneller verfügbar machen", "BrainCircuit"),
           ]),
           _advisor_q("volume", "Wie viele Anfragen / Vorgänge pro Monat?", [
               ("<500", "Bis 500", "TrendingUp"),
               ("500-2k", "500 – 2.000", "TrendingUp"),
               ("2k-10k", "2.000 – 10.000", "TrendingUp"),
               (">10k", "Mehr als 10.000", "TrendingUp"),
           ]),
           _advisor_q("integration", "Welche Systeme sollen integriert werden?", [
               ("crm",  "CRM (HubSpot, Salesforce, …)", "Database"),
               ("shop", "E-Commerce / Shop", "Globe"),
               ("erp",  "ERP / interne Tools", "Workflow"),
               ("none", "Standalone-Lösung", "Sparkles"),
           ]),
           BUDGET_Q,
       ],
       recommendations={
           "customer-service": "KI-Kundenservice-Agent mit RAG-Wissensbasis – beantwortet bis zu 80% aller Standard­anfragen automatisch.",
           "lead-gen":         "KI-Vertriebsagent + Lead-Automatisierung – qualifiziert Website-Besucher und übergibt heiße Leads ans Sales-Team.",
           "internal":         "Prozess-Automatisierung mit n8n & KI-Agenten – verbindet Ihre Tools und eliminiert Routinearbeit.",
           "knowledge":        "RAG-Wissensbasis – durchsucht Ihre Dokumente und liefert präzise Antworten in Sekunden.",
           "_default":         "Maßgeschneiderte KI-Lösung basierend auf Ihren Anforderungen.",
       }),

    _t("erstgespraech", "general", "booking",
       "Kostenloses Erstgespräch",
       "30 Minuten unverbindliche Strategie-Session mit unseren Experten.",
       "Calendar", 6),

    # ---------------- SERVICE-SPECIFIC ADVISORS ----------------
    _t("web-berater", "web-development", "advisor",
       "Web-Projektberater",
       "Welche Web-Lösung passt zu Ihrem Business?", "Code", 10,
       featured=True,
       questions=[
           _advisor_q("type", "Was möchten Sie umsetzen?", [
               ("landing",  "Landing-Page / Marketing-Site", "Layout"),
               ("corporate", "Unternehmens-Website (Mehrseitig)", "Building2"),
               ("saas",     "SaaS-Plattform / Web-App", "AppWindow"),
               ("shop",     "Online-Shop / E-Commerce", "ShoppingCart"),
           ]),
           _advisor_q("scope", "Wie umfangreich?", [
               ("small",  "5–10 Unterseiten", "FileText"),
               ("medium", "10–30 Unterseiten + CMS", "Layers"),
               ("large",  "Komplexe App mit User-Login", "Database"),
               ("custom", "Maßgeschneidert", "Wrench"),
           ]),
           BUDGET_Q,
           TIMELINE_Q,
       ],
       recommendations={
           "landing":   "Schnelle Landing-Page in 2–4 Wochen mit Next.js, optimiert für SEO & Conversion. Ideal für Kampagnen.",
           "corporate": "Modernes CMS-System (z.B. Sanity oder Strapi) mit Editor-Workflow – Sie pflegen Inhalte selbst.",
           "saas":      "React + FastAPI + PostgreSQL – skalierbare SaaS-Architektur mit Stripe-Integration & User-Management.",
           "shop":      "Headless-Shop mit Shopify Hydrogen oder Next.js + Stripe, optimiert auf Performance & Checkout-Conversion.",
           "_default":  "Individuelles Web-Konzept – wir gestalten die optimale Lösung gemeinsam mit Ihnen.",
       }),

    _t("app-berater", "app-development", "advisor",
       "App-Projektberater",
       "iOS, Android oder Cross-Platform — was passt zu Ihrer App-Idee?",
       "Smartphone", 11,
       featured=True,
       questions=[
           _advisor_q("platform", "Welche Plattformen sind Ihnen wichtig?", [
               ("both", "iOS & Android", "Smartphone"),
               ("ios",  "Nur iOS", "Apple"),
               ("android", "Nur Android", "Smartphone"),
               ("pwa", "Progressive Web-App", "Globe"),
           ]),
           _advisor_q("features", "Welche Kernfunktion ist zentral?", [
               ("social", "Soziale Funktionen / Community", "Users"),
               ("ecom",   "Verkauf / In-App-Käufe", "ShoppingCart"),
               ("data",   "Datenverarbeitung / Dashboards", "BarChart3"),
               ("offline", "Offline-First / Sync", "Database"),
           ]),
           BUDGET_Q,
           TIMELINE_Q,
       ],
       recommendations={
           "both":    "React Native oder Flutter – ein Code, beide Plattformen. Schnellster Time-to-Market bei voller Native-Performance.",
           "ios":     "Native iOS mit Swift/SwiftUI – maximale Performance, Zugriff auf alle Apple-APIs (HealthKit, ARKit, …).",
           "android": "Native Android mit Kotlin – beste Integration mit Google-Services (Maps, Firebase, Wearables).",
           "pwa":     "Progressive Web-App – funktioniert offline, installierbar, kein App-Store nötig. Ideal für B2B-Tools.",
           "_default": "Individuelle App-Strategie – wir beraten zu Tech-Stack, Plattformen und Roadmap.",
       }),

    _t("security-berater", "cyber-security", "advisor",
       "Security-Berater",
       "Welche Sicherheits-Maßnahmen sind für Sie kritisch?",
       "Shield", 12,
       featured=True,
       questions=[
           _advisor_q("focus", "Wo liegt Ihr aktuelles Sicherheits-Risiko?", [
               ("webapp", "Web-Anwendung / API", "Globe"),
               ("infra",  "Infrastruktur / Cloud", "Server"),
               ("data",   "Datenschutz / DSGVO", "Lock"),
               ("audit",  "Compliance / Zertifizierung (ISO, SOC2)", "Award"),
           ]),
           _advisor_q("size", "Größe Ihres Teams / Ihrer Systeme?", [
               ("<10",   "< 10 Mitarbeiter", "Users"),
               ("10-50", "10–50 Mitarbeiter", "Users"),
               ("50-250", "50–250 Mitarbeiter", "Building2"),
               (">250",  "250+ / Enterprise", "Building"),
           ]),
           _advisor_q("urgency", "Wie dringend?", [
               ("breach", "Akuter Vorfall / Verdacht", "AlertTriangle"),
               ("proactive", "Proaktiv – Risiko reduzieren", "ShieldCheck"),
               ("compliance", "Zertifizierung steht an", "FileCheck"),
               ("ongoing", "Laufende Betreuung", "Activity"),
           ]),
           BUDGET_Q,
       ],
       recommendations={
           "webapp":     "Penetration Test + OWASP-Audit – wir prüfen Ihre Anwendung auf die Top-10 Schwachstellen und beheben sie.",
           "infra":      "Cloud-Security-Audit (AWS/Azure/GCP) – Konfigurations-Review, IAM-Hardening, Network-Segmentation.",
           "data":       "DSGVO-Audit + Data-Protection-Impact-Assessment – wir sichern Ihre Daten rechtskonform ab.",
           "audit":      "ISO 27001 / SOC2 Vorbereitung – Gap-Analyse, Policy-Set, Begleitung bis zur Zertifizierung.",
           "_default":   "Individuelle Security-Strategie – wir starten mit einem Risk-Assessment.",
       }),

    _t("uiux-berater", "ui-ux", "advisor",
       "UI/UX-Berater",
       "Welche Design-Leistung bringt Sie weiter?", "Palette", 13,
       questions=[
           _advisor_q("need", "Was brauchen Sie aktuell?", [
               ("audit",   "UX-Audit bestehendes Produkt", "Search"),
               ("redesign", "Komplettes Redesign", "RefreshCw"),
               ("design-system", "Design-System / Component-Library", "Layers"),
               ("prototype", "Prototyp für neue Idee", "Sparkles"),
           ]),
           _advisor_q("stage", "Wo stehen Sie aktuell?", [
               ("idea",  "Idee / Konzept", "Lightbulb"),
               ("mvp",   "MVP läuft", "Rocket"),
               ("scale", "Produkt skaliert", "TrendingUp"),
               ("enterprise", "Enterprise-Produkt", "Building2"),
           ]),
           BUDGET_Q,
       ],
       recommendations={
           "audit":         "UX-Audit mit Heuristik-Analyse + User-Testing – konkrete Quick-Wins in 2 Wochen.",
           "redesign":      "Full Redesign mit Discovery-Phase, Wireframes, High-Fidelity-Designs und Dev-Handover.",
           "design-system": "Skalierbares Design-System mit Tokens, Komponenten-Library, Dokumentation (Figma + Storybook).",
           "prototype":     "Klickbarer Hi-Fi-Prototyp in 1–2 Wochen für User-Tests, Pitches und Investoren-Meetings.",
           "_default":      "Individuelles Design-Konzept – starten mit Workshop & Discovery.",
       }),

    _t("gaming-berater", "gaming", "advisor",
       "Game-Dev-Berater",
       "Welche Game-Engine und welches Modell passen zu Ihrem Projekt?",
       "Gamepad2", 14,
       questions=[
           _advisor_q("genre", "Welches Genre?", [
               ("casual",  "Casual / Hyper-Casual", "Smile"),
               ("rpg",     "RPG / Adventure", "Swords"),
               ("multiplayer", "Multiplayer / PvP", "Users"),
               ("ar-vr",   "AR / VR / XR", "Glasses"),
           ]),
           _advisor_q("platform", "Hauptplattform?", [
               ("mobile", "Mobile (iOS/Android)", "Smartphone"),
               ("pc",     "PC / Steam", "Monitor"),
               ("console", "Konsole (PS/Xbox/Switch)", "Gamepad2"),
               ("web",    "Web-Browser", "Globe"),
           ]),
           BUDGET_Q,
       ],
       recommendations={
           "casual":      "Unity 2D + Cloud Build – schneller Prototyp, A/B-Testing, Monetarisierung via Ads + IAP.",
           "rpg":         "Unreal Engine 5 mit Niagara/Lumen – hochwertige 3D-Welten, Cinematic-Quality.",
           "multiplayer": "Photon oder Mirror Networking + dedicated Servers – stabile Multiplayer-Infrastruktur.",
           "ar-vr":       "Unity XR Toolkit + ARKit/ARCore – plattform-übergreifend, Hand-Tracking, Spatial Audio.",
           "_default":    "Individuelle Game-Konzeption – Engine-Empfehlung nach Discovery-Workshop.",
       }),

    _t("chatbot-berater", "chatbot", "advisor",
       "Chatbot-Berater",
       "Welcher Chatbot bringt Ihrem Business den größten ROI?",
       "Bot", 15,
       questions=[
           _advisor_q("usecase", "Wofür soll der Bot eingesetzt werden?", [
               ("support",  "Kunden-Support / FAQs", "MessageCircle"),
               ("sales",    "Sales / Lead-Qualifizierung", "Target"),
               ("internal", "Interner Assistent", "Users"),
               ("voice",    "Voice-Bot (Telefon)", "Phone"),
           ]),
           _advisor_q("channels", "Wo soll der Bot erreichbar sein?", [
               ("web",       "Website-Widget", "Globe"),
               ("whatsapp",  "WhatsApp", "MessageSquare"),
               ("teams-slack", "Teams / Slack", "Users"),
               ("multi",     "Multi-Channel", "Network"),
           ]),
           BUDGET_Q,
       ],
       recommendations={
           "support":   "RAG-Chatbot mit Ihren Dokumenten als Wissensbasis – beantwortet 80% der FAQs autonom.",
           "sales":     "Sales-Bot mit Lead-Qualifizierung + CRM-Anbindung – heiße Leads direkt ans Vertriebsteam.",
           "internal":  "Interner KI-Assistent mit Zugriff auf Wiki, Tickets, HR-Daten – Mitarbeiter sparen Stunden.",
           "voice":     "Voice-Bot mit Twilio + Whisper + GPT-4 – versteht natürliche Sprache, sehr menschlich.",
           "_default":  "Custom Chatbot – wir definieren Use Case + Tech-Stack im Discovery.",
       }),

    _t("server-berater", "server", "advisor",
       "Cloud & DevOps Berater",
       "Welche Cloud-Strategie passt zu Ihrem Setup?",
       "Server", 16,
       questions=[
           _advisor_q("setup", "Was beschreibt Ihr aktuelles Setup?", [
               ("none",     "Kein Setup – Greenfield", "Sprout"),
               ("legacy",   "Legacy / On-Premise", "HardDrive"),
               ("partial",  "Teilweise Cloud", "Cloud"),
               ("cloud",    "Bereits Cloud-Native", "CloudLightning"),
           ]),
           _advisor_q("need", "Was benötigen Sie konkret?", [
               ("migrate",  "Cloud-Migration", "ArrowRight"),
               ("hosting",  "Managed Hosting", "Server"),
               ("monitor",  "Monitoring + Alerting", "Activity"),
               ("backup",   "Backup + Disaster-Recovery", "Database"),
           ]),
           BUDGET_Q,
       ],
       recommendations={
           "none":    "Greenfield Cloud-Native Setup auf AWS oder Azure – best practices von Tag 1.",
           "legacy":  "Lift-and-Shift Migration mit Stop-Gap-Modernisierung – risikoarm, schrittweise.",
           "partial": "Hybrid-Cloud-Strategie + Service-Mesh – Brücke zwischen On-Prem und Cloud.",
           "cloud":   "FinOps-Audit + Auto-Scaling-Optimierung – senken Sie Cloud-Kosten um 30–50%.",
           "_default": "Cloud-Strategie & DevOps-Roadmap – starten mit Assessment.",
       }),

    _t("marketing-berater", "marketing", "advisor",
       "Marketing & SEO Berater",
       "Welche Marketing-Maßnahme bringt jetzt am meisten?",
       "TrendingUp", 17,
       questions=[
           _advisor_q("goal", "Was ist Ihr Hauptziel?", [
               ("traffic",   "Mehr Website-Traffic", "TrendingUp"),
               ("leads",     "Mehr qualifizierte Leads", "Target"),
               ("brand",     "Markenbekanntheit", "Megaphone"),
               ("conversion", "Bessere Conversion-Rate", "Zap"),
           ]),
           _advisor_q("channel", "Welcher Kanal interessiert Sie?", [
               ("seo",       "SEO / Content", "Search"),
               ("ads",       "Google / LinkedIn Ads", "Target"),
               ("email",     "E-Mail-Marketing", "Mail"),
               ("social",    "Social Media", "Users"),
           ]),
           BUDGET_Q,
       ],
       recommendations={
           "traffic":    "SEO-Content-Strategie + 12 Monate Pillar-Content – nachhaltige organische Reichweite.",
           "leads":      "LinkedIn Lead-Gen + Sales-Funnel mit Lead-Magnet + E-Mail-Sequence.",
           "brand":      "Multi-Channel-Kampagne mit Storytelling, Influencer-Kooperationen und PR.",
           "conversion": "CRO-Audit + A/B-Testing-Setup – Conversion-Rate um 20–60% steigern.",
           "_default":   "Marketing-Audit + 90-Tage-Plan – starten mit Discovery-Call.",
       }),

    _t("design-berater", "graphic-design", "advisor",
       "Grafikdesign-Berater",
       "Welche Design-Leistung passt zu Ihrem aktuellen Bedarf?",
       "PenTool", 18,
       questions=[
           _advisor_q("scope", "Was brauchen Sie?", [
               ("brand",     "Corporate Identity / Branding", "Award"),
               ("print",     "Print-Material (Flyer, Broschüren, Plakate)", "FileText"),
               ("packaging", "Verpackungs-Design", "Package"),
               ("social",    "Social-Media-Templates", "Image"),
           ]),
           _advisor_q("urgency", "Wie dringend?", [
               ("asap",  "ASAP / diese Woche", "Zap"),
               ("month", "Innerhalb 1 Monat", "Clock"),
               ("flex",  "Flexibel", "Calendar"),
           ]),
           BUDGET_Q,
       ],
       recommendations={
           "brand":     "Komplettes Branding-Paket: Logo, Farbpalette, Typografie, Brand-Guidelines, Anwendungsbeispiele.",
           "print":     "Print-Design-Bundle mit druckfertigen PDFs (CMYK), passend zur bestehenden CI.",
           "packaging": "Verpackungs-Design inkl. Dieline, Mockups, Druckdaten und Iterations-Runden.",
           "social":    "Skalierbare Social-Media-Template-Library (Canva oder Figma) für selbstständige Befüllung.",
           "_default":  "Design-Strategie – wir definieren den passenden Scope im Briefing.",
       }),

    _t("automation-berater", "automation-ki", "advisor",
       "Automatisierungs-Berater",
       "Welche Prozesse lohnen sich für Sie zu automatisieren?",
       "Workflow", 19,
       questions=[
           _advisor_q("area", "Wo verlieren Sie aktuell am meisten Zeit?", [
               ("sales",     "Vertrieb / Lead-Bearbeitung", "Target"),
               ("support",   "Kunden-Support", "MessageCircle"),
               ("ops",       "Operativ / Buchhaltung", "Receipt"),
               ("data",      "Daten-Übertragung zwischen Systemen", "Database"),
           ]),
           _advisor_q("stack", "Welche Tools nutzen Sie?", [
               ("hubspot", "HubSpot / Salesforce", "Briefcase"),
               ("ms",      "Microsoft 365 / Teams", "Mail"),
               ("google",  "Google Workspace", "Mail"),
               ("custom",  "Eigene Systeme / APIs", "Wrench"),
           ]),
           BUDGET_Q,
       ],
       recommendations={
           "sales":   "CRM-Automatisierung mit n8n + KI-Lead-Scoring – heiße Leads werden binnen Minuten kontaktiert.",
           "support": "Automatisches Ticket-Routing + KI-Antwortvorschläge – Reaktionszeit sinkt um 70%.",
           "ops":     "Rechnungs-OCR + automatische Verbuchung – Buchhaltung spart 60% Zeit.",
           "data":    "Integrations-Bus zwischen Ihren Systemen – Datenflüsse statt Insellösungen.",
           "_default": "Prozess-Audit + 90-Tage-Automatisierungs-Roadmap.",
       }),
]


async def seed_tools_if_empty(force: bool = False) -> int:
    if not force:
        existing = await COL.count_documents({})
        if existing > 0:
            logger.info(f"Tools already seeded ({existing} docs) — skipping")
            return 0
    if SEED_TOOLS:
        # Deep-copy + fresh ids so Motor's _id injection never mutates the
        # module-level SEED_TOOLS (prevents DuplicateKeyError on later self-heals).
        fresh = copy.deepcopy(SEED_TOOLS)
        for doc in fresh:
            doc.pop("_id", None)
            doc["id"] = str(uuid.uuid4())
        await COL.insert_many(fresh)
    logger.info(f"Seeded {len(SEED_TOOLS)} tools (force={force})")
    return len(SEED_TOOLS)
