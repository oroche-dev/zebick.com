# Blog-/Portfolio-Bilder extern speichern (Cloudflare R2)

Was sich dadurch ändert: Bilder, die du im Admin-Panel bei Blog-Artikeln
oder Portfolio-Projekten hochlädst, landen ab jetzt bei Cloudflare R2
(Objektspeicher) statt lokal auf der Festplatte des Backends — dadurch
überleben sie Redeploys auf Plattformen ohne persistenten Speicher (z. B.
Render ohne Disk) und werden über Cloudflares CDN ausgeliefert statt vom
eigenen Server.

Der Code dafür ist bereits fertig (`backend/routes/uploads.py`) — es fehlen
nur deine R2-Zugangsdaten. **Ohne sie funktioniert alles weiter wie bisher**
(lokale Speicherung) — R2 ist ein Zusatz, kein Pflichtschritt.

## 1. Cloudflare-Konto + R2 aktivieren

1. Auf [dash.cloudflare.com](https://dash.cloudflare.com) registrieren
   (oder mit bestehendem Konto einloggen).
2. Im Menü links **R2** öffnen → erstmaliges Aktivieren verlangt eine
   Zahlungsmethode, auch wenn du im kostenlosen Rahmen bleibst (10 GB
   Speicher, 1 Mio. Schreib-/10 Mio. Lesezugriffe pro Monat gratis, **keine**
   Kosten für ausgehenden Traffic — das ist der große Vorteil ggü. S3).

## 2. Bucket erstellen

1. **R2 → Create bucket** → Name z. B. `zebick-uploads`.
2. Region: Automatic (Standard).

## 3. Öffentlichen Zugriff aktivieren

Bilder müssen ohne Login abrufbar sein (sie werden ja direkt in die
öffentliche Website eingebettet):

1. Bucket öffnen → **Settings → Public Access**.
2. Entweder **R2.dev subdomain** aktivieren (schnellster Weg, URL sieht aus
   wie `https://pub-xxxxxxxxxxxx.r2.dev`) — oder **Custom Domain** verbinden
   (z. B. `cdn.zebick.com`, braucht einen CNAME-Eintrag bei SiteGround auf
   den von Cloudflare angezeigten Wert). Custom Domain wirkt professioneller
   und lässt sich später leichter wechseln, ist aber ein zusätzlicher
   DNS-Schritt.
3. Die resultierende Basis-URL notieren — das wird `R2_PUBLIC_URL`.

## 4. API-Token erstellen

1. **R2 → Manage R2 API Tokens → Create API Token**.
2. Permissions: **Object Read & Write**.
3. Auf den `zebick-uploads`-Bucket beschränken (nicht "alle Buckets").
4. Nach dem Erstellen zeigt Cloudflare **einmalig** `Access Key ID` und
   `Secret Access Key` — sofort sichern, das Secret wird danach nicht mehr
   angezeigt.
5. Auf derselben Seite steht auch die **Endpoint-URL** (Format
   `https://<account-id>.r2.cloudflarestorage.com`) — das wird
   `R2_ENDPOINT_URL`.

## 5. Werte eintragen

In `backend/.env` (lokal) bzw. bei deinem Hosting-Provider als
Umgebungsvariablen (siehe `docs/deployment-vps-docker.md` bzw.
`docs/deployment-managed-hosting.md`):

```
R2_ACCESS_KEY_ID=<aus Schritt 4>
R2_SECRET_ACCESS_KEY=<aus Schritt 4>
R2_ENDPOINT_URL=<aus Schritt 4>
R2_BUCKET=zebick-uploads
R2_PUBLIC_URL=<aus Schritt 3>
```

Backend danach neu starten, damit die Werte geladen werden.

## 6. Testen

1. Im Admin-Panel einen Blog-Artikel öffnen (oder neu anlegen) → bei
   "Cover-Bild" auf **Datei hochladen** → ein Bild wählen.
2. Prüfen, dass das Feld danach eine URL enthält, die mit deiner
   `R2_PUBLIC_URL` beginnt (nicht mehr `data:image/...`).
3. Den Artikel speichern, die öffentliche Blog-Seite öffnen → Bild muss
   sichtbar sein.
4. Dasselbe einmal bei einem Portfolio-Projekt (Titelbild und/oder Galerie).

## Hinweis zu bereits vorhandenen Bildern

Bilder, die **vor** dieser Umstellung hochgeladen wurden, liegen weiterhin
als eingebetteter Base64-Text direkt im jeweiligen Blog-/Portfolio-Eintrag —
die funktionieren unverändert weiter, werden aber nicht automatisch nach R2
verschoben. Um einen alten Eintrag zu migrieren: im Admin-Panel öffnen, das
Bild einfach erneut über "Datei hochladen" setzen und speichern — ab dann
liegt es in R2 statt in der Datenbank.
