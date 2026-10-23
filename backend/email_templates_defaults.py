"""Premium transactional email templates with logo, gradient headers, and modern design.

Used by email_templates.py — imports the builder helpers.
"""
import os

# Duplicated to keep this module self-contained for in-place replacement
PUBLIC_URL = os.environ.get("PUBLIC_SITE_URL", "https://zebick.com")
LOGO_URL = f"{PUBLIC_URL}/logo.png"


def _header_html(title, emoji=""):
    # Pure black wie auf der Website + prominentes Logo + orange Akzentlinie
    return f"""<tr><td style="padding:0">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:0;text-align:center">
<tr><td style="padding:52px 30px 40px;text-align:center;background:#0a0a0a">
<img src="{LOGO_URL}" alt="Zebick" height="52" class="zb-logo" style="display:inline-block;height:52px;width:auto;filter:brightness(0) invert(1);margin-bottom:26px" />
<div style="width:56px;height:3px;background:#FF6B00;margin:0 auto 24px;border-radius:2px;box-shadow:0 0 12px rgba(255,107,0,0.4)"></div>
<h1 style="color:#fff;font-family:Georgia,'Times New Roman',serif;font-size:28px;font-weight:600;margin:0 0 12px;line-height:1.3;letter-spacing:-0.3px">{title}</h1>
<p style="color:#FF8A33;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;margin:0;letter-spacing:3px;text-transform:uppercase;font-weight:600">Digitalagentur &middot; Cyber Security</p>
</td></tr></table></td></tr>"""


def _social_icons_row():
    """Placeholder — replaced at send time with current admin-settings URLs.

    See email_templates.send_template_email() for the dynamic builder.
    """
    return """<tr><td style="text-align:center;padding:4px 0 22px">{{SOCIAL_ICONS_ROW}}</td></tr>"""


def _footer_html():
    return f"""<tr><td style="background:#0a0a0a;padding:36px 30px 28px;text-align:center;border-top:1px solid rgba(255,107,0,0.2)">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td style="text-align:center;padding-bottom:18px">
<img src="{LOGO_URL}" alt="Zebick" height="32" class="zb-logo" style="display:inline-block;height:32px;width:auto;filter:brightness(0) invert(1);opacity:0.95" />
</td></tr>
<tr><td style="text-align:center;padding-bottom:14px">
<div style="width:36px;height:2px;background:#FF6B00;margin:0 auto 14px;border-radius:1px;box-shadow:0 0 8px rgba(255,107,0,0.5)"></div>
<p style="color:#888;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;margin:0;letter-spacing:0.4px;line-height:1.6">
Digitalagentur &middot; Cyber Security &middot; seit 2012
</p>
</td></tr>
{_social_icons_row()}
<tr><td style="text-align:center;padding-bottom:18px">
<a href="{PUBLIC_URL}" style="color:#B0B7BF;text-decoration:none;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;padding:0 10px;letter-spacing:0.5px">Website</a>
<span style="color:#3A4149">|</span>
<a href="mailto:{{{{CONTACT_EMAIL}}}}" style="color:#B0B7BF;text-decoration:none;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;padding:0 10px;letter-spacing:0.5px">Kontakt</a>
<span style="color:#3A4149">|</span>
<a href="{PUBLIC_URL}/impressum" style="color:#B0B7BF;text-decoration:none;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;padding:0 10px;letter-spacing:0.5px">Impressum</a>
<span style="color:#3A4149">|</span>
<a href="{PUBLIC_URL}/datenschutz" style="color:#B0B7BF;text-decoration:none;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;padding:0 10px;letter-spacing:0.5px">Datenschutz</a>
</td></tr>
<tr><td style="text-align:center;padding-top:18px;border-top:1px solid rgba(255,255,255,0.06)">
<p style="color:#5A6470;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;margin:14px 0 0;line-height:1.6;letter-spacing:0.3px">
&copy; {{{{year}}}} Zebick &middot; Alle Rechte vorbehalten
</p></td></tr></table></td></tr>"""


DARK_MODE_STYLE = """<style>
/* Gmail / Apple Mail / Outlook Dark Mode Support */
:root { color-scheme: light dark; supported-color-schemes: light dark; }
@media (prefers-color-scheme: dark) {
  body, .zb-body { background-color: #0a0d10 !important; color: #E8EBEF !important; }
  .zb-card { background-color: #161B20 !important; box-shadow: 0 12px 40px rgba(0,0,0,0.5) !important; border-color: rgba(255,255,255,0.04) !important; }
  .zb-text, .zb-text * { color: #E8EBEF !important; }
  .zb-muted { color: #8B95A1 !important; }
  .zb-box { background-color: #1B2127 !important; }
  .zb-box-blue { background-color: #0F1A2A !important; }
  .zb-box-amber { background-color: #2A2310 !important; }
  .zb-badge { background-color: #1B2127 !important; border-color: #2A3038 !important; }
  .zb-hr { border-top-color: #2A3038 !important; }
  a.zb-link { color: #FF8C32 !important; }
  /* Logo swap — invert already-inverted logo back to white on dark */
  img.zb-logo { filter: brightness(0) invert(1) !important; }
}
/* Gmail iOS specific */
[data-ogsc] body, u + .body .zb-body { background-color: #0a0d10 !important; }
[data-ogsc] .zb-card { background-color: #161B20 !important; }
[data-ogsc] .zb-text, [data-ogsc] .zb-text * { color: #E8EBEF !important; }
[data-ogsc] .zb-box { background-color: #1B2127 !important; }
</style>"""


def _wrap(inner):
    # Logo als dezentes Wasserzeichen im Body via background-image (Apple Mail, Gmail Web, neuere Outlook).
    # Outlook desktop ignoriert es — dort einfach weisser Hintergrund, was OK ist.
    return f"""<!DOCTYPE html><html><head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="color-scheme" content="light dark" />
<meta name="supported-color-schemes" content="light dark" />
<title>Zebick</title>
{DARK_MODE_STYLE}
</head>
<body class="zb-body" style="margin:0;padding:0;background:#EDEFF2;font-family:'Helvetica Neue',Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="zb-body" style="background:#EDEFF2;padding:32px 12px">
<tr><td align="center">
<table role="presentation" width="620" cellpadding="0" cellspacing="0" class="zb-card" style="max-width:620px;width:100%;background:#ffffff;background-image:url('{LOGO_URL}');background-repeat:no-repeat;background-position:center 320px;background-size:340px auto;border-radius:8px;overflow:hidden;box-shadow:0 8px 32px rgba(15,20,25,0.12),0 2px 8px rgba(15,20,25,0.06);border:1px solid rgba(15,20,25,0.04)">
{inner}
</table>
<table role="presentation" width="620" cellpadding="0" cellspacing="0" style="max-width:620px;width:100%;margin-top:14px">
<tr><td style="text-align:center;padding:6px 0">
<p style="color:#8B95A1;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;margin:0;letter-spacing:0.4px">
Sie erhalten diese E-Mail, weil Sie mit Zebick in Kontakt stehen.
</p></td></tr></table>
</td></tr></table></body></html>"""


def _greeting(greeting, intro_html):
    return f"""<tr><td class="zb-text" style="padding:48px 48px 18px;font-family:'Helvetica Neue',Arial,sans-serif">
<h2 style="color:#0F1419;font-family:Georgia,'Times New Roman',serif;font-size:22px;margin:0 0 18px;font-weight:600;letter-spacing:-0.2px">{greeting}</h2>
<div class="zb-text" style="color:#3A4149;font-size:15px;line-height:1.75;font-weight:400">{intro_html}</div>
</td></tr>"""


def _box(content_html, border_color="#FF6B00", bg="#FAFBFC", box_class="zb-box"):
    return f"""<tr><td style="padding:8px 48px 22px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="{box_class}" style="background:{bg};border-left:3px solid {border_color};border-radius:4px">
<tr><td class="zb-text" style="padding:22px 26px;font-family:'Helvetica Neue',Arial,sans-serif;color:#3A4149;font-size:14px;line-height:1.7">{content_html}</td></tr>
</table></td></tr>"""


def _cta(label, url):
    return f"""<tr><td style="padding:28px 48px;text-align:center">
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto"><tr>
<td style="background:#FF6B00;border-radius:4px;box-shadow:0 4px 12px rgba(255,107,0,0.28)">
<a href="{url}" style="display:inline-block;padding:14px 36px;color:#fff;font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;font-weight:600;text-decoration:none;letter-spacing:0.4px">{label}</a>
</td></tr></table></td></tr>"""


def _para(html, color="#5A6470"):
    return f"""<tr><td class="zb-text zb-muted" style="padding:10px 48px 18px;font-family:'Helvetica Neue',Arial,sans-serif;color:{color};font-size:14px;line-height:1.7">{html}</td></tr>"""


def _badges(items):
    cells = "".join([
        f"""<td width="33%" style="padding:8px;text-align:center;vertical-align:top">
<div class="zb-badge" style="background:#FAFBFC;border-radius:6px;padding:18px 10px;border:1px solid #E8EBEF">
<div style="font-size:24px;margin-bottom:6px;line-height:1">{emoji}</div>
<div class="zb-text" style="font-family:'Helvetica Neue',Arial,sans-serif;color:#0F1419;font-size:12px;font-weight:600;letter-spacing:0.2px">{label}</div>
</div></td>""" for emoji, label in items
    ])
    return f"""<tr><td style="padding:4px 40px 22px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>{cells}</tr></table></td></tr>"""


def build_templates():
    """Return the list of default templates with premium design."""
    return [
        {
            "key": "signature",
            "name": "E-Mail-Signatur (global)",
            "description": "Wird automatisch an alle ausgehenden Admin-E-Mails angehängt (Antworten + Auto-Mails).",
            "trigger": "Alle ausgehenden Mails",
            "enabled": True,
            "subject": "",
            "body_html": f"""<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin-top:24px;border-top:2px solid #FF6B00;padding-top:18px;font-family:Arial,sans-serif">
<tr><td style="padding:4px 0">
<img src="{LOGO_URL}" alt="Zebick" height="34" style="display:block;height:34px;width:auto;margin-bottom:8px" />
<div style="color:#FF6B00;font-size:16px;font-weight:700;margin-bottom:4px">Zebick</div>
<div style="color:#666;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:12px">Digitalagentur &middot; Cyber Security</div>
<div style="color:#333;font-size:13px;line-height:1.6">
<a href="mailto:admin@zebick.com" style="color:#FF6B00;text-decoration:none">&#9993; admin@zebick.com</a><br>
<a href="{PUBLIC_URL}" style="color:#FF6B00;text-decoration:none">&#127760; {PUBLIC_URL.replace('https://','')}</a>
</div>
<div style="color:#aaa;font-size:11px;margin-top:12px;font-style:italic;border-top:1px solid #eee;padding-top:10px">
Vertraulichkeitshinweis: Diese E-Mail ist ausschlie&szlig;lich f&uuml;r den Empf&auml;nger bestimmt.
</div></td></tr></table>""",
            "body_text": "\n\n--\nZebick \u00b7 Digitalagentur & Cyber Security\nadmin@zebick.com \u00b7 zebick.com\n",
            "available_vars": [],
        },
        {
            "key": "offer_variant_a",
            "name": "Angebot Variante A — Premium/Festpreis",
            "description": "A/B-Test Variante A: Premium-Fokus, Festpreisgarantie, ausführlich. Wird über 'Angebot (A/B-Test)' rotiert.",
            "trigger": "A/B-Test Rotation aus /zb-panel-8x2k/contacts",
            "enabled": True,
            "subject": "Ihr pers\u00f6nliches Angebot von Zebick f\u00fcr {{service}} — Festpreis-Garantie",
            "body_html": _wrap(
                _header_html("Ihr individuelles Angebot", "\U0001F4BC")
                + _greeting("Hallo {{name}},",
                            "vielen Dank für Ihr Interesse an unserem Service <strong style='color:#FF6B00'>{{service}}</strong>. "
                            "Auf Basis Ihrer Anfrage haben wir ein <strong>maßgeschneidertes Premium-Angebot</strong> für Sie vorbereitet — "
                            "transparent, fair und mit voller Festpreis-Garantie.")
                + _box(
                    "<div style='font-family:Georgia,serif;font-size:18px;color:#FF6B00;margin-bottom:14px;font-weight:700'>{{service}} &mdash; Premium-Leistungspaket</div>"
                    "<table role='presentation' width='100%' cellpadding='0' cellspacing='0' style='font-size:14px'>"
                    "<tr><td style='padding:6px 0'>&#10003; Kostenlose Erstberatung (60 Minuten)</td></tr>"
                    "<tr><td style='padding:6px 0'>&#10003; Individuelles Konzept &amp; detaillierter Zeitplan</td></tr>"
                    "<tr><td style='padding:6px 0'>&#10003; <strong>Festpreis-Garantie</strong> &mdash; keine versteckten Kosten</td></tr>"
                    "<tr><td style='padding:6px 0'>&#10003; Pers\u00f6nlicher Support w\u00e4hrend der gesamten Projektlaufzeit</td></tr>"
                    "</table>"
                    "<table role='presentation' width='100%' cellpadding='0' cellspacing='0' class='zb-hr' style='margin-top:18px;border-top:1px dashed #FFD4A8;padding-top:14px'>"
                    "<tr><td width='50%' style='font-size:13px;color:#666'>Investition</td>"
                    "<td width='50%' style='font-size:18px;color:#FF6B00;font-weight:700;text-align:right'>{{price}}</td></tr>"
                    "<tr><td style='font-size:13px;color:#666;padding-top:6px'>Zeitraum</td>"
                    "<td style='font-size:14px;color:#333;text-align:right;padding-top:6px'>{{timeline}}</td></tr></table>"
                )
                + _badges([("\U0001F3C6", "Top-Qualität"), ("\U0001F4B0", "Festpreis"), ("\U0001F91D", "Persönlich")])
                + _para("Ein detailliertes Angebot finden Sie <strong>als PDF im Anhang</strong>. Lassen Sie uns in einem unverbindlichen Gespräch die Details besprechen.")
                + _cta("\u2705 Angebot annehmen", "{{accept_url}}")
                + _para("Oder antworten Sie einfach auf diese E-Mail.<br><br><strong style='color:#333'>Herzliche Grüße</strong><br>Ihr Zebick-Team")
                + """<tr><td><img src="{{pixel_url}}" width="1" height="1" alt="" style="display:block" /></td></tr>"""
                + _footer_html()
            ),
            "body_text": "Hallo {{name}},\n\nvielen Dank für Ihr Interesse an {{service}}.\n\nPremium-Leistungspaket:\n✓ Kostenlose Erstberatung (60 Min.)\n✓ Individuelles Konzept & Zeitplan\n✓ Festpreis-Garantie\n✓ Persönlicher Support\n\nInvestition: {{price}}\nZeitraum: {{timeline}}\n\nDas detaillierte Angebot finden Sie im PDF-Anhang.\n\nAngebot annehmen: {{accept_url}}\n\nHerzliche Grüße\nIhr Zebick-Team",
            "available_vars": ["name", "email", "service", "company", "price", "timeline", "accept_url", "pixel_url", "year"],
        },
        {
            "key": "offer_variant_b",
            "name": "Angebot Variante B — Schnell/Agil",
            "description": "A/B-Test Variante B: Schnell-Start, agile Umsetzung, kompakt. Wird über 'Angebot (A/B-Test)' rotiert.",
            "trigger": "A/B-Test Rotation aus /zb-panel-8x2k/contacts",
            "enabled": True,
            "subject": "{{name}}, Ihr Projekt-Angebot von Zebick — startklar in 14 Tagen",
            "body_html": _wrap(
                _header_html("Ihr Projekt-Angebot", "\u26A1")
                + _greeting("Hallo {{name}},",
                            "großartig, dass Sie sich für eine Zusammenarbeit interessieren! "
                            "Für <strong style='color:#FF6B00'>{{service}}</strong> haben wir ein klares, "
                            "<strong>ergebnisorientiertes Angebot</strong> vorbereitet — damit Sie schnell zum Ziel kommen.")
                + _box(
                    "<div style='font-family:Georgia,serif;font-size:18px;color:#FF6B00;margin-bottom:14px;font-weight:700'>\u26A1 {{service}} &mdash; Fast-Track</div>"
                    "<table role='presentation' width='100%' cellpadding='0' cellspacing='0' style='font-size:14px'>"
                    "<tr><td style='padding:6px 0'>&#128640; Schneller Projektstart &mdash; innerhalb von 14 Tagen</td></tr>"
                    "<tr><td style='padding:6px 0'>&#128200; Agile Umsetzung mit w\u00f6chentlichen Updates</td></tr>"
                    "<tr><td style='padding:6px 0'>&#128178; Transparente Abrechnung in klaren Meilensteinen</td></tr>"
                    "<tr><td style='padding:6px 0'>&#128295; 30 Tage kostenloser Support nach Projektabschluss</td></tr>"
                    "</table>"
                    "<table role='presentation' width='100%' cellpadding='0' cellspacing='0' class='zb-hr' style='margin-top:18px;border-top:1px dashed #FFD4A8;padding-top:14px'>"
                    "<tr><td width='50%' style='font-size:13px;color:#666'>Investition</td>"
                    "<td width='50%' style='font-size:18px;color:#FF6B00;font-weight:700;text-align:right'>{{price}}</td></tr>"
                    "<tr><td style='font-size:13px;color:#666;padding-top:6px'>Start</td>"
                    "<td style='font-size:14px;color:#333;text-align:right;padding-top:6px'>{{timeline}}</td></tr></table>"
                )
                + _badges([("\u26A1", "In 14 Tagen"), ("\U0001F504", "Agile"), ("\u2705", "30 Tage Support")])
                + _para("Die <strong>ausführliche PDF-Version</strong> Ihres Angebots liegt dieser E-Mail bei. Wann passt Ihnen ein kurzes Kick-off-Gespräch?")
                + _cta("\U0001F680 Jetzt starten", "{{accept_url}}")
                + _para("Antworten genügt — wir melden uns innerhalb weniger Stunden zurück.<br><br><strong style='color:#333'>Viele Grüße</strong><br>Ihr Zebick-Team")
                + """<tr><td><img src="{{pixel_url}}" width="1" height="1" alt="" style="display:block" /></td></tr>"""
                + _footer_html()
            ),
            "body_text": "Hallo {{name}},\n\nfür {{service}} haben wir ein ergebnisorientiertes Fast-Track-Angebot:\n\n🚀 Start in 14 Tagen\n📈 Agile Umsetzung, wöchentliche Updates\n💲 Transparente Meilenstein-Abrechnung\n🔧 30 Tage Support inklusive\n\nInvestition: {{price}}\nStart: {{timeline}}\n\nDas detaillierte Angebot liegt als PDF bei.\n\nJetzt starten: {{accept_url}}\n\nViele Grüße\nIhr Zebick-Team",
            "available_vars": ["name", "email", "service", "company", "price", "timeline", "accept_url", "pixel_url", "year"],
        },
        {
            "key": "offer_generic",
            "name": "Angebot (generisch)",
            "description": "Vordefiniertes Angebot — manuell versendbar aus der Kontaktliste.",
            "trigger": "Manuell aus /zb-panel-8x2k/contacts",
            "enabled": True,
            "subject": "Ihr pers\u00f6nliches Angebot von Zebick f\u00fcr {{service}}",
            "body_html": _wrap(
                _header_html("Ihr individuelles Angebot", "\U0001F4BC")
                + _greeting("Hallo {{name}},",
                            "vielen Dank f\u00fcr Ihr Interesse an unserem Service <strong style='color:#FF6B00'>{{service}}</strong>. "
                            "Auf Basis Ihrer Anfrage haben wir ein ma\u00dfgeschneidertes Angebot f\u00fcr Sie vorbereitet.")
                + _box(
                    "<div style='font-family:Georgia,serif;font-size:18px;color:#FF6B00;margin-bottom:14px;font-weight:700'>{{service}} &mdash; Leistungspaket</div>"
                    "<table role='presentation' width='100%' cellpadding='0' cellspacing='0' style='font-size:14px'>"
                    "<tr><td style='padding:6px 0'>&#10003; Kostenlose Erstberatung (60 Minuten)</td></tr>"
                    "<tr><td style='padding:6px 0'>&#10003; Individuelles Konzept &amp; detaillierter Zeitplan</td></tr>"
                    "<tr><td style='padding:6px 0'>&#10003; Festpreis-Garantie &mdash; keine versteckten Kosten</td></tr>"
                    "<tr><td style='padding:6px 0'>&#10003; Pers\u00f6nlicher Support w\u00e4hrend der gesamten Projektlaufzeit</td></tr>"
                    "</table>"
                    "<table role='presentation' width='100%' cellpadding='0' cellspacing='0' style='margin-top:18px;border-top:1px dashed #FFD4A8;padding-top:14px'>"
                    "<tr><td width='50%' style='font-size:13px;color:#666'>Investition</td>"
                    "<td width='50%' style='font-size:18px;color:#FF6B00;font-weight:700;text-align:right'>{{price}}</td></tr>"
                    "<tr><td style='font-size:13px;color:#666;padding-top:6px'>Zeitraum</td>"
                    "<td style='font-size:14px;color:#333;text-align:right;padding-top:6px'>{{timeline}}</td></tr></table>"
                )
                + _para("Lassen Sie uns in einem unverbindlichen Gespr\u00e4ch die Details besprechen und den besten Weg f\u00fcr Ihr Projekt finden.")
                + _cta("\U0001F4C5 Termin vereinbaren", "mailto:admin@zebick.com?subject=Terminwunsch%20{{service}}")
                + _para("<strong style='color:#333'>Herzliche Gr\u00fc\u00dfe</strong><br>Ihr Zebick-Team")
                + _footer_html()
            ),
            "body_text": "Hallo {{name}},\n\nvielen Dank f\u00fcr Ihr Interesse an unserem Service {{service}}.\n\nLeistungspaket:\n\u2713 Kostenlose Erstberatung (60 Min.)\n\u2713 Individuelles Konzept & Zeitplan\n\u2713 Festpreis-Garantie\n\u2713 Support w\u00e4hrend der Projektlaufzeit\n\nInvestition: {{price}}\nZeitraum: {{timeline}}\n\nTermin vereinbaren: admin@zebick.com\n\nHerzliche Gr\u00fc\u00dfe\nIhr Zebick-Team",
            "available_vars": ["name", "email", "service", "company", "price", "timeline", "year"],
        },
        {
            "key": "contact_confirmation",
            "name": "Kontaktformular-Best\u00e4tigung",
            "description": "Wird automatisch an Kunden gesendet, die das Kontaktformular ausf\u00fcllen.",
            "trigger": "POST /api/contact/submit",
            "enabled": True,
            "subject": "Vielen Dank f\u00fcr Ihre Anfrage, {{name}}!",
            "body_html": _wrap(
                _header_html("Anfrage erhalten", "\u2728")
                + _greeting("Hallo {{name}},",
                            "vielen Dank f\u00fcr Ihre Nachricht! Wir haben Ihre Anfrage erhalten und melden uns bei Ihnen so schnell wie m\u00f6glich &mdash; "
                            "in der Regel innerhalb von <strong style='color:#FF6B00'>24 Stunden</strong> an Werktagen.")
                + _box(
                    "<div style='font-size:12px;color:#999;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:8px;font-weight:600'>Ihre Anfrage</div>"
                    "<div style='font-style:italic;color:#333;font-size:15px;line-height:1.7'>&bdquo;{{message_preview}}&ldquo;</div>"
                )
                + _badges([("\u26A1", "Antwort in 24h"), ("\U0001F512", "100% vertraulich"), ("\u2B50", "Pers\u00f6nliche Beratung")])
                + _para("Falls Sie dringend Hilfe ben\u00f6tigen, erreichen Sie uns auch direkt per E-Mail.")
                + _cta("\u2709 Direkt antworten", "mailto:admin@zebick.com")
                + _para("<strong style='color:#333'>Herzliche Gr\u00fc\u00dfe</strong><br>Ihr Zebick-Team")
                + _footer_html()
            ),
            "body_text": "Hallo {{name}},\n\nvielen Dank f\u00fcr Ihre Nachricht! Wir melden uns innerhalb von 24 Stunden an Werktagen.\n\nIhre Anfrage:\n\"{{message_preview}}\"\n\nBei dringenden Fragen: admin@zebick.com\n\nHerzliche Gr\u00fc\u00dfe\nIhr Zebick-Team",
            "available_vars": ["name", "email", "message_preview", "service", "company", "year"],
        },
        {
            "key": "newsletter_confirmation",
            "name": "Newsletter-Best\u00e4tigung",
            "description": "Wird beim Newsletter-Opt-In als Willkommens-Mail versendet.",
            "trigger": "POST /api/newsletter/subscribe",
            "enabled": True,
            "subject": "Willkommen beim Zebick-Newsletter \U0001F680",
            "body_html": _wrap(
                _header_html("Willkommen an Bord!", "\U0001F680")
                + _greeting("Sch\u00f6n, dass Sie dabei sind!",
                            "Ab sofort erhalten Sie regelm\u00e4\u00dfig Insights, Tipps und exklusive Angebote rund um "
                            "<strong style='color:#FF6B00'>Digitale Transformation</strong> und <strong style='color:#FF6B00'>Cyber Security</strong>.")
                + """<tr><td style="padding:10px 40px 24px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FFF8F3;border-radius:12px">
<tr><td style="padding:24px">
<div style="font-family:Georgia,serif;color:#FF6B00;font-size:18px;margin-bottom:16px;font-weight:700">Was Sie erwartet:</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;color:#333;font-size:14px;line-height:1.6">
<tr><td style="padding:8px 0;width:40px;vertical-align:top;font-size:22px">&#128161;</td><td style="padding:8px 0">Aktuelle Insights aus Cyber Security &amp; Webentwicklung</td></tr>
<tr><td style="padding:8px 0;vertical-align:top;font-size:22px">&#128200;</td><td style="padding:8px 0">Praxis-Tipps f\u00fcr digitale Transformation</td></tr>
<tr><td style="padding:8px 0;vertical-align:top;font-size:22px">&#127873;</td><td style="padding:8px 0">Exklusive Angebote f\u00fcr Abonnenten</td></tr>
<tr><td style="padding:8px 0;vertical-align:top;font-size:22px">&#128197;</td><td style="padding:8px 0">Einladungen zu Events &amp; Webinaren</td></tr>
</table></td></tr></table></td></tr>"""
                + _para("Ihre E-Mail-Adresse: <strong style='color:#FF6B00'>{{email}}</strong>")
                + _cta("\U0001F310 Zur Website", PUBLIC_URL)
                + _para(f"Kein Interesse mehr? <a href='{PUBLIC_URL}/newsletter/unsubscribe?email={{{{email}}}}' style='color:#999;text-decoration:underline'>Hier abmelden</a>.", color="#999")
                + _footer_html()
            ),
            "body_text": "Willkommen beim Zebick-Newsletter!\n\nAb sofort erhalten Sie regelm\u00e4\u00dfig Insights und Angebote.\n\n\u2022 Cyber Security & Webentwicklung Insights\n\u2022 Praxis-Tipps f\u00fcr digitale Transformation\n\u2022 Exklusive Angebote\n\u2022 Event-Einladungen\n\nIhre E-Mail: {{email}}\nAbmelden: zebick.com/newsletter/unsubscribe?email={{email}}\n\nHerzliche Gr\u00fc\u00dfe\nIhr Zebick-Team",
            "available_vars": ["email", "year"],
        },
        {
            "key": "testimonial_thankyou",
            "name": "Bewertungs-Dankesch\u00f6n",
            "description": "Wird gesendet, wenn ein Kunde eine Bewertung abgegeben hat.",
            "trigger": "POST /api/testimonials/submit",
            "enabled": True,
            "subject": "Vielen Dank f\u00fcr Ihre Bewertung, {{name}}! \u2B50",
            "body_html": _wrap(
                _header_html("Danke f\u00fcr Ihre Bewertung!", "\u2B50")
                + _greeting("Hallo {{name}},",
                            "herzlichen Dank f\u00fcr Ihre wertvolle Bewertung mit <strong style='color:#F59E0B'>{{rating}} von 5 Sternen</strong>! "
                            "Ihr Feedback hilft uns nicht nur, besser zu werden, sondern zeigt auch anderen Kunden die Qualit\u00e4t unserer Arbeit.")
                + """<tr><td style="padding:0 40px 20px;text-align:center">
<div style="font-size:36px;letter-spacing:6px;color:#F59E0B">&#11088;&#11088;&#11088;&#11088;&#11088;</div>
</td></tr>"""
                + _box(
                    "<div style='font-size:12px;color:#999;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:8px;font-weight:600'>Ihre Bewertung</div>"
                    "<div style='font-style:italic;color:#333;font-size:15px;line-height:1.7'>&bdquo;{{content_preview}}&ldquo;</div>",
                    border_color="#F59E0B", bg="#FFFAEC"
                )
                + _para("Nach einer kurzen Pr\u00fcfung wird Ihre Bewertung auf unserer Website ver\u00f6ffentlicht.")
                + _cta("\U0001F310 Zur Website", PUBLIC_URL)
                + _para("<strong style='color:#333'>Herzliche Gr\u00fc\u00dfe</strong><br>Ihr Zebick-Team")
                + _footer_html()
            ),
            "body_text": "Hallo {{name}},\n\nherzlichen Dank f\u00fcr Ihre Bewertung mit {{rating}} von 5 Sternen!\n\n\"{{content_preview}}\"\n\nNach Pr\u00fcfung wird Ihre Bewertung ver\u00f6ffentlicht.\n\nHerzliche Gr\u00fc\u00dfe\nIhr Zebick-Team",
            "available_vars": ["name", "rating", "content_preview", "company", "year"],
        },
        {
            "key": "newsletter_campaign",
            "name": "Newsletter-Kampagne (Marketing)",
            "description": "Wird beim Versenden einer Newsletter-Marketing-Kampagne als Wrapper genutzt — Logo, Header & Footer werden automatisch ergänzt.",
            "trigger": "POST /api/newsletter/campaign/send (Admin)",
            "enabled": True,
            "subject": "{{subject}}",
            "body_html": _wrap(
                _header_html("{{subject}}", "\U0001F4E2")
                + _greeting("Hallo,", "{{content_html}}")
                + _cta("\U0001F310 Mehr erfahren", PUBLIC_URL)
                + _para(f"Kein Interesse mehr? <a href='{PUBLIC_URL}/newsletter/unsubscribe?email={{{{email}}}}' style='color:#999;text-decoration:underline'>Hier abmelden</a>.", color="#999")
                + _footer_html()
            ),
            "body_text": "{{subject}}\n\n{{content_text}}\n\nMehr erfahren: " + PUBLIC_URL + "\nAbmelden: " + PUBLIC_URL + "/newsletter/unsubscribe?email={{email}}",
            "available_vars": ["subject", "content_html", "content_text", "email", "year"],
        },
        {
            "key": "lead_confirmation",
            "name": "Lead-Formular-Best\u00e4tigung",
            "description": "Wird bei Lead-Anfragen aus den Service-Seiten versendet.",
            "trigger": "POST /api/leads",
            "enabled": True,
            "subject": "Ihre Service-Anfrage bei Zebick, {{name}}",
            "body_html": _wrap(
                _header_html("Anfrage angenommen", "\u2705")
                + _greeting("Hallo {{name}},",
                            "vielen Dank f\u00fcr Ihre Anfrage zu <strong style='color:#FF6B00'>{{service}}</strong>! "
                            "Einer unserer Experten meldet sich innerhalb der n\u00e4chsten <strong>24 Stunden</strong> bei Ihnen, um Ihre Anforderungen im Detail zu besprechen.")
                + _box(
                    "<div style='font-size:12px;color:#999;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:12px;font-weight:600'>Ihre Daten</div>"
                    "<table role='presentation' width='100%' cellpadding='0' cellspacing='0' style='font-size:14px;color:#333'>"
                    "<tr><td style='padding:4px 0;width:35%;color:#666'>Service:</td><td style='padding:4px 0;font-weight:600'>{{service}}</td></tr>"
                    "<tr><td style='padding:4px 0;color:#666'>E-Mail:</td><td style='padding:4px 0;font-weight:600'>{{email}}</td></tr>"
                    "<tr><td style='padding:4px 0;color:#666'>Firma:</td><td style='padding:4px 0;font-weight:600'>{{company}}</td></tr>"
                    "<tr><td style='padding:4px 0;color:#666' colspan='2'>{{budget_line}}</td></tr>"
                    "</table>",
                    border_color="#3B82F6", bg="#F0F7FF"
                )
                + _badges([("\U0001F3C6", "Top-Qualit\u00e4t"), ("\u23F1\ufe0f", "Antwort in 24h"), ("\U0001F91D", "Unverbindlich")])
                + _para("Bei dringenden Fragen erreichen Sie uns jederzeit direkt:")
                + _cta("\u2709 Direkt kontaktieren", "mailto:admin@zebick.com")
                + _para("<strong style='color:#333'>Herzliche Gr\u00fc\u00dfe</strong><br>Ihr Zebick-Team")
                + _footer_html()
            ),
            "body_text": "Hallo {{name}},\n\nvielen Dank f\u00fcr Ihre Anfrage zu {{service}}!\n\nEiner unserer Experten meldet sich innerhalb der n\u00e4chsten 24 Stunden bei Ihnen.\n\nIhre Daten:\nService: {{service}}\nE-Mail: {{email}}\nFirma: {{company}}\n{{budget_line}}\n\nBei dringenden Fragen: admin@zebick.com\n\nHerzliche Gr\u00fc\u00dfe\nIhr Zebick-Team",
            "available_vars": ["name", "email", "service", "company", "budget_line", "year"],
        },
        {
            "key": "security_alert",
            "name": "Sicherheitshinweis (Konto-Änderung)",
            "description": "Wird an einen Admin-Account gesendet, wenn das Passwort oder die E-Mail-Adresse geändert wurde — damit eine unbemerkte Änderung auffällt.",
            "trigger": "POST /api/admin/change-password, POST /api/admin/change-email",
            "enabled": True,
            "subject": "⚠️ Sicherheitshinweis: {{action}} für Ihr Zebick-Konto",
            "body_html": _wrap(
                _header_html("Konto-Änderung erkannt", "\U0001F512")
                + _greeting("Hallo,",
                            "soeben wurde folgende Änderung an Ihrem Admin-Konto vorgenommen: <strong style='color:#FF6B00'>{{action}}</strong>.")
                + _box(
                    "<table role='presentation' width='100%' cellpadding='0' cellspacing='0' style='font-size:14px;color:#333'>"
                    "<tr><td style='padding:4px 0;width:35%;color:#666'>Konto:</td><td style='padding:4px 0;font-weight:600'>{{email}}</td></tr>"
                    "<tr><td style='padding:4px 0;color:#666'>Zeitpunkt:</td><td style='padding:4px 0;font-weight:600'>{{timestamp}}</td></tr>"
                    "<tr><td style='padding:4px 0;color:#666'>IP-Adresse:</td><td style='padding:4px 0;font-weight:600'>{{ip}}</td></tr>"
                    "</table>",
                    border_color="#EF4444", bg="#FFF5F5"
                )
                + _para("Waren Sie das nicht, kontaktieren Sie uns bitte umgehend — Ihr Konto ist möglicherweise kompromittiert.")
                + _cta("✉ Sicherheitsteam kontaktieren", "mailto:kontakt@zebick.com")
                + _footer_html()
            ),
            "body_text": "Konto-Änderung erkannt\n\nSoeben wurde folgende Änderung an Ihrem Admin-Konto vorgenommen: {{action}}.\n\nKonto: {{email}}\nZeitpunkt: {{timestamp}}\nIP-Adresse: {{ip}}\n\nWaren Sie das nicht, kontaktieren Sie uns bitte umgehend: kontakt@zebick.com",
            "available_vars": ["action", "email", "timestamp", "ip", "year"],
        },
    ]
