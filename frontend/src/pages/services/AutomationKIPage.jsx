import React, { useRef, useState } from 'react';
import {
  ArrowRight, Workflow, Bot, Zap, Database, Mail, MessageCircle, CheckCircle, Sparkles,
  ShieldCheck, Globe, Clock, BarChart3, Lightbulb, Hammer, Bug, Rocket, RefreshCw, Search,
  Target, Calendar, FileText, ChevronDown, TrendingUp,
  ShoppingCart, Briefcase, Landmark, Users, Megaphone, Factory,
} from 'lucide-react';
import Header from '../../components/layout/Header';
import Seo, { SITE_URL } from '../../components/common/Seo';
import RelatedServices from '../../components/services/RelatedServices';
import Footer from '../../components/layout/Footer';
import Chatbot from '../../components/chatbot/Chatbot';
import { ModernBenefits } from '../../components/services/ModernBenefits';
import { useSectionReveal } from '../../components/services/useSectionReveal';
import ModernTimeline from '../../components/services/ModernTimeline';
import ServiceContactForm from '../../components/services/ServiceContactForm';
import ServiceAdvisorBlock from '../../components/tools/ServiceAdvisorBlock';
import ServiceIndustries from '../../components/services/ServiceIndustries';
import { StackShowcaseSection, StackCard, TechBelt } from '../../components/services/StackShowcase';
import TypingCode from '../../components/services/TypingCode';
import ServiceTabsGrid from '../../components/services/ServiceTabsGrid';

// ---------- Daten ----------
const SERVICES = [
  { tabId: 'ai', icon: Bot, logo: 'https://cdn.simpleicons.org/openai/FFFFFF', brandColor: '#10A37F', title: 'KI-Agenten', image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=700&q=80&auto=format&fit=crop',
    desc: 'Autonome KI-Agenten, die mehrstufige Aufgaben selbstständig ausführen – von Datenanalyse bis Entscheidungsfindung.',
    features: ['Multi-Step-Reasoning', 'Tool-Calling', 'Memory & Kontext', 'Human-in-the-Loop'] },
  { tabId: 'workflows', icon: Workflow, logo: 'https://cdn.simpleicons.org/n8n/EA4B71', brandColor: '#EA4B71', title: 'Prozessautomatisierung', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=700&q=80&auto=format&fit=crop',
    desc: 'Wir automatisieren manuelle, wiederkehrende Geschäftsprozesse – von Onboarding bis Rechnungslauf.',
    features: ['n8n / Make', 'Power Automate', 'Custom Workflows', 'API-First'] },
  { tabId: 'sales', icon: Database, logo: 'https://cdn.simpleicons.org/hubspot/FF7A59', brandColor: '#FF7A59', title: 'CRM-Automatisierung', image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=700&q=80&auto=format&fit=crop',
    desc: 'HubSpot, Salesforce & Pipedrive intelligent automatisiert: Lead-Routing, Scoring, Follow-Ups & Sync.',
    features: ['Lead-Scoring', 'Auto-Routing', 'Bi-Direktionale Syncs', 'Deal-Tracking'] },
  { tabId: 'sales', icon: Mail, title: 'E-Mail-Automatisierung', image: 'https://images.unsplash.com/photo-1557200134-90327ee9fafa?w=700&q=80&auto=format&fit=crop',
    desc: 'Personalisierte Drip-Sequences, transaktionale E-Mails und automatische Antworten – per KI optimiert.',
    features: ['Drip-Kampagnen', 'KI-Personalisierung', 'A/B-Tests', 'Smart-Send-Timing'] },
  { tabId: 'ai', icon: MessageCircle, logo: 'https://cdn.simpleicons.org/whatsapp/25D366', brandColor: '#25D366', title: 'WhatsApp-Automatisierung', image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=700&q=80&auto=format&fit=crop',
    desc: 'WhatsApp Business API: automatisierte Antworten, Bestell-Updates, Reminder & Marketing-Kampagnen.',
    features: ['WhatsApp Business API', 'Template-Messages', 'Bestellfluss', 'Chatbot-Routing'] },
  { tabId: 'sales', icon: Target, title: 'Lead-Automatisierung', image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=700&q=80&auto=format&fit=crop',
    desc: 'Automatische Lead-Capture, -Qualifizierung und -Übergabe – mit KI-gestützter Vorqualifizierung.',
    features: ['Multi-Source-Capture', 'KI-Vorqualifizierung', 'Auto-Übergabe', 'CRM-Push'] },
  { tabId: 'workflows', icon: Calendar, title: 'Termin-Automatisierung', image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=700&q=80&auto=format&fit=crop',
    desc: 'Automatische Terminvereinbarung mit Kalender-Sync, Reminder-Sequenzen und No-Show-Reduktion.',
    features: ['Cal.com / Calendly', 'SMS-Reminder', 'No-Show-Reduktion', 'CRM-Integration'] },
  { tabId: 'workflows', icon: FileText, title: 'Dokumenten-Automatisierung', image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=700&q=80&auto=format&fit=crop',
    desc: 'Verträge, Angebote und Rechnungen automatisch generieren, versenden und ablegen – KI-gestützt.',
    features: ['Auto-Generation', 'E-Signaturen', 'DMS-Integration', 'KI-Klassifizierung'] },
];

const AUTOMATION_PLATFORMS = [
  { name: 'n8n', logo: 'https://cdn.simpleicons.org/n8n/EA4B71', color: '#EA4B71',
    type: 'Open-Source, selbst gehostet', fit: 'Volle Datenkontrolle',
    desc: 'Self-hosted Workflow-Engine mit voller Datenhoheit – ideal für sensible oder komplexe Prozesse.' },
  { name: 'Zapier', logo: 'https://cdn.simpleicons.org/zapier/FF4F00', color: '#FF4F00',
    type: 'No-Code, Cloud', fit: 'Schnelle Standard-Integrationen',
    desc: 'Tausende fertige App-Verbindungen ohne Code – in Minuten startklar für Standardfälle.' },
  { name: 'Python', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg', color: '#3776AB',
    type: 'Custom Code', fit: 'Komplexe Individual-Logik',
    desc: 'Volle Kontrolle für Prozesse, die kein No-Code-Tool abbilden kann – maßgeschneidert und skalierbar.' },
  { name: 'OpenAI', logo: 'https://cdn.simpleicons.org/openai/FFFFFF', color: '#10A37F',
    type: 'KI-Agenten', fit: 'Unstrukturierte Entscheidungen',
    desc: 'KI-gestützte Agenten für Aufgaben, die Urteilsvermögen statt starrer Regeln brauchen.' },
];

const LEISTUNGSSPEKTRUM_TABS = [
  { id: 'workflows', label: 'Prozesse & Workflows' },
  { id: 'sales', label: 'Sales & CRM' },
  { id: 'ai', label: 'KI & Messaging' },
];

const AUTOMATION_CODE = [
  { indent: 0, segments: [{ t: '@workflow.', c: '#FF6B00' }, { t: 'on_trigger', c: '#61DAFB' }, { t: '()' }] },
  { indent: 0, segments: [{ t: 'async def', c: '#C678DD' }, { t: ' ' }, { t: 'run', c: '#61DAFB' }, { t: '(event: ' }, { t: 'Event', c: '#E5C07B' }, { t: '):' }] },
  { indent: 20, segments: [{ t: 'data = ' }, { t: 'await', c: '#C678DD' }, { t: ' crm.enrich(event)' }] },
  { indent: 20, segments: [{ t: 'await', c: '#C678DD' }, { t: ' agent.decide(data)' }] },
  { indent: 20, segments: [{ t: 'return', c: '#C678DD' }, { t: ' notify.team(data)' }] },
];

const BENEFITS = [
  { icon: Clock, title: 'Bis zu 80% Zeitersparnis', desc: 'Manuelle Routinearbeit verschwindet – Ihr Team fokussiert sich auf Wertschöpfung.' },
  { icon: TrendingUp, title: 'Skalieren ohne Personal', desc: 'Wachstum, das nicht an HR-Engpässen scheitert. Mehr Output mit gleichem Team.' },
  { icon: ShieldCheck, title: 'Weniger Fehler', desc: 'Automatisierte Prozesse arbeiten exakt – 24/7, ohne Tippfehler und ohne Vergessenes.' },
  { icon: BarChart3, title: 'Volle Transparenz', desc: 'Jeder Schritt wird geloggt – Echtzeit-Dashboards und Audit-Trails inklusive.' },
  { icon: Sparkles, title: 'Schneller ROI', desc: 'Erste Automationen amortisieren sich oft schon nach wenigen Wochen.' },
  { icon: Globe, title: 'Plattformunabhängig', desc: 'Wir verbinden alles: CRM, ERP, E-Mail, Messenger, Datenbanken & Custom APIs.' },
];

const INDUSTRIES = [
  { icon: ShoppingCart, title: 'E-Commerce', tag: 'Retail', desc: 'Automatisierte Bestandsführung, Rechnungen und Kundenkommunikation.',
    img: 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=900&q=80&auto=format&fit=crop' },
  { icon: Briefcase, title: 'Agenturen & Dienstleister', tag: 'Services', desc: 'Automatisierte Angebote, Reportings und Kundenonboarding.',
    img: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=900&q=80&auto=format&fit=crop' },
  { icon: Landmark, title: 'Finance & Accounting', tag: 'Finance', desc: 'Automatisierte Buchhaltung, Mahnwesen und Datenabgleich ohne Tippfehler.',
    img: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=900&q=80&auto=format&fit=crop' },
  { icon: Users, title: 'HR & Recruiting', tag: 'HR', desc: 'Automatisierte Bewerber-Vorauswahl und Onboarding-Workflows.',
    img: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=900&q=80&auto=format&fit=crop' },
  { icon: Megaphone, title: 'Sales & Marketing', tag: 'Marketing', desc: 'Automatisierte Lead-Qualifizierung und Follow-ups, die nichts vergessen.',
    img: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=900&q=80&auto=format&fit=crop' },
  { icon: Factory, title: 'Produktion & Industrie', tag: 'Industry', desc: 'Automatisierte Bestandsüberwachung und Qualitätssicherung in Echtzeit.',
    img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=900&q=80&auto=format&fit=crop' },
];

const PROCESS_STEPS = [
  { icon: Search, title: 'Process-Audit', duration: '1 Woche',
    desc: 'Wir kartieren Ihre bestehenden Prozesse, identifizieren Bottlenecks und priorisieren Automatisierungs-Kandidaten nach ROI.',
    deliverables: ['Prozess-Map', 'Automation-Backlog', 'ROI-Analyse'],
    image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&q=80&auto=format&fit=crop' },
  { icon: Lightbulb, title: 'Design & Architektur', duration: '1–2 Wochen',
    desc: 'Konzeption der Workflows: Tools, Integrationen, KI-Komponenten, Fehlerbehandlung und Eskalations-Logik.',
    deliverables: ['Workflow-Designs', 'Tool-Stack', 'Architektur-Diagramme'],
    image: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=600&q=80&auto=format&fit=crop' },
  { icon: Hammer, title: 'Aufbau & Integration', duration: '2–6 Wochen',
    desc: 'Implementierung der Automationen, API-Anbindungen und KI-Modelle – iterativ in 1-2-Wochen-Sprints.',
    deliverables: ['Live-Workflows', 'API-Konnektoren', 'KI-Integrationen'],
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80&auto=format&fit=crop' },
  { icon: Bug, title: 'Testing & QA', duration: '1–2 Wochen',
    desc: 'Edge-Cases, Lasttests und Failure-Szenarios – wir härten Ihre Automation vor dem Go-Live.',
    deliverables: ['Test-Suite', 'Stress-Tests', 'Failure-Playbooks'],
    image: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=600&q=80&auto=format&fit=crop' },
  { icon: Rocket, title: 'Go-Live & Schulung', duration: '1 Woche',
    desc: 'Produktiv-Schalten mit Monitoring & Alerting – inklusive Schulung Ihres Teams.',
    deliverables: ['Produktiv-Deployment', 'Schulung', 'Runbook'],
    image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&q=80&auto=format&fit=crop' },
  { icon: RefreshCw, title: 'Optimierung', duration: 'Laufend',
    desc: 'Kontinuierliche Verbesserung anhand realer Daten – mit monatlichen Reviews und neuen Features.',
    deliverables: ['Monats-Reviews', 'KPI-Reports', 'Continuous Improvement'],
    image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=600&q=80&auto=format&fit=crop' },
];

const FAQS = [
  { q: 'Wie schnell sehe ich erste Ergebnisse?', a: 'Eine erste produktive Automation läuft in der Regel innerhalb von 4–6 Wochen. Quick-Wins (z.B. einfache E-Mail- oder Lead-Workflows) können schon nach 1–2 Wochen live sein.' },
  { q: 'Welche Tools setzt ihr ein?', a: 'Wir sind tool-agnostisch und wählen je Use-Case das beste Werkzeug: n8n, Make, Zapier, Power Automate, Python, Node.js – plus moderne LLMs (GPT-5, Claude, Gemini) für KI-gestützte Schritte.' },
  { q: 'Ist das DSGVO-konform?', a: 'Ja. Wir bevorzugen EU-Hosting, schließen AVVs ab und können auf Wunsch komplett selbst-gehostete Setups (n8n self-hosted, lokale LLMs) liefern.' },
  { q: 'Was kostet eine Automation?', a: 'Einfache Workflows starten bei wenigen Tausend Euro, komplexe KI-Agenten-Systeme bei 20–50k €. Wir geben Ihnen nach dem kostenlosen Audit ein verbindliches Festpreis-Angebot.' },
  { q: 'Übernehmt ihr auch den laufenden Betrieb?', a: 'Ja – auf Wunsch übernehmen wir Monitoring, Wartung und Weiterentwicklung im Rahmen eines Service-Vertrags mit klaren SLAs.' },
];

// ---------- Helpers ----------
const baseCard = {
  background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 'var(--radius-xl)',
};
const reveal = (delay = 0) => ({
  opacity: 0,
  transform: 'translateY(30px)',
  transition: `all 0.8s ${delay}s ease`,
});
const sectionLabel = (text) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '8px 16px', background: 'rgba(255,107,0,0.08)', border: '1px solid rgba(255,107,0,0.2)', borderRadius: '999px', marginBottom: '20px' }}>
    <Sparkles size={14} color="var(--accent-primary)" />
    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', fontWeight: 700, color: 'var(--accent-primary)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>{text}</span>
  </div>
);

const AUTOMATIONKIPAGE_JSONLD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Service',
      name: 'KI-Automatisierung',
      serviceType: 'KI-Automatisierung',
      provider: { '@type': 'ProfessionalService', name: 'Zebick', url: SITE_URL },
      areaServed: 'CH',
      url: `${SITE_URL}/services/automatisierung-ki`,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Startseite', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Services', item: `${SITE_URL}/services` },
        { '@type': 'ListItem', position: 3, name: 'KI-Automatisierung', item: `${SITE_URL}/services/automatisierung-ki` },
      ],
    },
  ],
};

const AUTOMATIONKIPAGE_RELATED = [{ label: "Chatbot-Entwicklung", path: "/services/chatbot-entwicklung" }, { label: "Digitales Marketing & SEO", path: "/services/digitales-marketing-seo" }];

const AutomationKIPage = () => {
  const pageRef = useRef(null);
  const [openFaq, setOpenFaq] = useState(0);

  useSectionReveal(pageRef);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', overflowX: 'hidden' }} data-testid="automation-ki-page" ref={pageRef}>
      <Header />
      <Seo
        title="KI-Automatisierung für Unternehmen"
        description="Prozessautomatisierung mit KI – wir digitalisieren und automatisieren wiederkehrende Abläufe in Ihrem Unternehmen."
        path="/services/automatisierung-ki"
        jsonLd={AUTOMATIONKIPAGE_JSONLD}
      />

      <div className="sr-only"><h1>KI-Automatisierung für Unternehmen</h1></div>

      <ServiceAdvisorBlock serviceId="automation-ki" />


      {/* ========== WARUM AUTOMATISIERUNG ========== */}
      <section style={{ padding: '100px 0' }}>
        <div className="container">
          <div data-reveal style={{ ...reveal(), textAlign: 'center', marginBottom: '60px' }}>
            {sectionLabel('Warum Automatisierung?')}
            <h2 className="heading-1" style={{ fontSize: 'clamp(32px,4vw,48px)', fontWeight: 900 }}>Vom Bottleneck zum Wachstumshebel</h2>
          </div>
          <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '60px', alignItems: 'center' }}>
            <div data-reveal style={reveal()}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {[
                  'Routinen, die Stunden kosten, laufen in Sekunden',
                  'KI-Agenten arbeiten 24/7 – ohne Krankenstand',
                  'Datensynchronisation in Echtzeit zwischen allen Tools',
                  'Konsistente Qualität – nie wieder vergessene Follow-Ups',
                  'Skalierung ohne lineares Wachstum der Personalkosten',
                ].map((t) => (
                  <div key={t} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                    <CheckCircle size={22} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
            <div data-reveal style={{ ...reveal(0.1), ...baseCard, padding: '40px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {[
                  { label: 'Manuelle Aufgaben pro Woche', before: '38h', after: '6h' },
                  { label: 'Reaktionszeit auf Leads', before: '4h', after: '< 30s' },
                  { label: 'Fehlerquote in Datentransfers', before: '7%', after: '< 0.2%' },
                ].map((row) => (
                  <div key={row.label} style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px' }}>{row.label}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span style={{ fontSize: '22px', fontWeight: 800, color: '#ff5a5a', textDecoration: 'line-through' }}>{row.before}</span>
                      <ArrowRight size={18} color="var(--accent-primary)" />
                      <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent-primary)' }}>{row.after}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <style>{`@media (max-width:900px){.grid-2{grid-template-columns:1fr !important;}}`}</style>
      </section>

      {/* ========== STACK-SHOWCASE ========== */}
      <AutomationStackShowcase />

      {/* ========== AUTOMATISIERUNGS-PLATTFORMEN ========== */}
      <section className="section" data-testid="section-platforms" style={{ padding: '120px 0', background: 'var(--bg-primary)' }}>
        <div className="container">
          <div data-reveal style={{ ...reveal(), textAlign: 'center', marginBottom: '64px' }}>
            {sectionLabel('Plattformen')}
            <h2 className="heading-1" style={{ fontSize: '44px', fontWeight: 900, marginBottom: '16px' }}>Wo <span className="text-gradient">Ihre Automatisierung läuft.</span></h2>
            <p style={{ fontSize: '17px', color: 'var(--text-muted)', maxWidth: '640px', margin: '0 auto', lineHeight: 1.7 }}>
              Die richtige Plattform macht den Unterschied zwischen einem Workflow, der mitwächst – und einem, der bricht.
            </p>
          </div>

          <div className="compare-grid" data-keep-grid style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '56px' }}>
            {AUTOMATION_PLATFORMS.map((p, i) => (
              <div key={p.name} data-reveal style={{ ...baseCard, ...reveal(i * 0.08), padding: '28px' }}
                   onMouseEnter={(e) => { e.currentTarget.style.borderColor = p.color; e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = `0 20px 40px ${p.color}25`; }}
                   onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                  <img src={p.logo} alt={p.name} width="44" height="44" style={{ objectFit: 'contain' }} />
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700 }}>{p.name}</h3>
                    <span style={{ fontSize: '12px', color: p.color }}>{p.type}</span>
                  </div>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.7 }}>{p.desc}</p>
              </div>
            ))}
          </div>

          {/* Comparison Table */}
          <div data-reveal style={{ ...baseCard, ...reveal(0.2), padding: '0', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '720px' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,107,0,0.06)' }}>
                    {['Lösung', 'Typ', 'Beschreibung', 'Ideal für'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '20px 24px', fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent-primary)', fontWeight: 600, borderBottom: '1px solid var(--border-subtle)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {AUTOMATION_PLATFORMS.map((p, i) => (
                    <tr key={p.name} style={{ borderBottom: i < AUTOMATION_PLATFORMS.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                      <td style={{ padding: '20px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img src={p.logo} alt={p.name} width="28" height="28" style={{ objectFit: 'contain' }} />
                          <span style={{ fontWeight: 600 }}>{p.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '20px 24px', color: 'var(--text-secondary)' }}>{p.type}</td>
                      <td style={{ padding: '20px 24px', color: 'var(--text-muted)', fontSize: '14px' }}>{p.desc}</td>
                      <td style={{ padding: '20px 24px', color: 'var(--text-secondary)' }}>{p.fit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ========== LEISTUNGSSPEKTRUM ========== */}
      <section className="section" data-testid="section-leistungsspektrum" style={{ padding: '120px 0', background: 'var(--bg-secondary)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '20%', right: '-150px', width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(255,107,0,0.06) 0%, transparent 60%)', filter: 'blur(100px)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '60px', alignItems: 'center', marginBottom: '72px' }}>
            <div data-reveal style={{ opacity: 0, transform: 'translateY(30px)', transition: 'all 0.8s ease' }}>
              {sectionLabel('Leistungsspektrum')}
              <h2 className="heading-1" style={{ fontSize: '44px', fontWeight: 900, marginBottom: '20px', lineHeight: 1.1 }}>
                Automatisierung, <span className="text-gradient">komplett gedacht</span>
              </h2>
              <p style={{ fontSize: '17px', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                Von Workflows über Sales & CRM bis KI-Agenten: Prozesse, Daten und Entscheidungen greifen bei uns
                ineinander – statt isolierter Einzeltools bekommen Sie eine durchgängige Automatisierung.
              </p>
            </div>
            <div data-reveal style={{ opacity: 0, transform: 'translateY(30px)', transition: 'all 0.8s 0.15s ease', ...baseCard, padding: '32px', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', lineHeight: 1.8 }}>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FF5F57' }} />
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FFBD2E' }} />
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#28CA42' }} />
                <span style={{ marginLeft: '12px', color: 'var(--text-muted)', fontSize: '12px' }}>automation.py</span>
              </div>
              <TypingCode lines={AUTOMATION_CODE} />
            </div>
          </div>

          <ServiceTabsGrid tabs={LEISTUNGSSPEKTRUM_TABS} services={SERVICES} />
        </div>
      </section>

      {/* ========== TIMELINE (UNSER VORGEHEN) ========== */}
      <ModernTimeline
        eyebrow="Unser Vorgehen"
        title="Vom Audit bis zur produktiven Automation"
        subtitle="Strukturiert, iterativ und mit transparenten Meilensteinen."
        steps={PROCESS_STEPS}
      />

      {/* ========== BRANCHEN ========== */}
      <ServiceIndustries
        slug="automation-ki"
        defaultItems={INDUSTRIES.map((c) => ({
          icon: c.icon?.displayName || c.icon?.name || 'Building2',
          title: c.title, tag: c.tag, desc: c.desc, img: c.img,
        }))}
        defaultHeading="Automatisierung für jede Branche"
        defaultSubtitle="Jede Branche hat eigene Prozesse und Engpässe – wir automatisieren genau die richtigen."
        eyebrowLabel="Branchen"
      />

      {/* ========== VORTEILE ========== */}
      <ModernBenefits
        eyebrow="Vorteile"
        title="Was Sie davon haben"
        subtitle="Konkrete Business-Outcomes, die wir mit unseren Kunden erreichen."
        items={BENEFITS}
        image="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&q=80&auto=format&fit=crop"
      />

      {/* ========== FAQ ========== */}
      <section style={{ padding: '100px 0', background: 'var(--bg-secondary)' }}>
        <div className="container" style={{ maxWidth: '880px' }}>
          <div data-reveal style={{ ...reveal(), textAlign: 'center', marginBottom: '60px' }}>
            {sectionLabel('FAQ')}
            <h2 className="heading-1" style={{ fontSize: 'clamp(32px,4vw,48px)', fontWeight: 900 }}>Häufige Fragen</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {FAQS.map((f, i) => (
              <button key={i} onClick={() => setOpenFaq(openFaq === i ? -1 : i)} data-testid={`faq-${i}`}
                style={{ ...baseCard, padding: '24px 28px', textAlign: 'left', cursor: 'pointer', color: 'inherit', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
                  <span style={{ fontSize: '17px', fontWeight: 700 }}>{f.q}</span>
                  <ChevronDown size={20} color="var(--accent-primary)" style={{ transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s ease', flexShrink: 0 }} />
                </div>
                {openFaq === i && (
                  <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.7 }}>{f.a}</p>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      <ServiceContactForm
        defaultService="automation-ki"
        title="Bereit zu automatisieren?"
        subtitle="Lassen Sie uns Ihre Prozesse analysieren und die Quick-Wins identifizieren. Kostenlos & unverbindlich."
      />      <RelatedServices items={AUTOMATIONKIPAGE_RELATED} />      <Footer />
      <Chatbot />
    </div>
  );
};

// ------------ Subcomponents ------------

const AUTOMATION_BELT = [
  { name: 'n8n', logo: 'https://cdn.simpleicons.org/n8n/EA4B71', color: '#EA4B71' },
  { name: 'Zapier', logo: 'https://cdn.simpleicons.org/zapier/FF4F00', color: '#FF4F00' },
  { name: 'Python', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg', color: '#3776AB' },
  { name: 'Node.js', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg', color: '#339933' },
  { name: 'OpenAI', logo: 'https://cdn.simpleicons.org/openai/FFFFFF', color: '#10A37F' },
  { name: 'HubSpot', logo: 'https://cdn.simpleicons.org/hubspot/FF7A59', color: '#FF7A59' },
];

// ---- Automation/KI-specific stack-showcase visuals (unique per service — only
// the "Unser Automatisierungs-Stack" TechBelt card stays shared) ----

const NodeFlowChain = () => (
  <div className="aut-flow">
    {[{ l: 'Trigger', icon: <Zap size={12} /> }, { l: 'Aktion', icon: <Bot size={12} /> }, { l: 'Fertig', icon: <CheckCircle size={12} /> }].map((n, i) => (
      <React.Fragment key={n.l}>
        {i > 0 && <span className="aut-flow-line"><span className="aut-flow-dot" style={{ animationDelay: `${(i - 1) * 0.9}s` }} /></span>}
        <span className="aut-flow-node" style={{ animationDelay: `${i * 0.9}s` }}>{n.icon}<span>{n.l}</span></span>
      </React.Fragment>
    ))}
  </div>
);

const GearSync = () => (
  <div className="aut-gears">
    <span className="aut-gear aut-gear-big">⚙</span>
    <span className="aut-gear aut-gear-small">⚙</span>
  </div>
);

const AUT_TOOLS = [
  { n: 'Salesforce', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/salesforce.svg', color: '#00A1E0', mask: true },
  { n: 'Slack', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/slack.svg', color: '#4A154B', mask: true },
  { n: 'Google Sheets', logo: 'https://cdn.simpleicons.org/googlesheets/34A853', mask: false },
  { n: 'Gmail', logo: 'https://cdn.simpleicons.org/gmail/EA4335', mask: false },
];

const ToolSyncRow = () => (
  <div className="aut-toolsync">
    {AUT_TOOLS.map((t, i) => (
      <span key={t.n} className="aut-toolsync-node" style={{ animationDelay: `${i * 0.5}s` }}>
        {t.mask ? (
          <span style={{ width: 18, height: 18, display: 'inline-block', backgroundColor: t.color, WebkitMaskImage: `url(${t.logo})`, maskImage: `url(${t.logo})`, WebkitMaskSize: 'contain', maskSize: 'contain', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskPosition: 'center' }} />
        ) : (
          <img src={t.logo} alt={t.n} />
        )}
      </span>
    ))}
  </div>
);

const ApiStatusFlash = () => (
  <div className="aut-api">
    <span className="aut-api-line aut-api-req">POST /webhook</span>
    <span className="aut-api-line aut-api-res">200 OK</span>
  </div>
);

const ClockCycle24 = () => (
  <div className="aut-clock">
    <span className="aut-clock-face">
      <span className="aut-clock-hand" />
    </span>
    <span className="aut-clock-label">24/7 aktiv</span>
  </div>
);

const AutomationStackShowcase = () => (
  <StackShowcaseSection
    eyebrow="Unser Ansatz"
    title={<>Gebaut für <span style={{ color: 'var(--accent-primary)' }}>nahtlose</span> Automatisierung</>}
    subtitle="Von der Prozessanalyse bis zum laufenden Workflow – Automatisierung, die sich in Ihren Stack einfügt."
    testid="section-stack-showcase"
  >
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr 1fr', gap: '20px', marginBottom: '20px' }} className="asf-row">
      <StackCard title="Workflows von Tag eins"><NodeFlowChain /></StackCard>
      <StackCard title="Unser Automatisierungs-Workflow"><GearSync /></StackCard>
      <StackCard title="Verbindet alle Ihre Tools"><ToolSyncRow /></StackCard>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }} className="asf-row">
      <StackCard title="API-First, keine Blackbox"><ApiStatusFlash /></StackCard>
      <StackCard title="Unser Automatisierungs-Stack"><TechBelt tools={AUTOMATION_BELT} /></StackCard>
      <StackCard title="Workflows laufen 24/7"><ClockCycle24 /></StackCard>
    </div>
    <style>{`
      .aut-flow { display: flex; align-items: center; justify-content: center; width: 100%; height: 55px; gap: 4px; }
      .aut-flow-node { display: flex; flex-direction: column; align-items: center; gap: 3px; font-size: 8px; color: var(--text-muted); opacity: 0.4; animation: autNodeLight 2.7s ease-in-out infinite; }
      .aut-flow-node svg { color: var(--accent-primary); }
      @keyframes autNodeLight { 0%, 100% { opacity: 0.4; } 15%, 30% { opacity: 1; } }
      .aut-flow-line { position: relative; width: 24px; height: 2px; background: rgba(255,255,255,0.15); }
      .aut-flow-dot { position: absolute; top: -2px; left: 0; width: 6px; height: 6px; border-radius: 50%; background: var(--accent-primary); box-shadow: 0 0 6px var(--accent-primary); animation: autDotTravel 2.7s ease-in-out infinite; }
      @keyframes autDotTravel { 0%, 10% { left: 0; opacity: 0; } 20% { opacity: 1; } 45%, 100% { left: 100%; opacity: 0; } }

      .aut-gears { position: relative; display: flex; align-items: center; justify-content: center; width: 100%; height: 60px; }
      .aut-gear { position: absolute; font-size: 30px; color: var(--accent-primary); line-height: 1; }
      .aut-gear-big { animation: autGearSpin 6s linear infinite; }
      .aut-gear-small { font-size: 18px; color: rgba(255,255,255,0.4); transform: translate(18px, 14px); animation: autGearSpinRev 4s linear infinite; }
      @keyframes autGearSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      @keyframes autGearSpinRev { from { transform: translate(18px, 14px) rotate(360deg); } to { transform: translate(18px, 14px) rotate(0deg); } }

      .aut-toolsync { display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; height: 50px; }
      .aut-toolsync-node { width: 36px; height: 36px; border-radius: 9px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.06); animation: autToolPulse 2s ease-in-out infinite; }
      .aut-toolsync-node img { width: 18px; height: 18px; object-fit: contain; }
      @keyframes autToolPulse { 0%, 100% { background: rgba(255,255,255,0.06); box-shadow: none; } 25% { background: rgba(255,107,0,0.18); box-shadow: 0 0 10px rgba(255,107,0,0.3); } }

      .aut-api { display: flex; flex-direction: column; align-items: center; gap: 8px; width: 100%; height: 50px; justify-content: center; }
      .aut-api-line { font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 5px; opacity: 0; }
      .aut-api-req { color: #38bdf8; background: rgba(56,189,248,0.1); animation: autApiFlash 2.4s ease-in-out infinite; }
      .aut-api-res { color: #4ade80; background: rgba(74,222,128,0.1); animation: autApiFlash 2.4s ease-in-out infinite 1.2s; }
      @keyframes autApiFlash { 0%, 100% { opacity: 0; transform: translateY(4px); } 10%, 45% { opacity: 1; transform: translateY(0); } 55% { opacity: 0; } }

      .aut-clock { display: flex; flex-direction: column; align-items: center; gap: 6px; }
      .aut-clock-face { position: relative; width: 36px; height: 36px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.2); }
      .aut-clock-hand { position: absolute; left: 50%; top: 50%; width: 2px; height: 14px; background: var(--accent-primary); transform-origin: top; margin-left: -1px; animation: autClockSpin 3s linear infinite; }
      @keyframes autClockSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      .aut-clock-label { font-size: 10px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }

      @media (prefers-reduced-motion: reduce) {
        .aut-flow-node, .aut-flow-dot, .aut-gear-big, .aut-gear-small, .aut-toolsync-node, .aut-api-req, .aut-api-res, .aut-clock-hand { animation: none !important; }
      }
    `}</style>
  </StackShowcaseSection>
);

export default AutomationKIPage;
