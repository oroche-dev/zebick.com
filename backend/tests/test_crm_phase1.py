"""Phase 1 CRM tests: Funnel, Dashboard, Customers, Activities, contact phone+status."""
from pathlib import Path
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    with open(Path(__file__).resolve().parents[2] / "frontend" / ".env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
                break

ADMIN_EMAIL = os.environ.get("TEST_ADMIN_EMAIL", "admin@zebick.com")
ADMIN_PASSWORD = os.environ.get("TEST_ADMIN_PASSWORD", "")


@pytest.fixture(scope="session")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_headers(api):
    r = api.post(f"{BASE_URL}/api/admin/login",
                 json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    if r.status_code != 200:
        pytest.skip(f"login failed: {r.status_code}")
    tok = r.json().get("access_token") or r.json().get("token")
    return {"Authorization": f"Bearer {tok}", "Content-Type": "application/json"}


# Shared state across tests in this module
STATE = {}


# ---- Contact submit with phone ----
class TestContactPhone:
    def test_submit_with_phone(self, api):
        email = f"TEST_phone_{uuid.uuid4().hex[:6]}@example.com"
        payload = {
            "name": "TEST_Phone Tester",
            "email": email,
            "phone": "+49 151 12345678",
            "service": "Webentwicklung",
            "budget": "5k-10k",
            "message": "Bitte ein Angebot — Phone-Test.",
        }
        r = api.post(f"{BASE_URL}/api/contact/submit", json=payload)
        assert r.status_code in (200, 201), f"{r.status_code}: {r.text[:300]}"
        data = r.json()
        assert data.get("phone") == "+49 151 12345678"
        STATE["contact_id"] = data["id"]
        STATE["contact_email"] = email

    def test_submit_without_phone_regression(self, api):
        # Regression: contact submit still works without phone
        payload = {
            "name": "TEST_NoPhone",
            "email": f"TEST_nophone_{uuid.uuid4().hex[:6]}@example.com",
            "message": "Regression: still accepted ohne Telefon.",
        }
        r = api.post(f"{BASE_URL}/api/contact/submit", json=payload)
        assert r.status_code in (200, 201), f"{r.status_code}: {r.text[:300]}"


# ---- Funnel overview ----
class TestFunnel:
    def test_funnel_requires_auth(self, api):
        r = api.get(f"{BASE_URL}/api/admin/funnel/overview")
        assert r.status_code in (401, 403)

    def test_funnel_structure(self, api, admin_headers):
        r = api.get(f"{BASE_URL}/api/admin/funnel/overview", headers=admin_headers)
        assert r.status_code == 200, f"{r.status_code}: {r.text[:300]}"
        data = r.json()
        keys = {s["key"] for s in data["stages"]}
        assert keys == {"new", "contacted", "offer_sent", "won", "lost"}
        for s in data["stages"]:
            assert "count" in s and "value" in s and "label" in s
        assert "total_pipeline_value" in data
        assert "conversion_rate" in data
        assert "total_requests" in data


# ---- Dashboard overview ----
class TestDashboardOverview:
    def test_dashboard_overview(self, api, admin_headers):
        r = api.get(f"{BASE_URL}/api/admin/dashboard/overview", headers=admin_headers)
        assert r.status_code == 200, f"{r.status_code}: {r.text[:300]}"
        d = r.json()
        for k in ("today", "week", "month", "new", "contacted", "offer_sent", "won", "lost"):
            assert k in d["requests"], f"missing requests.{k}"
        assert "won_total" in d["revenue"]
        assert "pipeline_open" in d["revenue"]
        assert "total" in d["customers"]
        assert "active" in d["newsletter"]
        assert isinstance(d["top_services"], list)
        assert isinstance(d["activities"], list)


# ---- Contact PATCH (status, deal_value, notes) ----
class TestContactPatch:
    def test_invalid_status(self, api, admin_headers):
        cid = STATE.get("contact_id")
        if not cid:
            pytest.skip("no contact id")
        r = api.patch(f"{BASE_URL}/api/admin/contact/{cid}",
                      json={"status": "foo"}, headers=admin_headers)
        assert r.status_code == 400

    def test_update_to_offer_sent(self, api, admin_headers):
        cid = STATE.get("contact_id")
        if not cid:
            pytest.skip("no contact id")
        r = api.patch(f"{BASE_URL}/api/admin/contact/{cid}",
                      json={"status": "offer_sent", "deal_value": 15000,
                            "notes": "Angebot raus."},
                      headers=admin_headers)
        assert r.status_code == 200, f"{r.status_code}: {r.text[:300]}"
        body = r.json()
        assert body["updates"]["status"] == "offer_sent"
        assert body["updates"]["deal_value"] == 15000.0

    def test_status_change_creates_activity(self, api, admin_headers):
        # Activity list should have status_changed event
        r = api.get(f"{BASE_URL}/api/admin/activities?limit=50", headers=admin_headers)
        assert r.status_code == 200
        types = [a["type"] for a in r.json()["activities"]]
        assert "status_changed" in types


# ---- Customer from contact + reuse ----
class TestCustomerFromContact:
    def test_create_customer_from_contact(self, api, admin_headers):
        cid = STATE.get("contact_id")
        if not cid:
            pytest.skip("no contact id")
        r = api.post(f"{BASE_URL}/api/admin/customers/from-contact/{cid}",
                     headers=admin_headers)
        assert r.status_code == 200, f"{r.status_code}: {r.text[:300]}"
        cust = r.json()
        assert cust["email"] == STATE["contact_email"].lower()
        STATE["customer_id"] = cust["id"]

    def test_reuse_on_second_call(self, api, admin_headers):
        # Submit another contact w/ same email + reconvert -> should reuse
        email = STATE["contact_email"]
        r = api.post(f"{BASE_URL}/api/contact/submit", json={
            "name": "TEST_Repeat",
            "email": email,
            "message": "Zweite Anfrage gleiche email.",
        })
        assert r.status_code in (200, 201)
        new_cid = r.json()["id"]
        r2 = api.post(f"{BASE_URL}/api/admin/customers/from-contact/{new_cid}",
                      headers=admin_headers)
        assert r2.status_code == 200
        assert r2.json()["id"] == STATE["customer_id"], "Should reuse existing customer"

    def test_won_bumps_revenue(self, api, admin_headers):
        cid = STATE.get("contact_id")
        if not cid:
            pytest.skip()
        # Get current revenue
        c0 = api.get(f"{BASE_URL}/api/admin/customers/{STATE['customer_id']}",
                     headers=admin_headers).json()
        before = c0["customer"].get("total_revenue", 0)
        # Mark as won with deal_value
        r = api.patch(f"{BASE_URL}/api/admin/contact/{cid}",
                      json={"status": "won", "deal_value": 25000},
                      headers=admin_headers)
        assert r.status_code == 200
        c1 = api.get(f"{BASE_URL}/api/admin/customers/{STATE['customer_id']}",
                     headers=admin_headers).json()
        after = c1["customer"].get("total_revenue", 0)
        assert after >= before + 25000 - 0.01, f"revenue not bumped: before={before} after={after}"


# ---- Customer CRUD ----
class TestCustomerCRUD:
    def test_unauth_list(self, api):
        r = api.get(f"{BASE_URL}/api/admin/customers")
        assert r.status_code in (401, 403)

    def test_create(self, api, admin_headers):
        email = f"TEST_cust_{uuid.uuid4().hex[:6]}@example.com"
        r = api.post(f"{BASE_URL}/api/admin/customers", headers=admin_headers,
                     json={"name": "TEST Customer", "email": email,
                           "company": "ACME", "phone": "+49 30 123"})
        assert r.status_code in (200, 201), f"{r.status_code}: {r.text[:300]}"
        d = r.json()
        assert d["email"] == email.lower()
        STATE["std_customer_id"] = d["id"]
        STATE["std_customer_email"] = email

    def test_duplicate_email(self, api, admin_headers):
        if "std_customer_email" not in STATE:
            pytest.skip()
        r = api.post(f"{BASE_URL}/api/admin/customers", headers=admin_headers,
                     json={"name": "Dup", "email": STATE["std_customer_email"]})
        assert r.status_code == 400

    def test_get_single_with_requests(self, api, admin_headers):
        cid = STATE.get("std_customer_id")
        if not cid:
            pytest.skip()
        r = api.get(f"{BASE_URL}/api/admin/customers/{cid}", headers=admin_headers)
        assert r.status_code == 200
        d = r.json()
        assert "customer" in d and "requests" in d
        assert isinstance(d["requests"], list)

    def test_list(self, api, admin_headers):
        r = api.get(f"{BASE_URL}/api/admin/customers", headers=admin_headers)
        assert r.status_code == 200
        d = r.json()
        assert "total" in d and "customers" in d

    def test_patch(self, api, admin_headers):
        cid = STATE.get("std_customer_id")
        if not cid:
            pytest.skip()
        r = api.patch(f"{BASE_URL}/api/admin/customers/{cid}",
                     headers=admin_headers,
                     json={"company": "UPDATED ACME"})
        assert r.status_code == 200
        verify = api.get(f"{BASE_URL}/api/admin/customers/{cid}",
                         headers=admin_headers).json()
        assert verify["customer"]["company"] == "UPDATED ACME"

    def test_delete(self, api, admin_headers):
        cid = STATE.get("std_customer_id")
        if not cid:
            pytest.skip()
        r = api.delete(f"{BASE_URL}/api/admin/customers/{cid}", headers=admin_headers)
        assert r.status_code in (200, 204)
        v = api.get(f"{BASE_URL}/api/admin/customers/{cid}", headers=admin_headers)
        assert v.status_code == 404


# ---- Activities ----
class TestActivities:
    def test_activities_sorted(self, api, admin_headers):
        r = api.get(f"{BASE_URL}/api/admin/activities?limit=20", headers=admin_headers)
        assert r.status_code == 200
        rows = r.json()["activities"]
        ts = [a.get("timestamp") for a in rows if a.get("timestamp")]
        assert ts == sorted(ts, reverse=True), "activities should be sorted desc"
