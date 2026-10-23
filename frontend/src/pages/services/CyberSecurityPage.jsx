import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  Database,
  Clock,
  Skull,
  Eye,
  Bug,
  Network,
  Wifi,
  KeyRound,
  Fingerprint,
  Crosshair,
  FileCheck,
  Globe,
  FileSearch,
  Cloud,
  Siren,
  Activity,
  GraduationCap,
  Award,
  HardDrive,
  Target,
  Search,
  Radar,
  FileText,
  RefreshCw,
  Landmark,
  HeartPulse,
  ShoppingBag,
  Factory,
  Building2,
  Briefcase,
  Lock,
  TrendingUp,
  Zap,
  BarChart,
  Star,
  Plus
} from 'lucide-react';
import Header from '../../components/layout/Header';
import TestimonialsMarquee from '../../components/common/TestimonialsMarquee';
import TestimonialForm from '../../components/common/TestimonialForm';
import ToolDock from '../../components/services/ToolDock';
import TypingCode from '../../components/services/TypingCode';
import ServiceTabsGrid from '../../components/services/ServiceTabsGrid';
import { StackShowcaseSection, StackCard, TechBelt } from '../../components/services/StackShowcase';
import Seo, { SITE_URL } from '../../components/common/Seo';
import RelatedServices from '../../components/services/RelatedServices';
import Footer from '../../components/layout/Footer';
import Chatbot from '../../components/chatbot/Chatbot';
import { ModernBenefits } from '../../components/services/ModernBenefits';
import ModernTimeline from '../../components/services/ModernTimeline';
import ServiceContactForm from '../../components/services/ServiceContactForm';
import ServiceIndustries from '../../components/services/ServiceIndustries';
import ServicePortfolioSection from '../../components/services/ServicePortfolioSection';
import ServiceFAQ from '../../components/services/ServiceFAQ';
import { useSectionReveal } from '../../components/services/useSectionReveal';
import ServiceAdvisorBlock from '../../components/tools/ServiceAdvisorBlock';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// ------------ Data ------------
const WHY_ICONS = [
  { logo: 'https://cdn.simpleicons.org/cloudflare/F38020', label: 'Cloudflare', color: '#F38020' },
  { logo: 'https://cdn.simpleicons.org/fortinet/EE3124', label: 'Fortinet', color: '#EE3124' },
  { logo: 'https://cdn.simpleicons.org/snyk/4C4A73', label: 'Snyk', color: '#9B6BFF' },
  { logo: 'https://cdn.simpleicons.org/owasp/FF6B00', label: 'OWASP', color: '#FF6B00' },
  { logo: 'https://cdn.simpleicons.org/portswigger/FF6633', label: 'Burp Suite', color: '#FF6633' },
  { logo: 'https://cdn.simpleicons.org/wireshark/1679A7', label: 'Wireshark', color: '#1679A7' },
];

const SERVICES = [
  { tabId: 'offense', icon: Bug, logo: 'https://cdn.simpleicons.org/kalilinux/557C94', brandColor: '#557C94', title: 'Penetration Testing', image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=700&q=80&auto=format&fit=crop', desc: 'Ethische Hacker simulieren reale Angriffe und decken Schwachstellen auf, bevor es Kriminelle tun.', features: ['Black- & White-Box', 'OWASP & PTES', 'Re-Test inklusive', 'Beweisbare Exploits'] },
  { tabId: 'offense', icon: Globe, logo: 'https://cdn.simpleicons.org/owasp/FF6B00', brandColor: '#FF6B00', title: 'Web- & App-Security', image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=700&q=80&auto=format&fit=crop', desc: 'OWASP-Top-10-Tests, Code-Reviews und sichere Architektur für Ihre Web- und Mobile-Anwendungen.', features: ['OWASP Top 10', 'Source-Code-Review', 'API-Security-Tests', 'Secure Architecture'] },
  { tabId: 'offense', icon: FileSearch, title: 'Security Audit', image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=700&q=80&auto=format&fit=crop', desc: 'Umfassende Prüfung Ihrer IT-Landschaft inkl. Konfiguration, Berechtigungen und Prozessen.' },
  { tabId: 'compliance', icon: FileCheck, title: 'DSGVO-Check', image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=700&q=80&auto=format&fit=crop', desc: 'Vollständige Datenschutz-Prüfung Ihrer Website, Tools und Prozesse – inkl. Auftrags­verarbeitungs­verträge & Cookie-Setup.', features: ['Cookie-Consent', 'AVV-Prüfung', 'Datenschutz­erklärung', 'Lückenanalyse'] },
  { tabId: 'compliance', icon: Award, title: 'Compliance-Prüfung', image: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=700&q=80&auto=format&fit=crop', desc: 'Compliance-Audits & Beratung zu gängigen Sicherheitsstandards – inkl. Gap-Analyse und Umsetzungsplan.', features: ['Gap-Analyse', 'Umsetzungsplan', 'DSGVO', 'Dokumentation'] },
  { tabId: 'compliance', icon: GraduationCap, title: 'Security Awareness', image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=700&q=80&auto=format&fit=crop', desc: 'Schulungen & Phishing-Simulationen, die Ihre Mitarbeitenden zur stärksten Verteidigungslinie machen.' },
  { tabId: 'defense', icon: Cloud, title: 'Cloud Hardening', image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=700&q=80&auto=format&fit=crop', desc: 'Absicherung Ihrer AWS-, Azure- und GCP-Umgebungen nach Best Practices und Compliance-Vorgaben.' },
  { tabId: 'defense', icon: Siren, title: 'Incident Response', image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=700&q=80&auto=format&fit=crop', desc: 'Im Ernstfall in unter 60 Minuten am Start: Eindämmung, Forensik und Wiederherstellung.' },
  { tabId: 'defense', icon: Activity, logo: 'https://cdn.simpleicons.org/wireshark/1679A7', brandColor: '#1679A7', title: 'Security Monitoring', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=700&q=80&auto=format&fit=crop', desc: 'Kontinuierliche Überwachung Ihrer Systeme – SIEM, Log-Korrelation und Echtzeit-Alarme bei Anomalien.', features: ['SIEM-Integration', '24/7 Alarmierung', 'Threat Hunting', 'Monatliche Reports'] },
  { tabId: 'defense', icon: HardDrive, title: 'Backup & Disaster Recovery', image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=700&q=80&auto=format&fit=crop', desc: 'Notfallkonzepte, getestete Backups und Wiederherstellungspläne für maximale Ausfallsicherheit.' },
];

const SERVICE_TABS = [
  { id: 'offense', label: 'Offensive Security' },
  { id: 'compliance', label: 'Compliance & Awareness' },
  { id: 'defense', label: 'Defensive Security' },
];

const THREAT_SCAN_CODE = [
  { indent: 0, segments: [{ t: '@scanner.', c: '#FF6B00' }, { t: 'on_finding', c: '#61DAFB' }, { t: '()' }] },
  { indent: 0, segments: [{ t: 'async def', c: '#C678DD' }, { t: ' ' }, { t: 'triage', c: '#61DAFB' }, { t: '(vuln: ' }, { t: 'Finding', c: '#E5C07B' }, { t: '):' }] },
  { indent: 20, segments: [{ t: 'severity = ' }, { t: 'await', c: '#C678DD' }, { t: ' cvss.score(vuln)' }] },
  { indent: 20, segments: [{ t: 'await', c: '#C678DD' }, { t: ' soc.alert(vuln, severity)' }] },
  { indent: 20, segments: [{ t: 'return', c: '#C678DD' }, { t: ' report.log(vuln)' }] },
];

const DEVICON = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons';
const TECHNOLOGIES = [
  { name: 'Kali Linux', logo: 'https://cdn.simpleicons.org/kalilinux/557C94', color: '#557C94', desc: 'Die Distribution für Penetration Testing mit hunderten vorinstallierten Security-Tools.' },
  { name: 'Metasploit', logo: 'https://cdn.simpleicons.org/metasploit/2596CD', color: '#2596CD', desc: 'Das führende Exploitation-Framework für realistische Angriffssimulationen.' },
  { name: 'Wireshark', logo: 'https://cdn.simpleicons.org/wireshark/1679A7', color: '#1679A7', desc: 'Netzwerk-Analyse auf Paketebene – unverzichtbar für Forensik und Diagnose.' },
  { name: 'Burp Suite', logo: 'https://cdn.simpleicons.org/portswigger/FF6633', color: '#FF6633', desc: 'Der Standard für Web-Application-Security-Testing und Schwachstellen-Scans.' },
  { name: 'OWASP ZAP', logo: 'https://cdn.simpleicons.org/owasp/000000', color: '#FF6B00', desc: 'Open-Source-Scanner für automatisierte Web-Sicherheitsprüfungen.' },
  { name: 'Splunk', logo: 'https://cdn.simpleicons.org/splunk/000000', color: '#FF6B00', desc: 'SIEM-Plattform für Log-Analyse, Bedrohungserkennung und SOC-Monitoring.' },
  { name: 'Snyk', logo: 'https://cdn.simpleicons.org/snyk/4C4A73', color: '#9B6BFF', desc: 'Findet und behebt Schwachstellen in Code, Dependencies und Containern.' },
  { name: 'Cloudflare', logo: 'https://cdn.simpleicons.org/cloudflare/F38020', color: '#F38020', desc: 'WAF, DDoS-Schutz und Zero-Trust-Netzwerk-Sicherheit aus der Cloud.' },
  { name: 'Fortinet', logo: 'https://cdn.simpleicons.org/fortinet/EE3124', color: '#EE3124', desc: 'Next-Generation Firewalls und integrierte Netzwerk-Sicherheitslösungen.' },
  { name: 'Linux', logo: `${DEVICON}/linux/linux-original.svg`, color: '#FCC624', desc: 'Gehärtete Server-Systeme als sicheres Fundament Ihrer Infrastruktur.' },
];

const SECURITY_LAYERS = [
  { name: 'Netzwerksicherheit', tool: 'Fortinet', logo: 'https://cdn.simpleicons.org/fortinet/EE3124', color: '#EE3124',
    protects: 'Unbefugten Zugriff', priority: 'Kritisch',
    desc: 'Firewalls und Segmentierung kontrollieren, wer überhaupt an Ihre Systeme herankommt.' },
  { name: 'Anwendungssicherheit', tool: 'Burp Suite', logo: 'https://cdn.simpleicons.org/portswigger/FF6633', color: '#FF6633',
    protects: 'Injection & XSS', priority: 'Kritisch',
    desc: 'Penetration-Tests und Code-Audits schließen Lücken, bevor Angreifer sie finden.' },
  { name: 'Schwachstellen-Management', tool: 'Snyk', logo: 'https://cdn.simpleicons.org/snyk/4C4A73', color: '#9B6BFF',
    protects: 'Bekannte CVEs', priority: 'Hoch',
    desc: 'Kontinuierliches Scanning von Code und Dependencies auf veraltete, angreifbare Komponenten.' },
  { name: 'Cloud & DDoS-Schutz', tool: 'Cloudflare', logo: 'https://cdn.simpleicons.org/cloudflare/F38020', color: '#F38020',
    protects: 'Ausfälle & Überlastung', priority: 'Hoch',
    desc: 'WAF und Zero-Trust-Netzwerke halten Ihre Dienste auch unter Last verfügbar.' },
];

const PROCESS_STEPS = [
  { icon: Target, title: 'Scoping & Ziele', duration: '1 Woche',
    desc: 'Wir definieren gemeinsam Umfang, Ziele und Regeln des Engagements – transparent und vertraglich abgesichert.',
    deliverables: ['Rules of Engagement', 'NDA & Vertragswerk', 'Scope-Dokument & Zielmetriken'],
    image: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=600&q=80&auto=format&fit=crop' },
  { icon: Search, title: 'Reconnaissance', duration: '3–5 Tage',
    desc: 'Informationsbeschaffung und Mapping der Angriffsfläche: Domains, Dienste, Endpunkte und Technologien.',
    deliverables: ['Asset-Inventar', 'Attack-Surface-Map', 'OSINT-Bericht'],
    image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600&q=80&auto=format&fit=crop' },
  { icon: Radar, title: 'Schwachstellen-Scan', duration: '1 Woche',
    desc: 'Automatisierte und manuelle Analyse identifiziert potenzielle Sicherheitslücken in Systemen und Anwendungen.',
    deliverables: ['Vulnerability-Liste mit CVSS', 'False-Positive-Triage', 'Risiko-Heatmap'],
    image: 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=600&q=80&auto=format&fit=crop' },
  { icon: Crosshair, title: 'Exploitation', duration: '1–2 Wochen',
    desc: 'Kontrollierte Ausnutzung der Schwachstellen, um reale Auswirkungen sicher und nachvollziehbar zu demonstrieren.',
    deliverables: ['Proof-of-Concept Exploits', 'Chained-Attack-Demos', 'Beweismittel-Aufzeichnungen'],
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&q=80&auto=format&fit=crop' },
  { icon: FileText, title: 'Reporting', duration: '1 Woche',
    desc: 'Verständlicher Bericht mit Risikobewertung, Beweisen und priorisierten, umsetzbaren Handlungsempfehlungen.',
    deliverables: ['Executive Summary', 'Technischer Detail-Report', 'Priorisierter Maßnahmenkatalog'],
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80&auto=format&fit=crop' },
  { icon: RefreshCw, title: 'Re-Test & Härtung', duration: 'Laufend',
    desc: 'Nach der Behebung prüfen wir erneut und unterstützen bei der nachhaltigen Härtung Ihrer Systeme.',
    deliverables: ['Verifikations-Re-Test', 'Hardening-Guideline', 'Schulung & Wissenstransfer'],
    image: 'https://images.unsplash.com/photo-1557200134-90327ee9fafa?w=600&q=80&auto=format&fit=crop' },
];

const INDUSTRIES = [
  { icon: Landmark, title: 'Finanzwesen', tag: 'Finance', desc: 'Banken, FinTechs & Versicherungen: PCI-DSS-konforme Absicherung sensibler Transaktionen.',
    img: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=900&q=80&auto=format&fit=crop' },
  { icon: HeartPulse, title: 'Gesundheitswesen', tag: 'Healthcare', desc: 'Kliniken & Praxen: Schutz von Patientendaten – DSGVO- und compliance-konform.',
    img: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&q=80&auto=format&fit=crop' },
  { icon: ShoppingBag, title: 'E-Commerce', tag: 'Retail', desc: 'Online-Shops: Schutz vor Fraud, Bot-Angriffen und Datendiebstahl im Checkout.',
    img: 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=900&q=80&auto=format&fit=crop' },
  { icon: Factory, title: 'Industrie & OT', tag: 'Industry', desc: 'Produktion & Anlagen: Absicherung von OT/ICS-Umgebungen gegen Sabotage.',
    img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=900&q=80&auto=format&fit=crop' },
  { icon: Building2, title: 'Behörden', tag: 'Public', desc: 'Öffentliche Hand: BSI-Grundschutz und höchste Anforderungen an Datenschutz.',
    img: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=900&q=80&auto=format&fit=crop' },
  { icon: Briefcase, title: 'KMU', tag: 'Business', desc: 'Mittelstand: Pragmatischer, bezahlbarer Schutz gegen Ransomware & Phishing.',
    img: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=900&q=80&auto=format&fit=crop' },
];

const BENEFITS = [
  { icon: ShieldCheck, title: 'Schutz vor Angriffen', desc: 'Schwachstellen finden und schließen, bevor sie zum Einfallstor werden.', points: ['Proaktive Schwachstellen-Erkennung', 'Härtung kritischer Systeme', 'Reduzierte Angriffsfläche'] },
  { icon: TrendingUp, title: 'Geschäftskontinuität', desc: 'Minimierte Ausfallzeiten und ein Betrieb, der auch im Ernstfall weiterläuft.', points: ['Getestete Notfallpläne', 'Schnelle Wiederherstellung', 'Hohe Verfügbarkeit'] },
  { icon: Award, title: 'Compliance erfüllt', desc: 'DSGVO-konform und sauber dokumentiert – nachvollziehbar für Audits Ihrer Partner.', points: ['Saubere Dokumentation', 'Normgerechte Prozesse', 'Compliance-Beratung'] },
  { icon: Eye, title: 'Volle Transparenz', desc: 'Sie wissen jederzeit, wie es um Ihre Sicherheit steht – dank klarer Reports.', points: ['Verständliche Reports', 'Risiko-Scores & KPIs', 'Klare Handlungsempfehlungen'] },
  { icon: Clock, title: 'Schnelle Reaktion', desc: 'Incident Response in unter 60 Minuten – kein langes Warten im Ernstfall.', points: ['24/7 Notfall-Hotline', 'Forensische Analyse', 'Eindämmung in Minuten'] },
  { icon: Lock, title: 'Vertrauensgewinn', desc: 'Nachweisbare Sicherheit stärkt das Vertrauen von Kunden und Partnern.', points: ['Sicherheits-Zertifikate', 'Wettbewerbsvorteil', 'Reputationsschutz'] },
  { icon: Zap, title: 'Weniger Risiko', desc: 'Proaktive Härtung senkt das Risiko teurer Datenpannen deutlich.', points: ['Geringeres Breach-Risiko', 'Niedrigere Folgekosten', 'Versicherbarkeit verbessert'] },
  { icon: BarChart, title: 'Messbare Sicherheit', desc: 'KPIs und Risiko-Scores machen Ihren Sicherheitsstatus greifbar.', points: ['Kennzahlen-Dashboards', 'Trend-Analysen', 'Fortschritts-Tracking'] },
];

const PROJECTS = [
  { title: 'FinSecure Bank', tag: 'Finance', stats: '0 kritische Lücken', desc: 'Vollständiger Pentest der Online-Banking-Plattform inkl. Re-Test und PCI-DSS-Zertifizierung.',
    img: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=900&q=80&auto=format&fit=crop' },
  { title: 'MediCloud', tag: 'Healthcare', stats: 'DSGVO-konform', desc: 'Cloud Hardening und Datenschutz-Audit für eine Telemedizin-Plattform mit Patientendaten.',
    img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&q=80&auto=format&fit=crop' },
  { title: 'ShopGuard', tag: 'E-Commerce', stats: '-94% Bot-Traffic', desc: 'WAF-Einführung und Fraud-Prevention für einen großen Online-Shop – inkl. 24/7-Monitoring.',
    img: 'https://images.unsplash.com/photo-1557200134-90327ee9fafa?w=900&q=80&auto=format&fit=crop' },
  { title: 'IndustrieNet', tag: 'OT-Security', stats: 'Zero Incidents', desc: 'Segmentierung und Absicherung einer OT-Produktionsumgebung gegen Ransomware.',
    img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=900&q=80&auto=format&fit=crop' },
];

const REVIEWS = [
  { name: 'Nina Tannenberg', company: 'CISO, FinSecure Bank', rating: 5, img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80&auto=format&fit=crop',
    text: 'Der Pentest war gründlich und der Bericht erstklassig. Endlich ein Partner, der Sicherheit ernst nimmt.' },
  { name: 'Markus Hoffmann', company: 'IT-Leiter, IndustrieNet', rating: 5, img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&q=80&auto=format&fit=crop',
    text: 'Nach dem OT-Audit schlafen wir wieder ruhig. Professionell, schnell und absolut vertrauenswürdig.' },
  { name: 'Dr. Julia Weber', company: 'COO, MediCloud', rating: 5, img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80&auto=format&fit=crop',
    text: 'Höchst sensible Patientendaten – alle Compliance-Anforderungen wurden souverän erfüllt.' },
  { name: 'Daniel Krause', company: 'CTO, ShopGuard', rating: 5, img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80&auto=format&fit=crop',
    text: 'Bot-Traffic um 94% reduziert und das SOC-Monitoring läuft tadellos. Klare Empfehlung.' },
  { name: 'Sarah Becker', company: 'Geschäftsführerin, TechVision', rating: 5, img: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&q=80&auto=format&fit=crop',
    text: 'Die Awareness-Schulungen haben unsere Phishing-Klickrate drastisch gesenkt. Top!' },
  { name: 'Tobias Lehmann', company: 'Founder, RouteFlow', rating: 5, img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&q=80&auto=format&fit=crop',
    text: 'Incident Response in 40 Minuten am Start – das hat uns vor einem echten Desaster bewahrt.' },
];

const FAQ = [
  { q: 'Was ist ein Penetration Test genau?', a: 'Ein Penetration Test (Pentest) ist ein kontrollierter, autorisierter Angriff auf Ihre Systeme durch ethische Hacker. Ziel ist es, Schwachstellen zu finden und nachzuweisen, bevor echte Angreifer sie ausnutzen.' },
  { q: 'Wie oft sollte ein Security Audit durchgeführt werden?', a: 'Wir empfehlen mindestens einmal jährlich sowie nach größeren Änderungen an Ihrer Infrastruktur oder Anwendung. Für kritische Systeme ist kontinuierliches Monitoring sinnvoll.' },
  { q: 'Stört der Test unseren laufenden Betrieb?', a: 'Nein. Tests werden sorgfältig geplant, oft außerhalb der Hauptzeiten, und kontrolliert durchgeführt. Der Umfang wird vorab klar definiert, um Risiken auszuschließen.' },
  { q: 'Helfen Sie auch bei der Behebung der Schwachstellen?', a: 'Ja. Unser Bericht enthält priorisierte, umsetzbare Empfehlungen. Auf Wunsch begleiten wir die Behebung und führen einen kostenlosen Re-Test durch.' },
  { q: 'Arbeiten Sie DSGVO-konform?', a: 'Ja. Wir arbeiten nach anerkannten Methoden (u.a. OWASP) und unterstützen Sie aktiv bei der Erfüllung Ihrer DSGVO-Anforderungen.' },
  { q: 'Was passiert bei einem akuten Sicherheitsvorfall?', a: 'Unser Incident-Response-Team ist in unter 60 Minuten einsatzbereit: Eindämmung, forensische Analyse, Wiederherstellung und Nachbereitung – damit Sie schnell wieder handlungsfähig sind.' },
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

const THREATS = [
  { icon: Skull, name: 'Ransomware', desc: 'Datenverschlüsselung & Erpressung', severity: 'kritisch', time: '14:32:07', status: 'Blockiert' },
  { icon: Eye, name: 'Phishing', desc: 'Social Engineering Angriffe', severity: 'hoch', time: '14:31:52', status: 'Erkannt' },
  { icon: Bug, name: 'Malware', desc: 'Schadsoftware & Trojaner', severity: 'kritisch', time: '14:31:38', status: 'Blockiert' },
  { icon: Network, name: 'DDoS', desc: 'Distributed Denial of Service', severity: 'hoch', time: '14:31:14', status: 'Abgewehrt' },
  { icon: Database, name: 'SQL Injection', desc: 'Datenbankmanipulation', severity: 'kritisch', time: '14:30:49', status: 'Blockiert' },
  { icon: Wifi, name: 'MITM', desc: 'Man-in-the-Middle Angriffe', severity: 'hoch', time: '14:30:21', status: 'Erkannt' },
  { icon: KeyRound, name: 'Brute Force', desc: 'Passwort-Cracking', severity: 'mittel', time: '14:29:58', status: 'Überwacht' },
  { icon: Fingerprint, name: 'Zero-Day', desc: 'Unbekannte Schwachstellen', severity: 'kritisch', time: '14:29:33', status: 'Analysiert' },
];
const THREAT_SEVERITY_COLOR = { kritisch: '#FF4444', hoch: '#FF6B00', mittel: '#FFB020' };

// ------------ Component ------------
const CYBERSECURITYPAGE_JSONLD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Service',
      name: 'Cyber Security',
      serviceType: 'Cyber Security',
      provider: { '@type': 'ProfessionalService', name: 'Zebick', url: SITE_URL },
      areaServed: 'CH',
      url: `${SITE_URL}/services/cyber-security`,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Startseite', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Services', item: `${SITE_URL}/services` },
        { '@type': 'ListItem', position: 3, name: 'Cyber Security', item: `${SITE_URL}/services/cyber-security` },
      ],
    },
  ],
};

const CYBERSECURITYPAGE_RELATED = [{ label: "Server & Systeme", path: "/services/server-systeme" }, { label: "Webentwicklung", path: "/services/webentwicklung" }];

const CyberSecurityPage = () => {
  const pageRef = useRef(null);
  const [testimonials, setTestimonials] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    fetch(`${API}/testimonials/approved`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setTestimonials(Array.isArray(data) ? data : []))
      .catch(() => {});
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
    <div className="page-transition" data-testid="cyber-security-page" ref={pageRef}>
      <Header />
      <TestimonialForm isOpen={showReviewForm} onClose={() => setShowReviewForm(false)} />
      <Seo
        title="Cyber Security & Security Audits"
        description="Penetration Tests, Security Audits und DSGVO-konforme Absicherung für Web-Anwendungen, APIs und Infrastruktur."
        path="/services/cyber-security"
        jsonLd={CYBERSECURITYPAGE_JSONLD}
      />

      <div className="sr-only"><h1>Cyber Security & Security Audits</h1></div>

      <ServiceAdvisorBlock serviceId="cyber-security" />


      {/* ========== Die Bedrohungslage ist real (unverändert) ========== */}
      <section className="section" data-testid="threat-landscape" style={{ position: 'relative', overflow: 'hidden', paddingTop: '120px', paddingBottom: '120px' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '10%', left: '5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(255, 50, 50, 0.08) 0%, transparent 60%)', borderRadius: '50%', filter: 'blur(100px)' }} />
          <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(255, 107, 0, 0.06) 0%, transparent 60%)', borderRadius: '50%', filter: 'blur(80px)' }} />
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'repeating-linear-gradient(0deg, transparent, transparent 50px, rgba(255, 107, 0, 0.02) 50px, rgba(255, 107, 0, 0.02) 51px)', animation: 'scanLines 10s linear infinite' }} />
        </div>

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="threat-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '80px', alignItems: 'center' }}>
            <div>
              <span className="section-label">Warum Cyber Security?</span>
              <h2 className="heading-1" style={{ fontSize: '48px', marginTop: '16px', marginBottom: '24px', fontWeight: 900 }}>
                Die Bedrohungslage
                <span style={{ color: '#FF4444', display: 'block' }}>ist real</span>
              </h2>
              <p style={{ fontSize: '17px', color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '40px' }}>
                Cyberangriffe nehmen exponentiell zu und können Unternehmen jeder Größe treffen.
                Die Frage ist nicht ob, sondern wann Sie angegriffen werden.
              </p>

              <div className="svc-icon-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {[...WHY_ICONS, ...WHY_ICONS].map((item, idx) => (
                  <div key={idx} className="svc-icon-chip" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 18px', background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%)', border: '1px solid var(--border-subtle)', borderRadius: '999px', transition: 'all 0.3s ease' }}
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

            <div style={{ padding: '22px', background: 'linear-gradient(145deg, rgba(255, 50, 50, 0.08) 0%, rgba(0, 0, 0, 0.4) 100%)', border: '1px solid rgba(255, 50, 50, 0.2)', borderRadius: 'var(--radius-xl)', position: 'relative', overflow: 'hidden' }}>
              <div className="cs-scan-line" style={{ position: 'absolute', left: 0, right: 0, height: '120px', background: 'linear-gradient(180deg, transparent 0%, rgba(255,68,68,0.08) 50%, transparent 100%)', pointerEvents: 'none' }} />

              {/* compact header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '9px', height: '9px', background: '#FF4444', borderRadius: '50%', animation: 'pulse 2s ease-in-out infinite', boxShadow: '0 0 14px #FF4444' }} />
                  <span style={{ fontWeight: 700, color: '#FF4444', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '11px' }}>Live Threat Monitor</span>
                </div>
                <Radar size={15} color="#FF4444" style={{ opacity: 0.6 }} />
              </div>

              {/* compact stat bar: icon-led segments with dividers instead of 3 separate boxes */}
              <div style={{ display: 'flex', alignItems: 'stretch', background: '#0a0a0a', border: '1px solid rgba(255, 68, 68, 0.15)', borderRadius: 'var(--radius-md)', marginBottom: '14px', overflow: 'hidden' }}>
                {[
                  { icon: Activity, value: THREATS.length, label: 'Aktiv' },
                  { icon: ShieldCheck, value: '142', label: 'Geblockt heute' },
                  { icon: Zap, value: '<60s', label: 'Reaktion' },
                ].map((s, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 10px', minWidth: 0, borderRight: i < 2 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
                    <s.icon size={16} color="#FF4444" style={{ flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#fff', lineHeight: 1.15 }}>{s.value}</div>
                      <div style={{ fontSize: '8.5px', color: '#888', letterSpacing: '0.03em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* scrolling terminal-style log feed — a different system than the
                  old clickable 8-row list: a compact, fixed-height console that
                  auto-scrolls through the same threat data, so "live monitoring"
                  reads as an actual log instead of a tall static list */}
              <div className="cs-log-term" style={{ height: '180px', overflow: 'hidden', position: 'relative', background: '#060606', border: '1px solid rgba(255, 68, 68, 0.15)', borderRadius: 'var(--radius-md)' }}>
                <div className="cs-log-track">
                  {[...THREATS, ...THREATS].map((t, i) => {
                    const color = THREAT_SEVERITY_COLOR[t.severity];
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontFamily: 'JetBrains Mono, monospace' }}>
                        <span style={{ fontSize: '10px', color: '#666', flexShrink: 0 }}>{t.time}</span>
                        <span style={{ fontSize: '10px', fontWeight: 700, color, flexShrink: 0, minWidth: '64px' }}>{t.status.toUpperCase()}</span>
                        <t.icon size={12} color={color} style={{ flexShrink: 0 }} />
                        <span style={{ fontSize: '12px', color: '#eee', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.name}</span>
                        <span style={{ fontSize: '11px', color: '#777', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>· {t.desc}</span>
                      </div>
                    );
                  })}
                </div>
                <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #060606 0%, transparent 12%, transparent 88%, #060606 100%)', pointerEvents: 'none' }} />
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes scanLines { 0% { transform: translateY(-120px); } 100% { transform: translateY(420px); } }
          .cs-scan-line { animation: scanLines 3.5s linear infinite; }
          @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.8); } }
          @media (max-width: 900px) {
            .threat-grid { grid-template-columns: 1fr !important; gap: 0 !important; }
            .threat-grid > div:first-child { display: contents; }
            .threat-grid > div:last-child { margin-top: 48px; }
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
          .cs-log-track { animation: csLogScroll 22s linear infinite; }
          @keyframes csLogScroll { from { transform: translateY(0); } to { transform: translateY(-50%); } }
          @media (prefers-reduced-motion: reduce) { .cs-scan-line, .cs-log-track { animation: none !important; } }
        `}</style>
      </section>

      {/* ========== STACK-SHOWCASE ========== */}
      <CyberStackShowcase />

      {/* ========== LEISTUNGSSPEKTRUM ========== */}
      <section className="section" data-testid="section-leistungsspektrum" style={{ padding: '120px 0', background: 'var(--bg-primary)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '20%', right: '-150px', width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(255,107,0,0.06) 0%, transparent 60%)', filter: 'blur(100px)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '60px', alignItems: 'center', marginBottom: '72px' }}>
            <div data-reveal style={{ opacity: 0, transform: 'translateY(30px)', transition: 'all 0.8s ease' }}>
              {sectionLabel('Leistungsspektrum')}
              <h2 className="heading-1" style={{ fontSize: '44px', fontWeight: 900, marginBottom: '20px', lineHeight: 1.1 }}>
                Cybersecurity, <span className="text-gradient">komplett gedacht</span>
              </h2>
              <p style={{ fontSize: '17px', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                Von Offensive Security über Compliance bis Defensive Security: Angriff, Nachweis und Abwehr
                greifen bei uns ineinander – statt isolierter Einzelmaßnahmen bekommen Sie ein belastbares Schutzkonzept.
              </p>
            </div>
            <div data-reveal style={{ opacity: 0, transform: 'translateY(30px)', transition: 'all 0.8s 0.15s ease', ...baseCard, padding: '32px', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', lineHeight: 1.8 }}>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FF5F57' }} />
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FFBD2E' }} />
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#28CA42' }} />
                <span style={{ marginLeft: '12px', color: 'var(--text-muted)', fontSize: '12px' }}>threat_scan.py</span>
              </div>
              <TypingCode lines={THREAT_SCAN_CODE} />
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
            {sectionLabel('Technologien & Tools')}
            <h2 className="heading-1" style={{ fontSize: '48px', fontWeight: 900, marginBottom: '20px' }}>Womit wir Ihre Systeme schützen</h2>
            <p style={{ fontSize: '17px', color: 'var(--text-muted)', maxWidth: '640px', margin: '0 auto' }}>
              Wir setzen auf die führenden Security-Tools – dieselben, die auch Angreifer nutzen.
            </p>
          </div>
          <ToolDock tools={TECHNOLOGIES} />
        </div>
      </section>

      {/* ========== SICHERHEITSEBENEN ========== */}
      <section className="section" data-testid="section-security-layers" style={{ padding: '120px 0', background: 'var(--bg-primary)' }}>
        <div className="container">
          <div data-reveal style={{ opacity: 0, transform: 'translateY(30px)', transition: 'all 0.8s ease', textAlign: 'center', marginBottom: '64px' }}>
            {sectionLabel('Sicherheitsebenen')}
            <h2 className="heading-1" style={{ fontSize: '44px', fontWeight: 900, marginBottom: '16px' }}>Wo <span className="text-gradient">Angriffe ansetzen.</span></h2>
            <p style={{ fontSize: '17px', color: 'var(--text-muted)', maxWidth: '640px', margin: '0 auto', lineHeight: 1.7 }}>
              Echte Sicherheit entsteht erst, wenn alle Ebenen zusammenspielen – eine einzelne Maßnahme reicht nicht.
            </p>
          </div>

          <div className="compare-grid" data-keep-grid style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '56px' }}>
            {SECURITY_LAYERS.map((l, i) => (
              <div key={l.name} data-reveal style={{ ...baseCard, padding: '28px', opacity: 0, transform: 'translateY(30px)', transition: `all 0.8s ${i * 0.08}s ease` }}
                   onMouseEnter={(e) => { e.currentTarget.style.borderColor = l.color; e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = `0 20px 40px ${l.color}25`; }}
                   onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                  <img src={l.logo} alt={l.name} width="44" height="44" style={{ objectFit: 'contain' }} />
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700 }}>{l.name}</h3>
                    <span style={{ fontSize: '12px', color: l.color }}>{l.priority}</span>
                  </div>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.7 }}>{l.desc}</p>
              </div>
            ))}
          </div>

          {/* Comparison Table */}
          <div data-reveal style={{ ...baseCard, padding: '0', overflow: 'hidden', opacity: 0, transform: 'translateY(30px)', transition: 'all 0.8s 0.2s ease' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '720px' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,107,0,0.06)' }}>
                    {['Ebene', 'Werkzeug', 'Schützt vor', 'Priorität'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '20px 24px', fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent-primary)', fontWeight: 600, borderBottom: '1px solid var(--border-subtle)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SECURITY_LAYERS.map((l, i) => (
                    <tr key={l.name} style={{ borderBottom: i < SECURITY_LAYERS.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                      <td style={{ padding: '20px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img src={l.logo} alt={l.name} width="28" height="28" style={{ objectFit: 'contain' }} />
                          <span style={{ fontWeight: 600 }}>{l.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '20px 24px', color: 'var(--text-secondary)' }}>{l.tool}</td>
                      <td style={{ padding: '20px 24px', color: 'var(--text-muted)', fontSize: '14px' }}>{l.protects}</td>
                      <td style={{ padding: '20px 24px', color: 'var(--text-secondary)' }}>{l.priority}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ========== VORGEHEN ========== */}
      <ModernTimeline
        eyebrow="Unser Vorgehen"
        title="So gehen wir vor"
        subtitle="Ein strukturierter, transparenter Prozess – von der Zieldefinition bis zur nachhaltigen Härtung."
        steps={PROCESS_STEPS}
      />

      {/* ========== BRANCHEN ========== */}
      <ServiceIndustries
        slug="cyber-security"
        defaultItems={INDUSTRIES.map((c) => ({
          icon: c.icon?.displayName || c.icon?.name || 'Building2',
          title: c.title, tag: c.tag, desc: c.desc, img: c.img,
        }))}
        defaultHeading="Sicherheit für jede Branche"
        defaultSubtitle="Jede Branche hat eigene Bedrohungen und Compliance-Anforderungen – wir kennen sie alle."
        eyebrowLabel="Branchen"
      />

      {/* ========== VORTEILE ========== */}
      <ModernBenefits
        eyebrow="Vorteile"
        title="Was professionelle Sicherheit bringt"
        accentWord="professionelle Sicherheit"
        subtitle="Sicherheit ist eine Investition – und sie schützt vor weit höheren Kosten."
        items={BENEFITS}
        image="https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=900&q=80&auto=format&fit=crop"
        testid="section-benefits"
      />

      {/* ========== REFERENZEN & PROJEKTE — aus Portfolio (Admin) ========== */}
      <ServicePortfolioSection
        serviceId="cyber-security"
        fallbackExamples={PROJECTS}
        eyebrow="Referenzen & Projekte"
        title="Erfolge, die"
        accentWord="für sich sprechen"
        subtitle="Eine Auswahl an Projekten – diskret anonymisiert, mit messbaren Ergebnissen."
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
              Vertrauen ist die Basis jeder Sicherheitspartnerschaft – 4.9 von 5 Sternen.
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
        subtitle="Antworten auf die Fragen, die uns am häufigsten gestellt werden."
        items={FAQ.map((item) => ({ question: item.q, answer: item.a }))}
        testid="section-faq"
      />

      {/* ========== KONTAKT ========== */}
      <ServiceContactForm
        defaultService="cyber-security"
        title="Sichern Sie Ihr Business ab"
        subtitle="Fordern Sie Ihre kostenlose Sicherheitsanalyse an – wir melden uns innerhalb von 24 Stunden."
      />      <RelatedServices items={CYBERSECURITYPAGE_RELATED} />      <Footer />
      <Chatbot />
    </div>
  );
};

// ------------ Subcomponents ------------

const CYBER_BELT = TECHNOLOGIES.filter((t) =>
  ['Kali Linux', 'Metasploit', 'Wireshark', 'Burp Suite', 'OWASP ZAP', 'Splunk'].includes(t.name)
);

// ---- Security-specific stack-showcase visuals (unique per service — only
// the "Unsere Security-Tools" TechBelt card stays shared) ----

const ShieldScan = () => (
  <div className="cyb-shield">
    <ShieldCheck size={44} strokeWidth={1.5} className="cyb-shield-icon" />
    <span className="cyb-shield-beam" />
  </div>
);

const ThreatGrid = () => (
  <div className="cyb-grid">
    {Array.from({ length: 9 }).map((_, i) => (
      <span key={i} className={`cyb-cell${i === 4 ? ' cyb-cell-active' : ''}`} style={i === 4 ? {} : { animationDelay: `${i * 0.05}s` }} />
    ))}
  </div>
);

const HeartbeatMonitor = () => (
  <div className="cyb-heartbeat">
    <svg viewBox="0 0 120 40" className="cyb-heartbeat-svg" preserveAspectRatio="none" aria-hidden>
      <polyline points="0,20 20,20 28,6 36,34 44,20 60,20 68,10 76,30 84,20 120,20" className="cyb-heartbeat-line" />
    </svg>
    <span className="cyb-heartbeat-label">99.9% Uptime</span>
  </div>
);

const CYB_SCAN_TOOLS = [
  { n: 'Kali Linux', logo: 'https://cdn.simpleicons.org/kalilinux/557C94' },
  { n: 'Wireshark', logo: 'https://cdn.simpleicons.org/wireshark/1679A7' },
  { n: 'Burp Suite', logo: 'https://cdn.simpleicons.org/burpsuite/FF6633' },
  { n: 'Metasploit', logo: 'https://cdn.simpleicons.org/metasploit/3C3C3C' },
];

const ScanProgress = () => (
  <div className="cyb-scan">
    <div className="cyb-scan-track"><span className="cyb-scan-fill" /><span className="cyb-scan-sweep" /></div>
    <span className="cyb-scan-label">1.000 / 1.000 Ports gescannt</span>
    <div className="cyb-scan-tools">
      {CYB_SCAN_TOOLS.map((t, i) => (
        <span key={t.n} className="cyb-scan-tool" style={{ animationDelay: `${i * 0.6}s` }}>
          <img src={t.logo} alt={t.n} />
        </span>
      ))}
    </div>
  </div>
);

const ResponseTimer = () => (
  <div className="cyb-timer">
    <span className="cyb-timer-ring" />
    <span className="cyb-timer-digits">14:32</span>
  </div>
);

const CyberStackShowcase = () => (
  <StackShowcaseSection
    eyebrow="Unser Ansatz"
    title={<>Gebaut für <span style={{ color: 'var(--accent-primary)' }}>maximale</span> Sicherheit</>}
    subtitle="Von der Schwachstellenanalyse bis zur 24/7-Überwachung – Security ist kein Add-on, sondern das Fundament."
    testid="section-stack-showcase"
  >
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr 1fr', gap: '20px', marginBottom: '20px' }} className="asf-row">
      <StackCard title="Security von Tag eins"><ShieldScan /></StackCard>
      <StackCard title="Unser Pentest-Workflow"><ThreatGrid /></StackCard>
      <StackCard title="Rund-um-die-Uhr-Monitoring"><HeartbeatMonitor /></StackCard>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }} className="asf-row">
      <StackCard title="Kein Blackbox-Audit"><ScanProgress /></StackCard>
      <StackCard title="Unsere Security-Tools"><TechBelt tools={CYBER_BELT} /></StackCard>
      <StackCard title="Reaktionszeit < 15 Minuten"><ResponseTimer /></StackCard>
    </div>
    <style>{`
      .cyb-shield { position: relative; display: flex; align-items: center; justify-content: center; width: 100%; height: 70px; overflow: hidden; }
      .cyb-shield-icon { color: var(--accent-primary); }
      .cyb-shield-beam { position: absolute; left: 50%; top: -10%; width: 50px; height: 14px; margin-left: -25px; background: linear-gradient(180deg, rgba(255,255,255,0.65), transparent); filter: blur(1px); animation: cybBeamSweep 2.2s ease-in-out infinite; }
      @keyframes cybBeamSweep { 0% { top: -10%; } 100% { top: 100%; } }

      .cyb-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; width: 70px; height: 70px; margin: 0 auto; }
      .cyb-cell { border-radius: 3px; background: rgba(255,255,255,0.08); }
      .cyb-cell-active { animation: cybThreatPulse 2.4s ease-in-out infinite; }
      @keyframes cybThreatPulse { 0%, 100% { background: rgba(255,255,255,0.08); } 30% { background: #ef4444; box-shadow: 0 0 10px #ef4444; } 65% { background: #4ade80; box-shadow: 0 0 10px #4ade80; } }

      .cyb-heartbeat { display: flex; flex-direction: column; align-items: center; gap: 4px; width: 100%; }
      .cyb-heartbeat-svg { width: 100%; height: 36px; }
      .cyb-heartbeat-line { fill: none; stroke: #4ade80; stroke-width: 2; stroke-linejoin: round; stroke-dasharray: 220; stroke-dashoffset: 220; animation: cybHeartbeatDraw 2s linear infinite; }
      @keyframes cybHeartbeatDraw { 0% { stroke-dashoffset: 220; } 90%, 100% { stroke-dashoffset: 0; } }
      .cyb-heartbeat-label { font-size: 10px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }

      .cyb-scan { display: flex; flex-direction: column; gap: 8px; width: 100%; align-items: center; }
      .cyb-scan-track { position: relative; width: 100%; height: 8px; border-radius: 4px; background: rgba(255,255,255,0.08); overflow: hidden; }
      .cyb-scan-fill { position: absolute; inset: 0; width: 100%; background: linear-gradient(90deg, var(--accent-primary), #ffb380); transform: scaleX(0); transform-origin: left; animation: cybScanFill 2.6s ease-in-out infinite; }
      @keyframes cybScanFill { 0% { transform: scaleX(0); } 70%, 100% { transform: scaleX(1); } }
      .cyb-scan-sweep { position: absolute; top: 0; bottom: 0; width: 20px; background: rgba(255,255,255,0.5); filter: blur(3px); animation: cybScanSweep 2.6s ease-in-out infinite; }
      @keyframes cybScanSweep { 0% { left: -20px; } 70%, 100% { left: 100%; } }
      .cyb-scan-label { font-size: 9px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
      .cyb-scan-tools { display: flex; gap: 8px; margin-top: 2px; }
      .cyb-scan-tool { width: 22px; height: 22px; border-radius: 6px; background: rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: center; opacity: 0.4; animation: cybScanToolPulse 2.4s ease-in-out infinite; }
      .cyb-scan-tool img { width: 13px; height: 13px; object-fit: contain; }
      @keyframes cybScanToolPulse { 0%, 100% { opacity: 0.4; } 30% { opacity: 1; box-shadow: 0 0 8px rgba(255,107,0,0.4); } }

      .cyb-timer { position: relative; display: flex; align-items: center; justify-content: center; width: 70px; height: 70px; margin: 0 auto; }
      .cyb-timer-ring { position: absolute; inset: 0; border-radius: 50%; border: 2px solid rgba(255,107,0,0.3); animation: cybTimerRing 1.6s ease-in-out infinite; }
      @keyframes cybTimerRing { 0%, 100% { box-shadow: 0 0 0 rgba(255,107,0,0.5); } 50% { box-shadow: 0 0 10px rgba(255,107,0,0.6); border-color: var(--accent-primary); } }
      .cyb-timer-digits { font-family: 'JetBrains Mono', monospace; font-size: 15px; font-weight: 800; color: var(--text-primary); }

      @media (prefers-reduced-motion: reduce) {
        .cyb-shield-beam, .cyb-cell-active, .cyb-heartbeat-line, .cyb-scan-fill, .cyb-scan-sweep, .cyb-scan-tool, .cyb-timer-ring { animation: none !important; }
      }
    `}</style>
  </StackShowcaseSection>
);

export default CyberSecurityPage;
