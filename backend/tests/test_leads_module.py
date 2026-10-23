"""Backend tests for the new Lead-Management module.

Covers:
  - Public POST /api/leads/capture (no auth) — happy path + invalid source
  - Admin POST /api/admin/leads — create + enum validation
  - Admin GET /api/admin/leads — filters (status, source, q, min_score)
  - Admin GET /api/admin/leads/dashboard — full payload shape + timeline length
  - Admin PATCH /api/admin/leads/{id} — re-computes score on budget raise
  - Admin DELETE /api/admin/leads/{id}
  - Admin POST /api/admin/leads/{id}/convert-to-customer — sets won + returns customer_id
  - Lead scoring correctness (manual: budget=50000 referral offer_sent fully filled today >= 80)
  - Regression: prior endpoints (categories, services, projects-mgmt, offers, uploads,
    settings, chatbot, customers, funnel, dashboard overview) still return 200.
"""
from pathlib import Path
import os
import uuid
import time
import pytest
import requests

try:
    from dotenv import load_dotenv  # type: ignore
    load_dotenv(Path(__file__).resolve().parents[2] / "frontend" / ".env")
except Exception:
    pass

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
assert BASE_URL, "REACT_APP_BACKEND_URL must be set"
ADMIN_EMAIL = os.environ.get("TEST_ADMIN_EMAIL", "admin@zebick.com")
ADMIN_PASSWORD = os.environ.get("TEST_ADMIN_PASSWORD", "")

TEST_PREFIX = f"TEST_LEAD_{uuid.uuid4().hex[:6]}"


@pytest.fixture(scope="session")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def token(api):
    r = api.post(f"{BASE_URL}/api/admin/login",
                 json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    if r.status_code != 200:
        pytest.skip(f"Admin login failed: {r.status_code} {r.text[:200]}")
    return r.json()["access_token"]


@pytest.fixture(scope="session")
def auth(token):
    s = requests.Session()
    s.headers.update({
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}",
    })
    return s


# ============== Public capture ==============

class TestPublicCapture:
    def test_capture_success(self, api):
        payload = {
            "name": f"{TEST_PREFIX} Cap Bob",
            "email": f"{TEST_PREFIX}_cap@example.com",
            "source": "website",
            "budget": 12000,
            "message": "Public test",
        }
        r = api.post(f"{BASE_URL}/api/leads/capture", json=payload)
        assert r.status_code == 200, r.text
        body = r.json()
        assert "id" in body and len(body["id"]) > 8
        pytest.captured_lead_id = body["id"]

    def test_capture_persisted_with_status_new(self, auth):
        # Admin verifies via list endpoint
        r = auth.get(f"{BASE_URL}/api/admin/leads", params={"q": TEST_PREFIX})
        assert r.status_code == 200, r.text
        items = r.json()["leads"]
        match = [l for l in items if l["email"] == f"{TEST_PREFIX}_cap@example.com"]
        assert match, f"Captured lead not found, got {len(items)} items"
        assert match[0]["status"] == "new"
        assert match[0]["source"] == "website"

    def test_capture_rejects_unknown_source(self, api):
        r = api.post(f"{BASE_URL}/api/leads/capture", json={
            "name": "Bad Source",
            "email": "bad@example.com",
            "source": "tiktok",
        })
        # pydantic regex is not enforced; source defaults to validator behaviour
        # Public model does not restrict source via validator — explicit check raises 400
        assert r.status_code in (400, 422), r.text


# ============== Admin CRUD ==============

class TestAdminLeadsCRUD:
    def test_create_admin_lead(self, auth):
        payload = {
            "name": f"{TEST_PREFIX} Alice",
            "email": f"{TEST_PREFIX}_alice@example.com",
            "phone": "+491234567890",
            "company": "Acme",
            "service": "Webentwicklung",
            "budget": 15000,
            "status": "contacted",
            "source": "linkedin",
            "message": "Interessiert",
            "tags": ["hot"],
        }
        r = auth.post(f"{BASE_URL}/api/admin/leads", json=payload)
        assert r.status_code == 200, r.text
        doc = r.json()
        assert doc["id"]
        assert doc["status"] == "contacted"
        assert doc["source"] == "linkedin"
        assert isinstance(doc["score"], int)
        assert 0 <= doc["score"] <= 100
        pytest.lead_id = doc["id"]
        pytest.lead_initial_score = doc["score"]

    def test_create_rejects_bad_status(self, auth):
        r = auth.post(f"{BASE_URL}/api/admin/leads", json={
            "name": "X", "email": "x@example.com",
            "status": "archived", "source": "website",
        })
        assert r.status_code in (400, 422)

    def test_create_rejects_bad_source(self, auth):
        r = auth.post(f"{BASE_URL}/api/admin/leads", json={
            "name": "X", "email": "x2@example.com",
            "status": "new", "source": "tiktok",
        })
        assert r.status_code in (400, 422)

    def test_list_filter_status(self, auth):
        r = auth.get(f"{BASE_URL}/api/admin/leads", params={"status": "contacted"})
        assert r.status_code == 200
        items = r.json()["leads"]
        assert all(x["status"] == "contacted" for x in items)

    def test_list_filter_source_linkedin(self, auth):
        r = auth.get(f"{BASE_URL}/api/admin/leads", params={"source": "linkedin"})
        assert r.status_code == 200
        items = r.json()["leads"]
        assert all(x["source"] == "linkedin" for x in items)

    def test_list_q_search(self, auth):
        r = auth.get(f"{BASE_URL}/api/admin/leads", params={"q": TEST_PREFIX})
        assert r.status_code == 200
        items = r.json()["leads"]
        assert any(TEST_PREFIX in x["name"] for x in items)

    def test_list_min_score(self, auth):
        r = auth.get(f"{BASE_URL}/api/admin/leads", params={"min_score": 1})
        assert r.status_code == 200
        items = r.json()["leads"]
        assert all(x["score"] >= 1 for x in items)

    def test_patch_raises_score_on_budget_increase(self, auth):
        lid = pytest.lead_id
        initial_score = pytest.lead_initial_score
        r = auth.patch(f"{BASE_URL}/api/admin/leads/{lid}", json={
            "name": f"{TEST_PREFIX} Alice",
            "email": f"{TEST_PREFIX}_alice@example.com",
            "budget": 80000,
            "status": "offer_sent",
            "source": "linkedin",
        })
        assert r.status_code == 200, r.text
        new_score = r.json()["score"]
        assert new_score > initial_score, f"score did not rise: {initial_score} -> {new_score}"
        # GET to confirm persistence
        g = auth.get(f"{BASE_URL}/api/admin/leads/{lid}")
        assert g.status_code == 200
        assert g.json()["budget"] == 80000
        assert g.json()["status"] == "offer_sent"

    def test_delete_lead(self, auth):
        # Create disposable lead
        r = auth.post(f"{BASE_URL}/api/admin/leads", json={
            "name": f"{TEST_PREFIX} Disposable",
            "email": f"{TEST_PREFIX}_del@example.com",
            "status": "new", "source": "other",
        })
        assert r.status_code == 200
        lid = r.json()["id"]
        d = auth.delete(f"{BASE_URL}/api/admin/leads/{lid}")
        assert d.status_code == 200
        # GET should now 404
        g = auth.get(f"{BASE_URL}/api/admin/leads/{lid}")
        assert g.status_code == 404


# ============== Dashboard ==============

class TestLeadsDashboard:
    def test_dashboard_shape(self, auth):
        r = auth.get(f"{BASE_URL}/api/admin/leads/dashboard")
        assert r.status_code == 200, r.text
        d = r.json()
        for key in ["total", "new", "qualified", "won", "lost",
                    "conversion_rate", "avg_score", "by_status",
                    "by_source", "timeline"]:
            assert key in d, f"missing key {key}"
        # by_status keys
        for s in ["new", "contacted", "meeting_scheduled", "offer_sent", "won", "lost"]:
            assert s in d["by_status"]
        # by_source keys
        for s in ["website", "chatbot", "linkedin", "google_ads", "referral", "seo", "other"]:
            assert s in d["by_source"]
        # timeline has 30 days
        assert isinstance(d["timeline"], list) and len(d["timeline"]) == 30
        for item in d["timeline"]:
            assert "date" in item and "count" in item
        assert isinstance(d["conversion_rate"], (int, float))
        assert isinstance(d["avg_score"], (int, float))


# ============== Scoring math sanity ==============

class TestLeadScoring:
    def test_high_score_lead(self, auth):
        """budget=50000, source=referral, status=offer_sent, all contact fields today -> >= 80."""
        r = auth.post(f"{BASE_URL}/api/admin/leads", json={
            "name": f"{TEST_PREFIX} Premium",
            "email": f"{TEST_PREFIX}_premium@example.com",
            "phone": "+491111",
            "company": "Premium GmbH",
            "service": "Beratung",
            "budget": 50000,
            "status": "offer_sent",
            "source": "referral",
            "message": "VIP",
        })
        assert r.status_code == 200, r.text
        score = r.json()["score"]
        assert score >= 80, f"expected >=80, got {score}"
        pytest.premium_lead_id = r.json()["id"]


# ============== Convert to customer ==============

class TestConvert:
    def test_convert_creates_customer_and_marks_won(self, auth):
        lid = pytest.premium_lead_id
        r = auth.post(f"{BASE_URL}/api/admin/leads/{lid}/convert-to-customer")
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["customer_id"]
        cid = body["customer_id"]
        # Lead must be 'won'
        g = auth.get(f"{BASE_URL}/api/admin/leads/{lid}")
        assert g.status_code == 200
        assert g.json()["status"] == "won"
        # Customer must exist (GET returns {customer, requests, projects})
        c = auth.get(f"{BASE_URL}/api/admin/customers/{cid}")
        assert c.status_code == 200, c.text
        cust_payload = c.json()
        cust = cust_payload.get("customer", cust_payload)
        assert cust["email"] == f"{TEST_PREFIX}_premium@example.com"
        pytest.created_customer_id = cid

    def test_convert_idempotent_existing_email(self, auth):
        # Create a second lead with same email and convert — should return existing customer_id
        r = auth.post(f"{BASE_URL}/api/admin/leads", json={
            "name": f"{TEST_PREFIX} Premium Dup",
            "email": f"{TEST_PREFIX}_premium@example.com",
            "status": "new", "source": "website",
        })
        assert r.status_code == 200
        lid2 = r.json()["id"]
        r2 = auth.post(f"{BASE_URL}/api/admin/leads/{lid2}/convert-to-customer")
        assert r2.status_code == 200
        assert r2.json()["customer_id"] == pytest.created_customer_id


# ============== Regression on prior endpoints ==============

class TestRegression:
    @pytest.mark.parametrize("path", [
        "/api/admin/categories",
        "/api/admin/services",
        "/api/admin/projects-mgmt",
        "/api/admin/offers",
        "/api/admin/settings",
        "/api/admin/chatbot/qa",
        "/api/admin/chatbot/config",
        "/api/admin/customers",
        "/api/admin/funnel/overview",
        "/api/admin/dashboard/overview",
    ])
    def test_endpoint_200(self, auth, path):
        r = auth.get(f"{BASE_URL}{path}")
        assert r.status_code == 200, f"{path}: {r.status_code} {r.text[:200]}"


# ============== Cleanup ==============

@pytest.fixture(scope="session", autouse=True)
def cleanup(auth):
    yield
    # Delete any TEST_LEAD_* leads
    try:
        r = auth.get(f"{BASE_URL}/api/admin/leads", params={"q": TEST_PREFIX})
        if r.status_code == 200:
            for lead in r.json().get("leads", []):
                auth.delete(f"{BASE_URL}/api/admin/leads/{lead['id']}")
        # Delete the customer created via convert
        cid = getattr(pytest, "created_customer_id", None)
        if cid:
            auth.delete(f"{BASE_URL}/api/admin/customers/{cid}")
    except Exception:
        pass
