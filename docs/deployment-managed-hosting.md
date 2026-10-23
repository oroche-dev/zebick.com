# Website online stellen — Vercel + Render + MongoDB Atlas (ohne eigenen Server)

Alternative zu `docs/deployment-vps-docker.md`: hier mietest du keinen
eigenen Server, sondern drei fertige Dienste, die sich jeweils um einen Teil
kümmern. Kein SSH, kein Docker-Compose-Debugging, aber laufende
Monatskosten statt eines einmalig eingerichteten Servers.

| | Frontend | Backend | Datenbank |
|---|---|---|---|
| Dienst | **Vercel** | **Render** | **MongoDB Atlas** |
| Macht | Baut & hostet die React-Seite | Führt FastAPI dauerhaft aus | Verwaltet MongoDB |
| Kosten | Kostenlos für dieses Projekt | ab ca. $7/Monat | kostenlos (M0) |

**Wann diese Variante statt dem VPS-Weg?** Wenn du keinen Server warten
willst (Updates, Sicherheit, Neustarts selbst im Blick behalten). Dafür
zahlst du laufend und hast weniger Kontrolle als bei einem eigenen VPS.

## 1. MongoDB Atlas einrichten

1. [cloud.mongodb.com](https://cloud.mongodb.com) registrieren.
2. Neuen Cluster erstellen → **M0 (Free)** reicht für den Start (512 MB).
3. **Database Access** → neuen Datenbank-Nutzer mit Passwort anlegen.
4. **Network Access** → `0.0.0.0/0` freigeben (Render hat keine feste IP,
   die man gezielt eintragen könnte).
5. **Connect → Drivers** → Connection-String kopieren, sieht so aus:
   `mongodb+srv://<user>:<passwort>@cluster0.xxxxx.mongodb.net/zebick`
   → das wird gleich dein `MONGO_URL`.

## 2. Backend auf Render deployen

1. [render.com](https://render.com) registrieren, GitHub-Repo verbinden
   (falls der Code dort liegt — sonst Render-eigenes Git-Remote nutzen).
2. **New → Web Service** → Repo auswählen.
3. **Root Directory**: `backend`
4. **Runtime**: Docker (nutzt automatisch `backend/Dockerfile`).
5. **Plan**: mindestens **Starter** (nicht Free) wählen — der Free-Plan
   schläft nach Inaktivität ein (lange Ladezeit beim ersten Aufruf) und hat
   keinen persistenten Speicher.
6. **Persistent Disk hinzufügen** (Settings → Disks): Mount Path
   `/app/uploads`, 1 GB reicht am Anfang. **Nicht überspringen** — ohne das
   verschwinden hochgeladene Portfolio-/Blog-Bilder bei jedem Deploy, weil
   `backend/routes/uploads.py` sie lokal unter `backend/uploads/` ablegt.
7. **Environment Variables** eintragen (alle Felder aus
   `backend/.env.example`, insbesondere):
   - `MONGO_URL` = der Atlas-Connection-String aus Schritt 1
   - `DB_NAME=zebick`
   - `JWT_SECRET` / `ADMIN_PASSWORD_HASH` — lokal generieren mit
     `cd backend && python -m scripts.gen_secrets`, Werte hier einfügen
   - `CORS_ORIGINS=https://zebick.com,https://www.zebick.com`
   - `PUBLIC_SITE_URL=https://www.zebick.com`
   - `PUBLIC_BACKEND_URL=https://api.zebick.com`
   - `SMTP_*` — die schon getesteten Werte übernehmen
   - `ADMIN_EMAIL`, `ADMIN_NOTIFICATION_EMAIL`
8. Falls Google-Analytics-Dashboard genutzt wird: `backend/ga_credentials.json`
   kann nicht als normale Env-Var rein — unter **Environment → Secret
   Files** hochladen (Pfad: `ga_credentials.json`).
9. Deploy abwarten, dann unter **Settings → Custom Domain** `api.zebick.com`
   eintragen — Render zeigt dir den nötigen DNS-Wert an.

## 3. Frontend auf Vercel deployen

1. [vercel.com](https://vercel.com) registrieren, GitHub-Repo verbinden.
2. **Root Directory**: `frontend` (`vercel.json` liegt dort bereits fertig,
   inkl. Security-Headers und einer Weiterleitung für `/sitemap.xml` an den
   Backend-Host).
3. **Environment Variables**: `REACT_APP_BACKEND_URL=https://api.zebick.com`
   (die Render-Domain aus Schritt 2.9).
4. Deploy.
5. **Settings → Domains** → `zebick.com` und `www.zebick.com` eintragen —
   Vercel zeigt dir die nötigen DNS-Werte an.

## 4. DNS bei SiteGround eintragen

Die genauen Werte (CNAME oder A-Record) zeigen dir Vercel und Render direkt
in ihrem Dashboard an, sobald du die Domain dort einträgst — im
DNS-Zone-Editor (Site Tools → Domain → DNS-Zone-Editor) entsprechend
eintragen:

- `zebick.com` + `www` → laut Vercel-Anzeige
- `api` → laut Render-Anzeige

DNS-Propagation kann einige Minuten bis Stunden dauern. HTTPS richten beide
Dienste automatisch ein, sobald die DNS-Einträge aktiv sind.

## 5. Testen

- `https://www.zebick.com` öffnen.
- `https://api.zebick.com/api/health` → sollte
  `{"status":"healthy","db":"connected"}` liefern.
- `https://www.zebick.com/sitemap.xml` → muss XML liefern (die
  `vercel.json`-Weiterleitung übernimmt das).
- Admin-Login unter `/zb-panel-8x2k/login`.
- Echte Newsletter-Anmeldung + Kontaktformular testen.
- Im Admin-Panel ein Bild hochladen, Render neu deployen lassen (z. B. durch
  eine leere Änderung), prüfen ob das Bild noch da ist — bestätigt, dass der
  persistente Disk aus Schritt 2.6 funktioniert.

## 6. Danach

- **Backups**: `backend/scripts/backup.py` läuft weiterhin automatisch im
  Backend-Prozess und schreibt auf den persistenten Disk. Zusätzlich bietet
  Atlas M0 eingeschränkte eigene Backups (volle Continuous Backups erst ab
  einem bezahlten Cluster) — für mehr Sicherheit die `R2_*`-Variablen für
  eine Offsite-Kopie bei Cloudflare R2 setzen.
- **Google Search Console**: Sitemap jetzt einreichen, siehe
  `docs/google-search-console-setup.md`.
- **Updates ausrollen**: einfach auf den verbundenen Git-Branch pushen —
  Render und Vercel deployen automatisch neu.

## Vergleich zum VPS-Weg

| | VPS + Docker | Vercel + Render + Atlas |
|---|---|---|
| Laufende Kosten | 1 Server, oft günstiger auf Dauer | 3 Rechnungen, Render allein meist teurer als ein kleiner VPS |
| Wartung | Du aktualisierst/überwachst den Server selbst | Dienste kümmern sich darum |
| Einrichtung | Mehr Schritte, aber alles an einem Ort | Mehr Konten/Dashboards, aber jeder Schritt geführt |
| Uploads | Funktionieren automatisch (Volume im `docker-compose.yml`) | Brauchen explizit einen bezahlten Persistent Disk |
| Auto-Deploy bei Git-Push | Nicht eingerichtet (manuell `git pull` + neu starten) | Eingebaut bei beiden Diensten |
