"""Guard: the project must stay free of Emergent runtime dependencies.

Same intent as test_chatbot_iter3.py, but every path is resolved relative to
this file. That older test hardcodes the Emergent pod path /app/backend, so on
any other machine it scans a different folder. No running server needed.
"""
import os
import re
from pathlib import Path

import pytest

BACKEND = Path(__file__).resolve().parents[1]
ROOT = BACKEND.parent
SKIP_DIRS = {"venv", ".venv", "site-packages", "__pycache__", "tests", "node_modules"}
FORBIDDEN = [
    r"\bemergentintegrations\b",
    r"\bUserMessage\b",  # exported by the removed emergentintegrations lib
    r"@emergentbase/visual-edits",
    r"emergentagent\.com",
    r"EMERGENT_LLM_KEY",
]


def _backend_py_files():
    for root, dirs, files in os.walk(BACKEND):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for f in files:
            if f.endswith(".py"):
                yield Path(root) / f


@pytest.mark.parametrize("pattern", FORBIDDEN)
def test_no_emergent_pattern_in_backend_code(pattern):
    rx = re.compile(pattern)
    offenders = [str(p) for p in _backend_py_files()
                 if rx.search(p.read_text(encoding="utf-8", errors="ignore"))]
    assert not offenders, f"{pattern} found in: {offenders}"


@pytest.mark.parametrize("rel", ["backend/requirements.txt", "frontend/package.json",
                                 "frontend/craco.config.js", "frontend/public/index.html"])
def test_dependency_and_build_files_are_clean(rel):
    text = (ROOT / rel).read_text(encoding="utf-8", errors="ignore").lower()
    assert "emergent" not in text, f"'emergent' still referenced in {rel}"


def test_no_emergent_platform_folder():
    assert not (ROOT / ".emergent").exists(), ".emergent/ platform folder is back"
