# E-Mail-Versand über die Gmail-API (statt SMTP)

**Warum:** Render blockiert ausgehende SMTP-Verbindungen (bestätigt in den
Logs: "Timed out connecting to smtp.gmail.com on port 587") — eine
Anti-Spam-Einschränkung des Hosters. Die Gmail-API nutzt stattdessen eine
normale Web-Schnittstelle (HTTPS), die kein Hoster blockiert — ihr bleibt
bei eurem bestehenden Google-Konto (`kontakt@zebick.com`), nur das
Protokoll ändert sich.

Der Code dafür ist bereits fertig (`backend/services.py`). Es fehlen drei
Werte, die du einmalig besorgst. **Ohne sie läuft weiterhin alles wie
bisher** (Resend falls konfiguriert, sonst SMTP) — diese Umstellung ist
optional on top.

## 1. Google-Cloud-Projekt

1. [console.cloud.google.com](https://console.cloud.google.com) öffnen,
   mit dem Google-Konto einloggen, das zu `kontakt@zebick.com` gehört (oder
   das die Domain verwaltet).
2. Oben ein neues Projekt anlegen (oder ein bestehendes nutzen, falls schon
   eins für Google Analytics existiert) — z. B. Name `zebick-email`.

## 2. Gmail API aktivieren

1. Im Menü: **APIs & Services → Library**
2. "Gmail API" suchen → **Enable**

## 3. OAuth-Consent-Screen einrichten

1. **APIs & Services → OAuth consent screen**
2. User Type: **Internal** (falls Google Workspace) oder **External**
   (normales Google-Konto) — External reicht für diesen Zweck, auch im
   "Testing"-Status (muss nicht veröffentlicht werden)
3. App-Name z. B. `Zebick Mailer`, Support-E-Mail eure eigene, speichern
4. Falls "External" + Testing: unter **Test users** `kontakt@zebick.com`
   (bzw. die E-Mail, mit der du dich gleich anmeldest) hinzufügen

## 4. OAuth Client ID erstellen

1. **APIs & Services → Credentials → Create Credentials → OAuth client ID**
2. Application type: **Desktop app**
3. Name z. B. `zebick-backend-mailer`
4. **Create** — Client ID und Client Secret werden angezeigt, notieren
   (oder später nochmal einsehbar unter Credentials)

## 5. Refresh-Token holen (lokal, einmalig)

Auf deinem PC:
```
cd backend
.\venv\Scripts\python.exe -m scripts.gmail_oauth_setup
```
1. Fragt nach Client ID und Client Secret aus Schritt 4 — eingeben
2. Öffnet automatisch einen Browser → mit `kontakt@zebick.com` einloggen →
   Berechtigung erteilen ("Diese App ist nicht verifiziert" kann erscheinen,
   da nur im Testing-Status — auf "Advanced" → "Zu Zebick Mailer (unsicher)"
   klicken, das ist bei einer eigenen, nicht-öffentlichen App normal)
3. Nach Bestätigung zeigt das Skript im Terminal drei fertige Zeilen an

## 6. Bei Render eintragen

Die drei Zeilen aus Schritt 5 als Umgebungsvariablen eintragen:
- `GMAIL_CLIENT_ID`
- `GMAIL_CLIENT_SECRET`
- `GMAIL_REFRESH_TOKEN`

Speichern → neu deployen lassen.

## 7. Testen

Newsletter-Anmeldung und Kontaktformular auf `https://www.zebick.com`
testen, Mail-Eingang prüfen (auch Spam-Ordner).

## Hinweis

Der Refresh-Token verfällt nicht automatisch, kann aber jederzeit über
[myaccount.google.com/permissions](https://myaccount.google.com/permissions)
widerrufen werden (z. B. bei einem Verdacht auf Missbrauch) — danach muss
Schritt 5 einmal wiederholt werden.
