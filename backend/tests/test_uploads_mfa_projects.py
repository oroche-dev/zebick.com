"""Backend tests for: file uploads, 2FA setup, projects-mgmt with url-based files,
plus a quick regression on catalog/services/dashboard endpoints.

Iteration 2 focus (review request):
  - POST /api/admin/uploads (multipart) + GET /api/uploads/{id} + DELETE /api/admin/uploads/{id}
  - Reject oversize > 25 MB (413) and disallowed extensions (400)
  - POST /api/admin/projects-mgmt accepting files with `url` (no data_url)
  - POST /api/admin/mfa/setup returns secret + qr_code_png_base64 + provisioning_uri
  - Regression: catalog/categories, catalog/services, settings/public still 200
"""
from pathlib import Path
import os
import io
import base64
import uuid

import pytest
import requests
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[2] / "frontend" / ".env")
BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
ADMIN_EMAIL = os.environ.get("TEST_ADMIN_EMAIL", "admin@zebick.com")
ADMIN_PASSWORD = os.environ.get("TEST_ADMIN_PASSWORD", "")

# --------- Fixtures ---------

@pytest.fixture(scope="session")
def session():
    s = requests.Session()
    return s


@pytest.fixture(scope="session")
def token(session):
    r = session.post(
        f"{BASE_URL}/api/admin/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
        timeout=20,
    )
    assert r.status_code == 200, f"login failed {r.status_code} {r.text[:200]}"
    return r.json()["access_token"]


@pytest.fixture(scope="session")
def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


# --------- Public catalog regression ---------

class TestPublicCatalogRegression:
    def test_categories_public_no_auth(self, session):
        r = session.get(f"{BASE_URL}/api/catalog/categories", timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        # endpoint returns {"total": N, "categories": [...]}
        assert isinstance(data, dict) and "categories" in data, data
        cats = data["categories"]
        assert isinstance(cats, list)
        assert len(cats) >= 9, f"expected >=9 default categories, got {len(cats)}"
        first = cats[0]
        for key in ("id", "name", "slug"):
            assert key in first, f"missing {key} in category: {first}"

    def test_services_public_no_auth(self, session):
        r = session.get(f"{BASE_URL}/api/catalog/services", timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        assert isinstance(data, dict) and "services" in data, data
        assert isinstance(data["services"], list)

    def test_settings_public_no_auth(self, session):
        r = session.get(f"{BASE_URL}/api/settings/public", timeout=15)
        assert r.status_code == 200, r.text


# --------- Uploads ---------

class TestUploads:
    """Multipart file upload pipeline."""

    def _upload(self, session, auth_headers, filename, content, content_type="application/pdf"):
        files = {"file": (filename, content, content_type)}
        return session.post(
            f"{BASE_URL}/api/admin/uploads",
            files=files,
            headers=auth_headers,
            timeout=30,
        )

    def test_upload_requires_auth(self, session):
        r = session.post(
            f"{BASE_URL}/api/admin/uploads",
            files={"file": ("a.pdf", b"abc", "application/pdf")},
            timeout=15,
        )
        assert r.status_code in (401, 403), r.text

    def test_upload_pdf_success(self, session, auth_headers):
        payload = b"%PDF-1.4 TEST_UPLOAD_" + uuid.uuid4().hex.encode()
        r = self._upload(session, auth_headers, "TEST_doc.pdf", payload)
        assert r.status_code == 200, r.text
        body = r.json()
        for key in ("id", "url", "size", "content_type", "name"):
            assert key in body, f"missing {key}: {body}"
        assert body["size"] == len(payload)
        assert body["url"].startswith("/api/uploads/")
        assert body["name"] == "TEST_doc.pdf"

        # GET the file back (requires auth — the endpoint serves internal
        # CRM attachments, not public assets)
        file_id = body["id"]
        r2 = session.get(f"{BASE_URL}/api/uploads/{file_id}", headers=auth_headers, timeout=15)
        assert r2.status_code == 200, r2.text
        assert r2.content == payload
        # content-type should be pdf-ish
        ct = r2.headers.get("content-type", "")
        assert "pdf" in ct.lower() or "octet-stream" in ct.lower(), ct

        # Unauthenticated GET is rejected
        r2b = session.get(f"{BASE_URL}/api/uploads/{file_id}", timeout=15)
        assert r2b.status_code == 401, r2b.text

        # DELETE
        r3 = session.delete(
            f"{BASE_URL}/api/admin/uploads/{file_id}", headers=auth_headers, timeout=15
        )
        assert r3.status_code == 200, r3.text

        # GET again -> 404
        r4 = session.get(f"{BASE_URL}/api/uploads/{file_id}", headers=auth_headers, timeout=15)
        assert r4.status_code == 404

    def test_upload_disallowed_extension(self, session, auth_headers):
        r = self._upload(
            session, auth_headers, "TEST_bad.exe", b"MZ\x00\x00",
            content_type="application/octet-stream",
        )
        assert r.status_code == 400, r.text
        body = r.json()
        assert "detail" in body

    def test_upload_oversize(self, session, auth_headers):
        # 25MB + 1 byte
        big = b"\0" * (25 * 1024 * 1024 + 1)
        r = self._upload(session, auth_headers, "TEST_big.bin", big,
                         content_type="application/octet-stream")
        # 413 expected, but a .bin is also disallowed extension (400 in current code).
        # The route checks extension BEFORE size. We accept either 400 (ext) or 413 (size).
        # To strictly verify 413 we'd need an allowed-ext oversize file; do that too:
        assert r.status_code in (400, 413), r.text

    def test_upload_oversize_allowed_ext(self, session, auth_headers):
        big = b"\0" * (25 * 1024 * 1024 + 1)
        r = self._upload(session, auth_headers, "TEST_big.pdf", big,
                         content_type="application/pdf")
        assert r.status_code == 413, f"expected 413 for >25MB, got {r.status_code} {r.text[:200]}"

    def test_get_nonexistent_upload(self, session, auth_headers):
        r = session.get(f"{BASE_URL}/api/uploads/{uuid.uuid4().hex}", headers=auth_headers, timeout=10)
        assert r.status_code == 404

    def test_get_upload_requires_auth(self, session):
        r = session.get(f"{BASE_URL}/api/uploads/{uuid.uuid4().hex}", timeout=10)
        assert r.status_code == 401

    def test_delete_nonexistent_upload(self, session, auth_headers):
        r = session.delete(
            f"{BASE_URL}/api/admin/uploads/{uuid.uuid4().hex}",
            headers=auth_headers,
            timeout=10,
        )
        assert r.status_code == 404


# --------- Projects mgmt accepts files with url ---------

class TestProjectsMgmtWithFileUrl:
    def test_create_project_with_url_file(self, session, auth_headers):
        # 1) Upload a small file first
        files = {"file": ("TEST_proj_attach.txt", b"hello world", "text/plain")}
        up = session.post(
            f"{BASE_URL}/api/admin/uploads", files=files, headers=auth_headers, timeout=20
        )
        assert up.status_code == 200, up.text
        upmeta = up.json()

        # 2) Create project linking the file by url (no data_url)
        payload = {
            "name": f"TEST_project_{uuid.uuid4().hex[:6]}",
            "description": "TEST_ project with linked file",
            "status": "planned",
            "payment_status": "unpaid",
            "files": [
                {"name": upmeta["name"], "url": upmeta["url"], "id": upmeta["id"], "size": upmeta["size"]}
            ],
        }
        json_headers = {**auth_headers, "Content-Type": "application/json"}
        r = session.post(
            f"{BASE_URL}/api/admin/projects-mgmt",
            json=payload,
            headers=json_headers,
            timeout=20,
        )
        assert r.status_code in (200, 201), r.text
        proj = r.json()
        assert proj.get("id"), proj
        assert isinstance(proj.get("files", []), list) and len(proj["files"]) == 1
        assert proj["files"][0].get("url") == upmeta["url"]

        # cleanup project + upload
        pid = proj["id"]
        d1 = session.delete(
            f"{BASE_URL}/api/admin/projects-mgmt/{pid}", headers=auth_headers, timeout=15
        )
        assert d1.status_code in (200, 204), d1.text
        d2 = session.delete(
            f"{BASE_URL}/api/admin/uploads/{upmeta['id']}", headers=auth_headers, timeout=15
        )
        assert d2.status_code == 200, d2.text


# --------- 2FA Setup (do NOT enable to avoid locking the account) ---------

class TestMfa:
    def test_mfa_setup_returns_secret_and_qr(self, session, auth_headers):
        json_headers = {**auth_headers, "Content-Type": "application/json"}
        r = session.post(
            f"{BASE_URL}/api/admin/mfa/setup",
            json={"current_password": ADMIN_PASSWORD},
            headers=json_headers,
            timeout=15,
        )
        assert r.status_code == 200, r.text
        body = r.json()
        for key in ("secret", "provisioning_uri", "qr_code_png_base64"):
            assert key in body, f"missing {key}: {list(body.keys())}"
        # base32 secret typical length 16+
        assert isinstance(body["secret"], str) and len(body["secret"]) >= 16
        assert body["provisioning_uri"].startswith("otpauth://"), body["provisioning_uri"]
        # qr should decode and start with PNG header
        try:
            png = base64.b64decode(body["qr_code_png_base64"])
        except Exception as e:
            pytest.fail(f"qr base64 invalid: {e}")
        assert png[:8] == b"\x89PNG\r\n\x1a\n", "qr_code_png_base64 is not a PNG"

    def test_mfa_enable_wrong_code_rejected(self, session, auth_headers):
        # ensure setup has been started in this session via previous test
        json_headers = {**auth_headers, "Content-Type": "application/json"}
        r = session.post(
            f"{BASE_URL}/api/admin/mfa/enable",
            json={"code": "000000"},
            headers=json_headers,
            timeout=15,
        )
        # invalid TOTP code => 401, or 400 if setup not started (depending on order)
        assert r.status_code in (400, 401), r.text

    def test_mfa_disable_without_active_returns_ok(self, session, auth_headers):
        # admin should NOT have 2FA enabled in tests; disable should be idempotent
        json_headers = {**auth_headers, "Content-Type": "application/json"}
        r = session.post(
            f"{BASE_URL}/api/admin/mfa/disable",
            json={"code": "000000"},
            headers=json_headers,
            timeout=15,
        )
        # Either 200 with "bereits deaktiviert" or 401 if currently enabled with wrong code
        assert r.status_code in (200, 401), r.text
