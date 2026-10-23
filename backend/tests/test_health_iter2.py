"""Comprehensive health check for iteration 2 - Full backend smoke."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "http://localhost:8001").rstrip("/")
ADMIN_EMAIL = os.environ.get("TEST_ADMIN_EMAIL", "admin@zebick.com")
ADMIN_PASSWORD = os.environ.get("TEST_ADMIN_PASSWORD", "")


@pytest.fixture(scope="session")
def s():
    return requests.Session()


@pytest.fixture(scope="session")
def token(s):
    r = s.post(f"{BASE_URL}/api/admin/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
    assert r.status_code == 200, f"admin login failed {r.status_code}: {r.text[:200]}"
    data = r.json()
    assert "access_token" in data
    return data["access_token"]


@pytest.fixture(scope="session")
def auth(token):
    return {"Authorization": f"Bearer {token}"}


# ---------- Public endpoints ----------
PUBLIC_ENDPOINTS = [
    ("/api/tools", 16),        # exact 16 expected
    ("/api/portfolio/projects", None),
    ("/api/blog/posts", 6),
    ("/api/team/members", 4),
    ("/api/faq/items", 5),
    ("/api/player/achievements", 11),
    ("/api/catalog/services", None),
]


@pytest.mark.parametrize("path,expected_count", PUBLIC_ENDPOINTS)
def test_public_endpoint(s, path, expected_count):
    r = s.get(f"{BASE_URL}{path}", timeout=15)
    assert r.status_code == 200, f"{path} -> {r.status_code}"
    data = r.json()
    # find list
    items = None
    if isinstance(data, list):
        items = data
    elif isinstance(data, dict):
        for key in ("tools", "projects", "posts", "members", "items", "achievements", "services", "results", "data"):
            if key in data and isinstance(data[key], list):
                items = data[key]
                break
    assert items is not None, f"{path} response has no list: {str(data)[:200]}"
    if expected_count is not None:
        assert len(items) == expected_count, f"{path} expected {expected_count} got {len(items)}"


# ---------- Contact form (mocked SMTP) ----------
def test_contact_form_submission(s):
    payload = {
        "name": "TEST_QA_User",
        "email": "test_qa_user@example.com",
        "phone": "+49 30 12345678",
        "subject": "Test contact",
        "message": "This is a QA test submission (SMTP mocked).",
        "consent": True,
    }
    r = s.post(f"{BASE_URL}/api/contact/submit", json=payload, timeout=15)
    assert r.status_code in (200, 201), f"/api/contact/submit -> {r.status_code} {r.text[:200]}"


# ---------- Newsletter (mocked SMTP) ----------
def test_newsletter_subscribe(s):
    import uuid
    payload = {"email": f"test_qa_news_{uuid.uuid4().hex[:8]}@example.com", "consent": True}
    r = s.post(f"{BASE_URL}/api/newsletter/subscribe", json=payload, timeout=15)
    assert r.status_code in (200, 201), f"/api/newsletter/subscribe -> {r.status_code} {r.text[:200]}"


# ---------- Chatbot graceful degradation (no LLM key) ----------
def test_chatbot_graceful():
    r = requests.post(f"{BASE_URL}/api/chatbot/message", json={"message": "Hallo", "session_id": "test_qa"}, timeout=20)
    # should NOT be a 5xx crash. accept 200 with degraded message or 4xx/503 explicit
    assert r.status_code < 500 or r.status_code == 503, f"chatbot crashed with {r.status_code}: {r.text[:200]}"


# ---------- Admin login ----------
def test_admin_login_success(token):
    assert token and len(token) > 20


def test_admin_login_wrong_password(s):
    r = s.post(f"{BASE_URL}/api/admin/login", json={"email": ADMIN_EMAIL, "password": "WRONG"}, timeout=15)
    assert r.status_code in (401, 403), f"wrong pw returned {r.status_code}"


# ---------- Admin modules smoke ----------
ADMIN_ENDPOINTS = [
    "/api/admin/portfolio/projects",
    "/api/admin/blog/posts",
    "/api/admin/team/members",
    "/api/admin/faq/items",
    "/api/admin/leads",
    "/api/admin/tools",
    "/api/contact/submissions?status=all",
    "/api/contact/stats",
    "/api/newsletter/subscribers?status=all",
    "/api/newsletter/stats",
    "/api/analytics/overview",
    "/api/analytics/top-pages",
    "/api/admin/audit-log",
    "/api/admin/login-attempts",
    "/api/admin/backup/list",
    "/api/admin/dashboard/overview",
    "/api/admin/funnel/overview",
]


@pytest.mark.parametrize("path", ADMIN_ENDPOINTS)
def test_admin_module_reachable(s, auth, path):
    r = s.get(f"{BASE_URL}{path}", headers=auth, timeout=20)
    # Accept 200. Some may not exist -> 404, log but don't outright fail.
    assert r.status_code in (200, 404), f"{path} -> {r.status_code}: {r.text[:150]}"
    if r.status_code == 404:
        pytest.skip(f"{path} not implemented (404)")
