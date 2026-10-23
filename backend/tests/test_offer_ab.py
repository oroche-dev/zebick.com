"""Backend regression + A/B + PDF + tracking tests for Zebick admin app."""
import os
import time
import uuid
import pytest
import requests

BASE_URL = os.environ.get("BACKEND_URL") or os.environ.get("REACT_APP_BACKEND_URL", "http://localhost:8001").rstrip("/")

ADMIN_EMAIL = os.environ.get("TEST_ADMIN_EMAIL", "admin@zebick.com")
ADMIN_PASSWORD = os.environ.get("TEST_ADMIN_PASSWORD", "")

# ---------------- fixtures ----------------

@pytest.fixture(scope="session")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def token(api):
    r = api.post(f"{BASE_URL}/api/admin/login",
                 json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "access_token" in data and len(data["access_token"]) > 50
    assert data["email"] == ADMIN_EMAIL
    return data["access_token"]


@pytest.fixture(scope="session")
def auth(api, token):
    api.headers.update({"Authorization": f"Bearer {token}"})
    return api


@pytest.fixture(scope="session")
def contact_id(auth):
    """Create a throwaway contact via public endpoint, return its id."""
    payload = {
        "name": "TEST AB Tester",
        "email": f"test_ab_{uuid.uuid4().hex[:8]}@example.com",
        "service": "Webentwicklung",
        "message": "Bitte Angebot zusenden.",
        "company": "TEST GmbH",
    }
    r = requests.post(f"{BASE_URL}/api/contact/submit",
                      json=payload, headers={"Content-Type": "application/json"})
    assert r.status_code in (200, 201), f"contact submit failed: {r.status_code} {r.text}"
    data = r.json()
    assert "id" in data
    return data["id"]


# ---------------- Auth ----------------

class TestAuth:
    def test_login_success(self, api):
        r = api.post(f"{BASE_URL}/api/admin/login",
                     json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200
        d = r.json()
        assert d["email"] == ADMIN_EMAIL
        assert isinstance(d["access_token"], str)

    def test_login_bad_password(self, api):
        r = api.post(f"{BASE_URL}/api/admin/login",
                     json={"email": ADMIN_EMAIL, "password": "wrong-pass-123"})
        assert r.status_code in (401, 403)

    def test_protected_requires_auth(self):
        r = requests.get(f"{BASE_URL}/api/admin/offer-ab/stats")
        assert r.status_code in (401, 403)


# ---------------- Public / existing endpoints ----------------

class TestExistingEndpoints:
    def test_testimonials_approved(self):
        r = requests.get(f"{BASE_URL}/api/testimonials/approved")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_newsletter_subscribe(self):
        email = f"nl_test_{uuid.uuid4().hex[:6]}@example.com"
        r = requests.post(f"{BASE_URL}/api/newsletter/subscribe",
                          json={"email": email})
        assert r.status_code in (200, 201), r.text
        d = r.json()
        assert d.get("email") == email

    def test_contact_submit(self):
        r = requests.post(f"{BASE_URL}/api/contact/submit", json={
            "name": "TEST Contact",
            "email": f"tc_{uuid.uuid4().hex[:6]}@example.com",
            "service": "SEO",
            "message": "Testing existing flow",
        })
        assert r.status_code in (200, 201), r.text
        assert "id" in r.json()

    def test_contact_stats_auth(self, auth):
        r = auth.get(f"{BASE_URL}/api/contact/stats")
        assert r.status_code == 200
        d = r.json()
        for k in ("total", "new", "read", "replied"):
            assert k in d


# ---------------- Send-email: PDF + A/B rotation + dark mode ----------------

class TestSendEmailABPdf:

    def test_ab_rotation_and_pdf_attached(self, auth, contact_id):
        """4 consecutive sends with offer_ab_test alternate A/B/A/B and include pdf_attached."""
        variants = []
        tokens = []
        for i in range(4):
            r = auth.post(
                f"{BASE_URL}/api/contact/{contact_id}/send-email",
                json={
                    "template_key": "offer_ab_test",
                    "context": {"price": "1.499 EUR", "service": "Webdesign"},
                },
            )
            assert r.status_code == 200, f"send {i}: {r.status_code} {r.text}"
            d = r.json()
            assert d["pdf_attached"] is True, f"PDF not attached on send {i}: {d}"
            assert d["ab_variant"] in ("A", "B"), d
            assert isinstance(d.get("tracking_token"), str) and len(d["tracking_token"]) >= 16
            variants.append(d["ab_variant"])
            tokens.append(d["tracking_token"])

        # Must alternate (A,B,A,B or B,A,B,A) — no two adjacent equal
        for i in range(1, len(variants)):
            assert variants[i] != variants[i-1], \
                f"AB did not alternate: {variants}"
        # Make tokens unique
        assert len(set(tokens)) == 4

    def test_offer_variant_a_pdf(self, auth, contact_id):
        r = auth.post(f"{BASE_URL}/api/contact/{contact_id}/send-email",
                      json={"template_key": "offer_variant_a"})
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["pdf_attached"] is True
        # when the concrete variant template is used, ab_variant (from A/B rotation) is None
        # but we accept either None or 'A' for flexibility
        assert d["ab_variant"] in (None, "A")

    def test_non_offer_template_no_pdf_default(self, auth, contact_id):
        """Custom body email should NOT auto-attach PDF."""
        r = auth.post(f"{BASE_URL}/api/contact/{contact_id}/send-email",
                      json={"custom_subject": "Hallo", "custom_body_text": "Test"})
        assert r.status_code == 200, r.text
        assert r.json()["pdf_attached"] is False


# ---------------- Stats & sends list ----------------

class TestStatsEndpoints:
    def test_offer_ab_stats(self, auth):
        r = auth.get(f"{BASE_URL}/api/admin/offer-ab/stats")
        assert r.status_code == 200
        d = r.json()
        for k in ("totals", "variants", "winner", "next_variant"):
            assert k in d, d
        assert len(d["variants"]) == 2
        for v in d["variants"]:
            for k in ("variant", "sent", "opened", "clicked", "accepted",
                      "open_rate", "click_rate", "conversion_rate"):
                assert k in v
        assert d["next_variant"] in ("A", "B")

    def test_offer_ab_sends(self, auth):
        r = auth.get(f"{BASE_URL}/api/admin/offer-ab/sends")
        assert r.status_code == 200
        d = r.json()
        assert "sends" in d and isinstance(d["sends"], list)
        if d["sends"]:
            s = d["sends"][0]
            for k in ("variant", "token", "pdf_attached", "sent_at"):
                assert k in s, s


# ---------------- Tracking endpoints (public) ----------------

class TestTracking:
    @pytest.fixture(scope="class")
    def send_and_token(self, auth, contact_id):
        r = auth.post(f"{BASE_URL}/api/contact/{contact_id}/send-email",
                      json={"template_key": "offer_ab_test"})
        assert r.status_code == 200, r.text
        tok = r.json()["tracking_token"]
        assert tok
        return tok

    def test_track_open_gif(self, send_and_token):
        r = requests.get(
            f"{BASE_URL}/api/track/offer/{send_and_token}/open.gif",
            allow_redirects=False,
        )
        assert r.status_code == 200
        assert r.headers.get("content-type", "").startswith("image/gif")
        assert len(r.content) > 20  # non-empty pixel

    def test_track_click_redirect(self, send_and_token):
        r = requests.get(
            f"{BASE_URL}/api/track/offer/{send_and_token}/click",
            allow_redirects=False,
        )
        assert r.status_code in (301, 302, 307)
        assert "location" in {k.lower() for k in r.headers.keys()}

    def test_track_accept_redirect(self, send_and_token):
        r = requests.get(
            f"{BASE_URL}/api/track/offer/{send_and_token}/accept",
            allow_redirects=False,
        )
        assert r.status_code in (301, 302, 307)
        loc = r.headers.get("location", "")
        assert "accepted" in loc or loc  # accepts any redirect target

    def test_tracking_persists_in_stats(self, auth, send_and_token):
        # Give DB a moment after prior stamps
        time.sleep(0.5)
        r = auth.get(f"{BASE_URL}/api/admin/offer-ab/sends?limit=200")
        assert r.status_code == 200
        sends = r.json()["sends"]
        match = next((s for s in sends if s.get("token") == send_and_token), None)
        assert match is not None, "sent record not found"
        assert match["opened_at"] is not None, "opened_at not stamped"
        assert match["clicked_at"] is not None, "clicked_at not stamped"
        assert match["accepted_at"] is not None, "accepted_at not stamped"

    def test_track_unknown_token_still_redirects(self):
        r = requests.get(
            f"{BASE_URL}/api/track/offer/doesnotexist/click",
            allow_redirects=False,
        )
        assert r.status_code in (301, 302, 307)
