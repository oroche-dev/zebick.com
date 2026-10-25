# E-Mail-Versand auf Resend umstellen

**Warum:** Render blockiert ausgehende SMTP-Verbindungen (Port 587/465/25) —
das hat bisher verhindert, dass Newsletter-Bestätigungen und
Kontaktformular-Antworten auf der Live-Seite ankamen. Resend verschickt
stattdessen über eine normale Web-API (HTTPS), die kein Hoster blockiert.

Der Code dafür ist bereits fertig (`backend/services.py`) — es fehlt nur
ein API-Key und (für den eigenen Domain-Absender) eine DNS-Verifizierung.
**Ohne `RESEND_API_KEY` läuft weiterhin alles wie bisher über SMTP** (lokal
funktioniert das ja bereits) — diese Umstellung betrifft nur die
Live-Umgebung bei Render.

## 1. Resend-Account erstellen

1. [resend.com](https://resend.com) → registrieren (kostenloser Tarif:
   3.000 E-Mails/Monat, reicht für dieses Projekt bequem).

## 2. Domain verifizieren

Damit E-Mails als `kontakt@zebick.com` ankommen (statt von einer
Resend-eigenen Testadresse):

1. Im Resend-Dashboard → **Domains** → **Add Domain**
2. `zebick.com` eingeben
3. Resend zeigt dir mehrere DNS-Einträge (meist 1× TXT für SPF, mehrere
   CNAME für DKIM, optional 1× TXT für DMARC)
4. Diese Einträge bei SiteGround im DNS-Zone-Editor anlegen — genau wie bei
   den vorherigen Domains (Name + Typ + Wert aus Resend 1:1 übernehmen)
5. Zurück bei Resend auf **Verify** klicken — kann wie immer bei DNS einige
   Minuten bis Stunden dauern

## 3. API-Key erstellen

1. Im Resend-Dashboard → **API Keys** → **Create API Key**
2. Name z. B. `zebick-backend`, Permission: **Sending access**
3. Der Key wird **einmalig** angezeigt — sofort kopieren/sichern

## 4. Bei Render eintragen

1. Dein Backend-Service → **Environment**
2. Neue Variable: `RESEND_API_KEY` = der Key aus Schritt 3
3. **Save Changes** → neu deployen lassen

## 5. Testen

Sobald der Deploy durch ist:
1. Newsletter-Anmeldung auf `https://www.zebick.com` mit einer echten
   E-Mail-Adresse testen
2. Kontaktformular testen
3. Mail-Eingang prüfen (auch Spam-Ordner)

Falls die Domain aus Schritt 2 noch nicht fertig verifiziert ist, kannst du
Schritt 5 trotzdem schon mit Resends Test-Setup probieren — dann kommt die
Mail nur von einer `@resend.dev`-Adresse statt `kontakt@zebick.com`, bis die
Verifizierung durch ist.
