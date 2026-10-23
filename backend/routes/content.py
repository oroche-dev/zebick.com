"""Content management: blog posts, team members, FAQ, custom services, home content."""

import re
import json
import uuid
import logging
from datetime import datetime, timezone
from typing import List, Optional, Any, Dict

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from pydantic import BaseModel, Field, ConfigDict

from security import db, get_current_user, audit_log, sanitize_text

logger = logging.getLogger("zebick.content")
router = APIRouter(prefix="/api")


def _slugify(text: str) -> str:
    text = (text or "").lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[-\s]+", "-", text)
    return text.strip("-") or "eintrag"


async def _unique_slug(collection, base: str, exclude_id: Optional[str] = None) -> str:
    slug = _slugify(base)
    candidate = slug
    i = 2
    while True:
        q: Dict[str, Any] = {"slug": candidate}
        if exclude_id:
            q["id"] = {"$ne": exclude_id}
        if not await collection.find_one(q):
            return candidate
        candidate = f"{slug}-{i}"
        i += 1


# ===================================================================
#   BLOG POSTS
# ===================================================================

class BlogPostCreate(BaseModel):
    title: str = Field(min_length=1, max_length=250)
    excerpt: str = Field(min_length=1, max_length=500)
    content: str = Field(default="", max_length=60000)  # markdown
    author: Optional[str] = Field(None, max_length=120)
    category: Optional[str] = Field(None, max_length=80)
    tags: List[str] = Field(default_factory=list)
    cover_image: Optional[str] = None
    read_time: Optional[str] = Field(None, max_length=20)
    slug: Optional[str] = Field(None, max_length=250)
    published: bool = True
    featured: bool = False


class BlogPostUpdate(BaseModel):
    title: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    author: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    cover_image: Optional[str] = None
    read_time: Optional[str] = None
    slug: Optional[str] = None
    published: Optional[bool] = None
    featured: Optional[bool] = None


class BlogPost(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    excerpt: str
    content: str = ""
    author: Optional[str] = None
    category: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    cover_image: Optional[str] = None
    read_time: Optional[str] = None
    slug: str
    published: bool = True
    featured: bool = False
    published_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


@router.get("/blog/posts", response_model=List[BlogPost])
async def public_list_posts(
    category: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=200),
):
    q: Dict[str, Any] = {"published": True}
    if category and category.lower() != "alle":
        q["category"] = category
    cursor = db.blog_posts.find(q).sort("published_at", -1).limit(limit)
    return [BlogPost(**d) for d in await cursor.to_list(limit)]


@router.get("/blog/posts/{slug}", response_model=BlogPost)
async def public_get_post(slug: str):
    doc = await db.blog_posts.find_one({"slug": slug, "published": True})
    if not doc:
        raise HTTPException(404, "Artikel nicht gefunden")
    return BlogPost(**doc)


@router.get("/blog/categories", response_model=List[str])
async def public_blog_categories():
    cats = await db.blog_posts.distinct("category", {"published": True})
    return sorted([c for c in cats if c])


@router.get("/admin/blog/posts", response_model=List[BlogPost])
async def admin_list_posts(current: dict = Depends(get_current_user)):
    cursor = db.blog_posts.find({}).sort("published_at", -1)
    return [BlogPost(**d) for d in await cursor.to_list(500)]


@router.get("/admin/blog/posts/{post_id}", response_model=BlogPost)
async def admin_get_post(post_id: str, current: dict = Depends(get_current_user)):
    doc = await db.blog_posts.find_one({"id": post_id})
    if not doc:
        raise HTTPException(404, "Artikel nicht gefunden")
    return BlogPost(**doc)


@router.post("/admin/blog/posts", response_model=BlogPost)
async def admin_create_post(payload: BlogPostCreate, request: Request, current: dict = Depends(get_current_user)):
    data = payload.model_dump()
    data["title"] = sanitize_text(data["title"], 250)
    data["excerpt"] = sanitize_text(data["excerpt"], 500)
    src = data.get("slug") or data["title"]
    data["slug"] = await _unique_slug(db.blog_posts, src)
    post = BlogPost(**data)
    await db.blog_posts.insert_one(post.model_dump())
    await audit_log("blog.create", current.get("email"), request, {"id": post.id, "title": post.title})
    return post


@router.patch("/admin/blog/posts/{post_id}", response_model=BlogPost)
async def admin_update_post(post_id: str, payload: BlogPostUpdate, request: Request, current: dict = Depends(get_current_user)):
    existing = await db.blog_posts.find_one({"id": post_id})
    if not existing:
        raise HTTPException(404, "Artikel nicht gefunden")
    update = {k: v for k, v in payload.model_dump(exclude_unset=True).items()}
    if "title" in update and update["title"]:
        update["title"] = sanitize_text(update["title"], 250)
    if "excerpt" in update and update["excerpt"]:
        update["excerpt"] = sanitize_text(update["excerpt"], 500)
    if "slug" in update and update["slug"]:
        update["slug"] = await _unique_slug(db.blog_posts, update["slug"], exclude_id=post_id)
    update["updated_at"] = datetime.now(timezone.utc)
    await db.blog_posts.update_one({"id": post_id}, {"$set": update})
    doc = await db.blog_posts.find_one({"id": post_id})
    await audit_log("blog.update", current.get("email"), request, {"id": post_id})
    return BlogPost(**doc)


@router.delete("/admin/blog/posts/{post_id}")
async def admin_delete_post(post_id: str, request: Request, current: dict = Depends(get_current_user)):
    r = await db.blog_posts.delete_one({"id": post_id})
    if r.deleted_count == 0:
        raise HTTPException(404, "Artikel nicht gefunden")
    await audit_log("blog.delete", current.get("email"), request, {"id": post_id})
    return {"success": True}


# ===================================================================
#   TEAM MEMBERS
# ===================================================================

class TeamMemberBase(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    role: str = Field(min_length=1, max_length=120)
    bio: Optional[str] = Field(None, max_length=800)
    image: Optional[str] = None
    linkedin: Optional[str] = Field(None, max_length=300)
    order: int = 0
    published: bool = True


class TeamMember(TeamMemberBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class TeamMemberUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    bio: Optional[str] = None
    image: Optional[str] = None
    linkedin: Optional[str] = None
    order: Optional[int] = None
    published: Optional[bool] = None


@router.get("/team/members", response_model=List[TeamMember])
async def public_list_team():
    cursor = db.team_members.find({"published": True}).sort("order", 1)
    return [TeamMember(**d) for d in await cursor.to_list(200)]


@router.get("/admin/team/members", response_model=List[TeamMember])
async def admin_list_team(current: dict = Depends(get_current_user)):
    cursor = db.team_members.find({}).sort("order", 1)
    return [TeamMember(**d) for d in await cursor.to_list(500)]


@router.post("/admin/team/members", response_model=TeamMember)
async def admin_create_team(payload: TeamMemberBase, request: Request, current: dict = Depends(get_current_user)):
    data = payload.model_dump()
    if data.get("bio"):
        data["bio"] = sanitize_text(data["bio"], 800)
    m = TeamMember(**data)
    await db.team_members.insert_one(m.model_dump())
    await audit_log("team.create", current.get("email"), request, {"id": m.id})
    return m


@router.patch("/admin/team/members/{member_id}", response_model=TeamMember)
async def admin_update_team(member_id: str, payload: TeamMemberUpdate, request: Request, current: dict = Depends(get_current_user)):
    if not await db.team_members.find_one({"id": member_id}):
        raise HTTPException(404, "Mitglied nicht gefunden")
    update = {k: v for k, v in payload.model_dump(exclude_unset=True).items()}
    if update.get("bio"):
        update["bio"] = sanitize_text(update["bio"], 800)
    await db.team_members.update_one({"id": member_id}, {"$set": update})
    doc = await db.team_members.find_one({"id": member_id})
    await audit_log("team.update", current.get("email"), request, {"id": member_id})
    return TeamMember(**doc)


@router.delete("/admin/team/members/{member_id}")
async def admin_delete_team(member_id: str, request: Request, current: dict = Depends(get_current_user)):
    r = await db.team_members.delete_one({"id": member_id})
    if r.deleted_count == 0:
        raise HTTPException(404, "Mitglied nicht gefunden")
    await audit_log("team.delete", current.get("email"), request, {"id": member_id})
    return {"success": True}


# ===================================================================
#   FAQ
# ===================================================================

class FAQBase(BaseModel):
    question: str = Field(min_length=1, max_length=400)
    answer: str = Field(min_length=1, max_length=4000)
    category: Optional[str] = Field(None, max_length=80)
    order: int = 0
    published: bool = True


class FAQItem(FAQBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class FAQUpdate(BaseModel):
    question: Optional[str] = None
    answer: Optional[str] = None
    category: Optional[str] = None
    order: Optional[int] = None
    published: Optional[bool] = None


@router.get("/faq/items", response_model=List[FAQItem])
async def public_list_faq():
    cursor = db.faqs.find({"published": True}).sort("order", 1)
    return [FAQItem(**d) for d in await cursor.to_list(200)]


@router.get("/admin/faq/items", response_model=List[FAQItem])
async def admin_list_faq(current: dict = Depends(get_current_user)):
    cursor = db.faqs.find({}).sort("order", 1)
    return [FAQItem(**d) for d in await cursor.to_list(500)]


@router.post("/admin/faq/items", response_model=FAQItem)
async def admin_create_faq(payload: FAQBase, request: Request, current: dict = Depends(get_current_user)):
    data = payload.model_dump()
    data["question"] = sanitize_text(data["question"], 400)
    data["answer"] = sanitize_text(data["answer"], 4000)
    item = FAQItem(**data)
    await db.faqs.insert_one(item.model_dump())
    await audit_log("faq.create", current.get("email"), request, {"id": item.id})
    return item


@router.patch("/admin/faq/items/{item_id}", response_model=FAQItem)
async def admin_update_faq(item_id: str, payload: FAQUpdate, request: Request, current: dict = Depends(get_current_user)):
    if not await db.faqs.find_one({"id": item_id}):
        raise HTTPException(404, "FAQ nicht gefunden")
    update = {k: v for k, v in payload.model_dump(exclude_unset=True).items()}
    if update.get("question"):
        update["question"] = sanitize_text(update["question"], 400)
    if update.get("answer"):
        update["answer"] = sanitize_text(update["answer"], 4000)
    await db.faqs.update_one({"id": item_id}, {"$set": update})
    doc = await db.faqs.find_one({"id": item_id})
    await audit_log("faq.update", current.get("email"), request, {"id": item_id})
    return FAQItem(**doc)


@router.delete("/admin/faq/items/{item_id}")
async def admin_delete_faq(item_id: str, request: Request, current: dict = Depends(get_current_user)):
    r = await db.faqs.delete_one({"id": item_id})
    if r.deleted_count == 0:
        raise HTTPException(404, "FAQ nicht gefunden")
    await audit_log("faq.delete", current.get("email"), request, {"id": item_id})
    return {"success": True}


# ===================================================================
#   CUSTOM SERVICES (additional services beyond the hardcoded ones)
# ===================================================================

class ServiceBase(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    description: str = Field(min_length=1, max_length=600)
    icon: Optional[str] = Field(None, max_length=40)  # lucide icon name
    link: Optional[str] = Field(None, max_length=200)
    color: Optional[str] = Field(None, max_length=30)
    order: int = 0
    published: bool = True


class ServiceItem(ServiceBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ServiceUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    link: Optional[str] = None
    color: Optional[str] = None
    order: Optional[int] = None
    published: Optional[bool] = None


@router.get("/services/custom", response_model=List[ServiceItem])
async def public_list_services():
    cursor = db.custom_services.find({"published": True}).sort("order", 1)
    return [ServiceItem(**d) for d in await cursor.to_list(200)]


@router.get("/admin/services/custom", response_model=List[ServiceItem])
async def admin_list_services(current: dict = Depends(get_current_user)):
    cursor = db.custom_services.find({}).sort("order", 1)
    return [ServiceItem(**d) for d in await cursor.to_list(500)]


@router.post("/admin/services/custom", response_model=ServiceItem)
async def admin_create_service(payload: ServiceBase, request: Request, current: dict = Depends(get_current_user)):
    data = payload.model_dump()
    data["title"] = sanitize_text(data["title"], 120)
    data["description"] = sanitize_text(data["description"], 600)
    s = ServiceItem(**data)
    await db.custom_services.insert_one(s.model_dump())
    await audit_log("service.create", current.get("email"), request, {"id": s.id})
    return s


@router.patch("/admin/services/custom/{service_id}", response_model=ServiceItem)
async def admin_update_service(service_id: str, payload: ServiceUpdate, request: Request, current: dict = Depends(get_current_user)):
    if not await db.custom_services.find_one({"id": service_id}):
        raise HTTPException(404, "Service nicht gefunden")
    update = {k: v for k, v in payload.model_dump(exclude_unset=True).items()}
    if update.get("title"):
        update["title"] = sanitize_text(update["title"], 120)
    if update.get("description"):
        update["description"] = sanitize_text(update["description"], 600)
    await db.custom_services.update_one({"id": service_id}, {"$set": update})
    doc = await db.custom_services.find_one({"id": service_id})
    await audit_log("service.update", current.get("email"), request, {"id": service_id})
    return ServiceItem(**doc)


@router.delete("/admin/services/custom/{service_id}")
async def admin_delete_service(service_id: str, request: Request, current: dict = Depends(get_current_user)):
    r = await db.custom_services.delete_one({"id": service_id})
    if r.deleted_count == 0:
        raise HTTPException(404, "Service nicht gefunden")
    await audit_log("service.delete", current.get("email"), request, {"id": service_id})
    return {"success": True}


# ===================================================================
#   HOME CONTENT (key-value store, single document)
# ===================================================================

DEFAULT_HOME_CONTENT: Dict[str, Any] = {
    "hero_badge": "Digitale Exzellenz seit 2024",
    "hero_title_line1": "Ihre Vision,",
    "hero_title_line2": "perfekt umgesetzt.",
    "hero_description": "Wir verbinden Technologie, Design und Sicherheit zu digitalen Produkten, die begeistern und Ergebnisse liefern.",
    "hero_cta_primary": "Projekt starten",
    "hero_cta_secondary": "Portfolio ansehen",
    "stats_projects": "50+",
    "stats_clients": "50+",
    "stats_years": "2+",
    "stats_countries": "3",
    "cta_title": "Bereit, Ihr nächstes Projekt zu starten?",
    "cta_description": "Lassen Sie uns gemeinsam etwas Großartiges schaffen.",
    "cta_button": "Kostenloses Erstgespräch",
}


HOME_CONTENT_MAX_BYTES = 64 * 1024


@router.get("/content/home")
async def get_home_content():
    doc = await db.site_content.find_one({"_id": "home"}) or {}
    out = dict(DEFAULT_HOME_CONTENT)
    for k, v in doc.items():
        if k != "_id":
            out[k] = v
    return out


@router.get("/admin/content/home")
async def admin_get_home(current: dict = Depends(get_current_user)):
    doc = await db.site_content.find_one({"_id": "home"}) or {}
    out = dict(DEFAULT_HOME_CONTENT)
    for k, v in doc.items():
        if k != "_id":
            out[k] = v
    return out


@router.put("/admin/content/home")
async def admin_update_home(payload: Dict[str, Any], request: Request, current: dict = Depends(get_current_user)):
    # Free-form CMS key/value store (frontend PUTs back whatever GET returned),
    # so no fixed schema — just cap the total size.
    if len(json.dumps(payload, default=str)) > HOME_CONTENT_MAX_BYTES:
        raise HTTPException(413, "Inhalt zu groß")
    # Sanitize string values
    clean: Dict[str, Any] = {}
    for k, v in payload.items():
        if k.startswith("_") or k == "id":
            continue
        if isinstance(v, str):
            clean[k] = sanitize_text(v, 2000)
        else:
            clean[k] = v
    clean["updated_at"] = datetime.now(timezone.utc)
    await db.site_content.update_one({"_id": "home"}, {"$set": clean}, upsert=True)
    await audit_log("home.update", current.get("email"), request, {})
    return {"success": True}
