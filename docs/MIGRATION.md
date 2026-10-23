# Umzug in die eigene Infrastruktur

Der Code ist frei von Emergent-Abhängigkeiten (Wächter: `backend/tests/test_no_emergent_deps.py`).
Was jetzt noch fehlt, kann nur mit Zugang zu deinem laufenden System erledigt werden.
Reihenfolge einhalten: erst Daten sichern, dann Secrets rotieren, dann umschalten.

## 1. Produktionsdaten sichern (bevor du irgendetwas abschaltest)

Der tägliche JSON-Snapshot enthält bewusst keine Passwort-Hashes und keine 2FA-Secrets und ist
deshalb kein vollständiges Abbild. Für den Umzug nimmst du `mongodump`:

```bash
mongodump --uri "<MONGO_URL der bisherigen Umgebung>" --db <DB_NAME> --out dump/
mongorestore --uri "<MONGO_URL deiner neuen Datenbank>" --nsInclude "<DB_NAME>.*" dump/
```

Zusätzlich kopieren:

- `backend/uploads/` — hochgeladene Dateien (in der Datenbank stehen nur die Metadaten).
- `backend/backups/` — vorhandene Snapshots, falls du sie behalten willst.

Prüfen, ob dir die Zugangsdaten zur bisherigen Datenbank überhaupt vorliegen. Wenn die Datenbank bei der
alten Plattform liegt und du nur dort Zugriff bekommst, jetzt exportieren.

## 2. Secrets rotieren

Behandle alles als bekannt, was jemals in `.env`, in Testdateien, in `memory/PRD.md`, in den
`test_reports/` oder in einem Chat stand.

| Was | Wo neu erzeugen |
|---|---|
| `JWT_SECRET` + Admin-Passwort | `python -m scripts.gen_secrets`, dann in die Host-Umgebung eintragen. Alle Sessions werden damit ungültig. |
| Admin-Passwort in der Datenbank | Im Admin-Panel ändern. `ADMIN_PASSWORD_HASH` wirkt nur beim allerersten Start mit leerer Datenbank. |
| `SMTP_PASSWORD`, `IMAP_PASSWORD` | Beim Mail-Anbieter (SiteGround) neues Passwort setzen. |
| `LLM_API_KEY` | Bei OpenAI alten Key widerrufen, neuen erzeugen. |
| `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` | In Cloudflare neuen API-Token erzeugen, alten löschen. |
| MongoDB-Passwort | Neuen Datenbank-Benutzer anlegen, in `MONGO_URL` eintragen, alten löschen. |

Die Werte gehören in die Umgebungsvariablen deines Hosts, nie in Git.

## 3. Admin-2FA neu einrichten

Ein früherer Stand des Projekts hat das 2FA-Einrichtungs-QR-Bild (`admin-2fa-qr.png`) öffentlich
ausgeliefert. Die Datei ist aus dem Projekt entfernt, das damalige Secret gilt aber als bekannt.
Im Admin-Panel 2FA deaktivieren und mit einem neuen Secret neu einrichten, dann das alte Konto in der
Authenticator-App löschen.

## 4. Hosting, Domain, DNS

- Backend auf einem Host betreiben, der einen dauerhaften Prozess erlaubt (Scheduler läuft im Prozess).
- `PUBLIC_SITE_URL=https://www.zebick.com`, `PUBLIC_BACKEND_URL=https://api.zebick.com` (oder deine API-Domain),
  `CORS_ORIGINS=https://zebick.com,https://www.zebick.com`.
- Frontend mit gesetztem `REACT_APP_BACKEND_URL` bauen und ausliefern.
- DNS erst umstellen, wenn das neue System mit den wiederhergestellten Daten geprüft ist.
- Nach dem Umschalten: `https://www.zebick.com/sitemap.xml` und `robots.txt` aufrufen, Sitemap in der
  Google Search Console neu einreichen (manuelle Prüfung erforderlich).

## 5. GitHub prüfen (nur im Browser möglich)

- Repository-Sichtbarkeit (privat oder öffentlich) und Collaborators.
- Settings → Integrations / GitHub Apps: Apps der alten Plattform entfernen.
- Settings → Webhooks, Deploy keys, Actions secrets: Einträge der alten Plattform löschen.
- Der Git-Verlauf kann alte Werte enthalten. Die Rotation aus Abschnitt 2 ist die Lösung, ein Umschreiben
  der Historie ist nicht nötig, wenn alles rotiert ist.

## 6. Abschlusskontrolle

- [ ] Login im Admin-Panel mit neuem Passwort und neuer 2FA
- [ ] Kontaktformular sendet eine E-Mail (`SMTP_MOCK=false`), Posteingang holt Mails ab
- [ ] `GET /api/health` liefert 200, Portfolio/Blog/Tools zeigen Daten
- [ ] Ein Bild aus `uploads/` wird angezeigt
- [ ] Backup läuft (`python -m scripts.backup`) und erscheint in `/admin/backup/list`
- [ ] Alte Plattform erst abschalten, wenn alle Punkte oben abgehakt sind
