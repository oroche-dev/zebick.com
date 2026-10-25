"""All Pydantic request / response models."""

import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, ConfigDict, EmailStr, field_validator

from security import sanitize_text, ADMIN_ROLES

_ROLE_PATTERN = r"^(" + "|".join(sorted(ADMIN_ROLES)) + r")$"


# --- Auth ---

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=200)
    totp_code: Optional[str] = Field(None, max_length=10)


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    email: str
    mfa_required: bool = False


class PasswordChangeRequest(BaseModel):
    current_password: str = Field(min_length=1, max_length=200)
    new_password: str = Field(min_length=1, max_length=200)


class EmailChangeRequest(BaseModel):
    current_password: str = Field(min_length=1, max_length=200)
    new_email: EmailStr


class MfaVerifyRequest(BaseModel):
    code: str = Field(min_length=6, max_length=10)


class MfaSetupRequest(BaseModel):
    current_password: str = Field(min_length=1, max_length=200)


# --- Admin users ---

class AdminUserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str = Field(min_length=1, max_length=120)
    role: str = Field(default="admin", pattern=_ROLE_PATTERN)


class AdminUser(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    role: str = "admin"
    password_hash: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_by: Optional[str] = None
    is_active: bool = True
    mfa_enabled: bool = False
    totp_secret: Optional[str] = None


class AdminUserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    created_at: datetime
    is_active: bool
    mfa_enabled: bool = False


# --- Status ---

class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class StatusCheckCreate(BaseModel):
    client_name: str = Field(min_length=1, max_length=200)


# --- Newsletter ---

class NewsletterSubscribe(BaseModel):
    email: EmailStr


class NewsletterSubscriber(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    subscribed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: str = "pending"
    confirmed_at: Optional[datetime] = None
    consent_version: str = "zebick-newsletter-2026-10"


# --- Contact form ---

class ContactFormSubmit(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=50)
    company: Optional[str] = Field(None, max_length=200)
    service: Optional[str] = Field(None, max_length=100)
    budget: Optional[str] = Field(None, max_length=100)
    message: str = Field(min_length=1, max_length=5000)
    # Set only by the internal tool widgets (via submitLead's `tool` param) to
    # identify which tool/booking flow a submission came from, independent of
    # whatever the visitor typed as their name — never shown to the visitor,
    # used only to tag the resulting CRM lead's origin server-side.
    tool_origin: Optional[str] = Field(None, max_length=60)

    @field_validator("name", "phone", "company", "service", "budget", "message", "tool_origin")
    @classmethod
    def _strip_html(cls, v):
        return sanitize_text(v, max_length=5000) if v else v


class ContactFormEntry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: Optional[str] = None
    company: Optional[str] = None
    service: Optional[str] = None
    budget: Optional[str] = None
    message: str
    submitted_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    # Pipeline: new → contacted → offer_sent → won → lost
    status: str = "new"
    deal_value: Optional[float] = None  # estimated revenue in EUR
    customer_id: Optional[str] = None  # link to CRM customer when converted
    notes: Optional[str] = None
    assigned_to: Optional[str] = None  # admin email


# --- Leads ---

class LeadCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    company: Optional[str] = Field(None, max_length=200)
    service: Optional[str] = Field(None, max_length=100)
    budget: Optional[str] = Field(None, max_length=100)
    message: str = Field(min_length=1, max_length=5000)

    @field_validator("name", "company", "service", "budget", "message")
    @classmethod
    def _strip_html(cls, v):
        return sanitize_text(v, max_length=5000) if v else v


class Lead(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    company: Optional[str] = None
    service: Optional[str] = None
    budget: Optional[str] = None
    message: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# --- Chat ---

class ChatMessage(BaseModel):
    session_id: Optional[str] = Field(None, max_length=100)
    message: str = Field(min_length=1, max_length=2000)


class ChatResponse(BaseModel):
    session_id: str
    response: str


# --- Game ---

class GameScoreCreate(BaseModel):
    player_name: str = Field(min_length=1, max_length=20)
    score: int = Field(ge=0, le=999999999)
    game_id: str = Field(default="space-defender", max_length=50)


class GameScore(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    player_name: str
    score: int
    game_id: str = "space-defender"
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class LeaderboardEntry(BaseModel):
    rank: int
    player_name: str
    score: int
    timestamp: str


# --- Testimonials ---

class TestimonialCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    company: Optional[str] = Field(None, max_length=200)
    position: Optional[str] = Field(None, max_length=200)
    email: Optional[EmailStr] = None
    content: str = Field(min_length=10, max_length=1000)
    rating: int = Field(ge=1, le=5)

    @field_validator("name", "company", "position", "content")
    @classmethod
    def _strip_html(cls, v):
        return sanitize_text(v, 1000) if v else v


class Testimonial(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    company: Optional[str] = None
    position: Optional[str] = None
    email: Optional[str] = None
    content: str
    rating: int
    status: str = "pending"
    submitted_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    approved_at: Optional[datetime] = None


class TestimonialPublic(BaseModel):
    id: str
    name: str
    company: Optional[str] = None
    position: Optional[str] = None
    content: str
    rating: int


# --- Portfolio Projects ---

class ProjectMetric(BaseModel):
    label: str = Field(min_length=1, max_length=60)
    value: str = Field(min_length=1, max_length=60)


class ProcessStep(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    description: str = Field(min_length=1, max_length=600)
    icon: Optional[str] = Field(None, max_length=40)  # lucide icon name (optional)


class TechItem(BaseModel):
    name: str = Field(min_length=1, max_length=60)
    logo: Optional[str] = Field(None, max_length=500)  # URL or simpleicons slug


class ProjectCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    subtitle: Optional[str] = Field(None, max_length=300)
    slug: Optional[str] = Field(None, max_length=200)
    category: str = Field(min_length=1, max_length=80)
    service_id: Optional[str] = Field(None, max_length=80)
    client: Optional[str] = Field(None, max_length=160)
    year: Optional[str] = Field(None, max_length=20)
    duration: Optional[str] = Field(None, max_length=60)
    description: str = Field(min_length=1, max_length=600)
    website_type: Optional[str] = Field(None, max_length=120)  # NEW: "E-Commerce Plattform" etc.
    about_project: Optional[str] = Field(None, max_length=2000)  # NEW: detailed description of what kind of website
    challenge: Optional[str] = Field(None, max_length=4000)
    solution: Optional[str] = Field(None, max_length=4000)
    outcome: Optional[str] = Field(None, max_length=4000)
    process_steps: List[ProcessStep] = Field(default_factory=list)  # NEW: "Vorgang"
    tags: List[str] = Field(default_factory=list)
    tech_stack: List[str] = Field(default_factory=list)
    tech_stack_detailed: List[TechItem] = Field(default_factory=list)  # NEW: with logos
    metrics: List[ProjectMetric] = Field(default_factory=list)
    cover_image: Optional[str] = None  # URL or data URI
    gallery: List[str] = Field(default_factory=list)
    website_url: Optional[str] = Field(None, max_length=500)
    testimonial_quote: Optional[str] = Field(None, max_length=800)
    testimonial_author: Optional[str] = Field(None, max_length=160)
    testimonial_position: Optional[str] = Field(None, max_length=160)  # NEW
    testimonial_rating: Optional[int] = Field(None, ge=1, le=5)  # NEW
    testimonial_avatar: Optional[str] = Field(None, max_length=2000)  # NEW
    featured: bool = False
    published: bool = True
    order: int = 0

    @field_validator("title", "subtitle", "description", "about_project", "challenge", "solution", "outcome",
                     "client", "testimonial_quote", "testimonial_author", "testimonial_position", "website_type")
    @classmethod
    def _strip_html(cls, v):
        return sanitize_text(v, 4000) if v else v


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    slug: Optional[str] = None
    category: Optional[str] = None
    service_id: Optional[str] = None
    client: Optional[str] = None
    year: Optional[str] = None
    duration: Optional[str] = None
    description: Optional[str] = None
    website_type: Optional[str] = None
    about_project: Optional[str] = None
    challenge: Optional[str] = None
    solution: Optional[str] = None
    outcome: Optional[str] = None
    process_steps: Optional[List[ProcessStep]] = None
    tags: Optional[List[str]] = None
    tech_stack: Optional[List[str]] = None
    tech_stack_detailed: Optional[List[TechItem]] = None
    metrics: Optional[List[ProjectMetric]] = None
    cover_image: Optional[str] = None
    gallery: Optional[List[str]] = None
    website_url: Optional[str] = None
    testimonial_quote: Optional[str] = None
    testimonial_author: Optional[str] = None
    testimonial_position: Optional[str] = None
    testimonial_rating: Optional[int] = None
    testimonial_avatar: Optional[str] = None
    featured: Optional[bool] = None
    published: Optional[bool] = None
    order: Optional[int] = None

    @field_validator("title", "subtitle", "description", "about_project", "challenge", "solution", "outcome",
                     "client", "testimonial_quote", "testimonial_author", "testimonial_position", "website_type")
    @classmethod
    def _strip_html(cls, v):
        return sanitize_text(v, 4000) if v else v


class Project(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    subtitle: Optional[str] = None
    slug: str
    category: str
    service_id: Optional[str] = None
    client: Optional[str] = None
    year: Optional[str] = None
    duration: Optional[str] = None
    description: str
    website_type: Optional[str] = None
    about_project: Optional[str] = None
    challenge: Optional[str] = None
    solution: Optional[str] = None
    outcome: Optional[str] = None
    process_steps: List[ProcessStep] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)
    tech_stack: List[str] = Field(default_factory=list)
    tech_stack_detailed: List[TechItem] = Field(default_factory=list)
    metrics: List[ProjectMetric] = Field(default_factory=list)
    cover_image: Optional[str] = None
    gallery: List[str] = Field(default_factory=list)
    website_url: Optional[str] = None
    testimonial_quote: Optional[str] = None
    testimonial_author: Optional[str] = None
    testimonial_position: Optional[str] = None
    testimonial_rating: Optional[int] = None
    testimonial_avatar: Optional[str] = None
    featured: bool = False
    published: bool = True
    order: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


__all__ = [
    "LoginRequest", "LoginResponse", "PasswordChangeRequest", "EmailChangeRequest", "MfaVerifyRequest",
    "AdminUserCreate", "AdminUser", "AdminUserResponse",
    "StatusCheck", "StatusCheckCreate",
    "NewsletterSubscribe", "NewsletterSubscriber",
    "ContactFormSubmit", "ContactFormEntry",
    "LeadCreate", "Lead",
    "ChatMessage", "ChatResponse",
    "GameScoreCreate", "GameScore", "LeaderboardEntry",
    "TestimonialCreate", "Testimonial", "TestimonialPublic",
    "ProjectCreate", "ProjectUpdate", "Project", "ProjectMetric", "ProcessStep", "TechItem",
    "CustomerCreate", "CustomerUpdate", "Customer",
    "ContactStatusUpdate", "Activity",
    "List",
]


# --- CRM Customer ---

class CustomerCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=50)
    company: Optional[str] = Field(None, max_length=200)
    address: Optional[str] = Field(None, max_length=400)
    tags: List[str] = Field(default_factory=list)
    notes: Optional[str] = Field(None, max_length=5000)
    source: Optional[str] = Field(None, max_length=120)  # e.g. "contact_form", "manual"

    @field_validator("name", "phone", "company", "address", "notes", "source")
    @classmethod
    def _strip_html(cls, v):
        return sanitize_text(v, 5000) if v else v


class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    address: Optional[str] = None
    tags: Optional[List[str]] = None
    notes: Optional[str] = None
    status: Optional[str] = None  # active / archived

    @field_validator("name", "phone", "company", "address", "notes")
    @classmethod
    def _strip_html(cls, v):
        return sanitize_text(v, 5000) if v else v


class Customer(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: Optional[str] = None
    company: Optional[str] = None
    address: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    notes: Optional[str] = None
    source: Optional[str] = None
    status: str = "active"
    total_revenue: float = 0.0
    request_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# --- Contact status update (admin) ---

class ContactStatusUpdate(BaseModel):
    status: Optional[str] = Field(None, max_length=30)  # new / contacted / offer_sent / won / lost
    deal_value: Optional[float] = Field(None, ge=0, le=10_000_000)
    notes: Optional[str] = Field(None, max_length=5000)
    assigned_to: Optional[str] = Field(None, max_length=200)

    @field_validator("status", "notes", "assigned_to")
    @classmethod
    def _strip_html(cls, v):
        return sanitize_text(v, 5000) if v else v


# --- Admin email / inbox / template payloads ---

class ContactEmailSend(BaseModel):
    template_key: Optional[str] = Field(None, max_length=100)
    custom_subject: Optional[str] = Field(None, max_length=200)
    custom_body_html: Optional[str] = Field(None, max_length=50000)
    custom_body_text: Optional[str] = Field(None, max_length=20000)
    context: Optional[Dict[str, Any]] = None
    attach_offer_pdf: Optional[bool] = None


class AdHocEmailSend(BaseModel):
    to_email: EmailStr
    subject: str = Field(..., min_length=1, max_length=200)
    html_content: str = Field(..., min_length=1, max_length=100_000)


class InboxEmailUpdate(BaseModel):
    starred: Optional[bool] = None
    read: Optional[bool] = None
    archived: Optional[bool] = None


class InboxReply(BaseModel):
    body: Optional[str] = Field(None, max_length=20000)
    include_quote: bool = True


class AutoTemplateUpdate(BaseModel):
    subject: Optional[str] = Field(None, max_length=200)
    body_html: Optional[str] = Field(None, max_length=50000)
    body_text: Optional[str] = Field(None, max_length=20000)
    enabled: Optional[bool] = None


class AutoTemplateTest(BaseModel):
    to_email: Optional[str] = Field(None, max_length=254)
    context: Optional[Dict[str, Any]] = None


# --- Activity feed ---

class Activity(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str  # contact_created, status_changed, customer_created, ...
    title: str
    description: Optional[str] = None
    actor: Optional[str] = None  # admin email or "system"
    related_id: Optional[str] = None
    related_type: Optional[str] = None  # contact / customer / project
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
