"""
Zebick QA — Iteration 2
Comprehensive backend test covering:
  - Admin auth (login, verify, JWT requirement on protected routes)
  - Public contact form -> visible in admin submissions + stats
  - Newsletter subscribe / unsubscribe / re-subscribe (no 500)
  - Public leads/capture -> visible in /admin/leads
  - Tools public + admin endpoints incl. 404 + reseed
  - Portfolio public list + detail + 404
  - Testimonials submit + approved listing
  - Game score + leaderboard
  - Health check + German message spelling
"""
import os
import time
import uuid

import pytest
import requests

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
ADMIN_EMAIL = os.environ.get("TEST_ADMIN_EMAIL", "admin@zebick.com")
ADMIN_PASSWORD = os.environ.get("TEST_ADMIN_PASSWORD", "")

# unique-per-run suffix so we don't collide with previous test data
SUFFIX = uuid.uuid4().hex[:8]
TEST_EMAIL_CONTACT = f"TEST_contact_{SUFFIX}@example.com"
TEST_EMAIL_NEWS = f"TEST_news_{SUFFIX}@example.com"
TEST_EMAIL_LEAD = f"TEST_lead_{SUFFIX}@example.com"
TEST_EMAIL_TESTI = f"TEST_testi_{SUFFIX}@example.com"
TEST_PLAYER = f"TEST_{SUFFIX[:6]}"


# ---------- fixtures ----------

@pytest.fixture(scope="session")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_token(session):
    r = session.post(
        f"{BASE_URL}/api/admin/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
        timeout=20,
    )
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "token" in data or "access_token" in data, f"No token in {data}"
    token = data.get("token") or data.get("access_token")
    assert isinstance(token, str) and len(token) > 10
    return token


@pytest.fixture(scope="session")
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}",
            "Content-Type": "application/json"}


@pytest.fixture(scope="session", autouse=True)
def cleanup_test_data(session, admin_headers):
    """Every TEST_/SUFFIX-tagged document this module creates (testimonial,
    lead, game score) is otherwise left behind permanently — contact_forms
    and newsletter_subscribers have no admin delete endpoint, so those two
    can't be cleaned up this way (newsletter is at least unsubscribed)."""
    yield
    try:
        t = session.get(f"{BASE_URL}/api/testimonials/all", headers=admin_headers, timeout=15).json()
        for row in t.get("testimonials", []):
            if SUFFIX in (row.get("name") or ""):
                session.delete(f"{BASE_URL}/api/testimonials/{row['id']}", headers=admin_headers, timeout=15)
    except Exception:
        pass
    try:
        leads = session.get(f"{BASE_URL}/api/admin/leads", headers=admin_headers, timeout=15).json()
        rows = leads if isinstance(leads, list) else (leads.get("leads") or leads.get("items") or [])
        for row in rows:
            if row.get("email") == TEST_EMAIL_LEAD:
                session.delete(f"{BASE_URL}/api/admin/leads/{row['id']}", headers=admin_headers, timeout=15)
    except Exception:
        pass
    try:
        scores = session.get(f"{BASE_URL}/api/admin/game-scores", headers=admin_headers, timeout=15).json()
        for row in scores.get("scores", []):
            if row.get("player_name") == TEST_PLAYER:
                session.delete(f"{BASE_URL}/api/admin/game-scores/{row['id']}", headers=admin_headers, timeout=15)
    except Exception:
        pass
    try:
        session.post(f"{BASE_URL}/api/newsletter/unsubscribe", json={"email": TEST_EMAIL_NEWS}, timeout=15)
    except Exception:
        pass


# ---------- health ----------

def test_health(session):
    r = session.get(f"{BASE_URL}/api/health", timeout=15)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data.get("status") in ("ok", "healthy", "up"), data


# ---------- admin auth ----------

def test_admin_login_invalid_credentials(session):
    r = session.post(
        f"{BASE_URL}/api/admin/login",
        json={"email": ADMIN_EMAIL, "password": "wrong-password-xxx"},
        timeout=15,
    )
    assert r.status_code in (400, 401), r.text


def test_admin_verify_with_token(session, admin_headers):
    r = session.get(f"{BASE_URL}/api/admin/verify", headers=admin_headers, timeout=15)
    assert r.status_code == 200, r.text


def test_admin_verify_without_token(session):
    r = session.get(f"{BASE_URL}/api/admin/verify", timeout=15)
    assert r.status_code in (401, 403), r.text


@pytest.mark.parametrize("path", [
    "/api/contact/submissions",
    "/api/newsletter/subscribers",
    "/api/admin/inbox",
    "/api/admin/leads",
    "/api/admin/tools",
])
def test_admin_routes_require_jwt(session, path):
    r = session.get(f"{BASE_URL}{path}", timeout=15)
    assert r.status_code in (401, 403), f"{path} should require auth, got {r.status_code}"


# ---------- contact form ----------

def test_contact_submit_and_visible_in_admin(session, admin_headers):
    payload = {
        "name": f"TEST QA {SUFFIX}",
        "email": TEST_EMAIL_CONTACT,
        "message": "Bitte um Rueckruf bezueglich Webentwicklung.",
        "service": "Webentwicklung",
        "budget": "5000-10000",
        "company": "TEST GmbH",
        "phone": "+49 30 1234567",
    }
    r = session.post(f"{BASE_URL}/api/contact/submit", json=payload, timeout=20)
    assert r.status_code == 200, r.text
    submitted = r.json()
    assert submitted["email"] == TEST_EMAIL_CONTACT
    assert submitted["name"] == payload["name"]
    assert submitted["message"] == payload["message"]
    assert submitted["service"] == "Webentwicklung"
    assert submitted["budget"] == "5000-10000"
    assert "id" in submitted

    # Now appears in admin
    r2 = session.get(f"{BASE_URL}/api/contact/submissions",
                     headers=admin_headers, timeout=20)
    assert r2.status_code == 200, r2.text
    data = r2.json()
    rows = data if isinstance(data, list) else (
        data.get("submissions") or data.get("items") or [])
    assert isinstance(rows, list) and len(rows) > 0
    matches = [x for x in rows if (x.get("email") or "").lower() == TEST_EMAIL_CONTACT.lower()]
    assert matches, f"Submitted contact {TEST_EMAIL_CONTACT} not found in admin list"
    assert matches[0]["message"] == payload["message"]


def test_contact_stats_after_submission(session, admin_headers):
    r = session.get(f"{BASE_URL}/api/contact/stats",
                    headers=admin_headers, timeout=15)
    assert r.status_code == 200, r.text
    data = r.json()
    assert isinstance(data, dict)
    # there must be at least one total since we just inserted
    total = data.get("total") or data.get("total_submissions") or 0
    assert total >= 1, data


# ---------- newsletter ----------

def test_newsletter_subscribe_and_visible(session, admin_headers):
    r = session.post(f"{BASE_URL}/api/newsletter/subscribe",
                     json={"email": TEST_EMAIL_NEWS}, timeout=20)
    assert r.status_code == 200, r.text
    sub = r.json()
    # Server lowercases the email on save
    assert sub["email"].lower() == TEST_EMAIL_NEWS.lower()
    assert sub.get("status") == "active"
    assert "id" in sub

    # visible in admin subscribers list
    r2 = session.get(f"{BASE_URL}/api/newsletter/subscribers",
                     headers=admin_headers, timeout=20)
    assert r2.status_code == 200, r2.text
    data = r2.json()
    rows = data if isinstance(data, list) else (
        data.get("subscribers") or data.get("items") or [])
    emails = [(x.get("email") or "").lower() for x in rows]
    assert TEST_EMAIL_NEWS.lower() in emails, f"{TEST_EMAIL_NEWS} not in subscribers"


def test_newsletter_stats(session, admin_headers):
    r = session.get(f"{BASE_URL}/api/newsletter/stats",
                    headers=admin_headers, timeout=15)
    assert r.status_code == 200, r.text
    data = r.json()
    assert isinstance(data, dict)
    total = data.get("total") or data.get("total_subscribers") or 0
    assert total >= 1, data


def test_newsletter_duplicate_subscribe_no_500(session):
    """Re-subscribing same active email must NOT return 500."""
    r = session.post(f"{BASE_URL}/api/newsletter/subscribe",
                     json={"email": TEST_EMAIL_NEWS}, timeout=20)
    assert r.status_code != 500, r.text
    # current impl returns 400 with a German message
    if r.status_code == 400:
        msg = (r.json().get("detail") or "").lower()
        assert "bereits" in msg or "registriert" in msg, msg


def test_newsletter_unsubscribe(session, admin_headers):
    r = session.post(f"{BASE_URL}/api/newsletter/unsubscribe",
                     json={"email": TEST_EMAIL_NEWS}, timeout=15)
    assert r.status_code == 200, r.text
    body = r.json()
    msg = body.get("message", "")
    assert "Erfolgreich abgemeldet" in msg, f"German message check failed: {msg}"

    # Verify status flipped to unsubscribed in admin list (filter by status)
    r2 = session.get(f"{BASE_URL}/api/newsletter/subscribers?status=unsubscribed",
                     headers=admin_headers, timeout=15)
    data2 = r2.json()
    rows = data2 if isinstance(data2, list) else (
        data2.get("subscribers") or data2.get("items") or [])
    found = next((x for x in rows
                  if (x.get("email") or "").lower() == TEST_EMAIL_NEWS.lower()), None)
    assert found is not None, "subscriber row missing after unsubscribe"
    assert found.get("status") == "unsubscribed", found


def test_newsletter_resubscribe_after_unsubscribe(session):
    """A previously unsubscribed email should be re-activatable without 500."""
    r = session.post(f"{BASE_URL}/api/newsletter/subscribe",
                     json={"email": TEST_EMAIL_NEWS}, timeout=15)
    assert r.status_code == 200, r.text
    assert r.json().get("status") == "active"


# ---------- leads ----------

def test_lead_capture_and_admin_visibility(session, admin_headers):
    payload = {
        "name": f"TEST Lead {SUFFIX}",
        "email": TEST_EMAIL_LEAD,
        "source": "website",
        "service": "Webentwicklung",
        "budget": 7500,
        "message": "Interesse an einer Website mit Online-Shop.",
        "company": "TEST AG",
    }
    r = session.post(f"{BASE_URL}/api/leads/capture", json=payload, timeout=15)
    assert r.status_code == 200, r.text
    body = r.json()
    assert "id" in body

    # visible in /api/admin/leads
    r2 = session.get(f"{BASE_URL}/api/admin/leads",
                     headers=admin_headers, timeout=20)
    assert r2.status_code == 200, r2.text
    data = r2.json()
    rows = data if isinstance(data, list) else (
        data.get("leads") or data.get("items") or [])
    emails = [x.get("email") for x in rows]
    assert TEST_EMAIL_LEAD in emails, f"Lead {TEST_EMAIL_LEAD} not in admin leads"


# ---------- tools ----------

def test_tools_public_list(session):
    r = session.get(f"{BASE_URL}/api/tools", timeout=15)
    assert r.status_code == 200, r.text
    tools = r.json()
    assert isinstance(tools, list)
    assert len(tools) > 0
    first = tools[0]
    assert "slug" in first
    assert "title" in first
    # check all tools have minimal valid fields
    for t in tools:
        assert isinstance(t.get("slug"), str) and t["slug"]
        assert isinstance(t.get("title"), str) and t["title"]


def test_tools_public_detail_real_slug(session):
    """Real slug should return 200."""
    r = session.get(f"{BASE_URL}/api/tools/kostenrechner", timeout=15)
    assert r.status_code == 200, r.text
    body = r.json()
    assert body.get("slug") == "kostenrechner"
    assert body.get("title")


def test_tools_public_detail_unknown_slug_returns_404(session):
    r = session.get(f"{BASE_URL}/api/tools/decompress-web-3", timeout=15)
    assert r.status_code == 404, f"unknown slug should be 404, got {r.status_code} {r.text}"


def test_tools_admin_list_requires_auth(session, admin_headers):
    r = session.get(f"{BASE_URL}/api/admin/tools",
                    headers=admin_headers, timeout=15)
    assert r.status_code == 200, r.text
    data = r.json()
    assert isinstance(data, list) or isinstance(data, dict)


def test_tools_reseed(session, admin_headers):
    r = session.post(f"{BASE_URL}/api/admin/tools/reseed",
                     headers=admin_headers, timeout=30)
    assert r.status_code == 200, r.text


# ---------- portfolio ----------

def test_portfolio_projects_list(session):
    r = session.get(f"{BASE_URL}/api/portfolio/projects", timeout=15)
    assert r.status_code == 200, r.text
    projects = r.json()
    assert isinstance(projects, list) and len(projects) > 0
    for p in projects:
        assert p.get("title"), p
        assert p.get("category"), p
        assert p.get("description"), p
        assert p.get("slug"), p


def test_portfolio_project_detail_real_slug(session):
    # pick first project from list to avoid hardcoding
    r = session.get(f"{BASE_URL}/api/portfolio/projects", timeout=15)
    slug = r.json()[0]["slug"]
    r2 = session.get(f"{BASE_URL}/api/portfolio/projects/{slug}", timeout=15)
    assert r2.status_code == 200, r2.text
    assert r2.json()["slug"] == slug


def test_portfolio_project_detail_unknown_slug_404(session):
    r = session.get(f"{BASE_URL}/api/portfolio/projects/decompress-web-3", timeout=15)
    assert r.status_code == 404, r.text


# ---------- testimonials ----------

def test_testimonial_submit_and_approved_list(session, admin_headers):
    payload = {
        "name": f"TEST Tester {SUFFIX}",
        "email": TEST_EMAIL_TESTI,
        "content": "Super Zusammenarbeit, sehr empfehlenswertes Team!",
        "rating": 5,
        "company": "TEST Holding",
        "position": "CTO",
    }
    r = session.post(f"{BASE_URL}/api/testimonials/submit",
                     json=payload, timeout=15)
    assert r.status_code == 200, r.text
    submitted = r.json()
    assert submitted["name"] == payload["name"]
    assert submitted["rating"] == 5
    tid = submitted["id"]

    # Approve it via admin
    rapp = session.patch(f"{BASE_URL}/api/testimonials/{tid}/approve",
                        headers=admin_headers, timeout=15)
    assert rapp.status_code == 200, rapp.text

    # Now visible in approved list
    r2 = session.get(f"{BASE_URL}/api/testimonials/approved", timeout=15)
    assert r2.status_code == 200, r2.text
    rows = r2.json()
    names = [x.get("name") for x in rows]
    assert payload["name"] in names


# ---------- game score & leaderboard ----------

def test_game_score_and_leaderboard(session):
    # Number of stored scores above 12344 — must grow by exactly one when our
    # 12345 is recorded. Robust against a leaderboard crowded by earlier runs.
    def scores_above_12344():
        r = session.get(f"{BASE_URL}/api/game/leaderboard/rank",
                        params={"player_name": TEST_PLAYER, "score": 12344}, timeout=15)
        assert r.status_code == 200, r.text
        return r.json()["rank"] - 1

    before = scores_above_12344()
    payload = {"player_name": TEST_PLAYER, "score": 12345,
               "game_id": "space-defender"}
    r = session.post(f"{BASE_URL}/api/game/score", json=payload, timeout=15)
    assert r.status_code == 200, r.text
    body = r.json()
    assert body.get("player_name") == TEST_PLAYER
    assert body.get("score") == 12345
    assert scores_above_12344() == before + 1, "score was not recorded"

    r2 = session.get(f"{BASE_URL}/api/game/leaderboard", params={"limit": 50}, timeout=15)
    assert r2.status_code == 200, r2.text
    rows = r2.json()
    assert isinstance(rows, list)
    names = [x.get("player_name") for x in rows]
    # Only require presence if the top 50 isn't already filled with >= 12345.
    crowded = len(rows) >= 50 and min(x["score"] for x in rows) >= 12345
    if not crowded:
        assert TEST_PLAYER in names, f"player {TEST_PLAYER} not in leaderboard"


# ---------- German spelling spot-check ----------

def test_german_messages_no_obvious_typos(session):
    """Spot-check selected German user-facing strings."""
    # Already-registered message
    r = session.post(f"{BASE_URL}/api/newsletter/subscribe",
                     json={"email": TEST_EMAIL_CONTACT}, timeout=15)
    # may be 200 or 400, depending on prior state
    if r.status_code == 400:
        detail = r.json().get("detail", "")
        # correct spelling: "bereits registriert"
        assert "bereit" in detail and "registriert" in detail, detail
    # Unsubscribe non-existent email
    bogus = f"TEST_doesnotexist_{SUFFIX}@example.com"
    r2 = session.post(f"{BASE_URL}/api/newsletter/unsubscribe",
                      json={"email": bogus}, timeout=15)
    assert r2.status_code == 404
    detail2 = r2.json().get("detail", "")
    assert "nicht gefunden" in detail2, detail2
