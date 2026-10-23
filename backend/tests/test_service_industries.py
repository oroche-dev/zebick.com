"""Tests for Industries section in service_pages API (dynamic admin-editable)."""
import os
import pytest
import requests

BASE_URL = (os.environ.get("REACT_APP_BACKEND_URL") or "http://localhost:8001").rstrip("/")
ADMIN_EMAIL = os.environ.get("TEST_ADMIN_EMAIL", "admin@zebick.com")
ADMIN_PASSWORD = os.environ.get("TEST_ADMIN_PASSWORD", "")

# Slug -> expected heading (per problem statement)
EXPECTED = {
    "cyber-security":   "Sicherheit für jede Branche",
    "gaming":           "Genres & Plattformen",
    "graphic-design":   "Design für jede Disziplin",
    "marketing-seo":    "Marketing für jede Branche",
}


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


# ---------- Public Industries ----------

@pytest.mark.parametrize("slug,heading", list(EXPECTED.items()))
def test_public_industries_present(slug, heading):
    r = requests.get(f"{BASE_URL}/api/service-pages/{slug}", timeout=15)
    assert r.status_code == 200, f"{slug}: HTTP {r.status_code}"
    data = r.json()
    assert data.get("industries_enabled") is True, f"{slug}: industries_enabled should be True, got {data.get('industries_enabled')}"
    assert data.get("industries_heading") == heading, f"{slug}: heading mismatch: '{data.get('industries_heading')}' != '{heading}'"
    items = data.get("industries") or []
    assert len(items) == 6, f"{slug}: expected 6 industries, got {len(items)}"
    # Verify item structure
    for i, item in enumerate(items):
        assert item.get("title"), f"{slug}[{i}]: missing title"
        assert item.get("desc"), f"{slug}[{i}]: missing desc"
        assert item.get("icon"), f"{slug}[{i}]: missing icon"
        assert item.get("tag"), f"{slug}[{i}]: missing tag"
        assert item.get("img"), f"{slug}[{i}]: missing img"


# ---------- Admin Login ----------

def test_admin_login_endpoint(admin_token):
    """Ensure admin token is non-empty string."""
    assert isinstance(admin_token, str) and len(admin_token) > 20


# ---------- Admin PUT industries (cyber-security) ----------

def test_admin_put_industries_persists_and_restore(auth_headers):
    """Modify cyber-security industries via PUT, verify GET, then restore."""
    # 1. Get current state
    r0 = requests.get(f"{BASE_URL}/api/service-pages/cyber-security", timeout=15)
    assert r0.status_code == 200
    original = r0.json()
    original_items = original.get("industries") or []
    original_heading = original.get("industries_heading")
    assert len(original_items) == 6
    assert original_heading == "Sicherheit für jede Branche"

    # 2. Modify: change heading + first title
    modified_items = [dict(x) for x in original_items]
    modified_items[0]["title"] = "TEST_Finanzwesen_EDIT"
    payload = {
        "industries_heading": "TEST_Sicherheit für jede Branche",
        "industries_enabled": True,
        "industries": modified_items,
    }
    r1 = requests.put(
        f"{BASE_URL}/api/admin/service-pages/cyber-security",
        json=payload, headers=auth_headers, timeout=20,
    )
    assert r1.status_code == 200, f"PUT failed: {r1.status_code} {r1.text[:300]}"

    # 3. Verify persistence via public GET
    r2 = requests.get(f"{BASE_URL}/api/service-pages/cyber-security", timeout=15)
    assert r2.status_code == 200
    d2 = r2.json()
    assert d2.get("industries_heading") == "TEST_Sicherheit für jede Branche"
    assert d2.get("industries")[0]["title"] == "TEST_Finanzwesen_EDIT"
    assert len(d2.get("industries")) == 6

    # 4. Restore
    restore_payload = {
        "industries_heading": original_heading,
        "industries_enabled": True,
        "industries": original_items,
    }
    r3 = requests.put(
        f"{BASE_URL}/api/admin/service-pages/cyber-security",
        json=restore_payload, headers=auth_headers, timeout=20,
    )
    assert r3.status_code == 200

    # 5. Verify restored
    r4 = requests.get(f"{BASE_URL}/api/service-pages/cyber-security", timeout=15)
    d4 = r4.json()
    assert d4.get("industries_heading") == original_heading
    assert d4.get("industries")[0]["title"] == original_items[0]["title"]
    assert len(d4.get("industries")) == 6


def test_admin_toggle_industries_enabled_false_and_restore(auth_headers):
    """Toggle industries_enabled=False, verify, then restore True."""
    # Set False
    r1 = requests.put(
        f"{BASE_URL}/api/admin/service-pages/cyber-security",
        json={"industries_enabled": False},
        headers=auth_headers, timeout=15,
    )
    assert r1.status_code == 200

    # Verify via public GET
    r2 = requests.get(f"{BASE_URL}/api/service-pages/cyber-security", timeout=15)
    assert r2.status_code == 200
    assert r2.json().get("industries_enabled") is False

    # Restore True
    r3 = requests.put(
        f"{BASE_URL}/api/admin/service-pages/cyber-security",
        json={"industries_enabled": True},
        headers=auth_headers, timeout=15,
    )
    assert r3.status_code == 200

    r4 = requests.get(f"{BASE_URL}/api/service-pages/cyber-security", timeout=15)
    assert r4.json().get("industries_enabled") is True
    # Items still intact
    assert len(r4.json().get("industries")) == 6


def test_admin_put_requires_auth():
    r = requests.put(
        f"{BASE_URL}/api/admin/service-pages/cyber-security",
        json={"industries_enabled": True},
        timeout=10,
    )
    assert r.status_code in (401, 403), f"Expected 401/403, got {r.status_code}"
