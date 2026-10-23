"""Portfolio projects CRUD — public read + admin write."""

import re
import logging
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request

from security import db, get_current_user, audit_log
from models import Project, ProjectCreate, ProjectUpdate

logger = logging.getLogger("zebick.portfolio")
router = APIRouter(prefix="/api")


def _slugify(text: str) -> str:
    text = (text or "").lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[-\s]+", "-", text)
    return text.strip("-") or "projekt"


async def _unique_slug(base: str, exclude_id: Optional[str] = None) -> str:
    slug = _slugify(base)
    candidate = slug
    i = 2
    while True:
        query = {"slug": candidate}
        if exclude_id:
            query["id"] = {"$ne": exclude_id}
        existing = await db.projects.find_one(query)
        if not existing:
            return candidate
        candidate = f"{slug}-{i}"
        i += 1


# =============== PUBLIC ===============

@router.get("/portfolio/projects", response_model=List[Project])
async def list_public_projects(
    category: Optional[str] = Query(None),
    featured: Optional[bool] = Query(None),
    limit: int = Query(100, ge=1, le=200),
):
    query: dict = {"published": True}
    if category and category.lower() != "alle":
        query["category"] = category
    if featured is not None:
        query["featured"] = featured
    cursor = db.projects.find(query).sort([("order", 1), ("created_at", -1)]).limit(limit)
    items = await cursor.to_list(limit)
    return [Project(**p) for p in items]


@router.get("/portfolio/projects/{slug}", response_model=Project)
async def get_public_project(slug: str):
    doc = await db.projects.find_one({"slug": slug, "published": True})
    if not doc:
        raise HTTPException(404, "Projekt nicht gefunden")
    return Project(**doc)


@router.get("/portfolio/categories", response_model=List[str])
async def list_categories():
    cats = await db.projects.distinct("category", {"published": True})
    return sorted([c for c in cats if c])


# =============== ADMIN ===============

@router.get("/admin/portfolio/projects", response_model=List[Project])
async def admin_list_projects(current: dict = Depends(get_current_user)):
    cursor = db.projects.find({}).sort([("order", 1), ("created_at", -1)])
    items = await cursor.to_list(500)
    return [Project(**p) for p in items]


@router.get("/admin/portfolio/projects/{project_id}", response_model=Project)
async def admin_get_project(project_id: str, current: dict = Depends(get_current_user)):
    doc = await db.projects.find_one({"id": project_id})
    if not doc:
        raise HTTPException(404, "Projekt nicht gefunden")
    return Project(**doc)


@router.post("/admin/portfolio/projects", response_model=Project)
async def admin_create_project(
    payload: ProjectCreate,
    request: Request,
    current: dict = Depends(get_current_user),
):
    data = payload.model_dump()
    slug_src = data.get("slug") or data["title"]
    data["slug"] = await _unique_slug(slug_src)
    project = Project(**data)
    await db.projects.insert_one(project.model_dump())
    await audit_log("portfolio.create", current.get("email"), request, {"id": project.id, "title": project.title})
    return project


@router.patch("/admin/portfolio/projects/{project_id}", response_model=Project)
async def admin_update_project(
    project_id: str,
    payload: ProjectUpdate,
    request: Request,
    current: dict = Depends(get_current_user),
):
    existing = await db.projects.find_one({"id": project_id})
    if not existing:
        raise HTTPException(404, "Projekt nicht gefunden")

    update = {k: v for k, v in payload.model_dump(exclude_unset=True).items() if v is not None or k in {"subtitle", "challenge", "solution", "outcome", "cover_image", "client", "year", "duration", "website_url", "testimonial_quote", "testimonial_author", "testimonial_position", "testimonial_rating", "testimonial_avatar", "website_type", "about_project", "service_id"}}

    if "slug" in update and update["slug"]:
        update["slug"] = await _unique_slug(update["slug"], exclude_id=project_id)
    elif "title" in update and not existing.get("slug"):
        update["slug"] = await _unique_slug(update["title"], exclude_id=project_id)

    # Normalize metrics sub-models to dicts
    if "metrics" in update and update["metrics"] is not None:
        update["metrics"] = [m if isinstance(m, dict) else m.model_dump() for m in update["metrics"]]
    if "process_steps" in update and update["process_steps"] is not None:
        update["process_steps"] = [m if isinstance(m, dict) else m.model_dump() for m in update["process_steps"]]
    if "tech_stack_detailed" in update and update["tech_stack_detailed"] is not None:
        update["tech_stack_detailed"] = [m if isinstance(m, dict) else m.model_dump() for m in update["tech_stack_detailed"]]

    update["updated_at"] = datetime.now(timezone.utc)
    await db.projects.update_one({"id": project_id}, {"$set": update})
    doc = await db.projects.find_one({"id": project_id})
    await audit_log("portfolio.update", current.get("email"), request, {"id": project_id})
    return Project(**doc)


@router.delete("/admin/portfolio/projects/{project_id}")
async def admin_delete_project(project_id: str, request: Request, current: dict = Depends(get_current_user)):
    result = await db.projects.delete_one({"id": project_id})
    if result.deleted_count == 0:
        raise HTTPException(404, "Projekt nicht gefunden")
    await audit_log("portfolio.delete", current.get("email"), request, {"id": project_id})
    return {"success": True}


@router.post("/admin/portfolio/reorder")
async def admin_reorder_projects(
    payload: dict,
    request: Request,
    current: dict = Depends(get_current_user),
):
    ids = payload.get("ids", [])
    for idx, pid in enumerate(ids):
        await db.projects.update_one({"id": pid}, {"$set": {"order": idx, "updated_at": datetime.now(timezone.utc)}})
    await audit_log("portfolio.reorder", current.get("email"), request, {"count": len(ids)})
    return {"success": True, "count": len(ids)}
