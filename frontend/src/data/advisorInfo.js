/**
 * Service-specific copy for the "Persönliche Beratung" block (service pages and
 * the tools page). Keyed by the advisor's `service_id`. Only qualitative
 * statements here; questions and recommendations come live from the tool config.
 * `icon` values are lucide-react names.
 */

export const ADVISOR_FACTS = [
  { icon: 'BadgeCheck', text: 'Kostenlose Erstberatung' },
  { icon: 'Clock', text: 'Antwort in unter 24 Stunden' },
  { icon: 'UserCheck', text: 'Individuell statt Standard-Paket' },
];

const DEFAULT_INFO = {
  lead: 'Beantworten Sie ein paar kurze Fragen und erhalten Sie sofort eine erste Einschätzung, welche Lösung zu Ihrem Vorhaben passt.',
  deliverables: [
    { icon: 'Compass', title: 'Erste Orientierung', text: 'Sie sehen direkt, welcher Ansatz zu Ihrem Ziel und Ihren Rahmenbedingungen passt.' },
    { icon: 'Layers', title: 'Passende Lösung', text: 'Eine Empfehlung, die auf Ihren Antworten aufbaut – kein Standard-Text.' },
    { icon: 'Wallet', title: 'Realistischer Rahmen', text: 'Einordnung von Umfang, Budget und Zeitplan, bevor Sie sich festlegen.' },
    { icon: 'FileText', title: 'Konzept per E-Mail', text: 'Auf Wunsch senden wir Ihnen ein Detail-Konzept mit den nächsten Schritten.' },
  ],
};

export const ADVISOR_INFO = {
  'web-development': {
    lead: 'Jede Website hat andere Anforderungen. In wenigen Klicks klären wir, ob eine schnelle Landing-Page, eine mehrseitige Unternehmens-Website, ein Online-Shop oder eine Web-App zu Ihrem Ziel passt.',
    deliverables: [
      { icon: 'Layers', title: 'Passende Projektform', text: 'Landing-Page, Unternehmens-Website, Shop oder Web-App – abgestimmt auf Ihr Ziel.' },
      { icon: 'Code', title: 'Technologie-Empfehlung', text: 'Eine Basis, die schnell lädt, bei Google gut sichtbar ist und mit Ihrem Wachstum mitgeht.' },
      { icon: 'Wallet', title: 'Umfang & Budget-Rahmen', text: 'Sie wissen vorab, was in Ihr Budget passt und was sich später ergänzen lässt.' },
      { icon: 'FileText', title: 'Konzept per E-Mail', text: 'Auf Wunsch erhalten Sie ein individuelles Konzept mit Seitenstruktur und nächsten Schritten.' },
    ],
  },
  'app-development': {
    lead: 'iOS, Android oder beides? Nativ oder Cross-Platform? Wir ordnen Ihre App-Idee ein und zeigen, welcher Weg zu Plattform, Funktionen und Budget passt.',
    deliverables: [
      { icon: 'Smartphone', title: 'Plattform-Strategie', text: 'iOS, Android, beide oder eine Progressive Web-App – je nach Zielgruppe und Budget.' },
      { icon: 'Code', title: 'Technologie-Wahl', text: 'Native Entwicklung, React Native, Flutter oder PWA: die Basis, die zu Ihrer App passt.' },
      { icon: 'Target', title: 'Kernfunktionen & MVP', text: 'Wir grenzen ab, was in die erste Version gehört und was später folgen kann.' },
      { icon: 'Rocket', title: 'Weg in die Stores', text: 'Von der Umsetzung bis zur Veröffentlichung im App Store und bei Google Play.' },
    ],
  },
  'automation-ki': {
    lead: 'Wo verlieren Sie täglich Zeit mit Routinearbeit? Wir finden die Prozesse, bei denen sich Automatisierung und KI am schnellsten auszahlen.',
    deliverables: [
      { icon: 'Workflow', title: 'Prozess-Potenziale', text: 'Vertrieb, Support, Buchhaltung oder Datenübertragung – wo Automatisierung sich lohnt.' },
      { icon: 'Plug', title: 'Anbindung Ihrer Tools', text: 'Integration in CRM, Microsoft 365, Google Workspace oder Ihre eigenen Systeme.' },
      { icon: 'Gauge', title: 'Machbarkeit & Aufwand', text: 'Eine ehrliche Einschätzung, was sich schnell umsetzen lässt und was mehr Vorarbeit braucht.' },
      { icon: 'FileText', title: 'Konzept per E-Mail', text: 'Auf Wunsch mit konkreten Automatisierungs-Ideen für Ihre Abläufe.' },
    ],
  },
  chatbot: {
    lead: 'Ein Chatbot soll Arbeit abnehmen, nicht Kunden ärgern. Wir klären Einsatzzweck und Kanäle und zeigen, welcher Bot-Typ für Ihr Business sinnvoll ist.',
    deliverables: [
      { icon: 'MessageCircle', title: 'Einsatzszenario', text: 'Support, Vertrieb, interner Assistent oder Voice-Bot – je nach Ziel der richtige Bot-Typ.' },
      { icon: 'Share2', title: 'Passende Kanäle', text: 'Website-Widget, WhatsApp, Teams, Slack oder mehrere Kanäle gleichzeitig.' },
      { icon: 'BookOpen', title: 'Wissensbasis', text: 'Der Bot antwortet auf Grundlage Ihrer eigenen Dokumente und Inhalte.' },
      { icon: 'UserCheck', title: 'Übergabe an Menschen', text: 'Wenn der Bot nicht weiterweiß, übernimmt Ihr Team – ohne Bruch für den Kunden.' },
    ],
  },
  'cyber-security': {
    lead: 'Sicherheit beginnt mit der Frage, wo Ihr größtes Risiko liegt. Wir grenzen Anwendung, Infrastruktur, Datenschutz oder Zertifizierung ein und empfehlen den passenden ersten Schritt.',
    deliverables: [
      { icon: 'ShieldAlert', title: 'Risiko-Einschätzung', text: 'Wo Ihre Anwendung, Infrastruktur oder Ihre Daten am verwundbarsten sind.' },
      { icon: 'Search', title: 'Passende Prüfung', text: 'Penetration Test, Infrastruktur-Audit, Datenschutz-Check oder Vorbereitung auf eine Zertifizierung.' },
      { icon: 'ListChecks', title: 'Priorisierte Maßnahmen', text: 'Zuerst das, was das Risiko am stärksten senkt – nicht alles auf einmal.' },
      { icon: 'Siren', title: 'Auch bei Dringlichkeit', text: 'Akuter Vorfall oder Verdacht? Geben Sie es an, wir stufen die Anfrage entsprechend ein.' },
    ],
  },
  gaming: {
    lead: 'Genre, Plattform und Engine hängen zusammen. Wir helfen Ihnen, die passende Technologie und das richtige Geschäftsmodell für Ihr Spiel zu finden.',
    deliverables: [
      { icon: 'Gamepad2', title: 'Engine-Empfehlung', text: 'Die Engine, die zu Genre, Team und Zielplattform passt.' },
      { icon: 'Monitor', title: 'Plattform-Strategie', text: 'Mobile, PC, Konsole oder Browser – und was das für Umsetzung und Reichweite bedeutet.' },
      { icon: 'Coins', title: 'Monetarisierung', text: 'Werbung, In-App-Käufe oder Premium-Modell: was zu Ihrer Zielgruppe passt.' },
      { icon: 'FlaskConical', title: 'Weg zum Prototyp', text: 'Ein schneller Prototyp, an dem sich Spielidee und Modell früh testen lassen.' },
    ],
  },
  'graphic-design': {
    lead: 'Vom Logo bis zur Verpackung: Wir klären, welche Design-Leistung Ihre Marke gerade am meisten voranbringt und in welchem Zeitrahmen.',
    deliverables: [
      { icon: 'PenTool', title: 'Passende Design-Leistung', text: 'Branding, Print-Material, Verpackung oder Social-Media-Templates.' },
      { icon: 'Palette', title: 'Einheitlicher Auftritt', text: 'Logo, Farben und Typografie, die über alle Kanäle zusammenpassen.' },
      { icon: 'CalendarClock', title: 'Realistischer Zeitplan', text: 'Vom dringenden Einzelauftrag bis zum umfassenden Marken-Relaunch.' },
      { icon: 'FileText', title: 'Konzept per E-Mail', text: 'Auf Wunsch mit Vorschlag zu Umfang, Ablauf und Lieferumfang.' },
    ],
  },
  marketing: {
    lead: 'Nicht jede Maßnahme passt zu jedem Ziel. Wir zeigen, welcher Kanal – SEO, Ads, E-Mail oder Social Media – bei Ihnen jetzt am meisten bringt.',
    deliverables: [
      { icon: 'Target', title: 'Ziel-Kanal-Abgleich', text: 'Traffic, Leads, Bekanntheit oder Conversion: welcher Kanal dazu am besten passt.' },
      { icon: 'TrendingUp', title: 'Maßnahmen-Empfehlung', text: 'SEO-Content, Google- und LinkedIn-Ads, E-Mail-Marketing oder Social Media.' },
      { icon: 'BarChart3', title: 'Messbare Ergebnisse', text: 'Klare Kennzahlen, an denen Sie sehen, ob die Maßnahme wirkt.' },
      { icon: 'FileText', title: 'Konzept per E-Mail', text: 'Auf Wunsch mit erstem Maßnahmenplan für Ihren Schwerpunkt.' },
    ],
  },
  server: {
    lead: 'Ob Migration, Hosting, Monitoring oder Backup: Wir schauen auf Ihr aktuelles Setup und empfehlen die Cloud-Strategie, die zu Ihnen passt.',
    deliverables: [
      { icon: 'ClipboardList', title: 'Ist-Analyse', text: 'Von der grünen Wiese über Legacy und On-Premise bis zur bestehenden Cloud-Umgebung.' },
      { icon: 'Cloud', title: 'Cloud-Strategie', text: 'Migration, Managed Hosting oder Cloud-Native-Setup, zum Beispiel auf AWS oder Azure.' },
      { icon: 'Activity', title: 'Monitoring & Betrieb', text: 'Überwachung und Alarme, damit Probleme auffallen, bevor Ihre Nutzer sie merken.' },
      { icon: 'DatabaseBackup', title: 'Ausfallsicherheit', text: 'Backup und Disaster-Recovery, abgestimmt auf das, was Ihr Business verkraftet.' },
    ],
  },
  'ui-ux': {
    lead: 'Ein gutes Interface entsteht aus dem richtigen Startpunkt. Wir klären, ob ein UX-Audit, ein Redesign, ein Design-System oder ein Prototyp Sie weiterbringt.',
    deliverables: [
      { icon: 'Compass', title: 'Passender Einstieg', text: 'UX-Audit, Redesign, Design-System oder Prototyp – je nach Reifegrad Ihres Produkts.' },
      { icon: 'Users', title: 'Nutzerzentrierte Analyse', text: 'Entscheidungen auf Basis dessen, wie Ihre Nutzer das Produkt tatsächlich bedienen.' },
      { icon: 'Zap', title: 'Schnelle Verbesserungen', text: 'Konkrete Quick-Wins, die sich ohne großen Umbau umsetzen lassen.' },
      { icon: 'MousePointerClick', title: 'Testbare Prototypen', text: 'Klickbare Entwürfe, die Sie ausprobieren können, bevor die Entwicklung startet.' },
    ],
  },
};

/** Info for a tool/service; falls back to generic copy. */
export const getAdvisorInfo = (serviceId) => ADVISOR_INFO[serviceId] || DEFAULT_INFO;
