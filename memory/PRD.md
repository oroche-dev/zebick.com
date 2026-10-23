# Zebick — Projekt-PRD

## Ursprüngliche Aufgabe
Hochgeladene ZIP ("zebick12345678-main") entpacken, Projekttyp erkennen und als Live-Vorschau lauffähig machen. Anschließend gemeldete Bugs beheben.

## Architektur
- Frontend: React (CRA/craco), React Router, lucide-react, react-markdown
- Backend: FastAPI (Router: content, tools, portfolio, service_pages, games, admin, contact, newsletter, analytics, security, backups)
- DB: MongoDB (lokal via MONGO_URL). Auto-Seeding beim Start.
- Admin: versteckte URL `/zb-panel-8x2k/login`, JWT + bcrypt.

## Setup-Konfiguration (von uns ergänzt, da nicht in ZIP)
- backend/.env: JWT_SECRET, ADMIN_EMAIL=admin@zebick.com, ADMIN_PASSWORD_HASH (bcrypt), ENFORCE_STRICT_SECURITY=true, SMTP_MOCK=true
- react-markdown/remark-gfm auf v8/v3 gepinnt (CRA5-Kompatibilität)

## Umgesetzt (mit Daten)
- 2026-06: Projekt-Setup + Live-Vorschau lauffähig
- 2026-06: Fix ToolsPage "Tools verschwinden" (React StrictMode Double-Mount / abgebrochene XHR) — verifiziert (iteration_1)
- 2026-06: Umfassender Health-Check — Backend 29/29, Frontend Kernflüsse OK (iteration_2)
- 2026-06: Blog-Detailseite `/blog/:slug` (BlogPostPage.jsx) + Karten verlinken; ContactPage Inline-Validierung — verifiziert (iteration_3)

## Bewusst gemockt / offen
- E-Mail-Versand ist GEMOCKT (SMTP_MOCK=true) — echter Versand benötigt SMTP-Daten oder Resend/SendGrid API-Key vom Nutzer
- Chatbot inaktiv (kein LLM_API_KEY); Widget bewusst NICHT global eingebaut (Nutzerentscheidung)

## Backlog / Nächste mögliche Schritte
- P1: Echten E-Mail-Versand (Resend/SendGrid oder SMTP) aktivieren, sobald Zugangsdaten vorliegen
- P2: LLM-Chatbot aktivieren (Key erforderlich)
- P2: DSGVO-Consent-Checkbox im Kontaktformular

## Test-Credentials
Admin: admin@zebick.com, Passwort nur lokal in backend/.env (TEST_ADMIN_PASSWORD), nicht im Repo. Login: /zb-panel-8x2k/login
