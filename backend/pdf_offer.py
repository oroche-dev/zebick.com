"""PDF generator for offers using ReportLab.

Produces a branded, single-page PDF from the offer context.
Used as email attachment when sending offer emails (variants A/B or generic).
"""
from __future__ import annotations

import io
from datetime import datetime, timezone
from typing import Dict, Any

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor, white, black
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# Brand colors (match email templates)
BRAND_ORANGE = HexColor("#FF6B00")
BRAND_DARK = HexColor("#1a1a1a")
BRAND_GREY = HexColor("#555555")
BRAND_LIGHT_GREY = HexColor("#EEEEEE")
BRAND_BG = HexColor("#FFF8F3")
BRAND_BORDER = HexColor("#FFE8D4")


# Variant-specific copy (keeps PDF in sync with email)
VARIANT_CONTENT = {
    "A": {
        "headline": "Ihr individuelles Angebot",
        "tagline": "MASSGESCHNEIDERT · PREMIUM · FESTPREIS",
        "intro": (
            "vielen Dank für Ihr Interesse an unserem Service. "
            "Auf Basis Ihrer Anfrage haben wir ein maßgeschneidertes Angebot für Sie "
            "zusammengestellt — transparent, fair und ohne versteckte Kosten."
        ),
        "features": [
            "Kostenlose Erstberatung (60 Minuten)",
            "Individuelles Konzept & detaillierter Zeitplan",
            "Festpreis-Garantie — keine versteckten Kosten",
            "Persönlicher Support während der Projektlaufzeit",
        ],
        "closing": "Wir freuen uns auf ein persönliches Gespräch.",
    },
    "B": {
        "headline": "Ihr Projekt-Angebot",
        "tagline": "SCHNELL · FLEXIBEL · ERGEBNISORIENTIERT",
        "intro": (
            "großartig, dass Sie sich für eine Zusammenarbeit mit uns interessieren! "
            "Wir haben Ihre Anfrage geprüft und ein klares, ergebnisorientiertes Angebot "
            "vorbereitet — damit Sie schnell zum Ziel kommen."
        ),
        "features": [
            "Schneller Projektstart — innerhalb von 14 Tagen",
            "Agile Umsetzung mit wöchentlichen Updates",
            "Transparente Abrechnung in klaren Meilensteinen",
            "30 Tage kostenloser Support nach Projektabschluss",
        ],
        "closing": "Wann passt Ihnen ein kurzes Kick-off-Gespräch?",
    },
}


def _wrap_text(c: canvas.Canvas, text: str, font: str, size: int, max_w: float) -> list:
    """Naive word-wrap that respects max_w using stringWidth."""
    if not text:
        return [""]
    words = text.split()
    lines, cur = [], ""
    for w in words:
        trial = f"{cur} {w}".strip()
        if pdfmetrics.stringWidth(trial, font, size) <= max_w:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def generate_offer_pdf(context: Dict[str, Any], variant: str = "A") -> bytes:
    """Generate a branded offer PDF from context.

    Expected context keys: name, service, price, timeline, company
    variant: "A" or "B" — controls copy (kept in sync with email variant)
    """
    variant = variant.upper() if variant else "A"
    content = VARIANT_CONTENT.get(variant, VARIANT_CONTENT["A"])

    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    width, height = A4

    name = context.get("name") or "Kunde"
    service = context.get("service") or "Individuelle Lösung"
    price = context.get("price") or "auf Anfrage"
    timeline = context.get("timeline") or "nach Absprache"
    company = context.get("company") or ""

    # ---- Header band ----
    c.setFillColor(BRAND_ORANGE)
    c.rect(0, height - 55 * mm, width, 55 * mm, fill=1, stroke=0)

    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 26)
    c.drawString(20 * mm, height - 28 * mm, "Zebick")
    c.setFont("Helvetica", 9)
    c.drawString(20 * mm, height - 34 * mm,
                 "DIGITALAGENTUR  ·  CYBER SECURITY")

    c.setFont("Helvetica-Bold", 20)
    c.drawRightString(width - 20 * mm, height - 28 * mm, content["headline"])
    c.setFont("Helvetica", 8)
    c.drawRightString(width - 20 * mm, height - 34 * mm, content["tagline"])
    c.setFont("Helvetica-Oblique", 8)
    c.drawRightString(width - 20 * mm, height - 48 * mm, f"Variante {variant}")

    # ---- Greeting ----
    y = height - 70 * mm
    c.setFillColor(BRAND_ORANGE)
    c.setFont("Helvetica-Bold", 16)
    salutation = f"Hallo {name},"
    if company:
        salutation = f"Hallo {name} ({company}),"
    c.drawString(20 * mm, y, salutation)
    y -= 10 * mm

    c.setFillColor(BRAND_GREY)
    c.setFont("Helvetica", 10)
    for line in _wrap_text(c, content["intro"], "Helvetica", 10, width - 40 * mm):
        c.drawString(20 * mm, y, line)
        y -= 5 * mm

    # ---- Service headline ----
    y -= 6 * mm
    c.setFillColor(BRAND_BG)
    c.roundRect(20 * mm, y - 55 * mm, width - 40 * mm, 55 * mm, 4 * mm, fill=1, stroke=0)

    c.setFillColor(BRAND_ORANGE)
    c.setFont("Helvetica-Bold", 13)
    c.drawString(26 * mm, y - 10 * mm, f"{service}  —  Leistungspaket")

    # ---- Features ----
    fy = y - 18 * mm
    c.setFillColor(BRAND_DARK)
    c.setFont("Helvetica", 10)
    for feat in content["features"]:
        c.setFillColor(BRAND_ORANGE)
        c.drawString(26 * mm, fy, "✓")
        c.setFillColor(BRAND_DARK)
        c.drawString(32 * mm, fy, feat)
        fy -= 6 * mm

    # ---- Investition / Zeitraum block ----
    ib_y = y - 55 * mm - 10 * mm
    c.setFillColor(BRAND_DARK)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(20 * mm, ib_y, "INVESTITION & ZEITPLAN")

    c.setStrokeColor(BRAND_LIGHT_GREY)
    c.setLineWidth(0.5)
    c.line(20 * mm, ib_y - 2 * mm, width - 20 * mm, ib_y - 2 * mm)

    c.setFillColor(BRAND_GREY)
    c.setFont("Helvetica", 10)
    c.drawString(22 * mm, ib_y - 10 * mm, "Investition")
    c.setFillColor(BRAND_ORANGE)
    c.setFont("Helvetica-Bold", 14)
    c.drawRightString(width - 22 * mm, ib_y - 10 * mm, str(price))

    c.setFillColor(BRAND_GREY)
    c.setFont("Helvetica", 10)
    c.drawString(22 * mm, ib_y - 17 * mm, "Zeitraum")
    c.setFillColor(BRAND_DARK)
    c.setFont("Helvetica", 11)
    c.drawRightString(width - 22 * mm, ib_y - 17 * mm, str(timeline))

    # ---- Closing ----
    cy = ib_y - 32 * mm
    c.setFillColor(BRAND_GREY)
    c.setFont("Helvetica", 10)
    for line in _wrap_text(c, content["closing"], "Helvetica", 10, width - 40 * mm):
        c.drawString(20 * mm, cy, line)
        cy -= 5 * mm

    cy -= 4 * mm
    c.setFillColor(BRAND_DARK)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(20 * mm, cy, "Herzliche Grüße")
    cy -= 5 * mm
    c.setFont("Helvetica", 10)
    c.setFillColor(BRAND_GREY)
    c.drawString(20 * mm, cy, "Ihr Zebick-Team")

    # ---- Footer ----
    c.setFillColor(BRAND_DARK)
    c.rect(0, 0, width, 20 * mm, fill=1, stroke=0)
    c.setFillColor(BRAND_ORANGE)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(20 * mm, 12 * mm, "Zebick")
    c.setFillColor(HexColor("#aaaaaa"))
    c.setFont("Helvetica", 8)
    c.drawString(20 * mm, 7 * mm, "admin@zebick.com  ·  zebick.com")
    ts = datetime.now(timezone.utc).strftime("%d.%m.%Y")
    c.drawRightString(width - 20 * mm, 7 * mm, f"Erstellt am {ts}  ·  Variante {variant}")

    c.showPage()
    c.save()
    return buf.getvalue()
