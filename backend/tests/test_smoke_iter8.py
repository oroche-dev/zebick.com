"""Iteration 8: Broad regression/smoke test using ACTUAL routes."""
import os
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "http://localhost:8001").rstrip("/")
ADMIN_EMAIL = os.environ.get("TEST_ADMIN_EMAIL", "admin@zebick.com")
ADMIN_PASSWORD = os.environ.get("TEST_ADMIN_PASSWORD", "")


@pytest.fixture(scope="module")
def token():
    r = requests.post(f"{BASE_URL}/api/admin/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
    assert r.status_code == 200, r.text
    return r.json()["access_token"]


@pytest.fixture(scope="module")
def auth(token):
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="module", autouse=True)
def cleanup_smoke_data(auth):
    """test_testimonial_submit below writes a real, publicly-approvable
    testimonial with no email field, so it can't be matched by TEST_ email
    prefix — match by name instead and remove it once this module is done."""
    yield
    try:
        testimonials = requests.get(f"{BASE_URL}/api/testimonials/all", headers=auth, timeout=15).json()
        for t in testimonials.get("testimonials", []):
            if (t.get("name") or "").startswith("TEST_Smoke"):
                requests.delete(f"{BASE_URL}/api/testimonials/{t['id']}", headers=auth, timeout=15)
    except Exception:
        pass


# ------------------------- Public GETs (actual routes) -------------------------
PUBLIC_GET = [
    "/api/",
    "/api/health",
    "/api/tools",
    "/api/catalog/services",
    "/api/catalog/categories",
    "/api/portfolio/projects",
    "/api/portfolio/categories",
    "/api/blog/posts",
    "/api/blog/categories",
    "/api/testimonials/approved",
    "/api/team/members",
    "/api/faq/items",
    "/api/content/home",
    "/api/settings/public",
    "/api/service-pages/web-development",
    "/api/service-pages/cyber-security",
    "/api/service-pages/ui-ux-design",
]


@pytest.mark.parametrize("path", PUBLIC_GET)
def test_public_get(path):
    r = requests.get(f"{BASE_URL}{path}", timeout=15)
    assert r.status_code == 200, f"{path} -> {r.status_code} {r.text[:200]}"


def test_tools_count_at_least_16():
    r = requests.get(f"{BASE_URL}/api/tools", timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert len(data) >= 16, f"Expected >=16 tools, got {len(data)}"


def test_tool_detail():
    r = requests.get(f"{BASE_URL}/api/tools/kostenrechner", timeout=15)
    assert r.status_code == 200
    assert r.json().get("slug") == "kostenrechner"


def test_portfolio_detail_slug():
    r = requests.get(f"{BASE_URL}/api/portfolio/projects", timeout=15)
    items = r.json()
    if isinstance(items, list) and items:
        slug = items[0].get("slug")
        if slug:
            d = requests.get(f"{BASE_URL}/api/portfolio/projects/{slug}", timeout=15)
            assert d.status_code == 200


# ------------------------- Public form submissions -------------------------
def test_contact_form_submit():
    payload = {
        "name": "TEST_Smoke User",
        "email": "smoke@example.com",
        "service": "web-development",
        "message": "Automated smoke test - please ignore",
    }
    r = requests.post(f"{BASE_URL}/api/contact/submit", json=payload, timeout=15)
    assert r.status_code in (200, 201), r.text


def test_testimonial_submit():
    payload = {"name": "TEST_Smoke Reviewer", "content": "Sehr gute Arbeit - Automated smoke test", "rating": 5}
    r = requests.post(f"{BASE_URL}/api/testimonials/submit", json=payload, timeout=15)
    assert r.status_code in (200, 201), r.text


def test_newsletter_signup():
    payload = {"email": f"smoke_{int(time.time())}@example.com"}
    r = requests.post(f"{BASE_URL}/api/newsletter/subscribe", json=payload, timeout=15)
    assert r.status_code in (200, 201, 400, 409), f"{r.status_code} {r.text[:200]}"


# ------------------------- Admin GETs (actual routes) -------------------------
ADMIN_GET_PATHS = [
    "/api/admin/dashboard/overview",
    "/api/admin/tools",
    "/api/admin/backups",
    "/api/admin/leads",
    "/api/contact/submissions",  # public listing endpoint, but for admin panel
    "/api/admin/offers",
    "/api/admin/categories",
    "/api/admin/services",
    "/api/admin/portfolio/projects",
    "/api/admin/blog/posts",
    "/api/newsletter/subscribers",
    "/api/analytics/overview",
    "/api/admin/security/scan",
    "/api/admin/audit-log",
]


@pytest.mark.parametrize("path", ADMIN_GET_PATHS)
def test_admin_get(path, auth):
    r = requests.get(f"{BASE_URL}{path}", headers=auth, timeout=20)
    assert r.status_code == 200, f"{path} -> {r.status_code} {r.text[:200]}"


# ------------------------- Tools CRUD (with slug in update) -------------------------
def test_tools_crud(auth):
    slug = f"test-smoke-{int(time.time())}"
    create = {
        "slug": slug,
        "service_id": "general",
        "type": "calculator",
        "title": "TEST Smoke Tool",
        "description": "temp",
        "enabled": True,
        "config": {"fields": []},
    }
    r = requests.post(f"{BASE_URL}/api/admin/tools", json=create, headers=auth, timeout=15)
    assert r.status_code in (200, 201), r.text
    body = r.json()
    tid = body.get("id") or body.get("_id")

    # edit (send full-required fields since PUT may require them)
    upd = {**create, "title": "TEST Smoke Tool Edited", "enabled": False}
    r2 = requests.put(f"{BASE_URL}/api/admin/tools/{tid}", json=upd, headers=auth, timeout=15)
    assert r2.status_code == 200, r2.text
    assert r2.json().get("title") == "TEST Smoke Tool Edited"
    assert r2.json().get("enabled") is False

    # versions
    rv = requests.get(f"{BASE_URL}/api/admin/tools/{tid}/versions", headers=auth, timeout=15)
    assert rv.status_code == 200, rv.text
    assert isinstance(rv.json(), list)

    # delete
    rd = requests.delete(f"{BASE_URL}/api/admin/tools/{tid}", headers=auth, timeout=15)
    assert rd.status_code in (200, 204)

    # not in public list
    pub = requests.get(f"{BASE_URL}/api/tools", timeout=15).json()
    assert not any(t.get("slug") == slug for t in pub)


# ------------------------- Backups -------------------------
def test_backups_run_and_list(auth):
    r = requests.get(f"{BASE_URL}/api/admin/backups", headers=auth, timeout=15)
    assert r.status_code == 200
    r2 = requests.post(f"{BASE_URL}/api/admin/backups/run", headers=auth, timeout=45)
    assert r2.status_code in (200, 201), r2.text


def test_tools_export(auth):
    r = requests.get(f"{BASE_URL}/api/admin/tools/export", headers=auth, timeout=15)
    assert r.status_code == 200
    assert isinstance(r.json(), (list, dict))
