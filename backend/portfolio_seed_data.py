"""
Rich portfolio seed data: 7 realistic, professional showcase projects.
Each project demonstrates a different service offering for a credible
DACH-region client (fictional but plausible).
"""

PORTFOLIO_SEED = [
    # ===========================================================
    # 1. FINTECH WEB APP — Helvetia Capital
    # ===========================================================
    {
        "title": "Helvetia Capital — Wealth Platform",
        "subtitle": "Institutionelle Vermögensverwaltung mit KI-Analyse",
        "category": "Webentwicklung",
        "service_id": "web-development",
        "client": "Helvetia Capital Partners AG",
        "year": "2025",
        "duration": "8 Monate",
        "website_type": "FinTech Web-Plattform",
        "description": (
            "Hochsichere Wealth-Management-Plattform mit Echtzeit-Portfolio-Tracking, "
            "KI-gestützter Risikoanalyse und automatisiertem Reporting für institutionelle Anleger."
        ),
        "about_project": (
            "Helvetia Capital Partners verwaltet über CHF 4 Mrd. an Kundenvermögen. "
            "Wir entwickelten eine FINMA-konforme Web-Plattform, die Portfolio-Manager, "
            "Risk-Officers und Endkunden in einer einzigen Anwendung vereint.\n\n"
            "Kernfunktionen:\n"
            "• Live-Portfolio-Bewertung über Bloomberg & Refinitiv-Feeds\n"
            "• Monte-Carlo-Risikosimulation mit eigenem ML-Modell\n"
            "• Automatisierte FINMA-Compliance-Reports (Knopfdruck statt 5 Tage)\n"
            "• Mandantenfähiges Rollen-/Rechtekonzept mit SSO (Azure AD)\n"
            "• Audit-Trail für jede Order und jeden Datenexport"
        ),
        "challenge": (
            "Die Bank betrieb sieben isolierte Excel-Tools und ein 18 Jahre altes Java-Backend. "
            "Monatsreports dauerten 5 Manntage. Mobile Zugriff war nicht vorhanden, "
            "und die FINMA hatte mehrere Compliance-Beanstandungen ausgesprochen."
        ),
        "solution": (
            "Aufbau einer modernen React-Plattform auf TypeScript, Node.js und PostgreSQL. "
            "Microservice-Architektur auf Kubernetes mit Vault-Secrets, mTLS und WAF. "
            "Echtzeit-Daten via WebSocket, ML-Modelle (PyTorch) hinter einem internen API-Gateway."
        ),
        "outcome": (
            "Reports werden in 90 Sekunden statt 5 Tagen erstellt. "
            "FINMA-Audit 2025 ohne Beanstandungen. NPS von Portfolio-Managern: +62 Punkte. "
            "ROI nach 11 Monaten erreicht."
        ),
        "process_steps": [
            {"title": "Discovery & Compliance-Audit", "description": "4-wöchiger Workshop mit Risk, Compliance, IT und Fachbereich. Threat-Modelling nach STRIDE.", "icon": "Search"},
            {"title": "Architektur & FINMA-Freigabe", "description": "Solution-Design dokumentiert nach BAIT/FINMA RS 2018/3. Externe Architektur-Review durch Big-4-Partner.", "icon": "Layers"},
            {"title": "Inkrementelle Entwicklung", "description": "2-Wochen-Sprints mit Dual-Track-Discovery. Wöchentliche Demos für Stakeholder.", "icon": "Code"},
            {"title": "Penetration-Test & Hardening", "description": "Externer Pentest, ISO 27001-Audit, automatisierte SAST/DAST-Pipelines.", "icon": "Shield"},
            {"title": "Go-Live & Operations", "description": "Schrittweiser Rollout pro Abteilung. 24/7-Bereitschaft in den ersten 90 Tagen.", "icon": "Rocket"},
        ],
        "tags": ["FinTech", "React", "Microservices", "FINMA", "ML"],
        "tech_stack": ["React 19", "TypeScript", "Node.js", "PostgreSQL", "PyTorch", "Kubernetes", "AWS", "Vault"],
        "tech_stack_detailed": [
            {"name": "React", "logo": "https://cdn.simpleicons.org/react"},
            {"name": "TypeScript", "logo": "https://cdn.simpleicons.org/typescript"},
            {"name": "Node.js", "logo": "https://cdn.simpleicons.org/nodedotjs"},
            {"name": "PostgreSQL", "logo": "https://cdn.simpleicons.org/postgresql"},
            {"name": "PyTorch", "logo": "https://cdn.simpleicons.org/pytorch"},
            {"name": "Kubernetes", "logo": "https://cdn.simpleicons.org/kubernetes"},
            {"name": "AWS"},
            {"name": "Vault", "logo": "https://cdn.simpleicons.org/vault"},
        ],
        "metrics": [
            {"label": "Schnellere Reports", "value": "200×"},
            {"label": "FINMA-Audit", "value": "0 Findings"},
            {"label": "AUM verwaltet", "value": "CHF 4 Mrd."},
        ],
        "cover_image": "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1600&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1400&q=80",
            "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1400&q=80",
            "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1400&q=80",
            "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1400&q=80",
        ],
        "website_url": None,
        "testimonial_quote": (
            "Zebick hat unsere Plattform nicht nur gebaut, sondern unsere Compliance-Position um zwei "
            "Reifegradstufen nach vorne gebracht. Die FINMA-Auditoren waren beeindruckt."
        ),
        "testimonial_author": "Dr. Niklaus Frei",
        "testimonial_position": "Chief Technology Officer, Helvetia Capital Partners",
        "testimonial_rating": 5,
        "testimonial_avatar": "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=face",
        "featured": True,
        "order": 1,
    },

    # ===========================================================
    # 2. HEALTHCARE NATIVE APP — AlpenMed
    # ===========================================================
    {
        "title": "AlpenMed — Telemedizin-App",
        "subtitle": "DSGVO-konforme Patientenversorgung in den Alpen",
        "category": "App-Entwicklung",
        "service_id": "app-development",
        "client": "AlpenMed Gesundheitsnetzwerk AG",
        "year": "2025",
        "duration": "6 Monate",
        "website_type": "Native iOS & Android App",
        "description": (
            "Telemedizin-App für alpine Bergregionen mit Offline-Sync, "
            "End-to-End-verschlüsselter Video-Sprechstunde und elektronischem Rezept."
        ),
        "about_project": (
            "AlpenMed versorgt 47 Bergdörfer, in denen der nächste Hausarzt 60+ Minuten "
            "Fahrzeit entfernt ist. Wir bauten eine App, die auch mit instabiler 3G-Verbindung "
            "stabil läuft und Patienten an Spezialisten in Innsbruck und Bern anbindet.\n\n"
            "• End-to-End-verschlüsselte Video-Konsultation (WebRTC + Signal-Protokoll)\n"
            "• Offline-Fragebögen mit verschlüsseltem Sync\n"
            "• eRezept-Integration mit lokalen Apotheken\n"
            "• Barrierefreie UI für Senioren (WCAG 2.2 AAA)\n"
            "• Schweizer EPD- und österreichische ELGA-Anbindung"
        ),
        "challenge": (
            "Patienten in abgelegenen Regionen haben oft nur 3G und sind mehrheitlich über 65. "
            "Gleichzeitig fordern Schweizer KVG und österreichisches DSG strengste Verschlüsselung "
            "und nachweisbare Audit-Trails."
        ),
        "solution": (
            "React Native mit nativem WebRTC-Layer für stabile Calls. Eigenes Sync-Protokoll mit "
            "Conflict-Free Replicated Data Types (CRDTs). UI komplett barrierefrei mit dynamischen "
            "Schriftgrößen und VoiceOver-Optimierung."
        ),
        "outcome": (
            "12.400 aktive Patienten in 8 Monaten. Durchschnittliche Wartezeit auf Sprechstunde: 14 Min. "
            "App-Store-Rating: 4.9 / 5. Zertifiziert nach MDR Class IIa."
        ),
        "process_steps": [
            {"title": "Field Research", "description": "Drei Wochen in Bergdörfern mit Patienten, Ärzten und Apothekern. Schmerzpunkte priorisiert.", "icon": "Users"},
            {"title": "Design für Senioren", "description": "Prototyping in Figma. UX-Tests mit Probanden 65+. Drei Iterationen bis Klick-Pfad <3 Schritte.", "icon": "Palette"},
            {"title": "Native Entwicklung", "description": "React Native + native Module für WebRTC und Biometrie. CI/CD über Fastlane + EAS.", "icon": "Smartphone"},
            {"title": "MDR-Zertifizierung", "description": "Risikomanagement nach ISO 14971, klinische Bewertung, Benannte-Stelle-Audit.", "icon": "ShieldCheck"},
            {"title": "Soft-Launch", "description": "Pilot in 3 Dörfern, danach gestaffelter Rollout. Schulungen für Patienten und Praxen.", "icon": "Rocket"},
        ],
        "tags": ["React Native", "WebRTC", "MDR", "Health"],
        "tech_stack": ["React Native", "TypeScript", "WebRTC", "PostgreSQL", "Firebase", "AWS"],
        "tech_stack_detailed": [
            {"name": "React", "logo": "https://cdn.simpleicons.org/react"},
            {"name": "TypeScript", "logo": "https://cdn.simpleicons.org/typescript"},
            {"name": "WebRTC", "logo": "https://cdn.simpleicons.org/webrtc"},
            {"name": "Firebase", "logo": "https://cdn.simpleicons.org/firebase"},
            {"name": "PostgreSQL", "logo": "https://cdn.simpleicons.org/postgresql"},
            {"name": "AWS"},
        ],
        "metrics": [
            {"label": "App-Store-Rating", "value": "4.9 / 5"},
            {"label": "Aktive Patienten", "value": "12 400"},
            {"label": "Ø Wartezeit", "value": "14 Min."},
        ],
        "cover_image": "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1600&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1551076805-e1869033e561?w=1400&q=80",
            "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=1400&q=80",
            "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1400&q=80",
            "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1400&q=80",
        ],
        "website_url": None,
        "testimonial_quote": (
            "Unsere Patienten in den Bergdörfern fühlen sich endlich gleichwertig versorgt. "
            "Die App hat eine Versorgungslücke geschlossen, die wir seit 20 Jahren beklagen."
        ),
        "testimonial_author": "Dr. med. Andrea Burkhalter",
        "testimonial_position": "Ärztliche Leitung, AlpenMed",
        "testimonial_rating": 5,
        "testimonial_avatar": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face",
        "featured": True,
        "order": 2,
    },

    # ===========================================================
    # 3. E-COMMERCE — NordWald Outdoor
    # ===========================================================
    {
        "title": "NordWald Outdoor — Headless Commerce",
        "subtitle": "Headless E-Commerce mit 240k Bestellungen / Saison",
        "category": "Webentwicklung",
        "service_id": "web-development",
        "client": "NordWald GmbH",
        "year": "2024",
        "duration": "9 Monate",
        "website_type": "Headless E-Commerce-Plattform",
        "description": (
            "Headless E-Commerce-Plattform für DACH-Outdoor-Marke mit 240.000+ Bestellungen "
            "pro Saison und nahtlosem Omnichannel zwischen 18 Filialen und Online-Shop."
        ),
        "about_project": (
            "NordWald betreibt 18 Outdoor-Filialen in Deutschland, Österreich und der Schweiz. "
            "Der alte Magento-Shop war langsam, intransparent und konnte Filialbestände nicht "
            "live anzeigen.\n\n"
            "Wir bauten einen Headless-Shop auf Next.js + Commerce-Backend mit:\n"
            "• Live-Filialbeständen via SAP-Schnittstelle\n"
            "• Click & Collect mit GPS-Filialsuche\n"
            "• AR-Produktvorschau (Schuhe, Zelte)\n"
            "• Personalisierte Empfehlungen via Vector-Search\n"
            "• Stripe / Klarna / TWINT / SEPA als Zahlungswege"
        ),
        "challenge": (
            "Saisonale Peak-Loads (Black Friday, Wintersaison) brachten das Magento-System "
            "regelmäßig zum Erliegen. Checkout-Abbruch-Rate lag bei 47%. Filialbestände waren "
            "nur einmal pro Nacht aktuell — Frust für Click-&-Collect-Kunden."
        ),
        "solution": (
            "Next.js 15 mit React Server Components, Edge-Rendering auf Vercel, Commerce-Layer "
            "von commercetools. Pricing & Promotions in einem dedizierten Microservice, "
            "Embeddings für Suche & Empfehlung über pgvector."
        ),
        "outcome": (
            "Checkout-Abbruch von 47% auf 13% gesenkt. Lighthouse-Performance 96+. "
            "Black-Friday-Umsatz 2024: +73% YoY ohne Downtime."
        ),
        "process_steps": [
            {"title": "Analyse & KPIs", "description": "Funnel-Analyse, Heatmaps, 32 Kundeninterviews. KPI-Tree mit Geschäftsleitung verabschiedet.", "icon": "Search"},
            {"title": "Headless-Architektur", "description": "Next.js + commercetools + SAP-Adapter. CDN-Strategie für 15 Länder.", "icon": "Layers"},
            {"title": "Komponenten-Library", "description": "Design-System in Figma + Storybook. 84 Komponenten, dokumentiert und getestet.", "icon": "Palette"},
            {"title": "Migration & A/B-Rollout", "description": "Daten- und SEO-Migration von Magento. Schrittweiser Traffic-Shift via Edge-Routing.", "icon": "GitBranch"},
            {"title": "Wachstums-Sprints", "description": "Wöchentliche Conversion-Experimente, monatliche Performance-Reviews.", "icon": "TrendingUp"},
        ],
        "tags": ["Next.js", "Headless", "E-Commerce", "Stripe"],
        "tech_stack": ["Next.js 15", "TypeScript", "commercetools", "PostgreSQL", "Stripe", "Vercel", "SAP"],
        "tech_stack_detailed": [
            {"name": "Next.js", "logo": "https://cdn.simpleicons.org/nextdotjs"},
            {"name": "TypeScript", "logo": "https://cdn.simpleicons.org/typescript"},
            {"name": "Stripe", "logo": "https://cdn.simpleicons.org/stripe"},
            {"name": "PostgreSQL", "logo": "https://cdn.simpleicons.org/postgresql"},
            {"name": "Vercel", "logo": "https://cdn.simpleicons.org/vercel"},
            {"name": "Figma", "logo": "https://cdn.simpleicons.org/figma"},
        ],
        "metrics": [
            {"label": "Checkout-Rate", "value": "+261%"},
            {"label": "Lighthouse Score", "value": "96+"},
            {"label": "Bestellungen / Saison", "value": "240k+"},
        ],
        "cover_image": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1600&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=1400&q=80",
            "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1400&q=80",
        ],
        "website_url": None,
        "testimonial_quote": (
            "Wir hatten Angst vor einer Shop-Migration. Zebick hat den Rollout so präzise geplant, "
            "dass wir bei laufendem Geschäft umgezogen sind — ohne einen einzigen Tag Umsatzverlust."
        ),
        "testimonial_author": "Markus Eberhardt",
        "testimonial_position": "Geschäftsführer, NordWald GmbH",
        "testimonial_rating": 5,
        "testimonial_avatar": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
        "featured": True,
        "order": 3,
    },

    # ===========================================================
    # 4. KI / CHATBOT — Vorarlberg Tourismus
    # ===========================================================
    {
        "title": "Vorarlberg Tourismus — KI-Reise-Assistent",
        "subtitle": "Multilingualer KI-Concierge mit Buchungsanbindung",
        "category": "Chatbot & KI",
        "service_id": "chatbot",
        "client": "Vorarlberg Tourismus GmbH",
        "year": "2025",
        "duration": "4 Monate",
        "website_type": "KI-Chatbot mit Booking-Layer",
        "description": (
            "GPT-gestützter Reise-Assistent in 7 Sprachen, der Hotels, Skipässe und Erlebnisse "
            "kontextsensitiv vorschlägt und direkt im Chat bucht."
        ),
        "about_project": (
            "Vorarlberg Tourismus wollte die Buchungsstrecke radikal vereinfachen. "
            "Statt 'Hotel finden → Skipass kaufen → Skischule buchen' in drei separaten Tools "
            "führt der KI-Assistent durch ein Gespräch.\n\n"
            "• OpenAI GPT-5.2 für die Konversation\n"
            "• RAG (Retrieval-Augmented Generation) auf 4.200 lokalen Erlebnis-Dokumenten\n"
            "• Direkte Anbindung an FeratelDeskline + Liftgesellschaften\n"
            "• Sprachen: DE, EN, FR, IT, NL, ES, PT\n"
            "• Stripe-Checkout direkt im Chat-Fenster"
        ),
        "challenge": (
            "Konversionsrate bei Online-Buchungen lag unter 1.2%. Multi-Komponenten-Pakete "
            "(Hotel + Skipass + Skischule) wurden quasi nie gebucht, weil der Prozess zu komplex war."
        ),
        "solution": (
            "GPT-5.2 als Konversations-Engine, eigene Function-Calling-Layer für strukturierte "
            "Aktionen (Suchen, Buchen, Bezahlen). Pinecone-Vector-DB mit semantischer Suche, "
            "feingranulares Caching für Latenz <800ms."
        ),
        "outcome": (
            "Konversionsrate: 1.2% → 6.8%. Multi-Komponenten-Buchungen +340%. "
            "Verweildauer im Chat: durchschnittlich 9.4 Minuten."
        ),
        "process_steps": [
            {"title": "Prompt- & Persona-Design", "description": "Voice & Tone der Marke in System-Prompts gegossen. 120 Beispiel-Dialoge kuratiert.", "icon": "MessageSquare"},
            {"title": "Knowledge-Base & RAG", "description": "Embeddings für 4.200 Dokumente, automatisierter Update-Job alle 4 h.", "icon": "Database"},
            {"title": "Booking-Integration", "description": "Function-Calling für Hotelsuche, Liftpässe, Skischulen. Stripe-Hosted-Checkout im Chat.", "icon": "Link"},
            {"title": "Multilingual-Tests", "description": "Tests durch Native-Speaker in 7 Sprachen. Edge-Cases dokumentiert.", "icon": "Globe"},
            {"title": "Monitoring & Optimierung", "description": "LangSmith-Tracing, A/B-Tests auf Prompts, wöchentliche Re-Evaluations.", "icon": "Activity"},
        ],
        "tags": ["GPT", "RAG", "Tourism", "Booking"],
        "tech_stack": ["OpenAI GPT-5.2", "Python", "FastAPI", "Pinecone", "PostgreSQL", "Stripe", "Vercel"],
        "tech_stack_detailed": [
            {"name": "OpenAI", "logo": "https://cdn.simpleicons.org/openaigym"},
            {"name": "Python", "logo": "https://cdn.simpleicons.org/python"},
            {"name": "FastAPI", "logo": "https://cdn.simpleicons.org/fastapi"},
            {"name": "Pinecone"},
            {"name": "PostgreSQL", "logo": "https://cdn.simpleicons.org/postgresql"},
            {"name": "Stripe", "logo": "https://cdn.simpleicons.org/stripe"},
        ],
        "metrics": [
            {"label": "Konversionsrate", "value": "1.2% → 6.8%"},
            {"label": "Multi-Buchungen", "value": "+340%"},
            {"label": "Sprachen", "value": "7"},
        ],
        "cover_image": "https://images.unsplash.com/photo-1694903089438-bf28d4697d9a?w=1600&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1551524559-8af4e6624178?w=1400&q=80",
            "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1400&q=80",
        ],
        "website_url": None,
        "testimonial_quote": (
            "Gäste sagen uns, das Buchen fühle sich an, als würden sie mit einer echten "
            "Reiseberaterin sprechen — nur ohne Wartezeit. Genau das war unser Ziel."
        ),
        "testimonial_author": "Sabine Lechner",
        "testimonial_position": "Head of Digital, Vorarlberg Tourismus",
        "testimonial_rating": 5,
        "testimonial_avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
        "featured": True,
        "order": 4,
    },

    # ===========================================================
    # 5. INDUSTRIAL IoT — Rheinwerk Manufacturing
    # ===========================================================
    {
        "title": "Rheinwerk — Industrial IoT Plattform",
        "subtitle": "Predictive Maintenance für 320 CNC-Maschinen",
        "category": "Server & Systeme",
        "service_id": "server-systems",
        "client": "Rheinwerk Präzisionstechnik GmbH",
        "year": "2024",
        "duration": "11 Monate",
        "website_type": "IoT-Plattform & Dashboard",
        "description": (
            "Predictive-Maintenance-Plattform für 320 CNC-Maschinen in 4 Werken. "
            "Reduziert ungeplante Ausfälle um 78% und spart 1.4 Mio. € jährlich."
        ),
        "about_project": (
            "Rheinwerk produziert Präzisionsteile für die Automobilindustrie. "
            "Ein Maschinenausfall in der Spitzenproduktion kostet 4.000 € / Stunde.\n\n"
            "Wir entwickelten eine vollständige IoT-Plattform:\n"
            "• 1.200 Sensoren (Vibration, Temperatur, Strom, Acoustic Emission)\n"
            "• Edge-Compute auf NVIDIA Jetson direkt an der Maschine\n"
            "• ML-Modelle (LSTM, Isolation Forest) für Anomalie-Erkennung\n"
            "• Time-Series-DB (TimescaleDB) mit 8 Mrd. Datenpunkten\n"
            "• Echtzeit-Dashboard für Schichtleiter und Instandhaltung"
        ),
        "challenge": (
            "Ungeplante Maschinenausfälle kosteten Rheinwerk jährlich 1.8 Mio. €. "
            "Die bestehende SCADA-Lösung war proprietär, schlecht dokumentiert und "
            "lieferte keine Vorhersagen — nur reaktive Alarme."
        ),
        "solution": (
            "OPC-UA-basierte Datensammlung, Edge-AI mit ONNX-Runtime auf Jetson Nano. "
            "Backend in Go (für Durchsatz), Time-Series-DB TimescaleDB, "
            "Modell-Training via MLflow-Pipelines auf hauseigenen GPU-Servern."
        ),
        "outcome": (
            "Ungeplante Ausfälle: -78%. Wartungskosten: -34%. "
            "ROI nach 14 Monaten erreicht. Plattform skaliert auf 3 weitere Werke."
        ),
        "process_steps": [
            {"title": "Sensor- & Daten-Audit", "description": "Inventarisierung der bestehenden SCADA, Identifikation der besten Sensoren pro Maschinentyp.", "icon": "Search"},
            {"title": "Pilot in Werk Köln", "description": "32 Maschinen instrumentiert. 3 Monate Datensammlung für Baseline-Modelle.", "icon": "Server"},
            {"title": "ML-Modellierung", "description": "Anomalie-Modelle pro Maschinentyp. False-Positive-Rate auf <2% optimiert.", "icon": "Brain"},
            {"title": "Edge-Deployment", "description": "Modell-Rollout auf 320 Edge-Devices via GitOps. OTA-Updates ohne Produktionsstopp.", "icon": "Cpu"},
            {"title": "Schulung & Übergabe", "description": "Trainings für 48 Instandhalter, Runbooks, 24/7-SLA für die ersten 12 Monate.", "icon": "GraduationCap"},
        ],
        "tags": ["IoT", "Predictive Maintenance", "Edge AI", "Manufacturing"],
        "tech_stack": ["Go", "Python", "TimescaleDB", "ONNX", "Kubernetes", "Grafana", "NVIDIA Jetson"],
        "tech_stack_detailed": [
            {"name": "Go", "logo": "https://cdn.simpleicons.org/go"},
            {"name": "Python", "logo": "https://cdn.simpleicons.org/python"},
            {"name": "Kubernetes", "logo": "https://cdn.simpleicons.org/kubernetes"},
            {"name": "Grafana", "logo": "https://cdn.simpleicons.org/grafana"},
            {"name": "NVIDIA", "logo": "https://cdn.simpleicons.org/nvidia"},
            {"name": "ONNX", "logo": "https://cdn.simpleicons.org/onnx"},
        ],
        "metrics": [
            {"label": "Ungeplante Ausfälle", "value": "−78%"},
            {"label": "Jährliche Einsparung", "value": "1.4 Mio. €"},
            {"label": "Sensoren live", "value": "1 200"},
        ],
        "cover_image": "https://images.unsplash.com/photo-1565514020179-026b92b84bb6?w=1600&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1400&q=80",
            "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=1400&q=80",
        ],
        "website_url": None,
        "testimonial_quote": (
            "Zebick hat den Übergang von reaktiver Wartung zu Predictive Maintenance möglich gemacht. "
            "Unsere Schichtleiter vertrauen den Vorhersagen — und das ist die schwerste Hürde."
        ),
        "testimonial_author": "Ing. Stefan Wagner",
        "testimonial_position": "Produktionsleiter, Rheinwerk",
        "testimonial_rating": 5,
        "testimonial_avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face",
        "featured": False,
        "order": 5,
    },

    # ===========================================================
    # 6. UI/UX REDESIGN — BernCity Stadtwerke
    # ===========================================================
    {
        "title": "BernCity Stadtwerke — Customer Portal",
        "subtitle": "Vollständiges Redesign mit barrierefreier Bürger-UX",
        "category": "UI/UX Design",
        "service_id": "ui-ux",
        "client": "BernCity Stadtwerke AG",
        "year": "2024",
        "duration": "5 Monate",
        "website_type": "Bürger-Portal & Self-Service",
        "description": (
            "Vollständiges UX-Redesign des Bürgerportals mit 280.000 Nutzern. "
            "Barrierefrei nach WCAG 2.2 AA, Service-Requests in 3 Klicks statt 12."
        ),
        "about_project": (
            "Das alte Portal stammte aus 2012 und war für die Stadtwerke ein PR-Problem. "
            "Wir machten eine fundamentale Neuerfindung — vom ersten User-Interview "
            "bis zur Übergabe-fähigen Design-Library.\n\n"
            "• 18 Service-Flows neu strukturiert (Anmelden, Abmelden, Tarifwechsel, …)\n"
            "• 142-Komponenten-Library in Figma, vollständig getoken-basiert\n"
            "• WCAG-2.2-AA-konform inkl. Screenreader-Tests mit echten Nutzern\n"
            "• Mobile-First: 71% der Nutzer kommen vom Smartphone\n"
            "• Design-Tokens als Single Source of Truth (Figma + Code-Gen)"
        ),
        "challenge": (
            "Der durchschnittliche Service-Request dauerte 11 Minuten und 12 Klicks. "
            "23% der Nutzer brachen ab, der Call-Center wurde mit Anfragen geflutet. "
            "Ältere und sehbeeinträchtigte Bürger waren faktisch vom Portal ausgeschlossen."
        ),
        "solution": (
            "User-Centered Redesign mit 38 Interviews, 5 Usability-Studien und 12 Iterationen. "
            "Mobile-First-Design, klare Informationsarchitektur, neue Service-Sprache. "
            "Token-basierte Design-Library nahtlos mit dem React-Frontend des Entwicklungs-Teams verzahnt."
        ),
        "outcome": (
            "Service-Abschluss in 3 Klicks (Durchschnitt). Call-Center-Anrufe: -41%. "
            "Bürger-Zufriedenheits-Score: 3.1 → 4.6 / 5."
        ),
        "process_steps": [
            {"title": "Stakeholder-Workshops", "description": "Geschäftsleitung, Service-Center, IT, Bürger-Vertretung in einem Raum. Vision definiert.", "icon": "Users"},
            {"title": "User Research", "description": "38 Interviews, 12 Contextual-Inquiries bei Bürgern zu Hause. Personas validiert.", "icon": "Search"},
            {"title": "Informationsarchitektur", "description": "Card-Sorting, Tree-Testing, neuer Navigations-Baum. Service-Sprache vereinheitlicht.", "icon": "GitBranch"},
            {"title": "Design-System", "description": "Tokens, Komponenten, Patterns in Figma. Storybook-Spiegelbild im Code.", "icon": "Palette"},
            {"title": "Accessibility-Audit", "description": "WCAG-2.2-AA-Audit durch externe Stelle, Screenreader-Tests mit blinden Probanden.", "icon": "ShieldCheck"},
        ],
        "tags": ["UI/UX", "Design System", "Accessibility", "Public Sector"],
        "tech_stack": ["Figma", "Storybook", "React", "Tailwind", "Tokens Studio"],
        "tech_stack_detailed": [
            {"name": "Figma", "logo": "https://cdn.simpleicons.org/figma"},
            {"name": "Storybook", "logo": "https://cdn.simpleicons.org/storybook"},
            {"name": "React", "logo": "https://cdn.simpleicons.org/react"},
            {"name": "Tailwind", "logo": "https://cdn.simpleicons.org/tailwindcss"},
        ],
        "metrics": [
            {"label": "Klicks bis Abschluss", "value": "12 → 3"},
            {"label": "Call-Center-Anrufe", "value": "−41%"},
            {"label": "Zufriedenheit", "value": "3.1 → 4.6"},
        ],
        "cover_image": "https://images.unsplash.com/photo-1559028012-481c04fa702d?w=1600&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=1400&q=80",
            "https://images.unsplash.com/photo-1559028006-448665bd7c7f?w=1400&q=80",
        ],
        "website_url": None,
        "testimonial_quote": (
            "Die Zahl der Beschwerdebriefe im Bereich 'Portal' ist auf nahezu null gefallen. "
            "Wir bekommen jetzt Lob — als Stadtwerk. Das war früher undenkbar."
        ),
        "testimonial_author": "Petra Hauser",
        "testimonial_position": "Leiterin Kundenbetreuung, BernCity",
        "testimonial_rating": 5,
        "testimonial_avatar": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
        "featured": False,
        "order": 6,
    },

    # ===========================================================
    # 7. CYBER SECURITY — Stadtwerke Mainz
    # ===========================================================
    {
        "title": "Stadtwerke Mainz — KRITIS-Härtung",
        "subtitle": "Pentesting & SOC-Aufbau für kritische Infrastruktur",
        "category": "Cyber Security",
        "service_id": "cyber-security",
        "client": "Stadtwerke Mainz AG",
        "year": "2025",
        "duration": "7 Monate",
        "website_type": "Cyber-Security-Engagement",
        "description": (
            "Umfassende Sicherheits-Härtung eines KRITIS-Betreibers: Pentest, SOC-Aufbau, "
            "Incident-Response-Playbooks und ISO-27001-Vorbereitung."
        ),
        "about_project": (
            "Stadtwerke Mainz versorgen 220.000 Menschen mit Strom, Wasser und Wärme. "
            "Als KRITIS-Betreiber unterliegen sie BSIG §8a und müssen alle 2 Jahre Sicherheit nachweisen.\n\n"
            "Unser Engagement umfasste:\n"
            "• Red-Team-Engagement über 8 Wochen (Initial Access bis Domain Admin)\n"
            "• Aufbau eines internen SOC mit 4 Analysten\n"
            "• 23 Incident-Response-Playbooks (Ransomware, Phishing, OT-Sabotage, …)\n"
            "• Härtung der OT/IT-Trennung mit echten Diodes\n"
            "• Vorbereitung & Begleitung der ISO-27001-Zertifizierung"
        ),
        "challenge": (
            "Audit aus 2023 zeigte 31 mittlere und 9 kritische Findings. "
            "Die nächste BSI-Prüfung stand in 9 Monaten an. "
            "Es gab kein internes SOC, Logs wurden nicht ausgewertet, "
            "und die Trennung zwischen Office-IT und Leitsystem war nur logisch — nicht physikalisch."
        ),
        "solution": (
            "Wir kombinierten offensives Testing (Red Team) mit defensivem Aufbau (Blue Team). "
            "SIEM (Wazuh + Elastic), Endpoint-Detection (Crowdstrike), "
            "Netzwerk-Segmentierung mit dedizierten Datendioden für die OT-Seite."
        ),
        "outcome": (
            "Alle 9 kritischen Findings geschlossen. ISO-27001-Zertifikat erteilt. "
            "BSI-Audit 2025: 0 mittlere oder kritische Findings."
        ),
        "process_steps": [
            {"title": "Threat-Modelling", "description": "STRIDE & MITRE-ATT&CK-basierte Analyse. Crown-Jewels identifiziert.", "icon": "Shield"},
            {"title": "Red Team Engagement", "description": "8-Wochen-Engagement, OPSEC-konform. Reporting in Echtzeit an CISO.", "icon": "Skull"},
            {"title": "SOC-Aufbau", "description": "Tooling-Auswahl, Schulung von 4 Analysten, Runbooks, On-Call-Plan.", "icon": "Activity"},
            {"title": "OT-Härtung", "description": "Datendioden, Netzwerk-Segmentierung, IDS für ICS-Protokolle.", "icon": "ServerCog"},
            {"title": "ISO-27001-Audit", "description": "Dokumentation, Risikomanagement, Auditbegleitung bis Zertifikat.", "icon": "Award"},
        ],
        "tags": ["Cyber Security", "KRITIS", "Pentest", "ISO 27001", "SOC"],
        "tech_stack": ["Wazuh", "Elastic", "Crowdstrike", "Burp Suite", "Metasploit", "MISP"],
        "tech_stack_detailed": [
            {"name": "Elastic", "logo": "https://cdn.simpleicons.org/elastic"},
            {"name": "Wazuh"},
            {"name": "Crowdstrike"},
            {"name": "Kali Linux", "logo": "https://cdn.simpleicons.org/kalilinux"},
            {"name": "OWASP", "logo": "https://cdn.simpleicons.org/owasp"},
        ],
        "metrics": [
            {"label": "Kritische Findings", "value": "9 → 0"},
            {"label": "ISO-27001", "value": "Zertifiziert"},
            {"label": "SOC-Analysten geschult", "value": "4"},
        ],
        "cover_image": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1600&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=1400&q=80",
            "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1400&q=80",
        ],
        "website_url": None,
        "testimonial_quote": (
            "Wir sind nach dem Engagement ein anderes Unternehmen. Unsere Reife in Cyber-Security "
            "ist messbar gestiegen — und unsere Mitarbeiter wissen jetzt, wie sie reagieren sollen."
        ),
        "testimonial_author": "Dr. Tobias Renner",
        "testimonial_position": "CISO, Stadtwerke Mainz",
        "testimonial_rating": 5,
        "testimonial_avatar": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=face",
        "featured": False,
        "order": 7,
    },
]
