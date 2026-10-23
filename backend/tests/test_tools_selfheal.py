"""Tools self-heal + admin CRUD tests for Zebick Digital Agency."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "http://localhost:8001").rstrip("/")
ADMIN_EMAIL = os.environ.get("TEST_ADMIN_EMAIL", "admin@zebick.com")
ADMIN_PW = os.environ.get("TEST_ADMIN_PASSWORD", "")

EXPECTED_SLUGS = {
    "kostenrechner", "website-check", "seo-audit", "dsgvo-check",
    "ki-berater", "erstgespraech", "web-berater", "app-berater",
    "security-berater", "uiux-berater", "gaming-berater", "chatbot-berater",
    "server-berater", "marketing-berater", "design-berater", "automation-berater",
}


@pytest.fixture(scope="module")
def token():
    r = requests.post(f"{BASE_URL}/api/admin/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PW}, timeout=30)
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
    data = r.json()
    tok = data.get("access_token") or data.get("token")
    assert tok, f"No token in response: {data}"
    return tok


@pytest.fixture(scope="module")
def admin_headers(token):
    return {"Authorization": f"Bearer {token}"}


def test_public_tools_default_16():
    r = requests.get(f"{BASE_URL}/api/tools", timeout=30)
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    slugs = {t["slug"] for t in data}
    # Public shows only enabled; if all default enabled -> 16
    assert len(data) == 16, f"Expected 16, got {len(data)}. Slugs: {slugs}"
    assert EXPECTED_SLUGS.issubset(slugs), f"Missing slugs: {EXPECTED_SLUGS - slugs}"


def test_admin_tools_default_16(admin_headers):
    r = requests.get(f"{BASE_URL}/api/admin/tools", headers=admin_headers, timeout=30)
    assert r.status_code == 200
    data = r.json()
    assert len(data) >= 16
    slugs = {t["slug"] for t in data}
    assert EXPECTED_SLUGS.issubset(slugs)


def test_self_heal_after_delete_all(admin_headers):
    """CORE BUG FIX: delete all tools, then GET /api/tools must reseed to 16."""
    # 1. List admin tools
    r = requests.get(f"{BASE_URL}/api/admin/tools", headers=admin_headers, timeout=30)
    assert r.status_code == 200
    tools = r.json()
    # 2. Delete each
    for t in tools:
        dr = requests.delete(f"{BASE_URL}/api/admin/tools/{t['id']}", headers=admin_headers, timeout=30)
        assert dr.status_code in (200, 204), f"Delete failed for {t.get('slug')}: {dr.status_code} {dr.text}"
    # 3. Public GET /api/tools should self-heal
    r = requests.get(f"{BASE_URL}/api/tools", timeout=30)
    assert r.status_code == 200
    data = r.json()
    slugs = {t["slug"] for t in data}
    assert len(data) == 16, f"Self-heal failed. Got {len(data)} tools. Slugs: {slugs}"
    assert EXPECTED_SLUGS.issubset(slugs)
    # 4. Admin should also see 16
    r = requests.get(f"{BASE_URL}/api/admin/tools", headers=admin_headers, timeout=30)
    assert r.status_code == 200
    assert len(r.json()) == 16


def test_self_heal_second_cycle(admin_headers):
    """Verify self-heal works repeatedly (checks module-level SEED_TOOLS _id mutation bug)."""
    r = requests.get(f"{BASE_URL}/api/admin/tools", headers=admin_headers, timeout=30)
    tools = r.json()
    for t in tools:
        requests.delete(f"{BASE_URL}/api/admin/tools/{t['id']}", headers=admin_headers, timeout=30)
    # Trigger heal again
    r = requests.get(f"{BASE_URL}/api/tools", timeout=30)
    assert r.status_code == 200, f"Second self-heal failed: {r.status_code} {r.text}"
    data = r.json()
    assert len(data) == 16, f"Second self-heal returned {len(data)} tools"


def test_admin_crud_create_edit_toggle_delete(admin_headers):
    slug = "TEST_selfheal_tool"
    # Cleanup any prior
    r = requests.get(f"{BASE_URL}/api/admin/tools", headers=admin_headers, timeout=30)
    for t in r.json():
        if t["slug"] == slug:
            requests.delete(f"{BASE_URL}/api/admin/tools/{t['id']}", headers=admin_headers, timeout=30)

    # CREATE
    payload = {"slug": slug, "title": "Test Tool", "service_id": "general", "type": "advisor",
               "description": "test", "icon": "Sparkles", "enabled": True, "featured": False, "order": 99}
    r = requests.post(f"{BASE_URL}/api/admin/tools", headers=admin_headers, json=payload, timeout=30)
    assert r.status_code in (200, 201), f"Create failed: {r.status_code} {r.text}"
    tool = r.json()
    tool_id = tool["id"]
    assert tool["slug"] == slug
    assert tool["title"] == "Test Tool"

    # Appears in public
    r = requests.get(f"{BASE_URL}/api/tools", timeout=30)
    pub_slugs = {t["slug"] for t in r.json()}
    assert slug in pub_slugs

    # EDIT title
    payload["title"] = "Test Tool Updated"
    r = requests.put(f"{BASE_URL}/api/admin/tools/{tool_id}", headers=admin_headers, json=payload, timeout=30)
    assert r.status_code == 200
    assert r.json()["title"] == "Test Tool Updated"

    # Verify persistence via GET
    r = requests.get(f"{BASE_URL}/api/admin/tools", headers=admin_headers, timeout=30)
    found = next(t for t in r.json() if t["id"] == tool_id)
    assert found["title"] == "Test Tool Updated"

    # Toggle enabled off
    payload["enabled"] = False
    r = requests.put(f"{BASE_URL}/api/admin/tools/{tool_id}", headers=admin_headers, json=payload, timeout=30)
    assert r.status_code == 200
    # Disappear from public
    r = requests.get(f"{BASE_URL}/api/tools", timeout=30)
    pub_slugs = {t["slug"] for t in r.json()}
    assert slug not in pub_slugs, "Disabled tool still appears in public"
    # But present in admin
    r = requests.get(f"{BASE_URL}/api/admin/tools", headers=admin_headers, timeout=30)
    admin_slugs = {t["slug"] for t in r.json()}
    assert slug in admin_slugs

    # DELETE
    r = requests.delete(f"{BASE_URL}/api/admin/tools/{tool_id}", headers=admin_headers, timeout=30)
    assert r.status_code in (200, 204)
    r = requests.get(f"{BASE_URL}/api/admin/tools", headers=admin_headers, timeout=30)
    admin_slugs = {t["slug"] for t in r.json()}
    assert slug not in admin_slugs
