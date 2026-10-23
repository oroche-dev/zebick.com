"""End-to-end Zebick public + admin API tests.

Covers:
  - Health & public listings (portfolio, blog, team, FAQ)
  - Contact form submission (SMTP_MOCK)
  - Newsletter subscribe (unique + duplicate)
  - Admin login (success, wrong password, protected endpoint access)
  - Portfolio CRUD by admin
"""
from pathlib import Path
import os
import uuid

import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # Fallback: read from frontend/.env directly
    try:
        with open(Path(__file__).resolve().parents[2] / "frontend" / ".env") as f:
            for line in f:
                if line.startswith("REACT_APP_BACKEND_URL="):
                    BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
                    break
    except Exception:
        pass

ADMIN_EMAIL = os.environ.get("TEST_ADMIN_EMAIL", "admin@zebick.com")
ADMIN_PASSWORD = os.environ.get("TEST_ADMIN_PASSWORD", "")


@pytest.fixture(scope="session")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_token(api):
    r = api.post(
        f"{BASE_URL}/api/admin/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
    )
    if r.status_code != 200:
        pytest.skip(f"Admin login failed: {r.status_code} {r.text[:200]}")
    data = r.json()
    token = data.get("access_token") or data.get("token")
    assert token, f"No token in response: {data}"
    return token


@pytest.fixture(scope="session")
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}


# ---- Health ----
class TestHealth:
    def test_root(self, api):
        r = api.get(f"{BASE_URL}/api/")
        assert r.status_code == 200

    def test_health(self, api):
        r = api.get(f"{BASE_URL}/api/health")
        assert r.status_code == 200


# ---- Public listings ----
class TestPublicListings:
    def test_portfolio_projects(self, api):
        r = api.get(f"{BASE_URL}/api/portfolio/projects")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 4, f"Expected >=4 seeded projects, got {len(data)}"
        slugs = [p.get("slug") for p in data]
        assert all(slugs), "Each project should have slug"

    def test_portfolio_single_by_slug(self, api):
        listing = api.get(f"{BASE_URL}/api/portfolio/projects").json()
        slug = listing[0]["slug"]
        r = api.get(f"{BASE_URL}/api/portfolio/projects/{slug}")
        assert r.status_code == 200
        assert r.json()["slug"] == slug

    def test_portfolio_categories(self, api):
        r = api.get(f"{BASE_URL}/api/portfolio/categories")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_blog_posts(self, api):
        r = api.get(f"{BASE_URL}/api/blog/posts")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 6, f"Expected >=6 seeded posts, got {len(data)}"

    def test_blog_single_by_slug(self, api):
        listing = api.get(f"{BASE_URL}/api/blog/posts").json()
        slug = listing[0]["slug"]
        r = api.get(f"{BASE_URL}/api/blog/posts/{slug}")
        assert r.status_code == 200
        assert r.json()["slug"] == slug

    def test_team_members(self, api):
        r = api.get(f"{BASE_URL}/api/team/members")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 4

    def test_faq_items(self, api):
        r = api.get(f"{BASE_URL}/api/faq/items")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 5


# ---- Contact ----
class TestContact:
    def test_contact_submit(self, api):
        payload = {
            "name": "TEST_Tester",
            "email": "TEST_tester@example.com",
            "subject": "Automated test",
            "message": "This is an automated test submission. " * 2,
        }
        r = api.post(f"{BASE_URL}/api/contact/submit", json=payload)
        assert r.status_code in (200, 201), f"{r.status_code}: {r.text[:300]}"
        data = r.json()
        assert data.get("email") == "TEST_tester@example.com"


# ---- Newsletter ----
class TestNewsletter:
    EMAIL = f"TEST_newsletter_{uuid.uuid4().hex[:8]}@example.com"

    def test_subscribe_new(self, api):
        r = api.post(
            f"{BASE_URL}/api/newsletter/subscribe",
            json={"email": self.EMAIL},
        )
        assert r.status_code in (200, 201), f"{r.status_code}: {r.text[:300]}"
        data = r.json()
        assert (data.get("email") or "").lower() == self.EMAIL.lower()

    def test_subscribe_duplicate(self, api):
        r = api.post(
            f"{BASE_URL}/api/newsletter/subscribe",
            json={"email": self.EMAIL},
        )
        # Either reactivate (200) or conflict (4xx) — must not be 5xx
        assert r.status_code < 500, f"5xx on duplicate: {r.status_code} {r.text[:300]}"


# ---- Admin auth ----
class TestAdminAuth:
    def test_login_success(self, api):
        r = api.post(
            f"{BASE_URL}/api/admin/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
        )
        assert r.status_code == 200, f"{r.status_code}: {r.text[:300]}"
        data = r.json()
        token = data.get("access_token") or data.get("token")
        assert token and isinstance(token, str) and len(token) > 20

    def test_login_wrong_password(self, api):
        r = api.post(
            f"{BASE_URL}/api/admin/login",
            json={"email": ADMIN_EMAIL, "password": "WRONG_password_X"},
        )
        assert r.status_code in (401, 403, 429)

    def test_protected_without_token(self, api):
        r = api.get(f"{BASE_URL}/api/admin/users")
        assert r.status_code in (401, 403)

    def test_protected_with_token(self, api, admin_headers):
        r = api.get(f"{BASE_URL}/api/admin/users", headers=admin_headers)
        assert r.status_code == 200, f"{r.status_code}: {r.text[:300]}"
        assert isinstance(r.json(), list)

    def test_audit_log_with_token(self, api, admin_headers):
        r = api.get(f"{BASE_URL}/api/admin/audit-log", headers=admin_headers)
        assert r.status_code == 200

    def test_admin_blog_list(self, api, admin_headers):
        r = api.get(f"{BASE_URL}/api/admin/blog/posts", headers=admin_headers)
        assert r.status_code == 200
        assert isinstance(r.json(), list)


# ---- Portfolio admin CRUD ----
class TestPortfolioAdminCRUD:
    CREATED_ID = None

    def test_create(self, api, admin_headers):
        payload = {
            "title": f"TEST_Project_{uuid.uuid4().hex[:6]}",
            "subtitle": "Automated test project",
            "category": "Webentwicklung",
            "description": "Automated test created project for QA",
            "tags": ["test"],
            "tech_stack": ["pytest"],
        }
        r = api.post(
            f"{BASE_URL}/api/admin/portfolio/projects",
            json=payload,
            headers=admin_headers,
        )
        assert r.status_code in (200, 201), f"{r.status_code}: {r.text[:300]}"
        data = r.json()
        assert data["title"] == payload["title"]
        assert data.get("id")
        type(self).CREATED_ID = data["id"]

    def test_update(self, api, admin_headers):
        if not self.CREATED_ID:
            pytest.skip("No created project to update")
        r = api.patch(
            f"{BASE_URL}/api/admin/portfolio/projects/{self.CREATED_ID}",
            json={"subtitle": "UPDATED subtitle"},
            headers=admin_headers,
        )
        assert r.status_code == 200, f"{r.status_code}: {r.text[:300]}"
        assert r.json().get("subtitle") == "UPDATED subtitle"

    def test_delete(self, api, admin_headers):
        if not self.CREATED_ID:
            pytest.skip("No created project to delete")
        r = api.delete(
            f"{BASE_URL}/api/admin/portfolio/projects/{self.CREATED_ID}",
            headers=admin_headers,
        )
        assert r.status_code in (200, 204), f"{r.status_code}: {r.text[:300]}"
