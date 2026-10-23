"""End-to-end backend tests for Zebick admin modules added in this iteration.

Covers:
  - Admin login (POST /api/admin/login)
  - Categories CRUD + reorder + seed verification
  - Services CRUD + reorder + category validation
  - Public catalog endpoints (filter by category_slug, is_active filter)
  - Projects management CRUD with status/payment_status validation
  - Offers/Invoices CRUD with totals calculation + PDF generation
  - Site settings (admin + public)
  - Chatbot Q&A CRUD + config + leads/conversations
  - Regression on existing endpoints
"""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "http://localhost:8001").rstrip("/")
ADMIN_EMAIL = os.environ.get("TEST_ADMIN_EMAIL", "admin@zebick.com")
ADMIN_PASSWORD = os.environ.get("TEST_ADMIN_PASSWORD", "")


@pytest.fixture(scope="session")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def token(api):
    r = api.post(f"{BASE_URL}/api/admin/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    if r.status_code != 200:
        pytest.skip(f"Admin login failed: {r.status_code} {r.text[:200]}")
    data = r.json()
    assert "access_token" in data, f"missing token: {data}"
    return data["access_token"]


@pytest.fixture(scope="session")
def auth(api, token):
    api.headers.update({"Authorization": f"Bearer {token}"})
    return api


# ============== AUTH ==============

class TestAuth:
    def test_login_success(self, api):
        r = api.post(f"{BASE_URL}/api/admin/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200, r.text
        body = r.json()
        assert isinstance(body.get("access_token"), str) and len(body["access_token"]) > 10

    def test_login_invalid(self, api):
        r = api.post(f"{BASE_URL}/api/admin/login", json={"email": ADMIN_EMAIL, "password": "WRONG"})
        assert r.status_code in (401, 403, 422)


# ============== CATEGORIES ==============

class TestCategories:
    created_id = None

    def test_seeded_categories(self, auth):
        r = auth.get(f"{BASE_URL}/api/admin/categories")
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["total"] >= 9, f"expected >=9 seeded categories, got {body['total']}"
        names = {c["name"] for c in body["categories"]}
        for n in ["Webentwicklung", "App-Entwicklung", "Cyber Security", "UI/UX Design", "Gaming-Entwicklung",
                  "Chatbot-Entwicklung", "Server & Systeme", "Digitales Marketing & SEO", "Grafikdesign"]:
            assert n in names, f"missing seed category: {n}"

    def test_create_update_delete(self, auth):
        name = f"TEST_Cat_{uuid.uuid4().hex[:6]}"
        r = auth.post(f"{BASE_URL}/api/admin/categories", json={"name": name, "order": 99, "is_active": True})
        assert r.status_code == 200, r.text
        body = r.json()
        cid = body["id"]
        assert body["name"] == name
        assert body["slug"]
        TestCategories.created_id = cid

        # GET verifies persistence
        list_r = auth.get(f"{BASE_URL}/api/admin/categories")
        assert any(c["id"] == cid for c in list_r.json()["categories"])

        # PATCH
        upd = auth.patch(f"{BASE_URL}/api/admin/categories/{cid}",
                         json={"name": name + "_upd", "is_active": False})
        assert upd.status_code == 200, upd.text
        # Verify
        listing = auth.get(f"{BASE_URL}/api/admin/categories").json()["categories"]
        target = next(c for c in listing if c["id"] == cid)
        assert target["name"].endswith("_upd")
        assert target["is_active"] is False

        # Public filter should hide is_active=false
        pub = auth.get(f"{BASE_URL}/api/catalog/categories")
        assert pub.status_code == 200
        assert not any(c["id"] == cid for c in pub.json()["categories"])

        # DELETE
        d = auth.delete(f"{BASE_URL}/api/admin/categories/{cid}")
        assert d.status_code == 200, d.text
        listing2 = auth.get(f"{BASE_URL}/api/admin/categories").json()["categories"]
        assert not any(c["id"] == cid for c in listing2)

    def test_reorder(self, auth):
        cats = auth.get(f"{BASE_URL}/api/admin/categories").json()["categories"]
        ids = [c["id"] for c in cats][:3]
        rev = list(reversed(ids))
        r = auth.post(f"{BASE_URL}/api/admin/categories/reorder", json={"order": rev})
        assert r.status_code == 200, r.text
        after = auth.get(f"{BASE_URL}/api/admin/categories").json()["categories"]
        order_map = {c["id"]: c["order"] for c in after}
        for i, cid in enumerate(rev):
            assert order_map[cid] == i


# ============== SERVICES ==============

class TestServices:
    def test_full_crud_and_filter(self, auth):
        cats = auth.get(f"{BASE_URL}/api/admin/categories").json()["categories"]
        assert cats, "no categories present"
        cat_id = cats[0]["id"]
        cat_slug = cats[0]["slug"]

        # Create
        payload = {
            "category_id": cat_id,
            "title": f"TEST_Service_{uuid.uuid4().hex[:6]}",
            "price_from": 999.99,
            "duration": "2 Wochen",
            "benefits": ["A", "B"],
            "faqs": [{"q": "?", "a": "yes"}],
            "cta_label": "Buchen",
            "cta_url": "https://example.com",
            "is_active": True,
        }
        r = auth.post(f"{BASE_URL}/api/admin/services", json=payload)
        assert r.status_code == 200, r.text
        sid = r.json()["id"]
        assert r.json()["price_from"] == 999.99
        assert r.json()["benefits"] == ["A", "B"]

        # Filter by category
        listed = auth.get(f"{BASE_URL}/api/admin/services?category_id={cat_id}").json()["services"]
        assert any(s["id"] == sid for s in listed)

        # Public listing with slug
        pub = auth.get(f"{BASE_URL}/api/catalog/services?category_slug={cat_slug}").json()
        assert any(s["id"] == sid for s in pub["services"])

        # PATCH
        r2 = auth.patch(f"{BASE_URL}/api/admin/services/{sid}",
                        json={"category_id": cat_id, "title": "TEST_Updated", "price_from": 100, "is_active": False})
        assert r2.status_code == 200

        # DELETE
        d = auth.delete(f"{BASE_URL}/api/admin/services/{sid}")
        assert d.status_code == 200

    def test_invalid_category(self, auth):
        r = auth.post(f"{BASE_URL}/api/admin/services",
                      json={"category_id": "does-not-exist", "title": "X"})
        assert r.status_code == 400


# ============== PROJECTS MANAGEMENT ==============

class TestProjectsMgmt:
    def test_create_with_tasks_and_status_validation(self, auth):
        payload = {
            "name": f"TEST_Project_{uuid.uuid4().hex[:6]}",
            "status": "planned",
            "payment_status": "unpaid",
            "budget": 1000,
            "tasks": [{"title": "Task 1"}, {"title": "Task 2", "done": True}],
            "files": [],
        }
        r = auth.post(f"{BASE_URL}/api/admin/projects-mgmt", json=payload)
        assert r.status_code == 200, r.text
        body = r.json()
        pid = body["id"]
        assert len(body["tasks"]) == 2
        assert all("id" in t for t in body["tasks"])

        # GET
        g = auth.get(f"{BASE_URL}/api/admin/projects-mgmt/{pid}")
        assert g.status_code == 200

        # PATCH with valid statuses
        u = auth.patch(f"{BASE_URL}/api/admin/projects-mgmt/{pid}",
                       json={"name": body["name"], "status": "in_progress", "payment_status": "partial"})
        assert u.status_code == 200

        # Invalid status
        bad = auth.patch(f"{BASE_URL}/api/admin/projects-mgmt/{pid}",
                         json={"name": body["name"], "status": "bogus"})
        assert bad.status_code == 400

        bad2 = auth.patch(f"{BASE_URL}/api/admin/projects-mgmt/{pid}",
                          json={"name": body["name"], "payment_status": "bogus"})
        assert bad2.status_code == 400

        # DELETE
        d = auth.delete(f"{BASE_URL}/api/admin/projects-mgmt/{pid}")
        assert d.status_code == 200

    def test_invalid_status_on_create(self, auth):
        r = auth.post(f"{BASE_URL}/api/admin/projects-mgmt",
                      json={"name": "T", "status": "bad_status"})
        assert r.status_code == 400


# ============== OFFERS / INVOICES ==============

class TestOffers:
    def test_offer_totals_and_pdf(self, auth):
        payload = {
            "type": "offer",
            "title": "TEST_Offer",
            "customer_name": "Kunde GmbH",
            "items": [
                {"description": "Web Dev", "quantity": 2, "unit_price": 100, "tax_rate": 19},
                {"description": "Hosting", "quantity": 1, "unit_price": 50, "tax_rate": 7},
            ],
            "discount_percent": 10,
        }
        r = auth.post(f"{BASE_URL}/api/admin/offers", json=payload)
        assert r.status_code == 200, r.text
        body = r.json()
        oid = body["id"]

        # Number format OFF-YYYY-XXXX
        assert body["number"].startswith("OFF-"), body["number"]
        parts = body["number"].split("-")
        assert len(parts) == 3 and parts[1].isdigit() and len(parts[2]) == 4

        totals = body["totals"]
        # subtotal = 2*100 + 1*50 = 250
        assert totals["subtotal"] == 250
        # discount = 25
        assert totals["discount"] == 25
        # net = 225
        assert totals["net"] == 225
        # tax: line_after = line * net/subtotal = line * 0.9
        # line1 net = 180 * 0.19 = 34.2; line2 net = 45 * 0.07 = 3.15 => 37.35
        assert abs(totals["tax"] - 37.35) < 0.05, totals
        assert abs(totals["total"] - (225 + totals["tax"])) < 0.01

        # PDF
        pdf = auth.get(f"{BASE_URL}/api/admin/offers/{oid}/pdf")
        assert pdf.status_code == 200, pdf.text[:200]
        assert pdf.headers.get("content-type", "").startswith("application/pdf")
        assert pdf.content[:4] == b"%PDF", "PDF stream did not start with %PDF magic"

        # DELETE
        d = auth.delete(f"{BASE_URL}/api/admin/offers/{oid}")
        assert d.status_code == 200

    def test_invoice_number_prefix(self, auth):
        r = auth.post(f"{BASE_URL}/api/admin/offers", json={
            "type": "invoice", "title": "TEST_Inv",
            "items": [{"description": "X", "quantity": 1, "unit_price": 10}],
        })
        assert r.status_code == 200
        assert r.json()["number"].startswith("INV-")
        auth.delete(f"{BASE_URL}/api/admin/offers/{r.json()['id']}")


# ============== SETTINGS ==============

class TestSettings:
    def test_settings_roundtrip(self, api, auth):
        upd = auth.put(f"{BASE_URL}/api/admin/settings", json={
            "company_name": "Zebick Test GmbH",
            "primary_color": "#FF8C32",
            "contact_email": "test@zebick.com",
        })
        assert upd.status_code == 200, upd.text
        g = auth.get(f"{BASE_URL}/api/admin/settings").json()
        assert g.get("company_name") == "Zebick Test GmbH"
        # Public endpoint (no auth required) - use fresh session
        s = requests.Session()
        pub = s.get(f"{BASE_URL}/api/settings/public")
        assert pub.status_code == 200
        assert pub.json().get("company_name") == "Zebick Test GmbH"


# ============== CHATBOT ==============

class TestChatbot:
    def test_qa_crud(self, auth):
        r = auth.post(f"{BASE_URL}/api/admin/chatbot/qa",
                      json={"question": "Wie viel kostet?", "answer": "Ab 999€", "keywords": ["preis"]})
        assert r.status_code == 200, r.text
        qid = r.json()["id"]
        lst = auth.get(f"{BASE_URL}/api/admin/chatbot/qa").json()
        assert any(q["id"] == qid for q in lst["qa"])

        u = auth.patch(f"{BASE_URL}/api/admin/chatbot/qa/{qid}",
                       json={"question": "Aktualisiert?", "answer": "Ja"})
        assert u.status_code == 200

        d = auth.delete(f"{BASE_URL}/api/admin/chatbot/qa/{qid}")
        assert d.status_code == 200

    def test_config_and_lists(self, auth):
        u = auth.put(f"{BASE_URL}/api/admin/chatbot/config", json={"enabled": True, "welcome_message": "Hi!"})
        assert u.status_code == 200
        leads = auth.get(f"{BASE_URL}/api/admin/chatbot/leads")
        assert leads.status_code == 200
        assert "leads" in leads.json()
        conv = auth.get(f"{BASE_URL}/api/admin/chatbot/conversations")
        assert conv.status_code == 200
        assert "conversations" in conv.json()


# ============== REGRESSION ==============

class TestRegression:
    @pytest.mark.parametrize("path", [
        "/api/admin/dashboard/overview",
        "/api/admin/funnel/overview",
        "/api/admin/customers",
        "/api/contact/submissions",
        "/api/portfolio/projects",
        "/api/blog/posts",
        "/api/newsletter/stats",
    ])
    def test_endpoint_ok(self, auth, path):
        r = auth.get(f"{BASE_URL}{path}")
        # Public endpoints (portfolio/blog) may not need auth but still 200
        assert r.status_code in (200,), f"{path} -> {r.status_code} {r.text[:200]}"
