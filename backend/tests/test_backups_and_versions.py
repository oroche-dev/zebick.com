"""Tests for backup admin endpoints and tool version history (iteration 7)."""
import os
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
ADMIN_EMAIL = os.environ.get("TEST_ADMIN_EMAIL", "admin@zebick.com")
ADMIN_PW = os.environ.get("TEST_ADMIN_PASSWORD", "")


@pytest.fixture(scope="module")
def token():
    r = requests.post(f"{BASE_URL}/api/admin/login",
                      json={"email": ADMIN_EMAIL, "password": ADMIN_PW}, timeout=30)
    assert r.status_code == 200, r.text
    return r.json()["access_token"]


@pytest.fixture(scope="module")
def auth(token):
    return {"Authorization": f"Bearer {token}"}


# ---------------- BACKUPS ----------------

class TestBackups:
    def test_list_requires_auth(self):
        r = requests.get(f"{BASE_URL}/api/admin/backups", timeout=15)
        assert r.status_code in (401, 403), r.status_code

    def test_list_ok(self, auth):
        r = requests.get(f"{BASE_URL}/api/admin/backups", headers=auth, timeout=30)
        assert r.status_code == 200, r.text
        data = r.json()
        for key in ("backups", "count", "total_size_bytes", "schedule", "location"):
            assert key in data
        assert isinstance(data["backups"], list)
        # newest first: modified_at should be descending
        mods = [b["modified_at"] for b in data["backups"]]
        assert mods == sorted(mods, reverse=True)

    def test_run_backup(self, auth):
        r_before = requests.get(f"{BASE_URL}/api/admin/backups", headers=auth, timeout=30).json()
        r = requests.post(f"{BASE_URL}/api/admin/backups/run", headers=auth, timeout=120)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data.get("status") == "success"
        assert "local_path" in data
        assert "collections" in data and isinstance(data["collections"], dict)
        assert "tools_config" in data["collections"], data["collections"]
        assert "finished_at" in data
        # After run, list reflects it
        time.sleep(1)
        r_after = requests.get(f"{BASE_URL}/api/admin/backups", headers=auth, timeout=30).json()
        assert r_after["count"] >= r_before["count"]
        assert r_after["last_backup"] is not None
        # modified_at recent (within 5 minutes)
        assert r_after["last_backup"]["modified_at"] >= (r_before.get("last_backup") or {}).get("modified_at", "")


# ---------------- VERSIONS ----------------

class TestToolVersions:
    def test_snapshot_on_update(self, auth):
        tools = requests.get(f"{BASE_URL}/api/admin/tools", headers=auth, timeout=30).json()
        assert len(tools) > 0
        # Pick first tool, save its state for restore
        tool = tools[0]
        tool_id = tool["id"]
        original_title = tool["title"]
        try:
            # First edit
            payload1 = dict(tool)
            payload1["title"] = original_title + " [E1]"
            # Strip unknown fields
            for k in ("id", "_id", "created_at", "updated_at", "updated_by"):
                payload1.pop(k, None)
            r = requests.put(f"{BASE_URL}/api/admin/tools/{tool_id}", json=payload1, headers=auth, timeout=30)
            assert r.status_code == 200, r.text

            versions = requests.get(f"{BASE_URL}/api/admin/tools/{tool_id}/versions", headers=auth, timeout=30).json()
            assert len(versions) >= 1
            # newest snapshot must contain PREVIOUS (pre-edit) title
            assert versions[0]["snapshot"]["title"] == original_title

            # Second edit
            payload2 = dict(payload1)
            payload2["title"] = original_title + " [E2]"
            r = requests.put(f"{BASE_URL}/api/admin/tools/{tool_id}", json=payload2, headers=auth, timeout=30)
            assert r.status_code == 200

            versions2 = requests.get(f"{BASE_URL}/api/admin/tools/{tool_id}/versions", headers=auth, timeout=30).json()
            assert len(versions2) >= 2
            # newest first
            sa = [v["saved_at"] for v in versions2]
            assert sa == sorted(sa, reverse=True)
            # newest snapshot title should be the [E1] version now
            assert versions2[0]["snapshot"]["title"] == original_title + " [E1]"
        finally:
            # Restore original title
            restore_payload = {k: v for k, v in tool.items()
                               if k not in ("id", "_id", "created_at", "updated_at", "updated_by")}
            requests.put(f"{BASE_URL}/api/admin/tools/{tool_id}", json=restore_payload, headers=auth, timeout=30)

    def test_restore_version(self, auth):
        tools = requests.get(f"{BASE_URL}/api/admin/tools", headers=auth, timeout=30).json()
        tool = tools[1] if len(tools) > 1 else tools[0]
        tool_id = tool["id"]
        original_title = tool["title"]
        original_created = tool.get("created_at")

        # Edit -> creates a version with snapshot.title == original_title
        payload = {k: v for k, v in tool.items()
                   if k not in ("id", "_id", "created_at", "updated_at", "updated_by")}
        payload["title"] = original_title + " [changed]"
        r = requests.put(f"{BASE_URL}/api/admin/tools/{tool_id}", json=payload, headers=auth, timeout=30)
        assert r.status_code == 200
        assert r.json()["title"] == original_title + " [changed]"

        versions = requests.get(f"{BASE_URL}/api/admin/tools/{tool_id}/versions", headers=auth, timeout=30).json()
        # Find version with original title
        target = next((v for v in versions if v["snapshot"]["title"] == original_title), None)
        assert target is not None
        vid = target["id"]

        # Restore
        r = requests.post(f"{BASE_URL}/api/admin/tools/{tool_id}/versions/{vid}/restore",
                          headers=auth, timeout=30)
        assert r.status_code == 200, r.text
        restored = r.json()
        assert restored["title"] == original_title
        assert restored["id"] == tool_id  # id preserved
        if original_created:
            assert restored.get("created_at") == original_created

        # Check that a new version with note 'vor Wiederherstellung' was created
        versions_after = requests.get(f"{BASE_URL}/api/admin/tools/{tool_id}/versions",
                                      headers=auth, timeout=30).json()
        notes = [v.get("note") for v in versions_after]
        assert "vor Wiederherstellung" in notes

    def test_delete_removes_versions(self, auth):
        # Create temp tool
        payload = {
            "slug": f"test-temp-{int(time.time())}",
            "service_id": "general",
            "type": "advisor",
            "title": "TEST_TempTool",
            "description": "temp",
            "icon": "Sparkles",
            "enabled": False,
            "order": 999,
        }
        r = requests.post(f"{BASE_URL}/api/admin/tools", json=payload, headers=auth, timeout=30)
        assert r.status_code == 200, r.text
        tid = r.json()["id"]

        # Edit -> creates a version
        payload["title"] = "TEST_TempTool_v2"
        r = requests.put(f"{BASE_URL}/api/admin/tools/{tid}", json=payload, headers=auth, timeout=30)
        assert r.status_code == 200
        versions = requests.get(f"{BASE_URL}/api/admin/tools/{tid}/versions", headers=auth, timeout=30).json()
        assert len(versions) >= 1

        # Delete
        r = requests.delete(f"{BASE_URL}/api/admin/tools/{tid}", headers=auth, timeout=30)
        assert r.status_code == 200

        # Versions gone
        versions_after = requests.get(f"{BASE_URL}/api/admin/tools/{tid}/versions", headers=auth, timeout=30).json()
        assert versions_after == []
