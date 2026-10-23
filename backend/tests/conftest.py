"""Load backend/.env before the tests run so TEST_ADMIN_EMAIL,
TEST_ADMIN_PASSWORD and REACT_APP_BACKEND_URL can live in that (git-ignored)
file instead of being hardcoded in the test modules."""
import os
from pathlib import Path
from urllib.parse import urlparse

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

# Safety net: several tests here (test_zebick_admin_full.py,
# test_smoke_iter8.py) write real documents — and test_campaign_send even
# triggers a real newsletter send — against whatever REACT_APP_BACKEND_URL
# points at. There is no cleanup/teardown for most of that data, so running
# this suite against a live production domain would pollute it (or spam
# real subscribers). Refuse to even collect the tests in that case instead
# of relying on every test author to remember a guard.
_BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "http://localhost:8001")
_HOST = urlparse(_BASE_URL).hostname or ""
_ALLOWED_HOSTS = {"localhost", "127.0.0.1", "0.0.0.0"}
if _HOST not in _ALLOWED_HOSTS and not os.environ.get("ALLOW_REMOTE_TEST_RUN"):
    raise RuntimeError(
        f"REACT_APP_BACKEND_URL={_BASE_URL!r} does not look like a local backend "
        f"(host={_HOST!r}). Refusing to run: this test suite writes real data "
        "(and test_campaign_send sends a real email) and must never run against "
        "a production/staging domain. Set ALLOW_REMOTE_TEST_RUN=1 to override "
        "if you are certain this is safe."
    )
