import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  BrainCircuit,
  Database,
  Zap,
  ShieldCheck,
  Sparkles,
  Layers,
  TrendingUp,
  Clock,
  Smile,
  Lightbulb,
  Hammer,
  Bug,
  Rocket,
  RefreshCw,
  Mail,
  Send,
  Headphones,
  ShoppingCart,
  Monitor,
  Building2,
  HeartPulse,
  Plane,
  Landmark
} from 'lucide-react';
import Header from '../../components/layout/Header';
import ToolDock from '../../components/services/ToolDock';
import TypingCode from '../../components/services/TypingCode';
import ServiceTabsGrid from '../../components/services/ServiceTabsGrid';
import { StackShowcaseSection, StackCard, TechBelt } from '../../components/services/StackShowcase';
import Seo, { SITE_URL } from '../../components/common/Seo';
import RelatedServices from '../../components/services/RelatedServices';
import Footer from '../../components/layout/Footer';
import Chatbot from '../../components/chatbot/Chatbot';
import { ModernBenefits } from '../../components/services/ModernBenefits';
import { useSectionReveal } from '../../components/services/useSectionReveal';
import ModernTimeline from '../../components/services/ModernTimeline';
import ServiceContactForm from '../../components/services/ServiceContactForm';
import ServicePortfolioSection from '../../components/services/ServicePortfolioSection';
import ServiceIndustries from '../../components/services/ServiceIndustries';
import ServiceAdvisorBlock from '../../components/tools/ServiceAdvisorBlock';


// ------------ KI-Modelle (Grundlagen) ------------
const AI_MODELS = [
  { name: 'GPT-5', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/openai.svg', color: '#10A37F',
    desc: 'OpenAIs Spitzenmodell für menschlich natürliche Gespräche, Reasoning und Tool-Nutzung – die Basis vieler Premium-Bots.' },
  { name: 'Claude', logo: 'https://cdn.simpleicons.org/anthropic/FFFFFF', color: '#D97757',
    desc: 'Anthropics Modell mit langem Kontextfenster und starker Sicherheit – ideal für sensible Unternehmensdaten.' },
  { name: 'Gemini', logo: 'https://cdn.simpleicons.org/googlegemini/8E75F8', color: '#8E75F8',
    desc: 'Googles multimodales Modell – versteht Text, Bilder und Dokumente in einem einzigen Gespräch.' },
];

// ------------ Frameworks ------------
const AI_FRAMEWORKS = [
  { name: 'LangChain', logo: 'https://cdn.simpleicons.org/langchain/FFFFFF', color: '#1C3C3C',
    desc: 'Orchestriert LLMs, Tools und Speicher zu komplexen Agenten-Workflows – das Rückgrat moderner KI-Apps.' },
  { name: 'RAG', logo: 'https://cdn.simpleicons.org/databricks/FF3621', color: '#FF6B00',
    desc: 'Retrieval-Augmented Generation: Der Bot antwortet ausschließlich auf Basis Ihrer Daten – ohne Halluzinationen.' },
  { name: 'Rasa', logo: 'https://cdn.simpleicons.org/rasa/FFFFFF', color: '#5A17EE',
    desc: 'Open-Source-Framework für dialogorientierte Bots mit voller Datenkontrolle und On-Premise-Hosting.' },
];

// ------------ Einsatzbereiche (Tabelle) ------------
const USE_CASES = [
  { name: 'Kundenservice', logo: 'https://cdn.simpleicons.org/zendesk/FFFFFF', color: '#17494D', channel: 'Web · WhatsApp', value: 'FAQ, Tickets, Bestellstatus', complexity: 'Niedrig',
    desc: 'Beantwortet bis zu 80 % aller Standardanfragen automatisch – rund um die Uhr und ohne Wartezeit.' },
  { name: 'Lead-Generierung', logo: 'https://cdn.simpleicons.org/hubspot/FF7A59', color: '#FF7A59', channel: 'Web · Ads', value: 'Qualifizierung, Terminbuchung', complexity: 'Mittel',
    desc: 'Spricht Besucher proaktiv an, qualifiziert sie und übergibt heiße Leads direkt ans Sales-Team.' },
  { name: 'Wissens-Bot (RAG)', logo: 'https://cdn.simpleicons.org/notion/FFFFFF', color: '#8B5CF6', channel: 'Slack · Teams', value: 'Interne Suche, Onboarding', complexity: 'Hoch',
    desc: 'Macht Ihr gesamtes Firmenwissen durchsuchbar – präzise Antworten aus Tausenden Dokumenten in Sekunden.' },
  { name: 'E-Commerce', logo: 'https://cdn.simpleicons.org/shopify/7AB55C', color: '#7AB55C', channel: 'Web · WhatsApp', value: 'Beratung, Upselling, Buchung', complexity: 'Mittel',
    desc: 'Persönliche Produktberatung, Bestellabwicklung und automatisches Upselling – integriert in Shop & CRM.' },
];

// ------------ Warum-Sektion Icon-Reihe (duplicated for the mobile auto-slide loop) ------------
const WHY_ICONS = [
  { logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/openai.svg', label: 'ChatGPT', color: '#10A37F' },
  { logo: 'https://cdn.simpleicons.org/anthropic/FFFFFF', label: 'Claude', color: '#D97757' },
  { logo: 'https://cdn.simpleicons.org/whatsapp/FFFFFF', label: 'WhatsApp', color: '#25D366' },
  { logo: 'https://cdn.simpleicons.org/notion/FFFFFF', label: 'Notion', color: '#8B5CF6' },
  { logo: 'https://cdn.simpleicons.org/zendesk/FFFFFF', label: 'Zendesk', color: '#17494D' },
  { logo: 'https://cdn.simpleicons.org/hubspot/FF7A59', label: 'HubSpot', color: '#FF7A59' },
];

// ------------ Leistungsspektrum ------------
const SERVICES = [
  { tabId: 'build', icon: BrainCircuit, logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/openai.svg', brandColor: '#10A37F', title: 'Conversational AI Design', image: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=700&q=80&auto=format&fit=crop', desc: 'Dialog-Flows, Personas und Tonalität – damit sich Gespräche mit Ihrem Bot natürlich anfühlen.', features: ['Dialog-Flows', 'Persona & Tonalität', 'Prompt-Engineering'] },
  { tabId: 'build', icon: Database, title: 'RAG & Wissensanbindung', image: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=700&q=80&auto=format&fit=crop', desc: 'Ihre Dokumente werden durchsuchbar – präzise Antworten mit Quellenangabe statt Halluzinationen.' },
  { tabId: 'build', icon: Sparkles, logo: 'https://cdn.simpleicons.org/anthropic/FFFFFF', brandColor: '#D97757', title: 'Fine-Tuning & Prompt-Engineering', image: 'https://images.unsplash.com/photo-1526378722484-bd91ca387e72?w=700&q=80&auto=format&fit=crop', desc: 'Modelle und Prompts auf Ihren Use-Case zugeschnitten – für konsistente, markengerechte Antworten.' },
  { tabId: 'integrate', icon: Zap, title: 'CRM & API-Anbindung', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=700&q=80&auto=format&fit=crop', desc: 'Nahtlose Verbindung zu Salesforce, HubSpot & Co. – der Bot aktualisiert Daten live im Gespräch.', features: ['CRM-Sync', 'Webhook & REST', 'Eigene APIs'] },
  { tabId: 'integrate', icon: Headphones, title: 'Helpdesk & Ticket-Integration', image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=700&q=80&auto=format&fit=crop', desc: 'Eskalation an menschliche Agenten mit vollem Gesprächsverlauf – nahtloser Handoff, kein Kontextverlust.' },
  { tabId: 'ops', icon: Bug, title: 'Testing & Qualitätssicherung', image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=700&q=80&auto=format&fit=crop', desc: 'Automatisierte Eval-Suites und Adversarial-Tests decken Edge-Cases auf, bevor Kunden sie finden.' },
  { tabId: 'ops', icon: RefreshCw, title: 'Monitoring & Weiterentwicklung', image: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=700&q=80&auto=format&fit=crop', desc: 'Wöchentliche Quality-Reviews und A/B-Tests – Ihr Bot wird mit jedem Gespräch besser.' },
  { tabId: 'ops', icon: ShieldCheck, title: 'DSGVO & EU-Hosting', image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=700&q=80&auto=format&fit=crop', desc: '100 % datenschutzkonform mit Hosting in der EU und vollständigem Auftragsverarbeitungsvertrag.' },
];

const SERVICE_TABS = [
  { id: 'build', label: 'KI & Wissen' },
  { id: 'integrate', label: 'Integration' },
  { id: 'ops', label: 'Qualität & Betrieb' },
];

const BOT_CORE_CODE = [
  { indent: 0, segments: [{ t: '@bot.', c: '#FF6B00' }, { t: 'on_message', c: '#61DAFB' }, { t: '()' }] },
  { indent: 0, segments: [{ t: 'async def', c: '#C678DD' }, { t: ' ' }, { t: 'respond', c: '#61DAFB' }, { t: '(msg: ' }, { t: 'Message', c: '#E5C07B' }, { t: '):' }] },
  { indent: 20, segments: [{ t: 'context = ' }, { t: 'await', c: '#C678DD' }, { t: ' rag.retrieve(msg.text)' }] },
  { indent: 20, segments: [{ t: 'reply = ' }, { t: 'await', c: '#C678DD' }, { t: ' llm.generate(msg, context)' }] },
  { indent: 20, segments: [{ t: 'return', c: '#C678DD' }, { t: ' channel.send(reply)' }] },
];

// ------------ Prozess ------------
const PROCESS_STEPS = [
  { icon: Lightbulb, title: 'Discovery & Strategie', duration: '1–2 Wochen',
    desc: 'Ziele, Use Cases und Erfolgskennzahlen gemeinsam definieren. Wir verstehen erst Ihr Business, dann bauen wir.',
    deliverables: ['Use-Case-Katalog', 'Conversation-Flows', 'KPI-Framework & Roadmap'],
    image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&q=80&auto=format&fit=crop' },
  { icon: Database,  title: 'Daten & Training',     duration: '2–3 Wochen',
    desc: 'Wissensbasis aufbereiten, Prompts entwickeln und die RAG-Pipeline aufsetzen.',
    deliverables: ['Strukturierte Knowledge-Base', 'Prompt- & Persona-Library', 'RAG-Vektor-Pipeline'],
    image: 'https://images.unsplash.com/photo-1526378722484-bd91ca387e72?w=600&q=80&auto=format&fit=crop' },
  { icon: Hammer,    title: 'Entwicklung & Integration', duration: '3–6 Wochen',
    desc: 'Bot entwickeln und nahtlos in Ihre Kanäle, CRM und APIs integrieren.',
    deliverables: ['Bot-Core mit Guardrails', 'Channel-Integrationen', 'CRM- & API-Connectors'],
    image: 'https://images.unsplash.com/photo-1611606063065-ee7946f0787a?w=600&q=80&auto=format&fit=crop' },
  { icon: Bug,       title: 'Testing & Feintuning', duration: '1–2 Wochen',
    desc: 'Qualität sichern, Antworten optimieren, Edge-Cases abdecken und Halluzinationen vermeiden.',
    deliverables: ['Automatisierte Eval-Suite', 'Adversarial-Test-Report', 'Prompt-Tuning & Hardening'],
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&q=80&auto=format&fit=crop' },
  { icon: Rocket,    title: 'Launch',               duration: '1 Woche',
    desc: 'Go-Live auf allen Kanälen – mit Monitoring und Human-Handoff von Tag eins an.',
    deliverables: ['Production-Deployment', 'Monitoring-Dashboard', 'Human-Handoff-Workflows'],
    image: 'https://images.unsplash.com/photo-1589254065878-42c9da997008?w=600&q=80&auto=format&fit=crop' },
  { icon: RefreshCw, title: 'Optimierung',          duration: 'Laufend',
    desc: 'Kontinuierliches Lernen: Der Bot wird mit jedem Gespräch und Feedback besser.',
    deliverables: ['Wöchentliche Quality-Reviews', 'A/B-Tests neuer Prompts', 'Quartals-Roadmap'],
    image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&q=80&auto=format&fit=crop' },
];

// ------------ Projektbeispiele ------------
const PROJECT_EXAMPLES = [
  { title: 'KI-Agenten für Unternehmen', tag: 'Enterprise', desc: 'Autonome KI-Agenten, die mehrstufige Aufgaben übernehmen – CRM-Updates, Reports und mehr.',
    img: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=900&q=80&auto=format&fit=crop' },
  { title: 'KI-Kundenservice', tag: 'Customer Service', desc: 'Automatisiert bis zu 80 % aller Support-Anfragen mit nahtloser Übergabe an Agenten.',
    img: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=900&q=80&auto=format&fit=crop' },
  { title: 'KI-Vertriebsagent', tag: 'Sales', desc: 'Qualifiziert Website-Besucher, beantwortet Produktfragen und bucht Demo-Termine.',
    img: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=900&q=80&auto=format&fit=crop' },
  { title: 'KI-Terminbuchung', tag: 'Booking', desc: 'Vollautomatische Terminvereinbarung per Chat oder Voice – inkl. Kalender-Sync & Reminder.',
    img: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=900&q=80&auto=format&fit=crop' },
  { title: 'WhatsApp-Bot', tag: 'Messaging', desc: 'Bestellstatus, Benachrichtigungen und Beratung direkt im Messenger der Kunden.',
    img: 'https://images.unsplash.com/photo-1611606063065-ee7946f0787a?w=900&q=80&auto=format&fit=crop' },
  { title: 'KI-Wissensdatenbank (RAG)', tag: 'RAG / Intern', desc: 'Durchsucht Tausende interne Dokumente und liefert präzise Antworten in Sekunden.',
    img: 'https://images.unsplash.com/photo-1526378722484-bd91ca387e72?w=900&q=80&auto=format&fit=crop' },
  { title: 'KI-Automatisierungen', tag: 'Automation', desc: 'Verknüpft Tools, Daten und Prozesse mit KI – von der E-Mail-Antwort bis zum kompletten Workflow.',
    img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=900&q=80&auto=format&fit=crop' },
  { title: 'Voice-Assistent', tag: 'Sprache', desc: 'Sprachgesteuerte Telefon-Hotline mit natürlicher Sprachausgabe und Erkennung.',
    img: 'https://images.unsplash.com/photo-1589254065878-42c9da997008?w=900&q=80&auto=format&fit=crop' },
];

// ------------ Vorteile ------------
const BENEFITS = [
  { icon: Clock,      title: '24/7 Verfügbarkeit',  desc: 'Ihr Bot schläft nie – sofortige Antworten zu jeder Tages- und Nachtzeit.', points: ['Keine Wartezeiten', 'Weltweit & jederzeit', 'Sofortige Reaktion'] },
  { icon: TrendingUp, title: 'Mehr Conversions',    desc: 'Bis zu +62 % mehr qualifizierte Leads durch proaktive Ansprache.', points: ['Proaktive Ansprache', 'Lead-Qualifizierung', 'Höhere Abschlussrate'] },
  { icon: Zap,        title: 'Bis zu -80 % Kosten', desc: 'Automatisierung repetitiver Anfragen entlastet Ihr Team spürbar.', points: ['Weniger Support-Last', 'Automatisierte FAQs', 'Effizientes Team'] },
  { icon: Smile,      title: 'Höhere Zufriedenheit',desc: 'Antwortzeit unter einer Sekunde sorgt für begeisterte Kunden.', points: ['Antwort < 1 Sekunde', 'Konsistente Qualität', 'Begeisterte Kunden'] },
  { icon: Layers,     title: 'Skalierbar',          desc: 'Tausende parallele Gespräche – ohne zusätzliche Ressourcen.', points: ['Unbegrenzte Parallelität', 'Keine Mehrkosten', 'Wächst mit Ihnen'] },
];

const INDUSTRIES = [
  { icon: ShoppingCart, title: 'E-Commerce', tag: 'Retail', desc: '24/7 Produktberatung und Bestellstatus-Updates ohne Wartezeit.',
    img: 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=900&q=80&auto=format&fit=crop' },
  { icon: Monitor, title: 'SaaS & Software', tag: 'SaaS', desc: 'Automatisiertes Onboarding und Support, der Tickets spürbar reduziert.',
    img: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=900&q=80&auto=format&fit=crop' },
  { icon: Building2, title: 'Immobilien', tag: 'Real Estate', desc: 'Qualifizierung von Interessenten und Terminvereinbarung rund um die Uhr.',
    img: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=900&q=80&auto=format&fit=crop' },
  { icon: HeartPulse, title: 'Gesundheitswesen', tag: 'Healthcare', desc: 'Terminbuchung und erste Anlaufstelle für häufige Patientenfragen.',
    img: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&q=80&auto=format&fit=crop' },
  { icon: Plane, title: 'Reise & Tourismus', tag: 'Travel', desc: 'Buchungsanfragen und Reiseberatung, die nie schläft.',
    img: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=900&q=80&auto=format&fit=crop' },
  { icon: Landmark, title: 'Finanzdienstleister', tag: 'Finance', desc: 'Erstberatung und Terminvereinbarung für Banken und Versicherungen.',
    img: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=900&q=80&auto=format&fit=crop' },
];

// ------------ Reusable styles ------------
const baseCard = {
  background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 'var(--radius-xl)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
};

const sectionLabel = (text) => (
  <span style={{
    display: 'inline-block', padding: '6px 14px', borderRadius: '999px',
    background: 'rgba(255,107,0,0.1)', border: '1px solid rgba(255,107,0,0.25)',
    color: 'var(--accent-primary)', fontSize: '12px', fontWeight: 600, letterSpacing: '0.12em',
    textTransform: 'uppercase', marginBottom: '20px',
  }}>{text}</span>
);

// ------------ Component ------------
const CHATBOTDEVELOPMENTPAGE_JSONLD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Service',
      name: 'Chatbot-Entwicklung',
      serviceType: 'Chatbot-Entwicklung',
      provider: { '@type': 'ProfessionalService', name: 'Zebick', url: SITE_URL },
      areaServed: 'CH',
      url: `${SITE_URL}/services/chatbot-entwicklung`,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Startseite', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Services', item: `${SITE_URL}/services` },
        { '@type': 'ListItem', position: 3, name: 'Chatbot-Entwicklung', item: `${SITE_URL}/services/chatbot-entwicklung` },
      ],
    },
  ],
};

const CHATBOTDEVELOPMENTPAGE_RELATED = [{ label: "Webentwicklung", path: "/services/webentwicklung" }, { label: "KI-Automatisierung", path: "/services/automatisierung-ki" }, { label: "Digitales Marketing & SEO", path: "/services/digitales-marketing-seo" }];

const ChatbotDevelopmentPage = () => {
  const pageRef = useRef(null);
  const [activeProcess, setActiveProcess] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActiveProcess((p) => (p + 1) % PROCESS_STEPS.length), 3500);
    return () => clearInterval(id);
  }, []);

  useSectionReveal(pageRef);

  return (
    <div className="page-transition" data-testid="chatbot-development-page" ref={pageRef}>
      <Header />
      <Seo
        title="KI-Chatbot-Entwicklung & Automatisierung"
        description="KI-gestützte Chatbots für Kundenservice, Lead-Generierung und Automatisierung – inklusive CRM-Integration."
        path="/services/chatbot-entwicklung"
        jsonLd={CHATBOTDEVELOPMENTPAGE_JSONLD}
      />

      <div className="sr-only"><h1>KI-Chatbot-Entwicklung & Automatisierung</h1></div>

      <ServiceAdvisorBlock serviceId="chatbot" />


      {/* ========== WARUM CHATBOTS ========== */}
      <section className="section" data-testid="section-why-chatbot" style={{ padding: '120px 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '15%', right: '5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(255,107,0,0.07) 0%, transparent 60%)', filter: 'blur(100px)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative' }}>
          <div className="why-chatbot-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center' }}>

            <div data-reveal style={{ opacity: 0, transform: 'translateY(30px)', transition: 'all 0.8s ease' }}>
              {sectionLabel('Warum Chatbots?')}
              <h2 className="heading-1" style={{ fontSize: '48px', fontWeight: 900, lineHeight: 1.1, marginBottom: '24px' }}>
                Ihr persönlicher Assistent –<br /><span className="text-gradient">24/7 und sofort.</span>
              </h2>
              <p style={{ fontSize: '17px', color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '40px' }}>
                Kunden erwarten heute sofortige Antworten – zu jeder Uhrzeit. KI-Chatbots übernehmen den Großteil
                Ihres Supports, qualifizieren Leads automatisch und entlasten Ihr Team von Routine-Anfragen.
              </p>
              <div className="svc-icon-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {[...WHY_ICONS, ...WHY_ICONS].map((item, idx) => (
                  <div key={idx} className="svc-icon-chip" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 18px', background: 'linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))', border: '1px solid var(--border-subtle)', borderRadius: '999px', transition: 'all 0.3s ease' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = item.color; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                    {item.logo.includes('cdn.jsdelivr.net/npm/simple-icons') ? (
                      <div aria-hidden style={{ width: 18, height: 18, flexShrink: 0, backgroundColor: item.color, WebkitMaskImage: `url(${item.logo})`, maskImage: `url(${item.logo})`, WebkitMaskSize: 'contain', maskSize: 'contain', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskPosition: 'center' }} />
                    ) : (
                      <img src={item.logo} alt={item.label} style={{ width: 18, height: 18, objectFit: 'contain' }} />
                    )}
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CHAT MOCKUP */}
            <div data-reveal style={{ opacity: 0, transform: 'translateY(30px)', transition: 'all 0.8s 0.15s ease', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div className="cb-mockup-scale" style={{ position: 'relative', width: '100%', maxWidth: '440px' }}>
                <div style={{ position: 'absolute', inset: '-30px', background: 'radial-gradient(circle, rgba(255,107,0,0.22) 0%, transparent 60%)', filter: 'blur(40px)' }} />
                <div style={{ position: 'relative', background: 'linear-gradient(145deg, #161616 0%, #0a0a0a 100%)', borderRadius: '20px', border: '1px solid #2a2a2a', boxShadow: '0 30px 80px rgba(0,0,0,0.6)', overflow: 'hidden' }}>
                  {/* header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', background: 'linear-gradient(135deg, rgba(255,107,0,0.15), rgba(255,107,0,0.02))', borderBottom: '1px solid rgba(255,107,0,0.15)' }}>
                    <div style={{ position: 'relative', width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #FF6B00, #cc5500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Bot size={20} color="#000" strokeWidth={2.5} />
                      <span style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '12px', height: '12px', borderRadius: '50%', background: '#28C840', border: '2px solid #161616' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>Zebick Assistant</div>
                      <div style={{ fontSize: '11px', color: '#28C840', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#28C840' }} />
                        Online · Antwortet sofort
                      </div>
                    </div>
                    <Sparkles size={16} color="#FF6B00" />
                  </div>
                  {/* messages */}
                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', minHeight: '360px', background: 'radial-gradient(ellipse at top, rgba(255,107,0,0.04) 0%, transparent 60%)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(135deg, #FF6B00, #cc5500)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Bot size={12} color="#000" /></div>
                      <div style={{ maxWidth: '75%', padding: '10px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px 16px 16px 4px', fontSize: '13px', color: '#fff', lineHeight: 1.5 }}>
                        Hallo! 👋 Wie kann ich Ihnen heute helfen?
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <div style={{ maxWidth: '75%', padding: '10px 14px', background: 'linear-gradient(135deg, #FF6B00, #cc5500)', borderRadius: '16px 16px 4px 16px', fontSize: '13px', color: '#000', fontWeight: 600, lineHeight: 1.5 }}>
                        Ich brauche ein Angebot für eine App.
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(135deg, #FF6B00, #cc5500)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Bot size={12} color="#000" /></div>
                      <div style={{ maxWidth: '78%', padding: '10px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px 16px 16px 4px', fontSize: '13px', color: '#fff', lineHeight: 1.5 }}>
                        Gerne! Ich habe einen Termin mit unserem Berater gebucht und ein PDF mit Referenzen geschickt. ✅
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <div style={{ maxWidth: '75%', padding: '10px 14px', background: 'linear-gradient(135deg, #FF6B00, #cc5500)', borderRadius: '16px 16px 4px 16px', fontSize: '13px', color: '#000', fontWeight: 600 }}>
                        Wow – das ging schnell! 🚀
                      </div>
                    </div>
                    {/* typing */}
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(135deg, #FF6B00, #cc5500)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Bot size={12} color="#000" /></div>
                      <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px 16px 16px 4px', display: 'flex', gap: '4px' }}>
                        {[0, 1, 2].map((k) => (
                          <span key={k} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FF6B00', animation: `chatBotDot 1.4s ease-in-out ${k * 0.2}s infinite` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* input */}
                  <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0,0,0,0.4)' }}>
                    <div style={{ flex: 1, padding: '10px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '999px', fontSize: '12px', color: '#666' }}>Nachricht eingeben …</div>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #FF6B00, #cc5500)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(255,107,0,0.4)' }}>
                      <Send size={16} color="#000" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
        <style>{`
          @keyframes chatBotDot { 0%, 60%, 100% { transform: translateY(0); opacity: 0.5; } 30% { transform: translateY(-6px); opacity: 1; } }
          @media (max-width: 900px) {
            .why-chatbot-grid { grid-template-columns: 1fr !important; gap: 0 !important; }
            .why-chatbot-grid > div:first-child { display: contents; }
            .why-chatbot-grid > div:last-child { margin-top: 48px; }
            .svc-icon-row { order: 1; margin-top: 32px; }
            .cb-mockup-scale { width: 440px !important; max-width: 440px !important; zoom: 0.78; }
          }
          .svc-icon-chip:nth-child(n+7) { display: none; }
          @media (max-width: 640px) {
            .svc-icon-row { flex-wrap: nowrap !important; width: max-content; overflow: hidden; animation: svcIconSlide 16s linear infinite; }
            .svc-icon-row:hover { animation-play-state: paused; }
            .svc-icon-chip { flex-shrink: 0; padding: 10px 14px !important; }
            .svc-icon-chip:nth-child(n+7) { display: flex; }
            .svc-icon-chip span { font-size: 12px !important; }
          }
          @keyframes svcIconSlide { from { transform: translateX(0); } to { transform: translateX(-50%); } }
          @media (prefers-reduced-motion: reduce) { .svc-icon-row { animation: none !important; } }
        `}</style>
      </section>

      {/* ========== STACK-SHOWCASE ========== */}
      <ChatbotStackShowcase />

      {/* ========== LEISTUNGSSPEKTRUM ========== */}
      <section className="section" data-testid="section-leistungsspektrum" style={{ padding: '120px 0', background: 'var(--bg-primary)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '20%', right: '-150px', width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(255,107,0,0.06) 0%, transparent 60%)', filter: 'blur(100px)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '60px', alignItems: 'center', marginBottom: '72px' }}>
            <div data-reveal style={{ opacity: 0, transform: 'translateY(30px)', transition: 'all 0.8s ease' }}>
              {sectionLabel('Leistungsspektrum')}
              <h2 className="heading-1" style={{ fontSize: '44px', fontWeight: 900, marginBottom: '20px', lineHeight: 1.1 }}>
                Chatbot-Entwicklung, <span className="text-gradient">komplett gedacht</span>
              </h2>
              <p style={{ fontSize: '17px', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                Von KI-Design über Integration bis Qualitätssicherung: Modell, Wissen und Betrieb greifen bei uns
                ineinander – statt isolierter Bausteine bekommen Sie einen Bot, der wirklich funktioniert.
              </p>
            </div>
            <div data-reveal style={{ opacity: 0, transform: 'translateY(30px)', transition: 'all 0.8s 0.15s ease', ...baseCard, padding: '32px', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', lineHeight: 1.8 }}>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FF5F57' }} />
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FFBD2E' }} />
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#28CA42' }} />
                <span style={{ marginLeft: '12px', color: 'var(--text-muted)', fontSize: '12px' }}>bot_core.py</span>
              </div>
              <TypingCode lines={BOT_CORE_CODE} />
            </div>
          </div>

          <ServiceTabsGrid tabs={SERVICE_TABS} services={SERVICES} />
        </div>
      </section>

      {/* ========== KI-MODELLE ========== */}
      <section className="section" data-testid="section-models" style={{ padding: '120px 0', background: 'var(--bg-primary)' }}>
        <div className="container">
          <div data-reveal style={{ opacity: 0, transform: 'translateY(30px)', transition: 'all 0.8s ease', textAlign: 'center', marginBottom: '72px' }}>
            {sectionLabel('KI-Modelle')}
            <h2 className="heading-1" style={{ fontSize: '44px', fontWeight: 900, marginBottom: '16px' }}>Das <span className="text-gradient">Gehirn des Bots</span></h2>
            <p style={{ fontSize: '17px', color: 'var(--text-muted)', maxWidth: '640px', margin: '0 auto', lineHeight: 1.7 }}>
              Wir wählen das passende Sprachmodell für Ihren Anwendungsfall – führende Modelle bilden das Fundament, bewährte Frameworks die Architektur.
            </p>
          </div>

          <ToolDock tools={[...AI_MODELS, ...AI_FRAMEWORKS]} />
        </div>
      </section>

      {/* ========== EINSATZBEREICHE ========== */}
      <section className="section" data-testid="section-usecases" style={{ padding: '120px 0', background: 'var(--bg-primary)' }}>
        <div className="container">
          <div data-reveal style={{ opacity: 0, transform: 'translateY(30px)', transition: 'all 0.8s ease', textAlign: 'center', marginBottom: '64px' }}>
            {sectionLabel('Einsatzbereiche')}
            <h2 className="heading-1" style={{ fontSize: '44px', fontWeight: 900, marginBottom: '16px' }}>Wofür Chatbots <span className="text-gradient">eingesetzt werden.</span></h2>
            <p style={{ fontSize: '17px', color: 'var(--text-muted)', maxWidth: '640px', margin: '0 auto', lineHeight: 1.7 }}>
              Vom Kundenservice bis zum internen Wissens-Bot – jeder Anwendungsfall hat seine eigenen Anforderungen.
            </p>
          </div>

          <div className="compare-grid" data-keep-grid style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '56px' }}>
            {USE_CASES.map((uc, i) => (
              <div key={uc.name} data-reveal style={{ ...baseCard, padding: '28px', opacity: 0, transform: 'translateY(30px)', transition: `all 0.8s ${i * 0.08}s ease` }}
                   onMouseEnter={(e) => { e.currentTarget.style.borderColor = uc.color; e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = `0 20px 40px ${uc.color}25`; }}
                   onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', background: `${uc.color}20`, border: `1px solid ${uc.color}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <img src={uc.logo} alt={uc.name} width="24" height="24" style={{ objectFit: 'contain' }} />
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700 }}>{uc.name}</h3>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.7 }}>{uc.desc}</p>
              </div>
            ))}
          </div>

          {/* Comparison Table */}
          <div data-reveal style={{ ...baseCard, padding: '0', overflow: 'hidden', opacity: 0, transform: 'translateY(30px)', transition: 'all 0.8s 0.2s ease' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '720px' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,107,0,0.06)' }}>
                    {['Einsatzbereich', 'Kanäle', 'Nutzen', 'Komplexität'].map((h) => (
                      <th key={h} style={{ textAlign: 'left', padding: '20px 24px', fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent-primary)', fontWeight: 600, borderBottom: '1px solid var(--border-subtle)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {USE_CASES.map((uc, i) => (
                    <tr key={uc.name} style={{ borderBottom: i < USE_CASES.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                      <td style={{ padding: '20px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img src={uc.logo} alt={uc.name} width="20" height="20" style={{ objectFit: 'contain' }} />
                          <span style={{ fontWeight: 600 }}>{uc.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '20px 24px', color: 'var(--text-secondary)' }}>{uc.channel}</td>
                      <td style={{ padding: '20px 24px', color: 'var(--text-muted)', fontSize: '14px' }}>{uc.value}</td>
                      <td style={{ padding: '20px 24px', color: 'var(--text-secondary)' }}>{uc.complexity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ========== ENTWICKLUNGSPROZESS (Timeline) ========== */}
      <ModernTimeline
        eyebrow="Entwicklungsprozess"
        title="Von der Idee zum Live-Bot"
        subtitle="Sechs strukturierte Phasen – transparent, planbar, mit klaren Meilensteinen."
        background="var(--bg-secondary)"
        steps={PROCESS_STEPS}
      />

      {/* ========== BRANCHEN ========== */}
      <ServiceIndustries
        slug="chatbot"
        defaultItems={INDUSTRIES.map((c) => ({
          icon: c.icon?.displayName || c.icon?.name || 'Building2',
          title: c.title, tag: c.tag, desc: c.desc, img: c.img,
        }))}
        defaultHeading="Chatbots für jede Branche"
        defaultSubtitle="Jede Branche hat eigene Fragen, Prozesse und Kunden – unsere Bots passen sich an."
        eyebrowLabel="Branchen"
      />

      {/* ========== VORTEILE ========== */}
      <ModernBenefits
        eyebrow="Vorteile"
        title="Warum sich ein KI-Chatbot lohnt"
        accentWord="KI-Chatbot"
        subtitle="Ein intelligenter Assistent entlastet Ihr Team und begeistert Ihre Kunden – rund um die Uhr."
        items={BENEFITS}
        image="https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=900&q=80&auto=format&fit=crop"
        testid="section-benefits"
      />

      {/* ========== PROJEKTBEISPIELE — aus Portfolio (Admin) ========== */}
      <ServicePortfolioSection
        serviceId="chatbot"
        fallbackExamples={PROJECT_EXAMPLES}
        title="Was wir"
        accentWord="bauen können"
        subtitle="Vom einfachen FAQ-Bot bis zum komplexen KI-Assistenten – echte Projekte aus unserem Portfolio."
        testid="section-projects"
        showCategoryFilter
      />

      {/* ========== KONTAKT ========== */}
      <ServiceContactForm
        defaultService="chatbot"
        title="Lass uns sprechen."
        subtitle="Support-Bot, Sales-Assistent oder internes Wissens-Tool – wir antworten innerhalb von 24 Stunden."
      />      <RelatedServices items={CHATBOTDEVELOPMENTPAGE_RELATED} />      <Footer />
      <Chatbot />
    </div>
  );
};

// ---------- Small subcomponents ----------
const FormField = ({ icon: Icon, label, type, value, onChange, required, testid }) => (
  <div>
    <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px', letterSpacing: '0.05em' }}>{label}</label>
    <div style={{ position: 'relative' }}>
      <Icon size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        data-testid={testid}
        style={{ width: '100%', padding: '14px 16px 14px 40px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: '15px', fontFamily: 'inherit', transition: 'border-color 0.2s' }}
        onFocus={(e) => { e.target.style.borderColor = 'var(--accent-primary)'; }}
        onBlur={(e) => { e.target.style.borderColor = 'var(--border-subtle)'; }}
      />
    </div>
  </div>
);

// ------------ Subcomponents ------------

// ---- Chatbot-specific stack-showcase visuals (unique per service — only
// the "Unser KI-Stack" TechBelt card stays shared) ----

const NeuralPulse = () => (
  <div className="bot-neural">
    <svg viewBox="0 0 120 80" className="bot-neural-svg" aria-hidden>
      <line x1="20" y1="20" x2="60" y2="40" className="bot-neural-line" />
      <line x1="20" y1="60" x2="60" y2="40" className="bot-neural-line" style={{ animationDelay: '0.3s' }} />
      <line x1="60" y1="40" x2="100" y2="20" className="bot-neural-line" style={{ animationDelay: '0.6s' }} />
      <line x1="60" y1="40" x2="100" y2="60" className="bot-neural-line" style={{ animationDelay: '0.9s' }} />
    </svg>
    {[[20, 20], [20, 60], [60, 40], [100, 20], [100, 60]].map(([x, y], i) => (
      <span key={i} className="bot-neural-node" style={{ left: `${(x / 120) * 100}%`, top: `${(y / 80) * 100}%`, animationDelay: `${i * 0.2}s` }} />
    ))}
  </div>
);

const ChatTrainingLoop = () => (
  <div className="bot-chat-demo">
    <div className="bot-bubble bot-bubble-user">Wie viel kostet das?</div>
    <div className="bot-bubble bot-bubble-bot">
      <span className="bot-typing-dot" /><span className="bot-typing-dot" /><span className="bot-typing-dot" />
    </div>
  </div>
);

const BOT_CHANNELS = [
  { n: 'WhatsApp', logo: 'https://cdn.simpleicons.org/whatsapp/25D366', angle: -55 },
  { n: 'Messenger', logo: 'https://cdn.simpleicons.org/messenger/00B2FF', angle: 55 },
  { n: 'Instagram', logo: 'https://cdn.simpleicons.org/instagram/E4405F', angle: 180 },
];

const ChannelBroadcast = () => (
  <div className="bot-broadcast">
    <span className="bot-broadcast-ring" />
    <span className="bot-broadcast-ring" style={{ animationDelay: '1s' }} />
    <div className="bot-broadcast-center"><Bot size={18} color="#000" /></div>
    {BOT_CHANNELS.map((c, i) => (
      <span key={c.n} className="bot-channel-badge" style={{ '--angle': `${c.angle}deg`, animationDelay: `${i * 0.5}s` }}>
        <img src={c.logo} alt={c.n} />
      </span>
    ))}
  </div>
);

const PromptReveal = () => (
  <div className="bot-prompt">
    <div className="bot-prompt-text">Du bist freundlich und präzise.</div>
    <div className="bot-prompt-badge">✓ Optimiert</div>
  </div>
);

const LatencyBubble = () => (
  <div className="bot-latency">
    <div className="bot-latency-bubble">
      <span className="bot-typing-dot" /><span className="bot-typing-dot" /><span className="bot-typing-dot" />
    </div>
    <div className="bot-latency-time">180ms</div>
  </div>
);

const ChatbotStackShowcase = () => (
  <StackShowcaseSection
    eyebrow="Unser Ansatz"
    title={<>Gebaut für <span style={{ color: 'var(--accent-primary)' }}>smarte</span> Gespräche</>}
    subtitle="Von der Intent-Analyse bis zum Live-Rollout – KI, die wirklich versteht."
    testid="section-stack-showcase"
  >
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr 1fr', gap: '20px', marginBottom: '20px' }} className="asf-row">
      <StackCard title="Intelligenz von Tag eins"><NeuralPulse /></StackCard>
      <StackCard title="Unser Bot-Workflow"><ChatTrainingLoop /></StackCard>
      <StackCard title="Überall erreichbar"><ChannelBroadcast /></StackCard>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }} className="asf-row">
      <StackCard title="Prompt Engineering, präzise"><PromptReveal /></StackCard>
      <StackCard title="Unser KI-Stack"><TechBelt tools={[...AI_MODELS, ...AI_FRAMEWORKS]} /></StackCard>
      <StackCard title="Antwortzeit < 200ms"><LatencyBubble /></StackCard>
    </div>
    <style>{`
      .bot-neural { position: relative; width: 100%; height: 90px; }
      .bot-neural-svg { position: absolute; inset: 0; width: 100%; height: 100%; }
      .bot-neural-line { stroke: var(--accent-primary); stroke-width: 1.5; stroke-dasharray: 6 4; animation: botNeuralFlow 1.2s linear infinite; opacity: 0.6; }
      @keyframes botNeuralFlow { to { stroke-dashoffset: -20; } }
      .bot-neural-node { position: absolute; width: 8px; height: 8px; border-radius: 50%; background: var(--accent-primary); transform: translate(-50%, -50%); animation: botNeuralPulse 2s ease-in-out infinite; }
      @keyframes botNeuralPulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(255,107,0,0.5); } 50% { box-shadow: 0 0 0 7px rgba(255,107,0,0); } }

      .bot-chat-demo { display: flex; flex-direction: column; gap: 8px; width: 100%; }
      .bot-bubble { max-width: 80%; padding: 8px 12px; border-radius: 14px; font-size: 11px; font-weight: 600; opacity: 0; animation-fill-mode: forwards; }
      .bot-bubble-user { align-self: flex-end; background: var(--accent-primary); color: #000; border-bottom-right-radius: 4px; animation: botBubbleIn 3s ease-in-out infinite; }
      .bot-bubble-bot { align-self: flex-start; background: rgba(255,255,255,0.06); border: 1px solid var(--border-subtle); border-bottom-left-radius: 4px; display: flex; gap: 4px; padding: 10px 14px; animation: botBubbleIn 3s ease-in-out infinite; animation-delay: 1.1s; }
      @keyframes botBubbleIn { 0% { opacity: 0; transform: translateY(6px); } 8%, 90% { opacity: 1; transform: translateY(0); } 98%, 100% { opacity: 0; } }
      .bot-typing-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--text-muted); animation: botTypingDot 1s ease-in-out infinite; }
      .bot-typing-dot:nth-child(2) { animation-delay: 0.15s; } .bot-typing-dot:nth-child(3) { animation-delay: 0.3s; }
      @keyframes botTypingDot { 0%, 60%, 100% { opacity: 0.3; transform: translateY(0); } 30% { opacity: 1; transform: translateY(-3px); } }

      .bot-broadcast { position: relative; display: flex; align-items: center; justify-content: center; width: 100%; height: 90px; }
      .bot-broadcast-ring { position: absolute; width: 30px; height: 30px; border-radius: 50%; border: 2px solid var(--accent-primary); animation: botBroadcastRing 2s ease-out infinite; }
      @keyframes botBroadcastRing { 0% { transform: scale(1); opacity: 0.9; } 100% { transform: scale(2.6); opacity: 0; } }
      .bot-broadcast-center { position: relative; z-index: 1; width: 34px; height: 34px; border-radius: 50%; background: var(--accent-primary); display: flex; align-items: center; justify-content: center; }
      .bot-channel-badge { position: absolute; left: 50%; top: 50%; width: 24px; height: 24px; margin: -12px; border-radius: 7px; background: rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center; transform: rotate(var(--angle)) translate(48px) rotate(calc(-1 * var(--angle))); opacity: 0.35; animation: botChannelPulse 1.8s ease-in-out infinite; }
      .bot-channel-badge img { width: 14px; height: 14px; object-fit: contain; }
      @keyframes botChannelPulse { 0%, 100% { opacity: 0.35; box-shadow: none; } 30% { opacity: 1; box-shadow: 0 0 10px rgba(255,107,0,0.4); } }

      .bot-prompt { display: flex; flex-direction: column; gap: 10px; width: 100%; }
      .bot-prompt-text { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--text-secondary); white-space: nowrap; overflow: hidden; border-right: 2px solid var(--accent-primary); width: 0; animation: botPromptType 3s steps(28, end) infinite; }
      @keyframes botPromptType { 0% { width: 0; } 50%, 85% { width: 24ch; } 100% { width: 0; } }
      .bot-prompt-badge { align-self: flex-start; font-size: 10px; font-weight: 700; color: #4ade80; opacity: 0; animation: botBadgeIn 3s ease-in-out infinite; }
      @keyframes botBadgeIn { 0%, 52% { opacity: 0; } 60%, 85% { opacity: 1; } 100% { opacity: 0; } }

      .bot-latency { display: flex; flex-direction: column; align-items: center; gap: 10px; width: 100%; }
      .bot-latency-bubble { display: flex; gap: 4px; padding: 10px 16px; border-radius: 14px; background: rgba(255,255,255,0.06); border: 1px solid var(--border-subtle); animation: botLatencyFade 1.4s ease-in-out infinite; }
      @keyframes botLatencyFade { 0%, 55% { opacity: 1; } 65%, 100% { opacity: 0; } }
      .bot-latency-time { font-family: 'JetBrains Mono', monospace; font-size: 16px; font-weight: 800; color: var(--accent-primary); opacity: 0; animation: botLatencyTime 1.4s ease-in-out infinite; }
      @keyframes botLatencyTime { 0%, 60% { opacity: 0; transform: scale(0.8); } 75%, 100% { opacity: 1; transform: scale(1); } }

      @media (prefers-reduced-motion: reduce) {
        .bot-neural-line, .bot-neural-node, .bot-bubble-user, .bot-bubble-bot, .bot-typing-dot, .bot-broadcast-ring, .bot-channel-badge, .bot-prompt-text, .bot-prompt-badge, .bot-latency-bubble, .bot-latency-time { animation: none !important; }
      }
    `}</style>
  </StackShowcaseSection>
);

export default ChatbotDevelopmentPage;
