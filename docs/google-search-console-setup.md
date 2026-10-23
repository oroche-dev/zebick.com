# Google Search Console — Einrichtung

Zeigt dir, welche Suchanfragen Besucher zu zebick.com bringen, wie oft die
Seite in Suchergebnissen erscheint (Impressionen), wie oft darauf geklickt
wird, und meldet technische Indexierungsprobleme. Kostenlos, unabhängig von
Google Analytics.

## 1. Property anlegen

1. [search.google.com/search-console](https://search.google.com/search-console) öffnen, mit dem Google-Konto einloggen, das die Seite verwalten soll
2. "Property hinzufügen" → **Domain** wählen (nicht "URL-Präfix") → `zebick.com` eingeben
   - "Domain" deckt automatisch `www.` und `non-www`, `http` und `https` mit ab — die bessere Wahl gegenüber "URL-Präfix"

## 2. Verifizieren

Bei der "Domain"-Property verlangt Google einen **TXT-Record** in der DNS-Zone:
1. Google zeigt dir einen Wert wie `google-site-verification=abc123...`
2. Bei SiteGround (oder wo auch immer die DNS-Zone für zebick.com liegt): Site Tools → Domain → DNS-Zone-Editor → neuen TXT-Record mit genau diesem Wert anlegen
3. Zurück bei Google auf "Bestätigen" — kann einige Minuten bis Stunden dauern (DNS-Propagation)

## 3. Sitemap einreichen

1. In Search Console links auf **"Sitemaps"**
2. Dort eintragen: `sitemap.xml` (ergibt zusammen `https://www.zebick.com/sitemap.xml`)
3. "Senden"

Die Sitemap wird automatisch vom Backend generiert (`GET /sitemap.xml`) und enthält immer alle aktuell veröffentlichten Seiten, Blog-Artikel und Portfolio-Projekte — bei neuem Content muss nichts manuell nachgetragen werden.

## 4. Was du danach überwachen solltest

- **Leistung** (linkes Menü): zeigt Klicks, Impressionen, durchschnittliche Position und Klickrate — aufgeschlüsselt nach Suchanfrage, Seite, Land, Gerät. Hier siehst du, welche Keywords tatsächlich Besucher bringen.
- **Indexierung → Seiten**: zeigt, welche Seiten indexiert sind und warum andere ausgeschlossen wurden (z.B. "Durch robots.txt blockiert", "Duplikat" — bei Zebick sollte hier nur `/zb-panel-8x2k/*` als blockiert erscheinen, alles andere sollte indexiert sein)
- **Core Web Vitals**: Ladezeit-/Interaktivitäts-Daten aus echten Besucherdaten (nicht sofort verfügbar, braucht etwas Traffic-Historie)
- **Sicherheitsprobleme**: Google warnt hier aktiv bei gehackten Seiten oder Malware — leer lassen ist der Normalzustand

## 5. Hinweis zu Prognosen

Suchmaschinen-Rankings und Traffic-Zahlen lassen sich nicht garantieren oder vorhersagen — Search Console zeigt nur, was tatsächlich passiert, nicht was passieren wird. Alle Werte dort sind reale Messdaten, keine Schätzungen.
