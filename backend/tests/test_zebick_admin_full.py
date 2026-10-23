"""Comprehensive admin & public endpoint tests for Zebick site (Jan 2026 iteration).

Run with:
    pytest backend/tests/test_zebick_admin_full.py -v --tb=short \
      --junitxml=test_reports/pytest/pytest_results.xml
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "http://localhost:8001").rstrip("/")
ADMIN_EMAIL = os.environ.get("TEST_ADMIN_EMAIL", "admin@zebick.com")
ADMIN_PASSWORD = os.environ.get("TEST_ADMIN_PASSWORD", "")


@pytest.fixture(scope="session")
def token():
    r = requests.post(f"{BASE_URL}/api/admin/login",
                      json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=20)
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    return r.json()["access_token"]


@pytest.fixture(scope="session")
def headers(token):
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


# ---------- Auth ----------
class TestAuth:
    def test_login_success(self, token):
        assert isinstance(token, str) and len(token) > 20

    def test_login_invalid(self):
        r = requests.post(f"{BASE_URL}/api/admin/login",
                          json={"email": ADMIN_EMAIL, "password": "wrong"}, timeout=15)
        assert r.status_code in (400, 401, 403)

    def test_verify(self, headers):
        r = requests.get(f"{BASE_URL}/api/admin/verify", headers=headers, timeout=15)
        assert r.status_code == 200


# ---------- Dashboard / overview ----------
class TestDashboard:
    def test_dashboard_overview(self, headers):
        r = requests.get(f"{BASE_URL}/api/admin/dashboard/overview", headers=headers, timeout=20)
        assert r.status_code == 200, r.text

    def test_contact_stats(self, headers):
        r = requests.get(f"{BASE_URL}/api/contact/stats", headers=headers, timeout=15)
        assert r.status_code == 200

    def test_newsletter_stats(self, headers):
        r = requests.get(f"{BASE_URL}/api/newsletter/stats", headers=headers, timeout=15)
        assert r.status_code == 200

    def test_testimonials_stats(self, headers):
        r = requests.get(f"{BASE_URL}/api/testimonials/stats", headers=headers, timeout=15)
        assert r.status_code == 200


# ---------- Contacts ----------
class TestContacts:
    def test_list(self, headers):
        r = requests.get(f"{BASE_URL}/api/contact/submissions", headers=headers, timeout=15)
        assert r.status_code == 200


# ---------- Newsletter ----------
class TestNewsletter:
    def test_subscribers_list(self, headers):
        r = requests.get(f"{BASE_URL}/api/newsletter/subscribers", headers=headers, timeout=15)
        assert r.status_code == 200

    def test_subscribe_public(self):
        r = requests.post(f"{BASE_URL}/api/newsletter/subscribe",
                          json={"email": "TEST_news@example.com", "name": "Tester"}, timeout=15)
        assert r.status_code in (200, 201, 400, 409)
        # No admin delete endpoint for subscribers exists, so the best cleanup
        # available is unsubscribing — this at least keeps the test address
        # out of any real campaign send going forward.
        requests.post(f"{BASE_URL}/api/newsletter/unsubscribe",
                      json={"email": "TEST_news@example.com"}, timeout=15)

    @pytest.mark.skipif(
        not os.environ.get("RUN_DANGEROUS_EMAIL_TESTS"),
        reason="Sends a real campaign email to every active newsletter subscriber "
               "(via real SMTP if configured) — opt in with RUN_DANGEROUS_EMAIL_TESTS=1.",
    )
    def test_campaign_send(self, headers):
        # endpoint uses query params per review
        r = requests.post(
            f"{BASE_URL}/api/newsletter/campaign/send",
            params={"subject": "TEST Campaign", "content": "<p>Hello TEST</p>"},
            headers=headers, timeout=20)
        assert r.status_code in (200, 201), r.text


# ---------- Auto-emails ----------
class TestAutoEmails:
    def test_list_all(self, headers):
        r = requests.get(f"{BASE_URL}/api/admin/email-templates/auto", headers=headers, timeout=15)
        assert r.status_code == 200
        data = r.json()
        # Endpoint returns {"templates": [...], "total": N}
        templates = data["templates"] if isinstance(data, dict) else data
        assert len(templates) >= 9, f"expected >=9 templates, got {len(templates)}"
        missing = [t.get("key") for t in templates if "<img" not in (t.get("body_html") or "")]
        assert not missing, f"Templates missing <img> in body_html: {missing}"


# ---------- Testimonials ----------
class TestTestimonials:
    def test_all(self, headers):
        r = requests.get(f"{BASE_URL}/api/testimonials/all", headers=headers, timeout=15)
        assert r.status_code == 200


# ---------- Users ----------
class TestUsers:
    def test_list(self, headers):
        r = requests.get(f"{BASE_URL}/api/admin/users", headers=headers, timeout=15)
        assert r.status_code == 200


# ---------- Analytics ----------
class TestAnalytics:
    def test_overview(self, headers):
        r = requests.get(f"{BASE_URL}/api/analytics/overview", headers=headers, timeout=20)
        assert r.status_code == 200, r.text

    def test_top_pages(self, headers):
        r = requests.get(f"{BASE_URL}/api/analytics/top-pages", headers=headers, timeout=20)
        assert r.status_code == 200

    def test_devices(self, headers):
        r = requests.get(f"{BASE_URL}/api/analytics/devices", headers=headers, timeout=20)
        assert r.status_code == 200

    def test_realtime(self, headers):
        r = requests.get(f"{BASE_URL}/api/analytics/realtime", headers=headers, timeout=20)
        assert r.status_code == 200


# ---------- Security ----------
class TestSecurity:
    def test_audit_log(self, headers):
        r = requests.get(f"{BASE_URL}/api/admin/audit-log", headers=headers, timeout=15)
        assert r.status_code == 200

    def test_login_attempts(self, headers):
        r = requests.get(f"{BASE_URL}/api/admin/login-attempts", headers=headers, timeout=15)
        assert r.status_code == 200

    def test_security_scan(self, headers):
        r = requests.get(f"{BASE_URL}/api/admin/security/scan", headers=headers, timeout=15)
        assert r.status_code == 200

    def test_mfa_setup(self, headers):
        r = requests.post(f"{BASE_URL}/api/admin/mfa/setup",
                          json={"current_password": ADMIN_PASSWORD}, headers=headers, timeout=15)
        assert r.status_code == 200


# ---------- Inbox ----------
class TestInbox:
    def test_list(self, headers):
        r = requests.get(f"{BASE_URL}/api/admin/inbox", headers=headers, timeout=15)
        assert r.status_code == 200

    def test_fetch_now(self, headers):
        r = requests.post(f"{BASE_URL}/api/admin/inbox/fetch-now", headers=headers, timeout=20)
        assert r.status_code in (200, 202, 400, 503)  # may fail w/o IMAP cfg


# ---------- Offer A/B ----------
class TestOfferAB:
    def test_stats(self, headers):
        r = requests.get(f"{BASE_URL}/api/admin/offer-ab/stats", headers=headers, timeout=15)
        assert r.status_code == 200


# ---------- Portfolio ----------
class TestPortfolio:
    def test_admin_list(self, headers):
        r = requests.get(f"{BASE_URL}/api/admin/portfolio/projects", headers=headers, timeout=15)
        assert r.status_code == 200
        assert len(r.json()) >= 4

    def test_public_list(self):
        r = requests.get(f"{BASE_URL}/api/portfolio/projects", timeout=15)
        assert r.status_code == 200


# ---------- Blog ----------
class TestBlog:
    def test_admin_list(self, headers):
        r = requests.get(f"{BASE_URL}/api/admin/blog/posts", headers=headers, timeout=15)
        assert r.status_code == 200
        assert len(r.json()) >= 6

    def test_public_list(self):
        r = requests.get(f"{BASE_URL}/api/blog/posts", timeout=15)
        assert r.status_code == 200


# ---------- Team ----------
class TestTeam:
    def test_admin_list(self, headers):
        r = requests.get(f"{BASE_URL}/api/admin/team/members", headers=headers, timeout=15)
        assert r.status_code == 200
        assert len(r.json()) >= 4


# ---------- FAQ ----------
class TestFAQ:
    def test_admin_list(self, headers):
        r = requests.get(f"{BASE_URL}/api/admin/faq/items", headers=headers, timeout=15)
        assert r.status_code == 200
        assert len(r.json()) >= 5


# ---------- Home content ----------
class TestHomeContent:
    def test_get(self, headers):
        r = requests.get(f"{BASE_URL}/api/admin/content/home", headers=headers, timeout=15)
        assert r.status_code == 200


# ---------- Customers / CRM ----------
class TestCustomers:
    def test_list(self, headers):
        r = requests.get(f"{BASE_URL}/api/admin/customers", headers=headers, timeout=15)
        assert r.status_code == 200

    def test_stats(self, headers):
        r = requests.get(f"{BASE_URL}/api/admin/customers/stats", headers=headers, timeout=15)
        assert r.status_code == 200

    def test_funnel(self, headers):
        r = requests.get(f"{BASE_URL}/api/admin/funnel/overview", headers=headers, timeout=15)
        assert r.status_code == 200

    def test_activities(self, headers):
        r = requests.get(f"{BASE_URL}/api/admin/activities", headers=headers, timeout=15)
        assert r.status_code == 200


# ---------- Categories / Services catalog ----------
class TestCatalog:
    def test_categories(self, headers):
        r = requests.get(f"{BASE_URL}/api/admin/categories", headers=headers, timeout=15)
        assert r.status_code == 200
        data = r.json()
        cats = data["categories"] if isinstance(data, dict) else data
        assert len(cats) >= 9

    def test_services(self, headers):
        r = requests.get(f"{BASE_URL}/api/admin/services", headers=headers, timeout=15)
        assert r.status_code == 200


# ---------- Projects management ----------
class TestProjectsMgmt:
    def test_list(self, headers):
        r = requests.get(f"{BASE_URL}/api/admin/projects-mgmt", headers=headers, timeout=15)
        assert r.status_code == 200


# ---------- Offers ----------
class TestOffers:
    def test_list(self, headers):
        r = requests.get(f"{BASE_URL}/api/admin/offers", headers=headers, timeout=15)
        assert r.status_code == 200


# ---------- Settings ----------
class TestSettings:
    def test_get(self, headers):
        r = requests.get(f"{BASE_URL}/api/admin/settings", headers=headers, timeout=15)
        assert r.status_code == 200


# ---------- Chatbot QA ----------
class TestChatbot:
    def test_qa_list(self, headers):
        r = requests.get(f"{BASE_URL}/api/admin/chatbot/qa", headers=headers, timeout=15)
        assert r.status_code == 200

    def test_config(self, headers):
        r = requests.get(f"{BASE_URL}/api/admin/chatbot/config", headers=headers, timeout=15)
        assert r.status_code == 200


# ---------- Leads ----------
class TestLeads:
    def test_admin_list(self, headers):
        r = requests.get(f"{BASE_URL}/api/admin/leads", headers=headers, timeout=15)
        assert r.status_code == 200


# ---------- Achievements ----------
class TestAchievements:
    def test_list(self, headers):
        r = requests.get(f"{BASE_URL}/api/admin/achievements", headers=headers, timeout=15)
        assert r.status_code == 200
        assert len(r.json()) >= 11


# ---------- Tools (admin) ----------
class TestToolsAdmin:
    def test_list(self, headers):
        r = requests.get(f"{BASE_URL}/api/admin/tools", headers=headers, timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        assert len(data) >= 16, f"expected >=16 tools, got {len(data)}"

    def test_public_list(self):
        r = requests.get(f"{BASE_URL}/api/tools", timeout=15)
        assert r.status_code == 200


# ---------- Public tool submissions (the 'tools don't work' issue) ----------
class TestPublicSubmissions:
    """Tests that public-facing tool forms / contact form succeed.

    These hit public submission endpoints and therefore write real documents
    into live-shared collections (testimonials, leads). `cleanup_after` wipes
    up everything this class creates once the tests finish, so a local test
    run never leaves TEST_* junk behind for an admin to stumble on (or, worse,
    accidentally approve a fake testimonial onto the live site).
    """

    @pytest.fixture(scope="class", autouse=True)
    def cleanup_after(self, headers):
        yield
        try:
            testimonials = requests.get(f"{BASE_URL}/api/testimonials/all", headers=headers, timeout=15).json()
            for t in testimonials.get("testimonials", []):
                if (t.get("email") or "").startswith("TEST_"):
                    requests.delete(f"{BASE_URL}/api/testimonials/{t['id']}", headers=headers, timeout=15)
        except Exception:
            pass
        try:
            leads = requests.get(f"{BASE_URL}/api/admin/leads", headers=headers, timeout=15).json()
            rows = leads if isinstance(leads, list) else leads.get("leads", [])
            for lead in rows:
                if (lead.get("email") or "").startswith("TEST_"):
                    requests.delete(f"{BASE_URL}/api/admin/leads/{lead['id']}", headers=headers, timeout=15)
        except Exception:
            pass
        # Note: contact_forms has no admin delete endpoint, so the
        # TEST_contact@example.com submission below is NOT cleaned up here.
        # It's low-risk (only visible in the admin inbox, never rendered
        # publicly) but should be removed by hand if it bothers you.

    def test_contact_submit(self):
        payload = {
            "name": "TEST Tester",
            "email": "TEST_contact@example.com",
            "phone": "+49123456789",
            "service": "web-development",
            "message": "Automatischer Test der Kontakt-Funktion",
            "consent": True,
        }
        r = requests.post(f"{BASE_URL}/api/contact/submit", json=payload, timeout=20)
        assert r.status_code in (200, 201), f"contact/submit failed: {r.status_code} {r.text}"

    def test_testimonial_submit(self):
        payload = {
            "name": "TEST Testimonial",
            "email": "TEST_testi@example.com",
            "rating": 5,
            "content": "Sehr zufrieden — automatischer Test mit ausreichend Inhalt."
        }
        r = requests.post(f"{BASE_URL}/api/testimonials/submit", json=payload, timeout=20)
        assert r.status_code in (200, 201), f"testimonial submit failed: {r.status_code} {r.text}"

    def test_lead_capture(self):
        payload = {
            "email": "TEST_lead@example.com",
            "name": "TEST Lead",
            "source": "automated_test",
            "interest": "web-development",
        }
        r = requests.post(f"{BASE_URL}/api/leads/capture", json=payload, timeout=15)
        assert r.status_code in (200, 201, 400, 409), f"lead capture: {r.status_code} {r.text}"


# ---------- Email templates content (logo presence) ----------
class TestEmailTemplateLogo:
    def test_all_have_logo(self, headers):
        r = requests.get(f"{BASE_URL}/api/admin/email-templates/auto", headers=headers, timeout=15)
        assert r.status_code == 200
        data = r.json()
        templates = data["templates"] if isinstance(data, dict) else data
        assert len(templates) >= 9
        for tpl in templates:
            body = tpl.get("body_html") or ""
            assert "<img" in body and ("logo" in body.lower()), \
                f"Template {tpl.get('key')} missing logo <img>"
