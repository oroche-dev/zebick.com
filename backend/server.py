"""Zebick FastAPI application — entrypoint.

Modules:
  config.py            env + constants (fail-fast)
  security.py          JWT / bcrypt / bleach / audit / brute-force / DB
  services.py          email + LLM chatbot
  models.py            pydantic models
  routes/public.py     public endpoints (contact, newsletter, game, chat, ...)
  routes/admin.py      admin endpoints (auth, users, content, security, backup)
"""

import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

import config
from security import client, db, ensure_default_admin
from scheduler import start_scheduler, stop_scheduler
from email_templates import seed_default_templates
from routes.public import router as public_router
from routes.admin import router as admin_router
from routes.tracking import router as tracking_router
from routes.portfolio import router as portfolio_router
from routes.content import router as content_router
from routes.crm import router as crm_router
from routes.catalog import router as catalog_router
from routes.projects_mgmt import router as projects_mgmt_router
from routes.uploads import router as uploads_router
from routes.leads import router as leads_router
from routes.games import router as games_router, seed_default_achievements_if_empty
from routes.service_pages import router as service_pages_router, seed_service_pages_if_empty
from routes.tools import router as tools_router, seed_tools_if_empty
from routes.backups import router as backups_router

logger = logging.getLogger("zebick")


# ================= LIFESPAN =================

@asynccontextmanager
async def lifespan(_app: FastAPI):
    await ensure_default_admin()
    try:
        await db.login_attempts.create_index("timestamp")
        await db.login_attempts.create_index("email")
        await db.login_attempts.create_index("ip")
        await db.audit_log.create_index("timestamp")
        await db.admin_users.create_index("email", unique=True)
        await db.newsletter_subscribers.create_index("email", unique=True)
        await db.newsletter_subscribers.create_index("confirm_token_hash", unique=True, sparse=True)
        await db.inbox_emails.create_index([("mailbox", 1), ("uid", 1)], unique=True)
        await db.inbox_emails.create_index("date")
        await db.email_templates.create_index("key", unique=True)
        await db.projects.create_index("slug", unique=True)
        await db.projects.create_index([("order", 1)])
        await db.blog_posts.create_index("slug", unique=True)
        await db.blog_posts.create_index("published_at")
        await db.team_members.create_index([("order", 1)])
        await db.faqs.create_index([("order", 1)])
        await db.custom_services.create_index([("order", 1)])
        # CRM
        await db.customers.create_index("email", unique=True)
        await db.customers.create_index("created_at")
        await db.activities.create_index("timestamp")
        await db.contact_forms.create_index("status")
        await db.contact_forms.create_index("customer_id")
        await db.contact_forms.create_index("submitted_at")
        await db.categories.create_index("slug", unique=True)
        await db.categories.create_index("order")
        await db.services_catalog.create_index("category_id")
        await db.services_catalog.create_index("order")
        await db.projects_mgmt.create_index("created_at")
        await db.offers.create_index("number", unique=True)
        await db.offers.create_index("created_at")
        await db.chatbot_qa.create_index("order")
        await db.chatbot_leads.create_index("created_at")
        await db.leads.create_index("status")
        await db.leads.create_index("source")
        await db.leads.create_index("email")
        await db.leads.create_index("created_at")
        # Cross-Game Achievements
        await db.players.create_index("email", unique=True)
        await db.players.create_index("created_at")
        await db.game_events.create_index([("player_id", 1), ("played_at", -1)])
        await db.game_events.create_index([("guest_id", 1), ("played_at", -1)])
        await db.game_events.create_index("game_id")
        await db.player_achievements.create_index([("player_id", 1), ("achievement_key", 1)])
        await db.player_achievements.create_index([("guest_id", 1), ("achievement_key", 1)])
        await db.achievements_catalog.create_index("key", unique=True)
        await db.reward_codes.create_index("code", unique=True)
        await db.reward_codes.create_index([("player_id", 1), ("claimed", 1)])
    except Exception as e:  # noqa: BLE001
        logger.error(f"Index creation issue: {e}")
    await seed_default_templates(force=os.environ.get("RESEED_EMAIL_TEMPLATES", "false").lower() == "true")
    # Seed portfolio projects if empty OR if only legacy demos exist
    try:
        from routes.portfolio import _unique_slug
        from portfolio_seed_data import PORTFOLIO_SEED
        # Detect legacy seed (4 projects with the original titles) and replace it
        legacy_titles = {"FinTech Dashboard", "E-Commerce Platform", "Healthcare App", "Security Audit — Großbank"}
        existing_titles = set()
        async for d in db.projects.find({}, {"title": 1}):
            existing_titles.add(d.get("title"))
        is_legacy_only = existing_titles and existing_titles.issubset(legacy_titles)
        is_empty = await db.projects.count_documents({}) == 0
        if is_empty or is_legacy_only:
            if is_legacy_only:
                await db.projects.delete_many({"title": {"$in": list(legacy_titles)}})
                logger.info("Removed legacy demo portfolio projects")
            from datetime import datetime as _dt, timezone as _tz
            import uuid as _uuid
            now = _dt.now(_tz.utc)
            for s in PORTFOLIO_SEED:
                slug = await _unique_slug(s["title"])
                doc = {
                    "id": str(_uuid.uuid4()),
                    **s,
                    "slug": slug,
                    "published": True,
                    "created_at": now,
                    "updated_at": now,
                }
                doc.setdefault("gallery", [])
                doc.setdefault("metrics", [])
                doc.setdefault("tags", [])
                doc.setdefault("tech_stack", [])
                doc.setdefault("tech_stack_detailed", [])
                doc.setdefault("process_steps", [])
                await db.projects.insert_one(doc)
            logger.info(f"Seeded {len(PORTFOLIO_SEED)} portfolio projects")
    except Exception as e:  # noqa: BLE001
        logger.error(f"Portfolio seed issue: {e}")

    # Seed blog posts, team, FAQ if empty
    try:
        from routes.content import _unique_slug as _unique_slug_content
        from datetime import datetime as _dt, timezone as _tz
        import uuid as _uuid
        now = _dt.now(_tz.utc)

        # Blog seed
        if await db.blog_posts.count_documents({}) == 0:
            blog_seed = [
                {
                    "title": "Die Top 10 Cyber Security Trends 2026",
                    "excerpt": "Erfahren Sie, welche Sicherheitsbedrohungen und -lösungen das Jahr 2026 prägen werden. Von KI-gestützten Angriffen bis hin zu Zero-Trust-Architekturen.",
                    "content": "## Einleitung\n\nDas Jahr 2026 bringt neue Herausforderungen für Unternehmen. **KI-gestützte Angriffe** nehmen rapide zu, gleichzeitig entstehen fortschrittliche Verteidigungsmechanismen.\n\n## Die wichtigsten Trends\n\n### 1. Zero-Trust wird Standard\n\nNiemand wird mehr blind vertraut — jede Anfrage wird verifiziert. Das bedeutet:\n\n- Kontinuierliche Authentifizierung\n- Segmentierte Netzwerke\n- Least-Privilege-Zugriffe\n\n### 2. KI gegen KI\n\nAngreifer nutzen Machine Learning, um Schwachstellen schneller zu finden. Verteidiger setzen ebenfalls auf KI, um Anomalien in Echtzeit zu erkennen.\n\n### 3. Quantum-Resistant Kryptografie\n\nMit dem Näherrücken praktischer Quantencomputer werden Post-Quantum-Algorithmen (PQC) zur Pflicht. NIST hat bereits erste Standards veröffentlicht.\n\n## Fazit\n\nCyber Security 2026 ist vielschichtiger denn je. Wer nicht investiert, bleibt zurück.",
                    "author": "Jan Becker",
                    "category": "Cyber Security",
                    "tags": ["Security", "Trends", "KI"],
                    "cover_image": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1400&q=80",
                    "read_time": "8 min",
                    "featured": True,
                },
                {
                    "title": "React 19: Was ist neu und warum es wichtig ist",
                    "excerpt": "Die neueste Version von React bringt revolutionäre Änderungen. Wir zeigen Ihnen die wichtigsten Features und wie Sie davon profitieren.",
                    "content": "## Die Revolution geht weiter\n\nReact 19 bringt **Server Components** auf das nächste Level. Hier die Highlights:\n\n## Actions\n\nMit der neuen `useActionState` Hook werden Formulare deutlich einfacher:\n\n- Automatisches Pending-State-Handling\n- Eingebaute Error-Boundaries\n- Progressive Enhancement out-of-the-box\n\n## Document Metadata\n\n`<title>`, `<meta>` und `<link>` können jetzt **überall** im Baum verwendet werden — React kümmert sich automatisch um den `<head>`.\n\n## Warum es wichtig ist\n\n1. Weniger Boilerplate\n2. Bessere Performance\n3. SEO-freundlicher von Haus aus\n\nUpgraden lohnt sich.",
                    "author": "Lisa Schmidt",
                    "category": "Development",
                    "tags": ["React", "Frontend", "JavaScript"],
                    "cover_image": "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1400&q=80",
                    "read_time": "6 min",
                    "featured": True,
                },
                {
                    "title": "DSGVO 2026: Neue Anforderungen für Websites",
                    "excerpt": "Die Datenschutz-Grundverordnung wurde aktualisiert. Erfahren Sie, welche neuen Pflichten auf Website-Betreiber zukommen.",
                    "content": "## Was ändert sich?\n\nDie DSGVO-Novelle 2026 betrifft **alle** Website-Betreiber in der EU — und in der DACH-Region darüber hinaus.\n\n## Die 5 wichtigsten Änderungen\n\n1. **Cookie-Consent 2.0** — Granularere Zustimmungen sind Pflicht\n2. **Dark-Pattern-Verbot** — Kein Verstecken von Opt-Out mehr\n3. **KI-Transparenz** — Automatisierte Entscheidungen müssen offengelegt werden\n4. **Datenschutzfolgenabschätzung** — Pflicht bei mehr Prozessen\n5. **Strengere Bußgelder** — Bis 6% vom Jahresumsatz\n\n## Was Sie jetzt tun müssen\n\n- Cookie-Banner überprüfen\n- Privacy Policy aktualisieren\n- Mitarbeiter schulen\n- Datenflussdiagramme pflegen",
                    "author": "Max Mustermann",
                    "category": "Datenschutz",
                    "tags": ["DSGVO", "Datenschutz", "Recht"],
                    "cover_image": "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1400&q=80",
                    "read_time": "10 min",
                    "featured": False,
                },
                {
                    "title": "Mobile App Entwicklung: Native vs. Cross-Platform",
                    "excerpt": "Welcher Ansatz ist der richtige für Ihr Projekt? Ein detaillierter Vergleich von Flutter, React Native und nativer Entwicklung.",
                    "content": "## Die Qual der Wahl\n\nNative, Flutter oder React Native? Die Entscheidung prägt Ihr Projekt langfristig.\n\n## Native (Swift / Kotlin)\n\n**Vorteile:**\n- Maximale Performance\n- Volle API-Kontrolle\n- Beste UX\n\n**Nachteile:**\n- Doppelte Entwicklungskosten\n- 2 Codebasen pflegen\n\n## React Native\n\n**Vorteile:**\n- Shared Code mit Web\n- Große Community\n- Gute Performance\n\n## Flutter\n\n**Vorteile:**\n- Konsistente UI auf allen Plattformen\n- Exzellente DX\n- Schnelle Entwicklung\n\n## Unser Rat\n\nFür MVP-Apps: Flutter oder React Native. Für High-End-Apps mit Hardware-Zugriff: Nativ.",
                    "author": "Lisa Schmidt",
                    "category": "Development",
                    "tags": ["Mobile", "Apps", "Flutter"],
                    "cover_image": "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1400&q=80",
                    "read_time": "12 min",
                    "featured": False,
                },
                {
                    "title": "Penetrationstests: Ein Leitfaden für Unternehmen",
                    "excerpt": "Warum regelmäßige Sicherheitstests wichtig sind und wie Sie den richtigen Anbieter auswählen.",
                    "content": "## Warum Pentests?\n\nEin **Penetrationstest** simuliert echte Angriffe, um Schwachstellen zu finden, bevor Kriminelle es tun.\n\n## Arten von Pentests\n\n- **Black Box** — Tester kennt nichts\n- **White Box** — Tester kennt alles\n- **Gray Box** — Teilwissen\n\n## Ablauf\n\n1. Scoping & Ziele definieren\n2. Reconnaissance\n3. Vulnerability Assessment\n4. Exploitation\n5. Reporting & Fix-Empfehlungen\n\n## Frequenz\n\nMindestens **jährlich** — bei kritischen Systemen alle 6 Monate. Nach jeder größeren Änderung.",
                    "author": "Jan Becker",
                    "category": "Cyber Security",
                    "tags": ["Pentest", "Security", "Audit"],
                    "cover_image": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1400&q=80",
                    "read_time": "9 min",
                    "featured": False,
                },
                {
                    "title": "UI/UX Design Trends die 2026 dominieren werden",
                    "excerpt": "Von Glassmorphism bis Micro-Interactions: Die Design-Trends, die Sie kennen sollten.",
                    "content": "## Design im Wandel\n\n2026 verschmelzen Funktion und Emotion stärker denn je. Die wichtigsten Trends:\n\n## 1. Glassmorphism 2.0\n\nTransparente Layer mit subtilen Blur-Effekten schaffen Tiefe ohne Überladung.\n\n## 2. Bento Grid Layouts\n\nInspiriert von japanischen Bento-Boxen — modulare, asymmetrische Grids, die sich an jedes Gerät anpassen.\n\n## 3. Dynamic Micro-Interactions\n\nJede Aktion hat ein **durchdachtes Feedback**. Hover-Effekte, Scroll-Triggered-Animations, State-Transitions.\n\n## 4. Bold Typography\n\nGroße, charaktervolle Schriften als Hero-Element. Typografie wird zum Design-System-Anker.\n\n## 5. AI-Personalized UI\n\nInterfaces passen sich in Echtzeit an den Nutzer an.",
                    "author": "Anna König",
                    "category": "Design",
                    "tags": ["Design", "UI/UX", "Trends"],
                    "cover_image": "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1400&q=80",
                    "read_time": "7 min",
                    "featured": True,
                },
            ]
            for s in blog_seed:
                slug = await _unique_slug_content(db.blog_posts, s["title"])
                doc = {
                    "id": str(_uuid.uuid4()),
                    **s,
                    "slug": slug,
                    "published": True,
                    "published_at": now,
                    "updated_at": now,
                }
                await db.blog_posts.insert_one(doc)
            logger.info(f"Seeded {len(blog_seed)} blog posts")

        # Team seed
        if await db.team_members.count_documents({}) == 0:
            team_seed = [
                {"name": "Max Mustermann", "role": "Gründer & CEO", "bio": "15 Jahre Erfahrung in der IT-Branche, ehemalig bei SAP und Microsoft. Visionär mit Leidenschaft für Innovation.", "image": "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80", "order": 1},
                {"name": "Lisa Schmidt", "role": "Head of Development", "bio": "Full-Stack Expertin mit Fokus auf skalierbare Architekturen. Führt unser 20-köpfiges Entwicklerteam.", "image": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80", "order": 2},
                {"name": "Jan Becker", "role": "Lead Security Engineer", "bio": "Certified Ethical Hacker (CEH) mit über 500 durchgeführten Penetrationstests.", "image": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80", "order": 3},
                {"name": "Anna König", "role": "Creative Director", "bio": "Award-winning Designer mit Gespür für zeitlose Ästhetik. Gewinnerin des German Design Award 2024.", "image": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80", "order": 4},
            ]
            for s in team_seed:
                doc = {"id": str(_uuid.uuid4()), **s, "published": True, "created_at": now}
                await db.team_members.insert_one(doc)
            logger.info(f"Seeded {len(team_seed)} team members")

        # FAQ seed
        if await db.faqs.count_documents({}) == 0:
            faq_seed = [
                {"question": "Wie lange dauert ein typisches Projekt?", "answer": "Das hängt vom Umfang ab. Eine Landingpage ist in 2–3 Wochen umgesetzt, komplexere Plattformen benötigen 3–6 Monate. Wir starten immer mit einem kostenlosen Scoping-Gespräch.", "category": "Allgemein", "order": 1},
                {"question": "Arbeiten Sie mit festen Preisen oder Stundensätzen?", "answer": "Beides ist möglich. Für klar definierte Projekte bevorzugen wir Festpreise, für iterative Entwicklung oder laufende Betreuung ist ein Stundenmodell sinnvoller.", "category": "Pricing", "order": 2},
                {"question": "Ist DSGVO-Konformität im Preis inbegriffen?", "answer": "Ja, jedes Projekt wird von Grund auf DSGVO-konform konzipiert. Wir unterstützen bei Cookie-Banner, Impressum, Datenschutzerklärung und Auftragsverarbeitung.", "category": "Datenschutz", "order": 3},
                {"question": "Bieten Sie auch Wartung nach dem Launch?", "answer": "Absolut. Wir bieten flexible Wartungsverträge mit SLA für Uptime, Security-Updates, Bugfixes und laufende Weiterentwicklung.", "category": "Support", "order": 4},
                {"question": "Können Sie unsere bestehende Website übernehmen?", "answer": "Ja, wir übernehmen gerne bestehende Projekte. Der Prozess startet mit einem Code-Audit und einem Übergabe-Plan, damit nichts zwischen den Stühlen verschwindet.", "category": "Allgemein", "order": 5},
            ]
            for s in faq_seed:
                doc = {"id": str(_uuid.uuid4()), **s, "published": True, "created_at": now}
                await db.faqs.insert_one(doc)
            logger.info(f"Seeded {len(faq_seed)} FAQ items")
    except Exception as e:  # noqa: BLE001
        logger.error(f"Content seed issue: {e}")
    # Seed default service categories if empty
    try:
        from datetime import datetime as _dt, timezone as _tz
        import uuid as _uuid
        if await db.categories.count_documents({}) == 0:
            cats = [
                ("Webentwicklung", "Code", "#FF8C32", "Moderne, performante und SEO-optimierte Websites & Web-Apps."),
                ("App-Entwicklung", "Smartphone", "#FFA050", "Native und Cross-Platform Apps für iOS und Android."),
                ("Cyber Security", "Shield", "#FF6B00", "Penetration Tests, Security Audits und DSGVO-Compliance."),
                ("UI/UX Design", "Palette", "#FF781E", "Nutzerzentriertes Design mit Wow-Effekt."),
                ("Gaming-Entwicklung", "Gamepad2", "#F59E0B", "2D/3D Games & Spielmechaniken."),
                ("Chatbot-Entwicklung", "Bot", "#FB923C", "KI-gestützte Chatbots und Lead-Capture."),
                ("Server & Systeme", "Server", "#FFB464", "DevOps, Cloud Infrastructure & Wartung."),
                ("Digitales Marketing & SEO", "TrendingUp", "#F97316", "Sichtbarkeit & Conversion-Optimierung."),
                ("Grafikdesign", "PenTool", "#EAB308", "Logo, Branding, Print & digitale Assets."),
            ]
            for i, (name, icon, color, desc) in enumerate(cats):
                slug = name.lower().replace(" & ", "-").replace(" ", "-").replace("ä", "ae").replace("ö", "oe").replace("ü", "ue").replace("ß", "ss").replace("/", "-")
                await db.categories.insert_one({
                    "id": str(_uuid.uuid4()),
                    "name": name, "slug": slug, "description": desc,
                    "icon": icon, "color": color, "image": None,
                    "order": i, "is_active": True,
                    "created_at": _dt.now(_tz.utc).isoformat(),
                    "updated_at": _dt.now(_tz.utc).isoformat(),
                })
            logger.info(f"Seeded {len(cats)} default categories")
    except Exception as e:  # noqa: BLE001
        logger.error(f"Categories seed issue: {e}")
    # Seed default achievements
    try:
        n = await seed_default_achievements_if_empty()
        if n:
            logger.info(f"Seeded {n} default achievements")
    except Exception as e:  # noqa: BLE001
        logger.error(f"Achievements seed issue: {e}")
    # Seed service-page content (pricing, tools)
    try:
        n = await seed_service_pages_if_empty()
        if n:
            logger.info(f"Seeded {n} service pages")
    except Exception as e:  # noqa: BLE001
        logger.error(f"Service-pages seed issue: {e}")
    # Seed tools / advisor configs
    try:
        n = await seed_tools_if_empty()
        if n:
            logger.info(f"Seeded {n} tools/advisors")
        await db.tools_config.create_index("slug", unique=True)
        await db.tools_config.create_index("service_id")
    except Exception as e:  # noqa: BLE001
        logger.error(f"Tools seed issue: {e}")
    start_scheduler()
    logger.info("Zebick API ready (security hardened)")
    yield
    stop_scheduler()
    client.close()


# ================= SECURITY HEADERS =================

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = (
            "geolocation=(), microphone=(), camera=(), payment=(), usb=()"
        )
        response.headers["Cross-Origin-Opener-Policy"] = "same-origin"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "img-src 'self' data: https:; "
            "script-src 'self' 'unsafe-inline' https:; "
            "style-src 'self' 'unsafe-inline' https:; "
            "font-src 'self' data: https:; "
            "connect-src 'self' https: wss:; "
            "frame-ancestors 'none'; "
            "base-uri 'self';"
        )
        if "server" in response.headers:
            del response.headers["server"]
        return response


# ================= APP =================

limiter = Limiter(key_func=get_remote_address, default_limits=["200/minute"], enabled=config.RATE_LIMIT_ENABLED)
# Interactive API docs disclose the full endpoint/schema surface — keep them off
# when STRICT_SECURITY (production-like) is on; still available for local dev.
_docs_enabled = not config.STRICT_SECURITY
app = FastAPI(
    title="Zebick API",
    docs_url="/api/docs" if _docs_enabled else None,
    redoc_url="/api/redoc" if _docs_enabled else None,
    lifespan=lifespan,
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)
app.add_middleware(SecurityHeadersMiddleware)
# `Access-Control-Allow-Credentials: true` + wildcard origin is a spec-invalid,
# effectively-open CORS config (browsers using credentialed fetch could reflect
# any origin). Only allow credentials once real origins are configured.
_cors_wildcard = config.CORS_ORIGINS == ["*"]
if _cors_wildcard:
    logger.warning("CORS_ORIGINS not set — falling back to '*' with credentials disabled. "
                    "Set CORS_ORIGINS for production.")
app.add_middleware(
    CORSMiddleware,
    allow_credentials=not _cors_wildcard,
    allow_origins=config.CORS_ORIGINS,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    max_age=600,
)

app.include_router(public_router)
app.include_router(admin_router)
app.include_router(tracking_router)
app.include_router(portfolio_router)
app.include_router(content_router)
app.include_router(crm_router)
app.include_router(catalog_router)
app.include_router(projects_mgmt_router)
app.include_router(uploads_router)
app.include_router(leads_router)
app.include_router(games_router)
app.include_router(service_pages_router)
app.include_router(tools_router)
app.include_router(backups_router)


# ================= DYNAMIC SITEMAP =================
# Static pages here must stay in sync with the canonical `path` each page
# passes to <Seo> (frontend/src/components/common/Seo.jsx) — see App.js for
# the alias->canonical route mapping. Blog posts and portfolio projects are
# pulled live from Mongo so new content is indexable without a redeploy.
# Served at the site root (not under /api) — in production, the frontend's
# reverse proxy must route GET /sitemap.xml here (see frontend/nginx.conf).
_SITEMAP_STATIC = [
    ("/", "1.0"),
    ("/about", "0.6"),
    ("/services", "0.8"),
    ("/services/webentwicklung", "0.9"),
    ("/services/app-entwicklung", "0.9"),
    ("/services/cyber-security", "0.9"),
    ("/services/ui-ux-design", "0.9"),
    ("/services/gaming-entwicklung", "0.9"),
    ("/services/chatbot-entwicklung", "0.9"),
    ("/services/server-systeme", "0.9"),
    ("/services/digitales-marketing-seo", "0.9"),
    ("/services/grafikdesign", "0.9"),
    ("/services/automatisierung-ki", "0.9"),
    ("/portfolio", "0.7"),
    ("/blog", "0.6"),
    ("/tools", "0.7"),
    ("/contact", "0.7"),
    ("/impressum", "0.2"),
    ("/datenschutz", "0.2"),
    ("/agb", "0.2"),
    ("/cookie-richtlinie", "0.2"),
]


# api.zebick.com has no public content of its own (pure backend, everything
# lives under /api/...) — Search Console kept trying to crawl/index the bare
# domain root and reporting it as a 404. This tells crawlers hitting the API
# domain directly to stay away entirely; the real site's robots.txt (which
# allows crawling) lives separately at frontend/public/robots.txt.
@app.get("/robots.txt")
async def api_robots_txt():
    from fastapi import Response
    return Response(content="User-agent: *\nDisallow: /\n", media_type="text/plain")


@app.get("/sitemap.xml")
async def dynamic_sitemap():
    from fastapi import Response

    base = os.environ.get("PUBLIC_SITE_URL", "https://www.zebick.com").rstrip("/")
    urls = [f"<url><loc>{base}{path}</loc><priority>{prio}</priority></url>" for path, prio in _SITEMAP_STATIC]

    posts = await db.blog_posts.find({"published": True}, {"slug": 1, "updated_at": 1}).to_list(1000)
    for p in posts:
        lastmod = f"<lastmod>{str(p['updated_at'])[:10]}</lastmod>" if p.get("updated_at") else ""
        urls.append(f"<url><loc>{base}/blog/{p['slug']}</loc>{lastmod}<priority>0.5</priority></url>")

    projects = await db.projects.find({"published": True}, {"slug": 1}).to_list(1000)
    for proj in projects:
        urls.append(f"<url><loc>{base}/portfolio/{proj['slug']}</loc><priority>0.6</priority></url>")

    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  '
        + "\n  ".join(urls)
        + "\n</urlset>\n"
    )
    return Response(content=xml, media_type="application/xml")
