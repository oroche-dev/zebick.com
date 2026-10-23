"""Tests for service_pages API (pricing & tools editor)."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "http://localhost:8001").rstrip("/")
ADMIN_EMAIL = os.environ.get("TEST_ADMIN_EMAIL", "admin@zebick.com")
ADMIN_PASSWORD = os.environ.get("TEST_ADMIN_PASSWORD", "")

SLUGS = [
    "web-development", "app-development", "cyber-security",
    "chatbot-development", "server-development", "marketing-seo",
    "gaming", "ui-ux", "graphic-design", "automatisierung-ki", "tools",
]


@pytest.fixture(scope="module")
def admin_token():
    r = requests.post(
        f"{BASE_URL}/api/admin/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
        timeout=15,
    )
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text[:200]}"
    data = r.json()
    token = data.get("access_token") or data.get("token") or data.get("data", {}).get("access_token")
    assert token, f"No token in response: {data}"
    return token


@pytest.fixture
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}


# ---------- Public endpoints ----------

@pytest.mark.parametrize("slug", SLUGS)
def test_public_get_service_page(slug):
    r = requests.get(f"{BASE_URL}/api/service-pages/{slug}", timeout=15)
    assert r.status_code == 200, f"{slug}: {r.status_code}"
    data = r.json()
    assert data.get("slug") == slug
    assert "pricing_enabled" in data
    assert "pricing" in data


def test_public_cyber_security_has_pricing():
    r = requests.get(f"{BASE_URL}/api/service-pages/cyber-security", timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert data["pricing_enabled"] is True
    assert isinstance(data["pricing"], list)
    assert len(data["pricing"]) == 3
    assert "pricing_heading" in data
    assert "pricing_subtitle" in data
    # validate tier fields
    for tier in data["pricing"]:
        assert "name" in tier and "price" in tier
        assert "features" in tier and isinstance(tier["features"], list)


def test_public_web_development_has_pricing():
    r = requests.get(f"{BASE_URL}/api/service-pages/web-development", timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert data["pricing_enabled"] is True
    assert len(data["pricing"]) == 3


def test_public_tools_has_tools_and_calculator():
    r = requests.get(f"{BASE_URL}/api/service-pages/tools", timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert "tools" in data and isinstance(data["tools"], list)
    assert len(data["tools"]) == 6
    tool_ids = {t["id"] for t in data["tools"]}
    assert {"kostenrechner", "website-check", "seo-audit", "dsgvo-check", "ki-berater", "erstgespraech"}.issubset(tool_ids)
    assert "calculator_base" in data
    assert "calculator_features" in data
    assert data["calculator_base"]["landing"] == 1500.0
    assert data["calculator_features"]["cms"] == 1200.0


# ---------- Admin endpoints ----------

def test_admin_put_requires_auth():
    r = requests.put(
        f"{BASE_URL}/api/admin/service-pages/cyber-security",
        json={"pricing_heading": "hack"},
        timeout=15,
    )
    assert r.status_code in (401, 403)


def test_admin_get_requires_auth():
    r = requests.get(f"{BASE_URL}/api/admin/service-pages/cyber-security", timeout=15)
    assert r.status_code in (401, 403)


def test_admin_list_service_pages(auth_headers):
    r = requests.get(f"{BASE_URL}/api/admin/service-pages", headers=auth_headers, timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert data["total"] >= 11
    assert len(data["available_slugs"]) == 11


def test_admin_get_service_page(auth_headers):
    r = requests.get(f"{BASE_URL}/api/admin/service-pages/cyber-security", headers=auth_headers, timeout=15)
    assert r.status_code == 200
    assert r.json()["slug"] == "cyber-security"


def test_admin_put_updates_and_persists(auth_headers):
    # Get original
    r = requests.get(f"{BASE_URL}/api/admin/service-pages/cyber-security", headers=auth_headers, timeout=15)
    assert r.status_code == 200
    original = r.json()
    original_heading = original["pricing_heading"]

    test_heading = "TEST_HEADING_pytest_xyz"
    r = requests.put(
        f"{BASE_URL}/api/admin/service-pages/cyber-security",
        json={"pricing_heading": test_heading},
        headers=auth_headers,
        timeout=15,
    )
    assert r.status_code == 200, r.text[:200]
    assert r.json()["pricing_heading"] == test_heading

    # Verify via public
    r2 = requests.get(f"{BASE_URL}/api/service-pages/cyber-security", timeout=15)
    assert r2.status_code == 200
    assert r2.json()["pricing_heading"] == test_heading

    # Restore
    r3 = requests.put(
        f"{BASE_URL}/api/admin/service-pages/cyber-security",
        json={"pricing_heading": original_heading},
        headers=auth_headers,
        timeout=15,
    )
    assert r3.status_code == 200
    assert r3.json()["pricing_heading"] == original_heading


def test_admin_put_toggle_pricing_enabled(auth_headers):
    # Toggle off then on
    r = requests.put(
        f"{BASE_URL}/api/admin/service-pages/cyber-security",
        json={"pricing_enabled": False},
        headers=auth_headers,
        timeout=15,
    )
    assert r.status_code == 200
    assert r.json()["pricing_enabled"] is False

    pub = requests.get(f"{BASE_URL}/api/service-pages/cyber-security", timeout=15).json()
    assert pub["pricing_enabled"] is False

    # Restore
    r = requests.put(
        f"{BASE_URL}/api/admin/service-pages/cyber-security",
        json={"pricing_enabled": True},
        headers=auth_headers,
        timeout=15,
    )
    assert r.status_code == 200
    assert r.json()["pricing_enabled"] is True


def test_admin_put_pricing_tiers(auth_headers):
    new_pricing = [
        {"name": "TEST_Tier1", "price": "9€", "tag": "test", "highlight": False, "features": ["f1", "f2"]},
        {"name": "TEST_Tier2", "price": "99€", "tag": "test", "highlight": True, "features": ["f3"]},
        {"name": "TEST_Tier3", "price": "999€", "tag": None, "highlight": False, "features": []},
    ]
    # get original to restore
    orig = requests.get(f"{BASE_URL}/api/admin/service-pages/cyber-security", headers=auth_headers).json()
    original_pricing = orig["pricing"]

    r = requests.put(
        f"{BASE_URL}/api/admin/service-pages/cyber-security",
        json={"pricing": new_pricing},
        headers=auth_headers,
        timeout=15,
    )
    assert r.status_code == 200
    body = r.json()
    assert len(body["pricing"]) == 3
    assert body["pricing"][0]["name"] == "TEST_Tier1"
    assert body["pricing"][1]["highlight"] is True

    # Restore
    r = requests.put(
        f"{BASE_URL}/api/admin/service-pages/cyber-security",
        json={"pricing": original_pricing},
        headers=auth_headers,
        timeout=15,
    )
    assert r.status_code == 200
