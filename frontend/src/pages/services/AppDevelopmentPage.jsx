import React, { useState, useEffect, useRef } from 'react';
import {
  Smartphone,
  Apple,
  Zap,
  Code,
  Shield,
  Cloud,
  Users,
  TrendingUp,
  Layers,
  Rocket,
  Globe,
  Star,
  Sparkles,
  Bell,
  BarChart,
  RefreshCw,
  Lightbulb,
  Palette,
  Hammer,
  Bug,
  ShoppingBag,
  Heart,
  MessageCircle,
  Briefcase,
  BookOpen,
  Calendar,
  Truck,
  DollarSign,
  Activity,
  User,
  MessageSquare,
  Award,
  HeartHandshake,
  Database,
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
import { ModernBenefits } from '../../components/services/ModernBenefits';
import { useSectionReveal } from '../../components/services/useSectionReveal';
import ModernTimeline from '../../components/services/ModernTimeline';
import ServiceContactForm from '../../components/services/ServiceContactForm';
import ServiceAdvisorBlock from '../../components/tools/ServiceAdvisorBlock';
import ServicePortfolioSection from '../../components/services/ServicePortfolioSection';
import ServiceFAQ from '../../components/services/ServiceFAQ';
import TestimonialsMarquee from '../../components/common/TestimonialsMarquee';
import TestimonialForm from '../../components/common/TestimonialForm';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// ------------ Constants (real logos via devicon CDN) ------------
const DEVICON = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons';

const SERVICES = [
  { tabId: 'native', icon: Apple, title: 'iOS-App-Entwicklung', image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=700&q=80&auto=format&fit=crop',
    desc: 'Native iOS-Apps mit Swift und SwiftUI. Optimiert für iPhone, iPad und Apple Watch – inklusive App Store Veröffentlichung.',
    features: ['Swift & SwiftUI', 'iPhone · iPad · Watch', 'App Store Release', 'Push & In-App-Käufe'] },
  { tabId: 'native', icon: Smartphone, title: 'Android-App-Entwicklung', image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=700&q=80&auto=format&fit=crop',
    desc: 'Native Android-Apps mit Kotlin und Jetpack Compose. Performant, modern und perfekt für alle Android-Geräte.',
    features: ['Kotlin & Compose', 'Material Design 3', 'Play Store Release', 'Alle Android-Geräte'] },
  { tabId: 'native', icon: Layers, title: 'Cross-Platform-Apps', image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=700&q=80&auto=format&fit=crop',
    desc: 'Eine Codebasis für iOS und Android. Spart Zeit und Kosten ohne Kompromisse bei der User Experience.' },
  { tabId: 'native', icon: Code, logo: `${DEVICON}/flutter/flutter-original.svg`, brandColor: '#02569B', title: 'Flutter-Entwicklung', image: 'https://images.unsplash.com/photo-1526378722484-bd91ca387e72?w=700&q=80&auto=format&fit=crop',
    desc: 'Googles UI-Toolkit für native Performance auf allen Plattformen. Pixel-perfekte Designs mit Dart.' },
  { tabId: 'native', icon: Zap, logo: `${DEVICON}/react/react-original.svg`, brandColor: '#61DAFB', title: 'React Native Entwicklung', image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=700&q=80&auto=format&fit=crop',
    desc: 'JavaScript-basierte Cross-Platform-Apps mit nativer Performance. Ideal für schnelle Time-to-Market.' },
  { tabId: 'types', icon: Database, title: 'Mobile CRM Apps', image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=700&q=80&auto=format&fit=crop',
    desc: 'Maßgeschneiderte CRM-Anwendungen für Außendienst & Sales – Kundendaten, Notizen und Aufträge mobil im Griff.',
    features: ['Offline-Sync', 'Salesforce / HubSpot Integration', 'Push-Benachrichtigungen', 'DSGVO-konform'] },
  { tabId: 'types', icon: Cloud, title: 'SaaS Mobile Apps', image: 'https://images.unsplash.com/photo-1559028012-481c04fa702d?w=700&q=80&auto=format&fit=crop',
    desc: 'Mobile Erweiterungen für Ihre SaaS-Plattform – Subscriptions, In-App-Purchases & Echtzeit-Sync inklusive.',
    features: ['Stripe & RevenueCat', 'Realtime-Daten', 'Multi-Tenancy', 'Analytics-Tracking'] },
  { tabId: 'types', icon: Users, title: 'Kunden-Apps', image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=700&q=80&auto=format&fit=crop',
    desc: 'Loyalty-, Service- und Self-Service-Apps, die Ihre Kunden binden und Support-Kosten senken.',
    features: ['Treueprogramme', 'Push-Marketing', 'Personalisierung', 'In-App-Support'] },
  { tabId: 'types', icon: Briefcase, title: 'Mitarbeiter-Apps', image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=700&q=80&auto=format&fit=crop',
    desc: 'Interne Apps für Onboarding, Zeiterfassung, Aufgaben und Kommunikation – DSGVO-konform und Single-Sign-On.',
    features: ['Time-Tracking', 'Aufgaben-Workflows', 'SSO (Azure AD / Google)', 'MDM-fähig'] },
  { tabId: 'design', icon: Palette, title: 'UI/UX Design', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=700&q=80&auto=format&fit=crop',
    desc: 'Wireframes, Prototypen und Designsysteme. Wir gestalten Apps, die intuitiv sind und Nutzer begeistern.' },
  { tabId: 'design', icon: Globe, title: 'API-Integration', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=700&q=80&auto=format&fit=crop',
    desc: 'REST, GraphQL, OAuth, Stripe, Firebase – wir binden alles an, was Ihre App braucht.' },
  { tabId: 'ops', icon: Cloud, title: 'Backend-Entwicklung', image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=700&q=80&auto=format&fit=crop',
    desc: 'Skalierbare Server, Cloud-Funktionen, Datenbanken und Echtzeit-Sync für anspruchsvolle Apps.' },
  { tabId: 'ops', icon: RefreshCw, title: 'App-Wartung & Support', image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=700&q=80&auto=format&fit=crop',
    desc: 'Updates, Bugfixes, Store-Optimierung und Performance-Tuning – auch lange nach dem Launch.' },
];

const SERVICE_TABS = [
  { id: 'native', label: 'Native & Cross-Platform' },
  { id: 'types', label: 'App-Typen' },
  { id: 'design', label: 'Design & Integration' },
  { id: 'ops', label: 'Backend & Betrieb' },
];

const APP_LAUNCH_CODE = [
  { indent: 0, segments: [{ t: '@app.', c: '#FF6B00' }, { t: 'on_launch', c: '#61DAFB' }, { t: '()' }] },
  { indent: 0, segments: [{ t: 'async def', c: '#C678DD' }, { t: ' ' }, { t: 'bootstrap', c: '#61DAFB' }, { t: '(device: ' }, { t: 'Device', c: '#E5C07B' }, { t: '):' }] },
  { indent: 20, segments: [{ t: 'session = ' }, { t: 'await', c: '#C678DD' }, { t: ' auth.restore(device)' }] },
  { indent: 20, segments: [{ t: 'await', c: '#C678DD' }, { t: ' sync.pull(session)' }] },
  { indent: 20, segments: [{ t: 'return', c: '#C678DD' }, { t: ' push.register(device)' }] },
];

const TECHNOLOGIES = [
  { name: 'Flutter',       logo: `${DEVICON}/flutter/flutter-original.svg`,           color: '#02569B',
    desc: 'Googles Cross-Platform-Framework für native UIs aus einer Codebasis. Mit Dart und Hot-Reload extrem schnell.' },
  { name: 'React Native',  logo: `${DEVICON}/react/react-original.svg`,               color: '#61DAFB',
    desc: 'Cross-Platform mit JavaScript und React. Riesiges Ökosystem, breite Community und schnelle Entwicklung.' },
  { name: 'Swift',         logo: `${DEVICON}/swift/swift-original.svg`,               color: '#FA7343',
    desc: 'Apples moderne Sprache für iOS-Native. Sicher, performant und Standard für Premium-iOS-Apps.' },
  { name: 'Kotlin',        logo: `${DEVICON}/kotlin/kotlin-original.svg`,             color: '#7F52FF',
    desc: 'Offiziell empfohlene Sprache für Android. Modern, ausdrucksstark und vollständig interoperabel mit Java.' },
  { name: 'Firebase',      logo: `${DEVICON}/firebase/firebase-plain.svg`,            color: '#FFCA28',
    desc: 'Googles Backend-as-a-Service. Auth, Realtime DB, Cloud Functions, Push Notifications – alles aus einer Hand.' },
  { name: 'Node.js',       logo: `${DEVICON}/nodejs/nodejs-original.svg`,             color: '#339933',
    desc: 'JavaScript auf dem Server. Ideal für skalierbare APIs, WebSockets und Echtzeit-Funktionalitäten.' },
  { name: 'Python',        logo: `${DEVICON}/python/python-original.svg`,             color: '#3776AB',
    desc: 'Lesbar und mächtig. Mit FastAPI oder Django bauen wir robuste Backends in Rekordzeit.' },
  { name: 'REST APIs',     logo: `${DEVICON}/fastapi/fastapi-original.svg`,           color: '#009688',
    desc: 'Klassischer Industriestandard für die Kommunikation zwischen App und Server – einfach, robust und überall verfügbar.' },
  { name: 'GraphQL',       logo: `${DEVICON}/graphql/graphql-plain.svg`,              color: '#E10098',
    desc: 'Moderne Query-Sprache für APIs. Holt genau die Daten, die die App braucht – nicht mehr, nicht weniger.' },
  { name: 'AWS',           logo: `${DEVICON}/amazonwebservices/amazonwebservices-original-wordmark.svg`, color: '#FF9900',
    desc: 'Die weltweit führende Cloud-Plattform. Lambda, S3, Cognito und mehr für skalierbare App-Backends.' },
];

const APP_PLATFORMS = [
  { name: 'iOS (Native)', logo: `${DEVICON}/apple/apple-original.svg`, color: '#FFFFFF',
    reach: 'Premium-Nutzer', performance: 'Maximal', cost: 'Hoch',
    desc: 'Beste Performance und Design-Konsistenz für Apple-Nutzer – der Standard für Premium-Apps.' },
  { name: 'Android (Native)', logo: `${DEVICON}/android/android-original.svg`, color: '#3DDC84',
    reach: 'Größter Marktanteil', performance: 'Maximal', cost: 'Hoch',
    desc: 'Höchste globale Reichweite – unverzichtbar für Massenmarkt-Apps.' },
  { name: 'Cross-Platform', logo: `${DEVICON}/flutter/flutter-original.svg`, color: '#02569B',
    reach: 'iOS + Android', performance: 'Sehr gut', cost: 'Mittel',
    desc: 'Eine Codebasis für beide Plattformen – schnellere Entwicklung bei nahezu nativer Qualität.' },
  { name: 'Progressive Web App', logo: `${DEVICON}/chrome/chrome-original.svg`, color: '#4285F4',
    reach: 'Jeder Browser', performance: 'Gut', cost: 'Niedrig',
    desc: 'Läuft im Browser, installierbar ohne App Store – ideal für schnelle Markteinführung.' },
];

const PROCESS_STEPS = [
  { icon: Lightbulb, title: 'Analyse & Beratung', duration: '1–2 Wochen',
    desc: 'Wir hören zu, verstehen Ihre Ziele, analysieren den Markt und definieren gemeinsam die App-Strategie.',
    deliverables: ['Marktanalyse & Wettbewerb', 'Zielgruppen-Personas', 'App-Strategie-Dokument'],
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&q=80&auto=format&fit=crop' },
  { icon: Sparkles, title: 'Konzeption', duration: '1–2 Wochen',
    desc: 'Features, User Stories, Information Architecture und technische Roadmap – alles vor der ersten Codezeile.',
    deliverables: ['Feature-Backlog', 'User-Stories & Flows', 'Tech-Stack-Auswahl'],
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80&auto=format&fit=crop' },
  { icon: Palette, title: 'UI/UX Design', duration: '2–4 Wochen',
    desc: 'Wireframes, hochauflösende Mockups und interaktive Prototypen – jeder Screen wird vor der Entwicklung geprüft.',
    deliverables: ['Wireframes', 'Pixel-perfekte Mockups', 'Klickbarer Figma-Prototyp'],
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80&auto=format&fit=crop' },
  { icon: Hammer, title: 'Entwicklung', duration: '8–16 Wochen',
    desc: 'Agile Sprints, wöchentliche Demos, sauberer Code. Frontend, Backend und APIs greifen perfekt ineinander.',
    deliverables: ['2-Wochen-Sprints mit Demo', 'Native iOS & Android Build', 'Backend-API & Admin-Panel'],
    image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&q=80&auto=format&fit=crop' },
  { icon: Bug, title: 'Testing & QA', duration: '2–3 Wochen',
    desc: 'Unit-, Integrations- und End-to-End-Tests auf echten Geräten. Beta-Programm mit echten Nutzern.',
    deliverables: ['Automatisierte Test-Suite', 'TestFlight & Play Beta', 'QA-Report & Bug-Triage'],
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=80&auto=format&fit=crop' },
  { icon: Rocket, title: 'Store-Veröffentlichung', duration: '1–2 Wochen',
    desc: 'Wir kümmern uns um App Store Connect und Google Play Console – inkl. Review-Prozess und Launch-Day.',
    deliverables: ['Store-Listing & Screenshots', 'ASO-Optimierung', 'Launch-Day-Support'],
    image: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=600&q=80&auto=format&fit=crop' },
  { icon: RefreshCw, title: 'Wartung & Updates', duration: 'Laufend',
    desc: 'Monitoring, Performance-Tuning, neue Features und schnelle Bugfixes. Wir bleiben langfristig an Ihrer Seite.',
    deliverables: ['Crash- & Performance-Monitoring', 'Regelmäßige Feature-Updates', 'Priority-Bugfix-SLA'],
    image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&q=80&auto=format&fit=crop' },
];

const APP_CATEGORIES = [
  { icon: ShoppingBag, title: 'E-Commerce Apps', tag: 'Commerce',
    desc: 'Mobile Shops mit Payment, Wunschlisten, Push-Promotions und nahtloser Checkout-Experience.',
    img: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&q=80&auto=format&fit=crop' },
  { icon: Activity, title: 'Fitness Apps', tag: 'Health',
    desc: 'Workout-Tracking, Health-Kit-Integration, personalisierte Pläne und Community-Features.',
    img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=900&q=80&auto=format&fit=crop' },
  { icon: MessageCircle, title: 'Social Media Apps', tag: 'Social',
    desc: 'Feeds, Stories, Chats und Push-Notifications – skalierbar für Millionen von Nutzern.',
    img: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=900&q=80&auto=format&fit=crop' },
  { icon: Briefcase, title: 'Unternehmens-Apps', tag: 'Enterprise',
    desc: 'Interne Tools für Mitarbeiter: CRM, Field Service, Lagerverwaltung und Workflow-Automatisierung.',
    img: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=900&q=80&auto=format&fit=crop' },
  { icon: BookOpen, title: 'Lern-Apps', tag: 'Education',
    desc: 'E-Learning mit Video-Streaming, Quizzen, Gamification und Fortschritts-Tracking.',
    img: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=900&q=80&auto=format&fit=crop' },
  { icon: Calendar, title: 'Buchungs-Apps', tag: 'Booking',
    desc: 'Termine, Reisen, Restaurants – mit Echtzeit-Verfügbarkeit, Payment und Erinnerungen.',
    img: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=900&q=80&auto=format&fit=crop' },
  { icon: Truck, title: 'Liefer-Apps', tag: 'Delivery',
    desc: 'Live-Tracking, Routing, Driver-Apps und Kunden-App – ein komplettes Liefer-Ökosystem.',
    img: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=900&q=80&auto=format&fit=crop' },
  { icon: DollarSign, title: 'Finanz-Apps', tag: 'Finance',
    desc: 'Banking, Wallets, Trading und Budget-Tracking – mit höchsten Sicherheits- und Compliance-Standards.',
    img: 'https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=900&q=80&auto=format&fit=crop' },
  { icon: Heart, title: 'Gesundheits-Apps', tag: 'Healthcare',
    desc: 'Telemedizin, Patient-Records, Medikamenten-Erinnerungen – HIPAA- und DSGVO-konform.',
    img: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=900&q=80&auto=format&fit=crop' },
];

const BENEFITS = [
  { icon: HeartHandshake, title: 'Höhere Kundenbindung',     desc: 'Eine App ist immer dabei – als Icon auf dem Homescreen Ihrer Kunden.', points: ['Dauerhafte Markenpräsenz', 'Loyalty- & Bonus-Programme', 'Personalisierte Inhalte'] },
  { icon: MessageSquare,  title: 'Direkte Kommunikation',    desc: 'In-App-Chats, Updates und News ohne Algorithmus-Filter wie bei Social Media.', points: ['Kein Reichweiten-Verlust', 'Direkter Kundenkanal', 'Echtzeit-Nachrichten'] },
  { icon: Bell,           title: 'Push-Benachrichtigungen',  desc: 'Erreichen Sie Ihre Nutzer punktgenau – mit 90%+ Öffnungsrate.', points: ['Segmentierte Kampagnen', 'Geo- & Event-Trigger', 'Hohe Öffnungsraten'] },
  { icon: TrendingUp,     title: 'Mehr Umsatz',              desc: 'Mobile Commerce wächst exponentiell. Apps konvertieren bis zu 3× besser als Mobile-Websites.', points: ['Höhere Conversion', 'One-Click-Checkout', 'Mehr Wiederkäufe'] },
  { icon: Sparkles,       title: 'Stärkere Markenpräsenz',   desc: 'Ein App-Icon auf Millionen Geräten ist die beste Visitenkarte für Ihre Marke.', points: ['Premium-Wahrnehmung', 'Wettbewerbsvorteil', 'Marken-Touchpoint'] },
  { icon: Award,          title: 'Bessere Nutzererfahrung',  desc: 'Native Animationen, Offline-Modus und Hardware-Zugriff – das schafft nur eine App.', points: ['Flüssige 60fps-UI', 'Offline-Funktionen', 'Kamera, GPS & Sensoren'] },
  { icon: RefreshCw,      title: 'Automatisierung',          desc: 'Push, Buchungen, Zahlungen, Erinnerungen – alles läuft automatisch im Hintergrund.', points: ['Automatische Workflows', 'Weniger manueller Aufwand', 'Hintergrund-Sync'] },
  { icon: BarChart,       title: 'Daten & Analytics',        desc: 'User-Verhalten verstehen, Funnels optimieren, datenbasiert entscheiden.', points: ['Verhaltens-Tracking', 'Funnel-Analysen', 'A/B-Testing'] },
];

const PROJECTS = [
  { title: 'FitCoach Pro', tag: 'Fitness', stats: '120k Downloads · 4.8★',
    desc: 'Personal-Trainer-App mit KI-gestützten Workouts, Apple Watch Integration und Live-Coaching.',
    img: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=900&q=80&auto=format&fit=crop' },
  { title: 'Shophouse', tag: 'E-Commerce', stats: '+220% Conversion',
    desc: 'Premium E-Commerce-App für ein Modelabel – inkl. AR-Try-On und One-Click-Checkout.',
    img: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=900&q=80&auto=format&fit=crop' },
  { title: 'MediCare', tag: 'Healthcare', stats: 'HIPAA-zertifiziert',
    desc: 'Telemedizin-App für eine Klinikgruppe mit Video-Sprechstunden und Rezept-Management.',
    img: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=900&q=80&auto=format&fit=crop' },
  { title: 'RouteFlow', tag: 'Delivery', stats: '10k+ Fahrer',
    desc: 'Liefer-Plattform für eine Logistik-Firma – Echtzeit-Routing, Driver-App und Customer-App.',
    img: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=900&q=80&auto=format&fit=crop' },
];

const REVIEWS = [
  { name: 'Markus Hoffmann', company: 'CEO, TechVision GmbH', rating: 5,
    img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&q=80&auto=format&fit=crop',
    text: 'Zebick hat unsere Vision in eine App verwandelt, die unsere Kunden lieben. 4.9 Sterne im Store sprechen für sich.' },
  { name: 'Sarah Becker', company: 'Gründerin, FitLife', rating: 5,
    img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80&auto=format&fit=crop',
    text: 'Vom ersten Workshop bis zum Launch war alles professionell. Die App läuft seit 2 Jahren stabil ohne einen Crash.' },
  { name: 'Daniel Krause', company: 'CTO, ShopHouse', rating: 5,
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80&auto=format&fit=crop',
    text: 'Die Conversion ist seit dem App-Relaunch um 220% gestiegen. Klare Empfehlung für jeden Mobile-Commerce-Player.' },
  { name: 'Julia Weber', company: 'COO, MediCare', rating: 5,
    img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80&auto=format&fit=crop',
    text: 'Höchst sensibler Gesundheitsbereich – Zebick hat alle Compliance-Anforderungen souverän gemeistert.' },
  { name: 'Tobias Lehmann', company: 'Founder, RouteFlow', rating: 5,
    img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&q=80&auto=format&fit=crop',
    text: 'Zwei Apps gleichzeitig launchen, ohne Verzögerung – das hätte ich keinem anderen Team zugetraut.' },
  { name: 'Anna Schulz', company: 'Marketing Lead, BookStay', rating: 5,
    img: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&q=80&auto=format&fit=crop',
    text: 'Klare Kommunikation, transparente Zeitplanung und ein Ergebnis, das alle Erwartungen übertroffen hat.' },
];

const FAQ = [
  { q: 'Was kostet die Entwicklung einer App?',
    a: 'Eine einfache App startet bei etwa 7.900€, komplexe Business-Apps liegen typischerweise zwischen 20.000€ und 80.000€. Wir geben nach dem ersten Workshop ein verbindliches Festpreis-Angebot.' },
  { q: 'Wie lange dauert die Entwicklung einer App?',
    a: 'Vom Kick-off bis zum Launch im Store rechnen wir mit 8–16 Wochen. Kleinere MVPs schaffen wir in 6 Wochen, größere Plattformen brauchen 4–6 Monate.' },
  { q: 'Für welche Plattformen entwickelt ihr?',
    a: 'iOS, Android und beide gleichzeitig (Cross-Platform mit Flutter oder React Native). Auf Wunsch auch Wearables wie Apple Watch oder Wear OS.' },
  { q: 'Werden auch Updates und Wartung angeboten?',
    a: 'Ja. Wir bieten Wartungspakete ab 290€/Monat mit Monitoring, Bugfixes, OS-Updates und kleinen Feature-Erweiterungen.' },
  { q: 'Kann eine bestehende App von euch erweitert werden?',
    a: 'Absolut. Wir führen Code-Audits durch, integrieren uns in bestehende Teams oder übernehmen die Weiterentwicklung komplett.' },
  { q: 'Ist eine App für mein Unternehmen überhaupt sinnvoll?',
    a: 'Das klären wir im kostenlosen Erstgespräch ehrlich. Manchmal ist eine PWA oder eine bessere Website der bessere Weg – wir empfehlen das, was Ihnen wirklich hilft.' },
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
const APPDEVELOPMENTPAGE_JSONLD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Service',
      name: 'App-Entwicklung',
      serviceType: 'App-Entwicklung',
      provider: { '@type': 'ProfessionalService', name: 'Zebick', url: SITE_URL },
      areaServed: 'CH',
      url: `${SITE_URL}/services/app-entwicklung`,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Startseite', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Services', item: `${SITE_URL}/services` },
        { '@type': 'ListItem', position: 3, name: 'App-Entwicklung', item: `${SITE_URL}/services/app-entwicklung` },
      ],
    },
  ],
};

const APPDEVELOPMENTPAGE_RELATED = [{ label: "UI/UX Design", path: "/services/ui-ux-design" }, { label: "Chatbot-Entwicklung", path: "/services/chatbot-entwicklung" }, { label: "Server & Systeme", path: "/services/server-systeme" }];

const AppDevelopmentPage = () => {
  const pageRef = useRef(null);
  const [activeProcess, setActiveProcess] = useState(0);
  const [testimonials, setTestimonials] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/testimonials/approved`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setTestimonials(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  // Auto-advance process
  useEffect(() => {
    const id = setInterval(() => setActiveProcess(p => (p + 1) % PROCESS_STEPS.length), 3500);
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
    <div className="page-transition" ref={pageRef}>
      <Header />
      <TestimonialForm isOpen={showReviewForm} onClose={() => setShowReviewForm(false)} />
      <Seo
        title="App-Entwicklung für iOS & Android"
        description="Native und Cross-Platform Apps für iOS und Android – von der Idee bis zum Launch im App Store und Play Store."
        path="/services/app-entwicklung"
        jsonLd={APPDEVELOPMENTPAGE_JSONLD}
      />

      <div className="sr-only"><h1>App-Entwicklung für iOS & Android</h1></div>

      <ServiceAdvisorBlock serviceId="app-development" />


      {/* ========== WARUM APP-ENTWICKLUNG ========== */}
      <section className="section" data-testid="section-why-appdev" style={{ padding: '120px 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '15%', right: '5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(255,107,0,0.07) 0%, transparent 60%)', filter: 'blur(100px)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative' }}>
          <div className="why-appdev-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center' }}>

            <div data-reveal style={{ opacity: 0, transform: 'translateY(30px)', transition: 'all 0.8s ease' }}>
              {sectionLabel('Warum App-Entwicklung?')}
              <h2 className="heading-1" style={{ fontSize: '48px', fontWeight: 900, lineHeight: 1.1, marginBottom: '24px' }}>
                Ihre Marke in der<br /><span className="text-gradient">Hosentasche Ihrer Kunden.</span>
              </h2>
              <p style={{ fontSize: '17px', color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '40px' }}>
                Eine App ist der direkteste Draht zu Ihren Kunden: jederzeit verfügbar, Push-Benachrichtigungen, Offline-Modus
                und ein Markenerlebnis, das Loyalität schafft. Wer im mobilen Zeitalter relevant bleiben will, braucht eine App.
              </p>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div className="svc-store-badge" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 22px', background: '#000', border: '1px solid #333', borderRadius: 'var(--radius-md)', transition: 'all 0.25s ease' }}>
                  <Apple size={26} color="#fff" />
                  <div>
                    <div style={{ fontSize: '10px', color: '#ccc', lineHeight: 1 }}>Download on the</div>
                    <div style={{ fontSize: '17px', fontWeight: 700, color: '#fff', marginTop: '3px', lineHeight: 1 }}>App Store</div>
                  </div>
                </div>
                <div className="svc-store-badge" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 22px', background: '#000', border: '1px solid #333', borderRadius: 'var(--radius-md)', transition: 'all 0.25s ease' }}>
                  <svg width="22" height="24" viewBox="0 0 22 24" aria-hidden="true">
                    <defs>
                      <linearGradient id="playBadgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#00D4FF" />
                        <stop offset="35%" stopColor="#00E676" />
                        <stop offset="65%" stopColor="#FFCA28" />
                        <stop offset="100%" stopColor="#FF3D00" />
                      </linearGradient>
                    </defs>
                    <path d="M1 1 L1 23 L21 12 Z" fill="url(#playBadgeGrad)" />
                  </svg>
                  <div>
                    <div style={{ fontSize: '10px', color: '#ccc', lineHeight: 1 }}>JETZT BEI</div>
                    <div style={{ fontSize: '17px', fontWeight: 700, color: '#fff', marginTop: '3px', lineHeight: 1 }}>Google Play</div>
                  </div>
                </div>
              </div>
            </div>

            {/* PHONE MOCKUP — two staggered phones: Home Screen behind, App Store listing in front */}
            <div data-reveal className="appdev-phone-wrap" style={{ opacity: 0, transform: 'translateY(30px)', transition: 'all 0.8s 0.15s ease', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div className="appdev-phone-float" style={{ position: 'relative', width: '380px', height: '640px' }}>
                <div style={{ position: 'absolute', inset: '-40px', background: 'radial-gradient(circle, rgba(255,107,0,0.25) 0%, transparent 60%)', filter: 'blur(40px)', borderRadius: '50%' }} />

                {/* Back phone — Home Screen with app grid + dock */}
                <div style={{ position: 'absolute', top: '0', left: '0', width: '210px', height: '420px', transform: 'rotate(-10deg)', zIndex: 1 }}>
                  <div style={{ position: 'relative', width: '100%', height: '100%', background: 'linear-gradient(145deg, #1a1a1a 0%, #0a0a0a 100%)', borderRadius: '34px', border: '2px solid #2a2a2a', boxShadow: '0 20px 50px rgba(0,0,0,0.5), inset 0 0 0 5px #000', padding: '10px 7px' }}>
                    <div style={{ position: 'absolute', top: '14px', left: '50%', transform: 'translateX(-50%)', width: '78px', height: '20px', background: '#000', borderRadius: '14px', zIndex: 3 }} />
                    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(180deg, #16181d 0%, #0a0a0c 100%)', borderRadius: '24px', overflow: 'hidden', position: 'relative' }}>
                      <div style={{ height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px', fontSize: '9px', color: '#fff', fontWeight: 600 }}>
                        <span>9:41</span>
                        <span style={{ fontSize: '8px' }}>●●●● 5G</span>
                      </div>
                      <div style={{ padding: '16px 16px 0', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px 9px' }}>
                        {[
                          { icon: Bell, color: '#EF4444' },
                          { icon: MessageCircle, color: '#22C55E' },
                          { icon: Calendar, color: '#FF6B00' },
                          { icon: ShoppingBag, color: '#A855F7' },
                          { icon: Heart, color: '#EC4899' },
                          { icon: BarChart, color: '#6366F1' },
                          { icon: Globe, color: '#06B6D4' },
                          { icon: DollarSign, color: '#10B981' },
                        ].map((app, i) => (
                          <div key={i} style={{ width: '38px', height: '38px', borderRadius: '10px', background: app.color, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 10px ${app.color}50` }}>
                            <app.icon size={17} color="#fff" strokeWidth={2} />
                          </div>
                        ))}
                      </div>
                      <div style={{ position: 'absolute', bottom: '10px', left: '10px', right: '10px', height: '52px', background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '0 8px' }}>
                        {[
                          { icon: User, color: '#3B82F6' },
                          { icon: MessageSquare, color: '#14B8A6' },
                          { icon: Database, color: '#64748B' },
                          { icon: Briefcase, color: '#F59E0B' },
                        ].map((app, i) => (
                          <div key={i} style={{ width: '34px', height: '34px', borderRadius: '9px', background: app.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <app.icon size={16} color="#fff" strokeWidth={2} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Front phone — App Store listing */}
                <div style={{ position: 'absolute', bottom: '0', right: '0', width: '300px', height: '600px', zIndex: 2 }}>
                {/* Side buttons — mute switch, volume rocker (left), power button (right) */}
                <div style={{ position: 'absolute', left: '-3px', top: '118px', width: '3px', height: '26px', background: '#2a2a2a', borderRadius: '2px 0 0 2px' }} />
                <div style={{ position: 'absolute', left: '-3px', top: '168px', width: '3px', height: '52px', background: '#2a2a2a', borderRadius: '2px 0 0 2px' }} />
                <div style={{ position: 'absolute', left: '-3px', top: '232px', width: '3px', height: '52px', background: '#2a2a2a', borderRadius: '2px 0 0 2px' }} />
                <div style={{ position: 'absolute', right: '-3px', top: '180px', width: '3px', height: '78px', background: '#2a2a2a', borderRadius: '0 2px 2px 0' }} />
                <div style={{ position: 'relative', width: '100%', height: '100%', background: 'linear-gradient(145deg, #1a1a1a 0%, #0a0a0a 100%)', borderRadius: '46px', border: '2px solid #2a2a2a', boxShadow: '0 30px 80px rgba(0,0,0,0.6), inset 0 0 0 6px #000', padding: '14px 10px' }}>
                  <div style={{ position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', width: '110px', height: '28px', background: '#000', borderRadius: '20px', zIndex: 3 }} />
                  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(180deg, #0f0f10 0%, #050505 100%)', borderRadius: '34px', overflow: 'hidden', position: 'relative' }}>
                    <div style={{ height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 26px 0 28px', fontSize: '12px', color: '#fff', fontWeight: 600 }}>
                      <span>9:41</span>
                      <span style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <span style={{ fontSize: '10px' }}>●●●●</span>
                        <span style={{ fontSize: '10px' }}>5G</span>
                      </span>
                    </div>
                    <div style={{ padding: '20px 20px 16px', display: 'flex', alignItems: 'center', gap: '14px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ width: '64px', height: '64px', borderRadius: '14px', background: 'linear-gradient(135deg, var(--accent-primary), #cc5500)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(255,107,0,0.4)' }}>
                        <Smartphone size={28} color="#000" strokeWidth={2.5} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>Your App</div>
                        <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>Lifestyle · Business</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginTop: '6px' }}>
                          {Array.from({ length: 5 }).map((_, k) => (<Star key={k} className="appdev-star-pop" style={{ animationDelay: `${0.4 + k * 0.08}s` }} size={11} fill="#FF6B00" color="#FF6B00" strokeWidth={0} />))}
                          <span style={{ fontSize: '10px', color: '#888', marginLeft: '6px' }}>4,9 · 12K</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ padding: '14px 20px 6px' }}>
                      <div className="appdev-install-btn" style={{ padding: '12px', background: 'linear-gradient(135deg, var(--accent-primary), #cc5500)', borderRadius: '10px', textAlign: 'center', color: '#000', fontSize: '13px', fontWeight: 800, boxShadow: '0 6px 16px rgba(255,107,0,0.4)', position: 'relative', overflow: 'hidden' }}>Installieren</div>
                    </div>
                    <div style={{ padding: '12px 20px 12px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      {[{ l: 'DOWNLOADS', v: '500K+' }, { l: 'GRÖSSE', v: '24 MB' }, { l: 'ALTER', v: '12+' }].map((s, k) => (
                        <div key={k} style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '14px', color: '#fff', fontWeight: 700 }}>{s.v}</div>
                          <div style={{ fontSize: '8px', color: '#666', marginTop: '4px', letterSpacing: '0.05em' }}>{s.l}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ padding: '14px 20px 8px' }}>
                      <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px', fontWeight: 700 }}>Ähnliche Apps</div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        {[
                          { icon: Rocket, color: '#FF6B00' },
                          { icon: Code, color: '#00B4D8' },
                          { icon: Shield, color: '#22C55E' },
                          { icon: Palette, color: '#A855F7' },
                        ].map((app, k) => (
                          <div key={k} style={{ width: '48px', height: '48px', borderRadius: '12px', background: app.color, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 12px ${app.color}50` }}>
                            <app.icon size={22} color="#fff" strokeWidth={2} />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ padding: '6px 20px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {[
                        { tag: 'Native', color: '#FF6B00' },
                        { tag: 'Cross-Platform', color: '#00B4D8' },
                        { tag: 'Schnell', color: '#A855F7' },
                      ].map(({ tag, color }) => (
                        <span key={tag} style={{ padding: '4px 10px', background: `${color}1F`, border: `1px solid ${color}4D`, borderRadius: '999px', color, fontSize: '9px', fontWeight: 700, letterSpacing: '0.05em' }}>{tag}</span>
                      ))}
                    </div>
                    <div style={{ padding: '14px 20px 0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#888', marginBottom: '6px' }}>
                        <span>Wird heruntergeladen …</span><span className="appdev-progress-pct">87%</span>
                      </div>
                      <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div className="appdev-progress-bar" style={{ height: '100%', background: 'linear-gradient(90deg, var(--accent-primary), #FFCA28)', borderRadius: '3px' }} />
                      </div>
                    </div>
                  </div>
                </div>
                </div>
              </div>
            </div>

          </div>
        </div>
        <style>{`
          @media (max-width: 900px) { .why-appdev-grid { grid-template-columns: 1fr !important; gap: 48px !important; } }
          .svc-store-badge:hover { border-color: #666 !important; transform: translateY(-3px); }
          @media (max-width: 640px) {
            .svc-store-badge { padding: 10px 16px !important; gap: 10px !important; }
            .appdev-phone-wrap { height: 416px !important; overflow: hidden; }
            .appdev-phone-float { animation: none !important; transform: scale(0.65); }
          }
          @keyframes appdevFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }
          .appdev-phone-float { animation: appdevFloat 4.5s ease-in-out infinite; }
          @keyframes appdevStarPop { from { opacity: 0; transform: scale(0); } to { opacity: 1; transform: scale(1); } }
          .appdev-star-pop { animation: appdevStarPop 0.35s cubic-bezier(0.34,1.56,0.64,1) both; }
          .appdev-install-btn::after { content: ''; position: absolute; top: 0; left: -150%; width: 60%; height: 100%; background: linear-gradient(120deg, transparent, rgba(255,255,255,0.55), transparent); animation: appdevShine 2.8s ease-in-out infinite; }
          @keyframes appdevShine { to { left: 150%; } }
          .appdev-progress-bar { width: 0; animation: appdevProgress 2.6s ease-in-out infinite; }
          @keyframes appdevProgress { 0% { width: 0; } 70% { width: 87%; } 100% { width: 87%; } }
          .appdev-progress-pct { animation: appdevBlink 1s ease-in-out infinite; }
          @keyframes appdevBlink { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
          @media (prefers-reduced-motion: reduce) {
            .appdev-phone-float, .appdev-star-pop, .appdev-install-btn::after, .appdev-progress-bar, .appdev-progress-pct { animation: none !important; opacity: 1 !important; }
            .appdev-progress-bar { width: 87% !important; }
          }
        `}</style>
      </section>

      {/* ========== STACK-SHOWCASE ========== */}
      <AppStackShowcase />

      {/* ========== LEISTUNGSSPEKTRUM ========== */}
      <section className="section" data-testid="section-leistungsspektrum" style={{ padding: '120px 0', background: 'var(--bg-secondary)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '20%', right: '-150px', width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(255,107,0,0.06) 0%, transparent 60%)', filter: 'blur(100px)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '60px', alignItems: 'center', marginBottom: '72px' }}>
            <div data-reveal style={{ opacity: 0, transform: 'translateY(30px)', transition: 'all 0.8s ease' }}>
              {sectionLabel('Leistungsspektrum')}
              <h2 className="heading-1" style={{ fontSize: '44px', fontWeight: 900, marginBottom: '20px', lineHeight: 1.1 }}>
                App-Entwicklung, <span className="text-gradient">komplett gedacht</span>
              </h2>
              <p style={{ fontSize: '17px', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                Von nativer Entwicklung über App-Typen bis Design und Betrieb – bei uns greift alles ineinander,
                statt isolierter Gewerke bekommen Sie Ihre App aus einer Hand.
              </p>
            </div>
            <div data-reveal style={{ opacity: 0, transform: 'translateY(30px)', transition: 'all 0.8s 0.15s ease', ...baseCard, padding: '32px', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', lineHeight: 1.8 }}>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FF5F57' }} />
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FFBD2E' }} />
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#28CA42' }} />
                <span style={{ marginLeft: '12px', color: 'var(--text-muted)', fontSize: '12px' }}>app_launch.py</span>
              </div>
              <TypingCode lines={APP_LAUNCH_CODE} />
            </div>
          </div>

          <ServiceTabsGrid tabs={SERVICE_TABS} services={SERVICES} />
        </div>
      </section>

      {/* ========== TECHNOLOGIEN ========== */}
      <section className="section" data-testid="section-technologies" style={{ background: 'var(--bg-secondary)', padding: '120px 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '20%', right: '-100px', width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(255,107,0,0.08) 0%, transparent 60%)', filter: 'blur(100px)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative' }}>
          <div style={{ textAlign: 'center', marginBottom: '72px', opacity: 0, transform: 'translateY(30px)', transition: 'all 0.8s ease' }} data-reveal>
            {sectionLabel('Technologien')}
            <h2 className="heading-1" style={{ fontSize: '48px', fontWeight: 900, marginBottom: '20px' }}>
              Modernste Tools und Frameworks
            </h2>
            <p style={{ fontSize: '17px', color: 'var(--text-muted)', maxWidth: '640px', margin: '0 auto' }}>
              Wir wählen die Technologie passend zum Projekt – nicht umgekehrt. Hier eine Auswahl aus unserem Stack.
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
            <h2 className="heading-1" style={{ fontSize: '44px', fontWeight: 900, marginBottom: '16px' }}>Wo <span className="text-gradient">Ihre App lebt.</span></h2>
            <p style={{ fontSize: '17px', color: 'var(--text-muted)', maxWidth: '640px', margin: '0 auto', lineHeight: 1.7 }}>
              Die richtige Plattform entscheidet über Reichweite, Kosten und Nutzererlebnis Ihrer App.
            </p>
          </div>

          <div className="compare-grid" data-keep-grid style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '56px' }}>
            {APP_PLATFORMS.map((p, i) => (
              <div key={p.name} data-reveal style={{ ...baseCard, padding: '28px', opacity: 0, transform: 'translateY(30px)', transition: `all 0.8s ${i * 0.08}s ease` }}
                   onMouseEnter={(e) => { e.currentTarget.style.borderColor = p.color; e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = `0 20px 40px ${p.color}25`; }}
                   onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                  <img src={p.logo} alt={p.name} width="44" height="44" loading="lazy" style={{ objectFit: 'contain' }} />
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700 }}>{p.name}</h3>
                    <span style={{ fontSize: '12px', color: p.color }}>{p.reach}</span>
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
                    {['Plattform', 'Reichweite', 'Performance', 'Kosten'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '20px 24px', fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent-primary)', fontWeight: 600, borderBottom: '1px solid var(--border-subtle)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {APP_PLATFORMS.map((p, i) => (
                    <tr key={p.name} style={{ borderBottom: i < APP_PLATFORMS.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                      <td style={{ padding: '20px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img src={p.logo} alt={p.name} width="28" height="28" loading="lazy" style={{ objectFit: 'contain' }} />
                          <span style={{ fontWeight: 600 }}>{p.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '20px 24px', color: 'var(--text-secondary)' }}>{p.reach}</td>
                      <td style={{ padding: '20px 24px', color: 'var(--text-muted)', fontSize: '14px' }}>{p.performance}</td>
                      <td style={{ padding: '20px 24px', color: 'var(--text-secondary)' }}>{p.cost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ========== ENTWICKLUNGSPROZESS (TIMELINE) ========== */}
      <ModernTimeline
        eyebrow="Entwicklungsprozess"
        title="Von der Idee zum App Store"
        subtitle="7 strukturierte Phasen für ein vorhersehbares, erfolgreiches Ergebnis."
        steps={PROCESS_STEPS}
      />

      {/* ========== APP KATEGORIEN ========== */}
      <section className="section" data-testid="section-categories" style={{ background: 'var(--bg-secondary)', padding: '120px 0', position: 'relative' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '72px', opacity: 0, transform: 'translateY(30px)', transition: 'all 0.8s ease' }} data-reveal>
            {sectionLabel('App-Kategorien')}
            <h2 className="heading-1" style={{ fontSize: '48px', fontWeight: 900, marginBottom: '20px' }}>
              Apps für jede Branche
            </h2>
            <p style={{ fontSize: '17px', color: 'var(--text-muted)', maxWidth: '640px', margin: '0 auto' }}>
              Vom Startup-MVP bis zur Enterprise-Lösung – wir haben Erfahrung in jeder App-Kategorie.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {APP_CATEGORIES.map((c, i) => (
              <div key={i} data-reveal style={{
                ...baseCard, padding: 0, overflow: 'hidden',
                opacity: 0, transform: 'translateY(30px)', transition: `all 0.6s ${0.04 * i}s ease`,
              }}
                   onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.transform = 'translateY(-6px)'; }}
                   onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
                  <img src={c.img} alt={c.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
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
                  }}>{c.tag}</div>
                  <div style={{
                    position: 'absolute', bottom: '16px', left: '16px',
                    width: '44px', height: '44px',
                    background: 'rgba(255,107,0,0.9)', borderRadius: 'var(--radius-md)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <c.icon size={22} color="#000" />
                  </div>
                </div>
                <div style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '10px' }}>{c.title}</h3>
                  <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '14px' }}>{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== VORTEILE ========== */}
      <ModernBenefits
        eyebrow="Vorteile"
        title="Was eine eigene App bringt"
        accentWord="eigene App"
        subtitle="Eine App ist eine Investition – und sie zahlt sich messbar aus."
        items={BENEFITS}
        image="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=900&q=80&auto=format&fit=crop"
        testid="section-benefits"
      />

      {/* ========== REFERENZEN & PROJEKTE — aus Portfolio (Admin) ========== */}
      <ServicePortfolioSection
        serviceId="app-development"
        fallbackExamples={PROJECTS}
        eyebrow="Referenzen & Projekte"
        title="Apps, die echte"
        accentWord="Ergebnisse liefern"
        subtitle="Eine kleine Auswahl an Projekten – von der Idee bis zum Erfolg im Store."
        testid="section-projects"
        showCategoryFilter
      />

      {/* ========== KUNDENBEWERTUNGEN ========== */}
      <section className="section" data-testid="section-reviews" style={{ padding: '120px 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: '-100px', right: '-100px', width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(255,107,0,0.06) 0%, transparent 60%)', filter: 'blur(100px)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative' }}>
          <div style={{ textAlign: 'center', marginBottom: '72px', opacity: 0, transform: 'translateY(30px)', transition: 'all 0.8s ease' }} data-reveal>
            {sectionLabel('Kundenbewertungen')}
            <h2 className="heading-1" style={{ fontSize: '48px', fontWeight: 900, marginBottom: '20px' }}>
              Was unsere Kunden sagen
            </h2>
            <p style={{ fontSize: '17px', color: 'var(--text-muted)', maxWidth: '640px', margin: '0 auto' }}>
              Echte Stimmen von echten Kunden – 4.9 von 5 Sternen über alle Projekte hinweg.
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
        subtitle="Antworten auf die Fragen, die wir am häufigsten gestellt bekommen."
        items={FAQ.map((item) => ({ question: item.q, answer: item.a }))}
        testid="section-faq"
      />

      {/* ========== KONTAKT ========== */}
      <ServiceContactForm
        defaultService="app-development"
        title="Lassen Sie uns Ihre App bauen"
        subtitle="Erzählen Sie uns von Ihrer Idee – wir melden uns innerhalb von 24 Stunden mit konkreten nächsten Schritten."
      />      <RelatedServices items={APPDEVELOPMENTPAGE_RELATED} />      <Footer />
      <Chatbot />
    </div>
  );
};

// ------------ Subcomponents ------------

const STACK_BELT = TECHNOLOGIES.filter((t) =>
  ['Flutter', 'React Native', 'Swift', 'Kotlin', 'Firebase', 'AWS'].includes(t.name)
);

// ---- App-Development-specific stack-showcase visuals (unique per service —
// only the "Unser kompletter App-Stack" TechBelt card stays shared) ----

const NativeAppGrid = () => {
  const apps = [
    { icon: Smartphone, bg: '#FF6B00' },
    { icon: Bell, bg: '#EF4444' },
    { icon: MessageCircle, bg: '#22C55E' },
    { icon: Heart, bg: '#EC4899' },
    { icon: Calendar, bg: '#6366F1' },
    { icon: Activity, bg: '#06B6D4' },
  ];
  return (
    <div className="app-install-grid">
      {apps.map((a, i) => (
        <div key={i} className="app-install-tile" style={{ background: a.bg, animationDelay: `${i * 0.12}s` }}>
          <a.icon size={18} color="#fff" strokeWidth={2} />
          {i === 0 && <span className="app-install-ring" />}
        </div>
      ))}
    </div>
  );
};

const BuildPipeline = () => (
  <div className="app-pipeline">
    <div className="app-pipeline-track" />
    <div className="app-pipeline-dot" />
    {['Design', 'Build', 'Test', 'Release'].map((s, i) => (
      <div key={s} className="app-pipeline-node">
        <span className="app-pipeline-node-dot" style={{ animationDelay: `${i * 0.75}s` }} />
        <span className="app-pipeline-node-label">{s}</span>
      </div>
    ))}
  </div>
);

const DesignToStoreFlow = () => (
  <div className="app-flow">
    <div className="app-flow-badge">
      <img src="https://cdn.simpleicons.org/figma/F24E1E" alt="Figma" loading="lazy" style={{ width: 20, height: 20 }} />
    </div>
    <div className="app-flow-trail"><span className="app-flow-pulse" /></div>
    <div className="app-flow-stores">
      <div className="app-flow-badge app-flow-store"><Apple size={15} color="#fff" /></div>
      <div className="app-flow-badge app-flow-store"><Smartphone size={15} color="#3DDC84" /></div>
    </div>
  </div>
);

const PlatformToggle = () => (
  <div className="app-platform-toggle">
    <span className="app-platform-highlight" />
    {['iOS', 'Android', 'Beide'].map((p) => (
      <span key={p} className="app-platform-pill">{p}</span>
    ))}
  </div>
);

const FpsWave = () => (
  <div className="app-fps">
    <div className="app-fps-counter">60<span>fps</span></div>
    <svg viewBox="0 0 120 32" className="app-fps-wave" preserveAspectRatio="none" aria-hidden>
      <path d="M0 16 Q 10 4, 20 16 T 40 16 T 60 16 T 80 16 T 100 16 T 120 16" />
    </svg>
  </div>
);

const AppStackShowcase = () => (
  <StackShowcaseSection
    eyebrow="Unser Stack"
    title={<>Gebaut für <span style={{ color: 'var(--accent-primary)' }}>native</span> Apps</>}
    subtitle="Von der Idee bis zum App Store – mit dem richtigen Werkzeug für jede Plattform."
    testid="section-stack-showcase"
  >
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr 1fr', gap: '20px', marginBottom: '20px' }} className="asf-row">
      <StackCard title="100% nativ von Tag eins"><NativeAppGrid /></StackCard>
      <StackCard title="Ihr Workflow, Ihr Tempo"><BuildPipeline /></StackCard>
      <StackCard title="Von Figma direkt in den Store"><DesignToStoreFlow /></StackCard>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }} className="asf-row">
      <StackCard title="Volle Code-Kontrolle. Kein Lock-in."><PlatformToggle /></StackCard>
      <StackCard title="Unser kompletter App-Stack"><TechBelt tools={STACK_BELT} /></StackCard>
      <StackCard title="Butterweiche 60-FPS-Erlebnisse"><FpsWave /></StackCard>
    </div>
    <style>{`
      .app-install-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; width: 140px; margin: 0 auto; }
      .app-install-tile { position: relative; width: 38px; height: 38px; border-radius: 11px; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 14px rgba(0,0,0,0.35); animation: appTilePop 2.6s ease-in-out infinite; }
      @keyframes appTilePop { 0%, 70%, 100% { transform: scale(1); } 80% { transform: scale(1.14); } }
      .app-install-ring { position: absolute; inset: -4px; border-radius: 14px; border: 2px solid rgba(255,255,255,0.6); animation: appRingPulse 1.8s ease-out infinite; }
      @keyframes appRingPulse { 0% { opacity: 0.8; transform: scale(0.9); } 100% { opacity: 0; transform: scale(1.35); } }

      .app-pipeline { position: relative; display: flex; justify-content: space-between; align-items: flex-start; width: 100%; padding: 6px 2px 0; }
      .app-pipeline-track { position: absolute; left: 6px; right: 6px; top: 12px; height: 2px; background: rgba(255,255,255,0.1); }
      .app-pipeline-dot { position: absolute; top: 8px; width: 10px; height: 10px; border-radius: 50%; background: var(--accent-primary); box-shadow: 0 0 10px var(--accent-primary); animation: appPipelineMove 3s ease-in-out infinite; }
      @keyframes appPipelineMove { 0% { left: 0%; } 100% { left: calc(100% - 10px); } }
      .app-pipeline-node { position: relative; display: flex; flex-direction: column; align-items: center; gap: 8px; z-index: 1; }
      .app-pipeline-node-dot { width: 12px; height: 12px; border-radius: 50%; background: #2a2a2a; border: 2px solid rgba(255,255,255,0.2); animation: appNodeLight 3s ease-in-out infinite; }
      @keyframes appNodeLight { 0%, 20%, 100% { background: #2a2a2a; border-color: rgba(255,255,255,0.2); box-shadow: none; } 25%, 95% { background: var(--accent-primary); border-color: var(--accent-primary); box-shadow: 0 0 8px var(--accent-primary); } }
      .app-pipeline-node-label { font-size: 10px; color: var(--text-muted); font-weight: 600; white-space: nowrap; }

      .app-flow { display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; }
      .app-flow-badge { width: 34px; height: 34px; border-radius: 10px; background: #0a0a0a; border: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
      .app-flow-store { animation: appStorePulse 2.6s ease-in-out infinite; }
      .app-flow-stores { display: flex; flex-direction: column; gap: 6px; }
      .app-flow-stores .app-flow-badge:last-child { animation-delay: 1.3s; }
      @keyframes appStorePulse { 0%, 60%, 100% { box-shadow: none; border-color: var(--border-subtle); } 70% { box-shadow: 0 0 0 3px rgba(255,107,0,0.25); border-color: var(--accent-primary); } }
      .app-flow-trail { position: relative; flex: 1; height: 2px; background: repeating-linear-gradient(90deg, rgba(255,255,255,0.15) 0 4px, transparent 4px 9px); max-width: 48px; }
      .app-flow-pulse { position: absolute; top: 50%; left: 0; width: 6px; height: 6px; border-radius: 50%; background: var(--accent-primary); box-shadow: 0 0 8px var(--accent-primary); transform: translateY(-50%); animation: appFlowMove 2.6s ease-in-out infinite; }
      @keyframes appFlowMove { 0% { left: 0%; opacity: 0; } 15% { opacity: 1; } 85% { opacity: 1; } 100% { left: 100%; opacity: 0; } }

      .app-platform-toggle { position: relative; display: grid; grid-template-columns: repeat(3, 1fr); background: rgba(255,255,255,0.04); border: 1px solid var(--border-subtle); border-radius: 999px; padding: 4px; width: 100%; }
      .app-platform-pill { position: relative; z-index: 1; text-align: center; font-size: 10px; font-weight: 700; padding: 8px 2px; color: var(--text-secondary); }
      .app-platform-highlight { position: absolute; top: 4px; bottom: 4px; left: 4px; width: calc(33.333% - 2.66px); border-radius: 999px; background: var(--accent-primary); z-index: 0; animation: appPlatformSlide 3.9s ease-in-out infinite; }
      @keyframes appPlatformSlide { 0%, 28% { transform: translateX(0%); } 33%, 61% { transform: translateX(100%); } 66%, 94% { transform: translateX(200%); } 100% { transform: translateX(0%); } }

      .app-fps { display: flex; flex-direction: column; align-items: center; gap: 8px; width: 100%; }
      .app-fps-counter { font-family: 'JetBrains Mono', monospace; font-size: 24px; font-weight: 800; color: var(--text-primary); line-height: 1; }
      .app-fps-counter span { font-size: 11px; color: var(--accent-primary); font-weight: 700; margin-left: 4px; }
      .app-fps-wave { width: 100%; max-width: 140px; height: 28px; }
      .app-fps-wave path { fill: none; stroke: var(--accent-primary); stroke-width: 2.5; stroke-linecap: round; stroke-dasharray: 8 6; animation: appFpsFlow 0.9s linear infinite; }
      @keyframes appFpsFlow { to { stroke-dashoffset: -28; } }

      @media (prefers-reduced-motion: reduce) {
        .app-install-tile, .app-install-ring, .app-pipeline-dot, .app-pipeline-node-dot, .app-flow-store, .app-flow-pulse, .app-platform-highlight, .app-fps-wave path { animation: none !important; }
      }
    `}</style>
  </StackShowcaseSection>
);

export default AppDevelopmentPage;
