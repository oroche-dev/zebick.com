/**
 * CyberSecurity service page — all content (German).
 * Real Unsplash photos of people, real brand logos via CDN.
 */
import {
  ShieldCheck, Search, Network, Flame, Cloud, Laptop, Activity,
  AlertTriangle, ClipboardCheck, GraduationCap,
  Bug, Skull, Fish, Server, Database, UserX, Brain,
  Lock, KeyRound, Eye, HardDrive, Smartphone, Layers,
  Stethoscope, Banknote, Factory, ShoppingCart, Landmark, Rocket,
} from 'lucide-react';

const cyberSecurityData = {
  hero: {
    badge: 'Enterprise Cybersecurity',
    badgeIcon: ShieldCheck,
    titleLines: ['Cybersecurity', 'die schützt.', 'Rund um die Uhr.'],
    accentWord: 'schützt.',
    description:
      'Penetrationstests, Managed Detection & Response, Cloud-Sicherheit und DSGVO-konformes Schwachstellenmanagement — alles aus einer Hand. Wir schützen Ihr Unternehmen vor Ransomware, Phishing und Datenlecks.',
    primaryCta: { label: 'Kostenfreie Risikoanalyse', to: '/contact' },
    secondaryCta: { label: 'Notfall-Hotline anrufen', to: 'tel:+498912345670' },
    bgImage:
      'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=1920&q=80',
    stats: [
      { value: '500+', label: 'Geschützte Unternehmen' },
      { value: '24/7', label: 'Security Operations Center' },
      { value: '<15 Min', label: 'Reaktionszeit im Notfall' },
      { value: 'DSGVO', label: 'Konform' },
    ],
  },

  trustBadges: ['DSGVO-konform', 'SSL-verschlüsselt'],

  services: {
    eyebrow: 'Unsere Leistungen',
    title: 'Vollumfänglicher Cyber-Schutz für Ihr Unternehmen',
    accentWord: 'Cyber-Schutz',
    subtitle: 'Von der Schwachstellenanalyse bis zum 24/7 Monitoring — wir decken die gesamte Sicherheits-Wertschöpfungskette ab.',
    items: [
      { icon: Bug, title: 'Penetration Testing', description: 'Realitätsnahe Angriffssimulationen nach OSSTMM & OWASP — wir finden Schwachstellen, bevor es Angreifer tun.' },
      { icon: Search, title: 'Schwachstellenanalysen', description: 'Automatisierte und manuelle Vulnerability Assessments für Netzwerk, Web-Apps und APIs.' },
      { icon: Network, title: 'Netzwerksicherheit', description: 'Segmentierung, IDS/IPS, sichere VLANs und Zero-Trust-Architekturen für hybride Umgebungen.' },
      { icon: Flame, title: 'Firewall Management', description: 'Konfiguration, Härtung und Pflege von Next-Gen Firewalls — Cisco, Fortinet, Palo Alto.' },
      { icon: Cloud, title: 'Cloud Security', description: 'CSPM, CIEM und Workload-Schutz für AWS, Azure und Google Cloud nach CIS Benchmarks.' },
      { icon: Laptop, title: 'Endpoint Protection', description: 'EDR/XDR-Lösungen mit KI-gestützter Bedrohungserkennung auf jedem Gerät — auch im Home-Office.' },
      { icon: Activity, title: 'Security Monitoring', description: '24/7 SOC-as-a-Service mit SIEM, Threat Intelligence und proaktiver Bedrohungsjagd.' },
      { icon: AlertTriangle, title: 'Incident Response', description: 'Notfall-Forensik, Eindämmung und Wiederherstellung — wir sind in unter 15 Minuten einsatzbereit.' },
      { icon: ClipboardCheck, title: 'Security Audits', description: 'Sicherheits-Audits & Compliance-Beratung inklusive Gap-Analyse und Remediation-Roadmap.' },
      { icon: GraduationCap, title: 'Awareness-Schulungen', description: 'Phishing-Simulationen und Mitarbeiterschulungen — der Mensch ist die wichtigste Firewall.' },
    ],
  },

  threats: {
    eyebrow: 'Bedrohungslage',
    title: 'Die häufigsten Cyber-Bedrohungen 2026',
    accentWord: 'Cyber-Bedrohungen',
    subtitle: 'Wir kennen die Angriffsvektoren — und neutralisieren sie, bevor Schaden entsteht.',
    items: [
      { icon: Lock, title: 'Ransomware', description: 'Datenverschlüsselung mit Lösegeldforderung. Durchschnittlicher Schaden: 4,5 Mio. €.' },
      { icon: Bug, title: 'Malware', description: 'Trojaner, Spyware und Würmer, die unbemerkt Daten exfiltrieren oder Systeme kompromittieren.' },
      { icon: Fish, title: 'Phishing', description: 'Gefälschte E-Mails und Webseiten, die Zugangsdaten oder Zahlungen erschleichen.' },
      { icon: Server, title: 'DDoS-Angriffe', description: 'Überlastungsattacken, die Webshops, APIs und kritische Infrastruktur lahmlegen.' },
      { icon: Database, title: 'Datenlecks', description: 'Ungewollte Veröffentlichung sensibler Kunden- und Geschäftsdaten — DSGVO-Bußgeld droht.' },
      { icon: UserX, title: 'Insider Threats', description: 'Bedrohungen durch unzufriedene Mitarbeiter, Fehlkonfigurationen oder kompromittierte Konten.' },
      { icon: Brain, title: 'Social Engineering', description: 'Psychologische Manipulation — CEO-Fraud, Vishing, Pretexting. Der Mensch im Visier.' },
    ],
  },

  solutions: {
    eyebrow: 'Sicherheitslösungen',
    title: 'Modernste Sicherheits-Technologien im Einsatz',
    accentWord: 'Sicherheits-Technologien',
    subtitle: 'Wir kombinieren bewährte Tools mit KI-gestützten Lösungen — defense in depth, ohne Kompromisse.',
    items: [
      { icon: Flame, title: 'Next-Gen Firewalls', description: 'Stateful Inspection, Deep Packet Inspection und Application-Layer-Filterung in einer Lösung.' },
      { icon: Lock, title: 'VPN-Systeme', description: 'Site-to-Site, Remote Access und SASE-Lösungen mit MFA und Zero-Trust-Prinzipien.' },
      { icon: KeyRound, title: 'Ende-zu-Ende Verschlüsselung', description: 'AES-256 und TLS 1.3 für Daten in Bewegung und im Ruhezustand — DSGVO-konform.' },
      { icon: Eye, title: 'SIEM-Systeme', description: 'Security Information & Event Management mit Splunk, Sentinel oder Elastic Stack.' },
      { icon: HardDrive, title: 'Backup-Lösungen', description: 'Immutable Backups nach 3-2-1-1-0-Regel — Ransomware-resistent und sofort wiederherstellbar.' },
      { icon: Smartphone, title: 'Multi-Faktor-Authentifizierung', description: 'TOTP, FIDO2 und Hardware-Token. Schluss mit gestohlenen Passwörtern.' },
      { icon: Layers, title: 'Zero Trust Security', description: '„Never trust, always verify" — Identitätsbasierte Zugriffe statt Netzwerk-Perimeter.' },
    ],
  },

  process: {
    eyebrow: 'Unser Vorgehen',
    title: 'Vom Risiko zur belastbaren Sicherheits-Strategie',
    accentWord: 'Sicherheits-Strategie',
    subtitle: 'Strukturiert, transparent, messbar — sechs Schritte zu nachhaltiger Cyber-Resilienz.',
    steps: [
      { number: '01', title: 'Analyse', description: 'Bestandsaufnahme Ihrer IT-Landschaft, Datenflüsse und Compliance-Anforderungen.' },
      { number: '02', title: 'Risiko-Bewertung', description: 'Identifikation kritischer Assets und Bedrohungen nach BSI- oder ISO-Methodik.' },
      { number: '03', title: 'Strategie', description: 'Maßgeschneiderte Roadmap mit Quick-Wins und langfristigen Härtungsmaßnahmen.' },
      { number: '04', title: 'Implementierung', description: 'Umsetzung durch zertifizierte Experten — minimal-invasiv und ohne Betriebsunterbrechung.' },
      { number: '05', title: 'Monitoring', description: '24/7 SOC mit SIEM, Threat Intelligence und proaktiver Bedrohungsjagd.' },
      { number: '06', title: 'Optimierung', description: 'Kontinuierliche Verbesserung durch Audits, Pen-Tests und Lessons Learned.' },
    ],
  },

  technologies: {
    eyebrow: 'Technologie-Stack',
    title: 'Die Tools, mit denen wir arbeiten',
    accentWord: 'Tools',
    subtitle: 'Industriestandards und Best-of-Breed-Lösungen für maximale Effektivität.',
    items: [
      { name: 'Kali Linux', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kalilinux/kalilinux-original.svg' },
      { name: 'Wireshark', logo: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v11/icons/wireshark.svg', invert: true },
      { name: 'Nessus', logo: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v11/icons/tenable.svg', invert: true },
      { name: 'OpenVAS', logo: 'https://www.openvas.org/img/openvas-logo-1.png' },
      { name: 'Splunk', logo: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v11/icons/splunk.svg', invert: true },
      { name: 'CrowdStrike', logo: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v11/icons/crowdstrike.svg', invert: true },
      { name: 'Microsoft Defender', logo: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v11/icons/microsoft.svg', invert: true },
      { name: 'Cisco Security', logo: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v11/icons/cisco.svg', invert: true },
      { name: 'AWS Security', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-plain-wordmark.svg', invert: false },
      { name: 'Azure Security', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azure/azure-original.svg' },
      { name: 'Fortinet', logo: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v11/icons/fortinet.svg', invert: true },
      { name: 'Palo Alto', logo: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v11/icons/paloaltosoftware.svg', invert: true },
    ],
  },

  industries: {
    eyebrow: 'Branchen-Expertise',
    title: 'Sicherheit für regulierte und kritische Industrien',
    accentWord: 'Industrien',
    subtitle: 'Vom Krankenhaus bis zur Behörde — wir kennen die spezifischen Anforderungen Ihrer Branche.',
    items: [
      { icon: Stethoscope, title: 'Gesundheitswesen', description: 'KRITIS-konforme Lösungen für Krankenhäuser, Praxen und Pharma — Patientendatenschutz auf höchstem Niveau.' },
      { icon: Banknote, title: 'Finanzwesen', description: 'BaFin-, MaRisk- und DORA-konforme Security für Banken, Versicherungen und FinTechs.' },
      { icon: Factory, title: 'Industrie & OT', description: 'IT/OT-Sicherheit für Produktionsanlagen, SCADA und IIoT — ohne Stillstandszeiten.' },
      { icon: ShoppingCart, title: 'E-Commerce', description: 'PCI-DSS, Bot-Schutz und Fraud Prevention für Online-Shops und Payment-Plattformen.' },
      { icon: Landmark, title: 'Behörden', description: 'BSI-Grundschutz und VS-NfD-konforme Lösungen für Bund, Länder und Kommunen.' },
      { icon: Rocket, title: 'Startups & Scaleups', description: 'Security by Design — pragmatische, skalierbare Sicherheit für wachsende Tech-Unternehmen.' },
    ],
  },

  testimonials: {
    eyebrow: 'Kundenstimmen',
    title: 'Was Geschäftsführer und CISOs über uns sagen',
    accentWord: 'CISOs',
    subtitle: 'Über 500 Unternehmen vertrauen unserem Security-Team — hier eine Auswahl ihrer Erfahrungen.',
    items: [
      {
        photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=facearea&facepad=2&w=200&h=200&q=80',
        name: 'Dr. Markus Hofmann',
        role: 'CISO',
        company: 'TechMed AG',
        rating: 5,
        quote: 'Nach dem Ransomware-Vorfall waren sie binnen 12 Minuten vor Ort und hatten unser System nach 6 Stunden wiederhergestellt. Beeindruckende Professionalität.',
      },
      {
        photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=facearea&facepad=2&w=200&h=200&q=80',
        name: 'Sandra Bergmann',
        role: 'Head of IT',
        company: 'NordBank GmbH',
        rating: 5,
        quote: 'Das BaFin-Audit haben wir dank des Vorbereitungs-Programms ohne eine einzige Beanstandung bestanden. Sehr empfehlenswert.',
      },
      {
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=200&h=200&q=80',
        name: 'Thomas Wagner',
        role: 'CEO',
        company: 'Bayrische Maschinenbau KG',
        rating: 5,
        quote: 'Unser Penetrationstest deckte gravierende Lücken in der Produktionsumgebung auf — Schäden in Millionenhöhe wurden verhindert.',
      },
      {
        photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=facearea&facepad=2&w=200&h=200&q=80',
        name: 'Julia Reinhardt',
        role: 'Datenschutzbeauftragte',
        company: 'KlinikPlus Verbund',
        rating: 5,
        quote: 'DSGVO-Konformität und KRITIS-Anforderungen perfekt umgesetzt — und das ohne den Klinikbetrieb zu stören.',
      },
      {
        photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=200&h=200&q=80',
        name: 'Stefan Krüger',
        role: 'IT-Leiter',
        company: 'MetallTech Solutions',
        rating: 5,
        quote: 'Das 24/7-Monitoring hat zwei größere Angriffsversuche in den ersten drei Monaten abgewehrt. ROI war sofort gegeben.',
      },
      {
        photo: 'https://images.unsplash.com/photo-1605664041952-4a2855d8e4be?auto=format&fit=facearea&facepad=2&w=200&h=200&q=80',
        name: 'Anna Schmitz',
        role: 'CTO',
        company: 'PayFlow Tech GmbH',
        rating: 5,
        quote: 'Als FinTech sind wir auf maximale Sicherheit angewiesen — das Team versteht unsere Branche und liefert verlässlich.',
      },
    ],
  },

  benefits: {
    eyebrow: 'Ihre Vorteile',
    title: 'Was Sie mit uns gewinnen',
    accentWord: 'gewinnen',
    subtitle: 'Messbarer Mehrwert — von Tag eins.',
    items: [
      { icon: ShieldCheck, title: 'Schutz vor Datenverlust', description: 'Bis zu 99,9% weniger erfolgreiche Angriffe durch Defense-in-Depth-Strategie.' },
      { icon: ClipboardCheck, title: 'DSGVO-Konformität', description: 'Audit-sichere Dokumentation und automatisierte Compliance-Reports auf Knopfdruck.' },
      { icon: Activity, title: '24/7 Sicherheit', description: 'Unser SOC-Team überwacht Ihre Systeme rund um die Uhr — auch an Feiertagen.' },
      { icon: AlertTriangle, title: 'Schnellere Reaktion', description: 'Mean Time to Detect unter 5 Minuten, Mean Time to Respond unter 15 Minuten.' },
      { icon: Server, title: 'Höhere Verfügbarkeit', description: '99,99% Uptime durch proaktive Erkennung und automatisierte Eindämmung von Bedrohungen.' },
      { icon: Banknote, title: 'Finanzieller Schutz', description: 'Vermeidung von Lösegeld, Bußgeldern und Reputationsschäden — Versicherbarkeit inklusive.' },
    ],
  },

  faq: {
    eyebrow: 'FAQ',
    title: 'Häufig gestellte Fragen',
    accentWord: 'Fragen',
    items: [
      {
        question: 'Was kostet ein Penetrationstest?',
        answer:
          'Die Kosten richten sich nach Umfang und Tiefe. Ein Basis-Test für eine Web-Anwendung beginnt bei ca. 4.500 €. Komplexe Tests für Cloud- oder Netzwerkinfrastrukturen liegen zwischen 12.000 und 35.000 €. Sie erhalten von uns immer ein transparentes Festpreis-Angebot.',
      },
      {
        question: 'Wie lange dauert eine umfassende Sicherheitsanalyse?',
        answer:
          'Eine initiale Risiko-Bewertung dauert in der Regel 2–4 Wochen, abhängig von der Unternehmensgröße. Umfassende Compliance-Audits benötigen 6–12 Wochen inklusive Gap-Analyse und Remediation-Plan.',
      },
      {
        question: 'Bieten Sie 24/7 Notfall-Support an?',
        answer:
          'Ja. Unser Security Operations Center ist 365 Tage im Jahr besetzt. Im Notfall sind wir in unter 15 Minuten einsatzbereit — telefonisch über unsere Notfall-Hotline +49 89 12345 670 oder per E-Mail an emergency@yourcompany.de.',
      },
      {
        question: 'Gibt es Managed Security Services?',
        answer:
          'Selbstverständlich. Wir bieten skalierbare MSSP-Pakete: vom 8/5-Monitoring für KMU bis hin zu vollständig ausgelagerten 24/7 SOC-Services inkl. SIEM, EDR, Threat Intelligence und Incident Response.',
      },
      {
        question: 'Wie funktioniert Ihr Security Monitoring?',
        answer:
          'Unser SIEM-System aggregiert Logs aus Firewalls, Endpoints, Cloud und Anwendungen in Echtzeit. KI-gestützte Korrelations-Regeln und Threat Intelligence Feeds erkennen Anomalien, die unser SOC-Team dann verifiziert und eskaliert.',
      },
      {
        question: 'Arbeiten Sie DSGVO-konform?',
        answer:
          'Ja. Alle Datenverarbeitungen erfolgen DSGVO-konform — inklusive Auftragsverarbeitungsverträgen auf Anfrage.',
      },
    ],
  },

  contact: {
    eyebrow: 'Kontakt',
    title: 'Bereit, Ihre Sicherheit zu stärken?',
    accentWord: 'Sicherheit zu stärken?',
    subtitle:
      'Schreiben Sie uns oder rufen Sie an — wir melden uns innerhalb von 24 Stunden mit einer ersten Einschätzung und einem unverbindlichen Angebot.',
    topic: 'Cyber Security Anfrage',
    info: {
      address: 'Maximilianstraße 35a, 80539 München',
      email: 'security@yourcompany.de',
      phone: '+49 89 12345 670',
      emergencyPhone: '+49 800 911 911 1',
    },
  },
};

export default cyberSecurityData;
