import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Palette,
  Eye,
  MousePointer,
  Layers,
  Users,
  Smartphone,
  Target,
  TrendingUp,
  Monitor,
  Layout,
  BarChart,
  Compass,
  Boxes,
  Search,
  Accessibility,
  Cpu,
  Plus,
  ArrowUpRight,
  Workflow,
  ShoppingBag,
  Rocket,
  Building2,
  Landmark,
  HeartPulse,
  Smile,
  Clock,
  MousePointer2
} from 'lucide-react';
import Header from '../../components/layout/Header';
import ToolDock from '../../components/services/ToolDock';
import TypingCode from '../../components/services/TypingCode';
import ServiceTabsGrid from '../../components/services/ServiceTabsGrid';
import ServicePortfolioSection from '../../components/services/ServicePortfolioSection';
import ServiceIndustries from '../../components/services/ServiceIndustries';
import { ModernBenefits } from '../../components/services/ModernBenefits';
import { useSectionReveal } from '../../components/services/useSectionReveal';
import { StackShowcaseSection, StackCard, TechBelt } from '../../components/services/StackShowcase';
import TestimonialsMarquee from '../../components/common/TestimonialsMarquee';
import TestimonialForm from '../../components/common/TestimonialForm';
import Seo, { SITE_URL } from '../../components/common/Seo';

const API_URL = process.env.REACT_APP_BACKEND_URL;
import RelatedServices from '../../components/services/RelatedServices';
import Footer from '../../components/layout/Footer';
import Chatbot from '../../components/chatbot/Chatbot';
import ModernTimeline from '../../components/services/ModernTimeline';
import ServiceContactForm from '../../components/services/ServiceContactForm';
import ServiceAdvisorBlock from '../../components/tools/ServiceAdvisorBlock';

const ACCENT = '#FF6B00';
const ACCENT_2 = '#FF8533';

const WHY_ICONS = [
  { logo: 'https://cdn.simpleicons.org/figma/F24E1E', label: 'Figma', color: '#F24E1E' },
  { logo: 'https://cdn.simpleicons.org/framer/0099FF', label: 'Framer', color: '#0099FF' },
  { logo: 'https://cdn.simpleicons.org/sketch/F7B500', label: 'Sketch', color: '#F7B500' },
  { logo: 'https://cdn.simpleicons.org/miro/FFD02F', label: 'Miro', color: '#FFD02F' },
  { logo: 'https://cdn.simpleicons.org/figma/A259FF', label: 'FigJam', color: '#A259FF' },
  { logo: 'https://cdn.simpleicons.org/notion/FFFFFF', label: 'Notion', color: '#FFFFFF' },
];

const sectionLabel = (text) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '8px 16px', background: 'rgba(255,107,0,0.08)', border: '1px solid rgba(255,107,0,0.2)', borderRadius: '999px', marginBottom: '20px' }}>
    <Palette size={14} color="var(--accent-primary)" />
    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', fontWeight: 700, color: 'var(--accent-primary)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>{text}</span>
  </div>
);

const INDUSTRIES = [
  { icon: Monitor, title: 'SaaS & Software', tag: 'SaaS', desc: 'Intuitive Dashboards, die komplexe Daten verständlich machen.',
    img: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=900&q=80&auto=format&fit=crop' },
  { icon: Landmark, title: 'Fintech', tag: 'Finance', desc: 'Vertrauenswürdige Interfaces für Banking, Payments und Investments.',
    img: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=900&q=80&auto=format&fit=crop' },
  { icon: ShoppingBag, title: 'E-Commerce', tag: 'Retail', desc: 'Checkout-Flows, die Kaufabbrüche reduzieren und Conversion steigern.',
    img: 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=900&q=80&auto=format&fit=crop' },
  { icon: HeartPulse, title: 'Healthtech', tag: 'Health', desc: 'Barrierefreie, klare Interfaces für Patienten und medizinisches Personal.',
    img: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&q=80&auto=format&fit=crop' },
  { icon: Rocket, title: 'Startups', tag: 'Startup', desc: 'Schnelle Prototypen und MVPs, die bei Investoren und Nutzern überzeugen.',
    img: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=900&q=80&auto=format&fit=crop' },
  { icon: Building2, title: 'Enterprise', tag: 'Corporate', desc: 'Komplexe interne Tools, die Mitarbeitende wirklich gerne nutzen.',
    img: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=900&q=80&auto=format&fit=crop' },
];

const UIUX_BENEFITS = [
  { icon: Eye, title: 'Höhere Conversion', desc: 'Durchdachte UX reduziert Reibung und führt Nutzer gezielt zum Abschluss.', points: ['Optimierte Funnels', 'Weniger Kaufabbrüche', 'Mehr Abschlüsse'] },
  { icon: Smile, title: 'Zufriedenere Nutzer', desc: 'Intuitive Interfaces senken Frustration und steigern die Nutzerbindung.', points: ['Geringere Absprungrate', 'Höhere Zufriedenheit', 'Mehr Wiederkehrer'] },
  { icon: Clock, title: 'Schnellere Entwicklung', desc: 'Ein Design-System beschleunigt die Umsetzung für Ihr Dev-Team spürbar.', points: ['Wiederverwendbare Komponenten', 'Kürzere Sprints', 'Weniger Rework'] },
  { icon: MousePointer2, title: 'Weniger Support-Anfragen', desc: 'Klare Nutzerführung beantwortet Fragen, bevor sie entstehen.', points: ['Selbsterklärende Flows', 'Weniger Tickets', 'Entlastetes Support-Team'] },
  { icon: Layers, title: 'Konsistente Markenwelt', desc: 'Ein Design-System sorgt für Einheitlichkeit über alle Touchpoints.', points: ['Einheitliches Erlebnis', 'Skalierbare Komponenten', 'Schnellere Rollouts'] },
  { icon: TrendingUp, title: 'Messbare Ergebnisse', desc: 'A/B-Tests und Analytics zeigen, was wirklich funktioniert.', points: ['Datenbasierte Entscheidungen', 'Laufende Optimierung', 'Klare KPIs'] },
];

const UIUX_SERVICES = [
  { tabId: 'research', icon: Search, title: 'UX-Research & Nutzerstudien', image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=700&q=80&auto=format&fit=crop', desc: 'Interviews, Umfragen und Analytics – wir verstehen Ihre Nutzer, bevor wir einen Pixel gestalten.', features: ['User Interviews', 'Personas', 'Journey Mapping', 'Competitive Analysis'] },
  { tabId: 'research', icon: Layers, title: 'Wireframing & Prototyping', image: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=700&q=80&auto=format&fit=crop', desc: 'Low- bis High-Fidelity-Prototypen, die Ideen früh testbar machen – vor dem teuren Entwicklungsaufwand.' },
  { tabId: 'design', icon: Palette, logo: 'https://cdn.simpleicons.org/figma/F24E1E', brandColor: '#F24E1E', title: 'UI-Design & Design-Systeme', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=700&q=80&auto=format&fit=crop', desc: 'Konsistente, skalierbare Komponenten-Bibliotheken statt Einzelstücken – ein System für jedes Produkt.', features: ['Design Tokens', 'Komponenten-Bibliothek', 'Dark & Light Mode', 'Responsive Grids'] },
  { tabId: 'design', icon: MousePointer, title: 'Interaction Design & Micro-Animationen', image: 'https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?w=700&q=80&auto=format&fit=crop', desc: 'Feines Interface-Feedback, das sich richtig anfühlt – ohne vom Inhalt abzulenken.' },
  { tabId: 'validate', icon: Eye, title: 'Usability-Testing', image: 'https://images.unsplash.com/photo-1587440871875-191322ee64b0?w=700&q=80&auto=format&fit=crop', desc: 'Echte Nutzer, echte Aufgaben, echtes Feedback – wir finden Reibungspunkte, bevor Ihre Kunden es tun.' },
  { tabId: 'validate', icon: Accessibility, title: 'Accessibility-Audits (WCAG)', image: 'https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=700&q=80&auto=format&fit=crop', desc: 'Barrierefreiheit nach WCAG 2.1 AA – damit Ihr Produkt für alle Nutzer zugänglich ist.' },
  { tabId: 'delivery', icon: Boxes, title: 'Design-to-Dev Handoff', image: 'https://images.unsplash.com/photo-1552581234-26160f608093?w=700&q=80&auto=format&fit=crop', desc: 'Saubere Spezifikationen, Redlines und Assets – Entwickler setzen exakt das um, was entworfen wurde.' },
  { tabId: 'delivery', icon: TrendingUp, title: 'Conversion-Optimierung (CRO)', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=700&q=80&auto=format&fit=crop', desc: 'A/B-Tests und datengetriebenes Redesign holen mehr Ergebnis aus Ihrem bestehenden Traffic.' },
];

const UIUX_SERVICE_TABS = [
  { id: 'research', label: 'Research & Konzept' },
  { id: 'design', label: 'Design & System' },
  { id: 'validate', label: 'Validierung' },
  { id: 'delivery', label: 'Übergabe & Optimierung' },
];

const DESIGN_SYSTEM_CODE = [
  { indent: 0, segments: [{ t: '@figma.', c: '#FF6B00' }, { t: 'on_handoff', c: '#61DAFB' }, { t: '()' }] },
  { indent: 0, segments: [{ t: 'async def', c: '#C678DD' }, { t: ' ' }, { t: 'publish', c: '#61DAFB' }, { t: '(frame: ' }, { t: 'Frame', c: '#E5C07B' }, { t: '):' }] },
  { indent: 20, segments: [{ t: 'tokens = ' }, { t: 'await', c: '#C678DD' }, { t: ' system.extract(frame)' }] },
  { indent: 20, segments: [{ t: 'await', c: '#C678DD' }, { t: ' specs.generate(tokens)' }] },
  { indent: 20, segments: [{ t: 'return', c: '#C678DD' }, { t: ' dev.notify(frame)' }] },
];

const UIUXPAGE_JSONLD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Service',
      name: 'UI/UX Design',
      serviceType: 'UI/UX Design',
      provider: { '@type': 'ProfessionalService', name: 'Zebick', url: SITE_URL },
      areaServed: 'CH',
      url: `${SITE_URL}/services/ui-ux-design`,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Startseite', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Services', item: `${SITE_URL}/services` },
        { '@type': 'ListItem', position: 3, name: 'UI/UX Design', item: `${SITE_URL}/services/ui-ux-design` },
      ],
    },
  ],
};

const UIUXPAGE_RELATED = [{ label: "Webentwicklung", path: "/services/webentwicklung" }, { label: "App-Entwicklung", path: "/services/app-entwicklung" }];

const UIUXPage = () => {
  const pageRef = useRef(null);
  const [activeProcess, setActiveProcess] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);
  const [showcaseDark, setShowcaseDark] = useState(true);
  const [approvedTestimonials, setApprovedTestimonials] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/testimonials/approved`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setApprovedTestimonials(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveProcess(prev => (prev + 1) % 7);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  useSectionReveal(pageRef);

  // ====== DATA ======
  const services = [
    { icon: Search, title: 'User Research', desc: 'Tiefgehende Nutzerinterviews, Surveys und Analytics für datengetriebene Designentscheidungen.', size: 'large', bg: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=900&q=80&auto=format&fit=crop' },
    { icon: Compass, title: 'UX Strategie', desc: 'Business-Goals und Nutzerbedürfnisse in eine klare Produktvision übersetzt.', bg: 'https://images.unsplash.com/photo-1457305237443-44c3d5a30b89?w=800&q=80&auto=format&fit=crop' },
    { icon: Boxes, title: 'Informationsarchitektur', desc: 'Strukturierte Sitemaps und Navigation für intuitive Orientierung.', bg: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80&auto=format&fit=crop' },
    { icon: Layout, title: 'Wireframing', desc: 'Low- und High-Fidelity Wireframes für schnelles Stakeholder-Alignment.', bg: 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=800&q=80&auto=format&fit=crop' },
    { icon: MousePointer, title: 'Prototyping', desc: 'Interaktive Prototypen in Figma & Framer für realitätsnahe Tests.', bg: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80&auto=format&fit=crop' },
    { icon: Monitor, title: 'Webdesign', desc: 'Responsive Websites mit Conversion-fokussiertem Design.', bg: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80&auto=format&fit=crop' },
    { icon: Smartphone, title: 'Mobile App Design', desc: 'Native iOS- und Android-Designs nach Human Interface & Material Guidelines.', size: 'wide', bg: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=900&q=80&auto=format&fit=crop' },
    { icon: BarChart, title: 'Dashboard Design', desc: 'Datenreiche Interfaces, die komplexe Informationen klar darstellen.', bg: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80&auto=format&fit=crop' },
    { icon: Cpu, title: 'SaaS Design', desc: 'Skalierbare B2B-Produkte mit Onboarding, Settings und Power-User-Flows.', bg: 'https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg?w=800&q=80' },
    { icon: Layers, title: 'Design Systeme', desc: 'Komponenten-Bibliotheken mit Tokens, Variants und Dokumentation.', size: 'wide', bg: 'https://images.unsplash.com/photo-1559028012-481c04fa702d?w=900&q=80&auto=format&fit=crop' },
    { icon: Users, title: 'Usability Testing', desc: 'Moderierte und unmoderierte Tests mit Insights aus echten Sessions.', bg: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80&auto=format&fit=crop' },
    { icon: TrendingUp, title: 'Conversion Optimierung', desc: 'A/B-Tests, Heatmaps und Funnel-Optimierung für messbar mehr Umsatz.', bg: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80&auto=format&fit=crop' },
    { icon: Accessibility, title: 'Barrierefreiheit (WCAG)', desc: 'Inclusive Design nach WCAG 2.1 AA — für alle Nutzer:innen erreichbar.', bg: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800&q=80&auto=format&fit=crop' },
  ];

  const processSteps = [
    { num: '01', title: 'Discovery & Workshop', desc: 'Wir starten mit einem intensiven Workshop, analysieren Business-Ziele, Wettbewerber und definieren messbare Erfolgsmetriken.', icon: Target, deliverables: ['Stakeholder Map', 'Business Canvas', 'Competitive Audit'],
      image: 'https://images.unsplash.com/photo-1457305237443-44c3d5a30b89?w=600&q=80&auto=format&fit=crop' },
    { num: '02', title: 'Research & Insights', desc: 'Qualitative Interviews mit 8-15 Nutzer:innen, quantitative Surveys, Analytics-Audit und Heatmap-Analyse Ihrer aktuellen Lösung.', icon: Eye, deliverables: ['User Personas', 'Journey Maps', 'Research Report'],
      image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80&auto=format&fit=crop' },
    { num: '03', title: 'Architektur & Wireframes', desc: 'Informationsarchitektur, User Flows und Low-Fidelity Wireframes als Fundament für alle visuellen Entscheidungen.', icon: Layout, deliverables: ['Sitemap', 'User Flows', 'Wireframes'],
      image: 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=600&q=80&auto=format&fit=crop' },
    { num: '04', title: 'Visual Design', desc: 'High-Fidelity Designs mit Brand-Integration, Typografie-System, Color Palette und pixel-perfekten Komponenten.', icon: Palette, deliverables: ['Style Guide', 'UI Kit', 'Mockups'],
      image: 'https://images.unsplash.com/photo-1559028012-481c04fa702d?w=600&q=80&auto=format&fit=crop' },
    { num: '05', title: 'Prototyping', desc: 'Klickbare Prototypen mit Micro-Interactions, Animationen und realer Datenanmutung — bereit für Tests und Demos.', icon: MousePointer, deliverables: ['Figma Prototyp', 'Motion Specs', 'Demo-Video'],
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=80&auto=format&fit=crop' },
    { num: '06', title: 'Testing & Validation', desc: 'Moderierte Usability-Tests, A/B-Tests und Iterations-Loops basierend auf echtem Nutzerverhalten.', icon: Users, deliverables: ['Test Report', 'Iteration Plan', 'Findings'],
      image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&q=80&auto=format&fit=crop' },
    { num: '07', title: 'Handoff & Launch', desc: 'Developer-ready Specs, Design Tokens, Komponenten-Library und Live-Support während der Implementierung.', icon: TrendingUp, deliverables: ['Dev Specs', 'Design Tokens', 'Launch Support'],
      image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&q=80&auto=format&fit=crop' },
  ];

  const tools = [
    { name: 'Figma', category: 'Design & Prototyping', logo: 'https://cdn.simpleicons.org/figma/F24E1E', color: '#F24E1E', tier: 'primary' },
    // Adobe XD / Photoshop / Illustrator / InVision / Zeplin: simpleicons.org no
    // longer serves these slugs (confirmed 404 — likely a brand takedown), so
    // `logo` is left unset and the tile falls back to the tool's initial
    // instead of firing a request that's guaranteed to fail.
    { name: 'Adobe XD', category: 'UI Design', logo: null, color: '#FF61F6' },
    { name: 'Sketch', category: 'macOS Design', logo: 'https://cdn.simpleicons.org/sketch/F7B500', color: '#F7B500' },
    { name: 'Framer', category: 'Interactive Prototyping', logo: 'https://cdn.simpleicons.org/framer/0099FF', color: '#0099FF', tier: 'primary' },
    { name: 'Miro', category: 'Collaboration', logo: 'https://cdn.simpleicons.org/miro/FFD02F', color: '#FFD02F' },
    { name: 'InVision', category: 'Prototyping', logo: null, color: '#FF3366' },
    { name: 'Zeplin', category: 'Design Handoff', logo: null, color: '#FDBD39' },
    { name: 'FigJam', category: 'Whiteboard', logo: 'https://cdn.simpleicons.org/figma/A259FF', color: '#A259FF' },
    { name: 'Photoshop', category: 'Visual Design', logo: null, color: '#31A8FF' },
    { name: 'Illustrator', category: 'Vector & Icons', logo: null, color: '#FF9A00' },
    { name: 'Maze', category: 'User Testing', logo: 'https://cdn.simpleicons.org/maze/3C29FF', color: '#5A4FF7' },
    { name: 'Notion', category: 'Documentation', logo: 'https://cdn.simpleicons.org/notion/FFFFFF', color: '#FFFFFF' },
  ];

  const portfolioFallback = [
    {
      tag: 'SaaS Plattform',
      title: 'NorthLab Analytics Dashboard',
      desc: 'Komplettes Redesign einer Enterprise-Analytics-Plattform mit fokussiertem Workflow für Data Scientists und Business Analysts.',
      img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600&q=85&auto=format&fit=crop',
    },
    {
      tag: 'Mobile App',
      title: 'FinSure Mobile Banking',
      desc: 'iOS- und Android-App für eine deutsche Direktbank mit biometrischem Login, Real-Time Transactions und integriertem Support.',
      img: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1600&q=85&auto=format&fit=crop',
    },
    {
      tag: 'E-Commerce',
      title: 'Mareva Fashion Store',
      desc: 'Mobile-first Shopping-Experience für ein Premium-Modelabel mit intelligenter Produkt-Discovery und Stories-Format.',
      img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&q=85&auto=format&fit=crop',
    },
    {
      tag: 'Design System',
      title: 'Voltage Design System',
      desc: '450+ Komponenten, dokumentiert in Storybook, mit Design-Tokens, Themes und vollständiger Accessibility-Compliance.',
      img: 'https://images.unsplash.com/photo-1559028012-481c04fa702d?w=1600&q=85&auto=format&fit=crop',
    },
    {
      tag: 'Operations',
      title: 'CargoSync Control Tower',
      desc: 'Live-Operations-Dashboard für Logistik mit Echtzeit-Tracking, KPI-Visualisierung und Alarmierung.',
      img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1600&q=85&auto=format&fit=crop',
    },
  ];

  const principles = [
    { num: '01', title: 'Benutzerzentriert', desc: 'Jede Designentscheidung basiert auf echten Nutzerdaten — niemals auf Annahmen oder Geschmack.', bg: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80&auto=format&fit=crop' },
    { num: '02', title: 'Barrierefreiheit', desc: 'WCAG 2.1 AA Compliance: Kontraste, Tastatursteuerung, Screenreader-Support — für alle Menschen.', bg: 'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=800&q=80&auto=format&fit=crop' },
    { num: '03', title: 'Konsistenz', desc: 'Design Systeme sorgen für visuelle und funktionale Konsistenz auf jeder Plattform und jedem Touchpoint.', bg: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&q=80&auto=format&fit=crop' },
    { num: '04', title: 'Einfachheit', desc: 'Weniger ist mehr. Klare Hierarchie, minimale kognitive Last und fokussierte Interfaces.', bg: 'https://images.unsplash.com/photo-1508361727343-ca787442dcd7?w=800&q=80&auto=format&fit=crop' },
    { num: '05', title: 'Performance', desc: 'Schnelle Ladezeiten und flüssige Animationen — auch auf älteren Geräten und langsamen Verbindungen.', bg: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&q=80&auto=format&fit=crop' },
    { num: '06', title: 'Responsiveness', desc: 'Mobile-First entwickelt und perfekt skalierbar von 320 px bis 4K-Displays.', bg: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80&auto=format&fit=crop' },
  ];

  const testimonials = [
    {
      featured: true,
      name: 'Dr. Anna Hoffmann', company: 'CEO · MedTech Solutions', rating: 5,
      photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=85&auto=format&fit=crop',
      text: 'Das Redesign unserer Patient-App hat die Akzeptanz bei Ärzten um 70 % gesteigert. Das Team hat unsere komplexen klinischen Workflows in eine intuitive Oberfläche übersetzt — ohne Kompromisse bei Datenschutz oder Compliance. Wir konnten den Rollout auf 12 weitere Kliniken beschleunigen.',
      result: '+70% Adoption',
    },
    {
      name: 'Marco Bertinelli', company: 'CPO · Northstar SaaS', rating: 5,
      photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=85&auto=format&fit=crop',
      text: 'Ein Design System, das wirklich funktioniert. Unsere Dev-Velocity hat sich verdoppelt und der visuelle Drift ist endlich beendet.',
    },
    {
      name: 'Sarah Lindqvist', company: 'Head of Product · Nordic Bank', rating: 5,
      photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=85&auto=format&fit=crop',
      text: 'Professionell, schnell, partnerschaftlich. Unser Online-Banking ist seit dem Relaunch das meistgelobte Feature in den Stores.',
    },
    {
      name: 'Daniel Okafor', company: 'Founder · CartFlow', rating: 5,
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=85&auto=format&fit=crop',
      text: 'Unser Checkout-Redesign hat den Umsatz pro Besucher um 38 % erhöht. ROI war nach 6 Wochen vollständig erreicht.',
    },
    {
      name: 'Lena Vogt', company: 'Marketing Director · TravelGo', rating: 5,
      photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=85&auto=format&fit=crop',
      text: 'Vom ersten Workshop bis zum Launch — strukturiert, kreativ und immer mit klarem Blick auf den Business-Impact.',
    },
    {
      name: 'Ravi Mehta', company: 'CTO · ScaleOps', rating: 5,
      photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=85&auto=format&fit=crop',
      text: 'Die Handoff-Qualität ist erstklassig. Tokens, Komponenten, Dokumentation — alles ready-to-ship am ersten Tag.',
    },
  ];

  const faqs = [
    { q: 'Was kostet ein UI/UX Projekt?', a: 'Projektgröße ist entscheidend: Ein Landingpage-Redesign startet bei ca. 4.500 €, ein Mobile-App-Design liegt typischerweise zwischen 18.000 € und 60.000 €, ein Design System beginnt bei ca. 25.000 €. Wir liefern immer ein transparentes Festpreis-Angebot nach dem ersten Workshop.' },
    { q: 'Wie lange dauert die Entwicklung?', a: 'Landingpages: 2-3 Wochen. Web-Apps: 6-12 Wochen. Komplexe SaaS-Produkte oder Design Systeme: 3-6 Monate. Wir arbeiten in 2-wöchigen Sprints und liefern alle 2 Wochen verwendbare Ergebnisse.' },
    { q: 'Welche Tools werden verwendet?', a: 'Hauptsächlich Figma für Design und Prototyping, FigJam für Workshops, Maze und Lookback für Usability-Testing, Hotjar für Analytics, sowie Storybook für die Dokumentation des Design Systems.' },
    { q: 'Werden Design-Systeme erstellt?', a: 'Ja — wir empfehlen Design Systeme für alle Projekte mit mehr als 5 Screens. Wir liefern dokumentierte Figma-Bibliotheken inkl. Design Tokens (Colors, Spacing, Typo), Variants und Auto-Layout-Komponenten — übergabefertig für Ihr Dev-Team.' },
    { q: 'Gibt es Support nach Projektabschluss?', a: 'Ja. Wir bieten flexible Care-Pakete (10/20/40 Std/Monat) für Iterationen, neue Features und Komponenten. Außerdem ein 30-Tage-Bugfix-Window inklusive — kostenlos nach jedem Launch.' },
    { q: 'Arbeitet ihr mit unseren Entwicklern zusammen?', a: 'Definitiv. Wir liefern Developer-Ready Designs mit Tokens, Specs in Figma Dev Mode, und stehen während der Implementierung für Reviews und Anpassungen zur Verfügung. Pair-Design-Sessions mit Frontend-Teams sind Teil unseres Standard-Workflows.' },
  ];

  // Glass card base style
  const glass = {
    background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.015) 100%)',
    backdropFilter: 'blur(20px)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-xl)',
  };

  const testimonialItems = (approvedTestimonials.length >= 3 ? approvedTestimonials : testimonials).map((t) => ({
    name: t.name,
    role: [t.position, t.company].filter(Boolean).join(', '),
    rating: t.rating,
    content: t.content || t.text,
    avatar: t.avatar || t.photo,
  }));

  return (
    <div className="page-transition" data-testid="uiux-page" ref={pageRef}>
      <Header />
      <TestimonialForm isOpen={showReviewForm} onClose={() => setShowReviewForm(false)} />
      <Seo
        title="UI/UX Design für digitale Produkte"
        description="Nutzerzentriertes UI/UX Design mit UX-Research, Prototyping und durchdachter User Journey für digitale Produkte."
        path="/services/ui-ux-design"
        jsonLd={UIUXPAGE_JSONLD}
      />

      <div className="sr-only"><h1>UI/UX Design für digitale Produkte</h1></div>

      <ServiceAdvisorBlock serviceId="ui-ux" />


      {/* ====== 01. ÜBER UI/UX — Editorial Split ====== */}
      <section className="section" data-testid="about-uiux" style={{ background: 'var(--bg-secondary)', paddingTop: '140px', paddingBottom: '140px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '20%', left: '-10%', width: '600px', height: '600px', background: `radial-gradient(circle, ${ACCENT}10 0%, transparent 60%)`, borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="uiux-editorial-grid">
            {/* LEFT — Manifesto */}
            <div>
              {sectionLabel('Über UI/UX Design')}
              <h2 className="heading-1" style={{ fontSize: '48px', fontWeight: 900, lineHeight: 1.1, marginBottom: '24px' }}>
                Schönheit ist gut.<br /><span className="text-gradient">Verständlichkeit ist besser.</span>
              </h2>
              <p style={{ fontSize: '17px', color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '40px' }}>
                UI ist die Form, UX ist die Funktion — beides zusammen ist unschlagbar. Ein Produkt kann visuell
                brilliant sein und trotzdem versagen, wenn der Flow nicht stimmt. Wir verbinden beide Disziplinen
                zu einem zusammenhängenden Erlebnis — vom ersten Klick bis zur fünften Wiederkehr.
              </p>
              <div className="svc-icon-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {[...WHY_ICONS, ...WHY_ICONS].map((item, idx) => (
                  <div key={idx} className="svc-icon-chip" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 18px', background: 'linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))', border: '1px solid var(--border-subtle)', borderRadius: '999px', transition: 'all 0.3s ease' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = item.color; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                    {item.logo.includes('cdn.jsdelivr.net/npm/simple-icons') ? (
                      <div aria-hidden style={{ width: 18, height: 18, flexShrink: 0, backgroundColor: item.color, WebkitMaskImage: `url(${item.logo})`, maskImage: `url(${item.logo})`, WebkitMaskSize: 'contain', maskSize: 'contain', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskPosition: 'center' }} />
                    ) : (
                      <img src={item.logo} alt={item.label} loading="lazy" style={{ width: 18, height: 18, objectFit: 'contain' }} />
                    )}
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — Interactive Design-System Showcase */}
            <div className="uiux-mockup-scale" style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', inset: '-20px', background: `radial-gradient(circle, ${ACCENT}22 0%, transparent 60%)`, filter: 'blur(40px)' }} />
              <div style={{ position: 'relative', background: 'linear-gradient(145deg, #141414 0%, #0a0a0a 100%)', borderRadius: '16px', border: '1px solid #2a2a2a', boxShadow: '0 30px 80px rgba(0,0,0,0.6)', overflow: 'hidden' }}>
                {/* canvas header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', background: '#181818', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Layout size={16} color={ACCENT} />
                    <span style={{ fontSize: '12px', color: '#fff', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>Design_System.figma</span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {[MousePointer, Boxes, Palette].map((Ic, k) => (
                      <div key={k} className={k === 0 ? 'uiux-tool-active' : undefined} style={{ width: '24px', height: '24px', borderRadius: '6px', background: k === 0 ? `${ACCENT}26` : 'rgba(255,255,255,0.04)', border: k === 0 ? `1px solid ${ACCENT}66` : '1px solid transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Ic size={12} color={k === 0 ? ACCENT : '#666'} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* interactive component preview */}
                <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '10px', color: '#888', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '14px' }}>Components</div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
                    <button type="button" className="uiux-demo-btn uiux-demo-btn--primary uiux-btn-glow">Primary</button>
                    <button type="button" className="uiux-demo-btn uiux-demo-btn--outline">Secondary</button>
                    <button type="button" className="uiux-demo-btn uiux-demo-btn--ghost">Ghost</button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px' }}>
                    <span style={{ fontSize: '13px', color: '#ccc' }}>Dark Mode</span>
                    <button
                      type="button"
                      onClick={() => setShowcaseDark((v) => !v)}
                      aria-pressed={showcaseDark}
                      aria-label="Demo: Dark Mode umschalten"
                      style={{
                        width: '40px', height: '22px', borderRadius: '999px', border: 'none', cursor: 'pointer', padding: '2px',
                        background: showcaseDark ? ACCENT : 'rgba(255,255,255,0.15)', transition: 'background 0.25s ease',
                        display: 'flex', justifyContent: showcaseDark ? 'flex-end' : 'flex-start',
                      }}
                    >
                      <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#fff', display: 'block', boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }} />
                    </button>
                  </div>
                </div>

                {/* design tokens */}
                <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '10px', color: '#888', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '10px' }}>Farb-Tokens</div>
                  <div data-keep-grid className="uiux-token-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
                    {[
                      { c: ACCENT, l: 'Primary' },
                      { c: '#22C55E', l: 'Success' },
                      { c: '#F59E0B', l: 'Warning' },
                      { c: '#EF4444', l: 'Danger' },
                      { c: '#0a0a0a', l: 'Neutral-900' },
                      { c: '#FFFFFF', l: 'Neutral-100' },
                    ].map((t, k) => (
                      <div key={k} className="uiux-token" style={{ position: 'relative', animationDelay: `${k * 0.07}s` }}>
                        <div style={{ width: '100%', aspectRatio: '1', borderRadius: '8px', background: t.c, border: '1px solid rgba(255,255,255,0.1)' }} />
                        <div style={{ fontSize: '7px', color: '#666', textAlign: 'center', marginTop: '4px', fontFamily: 'JetBrains Mono, monospace' }}>{t.l}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* typography */}
                <div style={{ padding: '16px 20px' }}>
                  <div style={{ fontSize: '10px', color: '#888', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '12px' }}>Type Scale</div>
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ fontSize: '28px', fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-0.02em' }}>Heading</div>
                    <div style={{ fontSize: '10px', color: ACCENT, fontWeight: 700, marginTop: '4px' }}>32px · 900</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 400, color: '#aaa' }}>Body text für Interfaces.</div>
                    <div style={{ fontSize: '10px', color: '#666', fontWeight: 600, marginTop: '4px' }}>16px · 400</div>
                  </div>
                </div>

                {/* applied mobile mockup */}
                <div style={{ padding: '16px 20px 20px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '18px' }}>
                  <div className="uiux-phone-float" style={{ flexShrink: 0, width: '84px', height: '168px', background: '#000', borderRadius: '18px', border: '2px solid #2a2a2a', padding: '6px', boxShadow: '0 16px 32px rgba(0,0,0,0.5)' }}>
                    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(180deg, #141414, #0a0a0a)', borderRadius: '13px', padding: '10px 8px', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ width: '32px', height: '5px', background: `${ACCENT}`, borderRadius: '3px', marginBottom: '10px' }} />
                      <div style={{ width: '100%', height: '36px', background: 'rgba(255,255,255,0.05)', border: `1px solid ${ACCENT}30`, borderRadius: '6px', marginBottom: '8px' }} />
                      <div style={{ width: '70%', height: '4px', background: 'rgba(255,255,255,0.15)', borderRadius: '2px', marginBottom: '6px' }} />
                      <div style={{ width: '50%', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', marginBottom: '10px' }} />
                      <div className="uiux-mock-btn" style={{ width: '100%', height: '18px', background: ACCENT, borderRadius: '5px' }} />
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: '#888', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>Live angewendet</div>
                    <div style={{ fontSize: '13px', color: '#ccc', lineHeight: 1.6, maxWidth: '180px' }}>Ein Design-System, das sich konsistent von Web bis Mobile durchzieht.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <style>{`
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
          @media (max-width: 640px) {
            .uiux-token-grid { gap: 5px !important; }
            .uiux-token-grid > div > div:first-child { border-radius: 6px !important; }
            .uiux-token-grid > div > div:last-child { font-size: 6px !important; margin-top: 3px !important; }
          }
          .uiux-demo-btn { padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 700; font-family: inherit; cursor: pointer; transition: all 0.2s ease; border: 1px solid transparent; }
          .uiux-demo-btn--primary { background: ${ACCENT}; color: #000; }
          .uiux-demo-btn--primary:hover { background: ${ACCENT_2}; transform: translateY(-2px); box-shadow: 0 8px 20px ${ACCENT}40; }
          .uiux-demo-btn--outline { background: transparent; color: ${ACCENT}; border-color: ${ACCENT}66; }
          .uiux-demo-btn--outline:hover { background: ${ACCENT}1A; border-color: ${ACCENT}; }
          .uiux-demo-btn--ghost { background: transparent; color: #999; }
          .uiux-demo-btn--ghost:hover { background: rgba(255,255,255,0.08); color: #fff; }
          @keyframes uiuxBtnGlow { 0%, 100% { box-shadow: 0 0 0 0 ${ACCENT}55; } 50% { box-shadow: 0 0 14px 2px ${ACCENT}55; } }
          .uiux-btn-glow { animation: uiuxBtnGlow 2.4s ease-in-out infinite; }
          @keyframes uiuxToolPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
          .uiux-tool-active { animation: uiuxToolPulse 1.8s ease-in-out infinite; }
          @keyframes uiuxTokenIn { from { opacity: 0; transform: scale(0.6) translateY(6px); } to { opacity: 1; transform: scale(1) translateY(0); } }
          .uiux-token { animation: uiuxTokenIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both; }
          .uiux-phone-float { animation: uiuxPhoneFloat 4s ease-in-out infinite; }
          @media (max-width: 640px) { .uiux-phone-float { width: 60px !important; height: 120px !important; } }
          @media (max-width: 640px) {
            .uiux-mockup-scale { width: 480px !important; zoom: 0.7; }
          }
          @keyframes uiuxPhoneFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
          .uiux-mock-btn { animation: uiuxBtnGlow 2.4s ease-in-out infinite; }
          @media (prefers-reduced-motion: reduce) {
            .uiux-btn-glow, .uiux-tool-active, .uiux-token, .uiux-phone-float, .uiux-mock-btn { animation: none !important; opacity: 1 !important; }
          }
        `}</style>
      </section>

      {/* ========== STACK-SHOWCASE ========== */}
      <UiuxStackShowcase />

      {/* ====== LEISTUNGSSPEKTRUM ====== */}
      <section className="section" data-testid="section-leistungsspektrum" style={{ paddingTop: '140px', paddingBottom: '140px', position: 'relative', overflow: 'hidden' }}>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '60px', alignItems: 'center', marginBottom: '72px' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ width: '40px', height: '1px', background: ACCENT }} />
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', fontWeight: 600, color: ACCENT, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Leistungsspektrum</span>
              </div>
              <h2 className="heading-1" style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 900, lineHeight: 1.1, marginBottom: '20px' }}>
                UI/UX, <span style={{ color: ACCENT }}>komplett gedacht</span>
              </h2>
              <p style={{ fontSize: '17px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                Von Research über Design bis Validierung und Übergabe: jede Phase greift bei uns ineinander –
                statt isolierter Einzelstücke bekommen Sie ein durchdachtes Produkterlebnis.
              </p>
            </div>
            <div style={{
              background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
              border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)',
              backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
              padding: '32px', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', lineHeight: 1.8,
            }}>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FF5F57' }} />
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FFBD2E' }} />
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#28CA42' }} />
                <span style={{ marginLeft: '12px', color: 'var(--text-muted)', fontSize: '12px' }}>design_system.py</span>
              </div>
              <TypingCode lines={DESIGN_SYSTEM_CODE} />
            </div>
          </div>

          <ServiceTabsGrid tabs={UIUX_SERVICE_TABS} services={UIUX_SERVICES} />
        </div>
      </section>

      {/* ====== 05. TOOLS — Spotlight + Marquee ====== */}
      <section className="section" data-testid="design-tools" style={{ background: 'var(--bg-secondary)', paddingTop: '140px', paddingBottom: '140px', position: 'relative', overflow: 'hidden' }}>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: '72px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ width: '40px', height: '1px', background: ACCENT }} />
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', fontWeight: 600, color: ACCENT, letterSpacing: '0.15em', textTransform: 'uppercase' }}>05 · Tools &amp; Stack</span>
              <div style={{ width: '40px', height: '1px', background: ACCENT }} />
            </div>
            <h2 className="heading-1" style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 900, lineHeight: 1.1, marginBottom: '20px' }}>
              Industry-Standard <span style={{ color: ACCENT }}>Tools</span>
            </h2>
            <p style={{ fontSize: '17px', color: 'var(--text-muted)', maxWidth: '640px', margin: '0 auto', lineHeight: 1.7 }}>
              Wir arbeiten mit dem gleichen Toolset, das führende Studios und Tech-Giganten weltweit einsetzen.
            </p>
          </div>

          <ToolDock tools={tools} />
        </div>
      </section>

      {/* ====== WERKZEUGE IM PROZESS ====== */}
      <section className="section" data-testid="section-process-tools" style={{ paddingTop: '140px', paddingBottom: '140px', position: 'relative', overflow: 'hidden' }}>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ width: '40px', height: '1px', background: ACCENT }} />
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', fontWeight: 600, color: ACCENT, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Werkzeuge</span>
              <div style={{ width: '40px', height: '1px', background: ACCENT }} />
            </div>
            <h2 className="heading-1" style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 900, lineHeight: 1.1, marginBottom: '16px' }}>
              Wo <span style={{ color: ACCENT }}>Ihr Design-Prozess lebt.</span>
            </h2>
            <p style={{ fontSize: '17px', color: 'var(--text-muted)', maxWidth: '640px', margin: '0 auto', lineHeight: 1.7 }}>
              Das richtige Tool pro Phase macht den Unterschied zwischen einem Prozess, der fließt – und einem, der stockt.
            </p>
          </div>

          <div className="compare-grid" data-keep-grid style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '56px' }}>
            {UX_PROCESS_TOOLS.map((t, i) => (
              <div key={t.phase} data-reveal style={{
                background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
                border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)',
                backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', padding: '28px',
                opacity: 0, transform: 'translateY(30px)', transition: `all 0.8s ${i * 0.08}s ease`,
              }}
                   onMouseEnter={(e) => { e.currentTarget.style.borderColor = t.color; e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = `0 20px 40px ${t.color}25`; }}
                   onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                  <img src={t.logo} alt={t.tool} width="44" height="44" loading="lazy" style={{ objectFit: 'contain' }} />
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700 }}>{t.phase}</h3>
                    <span style={{ fontSize: '12px', color: t.color }}>{t.tool}</span>
                  </div>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.7 }}>{t.desc}</p>
              </div>
            ))}
          </div>

          {/* Comparison Table */}
          <div data-reveal style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
            border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)',
            backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', overflow: 'hidden',
            opacity: 0, transform: 'translateY(30px)', transition: 'all 0.8s 0.2s ease',
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '720px' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,107,0,0.06)' }}>
                    {['Phase', 'Tool', 'Zweck', 'Team-Größe'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '20px 24px', fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', color: ACCENT, fontWeight: 600, borderBottom: '1px solid var(--border-subtle)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {UX_PROCESS_TOOLS.map((t, i) => (
                    <tr key={t.phase} style={{ borderBottom: i < UX_PROCESS_TOOLS.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                      <td style={{ padding: '20px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img src={t.logo} alt={t.tool} width="28" height="28" loading="lazy" style={{ objectFit: 'contain' }} />
                          <span style={{ fontWeight: 600 }}>{t.phase}</span>
                        </div>
                      </td>
                      <td style={{ padding: '20px 24px', color: 'var(--text-secondary)' }}>{t.tool}</td>
                      <td style={{ padding: '20px 24px', color: 'var(--text-muted)', fontSize: '14px' }}>{t.desc}</td>
                      <td style={{ padding: '20px 24px', color: 'var(--text-secondary)' }}>{t.team}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ====== 03. PROZESS — Detailed Timeline with Deliverables ====== */}
      <ModernTimeline
        eyebrow="03 · Unser Prozess"
        title={<>In 7 Schritten zum <span style={{ color: 'var(--accent-primary)' }}>Premium-Design</span></>}
        subtitle="Ein strukturierter Prozess mit klaren Deliverables in jeder Phase. Vollständige Transparenz von Tag 1."
        background="var(--bg-secondary)"
        steps={processSteps.map((s) => ({
          icon: s.icon,
          title: s.title,
          duration: s.num,
          desc: s.desc,
          deliverables: s.deliverables,
          image: s.image,
        }))}
      />

      {/* ====== BRANCHEN ====== */}
      <ServiceIndustries
        slug="ui-ux"
        defaultItems={INDUSTRIES.map((c) => ({
          icon: c.icon?.displayName || c.icon?.name || 'Building2',
          title: c.title, tag: c.tag, desc: c.desc, img: c.img,
        }))}
        defaultHeading="Design für jede Branche"
        defaultSubtitle="Jede Branche stellt eigene Anforderungen an Vertrauen, Klarheit und Nutzerführung."
        eyebrowLabel="Branchen"
      />

      {/* ====== VORTEILE ====== */}
      <ModernBenefits
        eyebrow="Vorteile"
        title="Was gutes UI/UX Design bringt"
        accentWord="gutes UI/UX Design"
        subtitle="Design ist kein Kostenfaktor, sondern eine Investition mit messbarer Rendite."
        items={UIUX_BENEFITS}
        image="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&q=80&auto=format&fit=crop"
        testid="section-benefits"
      />

      {/* ====== 06. PORTFOLIO ====== */}
      <ServicePortfolioSection
        serviceId="ui-ux"
        fallbackExamples={portfolioFallback}
        eyebrow="Portfolio"
        title="Ausgewählte"
        accentWord="Projekte"
        subtitle="Echte Designs für echte Kunden — mit messbaren Ergebnissen."
        testid="design-portfolio"
        showCategoryFilter
      />

      {/* ====== 08. PRINCIPLES — Numbered Manifesto ====== */}
      <section className="section" data-testid="design-principles" style={{ paddingTop: '140px', paddingBottom: '140px', position: 'relative', overflow: 'hidden' }}>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: '72px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ width: '40px', height: '1px', background: ACCENT }} />
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', fontWeight: 600, color: ACCENT, letterSpacing: '0.15em', textTransform: 'uppercase' }}>08 · Prinzipien</span>
              <div style={{ width: '40px', height: '1px', background: ACCENT }} />
            </div>
            <h2 className="heading-1" style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 900, lineHeight: 1.1, marginBottom: '20px' }}>
              Unsere <span style={{ color: ACCENT }}>Design-Philosophie</span>
            </h2>
            <p style={{ fontSize: '17px', color: 'var(--text-muted)', maxWidth: '640px', margin: '0 auto', lineHeight: 1.7 }}>
              Sechs Prinzipien, die jedes Projekt leiten — von der ersten Skizze bis zum finalen Pixel.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
            {principles.map((p, idx) => (
              <div key={idx} style={{
                padding: '40px',
                background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
                borderRight: idx % 3 !== 2 ? '1px solid var(--border-subtle)' : 'none',
                borderBottom: idx < 3 ? '1px solid var(--border-subtle)' : 'none',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'default',
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = `linear-gradient(145deg, ${ACCENT}15, ${ACCENT}03)`;
                  const img = e.currentTarget.querySelector('.principle-bg-img');
                  if (img) img.style.opacity = '0.32';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)';
                  const img = e.currentTarget.querySelector('.principle-bg-img');
                  if (img) img.style.opacity = '0.18';
                }}
              >
                {p.bg && (
                  <>
                    <div className="principle-bg-img" style={{ position: 'absolute', inset: 0, backgroundImage: `url(${p.bg})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.18, transition: 'opacity 0.3s ease' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,10,10,0.3) 0%, rgba(10,10,10,0.88) 100%)' }} />
                  </>
                )}
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '48px',
                  fontWeight: 900,
                  color: ACCENT,
                  opacity: 0.4,
                  lineHeight: 1,
                  marginBottom: '20px',
                  position: 'relative', zIndex: 1,
                }}>{p.num}</div>
                <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px', position: 'relative', zIndex: 1 }}>{p.title}</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.7, position: 'relative', zIndex: 1 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== 09. TESTIMONIALS — Featured + Grid ====== */}
      <section className="section" data-testid="design-testimonials" style={{ background: 'var(--bg-secondary)', paddingTop: '140px', paddingBottom: '140px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: '0', right: '0', width: '50%', height: '60%', background: `radial-gradient(circle at bottom right, ${ACCENT}10 0%, transparent 60%)`, pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ width: '40px', height: '1px', background: ACCENT }} />
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', fontWeight: 600, color: ACCENT, letterSpacing: '0.15em', textTransform: 'uppercase' }}>09 · Stimmen</span>
              <div style={{ width: '40px', height: '1px', background: ACCENT }} />
            </div>
            <h2 className="heading-1" style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 900, lineHeight: 1.1, marginBottom: '20px' }}>
              Was unsere <span style={{ color: ACCENT }}>Kunden</span> sagen
            </h2>
          </div>

          <TestimonialsMarquee items={testimonialItems} />
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <button onClick={() => setShowReviewForm(true)} data-testid="write-review-btn" style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              padding: '14px 28px', background: 'transparent',
              border: `2px solid ${ACCENT}`, borderRadius: '50px',
              color: ACCENT, fontSize: '15px', fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.3s ease', fontFamily: 'inherit',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.background = ACCENT; e.currentTarget.style.color = '#000'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = ACCENT; }}
            >
              <Plus size={18} /> Bewertung schreiben
            </button>
          </div>
        </div>
      </section>

      {/* ====== 11. FAQ — Modern Side-by-Side ====== */}
      <section className="section" data-testid="design-faq" style={{ background: 'var(--bg-secondary)', paddingTop: '140px', paddingBottom: '140px', position: 'relative', overflow: 'hidden' }}>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="faq-grid">
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ width: '40px', height: '1px', background: ACCENT }} />
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', fontWeight: 600, color: ACCENT, letterSpacing: '0.15em', textTransform: 'uppercase' }}>11 · FAQ</span>
              </div>
              <h2 className="heading-1" style={{ fontSize: 'clamp(36px, 5vw, 48px)', fontWeight: 900, lineHeight: 1.1, marginBottom: '20px' }}>
                Häufige <span style={{ color: ACCENT }}>Fragen</span>
              </h2>
              <p style={{ fontSize: '16px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '32px' }}>
                Antworten auf die wichtigsten Fragen rund um unsere UI/UX Design Services.
              </p>
              <Link to="/contact" className="btn-fill btn-fill-dark" style={{
                display: 'inline-flex', alignItems: 'center', gap: '10px',
                padding: '14px 24px',
                background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_2})`,
                borderRadius: 'var(--radius-md)',
                fontWeight: 700, fontSize: '14px', textDecoration: 'none',
                boxShadow: `0 15px 40px ${ACCENT}44`,
              }}>
                Frage stellen <ArrowUpRight size={16} />
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {faqs.map((faq, idx) => (
                <div key={idx} style={{
                  background: openFaq === idx ? `linear-gradient(145deg, ${ACCENT}12, ${ACCENT}02)` : 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
                  border: `1px solid ${openFaq === idx ? ACCENT : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                }}>
                  <button onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)} data-testid={`faq-toggle-${idx}`}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '22px 24px', background: 'transparent', border: 'none', cursor: 'pointer',
                      color: 'var(--text-primary)', textAlign: 'left',
                    }}>
                    <span style={{ fontSize: '16px', fontWeight: 600, paddingRight: '16px' }}>{faq.q}</span>
                    <div style={{ width: '32px', height: '32px', background: `${ACCENT}15`, border: `1px solid ${ACCENT}40`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'transform 0.3s ease', transform: openFaq === idx ? 'rotate(45deg)' : 'rotate(0deg)' }}>
                      <Plus size={14} color={ACCENT} />
                    </div>
                  </button>
                  {openFaq === idx && (
                    <div style={{ padding: '0 24px 22px', fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <ServiceContactForm
        defaultService="ui-ux"
        title="Lassen Sie uns reden."
        subtitle="Erzählen Sie uns von Ihrem Projekt — wir melden uns innerhalb von 24 Stunden mit konkreten nächsten Schritten."
      />      <RelatedServices items={UIUXPAGE_RELATED} />      <Footer />
      <Chatbot />

      {/* ====== Responsive styles ====== */}
      <style>{`
        .uiux-editorial-grid {
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: 64px;
          align-items: center;
        }
        .uiux-editorial-grid > div { min-width: 0; }
        .faq-grid {
          display: grid;
          grid-template-columns: 1fr 1.6fr;
          gap: 64px;
          align-items: flex-start;
        }
        .contact-grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 32px;
        }
        @media (max-width: 1024px) {
          .faq-grid, .contact-grid, .testimonial-featured, .process-active-card {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
          .process-active-card { padding: 32px !important; }
          .uiux-editorial-grid { grid-template-columns: 1fr !important; gap: 0 !important; }
          .uiux-editorial-grid > div:first-child { display: contents; }
          .uiux-editorial-grid > div:last-child { margin-top: 32px; }
          .svc-icon-row { order: 1; margin-top: 32px; }
        }
        @media (max-width: 640px) {
          .testimonial-featured > div:first-child { min-height: 280px; }
        }
      `}</style>
    </div>
  );
};

const labelStyle = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 700,
  marginBottom: '8px',
  color: ACCENT,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
};

const inputStyle = {
  width: '100%',
  padding: '14px 16px',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--text-primary)',
  fontSize: '14px',
  outline: 'none',
  transition: 'border-color 0.2s',
};

// ------------ Subcomponents ------------

const UX_PROCESS_TOOLS = [
  { phase: 'Research & Workshops', tool: 'Miro', logo: 'https://cdn.simpleicons.org/miro/FFD02F', color: '#FFD02F',
    team: 'Klein (2–4)', desc: 'Gemeinsames Whiteboard für User-Research, Journey-Maps und Ideation-Workshops.' },
  { phase: 'Wireframing & UI', tool: 'Figma', logo: 'https://cdn.simpleicons.org/figma/F24E1E', color: '#F24E1E',
    team: 'Mittel (3–6)', desc: 'Kollaboratives Interface-Design mit Design-Tokens und wiederverwendbaren Komponenten.' },
  { phase: 'Interaktive Prototypen', tool: 'Framer', logo: 'https://cdn.simpleicons.org/framer/0099FF', color: '#0099FF',
    team: 'Klein (1–3)', desc: 'High-Fidelity-Prototypen mit echten Animationen – fühlen sich an wie das fertige Produkt.' },
  { phase: 'Doku & Handoff', tool: 'Notion', logo: 'https://cdn.simpleicons.org/notion/FFFFFF', color: '#FFFFFF',
    team: 'Ganzes Team', desc: 'Zentrale Dokumentation von Entscheidungen, Guidelines und Entwickler-Handoff.' },
];

const UIUX_BELT = [
  { name: 'Figma', logo: 'https://cdn.simpleicons.org/figma/F24E1E', color: '#F24E1E' },
  { name: 'Framer', logo: 'https://cdn.simpleicons.org/framer/0099FF', color: '#0099FF' },
  { name: 'Sketch', logo: 'https://cdn.simpleicons.org/sketch/F7B500', color: '#F7B500' },
  { name: 'Miro', logo: 'https://cdn.simpleicons.org/miro/FFD02F', color: '#FFD02F' },
  { name: 'FigJam', logo: 'https://cdn.simpleicons.org/figma/A259FF', color: '#A259FF' },
  { name: 'Notion', logo: 'https://cdn.simpleicons.org/notion/FFFFFF', color: '#FFFFFF' },
];

// ---- UI/UX-specific stack-showcase visuals (unique per service — only the
// "Unsere Tools" TechBelt card stays shared) ----

const CursorHeatmap = () => (
  <div className="uiux-heatmap">
    <div className="uiux-heatmap-grid" />
    <span className="uiux-heatmap-ripple" style={{ left: '22%', top: '28%', animationDelay: '0s' }} />
    <span className="uiux-heatmap-ripple" style={{ left: '62%', top: '52%', animationDelay: '0.9s' }} />
    <span className="uiux-heatmap-ripple" style={{ left: '38%', top: '74%', animationDelay: '1.8s' }} />
    <MousePointer2 size={16} className="uiux-heatmap-cursor" />
  </div>
);

const UIUX_STAGES = [
  { l: 'Research', c: '#FF6B00', logo: 'https://cdn.simpleicons.org/miro/FF6B00' },
  { l: 'Wireframe', c: '#8B5CF6', logo: 'https://cdn.simpleicons.org/figma/8B5CF6' },
  { l: 'Prototype', c: '#22C55E', logo: 'https://cdn.simpleicons.org/framer/22C55E' },
  { l: 'Testing', c: '#EC4899', logo: 'https://cdn.simpleicons.org/maze/EC4899' },
];

const StickyNoteBoard = () => (
  <div className="uiux-board">
    {UIUX_STAGES.map((s, i) => (
      <span
        key={s.l}
        className="uiux-sticky"
        style={{ background: `${s.c}22`, borderColor: `${s.c}55`, color: s.c, animationDelay: `${i * 0.5}s`, '--rot': `${(i % 2 === 0 ? -1 : 1) * (3 + i)}deg` }}
      >
        <img src={s.logo} alt={s.l} className="uiux-sticky-logo" loading="lazy" />
        {s.l}
      </span>
    ))}
  </div>
);

const ResponsiveMorph = () => (
  <div className="uiux-responsive">
    <div className="uiux-responsive-frame">
      <span className="uiux-responsive-bar" />
      <span className="uiux-responsive-bar" style={{ width: '60%' }} />
    </div>
  </div>
);

const TokenPalette = () => (
  <div className="uiux-tokens">
    <div className="uiux-tokens-swatches">
      {['#FF6B00', '#8B5CF6', '#22C55E', '#EF4444'].map((c, i) => (
        <span key={c} className="uiux-swatch" style={{ background: c, animationDelay: `${i * 0.25}s` }} />
      ))}
    </div>
    <div className="uiux-tokens-spacing">
      {[6, 12, 18, 24].map((h, i) => (
        <span key={i} className="uiux-spacing-bar" style={{ height: h, animationDelay: `${i * 0.25}s` }} />
      ))}
    </div>
  </div>
);

const ButtonRipple = () => (
  <div className="uiux-btn-demo">
    <button type="button" className="uiux-demo-ripple-button">Klicken</button>
    <span className="uiux-btn-ripple" />
  </div>
);

const UiuxStackShowcase = () => (
  <StackShowcaseSection
    eyebrow="Unser Prozess"
    title={<>Gebaut für <span style={{ color: 'var(--accent-primary)' }}>intuitive</span> Erlebnisse</>}
    subtitle="Von der User-Research bis zum High-Fidelity-Prototyp – Design, das funktioniert."
    testid="section-stack-showcase"
  >
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr 1fr', gap: '20px', marginBottom: '20px' }} className="asf-row">
      <StackCard title="Nutzerzentriert von Tag eins"><CursorHeatmap /></StackCard>
      <StackCard title="Unser UX-Workflow"><StickyNoteBoard /></StackCard>
      <StackCard title="Für jedes Gerät designed"><ResponsiveMorph /></StackCard>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }} className="asf-row">
      <StackCard title="Design-Tokens, entwicklerfertig"><TokenPalette /></StackCard>
      <StackCard title="Unsere Tools"><TechBelt tools={UIUX_BELT} /></StackCard>
      <StackCard title="Micro-Interactions, poliert"><ButtonRipple /></StackCard>
    </div>
    <style>{`
      .uiux-heatmap { position: relative; width: 100%; height: 100px; }
      .uiux-heatmap-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px); background-size: 16px 16px; border-radius: 10px; border: 1px solid var(--border-subtle); }
      .uiux-heatmap-ripple { position: absolute; width: 10px; height: 10px; border-radius: 50%; background: var(--accent-primary); transform: translate(-50%, -50%); animation: uiuxRipple 2.7s ease-out infinite; }
      @keyframes uiuxRipple { 0% { box-shadow: 0 0 0 0 rgba(255,107,0,0.5); opacity: 1; } 70% { box-shadow: 0 0 0 16px rgba(255,107,0,0); opacity: 0.4; } 100% { box-shadow: 0 0 0 16px rgba(255,107,0,0); opacity: 0; } }
      .uiux-heatmap-cursor { position: absolute; color: #fff; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5)); animation: uiuxCursorMove 2.7s ease-in-out infinite; }
      @keyframes uiuxCursorMove { 0%, 6% { left: 22%; top: 28%; } 33%, 39% { left: 62%; top: 52%; } 66%, 72% { left: 38%; top: 74%; } 100% { left: 22%; top: 28%; } }

      .uiux-board { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; align-content: center; width: 100%; }
      .uiux-sticky { display: inline-flex; align-items: center; gap: 6px; padding: 10px 14px; border-radius: 8px; border: 1px solid; font-size: 11px; font-weight: 700; opacity: 0; transform: rotate(var(--rot)) scale(0.7); animation: uiuxStickyIn 3s ease-in-out infinite; }
      .uiux-sticky-logo { width: 14px; height: 14px; object-fit: contain; flex-shrink: 0; }
      @keyframes uiuxStickyIn { 0% { opacity: 0; transform: rotate(var(--rot)) scale(0.7); } 15%, 80% { opacity: 1; transform: rotate(var(--rot)) scale(1); } 95%, 100% { opacity: 0; transform: rotate(var(--rot)) scale(0.7); } }

      .uiux-responsive { display: flex; align-items: center; justify-content: center; width: 100%; height: 90px; }
      .uiux-responsive-frame { display: flex; flex-direction: column; gap: 6px; height: 56px; padding: 10px 8px; border-radius: 10px; border: 2px solid var(--accent-primary); background: rgba(255,107,0,0.06); animation: uiuxFrameResize 3.6s ease-in-out infinite; }
      @keyframes uiuxFrameResize { 0%, 100% { width: 110px; } 50% { width: 46px; } }
      .uiux-responsive-bar { display: block; height: 6px; border-radius: 3px; background: rgba(255,255,255,0.2); width: 100%; }

      .uiux-tokens { display: flex; flex-direction: column; gap: 14px; width: 100%; }
      .uiux-tokens-swatches { display: flex; gap: 8px; justify-content: center; }
      .uiux-swatch { width: 24px; height: 24px; border-radius: 7px; animation: uiuxSwatchPulse 2.4s ease-in-out infinite; }
      @keyframes uiuxSwatchPulse { 0%, 100% { transform: scale(1); box-shadow: none; } 50% { transform: scale(1.18); box-shadow: 0 0 12px currentColor; } }
      .uiux-tokens-spacing { display: flex; align-items: flex-end; gap: 6px; justify-content: center; height: 28px; }
      .uiux-spacing-bar { width: 8px; border-radius: 3px 3px 0 0; background: var(--accent-primary); opacity: 0.35; animation: uiuxSpacingPulse 2.4s ease-in-out infinite; }
      @keyframes uiuxSpacingPulse { 0%, 100% { opacity: 0.35; } 50% { opacity: 1; } }

      .uiux-btn-demo { position: relative; display: flex; align-items: center; justify-content: center; width: 100%; height: 60px; }
      .uiux-demo-ripple-button { padding: 10px 20px; border-radius: 999px; border: none; background: var(--accent-primary); color: #000; font-size: 12px; font-weight: 700; font-family: inherit; animation: uiuxBtnPress 2.2s ease-in-out infinite; }
      @keyframes uiuxBtnPress { 0%, 30%, 100% { transform: scale(1); } 38% { transform: scale(0.88); } 46% { transform: scale(1); } }
      .uiux-btn-ripple { position: absolute; width: 50px; height: 50px; border-radius: 50%; border: 2px solid var(--accent-primary); animation: uiuxBtnRipple 2.2s ease-out infinite; }
      @keyframes uiuxBtnRipple { 0%, 35% { opacity: 0; transform: scale(0.6); } 46% { opacity: 0.8; transform: scale(0.8); } 75% { opacity: 0; transform: scale(1.6); } 100% { opacity: 0; transform: scale(1.6); } }

      @media (prefers-reduced-motion: reduce) {
        .uiux-heatmap-ripple, .uiux-heatmap-cursor, .uiux-sticky, .uiux-responsive-frame, .uiux-swatch, .uiux-spacing-bar, .uiux-demo-ripple-button, .uiux-btn-ripple { animation: none !important; }
      }
    `}</style>
  </StackShowcaseSection>
);

export default UIUXPage;
