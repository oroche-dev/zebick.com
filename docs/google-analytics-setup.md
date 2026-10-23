# Google Analytics 4 — Einrichtung

Es gibt zwei getrennte Dinge, die beide "Google Analytics" heißen, aber
unabhängig voneinander funktionieren:

1. **Frontend-Tracking** (`REACT_APP_GA_ID`) — sendet Besucherdaten an Google.
   Funktioniert bereits im Code, sobald die ID gesetzt ist.
2. **Admin-Dashboard** (`GA_PROPERTY_ID` + `ga_credentials.json`) — liest
   Besucherdaten zurück, um sie im Zebick-Admin-Panel anzuzeigen. Braucht
   zusätzlich einen Google-Cloud-Service-Account.

Du kannst nur (1) einrichten und (2) weglassen — dann siehst du die Zahlen
direkt in `analytics.google.com` statt im eigenen Admin-Panel.

## 1. GA4-Property erstellen (falls noch nicht vorhanden)

1. Auf [analytics.google.com](https://analytics.google.com) einloggen (oder Konto erstellen).
2. Admin → Property erstellen → Name "Zebick", Zeitzone Schweiz, Währung CHF.
3. Unter "Datenstreams" einen Web-Stream für `https://www.zebick.com` anlegen.
4. Die angezeigte **Measurement ID** (Format `G-XXXXXXXXXX`) notieren.

## 2. Frontend-Tracking aktivieren

In `frontend/.env` (lokal) bzw. als Build-Variable in Produktion:

```
REACT_APP_GA_ID=G-XXXXXXXXXX
```

Fertig — `src/components/GoogleAnalytics.jsx` übernimmt den Rest automatisch
und lädt nur, wenn ein Besucher der "Analyse & Statistik"-Kategorie im
Cookie-Banner zustimmt.

## 3. Admin-Dashboard aktivieren (optional, mehr Aufwand)

### 3a. Numerische Property-ID finden

Admin → Property-Einstellungen → oben steht "PROPERTY-ID: 123456789"
(eine Zahl, **nicht** die `G-XXXX`-Measurement-ID von oben).

### 3b. Google-Cloud-Service-Account erstellen

1. [console.cloud.google.com](https://console.cloud.google.com) → neues Projekt (oder bestehendes nutzen).
2. "APIs & Dienste" → "Bibliothek" → **"Google Analytics Data API"** suchen → aktivieren.
3. "APIs & Dienste" → "Anmeldedaten" → "Anmeldedaten erstellen" → **Dienstkonto**.
   - Name z.B. `zebick-analytics-reader`, keine zusätzlichen Rollen nötig.
4. Im erstellten Dienstkonto → Tab "Keys" → "Add Key" → "Create new key" → **JSON** → herunterladen.

### 3c. Dienstkonto Zugriff auf die GA4-Property geben

1. Zurück in Google Analytics → Admin → "Property-Zugriffsverwaltung".
2. Nutzer hinzufügen → die E-Mail-Adresse des Dienstkontos eintragen
   (steht in der heruntergeladenen JSON-Datei als `client_email`, sieht aus
   wie `zebick-analytics-reader@dein-projekt.iam.gserviceaccount.com`).
3. Rolle: **Betrachter** reicht.

### 3d. Dateien ablegen

1. Die heruntergeladene JSON-Datei nach `backend/ga_credentials.json` legen
   (Dateiname exakt so — steht bereits in `.gitignore`-Nähe, wird nie committet).
2. In `backend/.env`:
   ```
   GA_PROPERTY_ID=123456789
   ```
3. Backend neu starten.

Danach liefert `GET /api/analytics/overview` (und die anderen 4
Analytics-Endpoints) echte Daten der letzten 28 Tage statt der
"Not configured"-Nullen. Fehlt eine der beiden Voraussetzungen, degradiert
alles automatisch zurück auf die Nullen — nichts bricht.
