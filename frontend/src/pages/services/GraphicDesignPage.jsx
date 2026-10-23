import React, { useState, useEffect, useRef } from 'react';
import {
  Brush,
  PenTool,
  Palette,
  Layers,
  Image,
  Type,
  Sparkles,
  Film,
  Package,
  Share2,
  BookOpen,
  Frame,
  Eye,
  Award,
  Star,
  Lightbulb,
  Search,
  Wand2,
  MessageCircle,
  Rocket,
  Heart,
  Repeat2,
  ShoppingBag,
  Building2,
  Plus
} from 'lucide-react';
import Header from '../../components/layout/Header';
import TypingCode from '../../components/services/TypingCode';
import ServiceTabsGrid from '../../components/services/ServiceTabsGrid';
import { StackShowcaseSection, StackCard, TechBelt } from '../../components/services/StackShowcase';
import ToolDock from '../../components/services/ToolDock';
import Seo, { SITE_URL } from '../../components/common/Seo';
import RelatedServices from '../../components/services/RelatedServices';
import Footer from '../../components/layout/Footer';
import Chatbot from '../../components/chatbot/Chatbot';
import { ModernBenefits } from '../../components/services/ModernBenefits';
import ModernTimeline from '../../components/services/ModernTimeline';
import ServiceContactForm from '../../components/services/ServiceContactForm';
import ServiceIndustries from '../../components/services/ServiceIndustries';
import ServiceAdvisorBlock from '../../components/tools/ServiceAdvisorBlock';
import ServicePortfolioSection from '../../components/services/ServicePortfolioSection';
import ServiceFAQ from '../../components/services/ServiceFAQ';
import { useSectionReveal } from '../../components/services/useSectionReveal';
import TestimonialsMarquee from '../../components/common/TestimonialsMarquee';
import TestimonialForm from '../../components/common/TestimonialForm';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// ------------ Data ------------
const WHY_ICONS = [
  { logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/adobephotoshop.svg', label: 'Photoshop', color: '#31A8FF' },
  { logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/adobeillustrator.svg', label: 'Illustrator', color: '#FF9A00' },
  { logo: 'https://cdn.simpleicons.org/figma/F24E1E', label: 'Figma', color: '#F24E1E' },
  { logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/canva.svg', label: 'Canva', color: '#00C4CC' },
  { logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/adobeaftereffects.svg', label: 'After Effects', color: '#9999FF' },
  { logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/adobepremierepro.svg', label: 'Premiere Pro', color: '#EA77FF' },
];

const SERVICES = [
  { tabId: 'brand', icon: PenTool, logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/adobeillustrator.svg', brandColor: '#FF9A00', title: 'Logo & Brand Identity', image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=700&q=80&auto=format&fit=crop', desc: 'Unverwechselbare Logos, Farbwelten und Markenrichtlinien aus einem Guss.', features: ['3 Logo-Konzepte', 'Farb- & Typo-System', 'Brand Guidelines', 'Alle Dateiformate'] },
  { tabId: 'brand', icon: Palette, title: 'Corporate Design', image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=700&q=80&auto=format&fit=crop', desc: 'Konsistente Markenauftritte über alle Kanäle – vom Briefpapier bis zur App.', features: ['Geschäftsausstattung', 'Vorlagen & Templates', 'Design-System', 'Kanalübergreifend'] },
  { tabId: 'brand', icon: Package, title: 'Verpackungsdesign', image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=700&q=80&auto=format&fit=crop', desc: 'Packaging, das im Regal heraussticht und Ihre Marke erlebbar macht.' },
  { tabId: 'content', icon: BookOpen, logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/adobeindesign.svg', brandColor: '#FF3366', title: 'Print-Design', image: 'https://images.unsplash.com/photo-1559028012-481c04fa702d?w=700&q=80&auto=format&fit=crop', desc: 'Broschüren, Flyer, Plakate und Magazine – druckfertig und detailverliebt.' },
  { tabId: 'content', icon: Frame, title: 'Präsentationsdesign', image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=700&q=80&auto=format&fit=crop', desc: 'Pitch-Decks und Reports, die Inhalte klar und überzeugend transportieren.' },
  { tabId: 'content', icon: Share2, logo: 'https://cdn.simpleicons.org/figma/F24E1E', brandColor: '#F24E1E', title: 'Social-Media-Design', image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=700&q=80&auto=format&fit=crop', desc: 'Scroll-stoppende Posts, Stories und Templates für konsistente Feeds.' },
  { tabId: 'visual', icon: Brush, title: 'Illustration', image: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=700&q=80&auto=format&fit=crop', desc: 'Maßgeschneiderte Illustrationen und Icons mit eigenständigem Stil.' },
  { tabId: 'visual', icon: Film, logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/adobeaftereffects.svg', brandColor: '#9999FF', title: 'Motion Graphics', image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=700&q=80&auto=format&fit=crop', desc: 'Animierte Logos, Erklärvideos und Social-Clips, die in Bewegung begeistern.' },
  { tabId: 'visual', icon: Image, title: 'Digital & UI-Assets', image: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?w=700&q=80&auto=format&fit=crop', desc: 'Web-Grafiken, Banner und visuelle Elemente für ein stimmiges Produkt.' },
];

const SERVICE_TABS = [
  { id: 'brand', label: 'Marke & Identität' },
  { id: 'content', label: 'Content & Kommunikation' },
  { id: 'visual', label: 'Visuelle Produktion' },
];

const DESIGN_PIPELINE_CODE = [
  { indent: 0, segments: [{ t: '@design.', c: '#FF6B00' }, { t: 'on_export', c: '#61DAFB' }, { t: '()' }] },
  { indent: 0, segments: [{ t: 'async def', c: '#C678DD' }, { t: ' ' }, { t: 'render', c: '#61DAFB' }, { t: '(asset: ' }, { t: 'Asset', c: '#E5C07B' }, { t: '):' }] },
  { indent: 20, segments: [{ t: 'layers = ' }, { t: 'await', c: '#C678DD' }, { t: ' canvas.flatten(asset)' }] },
  { indent: 20, segments: [{ t: 'await', c: '#C678DD' }, { t: ' cdn.upload(layers)' }] },
  { indent: 20, segments: [{ t: 'return', c: '#C678DD' }, { t: ' brand.publish(layers)' }] },
];

const TECHNOLOGIES = [
  { name: 'Photoshop', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/adobephotoshop.svg', color: '#31A8FF', desc: 'Bildbearbeitung und Composing auf professionellem Niveau.' },
  { name: 'Illustrator', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/adobeillustrator.svg', color: '#FF9A00', desc: 'Vektorgrafik für Logos, Icons und Illustrationen.' },
  { name: 'InDesign', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/adobeindesign.svg', color: '#FF3366', desc: 'Layout & Satz für hochwertige Print-Produkte.' },
  { name: 'Figma', logo: 'https://cdn.simpleicons.org/figma/F24E1E', color: '#F24E1E', desc: 'Kollaboratives Design für digitale Produkte und UI.' },
  { name: 'After Effects', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/adobeaftereffects.svg', color: '#9999FF', desc: 'Motion Graphics, Animationen und visuelle Effekte.' },
  { name: 'Premiere Pro', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/adobepremierepro.svg', color: '#EA77FF', desc: 'Videoschnitt und Bewegtbild-Postproduktion.' },
  { name: 'Lightroom', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/adobelightroom.svg', color: '#31A8FF', desc: 'Foto-Retusche und farbliche Bildoptimierung.' },
  { name: 'Blender', logo: 'https://cdn.simpleicons.org/blender/F5792A', color: '#F5792A', desc: '3D-Modellierung, Rendering und Produktvisualisierung.' },
  { name: 'Procreate', color: '#FF6B00', desc: 'Digitale Illustration und Konzept-Sketches.' },
  { name: 'Canva', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/canva.svg', color: '#00C4CC', desc: 'Schnelle Vorlagen und Templates für Ihr Team.' },
];

const DESIGN_FORMATS = [
  { name: 'Print-Design', tool: 'InDesign', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/adobeindesign.svg', color: '#FF3366',
    einsatz: 'Broschüren, Visitenkarten', format: 'PDF (CMYK)',
    desc: 'Druckfertige Layouts im richtigen Farbraum – mit Beschnitt und nach Druckerei-Vorgaben.' },
  { name: 'Digital & UI', tool: 'Figma', logo: 'https://cdn.simpleicons.org/figma/F24E1E', color: '#F24E1E',
    einsatz: 'Websites, Apps', format: 'SVG, PNG',
    desc: 'Interaktive, skalierbare Designs für jeden Bildschirm – kollaborativ und versioniert.' },
  { name: 'Social Media', tool: 'Canva', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/canva.svg', color: '#00C4CC',
    einsatz: 'Posts, Stories, Ads', format: 'JPG, PNG',
    desc: 'Schnelle, plattformgerechte Formate für konsistenten Markenauftritt auf allen Kanälen.' },
  { name: 'Motion & Video', tool: 'After Effects', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/adobeaftereffects.svg', color: '#9999FF',
    einsatz: 'Werbespots, Intros', format: 'MP4, MOV',
    desc: 'Bewegtbild und Animation, die Ihre Marke lebendig und einprägsam macht.' },
];

const PROCESS_STEPS = [
  { icon: MessageCircle, title: 'Briefing', duration: '1 Tag',
    desc: 'Wir verstehen Ihre Marke, Ziele und Zielgruppe – die Basis jedes guten Designs.',
    deliverables: ['Brand-Briefing', 'Ziel-Definition', 'Zielgruppenprofil'],
    image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&q=80&auto=format&fit=crop' },
  { icon: Search, title: 'Recherche & Moodboard', duration: '3–5 Tage',
    desc: 'Wettbewerb, Trends und Stilrichtungen werden zu einem visuellen Moodboard.',
    deliverables: ['Marktanalyse', 'Moodboard', 'Designrichtungen'],
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&q=80&auto=format&fit=crop' },
  { icon: Lightbulb, title: 'Konzept', duration: '5–7 Tage',
    desc: 'Erste Entwürfe und Designrichtungen – wir zeigen Ihnen verschiedene Wege.',
    deliverables: ['2–3 Konzepte', 'Style Tiles', 'Präsentation'],
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80&auto=format&fit=crop' },
  { icon: Wand2, title: 'Design', duration: '1–2 Wochen',
    desc: 'Ausarbeitung des gewählten Konzepts bis ins kleinste Detail.',
    deliverables: ['Finales Design', 'Varianten', 'Detail-Polish'],
    image: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=600&q=80&auto=format&fit=crop' },
  { icon: Repeat2, title: 'Feedback & Iteration', duration: '3–5 Tage',
    desc: 'Gemeinsame Feedbackrunden, bis das Ergebnis perfekt sitzt.',
    deliverables: ['2 Feedback-Runden', 'Anpassungen', 'Final-Approval'],
    image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80&auto=format&fit=crop' },
  { icon: Rocket, title: 'Finalisierung & Übergabe', duration: '2–3 Tage',
    desc: 'Druckfertige Dateien und alle Formate (PDF, PNG, SVG) inklusive Guidelines.',
    deliverables: ['Druckdateien', 'Web-Formate', 'Brand Guidelines'],
    image: 'https://images.unsplash.com/photo-1605733160314-4fc7dac4bb16?w=600&q=80&auto=format&fit=crop' },
];

const INDUSTRIES = [
  { icon: PenTool, title: 'Brand Identity', tag: 'Branding', desc: 'Komplette Markenauftritte – Logo, Farben, Typografie und Tonalität.',
    img: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=900&q=80&auto=format&fit=crop' },
  { icon: BookOpen, title: 'Print Design', tag: 'Print', desc: 'Broschüren, Magazine, Plakate – haptisch hochwertig und druckfertig.',
    img: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=900&q=80&auto=format&fit=crop' },
  { icon: Package, title: 'Packaging', tag: 'Verpackung', desc: 'Verpackungsdesign, das im Regal auffällt und Ihre Marke erlebbar macht.',
    img: 'https://images.unsplash.com/photo-1605733160314-4fc7dac4bb16?w=900&q=80&auto=format&fit=crop' },
  { icon: Share2, title: 'Social Media', tag: 'Digital', desc: 'Konsistente, scroll-stoppende Designs für alle Social-Kanäle.',
    img: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=900&q=80&auto=format&fit=crop' },
  { icon: Film, title: 'Motion Graphics', tag: 'Motion', desc: 'Animierte Logos, Clips und Erklärvideos für maximale Aufmerksamkeit.',
    img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=900&q=80&auto=format&fit=crop' },
  { icon: Brush, title: 'Illustration', tag: 'Illustration', desc: 'Individuelle Illustrationen und Icon-Sets mit unverwechselbarem Stil.',
    img: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=900&q=80&auto=format&fit=crop' },
];

const BENEFITS = [
  { icon: Eye, title: 'Wiedererkennung', desc: 'Ein starkes Design macht Ihre Marke sofort identifizierbar.', points: ['Einprägsame Bildsprache', 'Konsistente Wiedererkennung', 'Höhere Merkfähigkeit'] },
  { icon: Heart, title: 'Emotionale Bindung', desc: 'Gutes Design weckt Gefühle – und schafft Markenloyalität.', points: ['Storytelling durch Design', 'Sympathie & Vertrauen', 'Langfristige Loyalität'] },
  { icon: Award, title: 'Professionalität', desc: 'Hochwertige Optik signalisiert Qualität und Vertrauen.', points: ['Seriöser Außenauftritt', 'Qualitätssignal', 'Stärkere Glaubwürdigkeit'] },
  { icon: Sparkles, title: 'Differenzierung', desc: 'Heben Sie sich klar vom Wettbewerb ab – visuell unverwechselbar.', points: ['Eigenständiger Stil', 'Klare Abgrenzung', 'Unverwechselbarkeit'] },
  { icon: ShoppingBag, title: 'Mehr Conversion', desc: 'Ansprechendes Design steigert Klicks, Käufe und Anfragen.', points: ['Höhere Klickraten', 'Mehr Anfragen', 'Bessere Verkäufe'] },
  { icon: Layers, title: 'Konsistenz', desc: 'Einheitliche Markenauftritte über alle Kanäle hinweg.', points: ['Einheitliche Tonalität', 'Kanalübergreifend stimmig', 'Skalierbares System'] },
  { icon: Rocket, title: 'Schnellere Wirkung', desc: 'Starke Visuals kommunizieren in Sekunden, was Worte nicht schaffen.', points: ['Sofort verständlich', 'Höhere Aufmerksamkeit', 'Schnellere Botschaft'] },
  { icon: Star, title: 'Premium-Wahrnehmung', desc: 'Durchdachtes Design rechtfertigt höhere Preise.', points: ['Wertige Anmutung', 'Höhere Preisbereitschaft', 'Premium-Positionierung'] },
];

const PROJECTS = [
  { title: 'Aurelia Cosmetics', tag: 'Branding', stats: 'Komplett-Rebrand', desc: 'Vollständige Markenidentität für ein Premium-Kosmetiklabel inkl. Packaging.',
    img: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=900&q=80&auto=format&fit=crop' },
  { title: 'Nordwerk Magazin', tag: 'Print', stats: '120 Seiten', desc: 'Editorial-Design und Layout für ein hochwertiges Lifestyle-Magazin.',
    img: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=900&q=80&auto=format&fit=crop' },
  { title: 'PulseFit', tag: 'Motion', stats: 'Brand-Animation', desc: 'Animiertes Logo und Social-Media-Motion-Kit für eine Fitness-Brand.',
    img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=900&q=80&auto=format&fit=crop' },
  { title: 'GreenLeaf Tea', tag: 'Packaging', stats: '+40% Regal-Aufmerksamkeit', desc: 'Verpackungsdesign-Serie, die im Handel sofort ins Auge sticht.',
    img: 'https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=900&q=80&auto=format&fit=crop' },
];

const REVIEWS = [
  { name: 'Markus Hoffmann', company: 'CEO, Aurelia', rating: 5, img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&q=80&auto=format&fit=crop', text: 'Unser neues Branding hat die Marke komplett auf ein neues Level gehoben. Einfach wunderschön.' },
  { name: 'Sarah Becker', company: 'Gründerin, PulseFit', rating: 5, img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80&auto=format&fit=crop', text: 'Das animierte Logo ist ein Hingucker. Unsere Social-Engagement-Rate ist deutlich gestiegen.' },
  { name: 'Daniel Krause', company: 'Verlagsleiter, Nordwerk', rating: 5, img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80&auto=format&fit=crop', text: 'Das Editorial-Design ist erstklassig. Jede Seite ist ein kleines Kunstwerk.' },
  { name: 'Julia Weber', company: 'Marketing, GreenLeaf', rating: 5, img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80&auto=format&fit=crop', text: 'Unsere Verpackung fällt jetzt sofort auf. Die Verkäufe im Handel sind spürbar gestiegen.' },
  { name: 'Tobias Lehmann', company: 'Founder, RouteFlow', rating: 5, img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&q=80&auto=format&fit=crop', text: 'Kreativ, zuverlässig und immer pünktlich. Die Zusammenarbeit war ein Vergnügen.' },
  { name: 'Anna Schulz', company: 'CMO, BookStay', rating: 5, img: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&q=80&auto=format&fit=crop', text: 'Unser komplettes Corporate Design wirkt jetzt aus einem Guss. Absolut empfehlenswert!' },
];

const FAQ = [
  { q: 'Wie läuft ein Design-Projekt ab?', a: 'In sechs Schritten: Briefing, Recherche & Moodboard, Konzept, Design, Feedback und finale Übergabe. Sie sind in jeder Phase eingebunden und geben Feedback.' },
  { q: 'Wie viele Korrekturschleifen sind enthalten?', a: 'Je nach Paket. Im Basis-Paket sind 2 Korrekturschleifen enthalten, im Brand-Paket unbegrenzte – damit das Ergebnis wirklich perfekt sitzt.' },
  { q: 'Welche Dateien erhalte ich am Ende?', a: 'Alle gängigen Formate: PDF, PNG, JPG und SVG sowie offene Dateien auf Wunsch. Inklusive Nutzungsrechte und – bei Branding – Markenrichtlinien.' },
  { q: 'Wie lange dauert ein Logo-Design?', a: 'Erste Entwürfe gibt es oft innerhalb von 48 Stunden. Ein finales Logo dauert je nach Komplexität 1–2 Wochen, komplette Brandings 3–6 Wochen.' },
  { q: 'Gestaltet ihr auch für den Druck?', a: 'Ja. Wir liefern druckfertige Dateien im richtigen Farbraum (CMYK), mit Beschnitt und nach den Vorgaben Ihrer Druckerei.' },
  { q: 'Könnt ihr unser bestehendes Design weiterentwickeln?', a: 'Selbstverständlich. Wir frischen bestehende Marken auf (Rebranding) oder erweitern Ihr Designsystem konsistent um neue Anwendungen.' },
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
const GRAPHICDESIGNPAGE_JSONLD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Service',
      name: 'Grafikdesign',
      serviceType: 'Grafikdesign',
      provider: { '@type': 'ProfessionalService', name: 'Zebick', url: SITE_URL },
      areaServed: 'CH',
      url: `${SITE_URL}/services/grafikdesign`,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Startseite', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Services', item: `${SITE_URL}/services` },
        { '@type': 'ListItem', position: 3, name: 'Grafikdesign', item: `${SITE_URL}/services/grafikdesign` },
      ],
    },
  ],
};

const GRAPHICDESIGNPAGE_RELATED = [{ label: "UI/UX Design", path: "/services/ui-ux-design" }, { label: "Digitales Marketing & SEO", path: "/services/digitales-marketing-seo" }];

const GraphicDesignPage = () => {
  const pageRef = useRef(null);
  const [activeProcess, setActiveProcess] = useState(0);
  const [testimonials, setTestimonials] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [activeMockTool, setActiveMockTool] = useState(0);

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
    <div className="page-transition" data-testid="graphic-design-page" ref={pageRef}>
      <Header />
      <TestimonialForm isOpen={showReviewForm} onClose={() => setShowReviewForm(false)} />
      <Seo
        title="Grafikdesign & Branding"
        description="Professionelles Grafikdesign für Logo, Branding und digitale Assets – konsistent und markenstark umgesetzt."
        path="/services/grafikdesign"
        jsonLd={GRAPHICDESIGNPAGE_JSONLD}
      />

      <div className="sr-only"><h1>Grafikdesign & Branding</h1></div>

      <ServiceAdvisorBlock serviceId="graphic-design" />


      {/* WARUM GRAFIKDESIGN */}
      <section className="section" data-testid="section-why-graphic" style={{ padding: '120px 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '15%', right: '5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(255,107,0,0.07) 0%, transparent 60%)', filter: 'blur(100px)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative' }}>
          <div className="why-graphic-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: '64px', alignItems: 'center' }}>

            <div data-reveal style={{ opacity: 0, transform: 'translateY(30px)', transition: 'all 0.8s ease' }}>
              {sectionLabel('Warum Grafikdesign?')}
              <h2 className="heading-1" style={{ fontSize: '48px', fontWeight: 900, lineHeight: 1.1, marginBottom: '24px' }}>
                Design entscheidet<br /><span className="text-gradient">in 50 Millisekunden.</span>
              </h2>
              <p style={{ fontSize: '17px', color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '40px' }}>
                Der erste Eindruck zählt – und er entsteht im Bruchteil einer Sekunde. Gutes Design schafft Vertrauen,
                hebt Sie vom Wettbewerb ab und macht Ihre Marke unverwechselbar. Schlechtes kostet Sie Kunden.
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

            {/* DESIGN CANVAS MOCKUP */}
            <div data-reveal style={{ opacity: 0, transform: 'translateY(30px)', transition: 'all 0.8s 0.15s ease', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div className="gd-mockup-scale" style={{ position: 'relative', width: '100%', maxWidth: '480px' }}>
                <div style={{ position: 'absolute', inset: '-30px', background: 'radial-gradient(circle, rgba(255,107,0,0.22) 0%, transparent 60%)', filter: 'blur(40px)' }} />
                <div style={{ position: 'relative', background: 'linear-gradient(145deg, #141414 0%, #0a0a0a 100%)', borderRadius: '16px', border: '1px solid #2a2a2a', boxShadow: '0 30px 80px rgba(0,0,0,0.6)', overflow: 'hidden' }}>
                  {/* canvas header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', background: '#181818', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Palette size={16} color="#FF6B00" />
                      <span style={{ fontSize: '12px', color: '#fff', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>Brand_Kit.fig</span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {[PenTool, Brush, Type, Frame].map((Ic, k) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => setActiveMockTool(k)}
                          aria-pressed={activeMockTool === k}
                          aria-label="Demo: Design-Panel wechseln"
                          className={activeMockTool === k ? 'gd-tool-active' : undefined}
                          style={{ width: '24px', height: '24px', borderRadius: '6px', background: activeMockTool === k ? 'rgba(255,107,0,0.15)' : 'rgba(255,255,255,0.04)', border: activeMockTool === k ? '1px solid rgba(255,107,0,0.4)' : '1px solid transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}
                        >
                          <Ic size={12} color={activeMockTool === k ? '#FF6B00' : '#666'} />
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* logo preview */}
                  <div style={{ padding: '18px 24px 14px', background: 'radial-gradient(ellipse at center, rgba(255,107,0,0.06) 0%, transparent 70%)', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', boxShadow: activeMockTool === 0 ? 'inset 0 0 0 1px rgba(255,107,0,0.5)' : 'none', transition: 'box-shadow 0.3s ease' }}>
                    <div className="gd-selection" style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '14px 20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,107,0,0.2)', borderRadius: '14px' }}>
                      <div className="gd-logo-badge" style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'linear-gradient(135deg, #FF6B00, #FFCA28)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px rgba(255,107,0,0.4)' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path className="gd-mark-draw" d="M12 2 L14.5 9.5 L22 12 L14.5 14.5 L12 22 L9.5 14.5 L2 12 L9.5 9.5 Z" stroke="#000" strokeWidth="1.6" strokeLinejoin="round" pathLength="1" />
                        </svg>
                      </div>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '18px', fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-0.02em' }}>BRAND</div>
                        <div style={{ fontSize: '10px', color: '#FF6B00', fontWeight: 700, letterSpacing: '0.2em', marginTop: '2px' }}>STUDIO · 2026</div>
                      </div>
                    </div>
                  </div>
                  {/* palette */}
                  <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', boxShadow: activeMockTool === 1 ? 'inset 0 0 0 1px rgba(255,107,0,0.5)' : 'none', transition: 'box-shadow 0.3s ease' }}>
                    <div style={{ fontSize: '10px', color: '#888', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>Farb-Palette</div>
                    <div data-keep-grid style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
                      {['#FF6B00', '#FFA500', '#FFCA28', '#0a0a0a', '#FFFFFF', '#8B5CF6'].map((c, k) => (
                        <div key={k} className="gd-swatch" style={{ position: 'relative', animationDelay: `${k * 0.08}s` }}>
                          <div style={{ width: '100%', aspectRatio: '1', maxHeight: '36px', borderRadius: '8px', background: c, border: '1px solid rgba(255,255,255,0.1)', boxShadow: `0 4px 12px ${c === '#0a0a0a' || c === '#FFFFFF' ? 'rgba(0,0,0,0.4)' : c + '60'}` }} />
                          <div style={{ fontSize: '7px', color: '#666', textAlign: 'center', marginTop: '3px', fontFamily: 'JetBrains Mono, monospace' }}>{c}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* typo */}
                  <div style={{ padding: '12px 20px', boxShadow: activeMockTool === 2 ? 'inset 0 0 0 1px rgba(255,107,0,0.5)' : 'none', transition: 'box-shadow 0.3s ease' }}>
                    <div style={{ fontSize: '10px', color: '#888', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>Typografie</div>
                    <div style={{ marginBottom: '6px' }}>
                      <div className="gd-type-cursor" style={{ fontSize: '22px', fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-0.02em' }}>Aa Bb Cc</div>
                      <div style={{ fontSize: '10px', color: '#FF6B00', fontWeight: 700, marginTop: '2px' }}>Display · 900</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 400, color: '#aaa', fontFamily: 'JetBrains Mono, monospace' }}>The quick brown fox jumps over.</div>
                      <div style={{ fontSize: '10px', color: '#666', fontWeight: 600, marginTop: '2px' }}>Mono · 400</div>
                    </div>
                  </div>
                  {/* mockup applications */}
                  <div style={{ padding: '12px 20px 14px', borderTop: '1px solid rgba(255,255,255,0.05)', boxShadow: activeMockTool === 3 ? 'inset 0 0 0 1px rgba(255,107,0,0.5)' : 'none', transition: 'box-shadow 0.3s ease' }}>
                    <div style={{ fontSize: '10px', color: '#888', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>Anwendungen</div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <div className="gd-mock-float" style={{ flex: 1, padding: '12px', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px' }}>
                        <div style={{ width: '22px', height: '22px', borderRadius: '7px', background: 'linear-gradient(135deg, #FF6B00, #FFCA28)', marginBottom: '12px' }} />
                        <div style={{ width: '70%', height: '6px', background: 'rgba(255,255,255,0.15)', borderRadius: '2px', marginBottom: '4px' }} />
                        <div style={{ width: '45%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px' }} />
                        <div style={{ fontSize: '7px', color: '#666', marginTop: '6px', fontFamily: 'JetBrains Mono, monospace' }}>App Icon</div>
                      </div>
                      <div className="gd-mock-float" style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #1a1a1a, #0a0a0a)', border: '1px solid rgba(255,107,0,0.15)', borderRadius: '10px', animationDelay: '0.4s' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2 L14.5 9.5 L22 12 L14.5 14.5 L12 22 L9.5 14.5 L2 12 L9.5 9.5 Z" fill="#FF6B00" /></svg>
                          <div style={{ width: '32px', height: '5px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px' }} />
                        </div>
                        <div style={{ width: '80%', height: '5px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginBottom: '4px' }} />
                        <div style={{ width: '60%', height: '5px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }} />
                        <div style={{ fontSize: '7px', color: '#666', marginTop: '6px', fontFamily: 'JetBrains Mono, monospace' }}>Visitenkarte</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
        <style>{`
          @media (max-width: 900px) {
            .why-graphic-grid { grid-template-columns: 1fr !important; gap: 0 !important; }
            .why-graphic-grid > div:first-child { display: contents; }
            .why-graphic-grid > div:last-child { margin-top: 48px; }
            .svc-icon-row { order: 1; margin-top: 32px; }
            .gd-mockup-scale { width: 480px !important; max-width: 480px !important; zoom: 0.7; }
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
          @keyframes gdGlow { 0%, 100% { box-shadow: 0 10px 30px rgba(255,107,0,0.4); transform: scale(1); } 50% { box-shadow: 0 10px 44px rgba(255,107,0,0.7); transform: scale(1.04); } }
          .gd-logo-badge { animation: gdGlow 3s ease-in-out infinite; }
          .gd-selection::before { content: ''; position: absolute; inset: -6px; border-radius: 18px; border: 1.5px dashed rgba(255,107,0,0.5); animation: gdSelectPulse 2.6s ease-in-out infinite; pointer-events: none; }
          @keyframes gdSelectPulse { 0%, 100% { opacity: 0.4; transform: scale(1); } 50% { opacity: 0.9; transform: scale(1.015); } }
          @keyframes gdToolPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.55; } }
          .gd-tool-active { animation: gdToolPulse 2s ease-in-out infinite; }
          @keyframes gdSwatchIn { from { opacity: 0; transform: scale(0.6) translateY(6px); } to { opacity: 1; transform: scale(1) translateY(0); } }
          .gd-swatch { animation: gdSwatchIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both; }
          .gd-type-cursor::after { content: ''; display: inline-block; width: 2px; height: 0.85em; margin-left: 4px; background: #FF6B00; vertical-align: -0.1em; animation: gdBlink 1.1s step-end infinite; }
          @keyframes gdBlink { 50% { opacity: 0; } }
          .gd-mark-draw { stroke-dasharray: 1; stroke-dashoffset: 1; fill: transparent; animation: gdMarkDraw 2.4s ease-in-out infinite; }
          @keyframes gdMarkDraw { 0% { stroke-dashoffset: 1; fill: transparent; } 55% { stroke-dashoffset: 0; fill: transparent; } 75%, 100% { stroke-dashoffset: 0; fill: #000; } }
          .gd-mock-float { animation: gdMockFloat 3.6s ease-in-out infinite; }
          @keyframes gdMockFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
          @media (prefers-reduced-motion: reduce) {
            .gd-logo-badge, .gd-selection::before, .gd-tool-active, .gd-swatch, .gd-type-cursor::after, .gd-mark-draw, .gd-mock-float { animation: none !important; }
          }
        `}</style>
      </section>


      {/* ========== STACK-SHOWCASE ========== */}
      <DesignStackShowcase />

      {/* ========== LEISTUNGSSPEKTRUM ========== */}
      <section className="section" data-testid="section-leistungsspektrum" style={{ padding: '120px 0', background: 'var(--bg-secondary)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '20%', right: '-150px', width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(255,107,0,0.06) 0%, transparent 60%)', filter: 'blur(100px)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '60px', alignItems: 'center', marginBottom: '72px' }}>
            <div data-reveal style={{ opacity: 0, transform: 'translateY(30px)', transition: 'all 0.8s ease' }}>
              {sectionLabel('Leistungsspektrum')}
              <h2 className="heading-1" style={{ fontSize: '44px', fontWeight: 900, marginBottom: '20px', lineHeight: 1.1 }}>
                Design, <span className="text-gradient">komplett gedacht</span>
              </h2>
              <p style={{ fontSize: '17px', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                Von Marke über Kommunikation bis visuelle Produktion: Konzept, Gestaltung und Umsetzung greifen
                bei uns ineinander – statt isolierter Einzelstücke bekommen Sie ein stimmiges Markenbild.
              </p>
            </div>
            <div data-reveal style={{ opacity: 0, transform: 'translateY(30px)', transition: 'all 0.8s 0.15s ease', ...baseCard, padding: '32px', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', lineHeight: 1.8 }}>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FF5F57' }} />
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FFBD2E' }} />
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#28CA42' }} />
                <span style={{ marginLeft: '12px', color: 'var(--text-muted)', fontSize: '12px' }}>design_pipeline.py</span>
              </div>
              <TypingCode lines={DESIGN_PIPELINE_CODE} />
            </div>
          </div>

          <ServiceTabsGrid tabs={SERVICE_TABS} services={SERVICES} />
        </div>
      </section>

      {/* TOOLS */}
      <section className="section" data-testid="section-technologies" style={{ background: 'var(--bg-secondary)', padding: '120px 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '20%', right: '-100px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(255,107,0,0.08) 0%, transparent 60%)', filter: 'blur(100px)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative' }}>
          <div data-reveal style={{ textAlign: 'center', marginBottom: '72px', opacity: 0, transform: 'translateY(30px)', transition: 'all 0.8s ease' }}>
            {sectionLabel('Tools & Software')}
            <h2 className="heading-1" style={{ fontSize: '48px', fontWeight: 900, marginBottom: '20px' }}>Womit wir gestalten</h2>
            <p style={{ fontSize: '17px', color: 'var(--text-muted)', maxWidth: '640px', margin: '0 auto' }}>Profi-Software für jeden Anwendungsfall – von Print bis 3D.</p>
          </div>
          <ToolDock tools={TECHNOLOGIES} />
        </div>
      </section>

      {/* ========== FORMATE ========== */}
      <section className="section" data-testid="section-formats" style={{ padding: '120px 0', background: 'var(--bg-primary)' }}>
        <div className="container">
          <div data-reveal style={{ opacity: 0, transform: 'translateY(30px)', transition: 'all 0.8s ease', textAlign: 'center', marginBottom: '64px' }}>
            {sectionLabel('Formate')}
            <h2 className="heading-1" style={{ fontSize: '44px', fontWeight: 900, marginBottom: '16px' }}>Wo <span className="text-gradient">Ihr Design lebt.</span></h2>
            <p style={{ fontSize: '17px', color: 'var(--text-muted)', maxWidth: '640px', margin: '0 auto', lineHeight: 1.7 }}>
              Das richtige Format macht den Unterschied zwischen einem Design, das wirkt – und einem, das untergeht.
            </p>
          </div>

          <div className="compare-grid" data-keep-grid style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '56px' }}>
            {DESIGN_FORMATS.map((f, i) => (
              <div key={f.name} data-reveal style={{ ...baseCard, padding: '28px', opacity: 0, transform: 'translateY(30px)', transition: `all 0.8s ${i * 0.08}s ease` }}
                   onMouseEnter={(e) => { e.currentTarget.style.borderColor = f.color; e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = `0 20px 40px ${f.color}25`; }}
                   onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                  <img src={f.logo} alt={f.name} width="44" height="44" style={{ objectFit: 'contain' }} />
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700 }}>{f.name}</h3>
                    <span style={{ fontSize: '12px', color: f.color }}>{f.tool}</span>
                  </div>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Comparison Table */}
          <div data-reveal style={{ ...baseCard, padding: '0', overflow: 'hidden', opacity: 0, transform: 'translateY(30px)', transition: 'all 0.8s 0.2s ease' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '720px' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,107,0,0.06)' }}>
                    {['Format', 'Tool', 'Einsatz', 'Dateiformat'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '20px 24px', fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent-primary)', fontWeight: 600, borderBottom: '1px solid var(--border-subtle)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DESIGN_FORMATS.map((f, i) => (
                    <tr key={f.name} style={{ borderBottom: i < DESIGN_FORMATS.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                      <td style={{ padding: '20px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img src={f.logo} alt={f.name} width="28" height="28" style={{ objectFit: 'contain' }} />
                          <span style={{ fontWeight: 600 }}>{f.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '20px 24px', color: 'var(--text-secondary)' }}>{f.tool}</td>
                      <td style={{ padding: '20px 24px', color: 'var(--text-muted)', fontSize: '14px' }}>{f.einsatz}</td>
                      <td style={{ padding: '20px 24px', color: 'var(--text-secondary)' }}>{f.format}</td>
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
        title="Von der Idee zum Kunstwerk"
        subtitle="Ein kreativer, strukturierter Prozess – mit Ihnen in jeder Phase."
        background="var(--bg-primary)"
        steps={PROCESS_STEPS}
      />

      {/* KATEGORIEN */}
      <ServiceIndustries
        slug="graphic-design"
        defaultItems={INDUSTRIES.map((c) => ({
          icon: c.icon?.displayName || c.icon?.name || 'Building2',
          title: c.title, tag: c.tag, desc: c.desc, img: c.img,
        }))}
        defaultHeading="Was wir gestalten"
        defaultSubtitle="Von Branding bis Motion – ein Studio für alle visuellen Disziplinen."
        eyebrowLabel="Design-Bereiche"
      />

      {/* VORTEILE */}
      <ModernBenefits
        eyebrow="Vorteile"
        title="Warum gutes Design zählt"
        accentWord="gutes Design"
        subtitle="Design ist eine Investition in die Wahrnehmung Ihrer Marke."
        items={BENEFITS}
        image="https://images.unsplash.com/photo-1626785774573-4b799315345d?w=900&q=80&auto=format&fit=crop"
        testid="section-benefits"
      />

      {/* PROJEKTE — aus Portfolio (Admin) */}
      <ServicePortfolioSection
        serviceId="graphic-design"
        fallbackExamples={PROJECTS}
        eyebrow="Referenzen & Projekte"
        title="Ausgewählte"
        accentWord="Arbeiten"
        subtitle="Ein kleiner Einblick in Projekte, auf die wir besonders stolz sind."
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
        defaultService="graphic-design"
        title="Lassen Sie uns gestalten"
        subtitle="Erzählen Sie uns von Ihrem Projekt – wir melden uns innerhalb von 24 Stunden."
      />      <RelatedServices items={GRAPHICDESIGNPAGE_RELATED} />      <Footer />
      <Chatbot />
    </div>
  );
};

// ------------ Subcomponents ------------

const DESIGN_BELT = TECHNOLOGIES.filter((t) =>
  ['Photoshop', 'Illustrator', 'Figma', 'Blender', 'After Effects', 'Canva'].includes(t.name)
);

// ---- Design-specific stack-showcase visuals (unique per service — only
// the "Unsere Tools" TechBelt card stays shared) ----

const PaletteCycle = () => (
  <div className="gfx-palette">
    {['#FF6B00', '#6B4FD6', '#F24E1E', '#22C55E', '#38BDF8'].map((c, i) => (
      <span key={c} className="gfx-swatch" style={{ background: c, animationDelay: `${i * 0.2}s` }} />
    ))}
  </div>
);

const GFX_MOOD_TOOLS = [
  { c: '#31A8FF', r: -10, logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/adobephotoshop.svg', mask: true },
  { c: '#FF9A00', r: 6, logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/adobeillustrator.svg', mask: true },
  { c: '#F24E1E', r: -4, logo: 'https://cdn.simpleicons.org/figma/F24E1E', mask: false },
];

const MoodboardStack = () => (
  <div className="gfx-moodboard">
    {GFX_MOOD_TOOLS.map((card, i) => (
      <span key={i} className="gfx-mood-card" style={{ '--r': `${card.r}deg`, borderTopColor: card.c, animationDelay: `${i * 0.9}s` }}>
        {card.mask ? (
          <span className="gfx-mood-logo" style={{ backgroundColor: card.c, WebkitMaskImage: `url(${card.logo})`, maskImage: `url(${card.logo})`, WebkitMaskSize: 'contain', maskSize: 'contain', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskPosition: 'center' }} />
        ) : (
          <img src={card.logo} alt="" className="gfx-mood-logo" />
        )}
      </span>
    ))}
  </div>
);

const VectorTrace = () => (
  <div className="gfx-vector">
    <svg viewBox="0 0 100 50" className="gfx-vector-svg" aria-hidden>
      <path d="M6 40 C 24 6, 46 6, 58 28 S 86 44, 94 14" className="gfx-vector-path" />
      {[[6, 40], [30, 12], [58, 28], [94, 14]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3" className="gfx-vector-anchor" style={{ animationDelay: `${0.3 + i * 0.3}s` }} />
      ))}
    </svg>
  </div>
);

const TypeScale = () => (
  <div className="gfx-typescale">
    {[12, 17, 23, 30].map((size, i) => (
      <span key={size} className="gfx-type-aa" style={{ fontSize: size, animationDelay: `${i * 0.18}s` }}>Aa</span>
    ))}
  </div>
);

const BezierHandles = () => (
  <div className="gfx-bezier">
    <svg viewBox="0 0 100 50" className="gfx-bezier-svg" aria-hidden>
      <line x1="10" y1="40" x2="30" y2="10" className="gfx-bezier-guide" />
      <line x1="90" y1="40" x2="70" y2="10" className="gfx-bezier-guide" />
      <path d="M10 40 C 30 10, 70 10, 90 40" className="gfx-bezier-curve" />
      <circle cx="30" cy="10" r="3" className="gfx-bezier-handle" style={{ animationDelay: '0s' }} />
      <circle cx="70" cy="10" r="3" className="gfx-bezier-handle" style={{ animationDelay: '0.2s' }} />
    </svg>
  </div>
);

const DesignStackShowcase = () => (
  <StackShowcaseSection
    eyebrow="Unser Prozess"
    title={<>Gebaut für <span style={{ color: 'var(--accent-primary)' }}>unverwechselbare</span> Marken</>}
    subtitle="Von der ersten Skizze bis zur fertigen Brand Identity – jedes Detail mit Bedacht gestaltet."
    testid="section-stack-showcase"
  >
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr 1fr', gap: '20px', marginBottom: '20px' }} className="asf-row">
      <StackCard title="Kreativität von Tag eins"><PaletteCycle /></StackCard>
      <StackCard title="Unser Design-Workflow"><MoodboardStack /></StackCard>
      <StackCard title="Von der Idee zum Druck"><VectorTrace /></StackCard>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }} className="asf-row">
      <StackCard title="Design Tokens, startklar"><TypeScale /></StackCard>
      <StackCard title="Unsere Tools"><TechBelt tools={DESIGN_BELT} /></StackCard>
      <StackCard title="Butterweiche Übergänge"><BezierHandles /></StackCard>
    </div>
    <style>{`
      .gfx-palette { display: flex; gap: 10px; align-items: center; justify-content: center; width: 100%; height: 50px; }
      .gfx-swatch { width: 24px; height: 24px; border-radius: 50%; display: inline-block; animation: gfxSwatchPulse 2.4s ease-in-out infinite; }
      @keyframes gfxSwatchPulse { 0%, 100% { transform: scale(0.85); box-shadow: 0 0 0 rgba(255,107,0,0); } 50% { transform: scale(1.15); box-shadow: 0 0 14px currentColor; } }

      .gfx-moodboard { position: relative; width: 100%; height: 60px; display: flex; align-items: center; justify-content: center; }
      .gfx-mood-card { position: absolute; width: 46px; height: 34px; background: var(--bg-elevated, #1a1a1a); border-radius: 6px; border-top: 3px solid; box-shadow: 0 6px 16px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; animation: gfxMoodShuffle 2.7s ease-in-out infinite; }
      .gfx-mood-logo { width: 16px; height: 16px; object-fit: contain; }
      @keyframes gfxMoodShuffle { 0%, 12% { transform: rotate(var(--r)) translateY(0) scale(1); z-index: 3; } 45% { transform: rotate(var(--r)) translateY(-10px) scale(1.08); z-index: 5; } 70%, 100% { transform: rotate(var(--r)) translateY(0) scale(1); z-index: 3; } }

      .gfx-vector { width: 100%; height: 55px; }
      .gfx-vector-svg { width: 100%; height: 100%; }
      .gfx-vector-path { fill: none; stroke: var(--accent-primary); stroke-width: 2; stroke-linecap: round; stroke-dasharray: 140; stroke-dashoffset: 140; animation: gfxVectorDraw 2.8s ease-in-out infinite; }
      @keyframes gfxVectorDraw { 0% { stroke-dashoffset: 140; } 65%, 100% { stroke-dashoffset: 0; } }
      .gfx-vector-anchor { fill: #fff; stroke: var(--accent-primary); stroke-width: 1.5; opacity: 0; animation: gfxAnchorPop 2.8s ease-in-out infinite; }
      @keyframes gfxAnchorPop { 0%, 10% { opacity: 0; transform: scale(0.4); } 20%, 100% { opacity: 1; transform: scale(1); } }

      .gfx-typescale { display: flex; align-items: baseline; gap: 12px; justify-content: center; width: 100%; height: 50px; }
      .gfx-type-aa { font-weight: 800; color: var(--text-primary); opacity: 0; transform: translateY(8px); animation: gfxTypeIn 2.4s ease-in-out infinite; }
      @keyframes gfxTypeIn { 0% { opacity: 0; transform: translateY(8px); } 20%, 80% { opacity: 1; transform: translateY(0); } 100% { opacity: 0; } }

      .gfx-bezier { width: 100%; height: 55px; }
      .gfx-bezier-svg { width: 100%; height: 100%; }
      .gfx-bezier-guide { stroke: rgba(255,255,255,0.18); stroke-width: 1; stroke-dasharray: 3 3; }
      .gfx-bezier-curve { fill: none; stroke: var(--accent-primary); stroke-width: 2; stroke-linecap: round; stroke-dasharray: 120; stroke-dashoffset: 120; animation: gfxBezierDraw 2.6s ease-in-out infinite; }
      @keyframes gfxBezierDraw { 0% { stroke-dashoffset: 120; } 65%, 100% { stroke-dashoffset: 0; } }
      .gfx-bezier-handle { fill: #fff; stroke: var(--accent-primary); stroke-width: 1.5; animation: gfxHandlePulse 1.4s ease-in-out infinite; }
      @keyframes gfxHandlePulse { 0%, 100% { r: 3; } 50% { r: 4.2; } }

      @media (prefers-reduced-motion: reduce) {
        .gfx-swatch, .gfx-mood-card, .gfx-vector-path, .gfx-vector-anchor, .gfx-type-aa, .gfx-bezier-curve, .gfx-bezier-handle { animation: none !important; }
      }
    `}</style>
  </StackShowcaseSection>
);

export default GraphicDesignPage;
