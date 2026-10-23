"""Tests for tools export/import + backup-restore self-heal (iteration_6)."""
import os
import json
import pytest
import requests
from pathlib import Path

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # frontend/.env
    for line in (Path(__file__).resolve().parents[2] / "frontend" / ".env").read_text().splitlines():
        if line.startswith("REACT_APP_BACKEND_URL="):
            BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
            break

ADMIN_EMAIL = os.environ.get("TEST_ADMIN_EMAIL", "admin@zebick.com")
ADMIN_PASSWORD = os.environ.get("TEST_ADMIN_PASSWORD", "")


@pytest.fixture(scope="module")
def token():
    r = requests.post(f"{BASE_URL}/api/admin/login",
                      json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    j = r.json()
    tok = j.get("access_token")
    if not tok and j.get("mfa_required"):
        pytest.skip("MFA required — cannot proceed automated")
    assert tok, f"no access_token in {j}"
    return tok


@pytest.fixture(scope="module")
def headers(token):
    return {"Authorization": f"Bearer {token}"}


# ------------- EXPORT -------------

def test_export_requires_auth():
    r = requests.get(f"{BASE_URL}/api/admin/tools/export", timeout=10)
    assert r.status_code in (401, 403), f"expected 401/403, got {r.status_code}"


def test_export_returns_payload(headers):
    r = requests.get(f"{BASE_URL}/api/admin/tools/export", headers=headers, timeout=15)
    assert r.status_code == 200, r.text
    data = r.json()
    for k in ("exported_at", "exported_by", "version", "count", "tools"):
        assert k in data, f"missing {k}"
    assert isinstance(data["tools"], list)
    assert data["count"] == len(data["tools"])
    assert data["exported_by"] == ADMIN_EMAIL


def test_export_route_not_swallowed_by_id_route(headers):
    """Route ordering: /admin/tools/export must not match /admin/tools/{tool_id}."""
    r = requests.get(f"{BASE_URL}/api/admin/tools/export", headers=headers, timeout=10)
    assert r.status_code == 200
    assert "tools" in r.json()
    assert r.json().get("count", 0) >= 1


# ------------- IMPORT MERGE -------------

QA_SLUG = "qa-import-tool"


def _cleanup_qa(headers):
    # find tool by slug via admin list
    r = requests.get(f"{BASE_URL}/api/admin/tools", headers=headers, timeout=10)
    if r.status_code == 200:
        for t in r.json():
            if t.get("slug") == QA_SLUG:
                requests.delete(f"{BASE_URL}/api/admin/tools/{t['id']}", headers=headers, timeout=10)


def test_import_merge_creates_new(headers):
    _cleanup_qa(headers)
    body = {"tools": [{"slug": QA_SLUG, "title": "QA Import",
                       "service_id": "general", "type": "advisor", "enabled": True}],
            "replace": False}
    r = requests.post(f"{BASE_URL}/api/admin/tools/import", headers=headers, json=body, timeout=15)
    assert r.status_code == 200, r.text
    j = r.json()
    assert j == {"created": 1, "updated": 0, "skipped": 0, "skip_reasons": [], "total": 1}, j


def test_import_merge_updates_same_slug(headers):
    body = {"tools": [{"slug": QA_SLUG, "title": "QA Import Updated",
                       "service_id": "general", "type": "advisor", "enabled": True}],
            "replace": False}
    r = requests.post(f"{BASE_URL}/api/admin/tools/import", headers=headers, json=body, timeout=15)
    assert r.status_code == 200, r.text
    j = r.json()
    assert j["created"] == 0 and j["updated"] == 1 and j["skipped"] == 0, j

    # No duplicate + visible in public + admin
    pub = requests.get(f"{BASE_URL}/api/tools", timeout=10).json()
    matches = [t for t in pub if t.get("slug") == QA_SLUG]
    assert len(matches) == 1, f"expected 1 match in public, got {len(matches)}"
    assert matches[0]["title"] == "QA Import Updated"

    adm = requests.get(f"{BASE_URL}/api/admin/tools", headers=headers, timeout=10).json()
    admin_matches = [t for t in adm if t.get("slug") == QA_SLUG]
    assert len(admin_matches) == 1


def test_import_skips_invalid_entries(headers):
    body = {"tools": [
        {"title": "no-slug"},                      # missing slug -> skip
        {"slug": "s-only"},                        # missing title -> skip
        {"slug": QA_SLUG, "title": "QA Import Updated 2",
         "service_id": "general", "type": "advisor"},  # valid update
    ], "replace": False}
    r = requests.post(f"{BASE_URL}/api/admin/tools/import", headers=headers, json=body, timeout=15)
    assert r.status_code == 200, r.text
    j = r.json()
    assert j["skipped"] == 2, j
    assert [x["index"] for x in j["skip_reasons"]] == [0, 1], j
    assert all(x["error"] for x in j["skip_reasons"]), j
    assert j["updated"] == 1 or j["created"] == 1


def test_cleanup_qa_before_replace(headers):
    _cleanup_qa(headers)


# ------------- IMPORT REPLACE -------------

def test_import_replace_wipes_and_reseeds(headers):
    before = requests.get(f"{BASE_URL}/api/admin/tools", headers=headers, timeout=10).json()
    assert len(before) >= 1

    body = {"tools": [{"slug": "replace-only", "title": "Only One",
                       "service_id": "general", "type": "advisor"}],
            "replace": True}
    r = requests.post(f"{BASE_URL}/api/admin/tools/import", headers=headers, json=body, timeout=15)
    assert r.status_code == 200, r.text
    j = r.json()
    assert j["created"] == 1 and j["updated"] == 0, j

    after = requests.get(f"{BASE_URL}/api/admin/tools", headers=headers, timeout=10).json()
    assert len(after) == 1, f"expected 1 tool after replace, got {len(after)}"
    assert after[0]["slug"] == "replace-only"


def test_reseed_restores_defaults(headers):
    r = requests.post(f"{BASE_URL}/api/admin/tools/reseed", headers=headers, timeout=20)
    assert r.status_code == 200, r.text
    j = r.json()
    assert j.get("reseeded", 0) >= 16
    lst = requests.get(f"{BASE_URL}/api/admin/tools", headers=headers, timeout=10).json()
    assert len(lst) >= 16, f"expected >=16 after reseed, got {len(lst)}"


# ------------- BACKUP INCLUDES tools_config -------------

def test_latest_backup_contains_tools_config():
    files = sorted(Path(os.environ.get("BACKUP_DIR") or Path(__file__).resolve().parents[1] / "backups").glob("zebick-*.json"), reverse=True)
    assert files, "no backup file present"
    data = json.loads(files[0].read_text(encoding="utf-8"))
    cols = data.get("collections", {})
    assert "tools_config" in cols, f"tools_config missing; keys={list(cols.keys())}"
    assert isinstance(cols["tools_config"], list)
    assert len(cols["tools_config"]) >= 1


# ------------- SELF-HEAL from empty (restore from backup) -------------

def test_self_heal_restores_from_backup(headers):
    """Empty tools_config via mongo, then GET /api/tools should self-heal to >=16
    (either from backup or reseed fallback)."""
    from pymongo import MongoClient
    mongo_url = None
    db_name = None
    for l in open(Path(__file__).resolve().parents[1] / ".env").read().splitlines():
        if l.startswith("MONGO_URL="):
            mongo_url = l.split("=", 1)[1].strip().strip('"').strip("'")
        elif l.startswith("DB_NAME="):
            db_name = l.split("=", 1)[1].strip().strip('"').strip("'")
    assert mongo_url and db_name, f"env missing: MONGO_URL={mongo_url} DB_NAME={db_name}"
    client = MongoClient(mongo_url)
    client[db_name].tools_config.delete_many({})
    assert client[db_name].tools_config.count_documents({}) == 0

    # Trigger self-heal via public endpoint
    r = requests.get(f"{BASE_URL}/api/tools", timeout=20)
    assert r.status_code == 200, r.text
    tools = r.json()
    assert len(tools) >= 16, f"self-heal produced only {len(tools)} tools"


def test_final_state_16_defaults(headers):
    """Ensure the final state is the 16-default set for downstream regression tests."""
    r = requests.post(f"{BASE_URL}/api/admin/tools/reseed", headers=headers, timeout=20)
    assert r.status_code == 200
    lst = requests.get(f"{BASE_URL}/api/admin/tools", headers=headers, timeout=10).json()
    assert len(lst) >= 16
