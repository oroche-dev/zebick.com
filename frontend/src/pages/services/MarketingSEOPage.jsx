import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Target,
  TrendingUp,
  MousePointer2,
  DollarSign,
  Users,
  Search,
  BarChart3,
  Share2,
  FileText,
  Mail,
  Megaphone,
  MapPin,
  LineChart,
  Repeat,
  Eye,
  Star,
  Lightbulb,
  Settings,
  Rocket,
  ShoppingBag,
  Building2,
  HeartPulse,
  Home,
  UtensilsCrossed,
  Briefcase,
  Instagram,
  HeartHandshake,
  Plus
} from 'lucide-react';
import Header from '../../components/layout/Header';
import ToolDock from '../../components/services/ToolDock';
import TypingCode from '../../components/services/TypingCode';
import ServiceTabsGrid from '../../components/services/ServiceTabsGrid';
import { StackShowcaseSection, StackCard, NativeGrid, WorkflowChecklist, OrbitCard, FileMock, TechBelt, SpringMotion } from '../../components/services/StackShowcase';
import Seo, { SITE_URL } from '../../components/common/Seo';
import RelatedServices from '../../components/services/RelatedServices';
import Footer from '../../components/layout/Footer';
import Chatbot from '../../components/chatbot/Chatbot';
import ModernTimeline from '../../components/services/ModernTimeline';
import ServiceContactForm from '../../components/services/ServiceContactForm';
import ServiceIndustries from '../../components/services/ServiceIndustries';
import { ModernBenefits } from '../../components/services/ModernBenefits';
import ServiceAdvisorBlock from '../../components/tools/ServiceAdvisorBlock';
import ServicePortfolioSection from '../../components/services/ServicePortfolioSection';
import ServiceFAQ from '../../components/services/ServiceFAQ';
import { useSectionReveal } from '../../components/services/useSectionReveal';
import TestimonialsMarquee from '../../components/common/TestimonialsMarquee';
import TestimonialForm from '../../components/common/TestimonialForm';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// ------------ Data ------------
const WHY_ICONS = [
  { logo: 'https://cdn.simpleicons.org/googleads/4285F4', label: 'Google Ads', color: '#4285F4' },
  { logo: 'https://cdn.simpleicons.org/googleanalytics/E37400', label: 'Google Analytics', color: '#E37400' },
  { logo: 'https://cdn.simpleicons.org/meta/0467DF', label: 'Meta Ads', color: '#0467DF' },
  { logo: 'https://cdn.simpleicons.org/hubspot/FF7A59', label: 'HubSpot', color: '#FF7A59' },
  { logo: 'https://cdn.simpleicons.org/mailchimp/FFE01B', label: 'Mailchimp', color: '#FFE01B' },
  { logo: 'https://cdn.simpleicons.org/semrush/FF642D', label: 'SEMrush', color: '#FF642D' },
];

const SERVICES = [
  { tabId: 'seo', icon: Search, title: 'SEO-Optimierung & SEO-Abonnements', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=700&q=80&auto=format&fit=crop', desc: 'Monatliche SEO-Pakete mit On-Page, Technik & Content – wir bringen Ihre Website nachhaltig auf Seite 1.', features: ['On-Page & Technik', 'Keyword-Strategie', 'Content-SEO', 'Linkaufbau', 'Monats-Abo'] },
  { tabId: 'ads', icon: Target, logo: 'https://cdn.simpleicons.org/googleads/4285F4', brandColor: '#4285F4', title: 'Google Ads Management', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=700&q=80&auto=format&fit=crop', desc: 'Profitable Such-, Display- & Shopping-Kampagnen mit messbarem ROAS.', features: ['Search & Shopping', 'Display & YouTube', 'ROAS-Optimierung', 'A/B-Testing'] },
  { tabId: 'ads', icon: Users, brandColor: '#0A66C2', title: 'LinkedIn Lead Generation', image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=700&q=80&auto=format&fit=crop', desc: 'Gezielte B2B-Lead-Generierung über LinkedIn Ads & Sales Navigator-Outreach.', features: ['Decision-Maker-Targeting', 'Conversation Ads', 'InMail-Sequences', 'CRM-Integration'] },
  { tabId: 'leads', icon: HeartHandshake, title: 'Lead-Generierung', image: 'https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=700&q=80&auto=format&fit=crop', desc: 'End-to-End Lead-Funnels: Landingpages, Lead-Magnete, Ads und CRM-Anbindung – planbarer Pipeline-Aufbau.', features: ['Landingpages', 'Lead-Magnete', 'Multichannel-Ads', 'CRM-Integration'] },
  { tabId: 'ads', icon: Share2, logo: 'https://cdn.simpleicons.org/meta/0467DF', brandColor: '#0467DF', title: 'Social Media Marketing', image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=700&q=80&auto=format&fit=crop', desc: 'Organisch & paid auf Meta, LinkedIn & TikTok – für Reichweite und Leads.' },
  { tabId: 'seo', icon: FileText, title: 'Content Marketing', image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=700&q=80&auto=format&fit=crop', desc: 'Strategische Inhalte, die ranken, Vertrauen schaffen und konvertieren.' },
  { tabId: 'leads', icon: Mail, logo: 'https://cdn.simpleicons.org/mailchimp/FFE01B', brandColor: '#FFE01B', title: 'E-Mail-Marketing', image: 'https://images.unsplash.com/photo-1557200134-90327ee9fafa?w=700&q=80&auto=format&fit=crop', desc: 'Automatisierte Funnels & Newsletter, die aus Kontakten Kunden machen.', features: ['Drip-Kampagnen', 'Segmentierung', 'A/B-Tests', 'Reporting'] },
  { tabId: 'leads', icon: MousePointer2, title: 'Conversion-Optimierung (CRO)', image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=700&q=80&auto=format&fit=crop', desc: 'A/B-Tests und UX-Optimierung holen mehr aus Ihrem bestehenden Traffic.', features: ['A/B-Tests', 'Heatmaps', 'Funnel-Analyse', 'UX-Review'] },
  { tabId: 'seo', icon: MapPin, logo: 'https://cdn.simpleicons.org/googlemaps/4285F4', brandColor: '#4285F4', title: 'Local SEO', image: 'https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=700&q=80&auto=format&fit=crop', desc: 'Google Business Profile & lokale Rankings – für Kunden aus Ihrer Region.' },
  { tabId: 'automation', icon: BarChart3, logo: 'https://cdn.simpleicons.org/googleanalytics/E37400', brandColor: '#E37400', title: 'Web-Analytics & Tracking', image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=700&q=80&auto=format&fit=crop', desc: 'Sauberes GA4-, Tag-Manager- & Conversion-Tracking als Basis aller Entscheidungen.' },
  { tabId: 'automation', icon: Repeat, logo: 'https://cdn.simpleicons.org/zapier/FF4F00', brandColor: '#FF4F00', title: 'Marketing-Automation', image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=700&q=80&auto=format&fit=crop', desc: 'Lead-Nurturing und Workflows, die rund um die Uhr für Sie verkaufen.' },
];

const SERVICE_TABS = [
  { id: 'seo', label: 'SEO & Content' },
  { id: 'ads', label: 'Ads & Social' },
  { id: 'leads', label: 'Leads & CRM' },
  { id: 'automation', label: 'Automation & Analytics' },
];

const TECHNOLOGIES = [
  { name: 'Google Analytics', logo: 'https://cdn.simpleicons.org/googleanalytics/E37400', color: '#E37400', desc: 'GA4-Tracking als Datenfundament für alle Marketing-Entscheidungen.' },
  { name: 'Google Ads', logo: 'https://cdn.simpleicons.org/googleads/4285F4', color: '#4285F4', desc: 'Such-, Display- und Shopping-Kampagnen mit präzisem Targeting.' },
  { name: 'Search Console', logo: 'https://cdn.simpleicons.org/googlesearchconsole/458CF5', color: '#458CF5', desc: 'Monitoring von Rankings, Indexierung und technischer SEO-Gesundheit.' },
  { name: 'Semrush', logo: 'https://cdn.simpleicons.org/semrush/FF642D', color: '#FF642D', desc: 'Keyword-Recherche, Wettbewerbsanalyse und Content-Optimierung.' },
  { name: 'Ahrefs', color: '#FF6B00', desc: 'Backlink-Analyse und SEO-Audits auf höchstem Niveau.' },
  { name: 'HubSpot', logo: 'https://cdn.simpleicons.org/hubspot/FF7A59', color: '#FF7A59', desc: 'CRM & Marketing-Automation für nahtloses Lead-Management.' },
  { name: 'Meta Ads', logo: 'https://cdn.simpleicons.org/meta/0467DF', color: '#0467DF', desc: 'Performance-Kampagnen auf Facebook & Instagram mit Pixel-Tracking.' },
  { name: 'Mailchimp', logo: 'https://cdn.simpleicons.org/mailchimp/FFE01B', color: '#FFE01B', desc: 'E-Mail-Kampagnen, Automationen und Audience-Segmentierung.' },
  { name: 'WordPress', logo: 'https://cdn.simpleicons.org/wordpress/21759B', color: '#21759B', desc: 'SEO-optimierte Websites und Landingpages mit voller Kontrolle.' },
  { name: 'Zapier', logo: 'https://cdn.simpleicons.org/zapier/FF4F00', color: '#FF4F00', desc: 'Verbindet Ihre Tools zu automatisierten Marketing-Workflows.' },
];

const MARKETING_CHANNELS = [
  { name: 'SEO', tool: 'Search Console', logo: 'https://cdn.simpleicons.org/googlesearchconsole/458CF5', color: '#458CF5',
    reach: 'Organisch, langfristig', roi: '3–6 Monate',
    desc: 'Nachhaltige Sichtbarkeit bei Google – ohne laufende Mediakosten, dafür mit Vorlaufzeit.' },
  { name: 'Paid Ads', tool: 'Google Ads', logo: 'https://cdn.simpleicons.org/googleads/4285F4', color: '#4285F4',
    reach: 'Sofort, skalierbar', roi: 'Sofort',
    desc: 'Sofortige Sichtbarkeit bei kaufbereiten Suchenden – Budget steuert direkt das Volumen.' },
  { name: 'Social Ads', tool: 'Meta Ads', logo: 'https://cdn.simpleicons.org/meta/0467DF', color: '#0467DF',
    reach: 'Breite Zielgruppen', roi: '2–4 Wochen',
    desc: 'Präzises Targeting nach Interessen und Verhalten auf Facebook & Instagram.' },
  { name: 'E-Mail Marketing', tool: 'Mailchimp', logo: 'https://cdn.simpleicons.org/mailchimp/FFE01B', color: '#FFE01B',
    reach: 'Bestandskunden', roi: '1–2 Monate',
    desc: 'Der günstigste Kanal für wiederkehrenden Umsatz – direkt im Posteingang Ihrer Kunden.' },
];

const PROCESS_STEPS = [
  { icon: Search, title: 'Audit & Analyse', duration: '1 Woche',
    desc: 'Wir analysieren Ihre Website, Wettbewerber, Keywords und bisherige Kampagnen tiefgehend.',
    deliverables: ['SEO-Audit', 'Konkurrenz-Analyse', 'Keyword-Recherche'],
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80&auto=format&fit=crop' },
  { icon: Lightbulb, title: 'Strategie', duration: '1 Woche',
    desc: 'Klare Ziele, Kanäle und KPIs – ein Fahrplan, der zu Ihrem Budget passt.',
    deliverables: ['Marketingplan', 'KPI-Definition', 'Channel-Mix'],
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80&auto=format&fit=crop' },
  { icon: Settings, title: 'Setup & Kampagnen', duration: '1–2 Wochen',
    desc: 'Tracking, Konten und Kampagnen werden sauber aufgesetzt und gestartet.',
    deliverables: ['GA4 & GTM Setup', 'Konten & Pixel', 'Erste Kampagnen'],
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80&auto=format&fit=crop' },
  { icon: FileText, title: 'Content & Optimierung', duration: 'laufend',
    desc: 'Laufende Optimierung von Inhalten, Anzeigen, Geboten und Landingpages.',
    deliverables: ['Content-Plan', 'Anzeigen-Iterationen', 'Landingpage-Tests'],
    image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600&q=80&auto=format&fit=crop' },
  { icon: Activity, title: 'Monitoring', duration: '24/7',
    desc: 'Tägliches Monitoring der Performance – schnelles Eingreifen bei Bedarf.',
    deliverables: ['Live-Dashboards', 'Alerts', 'Daily Checks'],
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80&auto=format&fit=crop' },
  { icon: Rocket, title: 'Reporting & Skalierung', duration: 'monatlich',
    desc: 'Transparente Reports und gezielte Skalierung dessen, was funktioniert.',
    deliverables: ['Monatsreport', 'Strategie-Call', 'Skalierungs-Plan'],
    image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&q=80&auto=format&fit=crop' },
];

const INDUSTRIES = [
  { icon: ShoppingBag, title: 'E-Commerce', tag: 'Retail', desc: 'Shopping-Ads, SEO und CRO für mehr Umsatz pro Besucher.',
    img: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&q=80&auto=format&fit=crop' },
  { icon: Briefcase, title: 'B2B & SaaS', tag: 'Business', desc: 'Lead-Gen über Content, LinkedIn und Google Ads mit langem Sales-Cycle.',
    img: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=900&q=80&auto=format&fit=crop' },
  { icon: MapPin, title: 'Lokale Unternehmen', tag: 'Local', desc: 'Local SEO & Google Business für Kundschaft aus der Region.',
    img: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=900&q=80&auto=format&fit=crop' },
  { icon: HeartPulse, title: 'Gesundheit', tag: 'Health', desc: 'Vertrauensvolle Sichtbarkeit für Praxen, Kliniken und Health-Brands.',
    img: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=900&q=80&auto=format&fit=crop' },
  { icon: Home, title: 'Immobilien', tag: 'Real Estate', desc: 'Leadstarke Kampagnen für Makler, Bauträger und Projektvertrieb.',
    img: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=900&q=80&auto=format&fit=crop' },
  { icon: UtensilsCrossed, title: 'Gastronomie', tag: 'Food', desc: 'Social Media & Local Ads, die Tische und Reservierungen füllen.',
    img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&q=80&auto=format&fit=crop' },
];

const BENEFITS = [
  { icon: Eye, title: 'Mehr Sichtbarkeit', desc: 'Top-Rankings und Präsenz genau dort, wo Ihre Kunden suchen.', points: ['Seite-1-Rankings', 'Mehr organischer Traffic', 'Präsenz auf allen Kanälen'] },
  { icon: Users, title: 'Qualifizierte Leads', desc: 'Anfragen von Menschen mit echtem Kaufinteresse – nicht nur Klicks.', points: ['Kaufbereite Zielgruppe', 'Bessere Lead-Qualität', 'Höhere Abschlussquote'] },
  { icon: DollarSign, title: 'Höherer ROI', desc: 'Jeder investierte Euro wird gemessen und auf Rendite optimiert.', points: ['Budget-Effizienz', 'ROAS-Tracking', 'Skalierbare Kampagnen'] },
  { icon: BarChart3, title: 'Messbare Ergebnisse', desc: 'Transparente KPIs und Reports – kein Marketing im Blindflug.', points: ['Live-Dashboards', 'Klare KPIs', 'Regelmäßige Reports'] },
  { icon: Megaphone, title: 'Markenbekanntheit', desc: 'Konsistente Präsenz baut Vertrauen und Wiedererkennung auf.', points: ['Konsistente Botschaft', 'Mehr Reichweite', 'Stärkere Marke'] },
  { icon: MousePointer2, title: 'Bessere Conversion', desc: 'Mehr Abschlüsse aus dem Traffic, den Sie bereits haben.', points: ['A/B-getestete Funnels', 'UX-Optimierung', 'Höhere Conversion-Rate'] },
  { icon: TrendingUp, title: 'Wettbewerbsvorteil', desc: 'Datengetrieben schneller und gezielter als Ihr Wettbewerb.', points: ['Wettbewerbsanalyse', 'Schnellere Reaktion', 'Datenbasierte Strategie'] },
  { icon: LineChart, title: 'Nachhaltiges Wachstum', desc: 'Strategien, die langfristig wirken – nicht nur kurzfristige Spikes.', points: ['Langfristige Effekte', 'Stabile Rankings', 'Kontinuierliche Optimierung'] },
];

const PROJECTS = [
  { title: 'ShopGrow', tag: 'E-Commerce', stats: '+312% Traffic', desc: 'SEO- & Content-Strategie verdreifachte den organischen Umsatz in 9 Monaten.',
    img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&q=80&auto=format&fit=crop' },
  { title: 'LeadFlow B2B', tag: 'SaaS', stats: '-38% CPL', desc: 'Google- & LinkedIn-Ads senkten die Kosten pro Lead deutlich – bei doppeltem Volumen.',
    img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&q=80&auto=format&fit=crop' },
  { title: 'LocalDine', tag: 'Local', stats: '+220% Reservierungen', desc: 'Local SEO & Social Ads füllten die Tische eines Restaurant-Verbunds.',
    img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=80&auto=format&fit=crop' },
  { title: 'HealthPlus', tag: 'Health', stats: '#1 Rankings', desc: 'Top-Platzierungen für hochkompetitive Keywords im Gesundheitssektor.',
    img: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=900&q=80&auto=format&fit=crop' },
];

const REVIEWS = [
  { name: 'Markus Hoffmann', company: 'CEO, ShopGrow', rating: 5, img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&q=80&auto=format&fit=crop', text: 'Unser organischer Traffic hat sich verdreifacht. Endlich Marketing, das man in Zahlen sieht.' },
  { name: 'Sarah Becker', company: 'CMO, LeadFlow', rating: 5, img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80&auto=format&fit=crop', text: 'Die Kosten pro Lead halbiert, das Volumen verdoppelt. Hervorragende Arbeit und volle Transparenz.' },
  { name: 'Daniel Krause', company: 'Inhaber, LocalDine', rating: 5, img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80&auto=format&fit=crop', text: 'Seit dem Local-SEO-Projekt sind unsere Tische jeden Abend voll. Klare Empfehlung!' },
  { name: 'Dr. Julia Weber', company: 'Marketing, HealthPlus', rating: 5, img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80&auto=format&fit=crop', text: 'Top-Rankings in einem schwierigen Markt – professionell, ehrlich und ergebnisorientiert.' },
  { name: 'Tobias Lehmann', company: 'Founder, RouteFlow', rating: 5, img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&q=80&auto=format&fit=crop', text: 'Datengetriebenes Marketing vom Feinsten. Reporting ist klar, Ergebnisse sprechen für sich.' },
  { name: 'Anna Schulz', company: 'Head of Growth, BookStay', rating: 5, img: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&q=80&auto=format&fit=crop', text: 'Strategisch stark und immer am Puls. Unser ROAS ist auf ein neues Level gestiegen.' },
];

const FAQ = [
  { q: 'Wie schnell sehe ich Ergebnisse?', a: 'Bei Google Ads oft schon in den ersten Wochen. SEO ist ein nachhaltiger Kanal – erste Effekte nach 2–3 Monaten, signifikantes Wachstum meist nach 6–12 Monaten.' },
  { q: 'Was kostet professionelles Online-Marketing?', a: 'Unsere Pakete starten bei 890€/Monat. Der optimale Mix hängt von Zielen, Branche und Wettbewerb ab – wir empfehlen nach einer kostenlosen Analyse ein passendes Budget.' },
  { q: 'Übernehmt ihr auch das Werbebudget?', a: 'Das Media-Budget (z. B. für Google/Meta Ads) zahlen Sie direkt an die Plattformen. Wir verwalten es transparent und optimieren es auf maximale Rendite.' },
  { q: 'Wie messt ihr den Erfolg?', a: 'Mit klaren KPIs wie Traffic, Rankings, Leads, Conversions und ROAS – sauber getrackt in GA4 und in verständlichen, regelmäßigen Reports aufbereitet.' },
  { q: 'Arbeitet ihr mit langen Vertragslaufzeiten?', a: 'Nein. Wir setzen auf Ergebnisse statt lange Bindung. Monatlich kündbare Pakete sind möglich – Vertrauen entsteht durch Performance.' },
  { q: 'Macht ihr auch nur SEO oder nur Ads?', a: 'Ja. Sie können einzelne Kanäle buchen oder den vollen Marketing-Mix. Wir beraten ehrlich, was für Ihre Ziele am sinnvollsten ist.' },
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
  <span style={{ display: 'inline-block', padding: '6px 14px', borderRadius: '999px', background: 'rgba(255,107,0,0.1)', border: '1px solid rgba(255,107,0,0.25)', color: 'var(--accent-primary)', fontSize: '12px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '20px' }}>{text}</span>
);

// ------------ Component ------------
const MARKETINGSEOPAGE_JSONLD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Service',
      name: 'Digitales Marketing & SEO',
      serviceType: 'Digitales Marketing & SEO',
      provider: { '@type': 'ProfessionalService', name: 'Zebick', url: SITE_URL },
      areaServed: 'CH',
      url: `${SITE_URL}/services/digitales-marketing-seo`,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Startseite', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Services', item: `${SITE_URL}/services` },
        { '@type': 'ListItem', position: 3, name: 'Digitales Marketing & SEO', item: `${SITE_URL}/services/digitales-marketing-seo` },
      ],
    },
  ],
};

const MARKETINGSEOPAGE_RELATED = [{ label: "Webentwicklung", path: "/services/webentwicklung" }, { label: "Chatbot-Entwicklung", path: "/services/chatbot-entwicklung" }];

const MOCK_RANGES = {
  '7D': { kpis: [{ v: '312K', d: '+9%' }, { v: '18K', d: '+11%' }, { v: '540', d: '+14%' }], traffic: '+31%', bars: [62, 48, 30, 18, 12] },
  '30D': { kpis: [{ v: '1,2M', d: '+24%' }, { v: '84K', d: '+38%' }, { v: '2.4K', d: '+52%' }], traffic: '+147%', bars: [85, 60, 45, 30, 20] },
  '90D': { kpis: [{ v: '3,8M', d: '+61%' }, { v: '240K', d: '+73%' }, { v: '7.1K', d: '+98%' }], traffic: '+286%', bars: [95, 72, 58, 40, 26] },
};

const MarketingSEOPage = () => {
  const pageRef = useRef(null);
  const [activeProcess, setActiveProcess] = useState(0);
  const [testimonials, setTestimonials] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [mockRange, setMockRange] = useState('30D');

  useEffect(() => {
    fetch(`${API}/testimonials/approved`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setTestimonials(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const id = setInterval(() => setActiveProcess((p) => (p + 1) % PROCESS_STEPS.length), 3500);
    return () => clearInterval(id);
  }, []);

  useSectionReveal(pageRef);

  const testimonialItems = (testimonials.length >= 3 ? testimonials : REVIEWS).map((t) => ({
    name: t.name,
    role: t.role || (t.position && t.company ? `${t.position}, ${t.company}` : t.position || t.company || ''),
    rating: t.rating,
    content: t.content || t.text,
    avatar: t.avatar || t.img,
  }));

  return (
    <div className="page-transition" data-testid="marketing-seo-page" ref={pageRef}>
      <Header />
      <TestimonialForm isOpen={showReviewForm} onClose={() => setShowReviewForm(false)} />
      <Seo
        title="Digitales Marketing & SEO"
        description="Technisches SEO, Content-Strategie und Conversion-Optimierung, um Ihre Sichtbarkeit und Ergebnisse messbar zu steigern."
        path="/services/digitales-marketing-seo"
        jsonLd={MARKETINGSEOPAGE_JSONLD}
      />

      <div className="sr-only"><h1>Digitales Marketing & SEO</h1></div>

      <ServiceAdvisorBlock serviceId="marketing" />


      {/* WARUM MARKETING & SEO */}
      <section className="section" data-testid="section-why-marketing" style={{ padding: '120px 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '15%', right: '5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(255,107,0,0.07) 0%, transparent 60%)', filter: 'blur(100px)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative' }}>
          <div className="why-marketing-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: '64px', alignItems: 'center' }}>

            <div data-reveal style={{ opacity: 0, transform: 'translateY(30px)', transition: 'all 0.8s ease' }}>
              {sectionLabel('Warum Marketing & SEO?')}
              <h2 className="heading-1" style={{ fontSize: '48px', fontWeight: 900, lineHeight: 1.1, marginBottom: '24px' }}>
                Sichtbar sein, wo Ihre<br /><span className="text-gradient">Kunden bereits suchen.</span>
              </h2>
              <p style={{ fontSize: '17px', color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '40px' }}>
                Jeden Tag suchen Millionen Menschen aktiv nach Ihrer Lösung. Wer auf Seite 1 nicht steht,
                existiert für sie nicht. Marketing & SEO sorgen dafür, dass Sie zum richtigen Zeitpunkt am richtigen Ort sind.
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

            {/* ANALYTICS DASHBOARD MOCKUP */}
            <div data-reveal style={{ opacity: 0, transform: 'translateY(30px)', transition: 'all 0.8s 0.15s ease', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div className="mkt-mockup-scale" style={{ position: 'relative', width: '100%', maxWidth: '520px' }}>
                <div style={{ position: 'absolute', inset: '-30px', background: 'radial-gradient(circle, rgba(255,107,0,0.22) 0%, transparent 60%)', filter: 'blur(40px)' }} />
                <div style={{ position: 'relative', background: 'linear-gradient(145deg, #141414 0%, #0a0a0a 100%)', borderRadius: '16px', border: '1px solid #2a2a2a', boxShadow: '0 30px 80px rgba(0,0,0,0.6)', overflow: 'hidden' }}>
                  {/* topbar */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: '#181818', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <BarChart3 size={18} color="#FF6B00" />
                      <span style={{ fontSize: '13px', color: '#fff', fontWeight: 700 }}>Marketing Dashboard</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="mkt-live-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#28C840', boxShadow: '0 0 8px #28C840' }} />
                      <div style={{ display: 'flex', gap: '3px' }}>
                        {Object.keys(MOCK_RANGES).map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setMockRange(r)}
                            aria-pressed={mockRange === r}
                            aria-label={`Demo: Zeitraum ${r} anzeigen`}
                            style={{
                              padding: '3px 8px', borderRadius: '5px', fontFamily: 'inherit',
                              fontSize: '9px', fontWeight: 700, letterSpacing: '0.05em', cursor: 'pointer',
                              background: mockRange === r ? '#FF6B00' : 'transparent',
                              color: mockRange === r ? '#000' : '#888',
                              border: mockRange === r ? '1px solid #FF6B00' : '1px solid rgba(255,255,255,0.1)',
                              transition: 'all 0.2s ease',
                            }}
                          >{r}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* KPI tiles */}
                  <div key={mockRange} style={{ padding: '18px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {[
                      { icon: Eye, l: 'IMPRESSIONS' },
                      { icon: MousePointer2, l: 'CLICKS' },
                      { icon: DollarSign, l: 'CONVERSIONS' },
                    ].map((k, i) => (
                      <div key={i} className="mkt-kpi" style={{ padding: '12px', background: 'rgba(255,107,0,0.04)', border: '1px solid rgba(255,107,0,0.12)', borderRadius: '10px', animationDelay: `${i * 0.12}s` }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <k.icon size={14} color="#FF6B00" />
                          <span style={{ fontSize: '9px', color: '#28C840', fontWeight: 700, padding: '2px 6px', background: 'rgba(40,200,64,0.12)', borderRadius: '4px' }}>{MOCK_RANGES[mockRange].kpis[i].d}</span>
                        </div>
                        <div style={{ fontSize: '20px', fontWeight: 800, color: '#fff', lineHeight: 1, fontFamily: 'JetBrains Mono, monospace' }}>{MOCK_RANGES[mockRange].kpis[i].v}</div>
                        <div style={{ fontSize: '8px', color: '#888', marginTop: '4px', letterSpacing: '0.1em', fontWeight: 600 }}>{k.l}</div>
                      </div>
                    ))}
                  </div>
                  {/* chart */}
                  <div style={{ padding: '18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ fontSize: '11px', color: '#888', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Organic Traffic</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#28C840', fontWeight: 800 }}>
                        <TrendingUp size={14} /> {MOCK_RANGES[mockRange].traffic}
                      </div>
                    </div>
                    <svg viewBox="0 0 400 140" style={{ width: '100%', height: '140px', display: 'block' }}>
                      <defs>
                        <linearGradient id="seoArea" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#FF6B00" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      {/* grid */}
                      {[30, 60, 90, 120].map((y) => (<line key={y} x1="0" y1={y} x2="400" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />))}
                      {/* area */}
                      <path className="mkt-chart-area" d="M0 110 L40 100 L80 95 L120 85 L160 80 L200 60 L240 50 L280 35 L320 30 L360 18 L400 10 L400 140 L0 140 Z" fill="url(#seoArea)" />
                      {/* line */}
                      <path className="mkt-chart-line" d="M0 110 L40 100 L80 95 L120 85 L160 80 L200 60 L240 50 L280 35 L320 30 L360 18 L400 10" stroke="#FF6B00" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" pathLength="1000" />
                      {/* dots */}
                      {[[0, 110], [80, 95], [200, 60], [320, 30], [400, 10]].map(([x, y], k) => (
                        <circle key={k} className="mkt-chart-dot" style={{ animationDelay: `${0.9 + k * 0.15}s` }} cx={x} cy={y} r="3.5" fill="#FF6B00" stroke="#0a0a0a" strokeWidth="2" />
                      ))}
                    </svg>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#666', marginTop: '8px', fontFamily: 'JetBrains Mono, monospace' }}>
                      <span>JAN</span><span>FEB</span><span>MÄR</span><span>APR</span><span>MAI</span><span>JUN</span>
                    </div>
                  </div>
                  {/* keyword rankings */}
                  <div style={{ padding: '0 18px 18px' }}>
                    <div style={{ fontSize: '10px', color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>Top Keywords</div>
                    {[{ kw: 'app entwicklung berlin', pos: 1, change: '+4' }, { kw: 'webseite erstellen lassen', pos: 2, change: '+2' }, { kw: 'seo agentur', pos: 4, change: '+7' }].map((r, k) => (
                      <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', marginBottom: '4px' }}>
                        <Search size={12} color="#666" />
                        <span style={{ flex: 1, fontSize: '11px', color: '#fff', fontFamily: 'JetBrains Mono, monospace' }}>{r.kw}</span>
                        <span style={{ fontSize: '10px', color: '#FF6B00', fontWeight: 800 }}>#{r.pos}</span>
                        <span style={{ fontSize: '9px', color: '#28C840', fontWeight: 700, minWidth: '24px', textAlign: 'right' }}>{r.change}</span>
                      </div>
                    ))}
                  </div>
                  {/* channel breakdown */}
                  <div style={{ padding: '0 18px 20px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
                    <div style={{ fontSize: '10px', color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '12px' }}>Kanal-Verteilung</div>
                    <div key={mockRange} style={{ display: 'flex', alignItems: 'flex-end', gap: '14px', height: '70px' }}>
                      {[
                        { l: 'SEO', c: '#FF6B00' },
                        { l: 'Ads', c: '#FFA500' },
                        { l: 'Social', c: '#8B5CF6' },
                        { l: 'E-Mail', c: '#28C840' },
                        { l: 'Referral', c: '#666' },
                      ].map((b, k) => (
                        <div key={k} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
                          <div className="mkt-bar" style={{ width: '100%', maxWidth: '22px', background: b.c, borderRadius: '3px 3px 0 0', '--bar-h': `${MOCK_RANGES[mockRange].bars[k]}%`, animationDelay: `${0.3 + k * 0.1}s` }} />
                          <span style={{ fontSize: '8px', color: '#888', fontFamily: 'JetBrains Mono, monospace' }}>{b.l}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
        <style>{`
          @media (max-width: 900px) {
            .why-marketing-grid { grid-template-columns: 1fr !important; gap: 0 !important; }
            .why-marketing-grid > div:first-child { display: contents; }
            .why-marketing-grid > div:last-child { margin-top: 48px; }
            .svc-icon-row { order: 1; margin-top: 32px; }
            .mkt-mockup-scale { width: 480px !important; max-width: 480px !important; zoom: 0.7; }
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
          @keyframes mktDotPulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.8); } }
          .mkt-live-dot { animation: mktDotPulse 1.6s ease-in-out infinite; }
          @keyframes mktKpiIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          .mkt-kpi { animation: mktKpiIn 0.5s ease both; }
          .mkt-chart-line { stroke-dasharray: 1000; stroke-dashoffset: 1000; animation: mktDraw 1.6s 0.2s cubic-bezier(0.4,0,0.2,1) forwards; }
          .mkt-chart-area { opacity: 0; animation: mktFadeIn 0.8s 1.4s ease forwards; }
          @keyframes mktDraw { to { stroke-dashoffset: 0; } }
          @keyframes mktFadeIn { to { opacity: 1; } }
          .mkt-chart-dot { opacity: 0; transform-origin: center; animation: mktDotIn 0.4s ease both; }
          @keyframes mktDotIn { from { opacity: 0; transform: scale(0); } to { opacity: 1; transform: scale(1); } }
          .mkt-bar { height: 0; animation: mktBarGrow 0.9s cubic-bezier(0.34,1.56,0.64,1) both; }
          @keyframes mktBarGrow { to { height: var(--bar-h); } }
          @media (prefers-reduced-motion: reduce) {
            .mkt-live-dot, .mkt-kpi, .mkt-chart-line, .mkt-chart-area, .mkt-chart-dot, .mkt-bar { animation: none !important; opacity: 1 !important; stroke-dashoffset: 0 !important; height: var(--bar-h, auto) !important; }
          }
        `}</style>
      </section>

      {/* ========== STACK-SHOWCASE ========== */}
      <MarketingStackShowcase />

      {/* ========== LEISTUNGSSPEKTRUM ========== */}
      <section className="section" data-testid="section-leistungsspektrum" style={{ padding: '120px 0', background: 'var(--bg-secondary)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '20%', right: '-150px', width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(255,107,0,0.06) 0%, transparent 60%)', filter: 'blur(100px)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '60px', alignItems: 'center', marginBottom: '72px' }}>
            <div data-reveal style={{ opacity: 0, transform: 'translateY(30px)', transition: 'all 0.8s ease' }}>
              {sectionLabel('Leistungsspektrum')}
              <h2 className="heading-1" style={{ fontSize: '44px', fontWeight: 900, marginBottom: '20px', lineHeight: 1.1 }}>
                Marketing, <span className="text-gradient">komplett gedacht</span>
              </h2>
              <p style={{ fontSize: '17px', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                Elf Disziplinen, ein Ziel: SEO, Ads, Content, Social, E-Mail und CRO greifen bei uns ineinander –
                statt isolierter Einzelmaßnahmen bekommen Sie eine abgestimmte Wachstumsstrategie.
              </p>
            </div>
            <div data-reveal style={{ opacity: 0, transform: 'translateY(30px)', transition: 'all 0.8s 0.15s ease', ...baseCard, padding: '32px', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', lineHeight: 1.8 }}>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FF5F57' }} />
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FFBD2E' }} />
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#28CA42' }} />
                <span style={{ marginLeft: '12px', color: 'var(--text-muted)', fontSize: '12px' }}>growth_engine.py</span>
              </div>
              <TypingCode lines={GROWTH_ENGINE_CODE} />
            </div>
          </div>

          <ServiceTabsGrid tabs={SERVICE_TABS} services={SERVICES} />
        </div>
      </section>

      {/* TECHNOLOGIEN */}
      <section className="section" data-testid="section-technologies" style={{ background: 'var(--bg-secondary)', padding: '120px 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '20%', right: '-100px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(255,107,0,0.08) 0%, transparent 60%)', filter: 'blur(100px)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative' }}>
          <div data-reveal style={{ textAlign: 'center', marginBottom: '72px', opacity: 0, transform: 'translateY(30px)', transition: 'all 0.8s ease' }}>
            {sectionLabel('Tools & Plattformen')}
            <h2 className="heading-1" style={{ fontSize: '48px', fontWeight: 900, marginBottom: '20px' }}>Unser Marketing-Stack</h2>
            <p style={{ fontSize: '17px', color: 'var(--text-muted)', maxWidth: '640px', margin: '0 auto' }}>Wir arbeiten mit den führenden Tools der Branche – für präzises Tracking und maximale Performance.</p>
          </div>
          <ToolDock tools={TECHNOLOGIES} />
        </div>
      </section>

      {/* ========== KANÄLE ========== */}
      <section className="section" data-testid="section-channels" style={{ padding: '120px 0', background: 'var(--bg-primary)' }}>
        <div className="container">
          <div data-reveal style={{ opacity: 0, transform: 'translateY(30px)', transition: 'all 0.8s ease', textAlign: 'center', marginBottom: '64px' }}>
            {sectionLabel('Kanäle')}
            <h2 className="heading-1" style={{ fontSize: '44px', fontWeight: 900, marginBottom: '16px' }}>Wo <span className="text-gradient">Ihre Kunden suchen.</span></h2>
            <p style={{ fontSize: '17px', color: 'var(--text-muted)', maxWidth: '640px', margin: '0 auto', lineHeight: 1.7 }}>
              Der richtige Kanal-Mix macht den Unterschied zwischen Budget, das wirkt – und Budget, das verpufft.
            </p>
          </div>

          <div className="compare-grid" data-keep-grid style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '56px' }}>
            {MARKETING_CHANNELS.map((c, i) => (
              <div key={c.name} data-reveal style={{ ...baseCard, padding: '28px', opacity: 0, transform: 'translateY(30px)', transition: `all 0.8s ${i * 0.08}s ease` }}
                   onMouseEnter={(e) => { e.currentTarget.style.borderColor = c.color; e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = `0 20px 40px ${c.color}25`; }}
                   onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                  <img src={c.logo} alt={c.name} width="44" height="44" style={{ objectFit: 'contain' }} />
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700 }}>{c.name}</h3>
                    <span style={{ fontSize: '12px', color: c.color }}>{c.tool}</span>
                  </div>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.7 }}>{c.desc}</p>
              </div>
            ))}
          </div>

          {/* Comparison Table */}
          <div data-reveal style={{ ...baseCard, padding: '0', overflow: 'hidden', opacity: 0, transform: 'translateY(30px)', transition: 'all 0.8s 0.2s ease' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '720px' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,107,0,0.06)' }}>
                    {['Kanal', 'Tool', 'Reichweite', 'ROI-Zeitraum'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '20px 24px', fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent-primary)', fontWeight: 600, borderBottom: '1px solid var(--border-subtle)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MARKETING_CHANNELS.map((c, i) => (
                    <tr key={c.name} style={{ borderBottom: i < MARKETING_CHANNELS.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                      <td style={{ padding: '20px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img src={c.logo} alt={c.name} width="28" height="28" style={{ objectFit: 'contain' }} />
                          <span style={{ fontWeight: 600 }}>{c.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '20px 24px', color: 'var(--text-secondary)' }}>{c.tool}</td>
                      <td style={{ padding: '20px 24px', color: 'var(--text-muted)', fontSize: '14px' }}>{c.reach}</td>
                      <td style={{ padding: '20px 24px', color: 'var(--text-secondary)' }}>{c.roi}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* VORGEHEN */}
      <ModernTimeline
        eyebrow="Unser Vorgehen"
        title="So erzielen wir Ergebnisse"
        subtitle="Ein datengetriebener Prozess – von der ersten Analyse bis zur skalierten Kampagne."
        background="var(--bg-primary)"
        steps={PROCESS_STEPS}
      />

      {/* BRANCHEN */}
      <ServiceIndustries
        slug="marketing-seo"
        defaultItems={INDUSTRIES.map((c) => ({
          icon: c.icon?.displayName || c.icon?.name || 'Building2',
          title: c.title, tag: c.tag, desc: c.desc, img: c.img,
        }))}
        defaultHeading="Marketing für jede Branche"
        defaultSubtitle="Jede Branche tickt anders – wir kennen die Kanäle, die in Ihrem Markt funktionieren."
        eyebrowLabel="Branchen"
      />

      {/* VORTEILE */}
      <ModernBenefits
        eyebrow="Vorteile"
        title="Was professionelles Marketing bringt"
        accentWord="professionelles Marketing"
        subtitle="Marketing ist eine Investition – mit messbarer Rendite."
        items={BENEFITS}
        image="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&q=80&auto=format&fit=crop"
        testid="section-benefits"
      />

      {/* PROJEKTE — aus Portfolio (Admin) */}
      <ServicePortfolioSection
        serviceId="marketing"
        fallbackExamples={PROJECTS}
        eyebrow="Referenzen & Projekte"
        title="Ergebnisse, die"
        accentWord="zählen"
        subtitle="Eine Auswahl an Projekten mit messbarem Impact."
        testid="section-projects"
        showCategoryFilter
      />

      {/* BEWERTUNGEN */}
      <section className="section" data-testid="section-reviews" style={{ padding: '120px 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: '-100px', right: '-100px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(255,107,0,0.06) 0%, transparent 60%)', filter: 'blur(100px)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative' }}>
          <div data-reveal style={{ textAlign: 'center', marginBottom: '72px', opacity: 0, transform: 'translateY(30px)', transition: 'all 0.8s ease' }}>
            {sectionLabel('Kundenbewertungen')}
            <h2 className="heading-1" style={{ fontSize: '48px', fontWeight: 900, marginBottom: '20px' }}>Was unsere Kunden sagen</h2>
            <p style={{ fontSize: '17px', color: 'var(--text-muted)', maxWidth: '640px', margin: '0 auto' }}>4.9 von 5 Sternen über alle Projekte hinweg.</p>
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


      {/* FAQ */}
      <ServiceFAQ
        eyebrow="FAQ"
        title="Häufige Fragen"
        items={FAQ.map((item) => ({ question: item.q, answer: item.a }))}
        testid="section-faq"
      />

      {/* KONTAKT */}
      <ServiceContactForm
        defaultService="marketing"
        title="Bereit für mehr Wachstum?"
        subtitle="Fordern Sie Ihre kostenlose Marketing-Analyse an – wir melden uns innerhalb von 24 Stunden."
      />      <RelatedServices items={MARKETINGSEOPAGE_RELATED} />      <Footer />
      <Chatbot />
    </div>
  );
};

// ------------ Subcomponents ------------

const GROWTH_ENGINE_CODE = [
  { indent: 0, segments: [{ t: '@campaign.', c: '#FF6B00' }, { t: 'on_lead', c: '#61DAFB' }, { t: '()' }] },
  { indent: 0, segments: [{ t: 'async def', c: '#C678DD' }, { t: ' ' }, { t: 'handle', c: '#61DAFB' }, { t: '(lead: ' }, { t: 'Lead', c: '#E5C07B' }, { t: '):' }] },
  { indent: 20, segments: [{ t: 'score = ' }, { t: 'await', c: '#C678DD' }, { t: ' qualify(lead)' }] },
  { indent: 20, segments: [{ t: 'await', c: '#C678DD' }, { t: ' crm.sync(lead, score)' }] },
  { indent: 20, segments: [{ t: 'return', c: '#C678DD' }, { t: ' campaign.nurture(lead)' }] },
];

const MARKETING_BELT = TECHNOLOGIES.filter((t) =>
  ['Google Analytics', 'Google Ads', 'Semrush', 'HubSpot', 'Meta Ads', 'Mailchimp'].includes(t.name)
);

// ---- Marketing-specific stack-showcase visuals (unique per service — only
// the "Unser Marketing-Stack" TechBelt card stays shared) ----

const DataBars = () => (
  <div className="mkt-bars">
    {[40, 70, 55, 90, 65].map((h, i) => (
      <span key={i} className="mkt-bar" style={{ '--h': `${h}%`, animationDelay: `${i * 0.15}s` }} />
    ))}
  </div>
);

const ConversionFunnel = () => (
  <div className="mkt-funnel">
    {[{ w: 100, l: '10.000' }, { w: 70, l: '4.200' }, { w: 45, l: '1.800' }, { w: 22, l: '620' }].map((s, i) => (
      <div key={i} className="mkt-funnel-row" style={{ animationDelay: `${i * 0.4}s` }}>
        <span className="mkt-funnel-bar" style={{ width: `${s.w}%` }} />
        <span className="mkt-funnel-label">{s.l}</span>
      </div>
    ))}
  </div>
);

const MKT_CHANNELS = [
  { n: 'Google Ads', logo: 'https://cdn.simpleicons.org/googleads/4285F4', c: '#4285F4' },
  { n: 'Meta Ads', logo: 'https://cdn.simpleicons.org/meta/0467DF', c: '#0467DF' },
  { n: 'Mailchimp', logo: 'https://cdn.simpleicons.org/mailchimp/FFE01B', c: '#FFE01B' },
  { n: 'Google SEO', logo: 'https://cdn.simpleicons.org/google/4285F4', c: '#4285F4' },
];

const ChannelRotator = () => (
  <div className="mkt-rotator">
    {MKT_CHANNELS.map((ch, i) => (
      <span key={ch.n} className="mkt-rotator-item" style={{ animationDelay: `${i * 1.1}s` }}>
        <img src={ch.logo} alt={ch.n} className="mkt-rotator-logo" />
        <span style={{ color: ch.c }}>{ch.n}</span>
      </span>
    ))}
  </div>
);

const ConversionCounter = () => (
  <div className="mkt-counter">
    <div className="mkt-counter-value">2.847</div>
    <div className="mkt-counter-trend">▲ 12,4%</div>
  </div>
);

const GrowthChart = () => (
  <div className="mkt-growth">
    <svg viewBox="0 0 120 50" className="mkt-growth-svg" aria-hidden>
      <path d="M0 42 L24 30 L48 34 L72 16 L96 20 L120 4" className="mkt-growth-path" />
    </svg>
    <span className="mkt-growth-dot" />
  </div>
);

const MarketingStackShowcase = () => (
  <StackShowcaseSection
    eyebrow="Unsere Methode"
    title={<>Gebaut für <span style={{ color: 'var(--accent-primary)' }}>messbares</span> Wachstum</>}
    subtitle="Von der Keyword-Recherche bis zum ROI-Report – jede Kampagne datengetrieben."
    testid="section-stack-showcase"
  >
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr 1fr', gap: '20px', marginBottom: '20px' }} className="asf-row">
      <StackCard title="Daten von Tag eins"><DataBars /></StackCard>
      <StackCard title="Unser Kampagnen-Workflow"><ConversionFunnel /></StackCard>
      <StackCard title="Omnichannel-Reichweite"><ChannelRotator /></StackCard>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }} className="asf-row">
      <StackCard title="Tracking, das sitzt"><ConversionCounter /></StackCard>
      <StackCard title="Unser Marketing-Stack"><TechBelt tools={MARKETING_BELT} /></StackCard>
      <StackCard title="+150% Traffic-Wachstum"><GrowthChart /></StackCard>
    </div>
    <style>{`
      .mkt-bars { display: flex; align-items: flex-end; gap: 10px; justify-content: center; width: 100%; height: 80px; }
      .mkt-bar { width: 14px; height: var(--h); border-radius: 4px 4px 0 0; background: linear-gradient(180deg, var(--accent-primary), #ffb380); transform: scaleY(0); transform-origin: bottom; animation: mktBarGrow 2.2s ease-in-out infinite; }
      @keyframes mktBarGrow { 0% { transform: scaleY(0); } 45%, 80% { transform: scaleY(1); } 100% { transform: scaleY(0); } }

      .mkt-funnel { display: flex; flex-direction: column; gap: 8px; width: 100%; }
      .mkt-funnel-row { display: flex; align-items: center; gap: 8px; opacity: 0; animation: mktFunnelIn 2.6s ease-in-out infinite; }
      @keyframes mktFunnelIn { 0% { opacity: 0; } 12%, 85% { opacity: 1; } 100% { opacity: 0; } }
      .mkt-funnel-bar { display: block; height: 10px; border-radius: 3px; background: linear-gradient(90deg, var(--accent-primary), #ffb380); }
      .mkt-funnel-label { font-size: 9px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; white-space: nowrap; }

      .mkt-rotator { position: relative; display: flex; align-items: center; justify-content: center; width: 100%; height: 50px; }
      .mkt-rotator-item { position: absolute; display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 800; opacity: 0; animation: mktRotatorFade 4.4s ease-in-out infinite; }
      .mkt-rotator-logo { width: 22px; height: 22px; object-fit: contain; border-radius: 5px; background: rgba(255,255,255,0.06); padding: 3px; }
      @keyframes mktRotatorFade { 0%, 100% { opacity: 0; transform: translateY(4px); } 4%, 20% { opacity: 1; transform: translateY(0); } 25% { opacity: 0; } }

      .mkt-counter { display: flex; flex-direction: column; align-items: center; gap: 6px; width: 100%; }
      .mkt-counter-value { font-family: 'JetBrains Mono', monospace; font-size: 26px; font-weight: 800; color: var(--text-primary); animation: mktCounterTick 1.8s ease-in-out infinite; }
      @keyframes mktCounterTick { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); color: var(--accent-primary); } }
      .mkt-counter-trend { font-size: 11px; font-weight: 700; color: #4ade80; }

      .mkt-growth { position: relative; width: 100%; height: 50px; }
      .mkt-growth-svg { width: 100%; height: 100%; }
      .mkt-growth-path { fill: none; stroke: var(--accent-primary); stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 160; stroke-dashoffset: 160; animation: mktGrowthDraw 2.6s ease-in-out infinite; }
      @keyframes mktGrowthDraw { 0% { stroke-dashoffset: 160; } 70%, 100% { stroke-dashoffset: 0; } }
      .mkt-growth-dot { position: absolute; width: 7px; height: 7px; border-radius: 50%; background: #fff; box-shadow: 0 0 8px var(--accent-primary); offset-path: path('M0 42 L24 30 L48 34 L72 16 L96 20 L120 4'); offset-rotate: 0deg; animation: mktGrowthMove 2.6s ease-in-out infinite; }
      @keyframes mktGrowthMove { 0% { offset-distance: 0%; opacity: 0; } 5% { opacity: 1; } 70%, 100% { offset-distance: 100%; } }

      @media (prefers-reduced-motion: reduce) {
        .mkt-bar, .mkt-funnel-row, .mkt-rotator-item, .mkt-counter-value, .mkt-growth-path, .mkt-growth-dot { animation: none !important; }
      }
    `}</style>
  </StackShowcaseSection>
);

export default MarketingSEOPage;
