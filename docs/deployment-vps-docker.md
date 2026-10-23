# Website online stellen — VPS mit Docker

Vercel allein reicht nicht: Vercel ist nur für statische Frontends gemacht,
dein Backend (FastAPI + MongoDB) läuft da nicht sinnvoll. Diese Anleitung
nutzt stattdessen den Weg, der im Projekt schon fertig vorbereitet ist: alles
(MongoDB + Backend + Frontend) auf einem einzigen Server, über
`docker-compose.yml` im Projekt-Root.

**Voraussetzung:** Ein echter Server mit Root-/SSH-Zugriff, auf dem du Docker
installieren kannst. Reines SiteGround-Shared-Hosting reicht dafür **nicht**
— nur SiteGround Cloud (oder ein beliebiger anderer VPS-Anbieter) hat den
nötigen Zugriff. Die Domain selbst kann trotzdem bei SiteGround bleiben, nur
die DNS-Einträge zeigen am Ende auf den neuen Server.

## 1. Server mieten

- Empfehlung für den Einstieg: Hetzner Cloud oder DigitalOcean, kleinste
  Stufe (ca. 2 GB RAM) reicht am Anfang.
- Betriebssystem: Ubuntu 22.04 oder 24.04 LTS.
- Nach dem Erstellen: öffentliche IP-Adresse notieren.

## 2. Server vorbereiten

```bash
ssh root@<server-ip>

# Docker + Compose installieren
curl -fsSL https://get.docker.com | sh

# Firewall: nur SSH, HTTP, HTTPS erlauben
ufw allow 22
ufw allow 80
ufw allow 443
ufw enable
```

## 3. Code auf den Server bringen

```bash
git clone <dein-repo-url> /opt/zebick
cd /opt/zebick
```

(Falls der Code nicht in einem Git-Repo liegt: Projektordner z. B. per
`scp -r` auf den Server kopieren.)

## 4. `backend/.env` mit echten Werten füllen

```bash
cp backend/.env.example backend/.env
```

Die wichtigsten Felder (siehe Kommentare in der Datei für alle):

- **JWT_SECRET / ADMIN_PASSWORD_HASH** — generieren mit:
  ```bash
  cd backend && python -m scripts.gen_secrets
  ```
  Ausgabe in `backend/.env` eintragen (den Hash in einfache Anführungszeichen
  setzen, er enthält `$`-Zeichen).
- **CORS_ORIGINS** `=https://zebick.com,https://www.zebick.com`
- **PUBLIC_SITE_URL** `=https://www.zebick.com`
- **PUBLIC_BACKEND_URL** `=https://api.zebick.com`
- **SMTP_\*** — exakt die Werte übernehmen, die lokal schon funktionieren
  (`smtp.gmail.com`, `kontakt@zebick.com`, …) — bereits getestet und
  funktionstüchtig.
- **ADMIN_EMAIL**, **ADMIN_NOTIFICATION_EMAIL** — eure echten Adressen.
- `MONGO_URL` NICHT verändern — `docker-compose.yml` überschreibt das
  automatisch auf den internen Mongo-Container.

## 5. Backend-URL fürs Frontend setzen

CRA backt `REACT_APP_BACKEND_URL` beim Bauen fest ein — das muss schon beim
`docker compose build` stimmen. Im Projekt-Root eine `.env`-Datei anlegen
(liest `docker compose` automatisch für `${...}`-Platzhalter):

```bash
echo "REACT_APP_BACKEND_URL=https://api.zebick.com" > .env
```

## 6. Starten

```bash
docker compose up -d --build
docker compose ps            # alle 3 Services sollten "running" sein
docker compose logs -f backend   # auf Startfehler prüfen, dann Ctrl+C
```

## 7. DNS bei SiteGround einrichten

Im DNS-Zone-Editor (Site Tools → Domain → DNS-Zone-Editor) drei A-Records auf
die Server-IP:

| Typ | Name | Wert |
|---|---|---|
| A | `@` (zebick.com) | Server-IP |
| A | `www` | Server-IP |
| A | `api` | Server-IP |

DNS-Propagation kann einige Minuten bis Stunden dauern.

## 8. HTTPS / Reverse Proxy (Caddy)

`docker-compose.yml` macht bewusst **kein** TLS — das kommt separat davor.
Caddy ist hier die einfachste Wahl (holt Let's-Encrypt-Zertifikate
automatisch, keine manuelle Zertifikatspflege):

```bash
apt install -y caddy
```

`/etc/caddy/Caddyfile`:

```
zebick.com, www.zebick.com {
    reverse_proxy localhost:3001
}

api.zebick.com {
    reverse_proxy localhost:8001
}
```

```bash
systemctl reload caddy
```

Caddy stellt automatisch auf HTTPS um, sobald die DNS-Einträge aus Schritt 7
aktiv sind.

## 9. Testen

- `https://www.zebick.com` öffnen — Seite sollte laden.
- `https://api.zebick.com/api/health` — sollte
  `{"status":"healthy","db":"connected"}` liefern.
- `https://www.zebick.com/sitemap.xml` — muss echtes XML liefern, nicht die
  React-Seite. Das übernimmt `frontend/nginx.conf` automatisch (leitet
  `/sitemap.xml` intern an den Backend-Container weiter) — kein zusätzlicher
  Schritt nötig, solange über diesen Docker-Weg deployt wird.
- Admin-Login unter `/zb-panel-8x2k/login` testen.
- Eine echte Newsletter-Anmeldung durchklicken und prüfen, ob die
  Bestätigungsmail ankommt (manche Hoster blockieren ausgehendes SMTP auf
  Port 587/465 — falls die Mail ausbleibt, beim Server-Anbieter nachfragen).
- Kontaktformular testen.

## 10. Danach

- **Backups** laufen automatisch im Backend-Prozess (täglich/wöchentlich,
  siehe `backend/scripts/backup.py`) — keine zusätzliche Einrichtung nötig.
  Optional: `R2_*`-Variablen in `.env` setzen für eine Offsite-Kopie bei
  Cloudflare R2.
- **Google Search Console**: Sitemap jetzt einreichen, siehe
  `docs/google-search-console-setup.md` — die Seite ist jetzt live erreichbar.
- **Updates ausrollen**: auf dem Server `git pull && docker compose up -d
  --build`.

## Hinweis zu Vercel

Falls du Vercel für das Frontend trotzdem nutzen möchtest (z. B. wegen
automatischer Preview-Deploys): `frontend/vercel.json` ist dafür
vorkonfiguriert. Das Backend muss dann trotzdem separat gehostet werden
(z. B. per obigen Schritten auf einem VPS, nur ohne den `frontend`-Service
aus `docker-compose.yml`), und `REACT_APP_BACKEND_URL` bei Vercel als
Umgebungsvariable auf dessen Adresse zeigen. Zusätzlich müsste die
`/sitemap.xml`-Weiterleitung manuell in `vercel.json` ergänzt werden (als
`rewrites`-Eintrag auf die Backend-URL) — sonst liefert Vercel dort die
React-Seite statt XML.
