import React, { useState, useEffect, useRef } from 'react';
import {
  Zap,
  Search,
  Smartphone,
  Monitor,
  Menu,
  Globe,
  TrendingUp,
  Sparkles,
  Lightbulb,
  Palette,
  Hammer,
  Bug,
  Rocket,
  RefreshCw,
  User,
  CheckCircle,
  ArrowRight,
  Server,
  Layout,
  Database,
  ShoppingCart,
  FileText,
  UtensilsCrossed,
  Building2,
  Briefcase,
  MapPin
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
import ServiceAdvisorBlock from '../../components/tools/ServiceAdvisorBlock';
import ServicePortfolioSection from '../../components/services/ServicePortfolioSection';
import ServiceIndustries from '../../components/services/ServiceIndustries';

// ------------ Constants (real logos via devicon CDN) ------------
const DEVICON = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons';

const FRONTEND_BASICS = [
  { name: 'HTML5', logo: `${DEVICON}/html5/html5-original.svg`, color: '#E34F26',
    desc: 'Die strukturelle Grundlage jeder Website. Semantisches HTML5 sorgt für saubere Inhalte, Barrierefreiheit und gutes SEO.' },
  { name: 'CSS3', logo: `${DEVICON}/css3/css3-original.svg`, color: '#1572B6',
    desc: 'Layout, Animationen, Responsivität. Moderne CSS-Features wie Grid, Flexbox und Custom Properties machen Designs flexibel.' },
  { name: 'JavaScript', logo: `${DEVICON}/javascript/javascript-original.svg`, color: '#F7DF1E',
    desc: 'Die Sprache des Webs. Bringt Interaktion, Logik und Dynamik in jede Website – vom Button-Klick bis zur Single-Page-App.' },
];

const FRONTEND_FRAMEWORKS = [
  { name: 'React', logo: `${DEVICON}/react/react-original.svg`, color: '#61DAFB',
    desc: 'Komponentenbasierte UI-Bibliothek von Meta. Ideal für komplexe, datengetriebene Anwendungen mit großem Ökosystem.' },
  { name: 'Vue.js', logo: `${DEVICON}/vuejs/vuejs-original.svg`, color: '#4FC08D',
    desc: 'Progressives Framework mit sanfter Lernkurve. Perfekt für mittlere Projekte und schnellen Einstieg ohne Overhead.' },
  { name: 'Angular', logo: `${DEVICON}/angularjs/angularjs-original.svg`, color: '#DD0031',
    desc: 'Enterprise-Framework von Google. TypeScript-first, opinionated und ausgelegt für große, langlebige Anwendungen.' },
];

const BACKEND_TECHS = [
  { name: 'Node.js', logo: `${DEVICON}/nodejs/nodejs-original.svg`, color: '#339933',
    desc: 'JavaScript auf dem Server. Event-driven, non-blocking I/O – ideal für Echtzeit-APIs, Microservices und I/O-lastige Apps.' },
  { name: 'PHP', logo: `${DEVICON}/php/php-original.svg`, color: '#777BB4',
    desc: 'Bewährter Klassiker des Webs. Treibt WordPress, Laravel und Symfony – ideal für CMS-getriebene Websites und Online-Shops.' },
  { name: 'Python', logo: `${DEVICON}/python/python-original.svg`, color: '#3776AB',
    desc: 'Lesbar, vielseitig, mächtig. Frameworks wie Django und FastAPI machen Python zur Top-Wahl für APIs, Data und ML.' },
  { name: 'Java', logo: `${DEVICON}/java/java-original.svg`, color: '#ED8B00',
    desc: 'Robust und plattformunabhängig. Spring Boot ist Industriestandard für skalierbare Backend-Systeme in Konzernen und Banken.' },
];

const DATABASES = [
  { name: 'MySQL', logo: `${DEVICON}/mysql/mysql-original.svg`, color: '#4479A1', type: 'Relational',
    use: 'Web-Apps, CMS, E-Commerce', scale: 'Hoch', license: 'Open Source',
    desc: 'Die weltweit beliebteste Open-Source-Datenbank. Schnell, zuverlässig und überall verfügbar.' },
  { name: 'PostgreSQL', logo: `${DEVICON}/postgresql/postgresql-original.svg`, color: '#4169E1', type: 'Relational',
    use: 'Komplexe Daten, Analytics, GIS', scale: 'Sehr hoch', license: 'Open Source',
    desc: 'Das mächtigste Open-Source-RDBMS. ACID-konform, erweiterbar und perfekt für anspruchsvolle Anwendungen.' },
  { name: 'MongoDB', logo: `${DEVICON}/mongodb/mongodb-original.svg`, color: '#47A248', type: 'Dokument-DB',
    use: 'Flexible Schemas, Realtime, IoT', scale: 'Horizontal', license: 'SSPL',
    desc: 'Dokumentenorientierte NoSQL-Datenbank. Flexible Schemas und horizontale Skalierung für moderne Apps.' },
  { name: 'SQLite', logo: `${DEVICON}/sqlite/sqlite-original.svg`, color: '#003B57', type: 'Embedded',
    use: 'Mobile, Desktop, kleine Apps', scale: 'Niedrig', license: 'Public Domain',
    desc: 'Serverless, dateibasiert, leichtgewichtig. Die meistgenutzte Datenbank-Engine der Welt – steckt in fast jedem Smartphone.' },
];

const PROCESS_STEPS = [
  { icon: Lightbulb, title: 'Planung',    duration: '1–2 Wochen',
    desc: 'Anforderungen klären, Ziele definieren, Konzept entwickeln. Wir verstehen erst Ihr Business, dann bauen wir.',
    deliverables: ['Anforderungs-Spezifikation', 'Sitemap & User-Flows', 'Tech-Stack & Roadmap'],
    image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&q=80&auto=format&fit=crop' },
  { icon: Palette,   title: 'Design',     duration: '2–4 Wochen',
    desc: 'Wireframes, UI/UX-Mockups, Designsystem. Jeder Pixel hat einen Grund.',
    deliverables: ['Wireframes', 'Designsystem & Mockups', 'Klickbarer Prototyp'],
    image: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=600&q=80&auto=format&fit=crop' },
  { icon: Hammer,    title: 'Entwicklung', duration: '4–10 Wochen',
    desc: 'Sauberer, dokumentierter Code. Frontend, Backend und Datenbank greifen wie ein Uhrwerk ineinander.',
    deliverables: ['Modulares Frontend', 'API & Datenbank-Schema', 'CMS & Admin-Bereich'],
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&q=80&auto=format&fit=crop' },
  { icon: Bug,       title: 'Testen',     duration: '1–2 Wochen',
    desc: 'Unit-, Integration- und End-to-End-Tests. Cross-Browser, Mobile, Performance, Security.',
    deliverables: ['Automatisierte Test-Suite', 'Cross-Browser-Report', 'Performance- & Security-Check'],
    image: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=600&q=80&auto=format&fit=crop' },
  { icon: Rocket,    title: 'Deployment', duration: '1 Woche',
    desc: 'CI/CD-Pipelines, Zero-Downtime-Releases. Vom Code bis Live in Minuten – nicht in Tagen.',
    deliverables: ['CI/CD-Pipeline', 'Production-Hosting', 'Domain, SSL & CDN'],
    image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=600&q=80&auto=format&fit=crop' },
  { icon: RefreshCw, title: 'Wartung',    duration: 'Laufend',
    desc: 'Monitoring, Updates, Weiterentwicklung. Eine Website ist nie fertig – sie wächst mit Ihnen.',
    deliverables: ['Uptime- & Error-Monitoring', 'Security-Patches & Backups', 'Content- & Feature-Updates'],
    image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&q=80&auto=format&fit=crop' },
];

const PROJECT_EXAMPLES = [
  { title: 'Unternehmenswebsite', tag: 'Corporate', desc: 'Professionelle Präsenz mit Fokus auf Markenwirkung, Vertrauen und Lead-Generierung.',
    img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&q=80&auto=format&fit=crop' },
  { title: 'Online-Shop', tag: 'E-Commerce', desc: 'Skalierbare Shopsysteme mit Payment-Integration, Inventar-Management und Conversion-Optimierung.',
    img: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&q=80&auto=format&fit=crop' },
  { title: 'Portfolio', tag: 'Creative', desc: 'Visuell starke Showcase-Seiten für Künstler, Studios und Freelancer mit immersiven Animationen.',
    img: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=900&q=80&auto=format&fit=crop' },
  { title: 'Blog & Magazin', tag: 'Content', desc: 'Performante Publikationsplattformen mit Headless-CMS, Newsletter und Kommentarsystem.',
    img: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=900&q=80&auto=format&fit=crop' },
  { title: 'SaaS-Plattform', tag: 'SaaS', desc: 'Mehrmandantenfähige SaaS-Anwendungen mit Auth, Abrechnung (Stripe), Dashboards und API – Cloud-ready.',
    img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&q=80&auto=format&fit=crop' },
  { title: 'CRM-System', tag: 'CRM', desc: 'Maßgeschneiderte CRM-Systeme – Leads, Pipelines, Aufgaben & Automationen für Sales & Service.',
    img: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=900&q=80&auto=format&fit=crop' },
  { title: 'Kundenportal', tag: 'Portal', desc: 'Self-Service-Portale mit SSO, Dokumenten-Downloads, Tickets und Echtzeit-Status – DSGVO-konform.',
    img: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=900&q=80&auto=format&fit=crop' },
  { title: 'Buchungssystem', tag: 'Booking', desc: 'Online-Buchung mit Kalender-Sync, Zahlung, Reminder-E-Mails und Admin-Backend.',
    img: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=900&q=80&auto=format&fit=crop' },
  { title: 'Mitgliederbereich', tag: 'Membership', desc: 'Geschützte Bereiche mit Abo-Stufen, Inhalten, Community-Funktionen und Stripe-Abrechnung.',
    img: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=900&q=80&auto=format&fit=crop' },
  { title: 'Web-App', tag: 'Web-App', desc: 'Komplexe Apps mit Auth, Echtzeit-Updates, Dashboards, KI-Funktionen und API-Anbindung.',
    img: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=900&q=80&auto=format&fit=crop' },
];

const BENEFITS = [
  { icon: Globe,      title: 'Weltweite Reichweite',  desc: '24/7 erreichbar – Kunden aus jeder Zeitzone, ohne geografische Grenzen.', points: ['Rund um die Uhr online', 'Globale Erreichbarkeit', 'Mehrsprachig möglich'] },
  { icon: TrendingUp, title: 'Skalierbarkeit',        desc: 'Von 100 zu 100.000 Nutzern – die Architektur wächst mit dem Erfolg.', points: ['Lastspitzen abfangen', 'Cloud-Skalierung', 'Zukunftssicher'] },
  { icon: Zap,        title: 'Automatisierung',       desc: 'Prozesse digitalisieren, Zeit sparen, Fehler reduzieren.', points: ['Weniger manuelle Arbeit', 'Fehlerreduktion', 'Effiziente Workflows'] },
  { icon: TrendingUp, title: 'Höhere Conversion',     desc: 'Datengetriebenes Design und A/B-Tests steigern messbar den Umsatz.', points: ['A/B-getestetes Design', 'Optimierte Funnels', 'Mehr Umsatz'] },
  { icon: Sparkles,   title: 'Bessere Nutzererfahrung', desc: 'Schnelle, intuitive Interfaces, die begeistern und Kunden binden.', points: ['Blitzschnelle Ladezeiten', 'Intuitive Bedienung', 'Höhere Kundenbindung'] },
];

const INDUSTRIES = [
  { icon: ShoppingCart, title: 'E-Commerce', tag: 'Retail', desc: 'Online-Shops mit schnellen Ladezeiten und nahtlosem Checkout, die wirklich verkaufen.',
    img: 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=900&q=80&auto=format&fit=crop' },
  { icon: UtensilsCrossed, title: 'Gastronomie & Hotellerie', tag: 'Food', desc: 'Speisekarten, Tischreservierung und Buchungssysteme direkt auf der eigenen Website.',
    img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&q=80&auto=format&fit=crop' },
  { icon: Building2, title: 'Immobilien', tag: 'Real Estate', desc: 'Exposés, Objektsuche und virtuelle Besichtigungen, die überzeugen.',
    img: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=900&q=80&auto=format&fit=crop' },
  { icon: Briefcase, title: 'B2B & SaaS', tag: 'Business', desc: 'Professionelle Plattformen mit klarer Positionierung für lange Sales-Cycles.',
    img: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=900&q=80&auto=format&fit=crop' },
  { icon: MapPin, title: 'Lokale Dienstleister', tag: 'Local', desc: 'Terminbuchung und lokale Sichtbarkeit für Handwerk, Praxen und Studios.',
    img: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=900&q=80&auto=format&fit=crop' },
  { icon: Rocket, title: 'Startups', tag: 'Startup', desc: 'Schnelle, skalierbare Websites für den Markteintritt ohne Umwege.',
    img: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=900&q=80&auto=format&fit=crop' },
];

const WHY_ICONS = [
  { logo: `${DEVICON}/react/react-original.svg`, label: 'React', color: '#61DAFB' },
  { logo: `${DEVICON}/nodejs/nodejs-original.svg`, label: 'Node.js', color: '#339933' },
  { logo: 'https://cdn.simpleicons.org/docker/2496ED', label: 'Docker', color: '#2496ED' },
  { logo: 'https://cdn.simpleicons.org/stripe/635BFF', label: 'Stripe', color: '#635BFF' },
  { logo: 'https://cdn.simpleicons.org/wordpress/21759B', label: 'WordPress', color: '#21759B' },
  { logo: `${DEVICON}/mongodb/mongodb-original.svg`, label: 'MongoDB', color: '#47A248' },
];

const WEB_SERVICES = [
  { tabId: 'build', icon: Layout, title: 'Frontend-Entwicklung', image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=700&q=80&auto=format&fit=crop', desc: 'Maßgeschneiderte Interfaces mit React, Vue oder Angular – komponentenbasiert, performant, pixelgenau.', features: ['React / Vue / Angular', 'Responsive Design', 'Animationen & Micro-UX', 'Barrierefreiheit'] },
  { tabId: 'build', icon: Server, title: 'Backend & API-Entwicklung', image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=700&q=80&auto=format&fit=crop', desc: 'Robuste Server-Logik und saubere REST- oder GraphQL-APIs, die Ihr Frontend zuverlässig versorgen.', features: ['REST & GraphQL', 'Auth & Rollen', 'Microservices'] },
  { tabId: 'build', icon: Database, title: 'Datenbank-Architektur', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=700&q=80&auto=format&fit=crop', desc: 'Durchdachtes Schema-Design für SQL- und NoSQL-Datenbanken, das mit Ihren Daten mitwächst.' },
  { tabId: 'commerce', icon: ShoppingCart, logo: 'https://cdn.simpleicons.org/stripe/635BFF', brandColor: '#635BFF', title: 'E-Commerce-Integration', image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=700&q=80&auto=format&fit=crop', desc: 'Shopsysteme mit Stripe- oder PayPal-Zahlungen, Lagerverwaltung und Checkout-Optimierung.', features: ['Stripe / PayPal', 'Produktkatalog', 'Checkout-Flow', 'Bestandsführung'] },
  { tabId: 'commerce', icon: FileText, logo: 'https://cdn.simpleicons.org/wordpress/21759B', brandColor: '#21759B', title: 'CMS & Content-Pflege', image: 'https://images.unsplash.com/photo-1542435503-956c469947f6?w=700&q=80&auto=format&fit=crop', desc: 'Headless oder klassisches CMS, mit dem Ihr Team Inhalte selbst pflegt – ohne Entwickler.' },
  { tabId: 'quality', icon: Zap, title: 'Performance-Optimierung', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=700&q=80&auto=format&fit=crop', desc: 'Lighthouse-Scores 95+, Core Web Vitals im grünen Bereich, Ladezeiten unter 2 Sekunden.', features: ['Lighthouse 95+', 'Core Web Vitals', 'Lazy-Loading', 'CDN & Caching'] },
  { tabId: 'quality', icon: Search, title: 'SEO & Sichtbarkeit', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=700&q=80&auto=format&fit=crop', desc: 'Semantisches HTML, strukturierte Daten und technisches SEO – sichtbar bei Google von Tag eins.' },
  { tabId: 'ops', icon: Rocket, logo: 'https://cdn.simpleicons.org/docker/2496ED', brandColor: '#2496ED', title: 'Hosting & Deployment', image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=700&q=80&auto=format&fit=crop', desc: 'CI/CD-Pipelines und containerisierte Deployments – vom Code bis live in Minuten.', features: ['CI/CD-Pipeline', 'Docker', 'Zero-Downtime-Releases'] },
  { tabId: 'ops', icon: RefreshCw, title: 'Wartung & Support', image: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=700&q=80&auto=format&fit=crop', desc: 'Monitoring, Security-Patches und Weiterentwicklung – Ihre Website bleibt sicher und aktuell.' },
];

const WEB_SERVICE_TABS = [
  { id: 'build', label: 'Aufbau' },
  { id: 'commerce', label: 'Commerce & Content' },
  { id: 'quality', label: 'Qualität' },
  { id: 'ops', label: 'Betrieb' },
];

const DEPLOY_CODE = [
  { indent: 0, segments: [{ t: '@pipeline.', c: '#FF6B00' }, { t: 'on_push', c: '#61DAFB' }, { t: '(branch=' }, { t: '"main"', c: '#98C379' }, { t: ')' }] },
  { indent: 0, segments: [{ t: 'async def', c: '#C678DD' }, { t: ' ' }, { t: 'deploy', c: '#61DAFB' }, { t: '(commit: ' }, { t: 'Commit', c: '#E5C07B' }, { t: '):' }] },
  { indent: 20, segments: [{ t: 'await', c: '#C678DD' }, { t: ' run_tests(commit)' }] },
  { indent: 20, segments: [{ t: 'build = ' }, { t: 'await', c: '#C678DD' }, { t: ' docker.build(commit)' }] },
  { indent: 20, segments: [{ t: 'return', c: '#C678DD' }, { t: ' cdn.release(build)' }] },
];

// ------------ Reusable card styles ------------
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
const WEBDEVELOPMENTPAGE_JSONLD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Service',
      name: 'Webentwicklung',
      serviceType: 'Webentwicklung',
      provider: { '@type': 'ProfessionalService', name: 'Zebick', url: SITE_URL },
      areaServed: 'CH',
      url: `${SITE_URL}/services/webentwicklung`,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Startseite', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Services', item: `${SITE_URL}/services` },
        { '@type': 'ListItem', position: 3, name: 'Webentwicklung', item: `${SITE_URL}/services/webentwicklung` },
      ],
    },
  ],
};

const WEBDEVELOPMENTPAGE_RELATED = [{ label: "UI/UX Design", path: "/services/ui-ux-design" }, { label: "Digitales Marketing & SEO", path: "/services/digitales-marketing-seo" }, { label: "Server & Systeme", path: "/services/server-systeme" }, { label: "Cyber Security", path: "/services/cyber-security" }];

const WebDevelopmentPage = () => {
  const pageRef = useRef(null);
  const [activeProcess, setActiveProcess] = useState(0);
  const [mockupMobile, setMockupMobile] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setActiveProcess(p => (p + 1) % PROCESS_STEPS.length), 3500);
    return () => clearInterval(id);
  }, []);

  useSectionReveal(pageRef);

  return (
    <div className="page-transition" ref={pageRef}>
      <Header />
      <Seo
        title="Webentwicklung & moderne Websites"
        description="Professionelle Webentwicklung für schnelle, moderne und responsive Websites – von der Konzeption bis zum sicheren produktiven Betrieb."
        path="/services/webentwicklung"
        jsonLd={WEBDEVELOPMENTPAGE_JSONLD}
      />

      <div className="sr-only"><h1>Webentwicklung & moderne Websites</h1></div>

      <ServiceAdvisorBlock serviceId="web-development" />


      {/* ========== WARUM WEBENTWICKLUNG ========== */}
      <section className="section" data-testid="section-why-webdev" style={{ padding: '120px 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '15%', right: '5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(255,107,0,0.07) 0%, transparent 60%)', filter: 'blur(100px)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative' }}>
          <div className="why-webdev-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: '64px', alignItems: 'center' }}>

            <div data-reveal style={{ opacity: 0, transform: 'translateY(30px)', transition: 'all 0.8s ease' }}>
              {sectionLabel('Warum Webentwicklung?')}
              <h2 className="heading-1" style={{ fontSize: '48px', fontWeight: 900, lineHeight: 1.1, marginBottom: '24px' }}>
                Ihre Website ist Ihr<br /><span className="text-gradient">24/7-Verkäufer.</span>
              </h2>
              <p style={{ fontSize: '17px', color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '40px' }}>
                Eine professionelle Website ist heute Pflicht: der erste Berührungspunkt mit Kunden, Lead-Generator
                rund um die Uhr und oft der wichtigste Verkaufskanal. Schnell, sicher und mobil – sonst ist der Kunde weg.
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

            {/* BROWSER MOCKUP — realistic mini-website preview */}
            <div data-reveal style={{ opacity: 0, transform: 'translateY(30px)', transition: 'all 0.8s 0.15s ease', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
              {/* background depth: grid + glow + drifting lines, kept behind and well clear of the content */}
              <div className="wd-bg-grid" aria-hidden="true" style={{ position: 'absolute', inset: '-50px', pointerEvents: 'none' }} />
              <svg aria-hidden="true" style={{ position: 'absolute', inset: '-50px', width: 'calc(100% + 100px)', height: 'calc(100% + 100px)', pointerEvents: 'none' }} viewBox="0 0 600 600" preserveAspectRatio="none">
                <path className="wd-bg-line" d="M-20 120 Q 300 60 620 160" stroke="rgba(255,107,0,0.18)" strokeWidth="1" fill="none" pathLength="1" />
                <path className="wd-bg-line" d="M-20 480 Q 300 540 620 440" stroke="rgba(255,107,0,0.12)" strokeWidth="1" fill="none" pathLength="1" style={{ animationDelay: '0.7s' }} />
              </svg>
              <div className="wd-mockup-scale" style={{ position: 'relative', width: '100%', maxWidth: mockupMobile ? '300px' : '560px', zIndex: 1, transition: 'max-width 0.45s cubic-bezier(0.4,0,0.2,1)' }}>
                <div style={{ position: 'absolute', inset: '-30px', background: 'radial-gradient(circle, rgba(255,107,0,0.2) 0%, transparent 60%)', filter: 'blur(40px)' }} />
                <div style={{ position: 'relative', background: 'linear-gradient(145deg, #1a1a1a 0%, #0a0a0a 100%)', borderRadius: '14px', border: '1px solid #2a2a2a', boxShadow: '0 30px 80px rgba(0,0,0,0.6)', overflow: 'hidden' }}>
                  {/* topbar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px', background: '#151515', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', gap: '7px' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FF5F57' }} />
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FEBC2E' }} />
                      <div className="wd-live-dot" style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#28C840' }} />
                    </div>
                    {!mockupMobile && (
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '12px', color: '#888', fontFamily: 'JetBrains Mono, monospace' }}>
                        <Globe size={12} color="#FF6B00" />
                        <span>https://</span><span style={{ color: '#fff' }}>your-business</span><span>.de</span>
                        <span className="wd-url-cursor" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setMockupMobile((v) => !v)}
                      aria-pressed={mockupMobile}
                      aria-label="Demo: Ansicht zwischen Desktop und Mobile umschalten"
                      style={{
                        marginLeft: mockupMobile ? 'auto' : 0,
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '5px 9px', background: 'rgba(255,107,0,0.12)',
                        border: '1px solid rgba(255,107,0,0.35)', borderRadius: '6px',
                        cursor: 'pointer', fontFamily: 'inherit',
                      }}
                    >
                      {mockupMobile ? <Smartphone size={12} color="#FF6B00" /> : <Monitor size={12} color="#FF6B00" />}
                      <span style={{ fontSize: '9px', color: '#FF6B00', fontWeight: 700 }}>{mockupMobile ? 'Mobile' : 'Desktop'}</span>
                    </button>
                    <RefreshCw className="wd-refresh-spin" size={14} color="#666" />
                  </div>
                  {/* load progress */}
                  <div style={{ height: '2px', background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
                    <div className="wd-load-bar" style={{ height: '100%', background: 'linear-gradient(90deg, var(--accent-primary), #FFCA28)' }} />
                  </div>
                  {/* content */}
                  <div style={{ padding: '22px', background: 'linear-gradient(180deg, #0a0a0a 0%, #050505 100%)' }}>
                    {/* nav */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px', paddingBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                        <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: 'linear-gradient(135deg, #FF6B00, #cc5500)', flexShrink: 0 }} />
                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>YourBiz</span>
                      </div>
                      {mockupMobile ? (
                        <Menu size={16} color="#888" />
                      ) : (
                        <div style={{ display: 'flex', gap: '11px' }}>
                          {['Startseite', 'Leistungen', 'Über uns', 'Projekte', 'Kontakt'].map((l, k) => (
                            <span key={l} className="wd-nav-in" style={{ fontSize: '8px', color: k === 0 ? '#fff' : '#888', fontWeight: k === 0 ? 700 : 500, animationDelay: `${0.15 + k * 0.08}s` }}>{l}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* hero */}
                    <div style={{ marginBottom: '22px' }}>
                      <div className="wd-badge-in" style={{ display: 'inline-block', padding: '4px 10px', background: 'rgba(255,107,0,0.15)', border: '1px solid rgba(255,107,0,0.3)', borderRadius: '999px', fontSize: '9px', color: '#FF6B00', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '12px' }}>NEU · 2026</div>
                      <h3 className="wd-hero-in" style={{ fontSize: '19px', fontWeight: 900, lineHeight: 1.25, margin: '0 0 10px', letterSpacing: '-0.01em' }}>
                        <span style={{ color: '#fff' }}>Moderne Websites, die</span><br />
                        <span style={{ background: 'linear-gradient(90deg, #FF6B00, #FFCA28)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Eindruck hinterlassen.</span>
                      </h3>
                      <p className="wd-hero-in" style={{ fontSize: '10px', color: '#999', lineHeight: 1.6, margin: '0 0 14px', maxWidth: '340px', animationDelay: '0.1s' }}>
                        Professionelle digitale Präsenz mit modernem Design, schnellen Ladezeiten und optimaler Darstellung auf jedem Gerät.
                      </p>
                      <div className="wd-hero-in" style={{ display: 'flex', gap: '10px', marginBottom: '12px', animationDelay: '0.2s' }}>
                        <div className="wd-cta-btn" style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '9px 16px', background: 'linear-gradient(135deg, #FF6B00, #cc5500)', borderRadius: '6px', fontSize: '10px', color: '#000', fontWeight: 800, boxShadow: '0 6px 16px rgba(255,107,0,0.4)', position: 'relative', overflow: 'hidden' }}>
                          Jetzt starten <ArrowRight size={11} strokeWidth={3} />
                        </div>
                        <div style={{ padding: '9px 16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', fontSize: '10px', color: '#fff', fontWeight: 600 }}>Projekt ansehen</div>
                      </div>
                      <div className="wd-hero-in" style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', animationDelay: '0.3s' }}>
                        {['Responsive', 'SEO-ready', 'Performance optimiert', 'SSL'].map((t) => (
                          <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '8px', color: '#888' }}>
                            <CheckCircle size={9} color="#28C840" />{t}
                          </span>
                        ))}
                      </div>
                    </div>
                    {/* services row */}
                    <div data-keep-grid style={{ display: 'grid', gridTemplateColumns: mockupMobile ? '1fr' : 'repeat(3, 1fr)', gap: '8px', marginBottom: '18px', transition: 'grid-template-columns 0.3s ease' }}>
                      {[
                        { icon: Palette, label: 'Webdesign' },
                        { icon: Hammer, label: 'Entwicklung' },
                        { icon: User, label: 'Support' },
                      ].map((s, i) => (
                        <div key={s.label} className="wd-service-card" style={{ padding: '10px 8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', textAlign: 'center', transition: 'all 0.25s ease', animationDelay: `${0.4 + i * 0.1}s` }}>
                          <s.icon size={13} color="#FF6B00" style={{ marginBottom: '6px' }} />
                          <div style={{ fontSize: '8px', color: '#ccc', fontWeight: 600 }}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                    {/* live visitors */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '14px', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}>
                      <span className="wd-live-dot" style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#28C840' }} />
                      <span style={{ fontSize: '10px', color: '#aaa' }}><strong style={{ color: '#fff' }}>247</strong> Besucher gerade online</span>
                    </div>
                  </div>
                  {/* footer */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 22px', borderTop: '1px solid rgba(255,255,255,0.05)', background: '#0a0a0a' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '14px', height: '14px', borderRadius: '4px', background: 'linear-gradient(135deg, #FF6B00, #cc5500)' }} />
                      <span style={{ fontSize: '8px', color: '#666' }}>© 2026 YourBiz</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {[Globe, Search, User].map((Ic, k) => (<Ic key={k} size={10} color="#555" />))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
        <style>{`
          @media (max-width: 900px) {
            .why-webdev-grid { grid-template-columns: 1fr !important; gap: 0 !important; }
            .why-webdev-grid > div:first-child { display: contents; }
            .why-webdev-grid > div:last-child { margin-top: 48px; }
            .svc-icon-row { order: 1; margin-top: 32px; }
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
          .wd-url-cursor { display: inline-block; width: 1px; height: 12px; background: #FF6B00; margin-left: 2px; animation: wdBlink 1.1s step-end infinite; }
          @keyframes wdBlink { 50% { opacity: 0; } }
          .wd-badge-in { animation: wdFadeUp 0.5s 0.3s ease both; }
          @keyframes wdFadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
          .wd-skel { position: relative; overflow: hidden; background: rgba(255,255,255,0.08); }
          .wd-skel::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent); transform: translateX(-100%); animation: wdShimmer 2.2s ease-in-out infinite; }
          @keyframes wdShimmer { to { transform: translateX(100%); } }
          .wd-cta-btn::after { content: ''; position: absolute; top: 0; left: -150%; width: 60%; height: 100%; background: linear-gradient(120deg, transparent, rgba(255,255,255,0.55), transparent); animation: wdShine 2.8s ease-in-out infinite; }
          @keyframes wdShine { to { left: 150%; } }
          .wd-live-dot { animation: wdDotPulse 1.8s ease-in-out infinite; box-shadow: 0 0 0 0 rgba(40,200,64,0.5); }
          @keyframes wdDotPulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(40,200,64,0.5); } 50% { box-shadow: 0 0 0 4px rgba(40,200,64,0); } }
          .wd-bg-grid { background-image: linear-gradient(rgba(255,107,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,107,0,0.05) 1px, transparent 1px); background-size: 28px 28px; -webkit-mask-image: radial-gradient(ellipse at center, black 40%, transparent 75%); mask-image: radial-gradient(ellipse at center, black 40%, transparent 75%); }
          @media (max-width: 640px) {
            .wd-mockup-scale { width: 480px !important; max-width: 480px !important; zoom: 0.7; }
          }
          .wd-bg-line { stroke-dasharray: 1; stroke-dashoffset: 1; animation: wdLineDraw 2.4s ease-out forwards, wdLineDrift 6s ease-in-out 2.4s infinite; }
          @keyframes wdLineDraw { to { stroke-dashoffset: 0; } }
          @keyframes wdLineDrift { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(8px); } }
          .wd-refresh-spin { animation: wdRefreshSpin 3s linear infinite; transform-origin: center; }
          @keyframes wdRefreshSpin { to { transform: rotate(360deg); } }
          .wd-load-bar { width: 0; animation: wdLoadBar 1.8s 0.1s ease-out forwards; }
          @keyframes wdLoadBar { 0% { width: 0; } 70% { width: 100%; } 100% { width: 100%; opacity: 0; } }
          .wd-nav-in { opacity: 0; animation: wdFadeUp 0.4s ease both; }
          .wd-hero-in { opacity: 0; animation: wdFadeUp 0.5s ease both; }
          .wd-service-card { opacity: 0; animation: wdFadeUp 0.5s ease both; }
          .wd-service-card:hover { border-color: rgba(255,107,0,0.4) !important; background: rgba(255,107,0,0.06) !important; transform: translateY(-3px); }
          @media (prefers-reduced-motion: reduce) {
            .wd-url-cursor, .wd-badge-in, .wd-skel::after, .wd-cta-btn::after, .wd-live-dot,
            .wd-bg-line, .wd-refresh-spin, .wd-load-bar, .wd-nav-in, .wd-hero-in, .wd-service-card {
              animation: none !important; opacity: 1 !important; width: auto !important;
            }
          }
        `}</style>
      </section>

      {/* ========== STACK-SHOWCASE ========== */}
      <WebStackShowcase />

      {/* ========== LEISTUNGSSPEKTRUM ========== */}
      <section className="section" data-testid="section-leistungsspektrum" style={{ padding: '120px 0', background: 'var(--bg-secondary)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '20%', right: '-150px', width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(255,107,0,0.06) 0%, transparent 60%)', filter: 'blur(100px)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '60px', alignItems: 'center', marginBottom: '72px' }}>
            <div data-reveal style={{ opacity: 0, transform: 'translateY(30px)', transition: 'all 0.8s ease' }}>
              {sectionLabel('Leistungsspektrum')}
              <h2 className="heading-1" style={{ fontSize: '44px', fontWeight: 900, marginBottom: '20px', lineHeight: 1.1 }}>
                Webentwicklung, <span className="text-gradient">komplett gedacht</span>
              </h2>
              <p style={{ fontSize: '17px', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                Von Frontend bis Deployment: Aufbau, Commerce, Qualität und Betrieb greifen bei uns ineinander –
                statt isolierter Gewerke bekommen Sie eine Website aus einer Hand.
              </p>
            </div>
            <div data-reveal style={{ opacity: 0, transform: 'translateY(30px)', transition: 'all 0.8s 0.15s ease', ...baseCard, padding: '32px', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', lineHeight: 1.8 }}>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FF5F57' }} />
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FFBD2E' }} />
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#28CA42' }} />
                <span style={{ marginLeft: '12px', color: 'var(--text-muted)', fontSize: '12px' }}>deploy.py</span>
              </div>
              <TypingCode lines={DEPLOY_CODE} />
            </div>
          </div>

          <ServiceTabsGrid tabs={WEB_SERVICE_TABS} services={WEB_SERVICES} />
        </div>
      </section>

      {/* ========== FRONTEND ========== */}
      <section className="section" data-testid="section-frontend" style={{ padding: '120px 0', background: 'var(--bg-primary)' }}>
        <div className="container">
          <div data-reveal style={{ opacity: 0, transform: 'translateY(30px)', transition: 'all 0.8s ease', textAlign: 'center', marginBottom: '72px' }}>
            {sectionLabel('Frontend')}
            <h2 className="heading-1" style={{ fontSize: '44px', fontWeight: 900, marginBottom: '16px' }}>Die <span className="text-gradient">sichtbare Schicht</span></h2>
            <p style={{ fontSize: '17px', color: 'var(--text-muted)', maxWidth: '640px', margin: '0 auto', lineHeight: 1.7 }}>
              Was im Browser passiert. Drei Sprachen bilden das Fundament, drei Frameworks dominieren die moderne Entwicklung.
            </p>
          </div>

          <ToolDock tools={[...FRONTEND_BASICS, ...FRONTEND_FRAMEWORKS]} />
        </div>
      </section>

      {/* ========== DATENBANKEN ========== */}
      <section className="section" data-testid="section-databases" style={{ padding: '120px 0', background: 'var(--bg-primary)' }}>
        <div className="container">
          <div data-reveal style={{ opacity: 0, transform: 'translateY(30px)', transition: 'all 0.8s ease', textAlign: 'center', marginBottom: '64px' }}>
            {sectionLabel('Datenbanken')}
            <h2 className="heading-1" style={{ fontSize: '44px', fontWeight: 900, marginBottom: '16px' }}>Wo <span className="text-gradient">Daten leben.</span></h2>
            <p style={{ fontSize: '17px', color: 'var(--text-muted)', maxWidth: '640px', margin: '0 auto', lineHeight: 1.7 }}>
              Die richtige Datenbank macht den Unterschied zwischen einer App, die skaliert – und einer, die fällt.
            </p>
          </div>

          <div className="compare-grid" data-keep-grid style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '56px' }}>
            {DATABASES.map((db, i) => (
              <div key={db.name} data-reveal style={{ ...baseCard, padding: '28px', opacity: 0, transform: 'translateY(30px)', transition: `all 0.8s ${i * 0.08}s ease` }}
                   onMouseEnter={(e) => { e.currentTarget.style.borderColor = db.color; e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = `0 20px 40px ${db.color}25`; }}
                   onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                  <img src={db.logo} alt={db.name} width="44" height="44" style={{ objectFit: 'contain' }} />
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700 }}>{db.name}</h3>
                    <span style={{ fontSize: '12px', color: db.color }}>{db.type}</span>
                  </div>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.7 }}>{db.desc}</p>
              </div>
            ))}
          </div>

          {/* Comparison Table */}
          <div data-reveal style={{ ...baseCard, padding: '0', overflow: 'hidden', opacity: 0, transform: 'translateY(30px)', transition: 'all 0.8s 0.2s ease' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '720px' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,107,0,0.06)' }}>
                    {['Datenbank', 'Typ', 'Anwendung', 'Skalierung', 'Lizenz'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '20px 24px', fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent-primary)', fontWeight: 600, borderBottom: '1px solid var(--border-subtle)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DATABASES.map((db, i) => (
                    <tr key={db.name} style={{ borderBottom: i < DATABASES.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                      <td style={{ padding: '20px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img src={db.logo} alt={db.name} width="28" height="28" style={{ objectFit: 'contain' }} />
                          <span style={{ fontWeight: 600 }}>{db.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '20px 24px', color: 'var(--text-secondary)' }}>{db.type}</td>
                      <td style={{ padding: '20px 24px', color: 'var(--text-muted)', fontSize: '14px' }}>{db.use}</td>
                      <td style={{ padding: '20px 24px', color: 'var(--text-secondary)' }}>{db.scale}</td>
                      <td style={{ padding: '20px 24px', color: 'var(--text-muted)', fontSize: '14px' }}>{db.license}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ========== ENTWICKLUNGSPROZESS (Timeline) ========== */}
      {/* ========== UNSER VORGEHEN ========== */}
      <ModernTimeline
        eyebrow="Entwicklungsprozess"
        title="Von der Idee zur Live-Website"
        subtitle="Sechs strukturierte Phasen – transparent, planbar, mit klaren Meilensteinen."
        background="var(--bg-secondary)"
        steps={PROCESS_STEPS}
      />

      {/* ========== BRANCHEN ========== */}
      <ServiceIndustries
        slug="web-development"
        defaultItems={INDUSTRIES.map((c) => ({
          icon: c.icon?.displayName || c.icon?.name || 'Building2',
          title: c.title, tag: c.tag, desc: c.desc, img: c.img,
        }))}
        defaultHeading="Websites für jede Branche"
        defaultSubtitle="Jede Branche hat eigene Anforderungen an Tempo, Vertrauen und Conversion – wir kennen sie."
        eyebrowLabel="Branchen"
      />

      {/* ========== VORTEILE ========== */}
      <ModernBenefits
        eyebrow="Vorteile"
        title="Warum sich moderne Webentwicklung lohnt"
        accentWord="moderne Webentwicklung"
        subtitle="Eine professionelle Website ist Ihr wichtigster digitaler Vertriebskanal – rund um die Uhr."
        items={BENEFITS}
        image="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=900&q=80&auto=format&fit=crop"
        testid="section-benefits"
      />

      {/* ========== PROJEKTBEISPIELE — aus Portfolio (Admin) ========== */}
      <ServicePortfolioSection
        serviceId="web-development"
        fallbackExamples={PROJECT_EXAMPLES}
        title="Was wir"
        accentWord="bauen können"
        subtitle="Vom kleinen Portfolio bis zur skalierbaren SaaS-Plattform – echte Projekte aus unserem Portfolio."
        testid="section-projects"
        showCategoryFilter
      />

      {/* ========== KONTAKT ========== */}
      <ServiceContactForm
        defaultService="web-development"
        title="Lass uns sprechen."
        subtitle="Egal ob neues Projekt, Relaunch oder einfach zweite Meinung – wir antworten innerhalb von 24 Stunden."
      />      <RelatedServices items={WEBDEVELOPMENTPAGE_RELATED} />      <Footer />
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
        onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
        onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
      />
    </div>
  </div>
);

// ------------ Subcomponents ------------

const WEB_BELT = [...FRONTEND_FRAMEWORKS, ...BACKEND_TECHS].filter((t) =>
  ['React', 'Vue.js', 'Node.js', 'Python', 'PHP', 'Java'].includes(t.name)
);

// ---- Web-Development-specific stack-showcase visuals (unique per service —
// only the "Unser Tech-Stack" TechBelt card stays shared) ----

const PerfGauge = () => (
  <div className="web-gauge">
    <svg viewBox="0 0 80 80" className="web-gauge-svg" aria-hidden>
      <circle cx="40" cy="40" r="34" className="web-gauge-track" />
      <circle cx="40" cy="40" r="34" className="web-gauge-fill" />
    </svg>
    <div className="web-gauge-label">98<span>/100</span></div>
  </div>
);

const DeployTerminal = () => (
  <div className="web-terminal">
    <div className="web-terminal-dots"><span /><span /><span /></div>
    <div className="web-terminal-lines">
      {['$ git push origin main', '✓ Build erfolgreich', '✓ Tests bestanden', '🚀 Live in 12s'].map((l, i) => (
        <div key={i} className="web-terminal-line" style={{ animationDelay: `${i * 0.75}s` }}>{l}</div>
      ))}
    </div>
  </div>
);

const WEB_LAYERS = [
  { l: 'Frontend', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg' },
  { l: 'API', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg' },
  { l: 'Datenbank', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg' },
];

const LayerStack = () => (
  <div className="web-layers">
    {WEB_LAYERS.map((row, i) => (
      <div key={row.l} className="web-layer" style={{ animationDelay: `${i * 0.5}s` }}>
        <img src={row.logo} alt={row.l} className="web-layer-logo" />
        {row.l}
      </div>
    ))}
  </div>
);

const CleanCodeLines = () => (
  <div className="web-code-lines">
    {[70, 45, 90, 32, 58].map((w, i) => (
      <span key={i} className="web-code-line" style={{ width: `${w}%`, animationDelay: `${i * 0.18}s` }} />
    ))}
    <div className="web-code-badge">0 Errors</div>
  </div>
);

const SpeedBar = () => (
  <div className="web-speed">
    <div className="web-speed-track"><div className="web-speed-fill" /></div>
    <div className="web-speed-label">0.8s</div>
  </div>
);

const WebStackShowcase = () => (
  <StackShowcaseSection
    eyebrow="Unser Stack"
    title={<>Gebaut für <span style={{ color: 'var(--accent-primary)' }}>performante</span> Websites</>}
    subtitle="Von HTML bis zur Datenbank – sauberer Code auf jeder Ebene."
    testid="section-stack-showcase"
  >
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr 1fr', gap: '20px', marginBottom: '20px' }} className="asf-row">
      <StackCard title="Performance von Tag eins"><PerfGauge /></StackCard>
      <StackCard title="Unser Dev-Workflow"><DeployTerminal /></StackCard>
      <StackCard title="Full-Stack-Architektur"><LayerStack /></StackCard>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }} className="asf-row">
      <StackCard title="Sauberer Code"><CleanCodeLines /></StackCard>
      <StackCard title="Unser Tech-Stack"><TechBelt tools={WEB_BELT} /></StackCard>
      <StackCard title="< 1s Ladezeit"><SpeedBar /></StackCard>
    </div>
    <style>{`
      .web-gauge { position: relative; width: 80px; height: 80px; margin: 0 auto; }
      .web-gauge-svg { width: 100%; height: 100%; transform: rotate(-90deg); }
      .web-gauge-track { fill: none; stroke: rgba(255,255,255,0.08); stroke-width: 6; }
      .web-gauge-fill { fill: none; stroke: var(--accent-primary); stroke-width: 6; stroke-linecap: round; stroke-dasharray: 213.6; stroke-dashoffset: 213.6; animation: webGaugeFill 2.4s ease-out infinite; }
      @keyframes webGaugeFill { 0% { stroke-dashoffset: 213.6; } 60%, 100% { stroke-dashoffset: 8; } }
      .web-gauge-label { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-size: 18px; font-weight: 800; color: var(--text-primary); }
      .web-gauge-label span { font-size: 9px; color: var(--text-muted); font-weight: 600; margin-left: 2px; }

      .web-terminal { width: 100%; background: #060606; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 10px 12px; font-family: 'JetBrains Mono', monospace; }
      .web-terminal-dots { display: flex; gap: 5px; margin-bottom: 8px; }
      .web-terminal-dots span { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,0.15); }
      .web-terminal-lines { min-height: 64px; }
      .web-terminal-line { font-size: 10px; color: #8fdf8f; line-height: 1.9; opacity: 0; animation: webTermLine 3s ease-in-out infinite; }
      @keyframes webTermLine { 0% { opacity: 0; transform: translateY(2px); } 10%, 85% { opacity: 1; transform: translateY(0); } 95%, 100% { opacity: 0; } }

      .web-layers { display: flex; flex-direction: column; gap: 8px; width: 100%; }
      .web-layer { display: flex; align-items: center; gap: 8px; padding: 10px 14px; border-radius: 8px; background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); color: var(--text-muted); font-size: 11px; font-weight: 700; animation: webLayerGlow 2.2s ease-in-out infinite; }
      .web-layer-logo { width: 16px; height: 16px; object-fit: contain; flex-shrink: 0; }
      @keyframes webLayerGlow { 0%, 20%, 100% { border-color: var(--border-subtle); color: var(--text-muted); background: rgba(255,255,255,0.03); } 35%, 85% { border-color: var(--accent-primary); color: var(--text-primary); background: rgba(255,107,0,0.08); } }

      .web-code-lines { display: flex; flex-direction: column; gap: 8px; width: 100%; }
      .web-code-line { display: block; height: 7px; border-radius: 4px; background: rgba(255,255,255,0.12); transform-origin: left; animation: webLineIn 2.4s ease-in-out infinite; }
      .web-code-line:nth-child(3) { background: rgba(255,107,0,0.5); }
      @keyframes webLineIn { 0% { transform: scaleX(0); opacity: 0; } 20%, 80% { transform: scaleX(1); opacity: 1; } 100% { transform: scaleX(0); opacity: 0; } }
      .web-code-badge { margin-top: 4px; align-self: flex-start; font-size: 10px; font-weight: 700; color: #4ade80; }

      .web-speed { display: flex; flex-direction: column; align-items: center; gap: 10px; width: 100%; }
      .web-speed-track { width: 100%; max-width: 140px; height: 8px; border-radius: 999px; background: rgba(255,255,255,0.08); overflow: hidden; }
      .web-speed-fill { height: 100%; width: 0%; border-radius: 999px; background: linear-gradient(90deg, var(--accent-primary), #ffb380); animation: webSpeedFill 1.6s ease-in-out infinite; }
      @keyframes webSpeedFill { 0% { width: 0%; } 55%, 100% { width: 100%; } }
      .web-speed-label { font-family: 'JetBrains Mono', monospace; font-size: 20px; font-weight: 800; color: var(--text-primary); }

      @media (prefers-reduced-motion: reduce) {
        .web-gauge-fill, .web-terminal-line, .web-layer, .web-code-line, .web-speed-fill { animation: none !important; }
      }
    `}</style>
  </StackShowcaseSection>
);

export default WebDevelopmentPage;
