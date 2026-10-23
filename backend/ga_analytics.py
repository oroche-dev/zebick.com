"""Google Analytics 4 Data API integration for the admin Analytics dashboard.

Requires both of the following to actually query real data — with either
missing, every function here falls back to the same {"error": "Not
configured"}-shaped response the dashboard already handled before this
module existed, so nothing breaks until both are set up:

  1. GA_PROPERTY_ID in backend/.env — the numeric GA4 property id
     (Google Analytics > Admin > Property Settings, NOT the "G-XXXX"
     measurement id used for frontend tracking).
  2. backend/ga_credentials.json — a Google Cloud service-account key with
     "Viewer" access granted on that GA4 property.

See docs/google-analytics-setup.md for the full one-time setup walkthrough.
"""
import logging

import config

logger = logging.getLogger("zebick.ga_analytics")

_client = None
_unavailable = False

_NOT_CONFIGURED_OVERVIEW = {
    "error": "Not configured",
    "visitors": {"value": "0", "change": "0%", "isPositive": True},
    "pageViews": {"value": "0", "change": "0%", "isPositive": True},
    "avgSessionDuration": {"value": "0:00", "change": "0%", "isPositive": True},
    "bounceRate": {"value": "0%", "change": "0%", "isPositive": True},
}

# Rough color coding to match the admin UI's existing device/flag styling.
_DEVICE_COLORS = {"desktop": "#FF6B00", "mobile": "#4ADE80", "tablet": "#60A5FA"}
_DEVICE_LABELS = {"desktop": "Desktop", "mobile": "Mobile", "tablet": "Tablet"}


def _country_flag(iso2: str) -> str:
    """ISO 3166-1 alpha-2 code -> flag emoji (regional indicator symbols)."""
    if not iso2 or len(iso2) != 2 or not iso2.isalpha():
        return "🌍"
    return "".join(chr(0x1F1E6 + ord(c.upper()) - ord("A")) for c in iso2)


def _get_client():
    """Lazily builds (and caches) the GA4 Data API client. Returns None —
    never raises — if prerequisites are missing or credentials are invalid,
    so callers can just check `if not client: return <not-configured>`."""
    global _client, _unavailable
    if _client is not None or _unavailable:
        return _client
    if not config.GA_PROPERTY_ID or not config.GA_CREDENTIALS_PATH.exists():
        _unavailable = True
        return None
    try:
        from google.analytics.data_v1beta import BetaAnalyticsDataClient
        from google.oauth2 import service_account

        creds = service_account.Credentials.from_service_account_file(str(config.GA_CREDENTIALS_PATH))
        _client = BetaAnalyticsDataClient(credentials=creds)
    except Exception as e:  # noqa: BLE001
        logger.error(f"GA4 client init failed: {e}")
        _unavailable = True
        return None
    return _client


def _property():
    return f"properties/{config.GA_PROPERTY_ID}"


def _pct_change(current: float, previous: float) -> tuple:
    if previous <= 0:
        return ("100%", True) if current > 0 else ("0%", True)
    change = (current - previous) / previous * 100
    return f"{abs(round(change))}%", change >= 0


def _format_duration(seconds: float) -> str:
    seconds = max(0, int(seconds))
    return f"{seconds // 60}:{seconds % 60:02d}"


def get_overview() -> dict:
    client = _get_client()
    if not client:
        return _NOT_CONFIGURED_OVERVIEW
    try:
        from google.analytics.data_v1beta.types import DateRange, Metric, RunReportRequest

        request = RunReportRequest(
            property=_property(),
            date_ranges=[
                DateRange(start_date="28daysAgo", end_date="today"),
                DateRange(start_date="56daysAgo", end_date="29daysAgo"),
            ],
            metrics=[
                Metric(name="totalUsers"),
                Metric(name="screenPageViews"),
                Metric(name="averageSessionDuration"),
                Metric(name="bounceRate"),
            ],
        )
        response = client.run_report(request)
        if len(response.rows) < 2:
            return _NOT_CONFIGURED_OVERVIEW

        # With 2+ date_ranges and no other dimensions, GA4 returns one row
        # per range, in request order (current period first).
        curr = [float(v.value) for v in response.rows[0].metric_values]
        prev = [float(v.value) for v in response.rows[1].metric_values]

        visitors_change, visitors_up = _pct_change(curr[0], prev[0])
        views_change, views_up = _pct_change(curr[1], prev[1])
        duration_change, duration_up = _pct_change(curr[2], prev[2])
        # Bounce rate going DOWN is the positive direction.
        bounce_change, bounce_down = _pct_change(curr[3], prev[3])

        return {
            "visitors": {"value": f"{int(curr[0]):,}".replace(",", "."), "change": visitors_change, "isPositive": visitors_up},
            "pageViews": {"value": f"{int(curr[1]):,}".replace(",", "."), "change": views_change, "isPositive": views_up},
            "avgSessionDuration": {"value": _format_duration(curr[2]), "change": duration_change, "isPositive": duration_up},
            "bounceRate": {"value": f"{round(curr[3] * 100)}%", "change": bounce_change, "isPositive": not bounce_down},
        }
    except Exception as e:  # noqa: BLE001
        logger.error(f"GA4 overview query failed: {e}")
        return _NOT_CONFIGURED_OVERVIEW


def get_top_pages(limit: int = 8) -> dict:
    client = _get_client()
    if not client:
        return {"pages": [], "error": "Not configured"}
    try:
        from google.analytics.data_v1beta.types import DateRange, Dimension, Metric, OrderBy, RunReportRequest

        request = RunReportRequest(
            property=_property(),
            date_ranges=[DateRange(start_date="28daysAgo", end_date="today")],
            dimensions=[Dimension(name="pagePath")],
            metrics=[Metric(name="screenPageViews")],
            order_bys=[OrderBy(metric=OrderBy.MetricOrderBy(metric_name="screenPageViews"), desc=True)],
            limit=limit,
        )
        response = client.run_report(request)
        rows = [(r.dimension_values[0].value, int(r.metric_values[0].value)) for r in response.rows]
        max_views = max((v for _, v in rows), default=1) or 1
        pages = [
            {"title": path, "views": views, "percentage": round(views / max_views * 100)}
            for path, views in rows
        ]
        return {"pages": pages}
    except Exception as e:  # noqa: BLE001
        logger.error(f"GA4 top-pages query failed: {e}")
        return {"pages": [], "error": "Not configured"}


def get_devices() -> dict:
    client = _get_client()
    if not client:
        return {"devices": [], "error": "Not configured"}
    try:
        from google.analytics.data_v1beta.types import DateRange, Dimension, Metric, RunReportRequest

        request = RunReportRequest(
            property=_property(),
            date_ranges=[DateRange(start_date="28daysAgo", end_date="today")],
            dimensions=[Dimension(name="deviceCategory")],
            metrics=[Metric(name="totalUsers")],
        )
        response = client.run_report(request)
        rows = [(r.dimension_values[0].value, int(r.metric_values[0].value)) for r in response.rows]
        total = sum(v for _, v in rows) or 1
        devices = [
            {
                "type": _DEVICE_LABELS.get(category.lower(), category.title()),
                "percentage": round(count / total * 100),
                "color": _DEVICE_COLORS.get(category.lower(), "#9CA3AF"),
            }
            for category, count in rows
        ]
        return {"devices": devices}
    except Exception as e:  # noqa: BLE001
        logger.error(f"GA4 devices query failed: {e}")
        return {"devices": [], "error": "Not configured"}


def get_countries(limit: int = 8) -> dict:
    client = _get_client()
    if not client:
        return {"countries": [], "error": "Not configured"}
    try:
        from google.analytics.data_v1beta.types import DateRange, Dimension, Metric, OrderBy, RunReportRequest

        request = RunReportRequest(
            property=_property(),
            date_ranges=[DateRange(start_date="28daysAgo", end_date="today")],
            dimensions=[Dimension(name="country"), Dimension(name="countryId")],
            metrics=[Metric(name="totalUsers")],
            order_bys=[OrderBy(metric=OrderBy.MetricOrderBy(metric_name="totalUsers"), desc=True)],
            limit=limit,
        )
        response = client.run_report(request)
        rows = [
            (r.dimension_values[0].value, r.dimension_values[1].value, int(r.metric_values[0].value))
            for r in response.rows
        ]
        total = sum(v for _, _, v in rows) or 1
        countries = [
            {"name": name, "flag": _country_flag(iso2), "percentage": round(count / total * 100)}
            for name, iso2, count in rows
        ]
        return {"countries": countries}
    except Exception as e:  # noqa: BLE001
        logger.error(f"GA4 countries query failed: {e}")
        return {"countries": [], "error": "Not configured"}


def get_realtime() -> dict:
    client = _get_client()
    if not client:
        return {"activeUsers": 0, "error": "Not configured"}
    try:
        from google.analytics.data_v1beta.types import Metric, RunRealtimeReportRequest

        request = RunRealtimeReportRequest(property=_property(), metrics=[Metric(name="activeUsers")])
        response = client.run_realtime_report(request)
        active = int(response.rows[0].metric_values[0].value) if response.rows else 0
        return {"activeUsers": active}
    except Exception as e:  # noqa: BLE001
        logger.error(f"GA4 realtime query failed: {e}")
        return {"activeUsers": 0, "error": "Not configured"}
