"""Full-flow smoke test suite for Zebick backend (iteration 1).

Covers:
  - Public GETs (portfolio, blog, team, faq, categories, tools, service pages, testimonials/approved)
  - Public POSTs (contact, newsletter, testimonial, leads/capture)
  - Admin login (JWT) + verify
  - Admin auth guard (401 without token)
  - A representative sample of admin GET list endpoints across major modules
"""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "http://localhost:8001").rstrip("/")
API = f"{BASE_URL}/api"
ADMIN_EMAIL = os.environ.get("TEST_ADMIN_EMAIL", "admin@zebick.com")
ADMIN_PASSWORD = os.environ.get("TEST_ADMIN_PASSWORD", "")


@pytest.fixture(scope="session")
def token():
    r = requests.post(f"{API}/admin/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=30)
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text[:300]}"
    data = r.json()
    assert data.get("token") or data.get("access_token")
    return data.get("token") or data.get("access_token")


@pytest.fixture(scope="session")
def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


# ---------------- PUBLIC GET ----------------

PUBLIC_GETS = [
    ("/health", None),
    ("/portfolio/projects", 5),           # 7 seeded → expect >=5
    ("/portfolio/categories", None),
    ("/blog/posts", 3),                   # 6 seeded
    ("/blog/categories", None),
    ("/team/members", 3),                 # 4 seeded
    ("/faq/items", 3),                    # 5 seeded
    ("/services/custom", None),
    ("/catalog/categories", None),        # dict {total, categories}, see test_catalog_categories
    ("/catalog/services", None),
    ("/tools", 5),                        # 16 seeded
    ("/testimonials/approved", None),
    ("/settings/public", None),
]


@pytest.mark.parametrize("path,min_count", PUBLIC_GETS)
def test_public_get(path, min_count):
    r = requests.get(f"{API}{path}", timeout=30)
    assert r.status_code == 200, f"{path} -> {r.status_code}: {r.text[:200]}"
    if min_count is not None:
        body = r.json()
        assert isinstance(body, list), f"{path} not list"
        assert len(body) >= min_count, f"{path} returned {len(body)} items (< {min_count})"


def test_catalog_categories():
    body = requests.get(f"{API}/catalog/categories", timeout=30).json()
    assert body["total"] >= 5 and len(body["categories"]) == body["total"]  # 9 seeded


def test_portfolio_project_detail_by_slug():
    lst = requests.get(f"{API}/portfolio/projects", timeout=30).json()
    assert lst, "No projects seeded"
    slug = lst[0]["slug"]
    r = requests.get(f"{API}/portfolio/projects/{slug}", timeout=30)
    assert r.status_code == 200
    assert r.json()["slug"] == slug


def test_blog_post_detail_by_slug():
    lst = requests.get(f"{API}/blog/posts", timeout=30).json()
    assert lst
    slug = lst[0]["slug"]
    r = requests.get(f"{API}/blog/posts/{slug}", timeout=30)
    assert r.status_code == 200
    assert r.json()["slug"] == slug


def test_tool_detail_by_slug():
    lst = requests.get(f"{API}/tools", timeout=30).json()
    assert lst
    slug = lst[0]["slug"]
    r = requests.get(f"{API}/tools/{slug}", timeout=30)
    assert r.status_code == 200


# ---------------- PUBLIC POST ----------------

def _uniq(prefix: str) -> str:
    return f"TEST_{prefix}_{uuid.uuid4().hex[:8]}"


def test_contact_form_submit():
    payload = {
        "name": _uniq("contact"),
        "email": f"{_uniq('c')}@example.com",
        "message": "Hallo, ich moechte ein Angebot fuer eine Website.",
        "service": "Webentwicklung",
        "budget": "5000-10000",
    }
    r = requests.post(f"{API}/contact/submit", json=payload, timeout=30)
    assert r.status_code == 200, r.text[:300]
    data = r.json()
    assert data["email"] == payload["email"]
    assert data["name"] == payload["name"]
    assert "id" in data


def test_newsletter_subscribe():
    email = f"{_uniq('nl')}@example.com"
    r = requests.post(f"{API}/newsletter/subscribe", json={"email": email}, timeout=30)
    assert r.status_code == 200, r.text[:300]
    assert r.json()["email"] == email.lower()  # backend normalizes case


def test_testimonial_submit():
    payload = {
        "name": _uniq("review"),
        "content": "Sehr professionelle Zusammenarbeit, sehr empfehlenswert!",
        "rating": 5,
        "company": "TestGmbH",
    }
    r = requests.post(f"{API}/testimonials/submit", json=payload, timeout=30)
    assert r.status_code == 200, r.text[:300]
    data = r.json()
    assert data["rating"] == 5
    assert data["status"] == "pending"


def test_leads_capture():
    payload = {
        "name": _uniq("lead"),
        "email": f"{_uniq('l')}@example.com",
        "message": "Bitte um Rueckruf",
        "service": "SEO",
    }
    r = requests.post(f"{API}/leads/capture", json=payload, timeout=30)
    assert r.status_code in (200, 201), r.text[:300]


# ---------------- ADMIN AUTH ----------------

def test_admin_login_wrong_password():
    r = requests.post(f"{API}/admin/login", json={"email": ADMIN_EMAIL, "password": "wrong-pass-xyz"}, timeout=30)
    assert r.status_code in (400, 401, 403), f"expected auth failure, got {r.status_code}"


def test_admin_verify(auth_headers):
    r = requests.get(f"{API}/admin/verify", headers=auth_headers, timeout=30)
    assert r.status_code == 200
    assert r.json().get("valid") or r.json().get("email")


def test_admin_endpoint_requires_auth():
    r = requests.get(f"{API}/admin/users", timeout=30)
    assert r.status_code in (401, 403)


# ---------------- ADMIN LIST ENDPOINTS ----------------

ADMIN_GETS = [
    "/admin/users",
    "/admin/portfolio/projects",
    "/admin/blog/posts",
    "/admin/team/members",
    "/admin/faq/items",
    "/admin/categories",
    "/admin/services",
    "/admin/settings",
    "/admin/tools",
    "/admin/leads",
    "/admin/leads/dashboard",
    "/testimonials/all",
    "/testimonials/stats",
    "/contact/submissions",
    "/contact/stats",
    "/newsletter/subscribers",
    "/newsletter/stats",
    "/admin/security/scan",
    "/admin/audit-log",
    "/admin/login-attempts",
    "/admin/backup/list",
    "/admin/email-templates/auto",
    "/admin/chatbot/qa",
    "/admin/chatbot/config",
    "/admin/smtp/health",
    "/admin/offer-ab/stats",
    "/analytics/overview",
]


@pytest.mark.parametrize("path", ADMIN_GETS)
def test_admin_get(path, auth_headers):
    r = requests.get(f"{API}{path}", headers=auth_headers, timeout=30)
    assert r.status_code == 200, f"{path} -> {r.status_code}: {r.text[:250]}"
