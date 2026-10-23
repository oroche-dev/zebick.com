// Centralized Deep Dive content for each service page.
// Each entry is a content config consumable by <DeepDiveSection {...content} />.
//
// Import as: import deepDiveContent from '../../data/deepDiveContent';
// And:       <DeepDiveSection {...deepDiveContent.app} icons={{Server,Shield,Search}} />
//
// Icons are passed by NAME (string) → mapped at usage site to avoid bundling here.

const deepDiveContent = {
  // App Entwicklung
  app: {
    testid: 'app-deepdive',
    eyebrow: 'Deep Dive',
    title: 'Mobile First — Apps, die Menschen täglich öffnen.',
    intro:
      'Eine erfolgreiche App ist mehr als ein UI auf dem Smartphone. Sie ist eine ständig verfügbare Erweiterung Ihres Geschäfts — performant offline, sicher in der Cloud und konsistent über iOS, Android und Web. Wir entwickeln native Performance mit cross-platform Effizienz.',
    stats: [
      { k: '< 2 s', v: 'Cold Start' },
      { k: '4.7 ★', v: 'Avg. Rating' },
      { k: 'iOS·Android', v: 'cross-platform' },
      { k: '99.5%', v: 'Crash-free' },
    ],
    hero: {
      image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1600&q=80&auto=format&fit=crop',
      tag: 'Native Feel',
      num: '01',
      title: 'React Native & Flutter — eine Codebase, zwei Stores.',
      desc: 'Pixel-perfekte Animationen mit 60 fps, Push-Notifications, Biometric Auth und Deep-Linking. Native Module wenn nötig, cross-platform wenn möglich.',
    },
    pillars: [
      {
        num: '02', tag: 'Offline-First', iconName: 'Wifi',
        title: 'Funktioniert auch ohne Signal.',
        desc: 'Lokale SQLite/Realm-DBs, Sync-Queues, optimistische UI. Ihre App fühlt sich überall schnell an — egal ob 5G, 3G oder Flugmodus.',
        bullets: ['Background-Sync', 'Conflict-Resolution', 'Encrypted Local Storage'],
      },
      {
        num: '03', tag: 'App-Security', iconName: 'Shield',
        title: 'Sicher gegen Reverse Engineering.',
        desc: 'Certificate Pinning, Code-Obfuscation, Jailbreak/Root-Detection und sichere Keychain/Keystore-Speicherung von Tokens.',
        bullets: ['Certificate Pinning', 'Biometric Authentication', 'Encrypted at Rest'],
      },
      {
        num: '04', tag: 'Store Launch', iconName: 'Rocket',
        title: 'Vom Review bis zum Featured.',
        desc: 'App Store Optimization (ASO), Screenshots & Trailer, TestFlight/Play-Internal Beta, Crash-Reporting (Sentry/Firebase) und Phased-Rollout.',
        bullets: ['ASO Keywords & Visuals', 'Beta-Testing Workflow', 'Phased-Rollout & A/B'],
      },
    ],
    workflow: {
      title: 'Vom Konzept bis zum App-Store-Listing.',
      steps: [
        { n: '01', t: 'Strategy', d: 'Use-Cases, Plattform-Choice' },
        { n: '02', t: 'Prototype', d: 'Figma Flows, Click-Dummy' },
        { n: '03', t: 'Build', d: 'Sprints, native Module' },
        { n: '04', t: 'Beta', d: 'TestFlight, Crashlytics' },
        { n: '05', t: 'Release', d: 'ASO, Phased-Rollout' },
      ],
    },
    quote: {
      text: '„Eine App, die nicht jeden Tag geöffnet wird, ist ein Icon auf einem Bildschirm — kein Produkt."',
      author: 'Zebick · Mobile Philosophy',
    },
  },

  // UI/UX Design
  uiux: {
    testid: 'uiux-deepdive',
    eyebrow: 'Deep Dive',
    title: 'Design, das Nutzer führt — nicht verwirrt.',
    intro:
      'UI ist, was man sieht. UX ist, was man fühlt. Beides entscheidet, ob ein Besucher zum Kunden wird. Wir verbinden Research, Information-Architecture und Visual-Design zu Produkten, die intuitiv sind — und Conversions liefern.',
    stats: [
      { k: '+38%', v: 'Conversion' },
      { k: 'WCAG 2.2', v: 'AA Audit' },
      { k: '12 ms', v: 'Interaction' },
      { k: '500+', v: 'Designs' },
    ],
    hero: {
      image: 'https://images.unsplash.com/photo-1561070791-2526d30994b8?w=1600&q=80&auto=format&fit=crop',
      tag: 'Research-driven',
      num: '01',
      title: 'Erst verstehen, dann entwerfen.',
      desc: 'User-Interviews, Heatmaps, A/B-Tests und Personas formen jede Design-Entscheidung. Wir gestalten nicht für uns — wir gestalten für Ihre Nutzer.',
    },
    pillars: [
      {
        num: '02', tag: 'Design System', iconName: 'Layers',
        title: 'Konsistenz in jedem Pixel.',
        desc: 'Token-basierte Design-Systeme in Figma, mit Code-Sync zu Tailwind/CSS-Variablen. Skaliert vom Landing bis zum Dashboard.',
        bullets: ['Design Tokens', 'Component Library', 'Auto-Layout & Variants'],
      },
      {
        num: '03', tag: 'Accessibility', iconName: 'Eye',
        title: 'Zugänglich für alle, schön für jeden.',
        desc: 'Kontrast 4.5:1, Keyboard-Navigation, ARIA-Labels. Inklusion ist kein Bonus — sondern Voraussetzung für Reichweite.',
        bullets: ['Contrast & Focus States', 'Screen-Reader Support', 'WCAG 2.2 AA Audit'],
      },
      {
        num: '04', tag: 'Prototyping', iconName: 'MousePointer2',
        title: 'Testen, bevor Code geschrieben wird.',
        desc: 'Interaktive Prototypen mit Figma & Framer. Nutzer-Tests vor jedem Sprint — wir lernen früh, ändern günstig.',
        bullets: ['Interactive Prototypes', 'Usability Sessions', 'Heat-Map Validation'],
      },
    ],
    workflow: {
      title: 'Vom Whiteboard zum Click-Ready Design.',
      steps: [
        { n: '01', t: 'Research', d: 'Interviews, Audit' },
        { n: '02', t: 'IA', d: 'Sitemap, Flows' },
        { n: '03', t: 'Wireframe', d: 'Low-Fi, Layout' },
        { n: '04', t: 'Visual', d: 'UI Kit, States' },
        { n: '05', t: 'Test', d: 'Prototype, A/B' },
      ],
    },
    quote: {
      text: '„Gutes Design ist unsichtbar — schlechtes Design ist alles, woran man sich erinnert."',
      author: 'Zebick · Design Studio',
    },
  },

  // Cyber Security
  cyber: {
    testid: 'cyber-deepdive',
    eyebrow: 'Deep Dive',
    title: 'Security ist kein Feature — sondern eine Haltung.',
    intro:
      'Ein einziger Vorfall kann Vertrauen zerstören, das über Jahre aufgebaut wurde. Wir denken in Defense-in-Depth: Prävention, Detection, Response. DSGVO-konform, mit Penetration-Tests, die echte Angreifer simulieren — bevor sie es tun.',
    stats: [
      { k: 'DSGVO', v: 'konform' },
      { k: '< 4 h', v: 'Response' },
      { k: '100+', v: 'Pentests' },
      { k: '0', v: 'Breach' },
    ],
    hero: {
      image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1600&q=80&auto=format&fit=crop',
      tag: 'Penetration Test',
      num: '01',
      title: 'Angreifer denken — bevor sie es tun.',
      desc: 'OSCP/CEH-zertifizierte Pentester simulieren reale Angriffe auf Ihre Web-Apps, APIs und Infrastruktur. Sie bekommen einen Audit-Report mit CVSS-Scores und konkreten Fix-Anleitungen.',
    },
    pillars: [
      {
        num: '02', tag: 'Threat Modeling', iconName: 'Target',
        title: 'Risiken finden, bevor sie zuschlagen.',
        desc: 'STRIDE, MITRE ATT&CK und Threat-Trees — wir analysieren systematisch, wo Ihr System angreifbar ist, und priorisieren Gegenmaßnahmen nach Risiko.',
        bullets: ['STRIDE-Analyse', 'Attack-Surface Mapping', 'Risk-Ranked Roadmap'],
      },
      {
        num: '03', tag: 'SOC & SIEM', iconName: 'Shield',
        title: '24/7-Monitoring, das nicht schläft.',
        desc: 'Security-Operations-Center mit SIEM-Korrelation, automatischer Incident-Response und forensischer Logsammlung. Anomalien werden in Echtzeit sichtbar.',
        bullets: ['24/7 SOC Monitoring', 'SIEM Correlation', 'Incident Playbooks'],
      },
      {
        num: '04', tag: 'Compliance', iconName: 'Award',
        title: 'DSGVO, ISO, NIS-2 — alles aus einer Hand.',
        desc: 'Wir helfen Ihnen, Audits zu bestehen — mit Policies, Schulungen, Audit-Logs und automatischer Compliance-Berichterstattung.',
        bullets: ['DSGVO Article 32', 'NIS-2 Ready', 'Audit Documentation'],
      },
    ],
    workflow: {
      title: 'Vom Risiko-Assessment zur kontinuierlichen Verteidigung.',
      steps: [
        { n: '01', t: 'Assess', d: 'Asset Discovery, Audit' },
        { n: '02', t: 'Test', d: 'Pentest, Scans' },
        { n: '03', t: 'Harden', d: 'Patches, Policies' },
        { n: '04', t: 'Monitor', d: 'SOC, SIEM, Alerts' },
        { n: '05', t: 'Respond', d: 'IR, Forensics' },
      ],
    },
    quote: {
      text: '„Sicherheit ist kein Zustand — sie ist eine Disziplin. Und Disziplin bedeutet, jeden Tag besser zu werden."',
      author: 'Zebick · Security Practice',
    },
  },

  // Marketing & SEO
  marketing: {
    testid: 'marketing-deepdive',
    eyebrow: 'Deep Dive',
    title: 'Sichtbar werden. Gefunden werden. Wachsen.',
    intro:
      'SEO ist keine Magie — es ist messbare Arbeit. Wir kombinieren technisches SEO, Content-Strategie und Performance-Marketing zu einem System, das organischen Traffic in qualifizierte Leads verwandelt. Mit transparenten Reports und klaren KPIs.',
    stats: [
      { k: '+250%', v: 'Organic Traffic' },
      { k: 'Top 3', v: 'durchschn. Ranking' },
      { k: '8x', v: 'ROAS' },
      { k: '< 1 s', v: 'CWV Pass' },
    ],
    hero: {
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1600&q=80&auto=format&fit=crop',
      tag: 'Data-Driven',
      num: '01',
      title: 'Jede Entscheidung mit Zahlen unterlegt.',
      desc: 'Google Analytics 4, Search Console, Hotjar, Custom Dashboards — wir messen, was wirklich zählt: Conversions, Customer Acquisition Cost, Lifetime Value.',
    },
    pillars: [
      {
        num: '02', tag: 'Technical SEO', iconName: 'Search',
        title: 'Crawl-Budget, Core Web Vitals, Schema.',
        desc: 'Sitemap, robots.txt, hreflang, Schema.org Structured Data, optimierte URLs — Google liebt Sites, die ihm das Leben einfach machen.',
        bullets: ['Lighthouse 95+ Score', 'Schema.org JSON-LD', 'Internal Linking Audit'],
      },
      {
        num: '03', tag: 'Content & Authority', iconName: 'BookOpen',
        title: 'Inhalte, die Suchintention treffen.',
        desc: 'Keyword-Research, Content-Cluster, E-E-A-T-konforme Texte. Wir schreiben für Menschen — und nebenbei für Suchmaschinen.',
        bullets: ['Topic Clusters', 'E-E-A-T Optimization', 'Backlink Strategy'],
      },
      {
        num: '04', tag: 'Paid & Retargeting', iconName: 'TrendingUp',
        title: 'Google Ads & LinkedIn — kein Geld verbrennen.',
        desc: 'Saubere Conversion-Tracking-Setups, A/B-Tests für Ad-Creatives, Retargeting-Funnels. Jeder Klick zählt — und wird gemessen.',
        bullets: ['Conversion Tracking', 'A/B Creative Tests', 'Funnel-Retargeting'],
      },
    ],
    workflow: {
      title: 'Vom Keyword zum konvertierenden Lead.',
      steps: [
        { n: '01', t: 'Audit', d: 'Tech-SEO, Konkurrenz' },
        { n: '02', t: 'Strategy', d: 'Keywords, Funnel' },
        { n: '03', t: 'Content', d: 'Cluster, Texte' },
        { n: '04', t: 'Promote', d: 'Ads, Backlinks' },
        { n: '05', t: 'Measure', d: 'KPIs, ROI Report' },
      ],
    },
    quote: {
      text: '„SEO ist nicht das, was Sie tun — es ist das, was passiert, wenn Sie alles andere richtig machen."',
      author: 'Zebick · Growth Team',
    },
  },

  // Cloud / Server
  server: {
    testid: 'server-deepdive',
    eyebrow: 'Deep Dive',
    title: 'Infrastruktur, die einfach funktioniert.',
    intro:
      'Eine ausfallsichere Cloud-Architektur ist kein Luxus — sie ist Voraussetzung für jedes ernsthafte digitale Produkt. Wir bauen Infrastructure-as-Code, automatisieren Deployments und sorgen dafür, dass Ihre Systeme skalieren, ohne dass Sie nachts angerufen werden.',
    stats: [
      { k: '99.99%', v: 'Uptime SLA' },
      { k: '< 60 s', v: 'Deploy' },
      { k: 'IaC', v: 'Terraform' },
      { k: 'Multi-Region', v: 'Failover' },
    ],
    hero: {
      image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1600&q=80&auto=format&fit=crop',
      tag: 'Cloud-Native',
      num: '01',
      title: 'AWS, GCP, Azure — wir wählen, was passt.',
      desc: 'Container, Serverless, oder Hybrid? Wir analysieren Workload, Compliance und Budget und empfehlen die optimale Architektur — anbieter-neutral.',
    },
    pillars: [
      {
        num: '02', tag: 'CI / CD', iconName: 'GitBranch',
        title: 'Vom Commit zur Production in Minuten.',
        desc: 'GitHub Actions, GitLab CI, ArgoCD. Preview-Environments für jeden Pull Request, Blue/Green-Deployments, automatische Rollbacks.',
        bullets: ['Preview Environments', 'Blue/Green Deploy', 'Auto-Rollback'],
      },
      {
        num: '03', tag: 'Monitoring', iconName: 'BarChart',
        title: 'Sie sehen Probleme, bevor Kunden sie melden.',
        desc: 'Prometheus, Grafana, Datadog. Alerting, das nicht spammt, sondern priorisiert. SLI/SLO-basierte Dashboards für Produkt- und Tech-Teams.',
        bullets: ['SLO Dashboards', 'Smart Alerting', 'Distributed Tracing'],
      },
      {
        num: '04', tag: 'Cost Control', iconName: 'TrendingUp',
        title: 'Cloud-Kosten unter Kontrolle.',
        desc: 'FinOps-Disziplin: Right-Sizing, Spot-Instances, Reserved-Capacity. Wir senken Ihre Cloud-Bill im Schnitt um 30–50 % bei gleicher Performance.',
        bullets: ['Right-Sizing Audit', 'Spot & Reserved Mix', 'Budget Alerts'],
      },
    ],
    workflow: {
      title: 'Von der Architektur-Skizze zum produktiven Cluster.',
      steps: [
        { n: '01', t: 'Architect', d: 'Diagrams, Cost-Calc' },
        { n: '02', t: 'Provision', d: 'Terraform, IaC' },
        { n: '03', t: 'Deploy', d: 'CI/CD, Kubernetes' },
        { n: '04', t: 'Observe', d: 'Metrics, Alerts' },
        { n: '05', t: 'Optimize', d: 'FinOps, Tuning' },
      ],
    },
    quote: {
      text: '„Die beste Infrastruktur ist die, über die niemand mehr spricht — weil sie einfach läuft."',
      author: 'Zebick · Cloud Engineering',
    },
  },

  // Chatbot
  chatbot: {
    testid: 'chatbot-deepdive',
    eyebrow: 'Deep Dive',
    title: 'Konversationen, die 24/7 verkaufen.',
    intro:
      'Ein Chatbot ist nicht „ein Bot" — er ist ein digitaler Mitarbeiter, der nie schläft. Wir bauen KI-gestützte Assistenten, die Ihre Marke verstehen, Leads qualifizieren und in echte Gespräche einsteigen. Mit GPT-, Claude- oder Gemini-Integration — Sie wählen.',
    stats: [
      { k: '24/7', v: 'verfügbar' },
      { k: '+45%', v: 'Lead Qual.' },
      { k: '< 1 s', v: 'Reaktion' },
      { k: '14', v: 'Sprachen' },
    ],
    hero: {
      image: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=1600&q=80&auto=format&fit=crop',
      tag: 'GPT-5 powered',
      num: '01',
      title: 'Versteht Kontext. Spricht Ihre Marke.',
      desc: 'RAG mit Ihren Dokumenten, Tone-of-Voice via System-Prompt, Function-Calling für Aktionen. Mehr als FAQ — ein echter Berater im Web.',
    },
    pillars: [
      {
        num: '02', tag: 'Knowledge Base', iconName: 'Database',
        title: 'Ihre Dokumente werden zu Antworten.',
        desc: 'Vector-Search über PDFs, Webseiten, Confluence. Ihre Mitarbeiter trainieren den Bot durch das, was sie sowieso schreiben.',
        bullets: ['RAG mit Pinecone/Qdrant', 'Auto-Indexing von Docs', 'Source-Citations'],
      },
      {
        num: '03', tag: 'Lead Qualification', iconName: 'Target',
        title: 'Vom Besucher zum qualifizierten Termin.',
        desc: 'Der Bot stellt strukturierte Fragen, erkennt Buyer-Intent und übergibt qualifizierte Leads automatisch ins CRM oder via Calendar-Booking.',
        bullets: ['BANT-Scoring', 'CRM-Sync (HubSpot/Salesforce)', 'Calendar Booking'],
      },
      {
        num: '04', tag: 'Analytics', iconName: 'BarChart',
        title: 'Sehen, was Nutzer wirklich fragen.',
        desc: 'Conversation-Analytics zeigt, wo der Bot stockt, welche Themen oft kommen — und wie Sie Content und Produkt anpassen sollten.',
        bullets: ['Conversation Heatmaps', 'Fallback-Logging', 'Sentiment Score'],
      },
    ],
    workflow: {
      title: 'Vom Use-Case zur produktiven KI-Konversation.',
      steps: [
        { n: '01', t: 'Use-Case', d: 'Goals, Personas' },
        { n: '02', t: 'Train', d: 'Docs, Tone, RAG' },
        { n: '03', t: 'Integrate', d: 'CRM, Calendar' },
        { n: '04', t: 'Test', d: 'QA, Fallbacks' },
        { n: '05', t: 'Improve', d: 'Analytics, RLHF' },
      ],
    },
    quote: {
      text: '„Der beste Chatbot ist der, von dem die Nutzer nicht merken, dass er kein Mensch ist — aber dass er hilft."',
      author: 'Zebick · AI Practice',
    },
  },

  // Gaming
  gaming: {
    testid: 'gaming-deepdive',
    eyebrow: 'Deep Dive',
    title: 'Spiele, die Marken zu Communities machen.',
    intro:
      'Ein gut gemachtes Mini-Game ist Marketing, Lead-Magnet und Brand-Experience in einem. Wir entwickeln Web-Games mit nativer Performance, Cross-Device-Achievements und integrierter Reward-Engine — Engagement, das sich messen lässt.',
    stats: [
      { k: '60 fps', v: 'auf jedem Gerät' },
      { k: '+62%', v: 'Verweildauer' },
      { k: '4', v: 'Mini-Games' },
      { k: 'Achievement', v: 'Cross-Game' },
    ],
    hero: {
      image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&q=80&auto=format&fit=crop',
      tag: 'Engagement Engine',
      num: '01',
      title: 'Vom Klick zur Conversion über Gamification.',
      desc: 'Achievements, Levels, Rewards-Codes — Spielmechaniken verlängern Time-on-Site und machen Lead-Capture spielerisch leicht.',
    },
    pillars: [
      {
        num: '02', tag: 'Performance', iconName: 'Zap',
        title: '60 fps, auch auf alten Browsern.',
        desc: 'Canvas mit RequestAnimationFrame, WebGL wenn nötig, Asset-Preloading, Audio-Sprites. Smooth läuft auf Mobile, Desktop und Tablet.',
        bullets: ['Canvas + WebGL', 'Asset Preloading', 'Mobile-Tuned Controls'],
      },
      {
        num: '03', tag: 'Achievements', iconName: 'Award',
        title: 'Cross-Game-Progression.',
        desc: 'Eine zentrale Engine sammelt XP, Levels und Rewards über alle Spiele. Spieler bleiben — weil sie nicht von Null beginnen.',
        bullets: ['Cross-Game XP & Levels', 'Reward-Code Generator', 'Guest → Account Migration'],
      },
      {
        num: '04', tag: 'Lead Bridge', iconName: 'Users',
        title: 'Spiel-Belohnung wird zum Lead.',
        desc: 'Reward-Codes lösen automatisch Lead-Capture aus (E-Mail + Kontext). Was als Spaß beginnt, endet als qualifizierter Kontakt im CRM.',
        bullets: ['Reward → Lead Automation', 'E-Mail-Capture nahtlos', 'CRM-Sync inkl. Source-Tag'],
      },
    ],
    workflow: {
      title: 'Vom Konzept zum spielbaren Marketing-Tool.',
      steps: [
        { n: '01', t: 'Concept', d: 'Goals, Mechanics' },
        { n: '02', t: 'Prototype', d: 'Playable MVP' },
        { n: '03', t: 'Build', d: 'Canvas, Logic' },
        { n: '04', t: 'Reward', d: 'Achievements, Codes' },
        { n: '05', t: 'Launch', d: 'Analytics, A/B' },
      ],
    },
    quote: {
      text: '„Spiele sind das ehrlichste Medium — Nutzer bleiben nur, wenn es Spaß macht. Und Spaß ist die beste Marketing-Metrik."',
      author: 'Zebick · Gaming Studio',
    },
  },

  // Graphic Design
  graphic: {
    testid: 'graphic-deepdive',
    eyebrow: 'Deep Dive',
    title: 'Marken, die man wiedererkennt — auch ohne Logo.',
    intro:
      'Eine starke visuelle Identität ist mehr als ein Logo. Sie ist ein System aus Farben, Typografie, Bildsprache und Tonalität, das in jedem Touchpoint konsistent erscheint. Wir gestalten Brands, die nicht nur schön sind — sondern wiederkennbar.',
    stats: [
      { k: '500+', v: 'Designs' },
      { k: '100+', v: 'Brands' },
      { k: '15', v: 'Awards' },
      { k: 'Print + Digital', v: 'Omnichannel' },
    ],
    hero: {
      image: 'https://images.unsplash.com/photo-1561070791-2526d30994b8?w=1600&q=80&auto=format&fit=crop',
      tag: 'Brand Identity',
      num: '01',
      title: 'Vom Naming bis zum kompletten Brand-Book.',
      desc: 'Logo, Typografie, Color-System, Bildwelt, Tonalität — alle Bausteine einer Identität, dokumentiert in einem skalierbaren Brand-Guide.',
    },
    pillars: [
      {
        num: '02', tag: 'Print & Editorial', iconName: 'FileImage',
        title: 'Papier, das man behalten will.',
        desc: 'Geschäftsausstattung, Magazine, Verpackungen, Messewände. CMYK-optimiert, Druck-tauglich, durchdacht bis zur letzten Marge.',
        bullets: ['CMYK Color Profiles', 'Bleed & Trim', 'Press-Ready PDFs'],
      },
      {
        num: '03', tag: 'Digital Assets', iconName: 'Layers',
        title: 'Konsistenz über jeden Channel.',
        desc: 'Social-Media-Templates, Display-Ads, Newsletter-Designs, App-Icons. Alles aus einem System — schnell adaptierbar, immer markentreu.',
        bullets: ['Figma Component Library', 'Social Media Kit', 'Animated Banners'],
      },
      {
        num: '04', tag: 'Brand Guidelines', iconName: 'BookOpen',
        title: 'Skalierbar, auch ohne uns.',
        desc: 'Ein Brand-Book, das interne Teams und Partner-Agenturen befähigt, Ihre Marke korrekt anzuwenden — auch fünf Jahre nach dem Launch.',
        bullets: ['Logo & Spacing Rules', 'Typography Hierarchy', 'Do\'s & Don\'ts'],
      },
    ],
    workflow: {
      title: 'Vom Mood-Board zum lebenden Brand-System.',
      steps: [
        { n: '01', t: 'Discover', d: 'Brand DNA, Audit' },
        { n: '02', t: 'Concept', d: 'Mood, Direction' },
        { n: '03', t: 'Design', d: 'Logo, System' },
        { n: '04', t: 'Apply', d: 'Touchpoints' },
        { n: '05', t: 'Guide', d: 'Brand Book, Handover' },
      ],
    },
    quote: {
      text: '„Eine Marke ist das Versprechen, das Sie geben — und das Bild, das Menschen sehen, wenn sie nicht hinschauen."',
      author: 'Zebick · Brand Studio',
    },
  },
};

export default deepDiveContent;
