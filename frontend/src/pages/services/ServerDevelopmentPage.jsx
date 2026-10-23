import React, { useState, useEffect, useRef } from 'react';
import {
  Server,
  Workflow,
  HardDrive,
  RefreshCw,
  Wrench,
  Activity,
  Cloud,
  Network,
  Database,
  Building2,
  Factory,
  Stethoscope,
  GraduationCap,
  Rocket,
  Briefcase,
  Search,
  Lightbulb,
  Hammer,
  LifeBuoy,
  Plus,
  ShieldCheck,
  Zap,
  TrendingUp,
  Clock,
  DollarSign,
  Users
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
import ModernTimeline from '../../components/services/ModernTimeline';
import ServiceContactForm from '../../components/services/ServiceContactForm';
import ServiceAdvisorBlock from '../../components/tools/ServiceAdvisorBlock';
import ServicePortfolioSection from '../../components/services/ServicePortfolioSection';
import { ModernBenefits } from '../../components/services/ModernBenefits';
import ServiceFAQ from '../../components/services/ServiceFAQ';
import { useSectionReveal } from '../../components/services/useSectionReveal';
import TestimonialsMarquee from '../../components/common/TestimonialsMarquee';
import TestimonialForm from '../../components/common/TestimonialForm';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const DEVICON = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons';

// ---------------- Data ----------------
const TECH_LOGOS = [
  { name: 'AWS', logo: `${DEVICON}/amazonwebservices/amazonwebservices-original-wordmark.svg`, color: '#FF9900', desc: 'Skalierbare Cloud-Infrastruktur mit globaler Reichweite.' },
  { name: 'Azure', logo: `${DEVICON}/azure/azure-original.svg`, color: '#0089D6', desc: 'Microsofts Cloud-Plattform für Hosting, Identity und DevOps.' },
  { name: 'Google Cloud', logo: `${DEVICON}/googlecloud/googlecloud-original.svg`, color: '#4285F4', desc: 'Leistungsstarke Cloud-Infrastruktur mit starkem Netzwerk.' },
  { name: 'Linux', logo: `${DEVICON}/linux/linux-original.svg`, color: '#FCC624', desc: 'Gehärtete Server-Systeme als sicheres Fundament.' },
  { name: 'Windows Server', logo: `${DEVICON}/windows8/windows8-original.svg`, color: '#00A4EF', desc: 'Enterprise-Hosting für Windows-basierte Workloads.' },
  { name: 'Docker', logo: `${DEVICON}/docker/docker-original.svg`, color: '#2496ED', desc: 'Containerisierung für portable, reproduzierbare Deployments.' },
  { name: 'Kubernetes', logo: `${DEVICON}/kubernetes/kubernetes-plain.svg`, color: '#326CE5', desc: 'Orchestrierung für Container im großen Maßstab.' },
  { name: 'VMware', logo: 'https://cdn.simpleicons.org/vmware/607078', color: '#607078', desc: 'Virtualisierung für maximale Hardware-Auslastung.' },
  { name: 'Terraform', logo: `${DEVICON}/terraform/terraform-original.svg`, color: '#7B42BC', desc: 'Infrastructure-as-Code für reproduzierbare Umgebungen.' },
  { name: 'Nginx', logo: `${DEVICON}/nginx/nginx-original.svg`, color: '#009639', desc: 'Reverse-Proxy und Load-Balancing für hohe Performance.' },
];

const LEISTUNGEN = [
  { tabId: 'infra', icon: HardDrive, logo: `${DEVICON}/linux/linux-original.svg`, brandColor: '#FCC624', title: 'Server-Installation', image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=700&q=80&auto=format&fit=crop', desc: 'Wir richten Ihre Server-Umgebung von Grund auf ein – physisch, virtuell oder in der Cloud, perfekt auf Ihre Anforderungen abgestimmt.', features: ['Windows Server', 'Linux Server', 'Virtualisierung', 'Cloud-Anbindung'] },
  { tabId: 'infra', icon: Cloud, logo: `${DEVICON}/amazonwebservices/amazonwebservices-original-wordmark.svg`, brandColor: '#FF9900', title: 'Cloud-Infrastruktur',
    image: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=700&q=80&auto=format&fit=crop',
    desc: 'AWS, Azure & Google Cloud – Architektur, Setup und Betrieb skalierbarer Cloud-Umgebungen.',
    features: ['Multi-Cloud', 'IaC mit Terraform', 'Auto-Scaling', 'Cost-Optimization'] },
  { tabId: 'infra', icon: Server, title: 'Managed Hosting',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=700&q=80&auto=format&fit=crop',
    desc: 'Vollständig betreutes Hosting auf eigener Hardware oder in der Cloud – inkl. SLA, Backups & Monitoring.',
    features: ['DACH-Rechenzentren', 'Bis 99.99% SLA', 'Daily Backups', '24/7 Bereitschaft'] },
  { tabId: 'ops', icon: Activity, title: 'Monitoring', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=700&q=80&auto=format&fit=crop', desc: '24/7-Überwachung mit automatischer Alarmierung erkennt Probleme, bevor sie zu Ausfällen werden.', features: ['24/7 Überwachung', 'Frühe Fehlererkennung', 'Automatische Alerts', 'Proaktive Wartung'] },
  { tabId: 'ops', icon: Wrench, title: 'Wartung & Patching', image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=700&q=80&auto=format&fit=crop', desc: 'Regelmäßige Updates, Sicherheitsprüfungen und Performance-Tuning halten Ihre Systeme stabil und sicher.', features: ['Updates & Patches', 'Sicherheitsüberprüfungen', 'Performance-Optimierung', 'Fehleranalyse'] },
  { tabId: 'ops', icon: Database, title: 'Backups & Disaster Recovery',
    image: 'https://images.unsplash.com/photo-1597852074816-d933c7d2b988?w=700&q=80&auto=format&fit=crop',
    desc: 'Automatisierte, geo-redundante Backups mit getesteten Wiederherstellungs­plänen – Daten sind nie verloren.',
    features: ['3-2-1-Strategie', 'Geo-Redundanz', 'Restore-Tests', 'RTO/RPO-SLA'] },
  { tabId: 'migrate', icon: RefreshCw, title: 'Server-Migration', image: 'https://images.unsplash.com/photo-1562813733-b31f71025d54?w=700&q=80&auto=format&fit=crop', desc: 'Umzüge und Cloud-Migrationen mit minimalen Ausfallzeiten und vollständiger Datenübernahme.', features: ['Datenübernahme', 'Systemumzüge', 'Cloud-Migration', 'Minimale Ausfallzeiten'] },
  { tabId: 'migrate', icon: Workflow, logo: `${DEVICON}/docker/docker-original.svg`, brandColor: '#2496ED', title: 'DevOps & CI/CD',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=700&q=80&auto=format&fit=crop',
    desc: 'Automatisierte Build-, Test- und Deploy-Pipelines – schneller releasen, weniger Fehler, mehr Sicherheit.',
    features: ['GitLab/GitHub CI', 'Docker & Kubernetes', 'Infrastructure as Code', 'Blue/Green Deploys'] },
];

const LEISTUNGEN_TABS = [
  { id: 'infra', label: 'Aufbau' },
  { id: 'ops', label: 'Betrieb' },
  { id: 'migrate', label: 'Migration & Automation' },
];

const PROVISION_CODE = [
  { indent: 0, segments: [{ t: '@infra.', c: '#FF6B00' }, { t: 'on_deploy', c: '#61DAFB' }, { t: '()' }] },
  { indent: 0, segments: [{ t: 'async def', c: '#C678DD' }, { t: ' ' }, { t: 'provision', c: '#61DAFB' }, { t: '(server: ' }, { t: 'Server', c: '#E5C07B' }, { t: '):' }] },
  { indent: 20, segments: [{ t: 'await', c: '#C678DD' }, { t: ' terraform.apply(server)' }] },
  { indent: 20, segments: [{ t: 'await', c: '#C678DD' }, { t: ' monitor.attach(server)' }] },
  { indent: 20, segments: [{ t: 'return', c: '#C678DD' }, { t: ' backup.schedule(server)' }] },
];

const LOESUNGEN = [
  { name: 'Physische Server', logo: 'https://cdn.simpleicons.org/hetzner/D50C2D', color: '#D50C2D',
    desc: 'Für maximale Leistung und volle Kontrolle über Ihre Hardware.',
    kontrolle: 'Vollständig', einsatz: 'Compliance-kritische Workloads', skalierung: 'Manuell', kosten: 'Fix (CapEx)' },
  { name: 'Virtuelle Server', logo: 'https://cdn.simpleicons.org/digitalocean/0080FF', color: '#0080FF',
    desc: 'Flexible Ressourcen und einfache Skalierbarkeit nach Bedarf.',
    kontrolle: 'Hoch', einsatz: 'KMU & Start-ups', skalierung: 'Mittel', kosten: 'Planbar' },
  { name: 'Cloud-Server', logo: `${DEVICON}/amazonwebservices/amazonwebservices-original-wordmark.svg`, color: '#FF9900',
    desc: 'Standortunabhängiger Zugriff und hohe Verfügbarkeit – jederzeit.',
    kontrolle: 'Mittel', einsatz: 'Wachsende Workloads', skalierung: 'Automatisch', kosten: 'Pay-as-you-go' },
  { name: 'Hybrid-Lösungen', logo: 'https://cdn.simpleicons.org/vmware/607078', color: '#607078',
    desc: 'Die ideale Kombination aus lokaler Infrastruktur und Cloud.',
    kontrolle: 'Individuell', einsatz: 'Compliance + Skalierung', skalierung: 'Flexibel', kosten: 'Gemischt' },
];


const TARGET_COMPANIES = [
  { icon: Building2,     label: 'KMU', tag: 'Mittelstand',
    desc: 'Zuverlässige IT-Infrastruktur, die mit Ihrem Unternehmen mitwächst – ohne eigene IT-Abteilung.',
    img: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=900&q=80&auto=format&fit=crop' },
  { icon: Factory,       label: 'Industrieunternehmen', tag: 'Industrie',
    desc: 'Stabile Systeme für Produktion, Logistik und Maschinendaten – auch unter hoher Last.',
    img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=900&q=80&auto=format&fit=crop' },
  { icon: Stethoscope,   label: 'Praxen & Kanzleien', tag: 'Health & Law',
    desc: 'Sichere, DSGVO-konforme Systeme für sensible Patienten- und Mandantendaten.',
    img: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=900&q=80&auto=format&fit=crop' },
  { icon: GraduationCap, label: 'Bildungseinrichtungen', tag: 'Bildung',
    desc: 'Skalierbare Plattformen für E-Learning, Verwaltung und hunderte gleichzeitige Nutzer.',
    img: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=900&q=80&auto=format&fit=crop' },
  { icon: Rocket,        label: 'Start-ups', tag: 'Startup',
    desc: 'Flexible Cloud-Infrastruktur, die mit jeder Wachstumsphase mitskaliert.',
    img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&q=80&auto=format&fit=crop' },
  { icon: Briefcase,     label: 'Dienstleister', tag: 'Services',
    desc: 'Zentral verwaltete Systeme für Teams, die von überall produktiv arbeiten.',
    img: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=900&q=80&auto=format&fit=crop' },
];

const SRV_BENEFITS = [
  { icon: ShieldCheck, title: 'Maximale Sicherheit', desc: 'Gehärtete Infrastruktur mit proaktivem Monitoring rund um die Uhr.', points: ['24/7 Monitoring', 'Regelmäßige Patches', 'Intrusion Detection'] },
  { icon: Zap, title: 'Hohe Performance', desc: 'Optimierte Server-Architektur für minimale Ladezeiten und Latenzen.', points: ['Niedrige Latenz', 'Optimiertes Caching', 'Schnelle Antwortzeiten'] },
  { icon: TrendingUp, title: 'Nahtlose Skalierung', desc: 'Ihre Infrastruktur wächst automatisch mit steigendem Traffic mit.', points: ['Auto-Scaling', 'Lastverteilung', 'Zukunftssicher'] },
  { icon: Clock, title: '99,99 % Uptime', desc: 'Redundante Systeme garantieren durchgängige Erreichbarkeit.', points: ['Redundante Systeme', 'Failover-Strategien', 'Garantierte SLAs'] },
  { icon: DollarSign, title: 'Kosteneffizienz', desc: 'Pay-as-you-grow statt teurer Überdimensionierung von Anfang an.', points: ['Bedarfsgerechte Kosten', 'Keine Überdimensionierung', 'Transparente Abrechnung'] },
  { icon: Users, title: 'Persönlicher Support', desc: 'Ein erreichbares Team statt anonymer Ticket-Warteschlangen.', points: ['Direkter Ansprechpartner', 'Schnelle Reaktionszeiten', 'Proaktive Betreuung'] },
];

const PROCESS_STEPS = [
  { icon: Search,    title: 'Analyse',    duration: '1 Woche',
    desc: 'Prüfung Ihrer bestehenden Infrastruktur, Lasten und Anforderungen.',
    deliverables: ['IST-Aufnahme', 'Audit-Bericht', 'Zielarchitektur'],
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80&auto=format&fit=crop' },
  { icon: Lightbulb, title: 'Planung',    duration: '1–2 Wochen',
    desc: 'Entwicklung eines individuellen, zukunftssicheren Cloud-/Hybrid-Konzepts inkl. Kostenplan.',
    deliverables: ['Architektur-Diagramm', 'Migrationsplan', 'Cost-Forecast'],
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80&auto=format&fit=crop' },
  { icon: Hammer,    title: 'Umsetzung',  duration: '2–6 Wochen',
    desc: 'Installation, Konfiguration und Migration – sauber dokumentiert, mit minimalen Ausfallzeiten.',
    deliverables: ['Live-Systeme', 'Dokumentation', 'IaC-Code'],
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&q=80&auto=format&fit=crop' },
  { icon: Activity,  title: 'Monitoring & Go-Live', duration: 'kontinuierlich',
    desc: 'Umfassendes Monitoring, Alerting, Backups & Failover-Tests vor dem Produktiv-Schalten.',
    deliverables: ['24/7 Monitoring', 'Alerting-Regeln', 'DR-Plan'],
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&q=80&auto=format&fit=crop' },
  { icon: LifeBuoy,  title: 'Managed Betrieb',  duration: 'laufend',
    desc: 'Laufender Support, Patching, Performance-Tuning und kontinuierliche Optimierung Ihrer Infrastruktur.',
    deliverables: ['Monatsreports', 'SLA-Erfüllung', 'Quartals-Review'],
    image: 'https://images.unsplash.com/photo-1597852074816-d933c7d2b988?w=600&q=80&auto=format&fit=crop' },
];

const PROJECTS = [
  { title: 'Servermodernisierung für KMU', tag: 'Modernisierung', desc: 'Veraltete Hardware durch eine performante, virtualisierte Umgebung ersetzt.',
    img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=900&q=80&auto=format&fit=crop' },
  { title: 'Cloud-Migration', tag: 'Cloud', desc: 'Komplette Workloads ohne nennenswerte Ausfallzeit in die Cloud migriert.',
    img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=900&q=80&auto=format&fit=crop' },
  { title: 'Hochverfügbarkeits-Lösung', tag: 'High Availability', desc: 'Redundante Cluster mit automatischem Failover und 99,9 % Uptime.',
    img: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=900&q=80&auto=format&fit=crop' },
  { title: 'Standortvernetzung', tag: 'Networking', desc: 'Mehrere Standorte sicher per VPN und SD-WAN miteinander verbunden.',
    img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=900&q=80&auto=format&fit=crop' },
];

const TESTIMONIALS = [
  { name: 'Andreas Köhler', role: 'IT-Leiter', company: 'MetallTech GmbH', rating: 5, photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80&auto=format&fit=crop',
    quote: 'Seit der Servermodernisierung läuft alles stabil und spürbar schneller. Top-Betreuung!' },
  { name: 'Sabine Wagner', role: 'Geschäftsführerin', company: 'Kanzlei Wagner', rating: 5, photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80&auto=format&fit=crop',
    quote: 'Die Cloud-Migration verlief reibungslos – keine Ausfälle, volle Datensicherheit.' },
  { name: 'Michael Brandt', role: 'CTO', company: 'StartFlow', rating: 5, photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80&auto=format&fit=crop',
    quote: 'Endlich eine Infrastruktur, die mit uns wächst. 24/7-Monitoring gibt uns Sicherheit.' },
];

const FAQS = [
  { q: 'Welche Serverlösung ist die richtige?', a: 'Das hängt von Unternehmensgröße, Budget und Anforderungen ab. In einem kostenlosen Erstgespräch finden wir gemeinsam die passende Lösung – physisch, virtuell, Cloud oder hybrid.' },
  { q: 'Wie oft sollten Server gewartet werden?', a: 'Wir empfehlen monatliche Kontrollen sowie laufendes Monitoring, um Probleme frühzeitig zu erkennen und Ausfälle zu vermeiden.' },
  { q: 'Sind Cloud-Lösungen sicher?', a: 'Ja – bei professioneller Planung und Umsetzung sind Cloud-Lösungen hochsicher. Verschlüsselung, Zugriffskontrollen und Backups sorgen für umfassenden Schutz.' },
  { q: 'Können bestehende Systeme übernommen werden?', a: 'Ja. Bestehende Infrastrukturen lassen sich problemlos integrieren oder schrittweise migrieren – mit minimaler Ausfallzeit.' },
];

// ---------------- Styles ----------------
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

const reveal = (delay = 0) => ({ opacity: 0, transform: 'translateY(30px)', transition: `all 0.8s ${delay}s ease` });

// ---------------- Component ----------------
const SERVERDEVELOPMENTPAGE_JSONLD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Service',
      name: 'Server & Systeme',
      serviceType: 'Server & Systeme',
      provider: { '@type': 'ProfessionalService', name: 'Zebick', url: SITE_URL },
      areaServed: 'CH',
      url: `${SITE_URL}/services/server-systeme`,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Startseite', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Services', item: `${SITE_URL}/services` },
        { '@type': 'ListItem', position: 3, name: 'Server & Systeme', item: `${SITE_URL}/services/server-systeme` },
      ],
    },
  ],
};

const SERVERDEVELOPMENTPAGE_RELATED = [{ label: "Cyber Security", path: "/services/cyber-security" }, { label: "Webentwicklung", path: "/services/webentwicklung" }];

const ServerDevelopmentPage = () => {
  const pageRef = useRef(null);
  const [activeProcess, setActiveProcess] = useState(0);
  const [showcaseAutoScale, setShowcaseAutoScale] = useState(true);
  const [testimonials, setTestimonials] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/testimonials/approved`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setTestimonials(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  // Auto-cycle process step
  useEffect(() => {
    const id = setInterval(() => setActiveProcess((p) => (p + 1) % PROCESS_STEPS.length), 3500);
    return () => clearInterval(id);
  }, []);

  useSectionReveal(pageRef);

  const testimonialItems = (testimonials.length >= 3 ? testimonials : TESTIMONIALS).map((t) => {
    const jobTitle = t.position || t.role;
    return {
      name: t.name,
      role: jobTitle && t.company ? `${jobTitle}, ${t.company}` : jobTitle || t.company || '',
      rating: t.rating,
      content: t.content || t.quote,
      avatar: t.avatar || t.photo,
    };
  });

  return (
    <div className="page-transition" data-testid="server-development-page" ref={pageRef}>
      <Header />
      <TestimonialForm isOpen={showReviewForm} onClose={() => setShowReviewForm(false)} />
      <Seo
        title="Server, Cloud & DevOps"
        description="Cloud-Infrastruktur, Server-Management und DevOps – zuverlässiges Deployment, Monitoring und laufende Wartung."
        path="/services/server-systeme"
        jsonLd={SERVERDEVELOPMENTPAGE_JSONLD}
      />

      <div className="sr-only"><h1>Server, Cloud & DevOps</h1></div>

      <ServiceAdvisorBlock serviceId="server" />


      {/* ========== 2. WARUM PROFESSIONELLE SERVER-SYSTEME ========== */}
      <section className="section" data-testid="section-why" style={{ background: 'var(--bg-secondary)', padding: '120px 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-100px', left: '-100px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(255,107,0,0.08) 0%, transparent 60%)', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '56px', alignItems: 'center', marginBottom: '64px' }}>
            <div data-reveal style={reveal()}>
              {sectionLabel('Warum professionelle Server-Systeme?')}
              <h2 className="heading-1" style={{ fontSize: '44px', fontWeight: 900, lineHeight: 1.12, marginBottom: '20px' }}>
                Das Fundament<br /><span className="text-gradient">moderner Unternehmen.</span>
              </h2>
              <p style={{ fontSize: '18px', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                Eine leistungsfähige Server-Infrastruktur bildet das Fundament moderner Unternehmen.
                Wir sorgen für maximale Verfügbarkeit, Sicherheit und Performance Ihrer Systeme –
                damit Sie sich voll auf Ihr Geschäft konzentrieren können.
              </p>
            </div>
            <div data-reveal className="srv-mockup-scale" style={{ ...reveal(0.15), position: 'relative' }}>
              <div style={{ position: 'absolute', inset: '-20px', background: 'radial-gradient(circle, rgba(255,107,0,0.22) 0%, transparent 60%)', filter: 'blur(40px)' }} />
              <div style={{ position: 'relative', background: 'linear-gradient(145deg, #141414 0%, #0a0a0a 100%)', borderRadius: 'var(--radius-xl)', border: '1px solid #2a2a2a', boxShadow: '0 30px 80px rgba(0,0,0,0.6)', overflow: 'hidden' }}>
                {/* terminal header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', background: '#181818', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Server size={16} color="var(--accent-primary)" />
                    <span style={{ fontSize: '12px', color: '#fff', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>infra_monitor.sh</span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {[Activity, Database, Network].map((Ic, k) => (
                      <div key={k} className={k === 0 ? 'srv-tool-active' : undefined} style={{ width: '24px', height: '24px', borderRadius: '6px', background: k === 0 ? 'rgba(255,107,0,0.15)' : 'rgba(255,255,255,0.04)', border: k === 0 ? '1px solid rgba(255,107,0,0.4)' : '1px solid transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Ic size={12} color={k === 0 ? 'var(--accent-primary)' : '#666'} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* live metrics */}
                <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '10px', color: '#888', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '14px' }}>System-Status</div>
                  <div data-keep-grid style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
                    {[
                      { label: 'CPU', val: '18%', color: '#22C55E' },
                      { label: 'RAM', val: '41%', color: '#22C55E' },
                      { label: 'Uptime', val: '99.98%', color: 'var(--accent-primary)' },
                    ].map((m, k) => (
                      <div key={k} className="srv-metric" style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', textAlign: 'center', animationDelay: `${k * 0.1}s` }}>
                        <div style={{ fontSize: '16px', fontWeight: 800, color: m.color, fontFamily: 'JetBrains Mono, monospace' }}>{m.val}</div>
                        <div style={{ fontSize: '9px', color: '#888', marginTop: '2px', letterSpacing: '0.05em' }}>{m.label}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px' }}>
                    <span style={{ fontSize: '13px', color: '#ccc' }}>Auto-Scaling</span>
                    <button
                      type="button"
                      onClick={() => setShowcaseAutoScale((v) => !v)}
                      aria-pressed={showcaseAutoScale}
                      aria-label="Demo: Auto-Scaling umschalten"
                      style={{
                        width: '40px', height: '22px', borderRadius: '999px', border: 'none', cursor: 'pointer', padding: '2px',
                        background: showcaseAutoScale ? 'var(--accent-primary)' : 'rgba(255,255,255,0.15)', transition: 'background 0.25s ease',
                        display: 'flex', justifyContent: showcaseAutoScale ? 'flex-end' : 'flex-start',
                      }}
                    >
                      <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#fff', display: 'block', boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }} />
                    </button>
                  </div>
                </div>

                {/* server fleet */}
                <div style={{ padding: '16px 20px' }}>
                  <div style={{ fontSize: '10px', color: '#888', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '12px' }}>Server-Flotte</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                      { name: 'eu-west-prod-01', status: 'online' },
                      { name: 'eu-west-prod-02', status: 'online' },
                      { name: 'backup-replica', status: 'syncing' },
                    ].map((s, k) => (
                      <div key={k} className="srv-fleet-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 2px', animationDelay: `${k * 0.1}s` }}>
                        <span style={{ fontSize: '12px', color: '#aaa', fontFamily: 'JetBrains Mono, monospace' }}>{s.name}</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: s.status === 'online' ? '#22C55E' : '#F59E0B', fontWeight: 700, textTransform: 'uppercase' }}>
                          <span className={s.status === 'online' ? 'srv-dot-online' : 'srv-dot-syncing'} style={{ width: '6px', height: '6px', borderRadius: '50%', background: s.status === 'online' ? '#22C55E' : '#F59E0B' }} />
                          {s.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* network topology */}
                <div style={{ padding: '4px 20px 22px' }}>
                  <div style={{ fontSize: '10px', color: '#888', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '10px' }}>Netzwerk-Topologie</div>
                  <svg viewBox="0 0 400 110" style={{ width: '100%', height: '90px', display: 'block' }}>
                    <line x1="60" y1="55" x2="190" y2="20" stroke="rgba(34,197,94,0.35)" strokeWidth="1.5" />
                    <line x1="60" y1="55" x2="190" y2="55" stroke="rgba(34,197,94,0.35)" strokeWidth="1.5" />
                    <line x1="60" y1="55" x2="190" y2="90" stroke="rgba(245,158,11,0.35)" strokeWidth="1.5" />
                    <circle className="srv-net-pulse" r="3" fill="#22C55E"><animateMotion dur="2.2s" repeatCount="indefinite" path="M60 55 L190 20" /></circle>
                    <circle className="srv-net-pulse" r="3" fill="#22C55E" style={{ animationDelay: '0.5s' }}><animateMotion dur="2.2s" repeatCount="indefinite" begin="0.5s" path="M60 55 L190 55" /></circle>
                    <circle className="srv-net-pulse" r="3" fill="#F59E0B" style={{ animationDelay: '1s' }}><animateMotion dur="2.2s" repeatCount="indefinite" begin="1s" path="M60 55 L190 90" /></circle>
                    <circle cx="60" cy="55" r="16" fill="rgba(255,107,0,0.12)" stroke="var(--accent-primary)" strokeWidth="1.5" />
                    <text x="60" y="59" textAnchor="middle" fontSize="8" fill="var(--accent-primary)" fontFamily="JetBrains Mono, monospace" fontWeight="700">LB</text>
                    {[[190, 20, '#22C55E'], [190, 55, '#22C55E'], [190, 90, '#F59E0B']].map(([x, y, c], k) => (
                      <g key={k}>
                        <circle cx={x} cy={y} r="10" fill="#141414" stroke={c} strokeWidth="1.5" />
                        <circle className="srv-net-node" cx={x} cy={y} r="2" fill={c} style={{ animationDelay: `${k * 0.3}s` }} />
                      </g>
                    ))}
                    <text x="215" y="24" fontSize="7" fill="#666" fontFamily="JetBrains Mono, monospace">prod-01</text>
                    <text x="215" y="59" fontSize="7" fill="#666" fontFamily="JetBrains Mono, monospace">prod-02</text>
                    <text x="215" y="94" fontSize="7" fill="#666" fontFamily="JetBrains Mono, monospace">replica</text>
                  </svg>
                </div>
              </div>
            </div>
          </div>

        </div>
        <style>{`
          @keyframes srvToolPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
          .srv-tool-active { animation: srvToolPulse 1.8s ease-in-out infinite; }
          @keyframes srvMetricIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
          .srv-metric { animation: srvMetricIn 0.5s ease both; }
          @keyframes srvDotOnline { 0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.5); } 50% { box-shadow: 0 0 0 4px rgba(34,197,94,0); } }
          .srv-dot-online { animation: srvDotOnline 2s ease-in-out infinite; }
          @keyframes srvDotSyncing { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.4); } }
          .srv-dot-syncing { animation: srvDotSyncing 0.9s ease-in-out infinite; }
          @keyframes srvRowIn { from { opacity: 0; transform: translateX(-6px); } to { opacity: 1; transform: translateX(0); } }
          .srv-fleet-row { animation: srvRowIn 0.4s ease both; }
          .srv-net-node { animation: srvNetNode 2s ease-in-out infinite; transform-origin: center; transform-box: fill-box; }
          @keyframes srvNetNode { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.8); } }
          @media (prefers-reduced-motion: reduce) {
            .srv-tool-active, .srv-metric, .srv-dot-online, .srv-dot-syncing, .srv-fleet-row, .srv-net-node { animation: none !important; opacity: 1 !important; }
          }
          @media (max-width: 640px) {
            .srv-mockup-scale { width: 480px !important; zoom: 0.7; }
          }
        `}</style>
      </section>

      {/* ========== STACK-SHOWCASE ========== */}
      <ServerStackShowcase />

      {/* ========== LEISTUNGSSPEKTRUM ========== */}
      <section className="section" data-testid="section-leistungsspektrum" style={{ padding: '120px 0', background: 'var(--bg-secondary)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '20%', right: '-150px', width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(255,107,0,0.06) 0%, transparent 60%)', filter: 'blur(100px)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '60px', alignItems: 'center', marginBottom: '72px' }}>
            <div data-reveal style={reveal()}>
              {sectionLabel('Unsere Infrastruktur')}
              <h2 className="heading-1" style={{ fontSize: '44px', fontWeight: 900, marginBottom: '20px', lineHeight: 1.1 }}>
                Unsere Infrastruktur, <span className="text-gradient">komplett gedacht</span>
              </h2>
              <p style={{ fontSize: '17px', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                Von Aufbau über Betrieb bis Migration & Automation: Infrastruktur, Monitoring und Deployment
                greifen bei uns ineinander – statt isolierter Einzelmaßnahmen bekommen Sie Ihre Server aus einer Hand.
              </p>
            </div>
            <div data-reveal style={{ ...reveal(0.15), ...baseCard, padding: '32px', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', lineHeight: 1.8 }}>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FF5F57' }} />
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FFBD2E' }} />
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#28CA42' }} />
                <span style={{ marginLeft: '12px', color: 'var(--text-muted)', fontSize: '12px' }}>provision.py</span>
              </div>
              <TypingCode lines={PROVISION_CODE} />
            </div>
          </div>

          <ServiceTabsGrid tabs={LEISTUNGEN_TABS} services={LEISTUNGEN} />

          {/* Logo strip */}
          <div data-reveal style={{ ...reveal(0.2), marginTop: '72px' }}>
            <p style={{ textAlign: 'center', fontSize: '13px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '32px' }}>
              Technologien & Plattformen, mit denen wir arbeiten
            </p>
            <ToolDock tools={TECH_LOGOS} />
          </div>
        </div>
      </section>

      {/* ========== 4. SERVER-LÖSUNGEN IM ÜBERBLICK ========== */}
      <section className="section" data-testid="section-solutions" style={{ padding: '120px 0', background: 'var(--bg-secondary)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '20%', right: '-150px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(255,107,0,0.06) 0%, transparent 60%)', filter: 'blur(100px)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative' }}>
          <div data-reveal style={{ ...reveal(), textAlign: 'center', marginBottom: '64px' }}>
            {sectionLabel('Server-Lösungen im Überblick')}
            <h2 className="heading-1" style={{ fontSize: '44px', fontWeight: 900, marginBottom: '16px' }}>Die richtige <span className="text-gradient">Lösung für Sie</span></h2>
          </div>
          <div className="compare-grid" data-keep-grid style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '56px' }}>
            {LOESUNGEN.map((l, i) => (
              <div key={l.name} data-reveal data-testid={`solution-card-${i}`} style={{ ...baseCard, ...reveal(i * 0.08), padding: '28px' }}
                   onMouseEnter={(e) => { e.currentTarget.style.borderColor = l.color; e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = `0 20px 40px ${l.color}25`; }}
                   onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', background: `${l.color}20`, border: `1px solid ${l.color}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <img src={l.logo} alt={l.name} width="26" height="26" style={{ objectFit: 'contain' }} />
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700 }}>{l.name}</h3>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.7 }}>{l.desc}</p>
              </div>
            ))}
          </div>

          {/* Comparison Table */}
          <div data-reveal style={{ ...baseCard, padding: '0', overflow: 'hidden', ...reveal(0.2) }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '720px' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,107,0,0.06)' }}>
                    {['Lösung', 'Kontrolle', 'Einsatzbereich', 'Skalierung', 'Kosten'].map((h) => (
                      <th key={h} style={{ textAlign: 'left', padding: '20px 24px', fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent-primary)', fontWeight: 600, borderBottom: '1px solid var(--border-subtle)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {LOESUNGEN.map((l, i) => (
                    <tr key={l.name} style={{ borderBottom: i < LOESUNGEN.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                      <td style={{ padding: '20px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img src={l.logo} alt={l.name} width="20" height="20" style={{ objectFit: 'contain' }} />
                          <span style={{ fontWeight: 600 }}>{l.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '20px 24px', color: 'var(--text-secondary)' }}>{l.kontrolle}</td>
                      <td style={{ padding: '20px 24px', color: 'var(--text-muted)', fontSize: '14px' }}>{l.einsatz}</td>
                      <td style={{ padding: '20px 24px', color: 'var(--text-secondary)' }}>{l.skalierung}</td>
                      <td style={{ padding: '20px 24px', color: 'var(--text-muted)', fontSize: '14px' }}>{l.kosten}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ========== 7. UNSER VORGEHEN (Timeline) ========== */}
      <ModernTimeline
        eyebrow="Unser Vorgehen"
        title="In fünf Schritten zur stabilen Infrastruktur"
        subtitle="Strukturierter Prozess mit transparenten Meilensteinen, Deliverables und Zeitplänen."
        background="var(--bg-secondary)"
        steps={PROCESS_STEPS}
      />

      {/* ========== 8. FÜR WELCHE UNTERNEHMEN (BRANCHEN) ========== */}
      <section className="section" data-testid="section-targets" style={{ padding: '120px 0', background: 'var(--bg-primary)' }}>
        <div className="container">
          <div data-reveal style={{ ...reveal(), textAlign: 'center', marginBottom: '56px' }}>
            {sectionLabel('Branchen')}
            <h2 className="heading-1" style={{ fontSize: '44px', fontWeight: 900, marginBottom: '16px' }}>Geeignet <span className="text-gradient">für Sie</span></h2>
            <p style={{ fontSize: '17px', color: 'var(--text-muted)', maxWidth: '640px', margin: '0 auto', lineHeight: 1.7 }}>
              Ob klein oder groß – wir entwickeln passende Lösungen für jede Branche.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {TARGET_COMPANIES.map((t, i) => (
              <div key={t.label} data-reveal data-testid={`target-card-${i}`} style={{
                ...baseCard, ...reveal(i * 0.06), padding: 0, overflow: 'hidden',
              }}
                   onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.transform = 'translateY(-6px)'; }}
                   onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
                  <img src={t.img} alt={t.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(180deg, transparent 0%, rgba(8,8,8,0.9) 100%)',
                  }} />
                  <div style={{
                    position: 'absolute', top: '16px', left: '16px',
                    padding: '6px 12px', background: 'rgba(0,0,0,0.6)',
                    border: '1px solid rgba(255,107,0,0.4)', borderRadius: '999px',
                    color: 'var(--accent-primary)', fontSize: '11px', fontWeight: 700,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    backdropFilter: 'blur(8px)',
                  }}>{t.tag}</div>
                  <div style={{
                    position: 'absolute', bottom: '16px', left: '16px',
                    width: '44px', height: '44px',
                    background: 'rgba(255,107,0,0.9)', borderRadius: 'var(--radius-md)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <t.icon size={22} color="#000" />
                  </div>
                </div>
                <div style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '10px' }}>{t.label}</h3>
                  <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '14px' }}>{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== VORTEILE ========== */}
      <ModernBenefits
        eyebrow="Vorteile"
        title="Was professionelle Server-Infrastruktur bringt"
        accentWord="professionelle Server-Infrastruktur"
        subtitle="Zuverlässige Systeme sind eine Investition – und sie verhindern weit teurere Ausfälle."
        items={SRV_BENEFITS}
        image="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=900&q=80&auto=format&fit=crop"
        testid="section-benefits"
      />

      {/* ========== 9. REFERENZEN — aus Portfolio (Admin) ========== */}
      <ServicePortfolioSection
        serviceId="server"
        fallbackExamples={PROJECTS}
        eyebrow="Referenzen & Erfolgsprojekte"
        title="Projekte, die"
        accentWord="überzeugen"
        subtitle="Eine Auswahl erfolgreicher Infrastruktur-Projekte."
        testid="section-references"
        showCategoryFilter
      />

      {/* ========== KUNDENBEWERTUNGEN ========== */}
      <section className="section" data-testid="section-reviews" style={{ padding: '120px 0', background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div data-reveal style={{ ...reveal(), textAlign: 'center', marginBottom: '64px' }}>
            {sectionLabel('Kundenbewertungen')}
            <h2 className="heading-1" style={{ fontSize: '44px', fontWeight: 900, marginBottom: '16px' }}>Das sagen <span className="text-gradient">unsere Kunden</span></h2>
          </div>
          <TestimonialsMarquee items={testimonialItems} />
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <button onClick={() => setShowReviewForm(true)} data-testid="write-review-btn" style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              padding: '14px 28px', background: 'transparent',
              border: '2px solid var(--accent-primary)', borderRadius: '50px',
              color: 'var(--accent-primary)', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.3s ease', fontFamily: 'inherit',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-primary)'; e.currentTarget.style.color = '#000'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--accent-primary)'; }}
            >
              <Plus size={18} /> Bewertung schreiben
            </button>
          </div>
        </div>
      </section>

      {/* ========== 10. FAQ ========== */}
      <ServiceFAQ
        eyebrow="FAQ"
        title="Häufige Fragen"
        items={FAQS.map((f) => ({ question: f.q, answer: f.a }))}
        testid="section-faq"
      />

      <ServiceContactForm
        defaultService="server"
        title="Bereit für eine leistungsstarke IT-Infrastruktur?"
        subtitle="Lassen Sie sich unverbindlich beraten – wir finden die passende Server- und Cloud-Lösung für Ihr Unternehmen."
      />      <RelatedServices items={SERVERDEVELOPMENTPAGE_RELATED} />      <Footer />
      <Chatbot />
    </div>
  );
};

// ---------------- Subcomponents ----------------

const SERVER_BELT = TECH_LOGOS.filter((t) =>
  ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Linux', 'Nginx'].includes(t.name)
);

// ---- Server-specific stack-showcase visuals (unique per service — only the
// "Unser Infrastruktur-Stack" TechBelt card stays shared) ----

const SRV_RACK_TOOLS = [
  { n: 'Docker', logo: 'https://cdn.simpleicons.org/docker/2496ED' },
  { n: 'Kubernetes', logo: 'https://cdn.simpleicons.org/kubernetes/326CE5' },
  { n: 'Nginx', logo: 'https://cdn.simpleicons.org/nginx/009639' },
  { n: 'Redis', logo: 'https://cdn.simpleicons.org/redis/DC382D' },
];

const ServerRackStatus = () => (
  <div className="srv-rack">
    {SRV_RACK_TOOLS.map((t, i) => (
      <div key={t.n} className="srv-rack-unit">
        <span className="srv-rack-led" style={{ animationDelay: `${i * 0.3}s` }} />
        <img src={t.logo} alt={t.n} className="srv-rack-logo" />
        <span className="srv-rack-bars" />
      </div>
    ))}
  </div>
);

const MonitorRadar = () => (
  <div className="srv-radar">
    <div className="srv-radar-ring" />
    <div className="srv-radar-ring srv-radar-ring-2" />
    <div className="srv-radar-sweep" />
    <span className="srv-radar-blip" style={{ left: '30%', top: '62%' }} />
    <span className="srv-radar-blip" style={{ left: '68%', top: '35%', animationDelay: '1.1s' }} />
  </div>
);

const MultiRegionMesh = () => (
  <div className="srv-mesh">
    <svg viewBox="0 0 120 70" className="srv-mesh-svg" aria-hidden>
      <line x1="20" y1="20" x2="60" y2="50" className="srv-mesh-line" />
      <line x1="60" y1="50" x2="100" y2="20" className="srv-mesh-line" style={{ animationDelay: '0.5s' }} />
      <line x1="20" y1="20" x2="100" y2="20" className="srv-mesh-line" style={{ animationDelay: '1s' }} />
    </svg>
    {[[20, 20], [60, 50], [100, 20]].map(([x, y], i) => (
      <span key={i} className="srv-mesh-node" style={{ left: `${(x / 120) * 100}%`, top: `${(y / 70) * 100}%`, animationDelay: `${i * 0.3}s` }} />
    ))}
  </div>
);

const ProvisionChecklist = () => (
  <div className="srv-provision">
    {['EC2 Instanz', 'VPC Netzwerk', 'RDS Datenbank'].map((r, i) => (
      <div key={r} className="srv-provision-row" style={{ animationDelay: `${i * 0.8}s` }}>
        <span className="srv-provision-check">✓</span>{r}
      </div>
    ))}
  </div>
);

const FailoverSwitch = () => (
  <div className="srv-failover">
    <div className="srv-failover-node srv-failover-primary"><span className="srv-failover-dot" />Primary</div>
    <div className="srv-failover-node srv-failover-backup"><span className="srv-failover-dot" />Backup</div>
  </div>
);

const ServerStackShowcase = () => (
  <StackShowcaseSection
    eyebrow="Unsere Infrastruktur"
    title={<>Gebaut für <span style={{ color: 'var(--accent-primary)' }}>99.99%</span> Uptime</>}
    subtitle="Von Deployment bis Disaster-Recovery – Ihre Systeme laufen, während Sie schlafen."
    testid="section-stack-showcase"
  >
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr 1fr', gap: '20px', marginBottom: '20px' }} className="asf-row">
      <StackCard title="Hochverfügbar von Tag eins"><ServerRackStatus /></StackCard>
      <StackCard title="Unser DevOps-Workflow"><MonitorRadar /></StackCard>
      <StackCard title="Multi-Cloud-Redundanz"><MultiRegionMesh /></StackCard>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }} className="asf-row">
      <StackCard title="Infrastructure as Code"><ProvisionChecklist /></StackCard>
      <StackCard title="Unser Infrastruktur-Stack"><TechBelt tools={SERVER_BELT} /></StackCard>
      <StackCard title="Failover in < 1 Sekunde"><FailoverSwitch /></StackCard>
    </div>
    <style>{`
      .srv-rack { display: flex; flex-direction: column; gap: 8px; width: 100%; }
      .srv-rack-unit { display: flex; align-items: center; gap: 8px; padding: 7px 10px; border-radius: 6px; background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); }
      .srv-rack-led { width: 6px; height: 6px; border-radius: 50%; background: #22c55e; flex-shrink: 0; animation: srvLedBlink 1.6s ease-in-out infinite; }
      @keyframes srvLedBlink { 0%, 100% { opacity: 1; box-shadow: 0 0 6px #22c55e; } 50% { opacity: 0.35; box-shadow: none; } }
      .srv-rack-bars { flex: 1; height: 4px; border-radius: 2px; background: repeating-linear-gradient(90deg, rgba(255,255,255,0.15) 0 6px, transparent 6px 10px); }
      .srv-rack-logo { width: 14px; height: 14px; object-fit: contain; flex-shrink: 0; }

      .srv-radar { position: relative; width: 90px; height: 90px; margin: 0 auto; }
      .srv-radar-ring { position: absolute; inset: 0; border-radius: 50%; border: 1px solid rgba(255,107,0,0.25); }
      .srv-radar-ring-2 { inset: 18px; }
      .srv-radar-sweep { position: absolute; inset: 0; border-radius: 50%; background: conic-gradient(from 0deg, rgba(255,107,0,0.5), transparent 70deg); animation: srvRadarSpin 2.4s linear infinite; }
      @keyframes srvRadarSpin { to { transform: rotate(360deg); } }
      .srv-radar-blip { position: absolute; width: 6px; height: 6px; border-radius: 50%; background: var(--accent-primary); transform: translate(-50%, -50%); animation: srvBlipPulse 2.4s ease-in-out infinite; }
      @keyframes srvBlipPulse { 0%, 80%, 100% { opacity: 0; } 85%, 95% { opacity: 1; } }

      .srv-mesh { position: relative; width: 100%; height: 80px; }
      .srv-mesh-svg { position: absolute; inset: 0; width: 100%; height: 100%; }
      .srv-mesh-line { stroke: var(--accent-primary); stroke-width: 1.5; stroke-dasharray: 5 4; opacity: 0.6; animation: srvMeshFlow 1.4s linear infinite; }
      @keyframes srvMeshFlow { to { stroke-dashoffset: -18; } }
      .srv-mesh-node { position: absolute; width: 10px; height: 10px; border-radius: 50%; background: var(--accent-primary); transform: translate(-50%, -50%); animation: srvNodePulse 2s ease-in-out infinite; }
      @keyframes srvNodePulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(255,107,0,0.5); } 50% { box-shadow: 0 0 0 6px rgba(255,107,0,0); } }

      .srv-provision { display: flex; flex-direction: column; gap: 10px; width: 100%; }
      .srv-provision-row { display: flex; align-items: center; gap: 8px; font-size: 11px; color: var(--text-muted); opacity: 0; animation: srvProvisionIn 2.4s ease-in-out infinite; }
      @keyframes srvProvisionIn { 0% { opacity: 0; transform: translateX(-4px); } 15%, 90% { opacity: 1; transform: translateX(0); color: var(--text-secondary); } 100% { opacity: 0; } }
      .srv-provision-check { color: #4ade80; font-weight: 800; }

      .srv-failover { display: flex; flex-direction: column; gap: 8px; width: 100%; }
      .srv-failover-node { display: flex; align-items: center; gap: 8px; padding: 9px 12px; border-radius: 8px; border: 1px solid var(--border-subtle); font-size: 11px; font-weight: 700; color: var(--text-muted); }
      .srv-failover-dot { width: 7px; height: 7px; border-radius: 50%; background: #3a3a3a; }
      .srv-failover-primary .srv-failover-dot { animation: srvFailPrimary 2.4s step-end infinite; }
      .srv-failover-backup .srv-failover-dot { animation: srvFailBackup 2.4s step-end infinite; }
      @keyframes srvFailPrimary { 0%, 85% { background: #22c55e; box-shadow: 0 0 6px #22c55e; } 86%, 100% { background: #3a3a3a; box-shadow: none; } }
      @keyframes srvFailBackup { 0%, 85% { background: #3a3a3a; box-shadow: none; } 86%, 100% { background: #22c55e; box-shadow: 0 0 6px #22c55e; } }

      @media (prefers-reduced-motion: reduce) {
        .srv-rack-led, .srv-radar-sweep, .srv-radar-blip, .srv-mesh-line, .srv-mesh-node, .srv-provision-row, .srv-failover-dot { animation: none !important; }
      }
    `}</style>
  </StackShowcaseSection>
);
export default ServerDevelopmentPage;
