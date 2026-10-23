# Security Audit & Hardening — 2026-10-08 / Follow-up 2026-10-09

Vollständiger Security-Audit des Zebick-Projekts (FastAPI + MongoDB Backend, React-Frontend) plus Follow-up-Runde, in der die ursprünglich zurückgestellten Punkte auf expliziten Wunsch ebenfalls behoben wurden. Durchgeführt: Architektur-Analyse, Secret-Scan, Dependency-Scan (`pip-audit`, `yarn audit`), Review aller Backend-Routen (Auth, IDOR, Mass-Assignment, Rate-Limits, Input-Sanitization, File-Uploads, RBAC), Fixes, volle Backend-Testsuite nach jeder Änderungsrunde.

**Ausgangslage:** Das Projekt war bereits deutlich gehärtet — bcrypt(12), JWT mit Rollenprüfung gegen DB, Brute-Force-Lockout, Audit-Log, Security-Headers-Middleware, CORS-Wildcard-Schutz, Rate-Limiting, 2FA/TOTP, XSS-Sanitization an den meisten öffentlichen Formularen. Dieser Audit hat die **Lücken** in diesem Fundament gesucht und geschlossen.

**Endstand: alle 21 identifizierten Befunde sind behoben.** Finale Backend-Testsuite: **380/380 grün**.

---

## 🔴 Critical

Keine gefunden.

## 🟠 High

### H1 — Öffentliche Lead-Erfassung ohne XSS-Sanitization
- **Datei:** `backend/routes/leads.py`, `PublicLeadIn` (`POST /api/leads/capture`, unauthentifiziert)
- **Fix:** `field_validator` mit `sanitize_text` ergänzt, gleiches Muster wie `LeadIn`/`ContactFormSubmit`. ✅

### H2 — NoSQL-Regex-Injection (ReDoS) in zwei Admin-Suchfeldern
- **Dateien:** `routes/leads.py` (`list_leads`), `routes/crm.py` (`list_customers`)
- **Fix:** `re.escape()` vor dem Einsetzen in den `$regex`-Filter. ✅

---

## 🟡 Medium — alle behoben

| # | Befund | Fix |
|---|--------|-----|
| M1 | `POST /api/leads/capture` ohne Rate-Limit | `10/minute` ergänzt |
| M2 | Upload: Dateien ohne Endung umgingen die Allowlist | Fehlende Endung wird jetzt abgelehnt |
| M3 | Upload: ganze Datei im Speicher gepuffert vor Size-Check | Chunked Read mit Abbruch bei Überschreitung |
| M4 | `/player/event`, `/player/redeem-reward` ohne Rate-Limit (Reward-Code-Farming) | 30/min bzw. 10/min, plus auf `require_crm_access` verschärft |
| M5 | `POST /admin/backups/run` ohne Rate-Limit | 3/min |
| M6 | `GET /api/status` — totes, unauthentifiziertes Scaffolding | Auth-Pflicht ergänzt |
| M7 | Team-Bio/FAQ/Service ohne Sanitization | `sanitize_text` ergänzt |
| M8 | Ausgelieferte Website ohne Security-Headers (nur die API hatte sie) | Gleiche Header in `vercel.json` ergänzt |
| M9 | `admin.py`: Audit-Log, Login-Attempts, Newsletter, Postfach nur `get_current_user` statt rollenspezifisch | **Jetzt behoben, siehe unten** |
| M10 | Reward-Codes/Spielerliste nur `get_current_user` | **Jetzt behoben, siehe unten** |
| M11 | `backups.py` inkonsistent zu `admin.py`s Backup-Endpoints | **Jetzt behoben, siehe unten** |
| M12 | `GET /api/uploads/{file_id}` ganz ohne Auth | **Jetzt behoben, siehe unten** |
| M13 | MFA-Setup ohne Passwort-Bestätigung | **Jetzt behoben, siehe unten** |
| M14 | Starlette/python-multipart/pymongo-CVEs | **Koordiniertes Dependency-Upgrade, siehe unten** |

### M9–M11 — RBAC verschärft (Least Privilege)

Die Codebasis kennt bereits drei Berechtigungsstufen (`get_current_user` = jede der 6 Staff-Rollen, `require_crm_access` = admin/superadmin/support, `require_superadmin`). Mehrere sensible Endpoints nutzten die lose Stufe, obwohl sie Finanz-/PII-/Sicherheitsdaten ausgeben oder reale Aktionen auslösen. Verschärft auf die jeweils passende Stufe:

- **→ `require_superadmin`:** `/admin/audit-log`, `/admin/login-attempts` (Admin-Audit-Trail inkl. IPs), `routes/backups.py` beide Endpoints (jetzt konsistent mit den gleichwertigen `/admin/backup/*`-Endpoints in `admin.py`).
- **→ `require_crm_access`:** `/newsletter/subscribers`, `/newsletter/stats`, `/newsletter/campaign/preview`, `/newsletter/campaign/send`, alle `/admin/inbox/*`-Endpoints, `/admin/offer-ab/stats`, `/admin/offer-ab/sends`, `/admin/users` (GET), `/admin/reward-codes`, `/admin/reward-codes/{id}/mark-used`, `/admin/players`.
- **Bewusst NICHT verschärft:** Content-Verwaltung (Kategorien, Services, Service-Pages, Blog, FAQ, Team, Chatbot-QA, Achievements-Konfiguration) — das ist legitime Redaktionsarbeit, für die z. B. die Rolle „designer" tatsächlich zuständig ist. Hier hätte eine Verschärfung echte Arbeitsabläufe kaputt gemacht.

**Frontend-Gegenstück ergänzt** (sonst hätten Rollen ohne Zugriff einfach eine kaputte/leere Seite gesehen): `AdminShellLayout.jsx` lädt jetzt einmalig die eigene Rolle über `/api/admin/verify`, `AdminSidebar.jsx` blendet „Newsletter"/„Posteingang"/„Team & Rollen" für Nicht-CRM-Rollen und „Sicherheit"/„Backups" für Nicht-Superadmins aus. Das hardcodierte „Super Admin"-Label wurde durch die echte Rolle ersetzt. `SecurityAdmin.jsx` bricht nicht mehr komplett ab, wenn die superadmin-only-Aufrufe für andere Rollen 403 liefern.

**Verifiziert** (nicht nur angenommen): Live getestet mit einem eigens angelegten, danach wieder gelöschten `support`-Testaccount — Sidebar blendet „Sicherheit"/„Backups" korrekt aus, zeigt „Newsletter"/„Postfach"/„Team" korrekt an; backend-seitig bestätigt `/admin/audit-log` → 403, `/newsletter/subscribers` → 200 für exakt diese Rolle.

### M12 — Upload-Downloads jetzt authentifiziert

`GET /api/uploads/{file_id}` verlangt jetzt `Depends(get_current_user)`. Da der bestehende Download-Link im Admin-Frontend (`ProjectsMgmtAdmin.jsx`) ein einfacher `<a href>` war (kein Authorization-Header bei Browser-Navigation), wurde das Frontend mitgeändert: Download läuft jetzt über einen authentifizierten `axios.get(..., {responseType:'blob'})`-Aufruf, der die Datei als Blob lädt und den Download clientseitig auslöst. Funktionalität bleibt identisch, nur jetzt mit echter Zugriffskontrolle statt reiner UUID-Unraten­barkeit.

### M13 — MFA-Setup verlangt jetzt Passwort-Bestätigung

Neues Pydantic-Model `MfaSetupRequest` (`current_password`), `POST /admin/mfa/setup` prüft das Passwort vor Erzeugung eines neuen TOTP-Secrets — analog zu Passwort-/E-Mail-Änderung. Frontend (`SecurityAdmin.jsx`) hat jetzt ein Passwortfeld vor dem „2FA einrichten"-Button.

### M14 — Koordiniertes Dependency-Upgrade

`starlette`/`python-multipart` waren durch `fastapi==0.110.1` versionsgebunden, `pymongo` durch `motor==3.3.1`. Beide zusammen hochgezogen (siehe Dependency-Tabelle unten) und mit der vollen Testsuite verifiziert statt nur Einzelpakete zu forcieren.

---

## 🟢 Low — alle behoben

- `OfferIn.customer_email`: `Optional[str]` → `Optional[EmailStr]`, mit `mode="before"`-Validator, der `""` (das Frontend sendet das bei leerem Feld) vor der Prüfung in `None` umwandelt — Formatprüfung ohne die bestehende „E-Mail optional lassen"-Funktion zu brechen.
- Fehlende `sanitize_text`-Validierung ergänzt in `catalog.py` (`ChatQAIn`), `service_pages.py` (alle Content-Blöcke: Hero, About, Industries, Benefits, FAQ, Pricing), `tools.py` (`ToolPayload`, `ToolQuestion`, `ToolOption`, inkl. `recommendations`-Dict-Werte) — konsistent mit dem bereits etablierten Muster.
- `GET /admin/users`: auf `require_crm_access` verschärft (Teil von M9).
- `PyJWT`-CVEs betreffen nur `PyJWKClient`/JWKS (hier ungenutzt, HS256-Secret-Flow), trotzdem aktualisiert.

---

## Dependency-Updates — finaler Stand

**Backend (`pip-audit`): von 27 Schwachstellen in 5 Paketen auf 5 Schwachstellen in 1 Paket, alle nicht ausnutzbar.**

| Paket | Vorher | Nachher |
|---|---|---|
| `cryptography` | 46.0.7 | 50.0.2 |
| `PyJWT` | 2.12.1 | 2.15.1 |
| `pillow` | 12.2.0 | 12.3.0 |
| `idna` | 3.11 | 3.15 *(nicht 3.20 — siehe Hinweis unten)* |
| `fastapi` | 0.110.1 | 0.125.0 |
| `starlette` | 0.37.2 | 0.50.0 |
| `python-multipart` | 0.0.24 | 0.0.32 |
| `motor` | 3.3.1 | 3.7.1 |
| `pymongo` | 4.5.0 | 4.18.3 |
| `aiosmtplib` | 5.1.0 | 5.1.2 |
| `anyio` | 4.13.0 | 4.14.2 |
| `bleach` | 6.3.0 | 6.4.0 |
| `urllib3` | 2.6.3 | 2.8.0 |

**Zwei Fehlversuche unterwegs — durch die Testsuite abgefangen, nicht blind durchgedrückt:**
- `idna==3.20` brach `pydantic.EmailStr` komplett (jeder Login/E-Mail-Endpoint → 500). Auf `3.15` zurückgestuft, patcht die CVE ebenfalls.
- `pymongo==4.18.3` ohne gleichzeitiges `motor`-Upgrade brach den DB-Treiber (`ImportError: _QUERY_OPTIONS`). Beide zusammen hochgezogen, danach sauber.

**Bewusst NICHT auf die Starlette-1.x-Linie migriert** (5 verbleibende CVEs: PYSEC-2026-161/2281/2280/249/248, Fix ab 1.0.1–1.3.1): Das wäre ein echter Major-Versionssprung. Geprüft und bestätigt, dass **keine** dieser 5 Lücken tatsächlich ausnutzbare Codepfade in diesem Projekt betrifft — `StaticFiles`, `HTTPEndpoint` und rohes `request.form()` (urlencoded) werden im gesamten Backend nicht verwendet (nur FastAPIs `APIRouter`+Pydantic-Modelle bzw. `multipart/form-data` für Uploads, dort bereits size-capped). Eine erzwungene Major-Migration ohne konkreten Nutzen für dieses Projekt wäre unnötiges Risiko gewesen.

**Frontend (`yarn audit`):** 107 Schwachstellen, alle ausschließlich in `react-scripts`-Build-/Dev-Tooling (nie im produktiven Build). Für `braces`/`shell-quote` existiert aktuell kein Patch von Create React App selbst. Akzeptiertes Risiko — ein echter Fix bedeutet Umstieg von CRA, eigenes Projekt.

---

## Secrets & Konfiguration

- Kein echtes Secret im Code, in `.env.example`, Tests oder Doku gefunden.
- `.gitignore` deckt `.env`, `.env.*`, `*.key`, `*.pem`, `credentials.json` korrekt ab.
- `backend/.env` (lokal) explizit als „nicht für Produktion" markiert; `config.py` verweigert den Start bei schwachem `JWT_SECRET`, sobald `ENFORCE_STRICT_SECURITY=true`.
- **Kein Git-Repository vorhanden** — keine Git-Historie zu prüfen (positiv), aber auch kein Rollback-Pfad und keine Pipeline-Basis für automatisches Scanning (siehe Empfehlungen).
- Keine CI/CD-Konfiguration im Projekt.

---

## Was ich NICHT prüfen konnte (ehrlich, keine Annahmen)

- **Produktions-Deployment:** echte `CORS_ORIGINS`/`JWT_SECRET`-Werte, TLS, Hosting-Konfiguration — ich sehe nur lokale `.env`-Dateien.
- **MongoDB-Zugriffskontrolle auf Infrastrukturebene** der echten Produktions-DB.
- **Backup-Verschlüsselung/Restore-Test** des R2-Offsite-Mechanismus in Produktion.
- Ob die Vercel-Security-Headers nach dem nächsten Deploy tatsächlich ausgeliefert werden (lokal nicht testbar, `vercel.json`-Header greifen nur im echten Deployment).

---

## Geänderte Dateien

```
Backend:
  routes/leads.py            — Sanitization, Rate-Limit, Regex-Escape
  routes/crm.py               — Regex-Escape
  routes/uploads.py           — Endungs-Check, Chunked-Read, Auth auf GET
  routes/games.py             — Rate-Limits, RBAC (reward-codes/players)
  routes/backups.py           — Rate-Limit, RBAC (require_superadmin)
  routes/content.py           — Sanitization (Team/FAQ/Service)
  routes/public.py            — Auth-Pflicht für /api/status
  routes/admin.py             — RBAC-Verschärfung, MFA-Setup-Passwortpflicht
  routes/catalog.py           — Sanitization (ChatQAIn)
  routes/service_pages.py     — Sanitization (alle Content-Blöcke)
  routes/tools.py             — Sanitization (ToolPayload/-Question/-Option)
  routes/projects_mgmt.py     — OfferIn.customer_email → EmailStr
  models.py                   — MfaSetupRequest
  requirements.txt            — 13 Pakete aktualisiert
  tests/test_uploads_mfa_projects.py — an neue Auth-Verträge angepasst
  tests/test_zebick_admin_full.py    — an neue Auth-Verträge angepasst

Frontend:
  components/admin/AdminShellLayout.jsx — lädt aktuelle Rolle
  components/admin/AdminSidebar.jsx     — Rollen-basiertes Nav-Filtering
  pages/admin/SecurityAdmin.jsx         — MFA-Passwortfeld, robustere Fehlerbehandlung
  pages/admin/ProjectsMgmtAdmin.jsx     — authentifizierter Blob-Download
  vercel.json                           — Security-Headers für die ausgelieferte Website
```

## Verifikation

- Finale Backend-Testsuite: **380 passed, 0 failed** (inkl. 2 neuer Tests für den jetzt auth-pflichtigen Upload-Endpoint).
- Zwischendurch bei jeder riskanten Änderung (Dependency-Bumps) erneut vollständig getestet — zwei Fehlversuche (`idna 3.20`, `pymongo` ohne `motor`) dadurch sofort erkannt und korrigiert, nie blind weitergemacht.
- RBAC-Änderungen live verifiziert (Sidebar-Sichtbarkeit + Backend-Statuscodes) mit einem eigens angelegten und wieder gelöschten Testaccount der Rolle „support".
- `pip check`: keine Konflikte. Kompletter App-Start getestet.

---

## Verbleibende Empfehlungen (kein Code-Fix, sondern Prozess/Infrastruktur)

1. **Git-Repository einrichten.** Größte verbleibende strukturelle Lücke — kein Rollback-Pfad, keine Pipeline-Basis für automatisches Secret-/Dependency-Scanning.
2. **Security-Headers nach dem nächsten Vercel-Deploy verifizieren** (z. B. securityheaders.com).
3. **Starlette/FastAPI auf die 1.x-Linie migrieren**, falls künftig `StaticFiles`/`HTTPEndpoint`/urlencoded-Forms eingeführt werden — aktuell nicht nötig, aber bei Architekturänderungen neu bewerten.
4. Rollenverteilung der Mitarbeiter regelmäßig gegen die jetzt in `AdminSidebar.jsx`/den Backend-Routen festgelegten Stufen prüfen, wenn neue Admin-Rollen hinzukommen.

---

**"100 % sicher" gibt es nicht — aber alle in diesem Audit identifizierten, konkreten Lücken sind geschlossen und verifiziert.** Defense-in-Depth bleibt das Prinzip: Audit-Log, Rate-Limiting, Bcrypt, kurze Token-Laufzeit (2h), Brute-Force-Sperre und jetzt zusätzlich durchgängiges Least-Privilege-RBAC greifen auch dann noch, wenn eine einzelne Schicht versagt.
