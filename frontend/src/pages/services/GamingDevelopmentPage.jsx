import React, { useState, useEffect, useRef } from 'react';
import {
  Gamepad2,
  Monitor,
  Smartphone,
  Users,
  Target,
  Globe,
  Headphones,
  Box,
  Sparkles,
  Layers,
  Settings,
  Rocket,
  Lightbulb,
  Crosshair,
  Trophy,
  Award,
  TrendingUp,
  Plus
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
import BrickBreaker from '../../components/games/BrickBreaker';
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
const SERVICES = [
  { tabId: 'concept', icon: Lightbulb, title: 'Game Design & Konzeption', image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=700&q=80&auto=format&fit=crop', desc: 'Von der ersten Spielidee über Core-Loop und Game Mechanics bis zum detaillierten Game Design Document.', features: ['Game Mechanics', 'Level Design', 'Balancing', 'Game Design Document'] },
  { tabId: 'concept', icon: Box, logo: 'https://cdn.simpleicons.org/blender/E87D0D', brandColor: '#E87D0D', title: '3D Art & Animation', image: 'https://images.unsplash.com/photo-1617802690992-15d93263d3a9?w=700&q=80&auto=format&fit=crop', desc: 'Characters, Environments und VFX – handcrafted Art, die Ihre Spielwelt zum Leben erweckt.', features: ['Characters & Props', 'Environments', 'Rigging & Animation', 'VFX & Shader'] },
  { tabId: 'concept', icon: Headphones, title: 'Audio & Soundtrack', image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=700&q=80&auto=format&fit=crop', desc: 'Original-Soundtracks, Sound-Effekte und Voice-Over-Produktion für maximale Immersion.' },
  { tabId: 'platforms', icon: Smartphone, title: 'Mobile Games', image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=700&q=80&auto=format&fit=crop', desc: 'iOS & Android – performant, mit In-App-Käufen, Ads und Live-Events.' },
  { tabId: 'platforms', icon: Monitor, logo: 'https://cdn.simpleicons.org/steam/FFFFFF', brandColor: '#66C0F4', title: 'PC & Console', image: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=700&q=80&auto=format&fit=crop', desc: 'Steam, Epic, PlayStation, Xbox & Switch – ein Spiel, alle großen Plattformen.' },
  { tabId: 'platforms', icon: Globe, title: 'WebGL & HTML5', image: 'https://images.unsplash.com/photo-1526378722484-bd91ca387e72?w=700&q=80&auto=format&fit=crop', desc: 'Browser-Games, die ohne Download sofort und überall laufen.' },
  { tabId: 'tech', icon: Users, title: 'Multiplayer & Backend', image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=700&q=80&auto=format&fit=crop', desc: 'Real-time Netcode, Matchmaking, Leaderboards und Anti-Cheat – skalierbar aus einer Hand.' },
  { tabId: 'tech', icon: Crosshair, title: 'QA & Playtesting', image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=700&q=80&auto=format&fit=crop', desc: 'Strukturierte Tests und Balancing für stabile, faire und spaßige Spiele.' },
  { tabId: 'tech', icon: Rocket, title: 'Live-Ops & Updates', image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=700&q=80&auto=format&fit=crop', desc: 'Seasons, Events und Monetarisierung – kontinuierlicher Content ohne Downtime.' },
];

const SERVICE_TABS = [
  { id: 'concept', label: 'Konzept & Kreativ' },
  { id: 'platforms', label: 'Plattformen' },
  { id: 'tech', label: 'Technik & Betrieb' },
];

const GAME_LOOP_CODE = [
  { indent: 0, segments: [{ t: '@game.', c: '#FF6B00' }, { t: 'on_tick', c: '#61DAFB' }, { t: '()' }] },
  { indent: 0, segments: [{ t: 'async def', c: '#C678DD' }, { t: ' ' }, { t: 'update', c: '#61DAFB' }, { t: '(frame: ' }, { t: 'Frame', c: '#E5C07B' }, { t: '):' }] },
  { indent: 20, segments: [{ t: 'state = ' }, { t: 'await', c: '#C678DD' }, { t: ' physics.step(frame)' }] },
  { indent: 20, segments: [{ t: 'await', c: '#C678DD' }, { t: ' netcode.sync(state)' }] },
  { indent: 20, segments: [{ t: 'return', c: '#C678DD' }, { t: ' renderer.draw(state)' }] },
];

const TECHNOLOGIES = [
  { name: 'Unity', logo: 'https://cdn.simpleicons.org/unity/FFFFFF', color: '#FFFFFF', desc: 'Die vielseitigste Engine für Mobile-, PC- und Console-Games.' },
  { name: 'Unreal Engine', logo: 'https://cdn.simpleicons.org/unrealengine/FFFFFF', color: '#FF6B00', desc: 'AAA-Grafik, Nanite & Lumen – für fotorealistische Spielwelten.' },
  { name: 'Godot', logo: 'https://cdn.simpleicons.org/godotengine/478CBF', color: '#478CBF', desc: 'Schlanke Open-Source-Engine für schnelle 2D- und 3D-Prototypen.' },
  { name: 'Blender', logo: 'https://cdn.simpleicons.org/blender/E87D0D', color: '#E87D0D', desc: '3D-Modeling, Sculpting und Animation für Game-Assets.' },
  { name: 'C#', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/csharp.svg', color: '#9B6BFF', desc: 'Die Sprache hinter Unity-Gameplay und Tools.' },
  { name: 'C++', logo: 'https://cdn.simpleicons.org/cplusplus/00599C', color: '#00A0E0', desc: 'Performance-kritischer Code für Unreal & Engines.' },
  { name: 'Steam', logo: 'https://cdn.simpleicons.org/steam/FFFFFF', color: '#FF6B00', desc: 'Release, Achievements, Workshop und Cloud-Saves auf PC.' },
  { name: 'PlayStation', logo: 'https://cdn.simpleicons.org/playstation/0070D1', color: '#2E6BE6', desc: 'Zertifizierung und Release für PS4 & PS5.' },
  { name: 'Xbox', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/xbox.svg', color: '#5BB91E', desc: 'Game Pass, Achievements und Series X|S Support.' },
  { name: 'Nintendo Switch', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/nintendoswitch.svg', color: '#FF4444', desc: 'Portierung und Optimierung für die Switch.' },
];

const GAME_PLATFORMS = [
  { name: 'PC (Steam)', logo: 'https://cdn.simpleicons.org/steam/FFFFFF', color: '#FFFFFF',
    audience: 'Core-Gamer', cert: 'Kein Approval nötig', revenue: '70/30-Split',
    desc: 'Größte Reichweite für Indie- und Core-Games, mit Workshop, Achievements und Cloud-Saves.' },
  { name: 'PlayStation', logo: 'https://cdn.simpleicons.org/playstation/0070D1', color: '#2E6BE6',
    audience: 'Konsolen-Gamer', cert: 'Sony-Zertifizierung', revenue: '70/30-Split',
    desc: 'Premium-Zielgruppe mit hoher Kaufbereitschaft – erfordert formale Plattform-Zertifizierung.' },
  { name: 'Xbox', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/xbox.svg', color: '#5BB91E',
    audience: 'Konsolen-Gamer', cert: 'Microsoft-Zertifizierung', revenue: 'Game Pass + Kauf',
    desc: 'Zugang zu Millionen Game-Pass-Abonnenten – zusätzliches Umsatzmodell neben dem Direktkauf.' },
  { name: 'Nintendo Switch', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/nintendoswitch.svg', color: '#FF4444',
    audience: 'Breites Publikum', cert: 'Nintendo-Zertifizierung', revenue: '70/30-Split',
    desc: 'Familienfreundliche, mobile Zielgruppe – ideal für zugängliche und Casual-Spiele.' },
];

const PROCESS_STEPS = [
  { icon: Lightbulb, title: 'Concept', duration: '2–4 Wochen',
    desc: 'Spielidee, Zielgruppe, Core-Loop und Game Design Document – wir definieren, was Ihr Spiel einzigartig macht.',
    deliverables: ['Game Design Document', 'Core-Loop & USP-Definition', 'Marktanalyse & Zielgruppe'],
    image: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?w=600&q=80&auto=format&fit=crop' },
  { icon: Target, title: 'Design', duration: '4–6 Wochen',
    desc: 'Mechaniken, Level-Design, Art-Direction und ein klarer Plan für das spielbare Prototyping.',
    deliverables: ['Mechanik-Spezifikation', 'Art-Style-Guide', 'Level- & Progression-Design'],
    image: 'https://images.unsplash.com/photo-1486401899868-0e435ed85128?w=600&q=80&auto=format&fit=crop' },
  { icon: Layers, title: 'Prototype', duration: '6–10 Wochen',
    desc: 'Ein spielbarer Prototyp testet den Spaßfaktor früh und ehrlich – bevor groß investiert wird.',
    deliverables: ['Spielbarer Vertical Slice', 'Erste Playtest-Insights', 'Fun-Validation-Report'],
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&q=80&auto=format&fit=crop' },
  { icon: Settings, title: 'Production', duration: '4–12 Monate',
    desc: 'Vollständige Umsetzung: Art, Code, Audio und Content – das Spiel nimmt Gestalt an.',
    deliverables: ['Komplette Engine-Implementation', 'Art, Animation & Sound', 'Content-Pipeline & Tools'],
    image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&q=80&auto=format&fit=crop' },
  { icon: Crosshair, title: 'QA & Playtesting', duration: '4–8 Wochen',
    desc: 'Bugfixing, Balancing und echte Playtests, bis sich jeder Frame richtig anfühlt.',
    deliverables: ['Geräte- & Plattform-Tests', 'Closed Beta mit Spielern', 'Balancing- & Performance-Tuning'],
    image: 'https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?w=600&q=80&auto=format&fit=crop' },
  { icon: Rocket, title: 'Launch & Live-Ops', duration: 'Laufend',
    desc: 'Store-Release, Marketing-Support und laufende Updates, Events und Monetarisierung.',
    deliverables: ['Store-Submission & Release', 'Live-Events & Content-Updates', 'Analytics & Monetization-Tuning'],
    image: 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=600&q=80&auto=format&fit=crop' },
];

const GENRES = [
  { icon: Smartphone, title: 'Mobile Games', tag: 'Mobile', desc: 'Casual bis Hardcore – iOS & Android mit IAP, Ads und Live-Events.',
    img: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=900&q=80&auto=format&fit=crop' },
  { icon: Monitor, title: 'PC & Steam', tag: 'PC', desc: 'Premium-Erlebnisse für Steam & Epic – mit Workshop und Achievements.',
    img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=900&q=80&auto=format&fit=crop' },
  { icon: Gamepad2, title: 'Console', tag: 'Console', desc: 'PlayStation, Xbox & Switch – zertifiziert und optimiert.',
    img: 'https://images.unsplash.com/photo-1486401899868-0e435ed85128?w=900&q=80&auto=format&fit=crop' },
  { icon: Users, title: 'Multiplayer & Co-Op', tag: 'Online', desc: 'Real-time PvP & Co-Op mit Matchmaking, Ranglisten und Anti-Cheat.',
    img: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?w=900&q=80&auto=format&fit=crop' },
  { icon: Box, title: 'AR / VR', tag: 'Immersive', desc: 'Quest, PCVR & AR – immersive Erlebnisse, die man wirklich fühlt.',
    img: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=900&q=80&auto=format&fit=crop' },
  { icon: Globe, title: 'WebGL Browser', tag: 'Web', desc: 'HTML5-Games, die sofort im Browser starten – ohne Installation.',
    img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=900&q=80&auto=format&fit=crop' },
];

const BENEFITS = [
  { icon: Sparkles, title: 'Höhere Spielerbindung', desc: 'Durchdachte Core-Loops und Progression halten Spieler langfristig bei der Stange.', points: ['Belohnende Progression', 'Daily Engagement', 'Retention-Mechaniken'] },
  { icon: TrendingUp, title: 'Nachhaltige Monetarisierung', desc: 'IAP, Ads und Battle-Pass – Umsätze ohne Pay-to-Win-Frust.', points: ['In-App-Käufe', 'Werbe-Integration', 'Season-/Battle-Pass'] },
  { icon: Users, title: 'Community-Effekt', desc: 'Multiplayer und Leaderboards machen Ihr Spiel sozial und viral.', points: ['Live Leaderboards', 'Co-Op & PvP', 'Social Sharing'] },
  { icon: Layers, title: 'Cross-Platform-Reichweite', desc: 'Ein Spiel auf allen Geräten – maximale Reichweite und Umsatz.', points: ['Mobile · PC · Console', 'Cross-Save', 'Cross-Play'] },
  { icon: Award, title: 'Premium-Qualität', desc: '60 FPS, sauberes Art-Design und poliertes Game-Feel.', points: ['Flüssige Performance', 'Poliertes Game-Feel', 'Hohe Store-Ratings'] },
  { icon: Rocket, title: 'Live-Ops Ready', desc: 'Content-Updates und Events ohne Ausfallzeiten – Ihr Spiel bleibt frisch.', points: ['Seasonal Events', 'Schnelle Updates', 'A/B-getunte Economy'] },
];

const PROJECTS = [
  { title: 'Neon Racer', tag: 'Mobile', stats: '2M+ Downloads', desc: 'Arcade-Racer mit Online-Leaderboards – mehrere Wochen in den Top 10 der App-Store-Charts.',
    img: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=900&q=80&auto=format&fit=crop' },
  { title: 'Galaxy Siege', tag: 'PC / Steam', stats: '92% Positive', desc: 'Koop-Tower-Defense mit Crossplay – „Overwhelmingly Positive" auf Steam.',
    img: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=900&q=80&auto=format&fit=crop' },
  { title: 'Puzzle Quest VR', tag: 'VR', stats: '4.7★ Rating', desc: 'Immersives VR-Puzzle für Quest & PCVR mit handgefertigten Levels und Hand-Tracking.',
    img: 'https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?w=900&q=80&auto=format&fit=crop' },
  { title: 'Arena Clash', tag: 'Multiplayer', stats: '500k MAU', desc: 'Real-time PvP-Arena mit Matchmaking, Ranglisten und saisonalen Events.',
    img: 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=900&q=80&auto=format&fit=crop' },
];

const REVIEWS = [
  { name: 'Jonas Reuter', company: 'CEO, PixelForge Studios', rating: 5, img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80&auto=format&fit=crop',
    text: 'Vom Prototyp bis zum Launch – das Team hat unser Mobile-Game in Rekordzeit in die Charts gebracht.' },
  { name: 'Mia Schäfer', company: 'Producer, Indie Collective', rating: 5, img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80&auto=format&fit=crop',
    text: 'Der Netcode für unser PvP läuft butterweich. Endlich Multiplayer ohne Lag-Beschwerden.' },
  { name: 'David Klein', company: 'CTO, NovaPlay', rating: 5, img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80&auto=format&fit=crop',
    text: 'Crossplay über Mobile, PC und Console – sauber umgesetzt und stabil. Klare Empfehlung.' },
  { name: 'Laura Brandt', company: 'Art Director, Studio Aurora', rating: 5, img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80&auto=format&fit=crop',
    text: 'Die 3D-Art und Animationen sind erstklassig. Unser Spiel sieht aus wie von einem AAA-Studio.' },
  { name: 'Tobias Wolf', company: 'Founder, Arcade Labs', rating: 5, img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&q=80&auto=format&fit=crop',
    text: 'Live-Ops mit Events und Seasons hat unsere Retention verdoppelt. Spieler kommen jeden Tag zurück.' },
  { name: 'Sarah Vogt', company: 'CPO, Quantum Games', rating: 5, img: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&q=80&auto=format&fit=crop',
    text: 'Professionell, kreativ und immer im Budget. Wir entwickeln jetzt unseren zweiten Titel mit ihnen.' },
];

const FAQ = [
  { q: 'Mit welchen Engines entwickelt ihr?', a: 'Hauptsächlich Unity und Unreal Engine – je nach Projekt. Für schlanke 2D-Titel nutzen wir auch Godot. Die Engine-Wahl treffen wir gemeinsam, passend zu Plattform, Stil und Budget.' },
  { q: 'Für welche Plattformen könnt ihr entwickeln?', a: 'Mobile (iOS & Android), PC (Steam & Epic), Konsolen (PlayStation, Xbox, Nintendo Switch), VR/AR sowie WebGL-Browsergames. Cross-Platform und Crossplay sind möglich.' },
  { q: 'Wie lange dauert die Entwicklung eines Spiels?', a: 'Ein Prototyp entsteht in wenigen Wochen. Ein vollständiges Mobile- oder Indie-Game dauert je nach Umfang typischerweise 4–12 Monate. Größere Live-Service-Titel planen wir in Meilensteinen.' },
  { q: 'Könnt ihr Multiplayer und Online-Features umsetzen?', a: 'Ja. Wir bauen Real-time-Netcode, Matchmaking, Leaderboards, Cloud-Saves und Anti-Cheat – skalierbar mit dediziertem Backend.' },
  { q: 'Was kostet die Entwicklung eines Spiels?', a: 'Das hängt stark von Umfang, Plattformen und Features ab. Ein Indie-Prototyp startet ab 4.900€, vollständige Produktionen ab 24.900€. Wir erstellen vorab ein transparentes Festpreis- oder Meilenstein-Angebot.' },
  { q: 'Unterstützt ihr auch nach dem Launch?', a: 'Absolut. Mit Live-Ops betreuen wir Updates, Events, Seasons, Bugfixes und Monetarisierung – damit Ihr Spiel langfristig wächst und Spieler bindet.' },
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
const GAMINGDEVELOPMENTPAGE_JSONLD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Service',
      name: 'Gaming-Entwicklung',
      serviceType: 'Gaming-Entwicklung',
      provider: { '@type': 'ProfessionalService', name: 'Zebick', url: SITE_URL },
      areaServed: 'CH',
      url: `${SITE_URL}/services/gaming-entwicklung`,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Startseite', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Services', item: `${SITE_URL}/services` },
        { '@type': 'ListItem', position: 3, name: 'Gaming-Entwicklung', item: `${SITE_URL}/services/gaming-entwicklung` },
      ],
    },
  ],
};

const GAMINGDEVELOPMENTPAGE_RELATED = [{ label: "UI/UX Design", path: "/services/ui-ux-design" }, { label: "Webentwicklung", path: "/services/webentwicklung" }];

const GamingDevelopmentPage = () => {
  const pageRef = useRef(null);
  const [activeProcess, setActiveProcess] = useState(0);
  const [testimonials, setTestimonials] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);

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
    <div className="page-transition" data-testid="gaming-development-page" ref={pageRef}>
      <Header />
      <TestimonialForm isOpen={showReviewForm} onClose={() => setShowReviewForm(false)} />
      <Seo
        title="2D & 3D Gaming-Entwicklung"
        description="Entwicklung von 2D- und 3D-Spielen mit durchdachten Spielmechaniken – für Mobile, Web und weitere Plattformen."
        path="/services/gaming-entwicklung"
        jsonLd={GAMINGDEVELOPMENTPAGE_JSONLD}
      />

      <div className="sr-only"><h1>2D & 3D Gaming-Entwicklung</h1></div>

      <ServiceAdvisorBlock serviceId="gaming" />

      {/* ========== BRICK BREAKER (Mini-Game · Round 2 – unverändert) ========== */}
      <section className="section" data-testid="gaming-brickbreaker" style={{
        paddingTop: '120px', paddingBottom: '120px',
        background: '#0d0d0d', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(circle at 70% 30%, rgba(255,107,0,0.06) 0%, transparent 60%)',
        }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }} className="brick-grid">
            <div>
              <span className="section-label">Mini-Game · Round 2</span>
              <h2 className="heading-1" style={{ fontSize: 48, marginTop: 16, marginBottom: 20, fontWeight: 900 }}>
                Lust auf <span style={{ color: '#FF6B00' }}>noch ein</span> Spiel?
              </h2>
              <p style={{ fontSize: 17, color: '#b5b5b5', lineHeight: 1.7, marginBottom: 26 }}>
                Brick Breaker — der Arcade-Klassiker. Steuere das Paddle, schieße den Ball und zerlege Schicht für Schicht.
                Mit jedem Level werden die Bricks zäher. Schaffst du es ins Leaderboard?
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12 }}>
                {[
                  ['Maus / Touch', 'Paddle steuern'],
                  ['Klick', 'Ball abfeuern'],
                  ['Mehrere Level', 'Steigender Schwierigkeitsgrad'],
                  ['Live Leaderboard', 'Echte Highscores aus der Community'],
                ].map(([k, v], i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      padding: '4px 10px', background: 'rgba(255,107,0,0.12)',
                      border: '1px solid rgba(255,107,0,0.3)', color: '#FF6B00',
                      borderRadius: 4, fontFamily: 'monospace', fontSize: 12, fontWeight: 700, minWidth: 110,
                      textAlign: 'center',
                    }}>{k}</div>
                    <span style={{ color: '#d5d5d5', fontSize: 15 }}>{v}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <BrickBreaker />
            </div>
          </div>
        </div>
        <style>{`
          @media (max-width: 900px) {
            .brick-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </section>

      {/* ========== STACK-SHOWCASE ========== */}
      <GamingStackShowcase />

      {/* ========== LEISTUNGSSPEKTRUM ========== */}
      <section className="section" data-testid="section-leistungsspektrum" style={{ padding: '120px 0', background: 'var(--bg-secondary)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '20%', right: '-150px', width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(255,107,0,0.06) 0%, transparent 60%)', filter: 'blur(100px)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '60px', alignItems: 'center', marginBottom: '72px' }}>
            <div data-reveal style={{ opacity: 0, transform: 'translateY(30px)', transition: 'all 0.8s ease' }}>
              {sectionLabel('Leistungsspektrum')}
              <h2 className="heading-1" style={{ fontSize: '44px', fontWeight: 900, marginBottom: '20px', lineHeight: 1.1 }}>
                Game-Entwicklung, <span className="text-gradient">komplett gedacht</span>
              </h2>
              <p style={{ fontSize: '17px', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                Von Konzept über Plattformen bis Live-Ops: Design, Art, Code und Betrieb greifen bei uns ineinander –
                statt isolierter Gewerke bekommen Sie Ihr Spiel aus einer Hand.
              </p>
            </div>
            <div data-reveal style={{ opacity: 0, transform: 'translateY(30px)', transition: 'all 0.8s 0.15s ease', ...baseCard, padding: '32px', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', lineHeight: 1.8 }}>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FF5F57' }} />
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FFBD2E' }} />
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#28CA42' }} />
                <span style={{ marginLeft: '12px', color: 'var(--text-muted)', fontSize: '12px' }}>game_loop.py</span>
              </div>
              <TypingCode lines={GAME_LOOP_CODE} />
            </div>
          </div>

          <ServiceTabsGrid tabs={SERVICE_TABS} services={SERVICES} />
        </div>
      </section>

      {/* ========== TECHNOLOGIEN & TOOLS ========== */}
      <section className="section" data-testid="section-technologies" style={{ background: 'var(--bg-secondary)', padding: '120px 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '20%', right: '-100px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(255,107,0,0.08) 0%, transparent 60%)', filter: 'blur(100px)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative' }}>
          <div data-reveal style={{ textAlign: 'center', marginBottom: '72px', opacity: 0, transform: 'translateY(30px)', transition: 'all 0.8s ease' }}>
            {sectionLabel('Engines & Tools')}
            <h2 className="heading-1" style={{ fontSize: '48px', fontWeight: 900, marginBottom: '20px' }}>Womit wir Ihr Spiel bauen</h2>
            <p style={{ fontSize: '17px', color: 'var(--text-muted)', maxWidth: '640px', margin: '0 auto' }}>
              Wir setzen auf die führenden Engines und Plattformen der Game-Industrie.
            </p>
          </div>
          <ToolDock tools={TECHNOLOGIES} />
        </div>
      </section>

      {/* ========== PLATTFORMEN ========== */}
      <section className="section" data-testid="section-platforms" style={{ padding: '120px 0', background: 'var(--bg-primary)' }}>
        <div className="container">
          <div data-reveal style={{ opacity: 0, transform: 'translateY(30px)', transition: 'all 0.8s ease', textAlign: 'center', marginBottom: '64px' }}>
            {sectionLabel('Plattformen')}
            <h2 className="heading-1" style={{ fontSize: '44px', fontWeight: 900, marginBottom: '16px' }}>Wo <span className="text-gradient">Ihr Spiel läuft.</span></h2>
            <p style={{ fontSize: '17px', color: 'var(--text-muted)', maxWidth: '640px', margin: '0 auto', lineHeight: 1.7 }}>
              Die richtige Plattform entscheidet, wie viele Spieler Sie erreichen – und wie Sie verdienen.
            </p>
          </div>

          <div className="compare-grid" data-keep-grid style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '56px' }}>
            {GAME_PLATFORMS.map((p, i) => (
              <div key={p.name} data-reveal style={{ ...baseCard, padding: '28px', opacity: 0, transform: 'translateY(30px)', transition: `all 0.8s ${i * 0.08}s ease` }}
                   onMouseEnter={(e) => { e.currentTarget.style.borderColor = p.color; e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = `0 20px 40px ${p.color}25`; }}
                   onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                  <img src={p.logo} alt={p.name} width="44" height="44" style={{ objectFit: 'contain' }} />
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700 }}>{p.name}</h3>
                    <span style={{ fontSize: '12px', color: p.color }}>{p.audience}</span>
                  </div>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.7 }}>{p.desc}</p>
              </div>
            ))}
          </div>

          {/* Comparison Table */}
          <div data-reveal style={{ ...baseCard, padding: '0', overflow: 'hidden', opacity: 0, transform: 'translateY(30px)', transition: 'all 0.8s 0.2s ease' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '720px' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,107,0,0.06)' }}>
                    {['Plattform', 'Zielgruppe', 'Zertifizierung', 'Umsatzmodell'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '20px 24px', fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent-primary)', fontWeight: 600, borderBottom: '1px solid var(--border-subtle)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {GAME_PLATFORMS.map((p, i) => (
                    <tr key={p.name} style={{ borderBottom: i < GAME_PLATFORMS.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                      <td style={{ padding: '20px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img src={p.logo} alt={p.name} width="28" height="28" style={{ objectFit: 'contain' }} />
                          <span style={{ fontWeight: 600 }}>{p.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '20px 24px', color: 'var(--text-secondary)' }}>{p.audience}</td>
                      <td style={{ padding: '20px 24px', color: 'var(--text-muted)', fontSize: '14px' }}>{p.cert}</td>
                      <td style={{ padding: '20px 24px', color: 'var(--text-secondary)' }}>{p.revenue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ========== VORGEHEN (interaktive Timeline) ========== */}
      <ModernTimeline
        eyebrow="Unsere Pipeline"
        title="Von der Idee zum Launch"
        subtitle="Ein strukturierter, transparenter Prozess – vom ersten Konzept bis zum Live-Service."
        background="var(--bg-primary)"
        steps={PROCESS_STEPS}
      />

      {/* ========== GENRES & PLATTFORMEN ========== */}
      <ServiceIndustries
        slug="gaming"
        defaultItems={GENRES.map((c) => ({
          icon: c.icon?.displayName || c.icon?.name || 'Gamepad2',
          title: c.title, tag: c.tag, desc: c.desc, img: c.img,
        }))}
        defaultHeading="Spiele für jede Plattform"
        defaultSubtitle="Egal ob Mobile, PC, Konsole, VR oder Browser – wir bringen Ihr Spiel dorthin, wo Ihre Spieler sind."
        eyebrowLabel="Genres & Plattformen"
      />

      {/* ========== VORTEILE ========== */}
      <ModernBenefits
        eyebrow="Vorteile"
        title="Was ein eigenes Spiel bringt"
        accentWord="eigenes Spiel"
        subtitle="Ein Spiel ist mehr als Unterhaltung – es ist eine Marke, eine Community und eine Umsatzquelle."
        items={BENEFITS}
        image="https://images.unsplash.com/photo-1511512578047-dfb367046420?w=900&q=80&auto=format&fit=crop"
        testid="section-benefits"
      />

      {/* ========== REFERENZEN & PROJEKTE — aus Portfolio (Admin) ========== */}
      <ServicePortfolioSection
        serviceId="gaming"
        fallbackExamples={PROJECTS}
        eyebrow="Referenzen & Projekte"
        title="Games, die"
        accentWord="für sich sprechen"
        subtitle="Eine Auswahl unserer veröffentlichten Titel – mit echten Spielerzahlen."
        testid="section-projects"
        showCategoryFilter
      />

      {/* ========== KUNDENBEWERTUNGEN ========== */}
      <section className="section" data-testid="section-reviews" style={{ padding: '120px 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: '-100px', right: '-100px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(255,107,0,0.06) 0%, transparent 60%)', filter: 'blur(100px)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative' }}>
          <div data-reveal style={{ textAlign: 'center', marginBottom: '72px', opacity: 0, transform: 'translateY(30px)', transition: 'all 0.8s ease' }}>
            {sectionLabel('Kundenbewertungen')}
            <h2 className="heading-1" style={{ fontSize: '48px', fontWeight: 900, marginBottom: '20px' }}>Was unsere Kunden sagen</h2>
            <p style={{ fontSize: '17px', color: 'var(--text-muted)', maxWidth: '640px', margin: '0 auto' }}>
              Studios und Publisher vertrauen auf unsere Game-Expertise – 4.9 von 5 Sternen.
            </p>
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


      {/* ========== FAQ ========== */}
      <ServiceFAQ
        eyebrow="FAQ"
        title="Häufige Fragen"
        subtitle="Antworten auf die Fragen, die uns zum Thema Game Development am häufigsten gestellt werden."
        items={FAQ.map((item) => ({ question: item.q, answer: item.a }))}
        testid="section-faq"
      />

      {/* ========== KONTAKT ========== */}
      <ServiceContactForm
        defaultService="gaming"
        title="Bringen wir Ihr Game zum Leben"
        subtitle="Erzählen Sie uns von Ihrer Spielidee – wir melden uns innerhalb von 24 Stunden."
      />      <RelatedServices items={GAMINGDEVELOPMENTPAGE_RELATED} />      <Footer />
      <Chatbot />
    </div>
  );
};

// ------------ Subcomponents ------------

const GAMING_BELT = TECHNOLOGIES.filter((t) =>
  ['Unity', 'Unreal Engine', 'Godot', 'Blender', 'C#', 'Steam'].includes(t.name)
);

// ---- Gaming-specific stack-showcase visuals (unique per service — only
// the "Unsere Engines & Tools" TechBelt card stays shared) ----

const HealthManaBar = () => (
  <div className="gam-hud">
    <div className="gam-hud-row"><span className="gam-hud-bar gam-hud-hp" /></div>
    <div className="gam-hud-row"><span className="gam-hud-bar gam-hud-mp" /></div>
  </div>
);

const AchievementUnlock = () => (
  <div className="gam-achievement">
    {['Prototype', 'Production', 'QA', 'Launch'].map((stage, i) => (
      <span key={stage} className="gam-achievement-toast" style={{ animationDelay: `${i * 1.1}s` }}>
        <span className="gam-trophy">🏆</span> {stage}
      </span>
    ))}
  </div>
);

const GAM_PLATFORMS = [
  { n: 'Steam', logo: 'https://cdn.simpleicons.org/steam/FFFFFF', bg: '#1b2838', mask: false },
  { n: 'PlayStation', logo: 'https://cdn.simpleicons.org/playstation/FFFFFF', bg: '#003791', mask: false },
  { n: 'Xbox', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/xbox.svg', bg: '#107C10', mask: true },
  { n: 'Nintendo Switch', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/nintendoswitch.svg', bg: '#E60012', mask: true },
];

const CrossPlatformRelease = () => (
  <div className="gam-platforms">
    {GAM_PLATFORMS.map((p, i) => (
      <span key={p.n} className="gam-platform-badge" style={{ background: p.bg, animationDelay: `${i * 0.35}s` }}>
        {p.mask ? (
          <span style={{ width: 18, height: 18, display: 'inline-block', backgroundColor: '#fff', WebkitMaskImage: `url(${p.logo})`, maskImage: `url(${p.logo})`, WebkitMaskSize: 'contain', maskSize: 'contain', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskPosition: 'center' }} />
        ) : (
          <img src={p.logo} alt={p.n} />
        )}
      </span>
    ))}
  </div>
);

const BugSquash = () => (
  <div className="gam-bugsquash">
    <span className="gam-bug">🐛</span>
    <span className="gam-bug-check">✓</span>
    <span className="gam-bug-label">0 Bugs im Build</span>
  </div>
);

const FrameTimeBars = () => (
  <div className="gam-frametime">
    <div className="gam-frametime-bars">
      {Array.from({ length: 10 }).map((_, i) => (
        <span key={i} className="gam-frametime-bar" style={{ animationDelay: `${i * 0.08}s` }} />
      ))}
    </div>
    <span className="gam-frametime-label">60 FPS</span>
  </div>
);

const GamingStackShowcase = () => (
  <StackShowcaseSection
    eyebrow="Unsere Pipeline"
    title={<>Gebaut für <span style={{ color: 'var(--accent-primary)' }}>epische</span> Spiele</>}
    subtitle="Von der Spielidee bis zum Launch-Day – jedes Detail für maximalen Spielspaß."
    testid="section-stack-showcase"
  >
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr 1fr', gap: '20px', marginBottom: '20px' }} className="asf-row">
      <StackCard title="Gameplay von Tag eins"><HealthManaBar /></StackCard>
      <StackCard title="Unsere Game-Pipeline"><AchievementUnlock /></StackCard>
      <StackCard title="Cross-Platform-Release"><CrossPlatformRelease /></StackCard>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }} className="asf-row">
      <StackCard title="Clean Gameplay-Code"><BugSquash /></StackCard>
      <StackCard title="Unsere Engines & Tools"><TechBelt tools={GAMING_BELT} /></StackCard>
      <StackCard title="60 FPS, garantiert"><FrameTimeBars /></StackCard>
    </div>
    <style>{`
      .gam-hud { display: flex; flex-direction: column; gap: 10px; width: 100%; padding: 0 6px; }
      .gam-hud-row { width: 100%; height: 10px; border-radius: 5px; background: rgba(255,255,255,0.08); overflow: hidden; }
      .gam-hud-bar { display: block; height: 100%; border-radius: 5px; transform-origin: left; }
      .gam-hud-hp { background: linear-gradient(90deg, #ef4444, #f87171); animation: gamHpDrain 3s ease-in-out infinite; }
      .gam-hud-mp { background: linear-gradient(90deg, #38bdf8, #818cf8); animation: gamMpDrain 3s ease-in-out infinite 0.3s; }
      @keyframes gamHpDrain { 0%, 100% { transform: scaleX(1); } 55% { transform: scaleX(0.35); } 75% { transform: scaleX(1); } }
      @keyframes gamMpDrain { 0%, 100% { transform: scaleX(1); } 55% { transform: scaleX(0.55); } 75% { transform: scaleX(1); } }

      .gam-achievement { position: relative; display: flex; align-items: center; justify-content: center; width: 100%; height: 50px; }
      .gam-achievement-toast { position: absolute; display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; color: var(--text-primary); background: rgba(255,107,0,0.12); border: 1px solid rgba(255,107,0,0.4); border-radius: 8px; padding: 6px 12px; opacity: 0; transform: scale(0.7); animation: gamAchievementPop 4.4s ease-in-out infinite; }
      .gam-trophy { font-size: 13px; }
      @keyframes gamAchievementPop { 0% { opacity: 0; transform: scale(0.7); } 6%, 20% { opacity: 1; transform: scale(1); } 28% { opacity: 0; transform: scale(0.9); } 100% { opacity: 0; } }

      .gam-platforms { display: flex; align-items: center; justify-content: center; gap: 12px; width: 100%; height: 60px; }
      .gam-platform-badge { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; animation: gamPlatformPulse 2.1s ease-in-out infinite; }
      .gam-platform-badge img { width: 18px; height: 18px; object-fit: contain; }
      @keyframes gamPlatformPulse { 0%, 100% { transform: scale(1); box-shadow: none; } 15% { transform: scale(1.18); box-shadow: 0 0 14px rgba(255,107,0,0.5); } 30% { transform: scale(1); } }

      .gam-bugsquash { position: relative; display: flex; flex-direction: column; align-items: center; gap: 6px; width: 100%; height: 55px; justify-content: center; }
      .gam-bug { font-size: 20px; animation: gamBugSquash 2.6s ease-in-out infinite; display: inline-block; }
      .gam-bug-check { position: absolute; top: 2px; font-size: 18px; color: #4ade80; opacity: 0; animation: gamBugCheck 2.6s ease-in-out infinite; }
      @keyframes gamBugSquash { 0%, 55% { opacity: 1; transform: scale(1) rotate(0deg); } 65% { opacity: 0; transform: scale(0.3) rotate(25deg); } 100% { opacity: 0; } }
      @keyframes gamBugCheck { 0%, 60% { opacity: 0; transform: scale(0.4); } 72%, 95% { opacity: 1; transform: scale(1); } 100% { opacity: 0; } }
      .gam-bug-label { font-size: 9px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }

      .gam-frametime { display: flex; flex-direction: column; align-items: center; gap: 6px; width: 100%; }
      .gam-frametime-bars { display: flex; align-items: flex-end; gap: 3px; height: 34px; }
      .gam-frametime-bar { width: 5px; height: 60%; border-radius: 2px; background: #4ade80; animation: gamFrameJitter 1.2s ease-in-out infinite; }
      @keyframes gamFrameJitter { 0%, 100% { height: 55%; } 50% { height: 75%; } }
      .gam-frametime-label { font-size: 12px; font-weight: 800; color: var(--text-primary); font-family: 'JetBrains Mono', monospace; }

      @media (prefers-reduced-motion: reduce) {
        .gam-hud-hp, .gam-hud-mp, .gam-achievement-toast, .gam-platform-badge, .gam-bug, .gam-bug-check, .gam-frametime-bar { animation: none !important; }
      }
    `}</style>
  </StackShowcaseSection>
);

export default GamingDevelopmentPage;
