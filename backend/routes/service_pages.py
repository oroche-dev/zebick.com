"""Service-Page-Content: Pricing, Industries, Tools – pro Service-Slug editierbar."""

import logging
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field, field_validator

from security import db, audit_log, get_current_user, sanitize_text

logger = logging.getLogger("zebick.service_pages")
router = APIRouter(prefix="/api")


# ============== Constants ==============

SERVICE_SLUGS = [
    {"slug": "web-development",       "name": "Webentwicklung"},
    {"slug": "app-development",       "name": "App-Entwicklung"},
    {"slug": "cyber-security",        "name": "Cyber Security"},
    {"slug": "chatbot-development",   "name": "Chatbot-Entwicklung"},
    {"slug": "server-development",    "name": "Server & DevOps"},
    {"slug": "marketing-seo",         "name": "Marketing & SEO"},
    {"slug": "gaming",                "name": "Gaming-Entwicklung"},
    {"slug": "ui-ux",                 "name": "UI/UX Design"},
    {"slug": "graphic-design",        "name": "Grafikdesign"},
    {"slug": "automatisierung-ki",    "name": "Automatisierung & KI"},
    {"slug": "tools",                 "name": "Kostenlose Analyse / Tools"},
]


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# ============== Models ==============

class HeroStat(BaseModel):
    value: str = Field(min_length=1, max_length=40)
    label: str = Field(min_length=1, max_length=120)


class HeroBlock(BaseModel):
    badge: Optional[str] = Field(None, max_length=120)
    title: Optional[str] = Field(None, max_length=300)
    subtitle: Optional[str] = Field(None, max_length=800)
    stats: List[HeroStat] = Field(default_factory=list)

    @field_validator("badge", "title", "subtitle")
    @classmethod
    def _strip_html(cls, v):
        return sanitize_text(v, 800) if v else v


class AboutBlock(BaseModel):
    enabled: bool = True
    heading: Optional[str] = Field(None, max_length=200)
    body: Optional[str] = Field(None, max_length=4000)

    @field_validator("heading", "body")
    @classmethod
    def _strip_html(cls, v):
        return sanitize_text(v, 4000) if v else v


class IndustryItem(BaseModel):
    icon: Optional[str] = Field(None, max_length=40)
    title: str = Field(min_length=1, max_length=120)
    tag: Optional[str] = Field(None, max_length=80)
    desc: str = Field(min_length=1, max_length=400)
    img: Optional[str] = Field(None, max_length=600)

    @field_validator("title", "tag", "desc")
    @classmethod
    def _strip_html(cls, v):
        return sanitize_text(v, 400) if v else v


class IndustriesBlock(BaseModel):
    enabled: bool = True
    heading: Optional[str] = Field(None, max_length=200)
    subtitle: Optional[str] = Field(None, max_length=400)
    items: List[IndustryItem] = Field(default_factory=list)

    @field_validator("heading", "subtitle")
    @classmethod
    def _strip_html(cls, v):
        return sanitize_text(v, 400) if v else v


class BenefitItem(BaseModel):
    icon: Optional[str] = Field(None, max_length=40)
    title: str = Field(min_length=1, max_length=120)
    desc: str = Field(min_length=1, max_length=400)
    points: List[str] = Field(default_factory=list)

    @field_validator("title", "desc")
    @classmethod
    def _strip_html(cls, v):
        return sanitize_text(v, 400) if v else v


class BenefitsBlock(BaseModel):
    enabled: bool = True
    heading: Optional[str] = Field(None, max_length=200)
    subtitle: Optional[str] = Field(None, max_length=400)
    items: List[BenefitItem] = Field(default_factory=list)

    @field_validator("heading", "subtitle")
    @classmethod
    def _strip_html(cls, v):
        return sanitize_text(v, 400) if v else v


class FaqItem(BaseModel):
    q: str = Field(min_length=1, max_length=300)
    a: str = Field(min_length=1, max_length=2000)

    @field_validator("q", "a")
    @classmethod
    def _strip_html(cls, v):
        return sanitize_text(v, 2000) if v else v


class FaqBlock(BaseModel):
    enabled: bool = True
    heading: Optional[str] = Field(None, max_length=200)
    items: List[FaqItem] = Field(default_factory=list)

    @field_validator("heading")
    @classmethod
    def _strip_html(cls, v):
        return sanitize_text(v, 200) if v else v


class PricingTier(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    price: str = Field(min_length=1, max_length=80)
    tag: Optional[str] = Field(None, max_length=120)
    highlight: bool = False
    features: List[str] = Field(default_factory=list)

    @field_validator("name", "price", "tag")
    @classmethod
    def _strip_html(cls, v):
        return sanitize_text(v, 120) if v else v


class ServicePageContentIn(BaseModel):
    pricing: Optional[List[PricingTier]] = None
    pricing_enabled: Optional[bool] = None
    pricing_heading: Optional[str] = Field(None, max_length=200)
    pricing_subtitle: Optional[str] = Field(None, max_length=400)
    # Industries section ("Sicherheit für jede Branche" etc.)
    industries: Optional[List[IndustryItem]] = None
    industries_enabled: Optional[bool] = None
    industries_heading: Optional[str] = Field(None, max_length=200)
    industries_subtitle: Optional[str] = Field(None, max_length=400)
    hero: Optional[HeroBlock] = None
    about: Optional[AboutBlock] = None
    benefits: Optional[BenefitsBlock] = None
    faqs: Optional[FaqBlock] = None
    # ToolsPage-spezifisch:
    tools: Optional[List[Dict[str, Any]]] = None
    calculator_base: Optional[Dict[str, float]] = None
    calculator_features: Optional[Dict[str, float]] = None

    @field_validator("pricing_heading", "pricing_subtitle", "industries_heading", "industries_subtitle")
    @classmethod
    def _strip_html(cls, v):
        return sanitize_text(v, 400) if v else v


def _seed_defaults() -> Dict[str, Dict[str, Any]]:
    """Aktuelle Preise aus den JSX-Seiten als Seed."""
    return {
        "cyber-security": {
            "pricing_enabled": True,
            "pricing_heading": "Transparente Sicherheits-Pakete",
            "pricing_subtitle": "Vom schnellen Schwachstellen-Scan bis zum 24/7 SOC – wählen Sie das passende Sicherheitsniveau.",
            "pricing": [
                {"name": "Basis-Check", "price": "ab 1.900€", "tag": "Für den Einstieg", "highlight": False,
                 "features": ["Externer Schwachstellen-Scan", "OWASP-Top-10-Prüfung (Web)", "Management-Summary-Report", "Priorisierte Handlungsempfehlungen", "Abschlussgespräch"]},
                {"name": "Business-Schutz", "price": "ab 6.900€", "tag": "Beliebteste Wahl", "highlight": True,
                 "features": ["Vollständiger Penetration Test", "Web-, App- & Netzwerk-Tests", "Detaillierter technischer Bericht", "Kostenloser Re-Test inklusive", "Cloud-Hardening-Beratung", "Compliance-Check (DSGVO/ISO)"]},
                {"name": "Enterprise-SOC", "price": "individuell", "tag": "Für maximale Sicherheit", "highlight": False,
                 "features": ["24/7 SOC-Monitoring", "Incident Response mit SLA", "Red Teaming & Threat Hunting", "Security Awareness Programm", "Dedizierter Ansprechpartner", "Quartalsweise Audits & Reports"]},
            ],
            "industries_enabled": True,
            "industries_heading": "Sicherheit für jede Branche",
            "industries_subtitle": "Jede Branche hat eigene Bedrohungen und Compliance-Anforderungen – wir kennen sie alle.",
            "industries": [
                {"icon": "Landmark",    "title": "Finanzwesen",      "tag": "Finance",     "desc": "Banken, FinTechs & Versicherungen: PCI-DSS-konforme Absicherung sensibler Transaktionen.", "img": "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=900&q=80&auto=format&fit=crop"},
                {"icon": "HeartPulse",  "title": "Gesundheitswesen", "tag": "Healthcare",  "desc": "Kliniken & Praxen: Schutz von Patientendaten – DSGVO- und compliance-konform.", "img": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&q=80&auto=format&fit=crop"},
                {"icon": "ShoppingBag", "title": "E-Commerce",       "tag": "Retail",      "desc": "Online-Shops: Schutz vor Fraud, Bot-Angriffen und Datendiebstahl im Checkout.", "img": "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=900&q=80&auto=format&fit=crop"},
                {"icon": "Factory",     "title": "Industrie & OT",   "tag": "Industry",    "desc": "Produktion & Anlagen: Absicherung von OT/ICS-Umgebungen gegen Sabotage.", "img": "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=900&q=80&auto=format&fit=crop"},
                {"icon": "Building2",   "title": "Behörden",         "tag": "Public",      "desc": "Öffentliche Hand: BSI-Grundschutz und höchste Anforderungen an Datenschutz.", "img": "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=900&q=80&auto=format&fit=crop"},
                {"icon": "Briefcase",   "title": "KMU",              "tag": "Business",    "desc": "Mittelstand: Pragmatischer, bezahlbarer Schutz gegen Ransomware & Phishing.", "img": "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=900&q=80&auto=format&fit=crop"},
            ],
        },
        "app-development": {
            "pricing_enabled": True,
            "pricing_heading": "Preise & Pakete",
            "pricing_subtitle": "Vom Prototyp bis zur skalierbaren App – wählen Sie das Paket, das zu Ihrer Idee passt.",
            "pricing": [
                {"name": "Starter", "price": "ab 7.900€", "tag": "Für Ideen-Validierung", "highlight": False,
                 "features": ["Single-Platform-App (iOS oder Android)", "Bis zu 5 Hauptscreens", "Standard UI-Kit", "Basis-Funktionen ohne Backend", "Store-Veröffentlichung", "3 Monate Support"]},
                {"name": "Business", "price": "ab 19.900€", "tag": "Beliebteste Wahl", "highlight": True,
                 "features": ["Cross-Platform (iOS + Android)", "Bis zu 15 Screens, Custom Design", "Backend-Anbindung & APIs", "Push-Notifications & Analytics", "App Store + Google Play", "12 Monate Support", "Performance-Monitoring"]},
                {"name": "Premium", "price": "individuell", "tag": "Für anspruchsvolle Projekte", "highlight": False,
                 "features": ["Native oder Hybrid-Architektur", "Unbegrenzte Screens & Animations", "Skalierbare Cloud-Infrastruktur", "DevOps & CI/CD", "Dedicated Team", "SLA & Priority-Support"]},
            ],
        },
        "gaming": {
            "pricing_enabled": True,
            "pricing_heading": "Preise & Pakete",
            "pricing_subtitle": "Vom spielbaren Prototyp bis zum Live-Service-Game – wählen Sie Ihren Game-Dev-Partner.",
            "pricing": [
                {"name": "Indie-Prototyp", "price": "ab 4.900€", "tag": "Für den Start", "highlight": False,
                 "features": ["Game-Konzept & GDD", "Spielbarer Prototyp", "Core-Loop & Mechaniken", "Eine Zielplattform", "Playtest & Feedback"]},
                {"name": "Game-Produktion", "price": "ab 24.900€", "tag": "Beliebteste Wahl", "highlight": True,
                 "features": ["Vollständige Spielentwicklung", "2D/3D-Art & Animation", "Multiplayer optional", "Cross-Platform Release", "QA & Balancing", "Store-Veröffentlichung"]},
                {"name": "Studio-Partnerschaft", "price": "individuell", "tag": "Für Live-Service", "highlight": False,
                 "features": ["Dediziertes Game-Team", "Live-Ops & Seasons", "Backend & Skalierung", "Monetarisierung", "Dedicated Producer", "Laufende Updates"]},
            ],
            "industries_enabled": True,
            "industries_heading": "Genres & Plattformen",
            "industries_subtitle": "Wir entwickeln für alle relevanten Plattformen und Spiel-Genres – von Mobile bis Konsole.",
            "industries": [
                {"icon": "Smartphone", "title": "Mobile Games",       "tag": "Mobile",     "desc": "Casual bis Hardcore – iOS & Android mit IAP, Ads und Live-Events.",            "img": "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=900&q=80&auto=format&fit=crop"},
                {"icon": "Monitor",    "title": "PC & Steam",         "tag": "PC",         "desc": "Premium-Erlebnisse für Steam & Epic – mit Workshop und Achievements.",          "img": "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=900&q=80&auto=format&fit=crop"},
                {"icon": "Gamepad2",   "title": "Console",            "tag": "Console",    "desc": "PlayStation, Xbox & Switch – zertifiziert und optimiert.",                       "img": "https://images.unsplash.com/photo-1486401899868-0e435ed85128?w=900&q=80&auto=format&fit=crop"},
                {"icon": "Users",      "title": "Multiplayer & Co-Op","tag": "Online",     "desc": "Real-time PvP & Co-Op mit Matchmaking, Ranglisten und Anti-Cheat.",              "img": "https://images.unsplash.com/photo-1542751110-97427bbecf20?w=900&q=80&auto=format&fit=crop"},
                {"icon": "Box",        "title": "AR / VR",            "tag": "Immersive",  "desc": "Quest, PCVR & AR – immersive Erlebnisse, die man wirklich fühlt.",                "img": "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=900&q=80&auto=format&fit=crop"},
                {"icon": "Globe",      "title": "WebGL Browser",      "tag": "Web",        "desc": "HTML5-Games, die sofort im Browser starten – ohne Installation.",                 "img": "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=900&q=80&auto=format&fit=crop"},
            ],
        },
        "graphic-design": {
            "pricing_enabled": True,
            "pricing_heading": "Preise & Pakete",
            "pricing_subtitle": "Vom Logo bis zum kompletten Branding-System.",
            "pricing": [
                {"name": "Logo & Basis", "price": "ab 690€", "tag": "Für den Start", "highlight": False,
                 "features": ["Logo-Design (3 Konzepte)", "Farb- & Schriftdefinition", "Logo in allen Dateiformaten", "2 Korrekturschleifen", "Nutzungsrechte inklusive"]},
                {"name": "Brand Paket", "price": "ab 2.400€", "tag": "Beliebteste Wahl", "highlight": True,
                 "features": ["Komplette Brand Identity", "Logo + Varianten", "Brand Guidelines (PDF)", "Visitenkarte & Briefpapier", "Social-Media-Templates", "Unbegrenzte Korrekturen"]},
                {"name": "Komplett-Branding", "price": "individuell", "tag": "Für maximale Wirkung", "highlight": False,
                 "features": ["Branding + Print + Digital", "Packaging oder Motion", "Umfassendes Brand Manual", "Foto-/Illustrations-Stil", "Dediziertes Designer-Team", "Langfristige Betreuung"]},
            ],
            "industries_enabled": True,
            "industries_heading": "Design für jede Disziplin",
            "industries_subtitle": "Von Brand-Identity bis Motion – wir gestalten konsistent über alle Touchpoints.",
            "industries": [
                {"icon": "PenTool",  "title": "Brand Identity",  "tag": "Branding",     "desc": "Komplette Markenauftritte – Logo, Farben, Typografie und Tonalität.",       "img": "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=900&q=80&auto=format&fit=crop"},
                {"icon": "BookOpen", "title": "Print Design",    "tag": "Print",        "desc": "Broschüren, Magazine, Plakate – haptisch hochwertig und druckfertig.",      "img": "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=900&q=80&auto=format&fit=crop"},
                {"icon": "Package",  "title": "Packaging",       "tag": "Verpackung",   "desc": "Verpackungsdesign, das im Regal auffällt und Ihre Marke erlebbar macht.",   "img": "https://images.unsplash.com/photo-1605733160314-4fc7dac4bb16?w=900&q=80&auto=format&fit=crop"},
                {"icon": "Share2",   "title": "Social Media",    "tag": "Digital",      "desc": "Konsistente, scroll-stoppende Designs für alle Social-Kanäle.",             "img": "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=900&q=80&auto=format&fit=crop"},
                {"icon": "Film",     "title": "Motion Graphics", "tag": "Motion",       "desc": "Animierte Logos, Clips und Erklärvideos für maximale Aufmerksamkeit.",      "img": "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=900&q=80&auto=format&fit=crop"},
                {"icon": "Brush",    "title": "Illustration",    "tag": "Illustration", "desc": "Individuelle Illustrationen und Icon-Sets mit unverwechselbarem Stil.",     "img": "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=900&q=80&auto=format&fit=crop"},
            ],
        },
        "marketing-seo": {
            "pricing_enabled": True,
            "pricing_heading": "Preise & Pakete",
            "pricing_subtitle": "Skalierbare Marketing-Pakete – vom SEO-Start bis zur Full-Service-Performance-Suite.",
            "pricing": [
                {"name": "Starter SEO", "price": "ab 890€", "tag": "pro Monat", "highlight": False,
                 "features": ["On-Page-SEO-Optimierung", "Keyword-Strategie", "Google Business Profil", "Monatliches Reporting", "E-Mail-Support"]},
                {"name": "Growth", "price": "ab 1.900€", "tag": "Beliebteste Wahl · pro Monat", "highlight": True,
                 "features": ["SEO + Google Ads", "Content-Erstellung", "Conversion-Optimierung", "GA4 & Tracking", "Social-Media-Kampagnen", "Priorisierter Support"]},
                {"name": "Performance", "price": "individuell", "tag": "Für Skalierung", "highlight": False,
                 "features": ["Voller Marketing-Mix", "Marketing-Automation", "Dediziertes Team", "Wöchentliche Strategie-Calls", "Custom Dashboards", "SLA & Reaktionszeiten"]},
            ],
            "industries_enabled": True,
            "industries_heading": "Marketing für jede Branche",
            "industries_subtitle": "Branchen-spezifische Strategien – für Shops, B2B, lokale Anbieter und mehr.",
            "industries": [
                {"icon": "ShoppingBag",      "title": "E-Commerce",         "tag": "Retail",      "desc": "Shopping-Ads, SEO und CRO für mehr Umsatz pro Besucher.",                "img": "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&q=80&auto=format&fit=crop"},
                {"icon": "Briefcase",        "title": "B2B & SaaS",         "tag": "Business",    "desc": "Lead-Gen über Content, LinkedIn und Google Ads mit langem Sales-Cycle.","img": "https://images.unsplash.com/photo-1552664730-d307ca884978?w=900&q=80&auto=format&fit=crop"},
                {"icon": "MapPin",           "title": "Lokale Unternehmen", "tag": "Local",       "desc": "Local SEO & Google Business für Kundschaft aus der Region.",            "img": "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=900&q=80&auto=format&fit=crop"},
                {"icon": "HeartPulse",       "title": "Gesundheit",         "tag": "Health",      "desc": "Vertrauensvolle Sichtbarkeit für Praxen, Kliniken und Health-Brands.",   "img": "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=900&q=80&auto=format&fit=crop"},
                {"icon": "Home",             "title": "Immobilien",         "tag": "Real Estate", "desc": "Leadstarke Kampagnen für Makler, Bauträger und Projektvertrieb.",       "img": "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=900&q=80&auto=format&fit=crop"},
                {"icon": "UtensilsCrossed",  "title": "Gastronomie",        "tag": "Food",        "desc": "Social Media & Local Ads, die Tische und Reservierungen füllen.",       "img": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&q=80&auto=format&fit=crop"},
            ],
        },
        "web-development": {
            "pricing_enabled": True,
            "pricing_heading": "Preise & Pakete",
            "pricing_subtitle": "Transparente Pakete – vom Landingpage-Sprint bis zur skalierbaren Plattform.",
            "pricing": [
                {"name": "Landingpage", "price": "ab 1.490€", "tag": "Schneller Start", "highlight": False,
                 "features": ["1 hochkonvertierende Seite", "Mobile-First & SEO-optimiert", "Kontaktformular & Analytics", "DSGVO-konform", "2 Korrekturschleifen", "Launch in 2 Wochen"]},
                {"name": "Business-Website", "price": "ab 4.900€", "tag": "Beliebteste Wahl", "highlight": True,
                 "features": ["Bis zu 10 Seiten", "Headless CMS (Strapi/Sanity)", "Custom Design + Animationen", "Performance-Optimiert", "SEO-Setup & GA4", "6 Monate Support inkl."]},
                {"name": "Plattform / SaaS", "price": "individuell", "tag": "Für komplexe Projekte", "highlight": False,
                 "features": ["Full-Stack Architektur", "Auth, Payments, Dashboards", "Skalierbares Hosting (AWS/GCP)", "DevOps & CI/CD", "Dediziertes Team", "SLA & Priority-Support"]},
            ],
        },
        "chatbot-development": {
            "pricing_enabled": True,
            "pricing_heading": "Preise & Pakete",
            "pricing_subtitle": "Vom FAQ-Bot bis zum vollwertigen KI-Agenten – passend zu Ihrem Anwendungsfall.",
            "pricing": [
                {"name": "FAQ-Bot", "price": "ab 1.490€", "tag": "Für den Einstieg", "highlight": False,
                 "features": ["Vordefinierte Q&A-Wissensbasis", "Website-Integration", "Lead-Capture-Formular", "DSGVO-konform", "1 Sprache", "3 Monate Support"]},
                {"name": "KI-Assistent", "price": "ab 5.900€", "tag": "Beliebteste Wahl", "highlight": True,
                 "features": ["LLM-basiert (GPT/Claude)", "RAG-Wissensbasis (PDFs, Docs)", "Multilingual", "CRM-Anbindung", "Custom Persona & Branding", "Conversation Analytics"]},
                {"name": "Agent-Suite", "price": "individuell", "tag": "Für Skalierung", "highlight": False,
                 "features": ["Multi-Channel (Web, WhatsApp, Slack)", "Tool-Calling & Automatisierung", "Voice-Bot optional", "Dediziertes Modell-Tuning", "SLA & Priority-Support", "Quartalsweise Optimierung"]},
            ],
        },
        "server-development": {
            "pricing_enabled": True,
            "pricing_heading": "Preise & Pakete",
            "pricing_subtitle": "Skalierbare Infrastruktur und DevOps – vom Setup bis zum 24/7-Betrieb.",
            "pricing": [
                {"name": "Setup & Migration", "price": "ab 2.900€", "tag": "Einmalig", "highlight": False,
                 "features": ["Cloud-Setup (AWS/GCP/Azure)", "Domain, SSL, DNS", "Container-Setup (Docker)", "Backup-Konzept", "Übergabe & Dokumentation"]},
                {"name": "DevOps-Paket", "price": "ab 1.490€", "tag": "Pro Monat · Beliebt", "highlight": True,
                 "features": ["CI/CD-Pipeline", "Monitoring & Alerts", "Auto-Scaling-Setup", "Wöchentliche Backups", "Sicherheits-Updates", "Notfall-Support 8×5"]},
                {"name": "Managed Operations", "price": "individuell", "tag": "Für Enterprise", "highlight": False,
                 "features": ["24/7-Monitoring & On-Call", "SLA mit Reaktionszeit", "Dediziertes DevOps-Team", "Kapazitäts-Planung", "Disaster Recovery", "Quartalsweise Review"]},
            ],
        },
        "ui-ux": {
            "pricing_enabled": True,
            "pricing_heading": "Preise & Pakete",
            "pricing_subtitle": "Design, das konvertiert – vom UX-Audit bis zum kompletten Designsystem.",
            "pricing": [
                {"name": "UX-Audit", "price": "ab 990€", "tag": "Quick-Win", "highlight": False,
                 "features": ["Heuristische Evaluation", "Conversion-Analyse", "Priorisierte Maßnahmen", "Click-Heatmap Report", "Abschluss-Workshop"]},
                {"name": "Produkt-Design", "price": "ab 4.900€", "tag": "Beliebteste Wahl", "highlight": True,
                 "features": ["User-Research & Personas", "Wireframes + High-Fi-Mockups", "Interaktiver Prototyp (Figma)", "Mobile + Desktop", "Designsystem-Basis", "Developer-Handoff"]},
                {"name": "Design-System", "price": "individuell", "tag": "Für Skalierung", "highlight": False,
                 "features": ["Komplettes Designsystem", "Token-Architektur", "Komponenten-Bibliothek", "Storybook-Setup", "Brand-Guidelines", "Ongoing Design-Partner"]},
            ],
        },
        "automatisierung-ki": {
            "pricing_enabled": True,
            "pricing_heading": "Preise & Pakete",
            "pricing_subtitle": "Von der ersten Automation bis zum KI-Agenten-Stack – modular und messbar.",
            "pricing": [
                {"name": "Quick-Automation", "price": "ab 1.490€", "tag": "Erster Workflow", "highlight": False,
                 "features": ["1 Workflow (z.B. n8n/Zapier)", "2 Tool-Integrationen", "Dokumentation & Übergabe", "30 Tage Support"]},
                {"name": "KI-Agent-Paket", "price": "ab 7.900€", "tag": "Beliebteste Wahl", "highlight": True,
                 "features": ["Custom KI-Agent (LLM + RAG)", "CRM-/ERP-Anbindung", "Mehrstufige Automationen", "Monitoring & Logging", "Personalisierte Trainings", "3 Monate Support"]},
                {"name": "Enterprise-Stack", "price": "individuell", "tag": "Voller Roll-out", "highlight": False,
                 "features": ["KI-Strategie-Beratung", "Multi-Agent-Architektur", "Self-Hosted-Optionen", "Compliance & Audit", "Dediziertes Team", "SLA & Priority-Support"]},
            ],
        },
        "tools": {
            "pricing_enabled": False,
            "tools": [
                {"id": "kostenrechner",  "title": "Website-Kostenrechner",     "desc": "Berechnen Sie in 30 Sekunden, was Ihre neue Website ungefähr kostet."},
                {"id": "website-check",  "title": "Kostenloser Website-Check", "desc": "Wir analysieren Ihre Website auf Performance, SEO und UX – kostenlos."},
                {"id": "seo-audit",      "title": "SEO-Audit",                 "desc": "Detaillierter SEO-Audit Ihrer Domain mit Quick-Wins und Roadmap."},
                {"id": "dsgvo-check",    "title": "DSGVO-Check",               "desc": "In 10 Fragen zur Datenschutz-Konformität Ihrer Website."},
                {"id": "ki-berater",     "title": "KI-Projektberater",         "desc": "Welche KI-/Automatisierungs-Lösung passt zu Ihrem Business?"},
                {"id": "erstgespraech",  "title": "Kostenloses Erstgespräch",  "desc": "30 Minuten unverbindliche Strategie-Session mit unseren Experten."},
            ],
            "calculator_base": {
                "landing":  1500.0,
                "business": 3500.0,
                "shop":     8000.0,
                "saas":    15000.0,
                "custom":  12000.0,
            },
            "calculator_features": {
                "cms":          1200.0,
                "shop":         5000.0,
                "multilang":    1800.0,
                "integrations": 2500.0,
                "ai":           3500.0,
                "design":       2200.0,
            },
        },
    }


async def seed_service_pages_if_empty() -> int:
    """Wird beim Startup aufgerufen – seeded fehlende Slugs und ergänzt Industries-Felder bei bestehenden Docs."""
    seed = _seed_defaults()
    inserted = 0
    for slug_info in SERVICE_SLUGS:
        slug = slug_info["slug"]
        existing = await db.service_pages.find_one({"slug": slug})
        defaults = seed.get(slug, {"pricing_enabled": False, "pricing": []})
        if existing:
            # Backfill: nur Industries-Felder ergänzen, wenn noch nicht vorhanden
            patch = {}
            if "industries" not in existing and defaults.get("industries"):
                patch["industries"] = defaults.get("industries", [])
                patch["industries_enabled"] = defaults.get("industries_enabled", False)
                patch["industries_heading"] = defaults.get("industries_heading", "Branchen")
                patch["industries_subtitle"] = defaults.get("industries_subtitle", "")
            if patch:
                patch["updated_at"] = _now_iso()
                await db.service_pages.update_one({"slug": slug}, {"$set": patch})
            continue
        doc = {
            "id": str(uuid.uuid4()),
            "slug": slug,
            "name": slug_info["name"],
            "pricing_enabled": defaults.get("pricing_enabled", True),
            "pricing_heading": defaults.get("pricing_heading", "Preise & Pakete"),
            "pricing_subtitle": defaults.get("pricing_subtitle", "Transparente, faire Preise – ohne versteckte Kosten."),
            "pricing": defaults.get("pricing", []),
            "industries_enabled": defaults.get("industries_enabled", False),
            "industries_heading": defaults.get("industries_heading", "Branchen"),
            "industries_subtitle": defaults.get("industries_subtitle", ""),
            "industries": defaults.get("industries", []),
            "tools": defaults.get("tools"),
            "calculator_base": defaults.get("calculator_base"),
            "calculator_features": defaults.get("calculator_features"),
            "created_at": _now_iso(),
            "updated_at": _now_iso(),
        }
        await db.service_pages.insert_one(doc)
        inserted += 1
    return inserted


def _strip_id(doc: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    if not doc:
        return None
    doc.pop("_id", None)
    return doc


# ============== ADMIN ==============

@router.get("/admin/service-pages")
async def admin_list_service_pages(current: dict = Depends(get_current_user)):
    rows = await db.service_pages.find({}, {"_id": 0}).sort("slug", 1).to_list(50)
    return {"total": len(rows), "service_pages": rows, "available_slugs": SERVICE_SLUGS}


@router.get("/admin/service-pages/{slug}")
async def admin_get_service_page(slug: str, current: dict = Depends(get_current_user)):
    doc = await db.service_pages.find_one({"slug": slug}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Service-Seite nicht gefunden")
    return doc


@router.put("/admin/service-pages/{slug}")
async def admin_upsert_service_page(
    slug: str, payload: ServicePageContentIn, request: Request,
    current: dict = Depends(get_current_user),
):
    updates = payload.model_dump(exclude_unset=True)
    if "pricing" in updates and updates["pricing"] is not None:
        updates["pricing"] = [p if isinstance(p, dict) else p.model_dump() for p in updates["pricing"]]
    if "industries" in updates and updates["industries"] is not None:
        updates["industries"] = [i if isinstance(i, dict) else i.model_dump() for i in updates["industries"]]
    updates["updated_at"] = _now_iso()
    name = next((s["name"] for s in SERVICE_SLUGS if s["slug"] == slug), slug)
    await db.service_pages.update_one(
        {"slug": slug},
        {"$set": updates, "$setOnInsert": {
            "id": str(uuid.uuid4()), "slug": slug, "name": name, "created_at": _now_iso(),
        }},
        upsert=True,
    )
    await audit_log("service_page_updated", current.get("email"), request,
                    {"slug": slug, "fields": list(updates.keys())})
    doc = await db.service_pages.find_one({"slug": slug}, {"_id": 0})
    return doc


# ============== PUBLIC ==============

@router.get("/service-pages/{slug}")
async def public_get_service_page(slug: str):
    doc = await db.service_pages.find_one({"slug": slug}, {"_id": 0})
    if not doc:
        return {"slug": slug, "pricing_enabled": False, "pricing": []}
    return doc
