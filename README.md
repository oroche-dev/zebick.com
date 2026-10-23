# Zebick — Agentur-Website

React-Frontend (CRA + CRACO) und FastAPI-Backend mit MongoDB. Alles läuft ohne externe Plattform:
Hosting, Datenbank, E-Mail und Domain gehören dir.

| Teil | Technik | Ordner |
|---|---|---|
| Frontend | React 19, React Router 7, Tailwind/shadcn | `frontend/` |
| Backend | FastAPI, Motor (MongoDB), JWT, APScheduler | `backend/` |
| Datenbank | MongoDB 6/7 | extern (z. B. MongoDB Atlas) oder lokal |
| Admin-Panel | versteckte URL `/zb-panel-8x2k/login` | `frontend/src/pages/admin/` |

## Lokal starten

Voraussetzungen: Python 3.11+, Node 18+, Yarn, eine laufende MongoDB.

```bash
# Backend
cd backend
python -m venv venv
venv\Scripts\activate            # Linux/macOS: source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env             # Werte eintragen, siehe unten
python -m scripts.gen_secrets    # erzeugt JWT_SECRET und ADMIN_PASSWORD_HASH
uvicorn server:app --port 8001

# Frontend (zweites Terminal)
cd frontend
cp .env.example .env             # REACT_APP_BACKEND_URL=http://localhost:8001
yarn install
yarn start
```

Beim ersten Start mit leerer Datenbank wird der Superadmin aus `ADMIN_EMAIL` und `ADMIN_PASSWORD_HASH`
angelegt. Danach gilt die Datenbank, nicht mehr die `.env`.

## Konfiguration

Alle Variablen mit Erklärung stehen in [backend/.env.example](backend/.env.example) und
[frontend/.env.example](frontend/.env.example). Wichtig:

- `JWT_SECRET`, `ADMIN_PASSWORD_HASH` — Pflicht in Produktion (`ENFORCE_STRICT_SECURITY=true`).
- `CORS_ORIGINS` — deine Frontend-Domains, komma-getrennt.
- `MONGO_URL`, `DB_NAME` — deine Datenbank.
- `SMTP_*`, `IMAP_*` — E-Mail-Versand und Posteingang (optional, `SMTP_MOCK=true` für lokal).
- `LLM_API_KEY` — OpenAI-Key für den Chatbot (optional, ohne Key gibt es eine feste Antwort).
- `R2_*` — Cloudflare R2 für Offsite-Backups (optional).

Echte `.env`-Dateien niemals committen. `.gitignore` schließt sie aus, nur `.env.example` ist erlaubt.

## Tests

```bash
cd backend
# Backend läuft auf http://localhost:8001, TEST_ADMIN_EMAIL / TEST_ADMIN_PASSWORD stehen in backend/.env
pytest
pytest tests/test_no_emergent_deps.py -n 0   # Wächter: keine Emergent-Reste im Projekt
```

## Backups

- Täglich 03:00 UTC ein JSON-Snapshot nach `backend/backups/` (Pfad änderbar mit `BACKUP_DIR`),
  sonntags zusätzlich per E-Mail. Passwort-Hashes und 2FA-Secrets sind **nicht** enthalten.
- Manuell: `python -m scripts.backup` oder im Admin-Panel (Superadmin).
- Ein vollständiges Abbild inklusive Admin-Konten bekommst du nur mit `mongodump`, siehe
  [docs/MIGRATION.md](docs/MIGRATION.md).
- Hochgeladene Dateien liegen in `backend/uploads/`. Auf Hosts mit flüchtigem Dateisystem
  (Container, Vercel Functions) brauchst du ein persistentes Volume oder einen Objektspeicher.

## Deployment

- **Frontend:** statischer Build (`yarn build` → `frontend/build/`). `frontend/vercel.json` ist für Vercel
  vorbereitet, jeder statische Host mit SPA-Fallback auf `index.html` funktioniert.
  `REACT_APP_BACKEND_URL` muss beim Build gesetzt sein.
- **Backend:** ein Python-Prozess (`uvicorn server:app`), der dauerhaft läuft, weil der Scheduler
  (Backups, IMAP-Abruf alle 5 Minuten) im selben Prozess sitzt. Nur mit `ENFORCE_STRICT_SECURITY=true` betreiben.
- **Domain:** `https://www.zebick.com` (Canonical, Sitemap und Open-Graph-Tags sind darauf eingestellt).

Der Umzug von einer bestehenden Umgebung, inklusive Secret-Rotation, steht in
[docs/MIGRATION.md](docs/MIGRATION.md).
