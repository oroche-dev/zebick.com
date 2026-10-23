"""
Zebick QA — Iteration 3
Targeted backend tests for the rewritten chatbot endpoint (/api/chat).

Context:
- emergentintegrations LLM lib was removed; chat now uses native openai.AsyncOpenAI.
- Locally LLM_API_KEY is NOT set, so /api/chat MUST always return the FALLBACK_CHAT
  string starting with 'Vielen Dank für Ihre Nachricht!' without raising.
- session_id continuity must work (sending the same session_id again must not 500).
- No leftover references to emergentintegrations/UserMessage must remain in backend code.
"""
import os
import re
from pathlib import Path

import pytest
import requests

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")

FALLBACK_PREFIX = "Vielen Dank für Ihre Nachricht!"


@pytest.fixture(scope="session")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# --- /api/health is the simplest smoke check after the rewrite ---

def test_health_after_chatbot_rewrite(session):
    r = session.get(f"{BASE_URL}/api/health", timeout=15)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data.get("status") in ("ok", "healthy", "up")


# --- /api/chat: German message + fallback (no LLM_API_KEY) ---

def test_chat_german_returns_fallback_and_session_id(session):
    payload = {"message": "Hallo, ich brauche eine Website mit Online-Shop."}
    r = session.post(f"{BASE_URL}/api/chat", json=payload, timeout=20)
    assert r.status_code == 200, r.text
    data = r.json()
    # ChatResponse schema
    assert "session_id" in data and isinstance(data["session_id"], str) and data["session_id"]
    assert "response" in data and isinstance(data["response"], str) and data["response"]
    # No LLM_API_KEY locally -> must equal fallback
    assert data["response"].startswith(FALLBACK_PREFIX), data["response"]


def test_chat_session_continuity_no_500(session):
    """Reusing a returned session_id on a second POST must not 500."""
    first = session.post(
        f"{BASE_URL}/api/chat",
        json={"message": "Erste Nachricht"},
        timeout=20,
    )
    assert first.status_code == 200, first.text
    sid = first.json()["session_id"]
    assert sid

    second = session.post(
        f"{BASE_URL}/api/chat",
        json={"message": "Zweite Nachricht mit gleicher Session", "session_id": sid},
        timeout=20,
    )
    assert second.status_code == 200, second.text
    data2 = second.json()
    assert data2.get("response", "").startswith(FALLBACK_PREFIX)
    # When LLM is disabled, server returns the *same* session_id we sent in
    assert data2.get("session_id") == sid, (
        f"session_id continuity broken: sent={sid} got={data2.get('session_id')}"
    )


def test_chat_empty_message_returns_400(session):
    r = session.post(f"{BASE_URL}/api/chat", json={"message": "   "}, timeout=15)
    assert r.status_code == 400, r.text
    detail = (r.json().get("detail") or "").lower()
    assert "leer" in detail or "nicht leer" in detail, detail


def test_chat_long_message_does_not_500(session):
    """Oversized input must be rejected gracefully (400/422), never 500."""
    payload = {"message": "Hallo " * 1000}  # ~6000 chars
    r = session.post(f"{BASE_URL}/api/chat", json=payload, timeout=20)
    assert r.status_code in (200, 400, 422), r.text
    if r.status_code == 200:
        assert r.json().get("response", "").startswith(FALLBACK_PREFIX)


def test_chat_within_2000_chars_succeeds(session):
    """Right-at-the-limit payload should still go through and return fallback."""
    payload = {"message": "Hallo " * 300}  # 1800 chars
    r = session.post(f"{BASE_URL}/api/chat", json=payload, timeout=20)
    assert r.status_code == 200, r.text
    assert r.json().get("response", "").startswith(FALLBACK_PREFIX)


# --- Code-level guarantees: no Emergent imports left over ---

BACKEND_DIR = Path("/app/backend")
FORBIDDEN_PATTERNS = [
    r"\bemergentintegrations\b",
    r"\bUserMessage\b",  # was exported by the removed lib
    r"@emergentbase/visual-edits",
]


def _iter_py_files():
    for p in BACKEND_DIR.rglob("*.py"):
        if "__pycache__" in p.parts or "/tests/" in str(p):
            continue
        yield p


@pytest.mark.parametrize("pattern", FORBIDDEN_PATTERNS)
def test_no_emergent_imports_in_backend(pattern):
    rx = re.compile(pattern)
    offenders = []
    for f in _iter_py_files():
        try:
            txt = f.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            continue
        if rx.search(txt):
            offenders.append(str(f))
    assert not offenders, f"Pattern {pattern} still present in: {offenders}"


def test_requirements_no_emergentintegrations():
    req = (BACKEND_DIR / "requirements.txt").read_text(encoding="utf-8")
    assert "emergentintegrations" not in req.lower(), req


def test_services_exports_fallback_and_chat_send_message():
    """Make sure the new module exposes what routes/public.py imports."""
    txt = (BACKEND_DIR / "services.py").read_text(encoding="utf-8")
    assert "FALLBACK_CHAT" in txt
    assert "chat_send_message" in txt
    assert "get_or_create_chat_session" in txt
    # AsyncOpenAI client is the new transport
    assert "AsyncOpenAI" in txt
