// Mock Data for zebick Digital Agency Website - Enhanced with Images

export const companyInfo = {
  name: 'zebick',
  tagline: 'Digital Excellence & Cyber Security',
  email: 'kontakt@zebick.com',
  supportEmail: 'support@zebick.com',
  phone: '+41 61 123 45 67',
  address: 'Stellimattweg 36, 4125 Riehen',
};

export const images = {
  hero: 'https://images.unsplash.com/photo-1508361727343-ca787442dcd7?w=1920&q=80',
  heroAlt: 'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=1920&q=80',
  coding: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80',
  codingAlt: 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=800&q=80',
  workspace: 'https://images.unsplash.com/photo-1457305237443-44c3d5a30b89?w=800&q=80',
  security: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800&q=80',
  securityAlt: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80',
  team: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80',
  developer: 'https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg?w=800&q=80',
};

export const heroData = {
  badge: 'Digitalagentur & Cyber Security',
  title: 'Wir entwickeln digitale Lösungen, die begeistern',
  description: 'Von der Webentwicklung bis zur Cyber-Security – wir sind Ihr Partner für innovative digitale Produkte und sichere IT-Infrastrukturen.',
  ctaPrimary: 'Projekt starten',
  ctaSecondary: 'Services entdecken',
  stats: [
    { value: '150+', label: 'Erfolgreiche Projekte' },
    { value: '98%', label: 'Zufriedene Kunden' },
    { value: '12+', label: 'Jahre Erfahrung' },
  ],
};

export const services = [
  {
    id: 'web-development',
    title: 'Webentwicklung',
    description: 'Moderne Websites, Web-Apps, SaaS-Plattformen und individuelle Geschäftsanwendungen.',
    icon: 'Code',
    link: '/services/web-development',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80',
  },
  {
    id: 'app-development',
    title: 'App-Entwicklung',
    description: 'Native und Cross-Platform Apps für iOS und Android mit herausragender User Experience.',
    icon: 'Smartphone',
    link: '/services/app-development',
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&q=80',
  },
  {
    id: 'cyber-security',
    title: 'Cyber Security',
    description: 'Umfassende Sicherheitslösungen: Penetration Testing, Security Audits und Risiko-Analyse.',
    icon: 'Shield',
    link: '/services/cyber-security',
    image: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=600&q=80',
  },
  {
    id: 'ui-ux',
    title: 'UI/UX Design',
    description: 'Benutzerfreundliche Interfaces und durchdachte User Experiences, die konvertieren.',
    icon: 'Palette',
    link: '/services/ui-ux',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80',
  },
  {
    id: 'gaming',
    title: 'Gaming-Entwicklung',
    description: 'Immersive Spielerlebnisse mit Unity und Unreal Engine für alle Plattformen.',
    icon: 'Gamepad2',
    link: '/services/gaming',
    image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&q=80',
  },
  {
    id: 'chatbot',
    title: 'KI-Agenten & Chatbot-Entwicklung',
    description: 'KI-Agenten, intelligente Chatbots & automatisierte Kunden­service-Lösungen mit modernster KI.',
    icon: 'Bot',
    link: '/services/chatbot',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=80',
  },
  {
    id: 'server',
    title: 'Cloud, Hosting & DevOps',
    description: 'Hosting, Cloud-Infrastruktur, Monitoring, Backups und Managed DevOps für Ihr Business.',
    icon: 'Server',
    link: '/services/server',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80',
  },
  {
    id: 'marketing',
    title: 'Digital Marketing, SEO & Lead-Generierung',
    description: 'SEO, Google Ads, LinkedIn Lead-Gen, Conversion-Optimierung & E-Mail-Marketing aus einer Hand.',
    icon: 'TrendingUp',
    link: '/services/marketing',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80',
  },
  {
    id: 'automation-ki',
    title: 'Automatisierung & KI-Lösungen',
    description: 'KI-Agenten, Prozessautomatisierung, CRM-, E-Mail-, WhatsApp- & Lead-Automatisierungen.',
    icon: 'Workflow',
    link: '/services/automatisierung-ki',
    image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&q=80',
  },
  {
    id: 'graphic-design',
    title: 'Grafikdesign',
    description: 'Kreative Designs für Markenidentität, Print und digitale Medien.',
    icon: 'PenTool',
    link: '/services/graphic-design',
    image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&q=80',
  },
];

export const portfolioProjects = [
  // Webentwicklung
  {
    id: 1,
    title: 'FinTech Dashboard',
    description: 'Komplexes Finanz-Dashboard mit Echtzeit-Datenvisualisierung und KI-gestützten Analysen für einen führenden Finanzdienstleister.',
    tags: ['React', 'Node.js', 'D3.js', 'AI'],
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    category: 'Webentwicklung',
    serviceId: 'web-development',
  },
  {
    id: 2,
    title: 'E-Commerce Platform',
    description: 'Skalierbare Multi-Vendor E-Commerce-Plattform mit über 100.000 aktiven Nutzern und integriertem Zahlungssystem.',
    tags: ['Next.js', 'PostgreSQL', 'Stripe', 'AWS'],
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80',
    category: 'Webentwicklung',
    serviceId: 'web-development',
  },
  // App-Entwicklung
  {
    id: 3,
    title: 'Healthcare App',
    description: 'DSGVO-konforme Gesundheits-App für Patientenmanagement mit Telemedizin-Integration.',
    tags: ['React Native', 'Firebase', 'HIPAA'],
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
    category: 'App-Entwicklung',
    serviceId: 'app-development',
  },
  {
    id: 10,
    title: 'Fitness Tracker Pro',
    description: 'Cross-Platform Fitness-App mit Wearable-Integration und personalisierten Trainingsplänen.',
    tags: ['Flutter', 'HealthKit', 'Firebase'],
    image: 'https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?w=800&q=80',
    category: 'App-Entwicklung',
    serviceId: 'app-development',
  },
  // Cyber Security
  {
    id: 4,
    title: 'Security Audit - Großbank',
    description: 'Umfassende Sicherheitsanalyse und Penetration Testing für eine der größten deutschen Banken.',
    tags: ['Penetration Testing', 'OWASP', 'Compliance'],
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80',
    category: 'Cyber Security',
    serviceId: 'cyber-security',
  },
  {
    id: 11,
    title: 'Zero-Trust Implementation',
    description: 'Enterprise-weite Zero-Trust Architektur für internationalen Konzern mit 50.000 Mitarbeitern.',
    tags: ['Zero Trust', 'IAM', 'Cloud Security'],
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80',
    category: 'Cyber Security',
    serviceId: 'cyber-security',
  },
  // Gaming
  {
    id: 5,
    title: 'AR Gaming Experience',
    description: 'Augmented Reality Spiel mit über 500.000 Downloads und innovativer Multiplayer-Funktionalität.',
    tags: ['Unity', 'ARKit', 'Multiplayer'],
    image: 'https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?w=800&q=80',
    category: 'Gaming',
    serviceId: 'gaming',
  },
  {
    id: 12,
    title: 'Indie RPG Adventure',
    description: 'Preisgekröntes Story-driven RPG mit über 40 Stunden Spielzeit und dynamischem Kampfsystem.',
    tags: ['Unreal Engine', '3D', 'RPG'],
    image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&q=80',
    category: 'Gaming',
    serviceId: 'gaming',
  },
  // Chatbot / KI
  {
    id: 6,
    title: 'KI-Chatbot System',
    description: 'Enterprise-Chatbot mit NLP für einen internationalen Versicherungskonzern – 70% Reduzierung der Support-Anfragen.',
    tags: ['OpenAI', 'Python', 'NLP'],
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
    category: 'Chatbot & KI',
    serviceId: 'chatbot',
  },
  {
    id: 13,
    title: 'Voice Assistant Platform',
    description: 'Multi-Language Voice-Bot für Customer Service mit 95% Erkennungsgenauigkeit.',
    tags: ['GPT-4', 'Speech-to-Text', 'NLU'],
    image: 'https://images.unsplash.com/photo-1589254065878-42c9da997008?w=800&q=80',
    category: 'Chatbot & KI',
    serviceId: 'chatbot',
  },
  // UI/UX Design
  {
    id: 7,
    title: 'Banking App Redesign',
    description: 'Komplettes UX-Redesign einer Mobile Banking App mit 40% gesteigerter Nutzeraktivität.',
    tags: ['Figma', 'User Research', 'Prototyping'],
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80',
    category: 'UI/UX Design',
    serviceId: 'ui-ux',
  },
  {
    id: 14,
    title: 'SaaS Dashboard Design',
    description: 'Design System und Dashboard für Enterprise SaaS-Plattform mit über 200 Komponenten.',
    tags: ['Design System', 'Accessibility', 'Dark Mode'],
    image: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=800&q=80',
    category: 'UI/UX Design',
    serviceId: 'ui-ux',
  },
  // Server & Cloud
  {
    id: 8,
    title: 'Multi-Cloud Migration',
    description: 'Migration von Legacy-Systemen zu einer hybriden Multi-Cloud-Architektur für Versicherungskonzern.',
    tags: ['AWS', 'Azure', 'Kubernetes', 'Terraform'],
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
    category: 'Server & Cloud',
    serviceId: 'server',
  },
  {
    id: 15,
    title: 'High-Performance API Gateway',
    description: 'Skalierbare API-Infrastruktur mit 99.99% Uptime für 10 Millionen tägliche Requests.',
    tags: ['Kong', 'Docker', 'CI/CD'],
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
    category: 'Server & Cloud',
    serviceId: 'server',
  },
  // Marketing & SEO
  {
    id: 9,
    title: 'E-Commerce SEO Relaunch',
    description: 'SEO-Strategie für Online-Shop mit 300% Traffic-Steigerung in 6 Monaten.',
    tags: ['SEO', 'Google Ads', 'Analytics'],
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
    category: 'Marketing & SEO',
    serviceId: 'marketing',
  },
  {
    id: 16,
    title: 'Performance Marketing Kampagne',
    description: 'Internationale Google Ads & Social Media Kampagne mit 5x ROAS für D2C Brand.',
    tags: ['Google Ads', 'Meta Ads', 'Conversion'],
    image: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=800&q=80',
    category: 'Marketing & SEO',
    serviceId: 'marketing',
  },
  // Grafikdesign
  {
    id: 17,
    title: 'Corporate Brand Identity',
    description: 'Komplette Markenidentität für Tech-Startup inkl. Logo, Guidelines und Marketing-Materialien.',
    tags: ['Branding', 'Logo Design', 'Guidelines'],
    image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&q=80',
    category: 'Grafikdesign',
    serviceId: 'graphic-design',
  },
  {
    id: 18,
    title: 'Produktverpackung & Print',
    description: 'Premium Packaging Design für Lifestyle-Brand mit nachhaltigem Fokus.',
    tags: ['Packaging', 'Print', 'Sustainability'],
    image: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=800&q=80',
    category: 'Grafikdesign',
    serviceId: 'graphic-design',
  },
];

export const testimonials = [
  {
    id: 1,
    name: 'Dr. Michael Schneider',
    role: 'CTO, TechVision GmbH',
    content: 'zebick hat unsere komplette digitale Infrastruktur transformiert. Die Zusammenarbeit war professionell und die Ergebnisse übertreffen unsere Erwartungen.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80',
    rating: 5,
  },
  {
    id: 2,
    name: 'Sarah Müller',
    role: 'Geschäftsführerin, StartupHub',
    content: 'Von der ersten Beratung bis zum Go-Live – das Team von zebick hat uns mit ihrer Expertise und Zuverlässigkeit beeindruckt. Absolut empfehlenswert!',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
    rating: 5,
  },
  {
    id: 3,
    name: 'Thomas Weber',
    role: 'IT-Leiter, SecureBank AG',
    content: 'Die Security-Audits von zebick haben kritische Schwachstellen aufgedeckt. Ihre proaktive Herangehensweise hat unsere Sicherheit signifikant verbessert.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
    rating: 5,
  },
];

export const aboutContent = {
  mission: 'Wir verbinden technische Exzellenz mit kreativem Design, um digitale Produkte zu schaffen, die nicht nur funktionieren, sondern begeistern. Seit unserer Gründung im Jahr 2012 haben wir es uns zur Aufgabe gemacht, Unternehmen jeder Größe bei ihrer digitalen Transformation zu unterstützen. Dabei setzen wir auf nachhaltige Lösungen, die Ihrem Geschäft langfristigen Mehrwert bieten.',
  vision: 'Unser Ziel ist es, der vertrauenswürdigste Partner für digitale Transformation und Cyber Security in der DACH-Region zu sein. Wir streben danach, nicht nur die Erwartungen unserer Kunden zu erfüllen, sondern sie zu übertreffen – mit Innovationen, die die Zukunft gestalten, und Sicherheitslösungen, die Vertrauen schaffen.',
  story: 'zebick wurde 2024 von drei leidenschaftlichen IT-Experten in einem kleinen Büro gegründet. Was als Startup mit einer Vision für sichere, innovative digitale Lösungen begann, ist heute eine schnell wachsende Digitalagentur in der DACH-Region. Unsere Reise ist geprägt von kontinuierlichem Lernen, mutigen Entscheidungen und dem unerschütterlichen Glauben an die Kraft der Technologie, Unternehmen zu transformieren.',
  philosophy: 'Bei zebick glauben wir, dass großartige digitale Produkte an der Schnittstelle von Technologie, Design und Sicherheit entstehen. Wir verfolgen einen ganzheitlichen Ansatz, bei dem jede Zeile Code mit Bedacht geschrieben und jede Designentscheidung hinterfragt wird. Sicherheit ist kein nachträglicher Gedanke – sie ist in alles eingebaut, was wir tun.',
  culture: 'Unsere Unternehmenskultur basiert auf Offenheit, kontinuierlichem Lernen und gegenseitigem Respekt. Wir fördern eine Umgebung, in der Innovation gedeihen kann und jede Stimme gehört wird. Mit Team-Events, Weiterbildungsprogrammen und einer ausgewogenen Work-Life-Balance schaffen wir einen Arbeitsplatz, an dem Talente ihr volles Potenzial entfalten können.',
  whyUs: [
    'Über 150 erfolgreich abgeschlossene Projekte in 12 Jahren',
    'Internationale Kunden aus Deutschland, Österreich und der Schweiz',
    'Persönliche Betreuung durch dedizierte Projektmanager',
    '24/7 Support für kritische Systeme',
    'Transparente Kommunikation und agile Entwicklungsmethoden',
  ],
  values: [
    {
      title: 'Innovation',
      description: 'Wir nutzen die neuesten Technologien und Methoden für zukunftssichere Lösungen. Unser Team bildet sich kontinuierlich weiter und experimentiert mit neuen Ansätzen.',
    },
    {
      title: 'Qualität',
      description: 'Jedes Projekt wird mit höchsten Qualitätsstandards und Liebe zum Detail umgesetzt. Wir liefern erst ab, wenn wir selbst vollständig zufrieden sind.',
    },
    {
      title: 'Sicherheit',
      description: 'Security by Design ist kein Buzzword für uns – es ist unsere Philosophie. Jede Lösung wird von Grund auf mit Sicherheit im Blick entwickelt.',
    },
    {
      title: 'Partnerschaft',
      description: 'Wir arbeiten eng mit unseren Kunden zusammen und verstehen uns als Teil ihres Teams. Ihr Erfolg ist unser Erfolg – das treibt uns jeden Tag an.',
    },
  ],
  team: [
    { name: 'Max Mustermann', role: 'Gründer & CEO', bio: '15 Jahre Erfahrung in der IT-Branche, ehemalig bei SAP und Microsoft. Visionär mit Leidenschaft für Innovation.', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&q=80' },
    { name: 'Lisa Schmidt', role: 'Head of Development', bio: 'Full-Stack Expertin mit Fokus auf skalierbare Architekturen. Führt unser 20-köpfiges Entwicklerteam.', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&q=80' },
    { name: 'Jan Becker', role: 'Lead Security Engineer', bio: 'Certified Ethical Hacker (CEH) mit über 500 durchgeführten Penetrationstests. Ihr System ist bei ihm sicher.', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&q=80' },
    { name: 'Anna König', role: 'Creative Director', bio: 'Award-winning Designer mit Gespür für zeitlose Ästhetik. Gewinnerin des German Design Award 2024.', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&q=80' },
  ],
  stats: {
    yearsExperience: 12,
    completedProjects: 150,
    teamMembers: 50,
    clientSatisfaction: 98,
    countries: 3,
    technologies: 50,
  },
  locations: [
    { city: 'Basel', country: 'Schweiz', address: 'Stellimattweg 36, 4125 Riehen', isHQ: true },
  ],
};

export const cyberSecurityServices = [
  {
    id: 'web-security',
    title: 'Web Application Security',
    description: 'Umfassende Sicherheitsanalyse nach OWASP Top 10 Standards für Ihre Webanwendungen.',
    features: ['SQL Injection Testing', 'XSS Detection', 'Authentication Bypass', 'Session Management'],
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80',
  },
  {
    id: 'pentest',
    title: 'Penetration Testing',
    description: 'Simulierte Cyberangriffe zur Identifizierung von Schwachstellen in Ihrer IT-Infrastruktur.',
    features: ['Black-Box Testing', 'White-Box Testing', 'Social Engineering', 'Physical Security'],
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&q=80',
  },
  {
    id: 'audit',
    title: 'Security Audits',
    description: 'Gründliche Überprüfung von Code, Servern und Cloud-Infrastrukturen.',
    features: ['Code Review', 'Configuration Audit', 'Compliance Check', 'Documentation'],
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&q=80',
  },
  {
    id: 'hardening',
    title: 'Cloud & Server Hardening',
    description: 'Absicherung und Optimierung Ihrer Cloud- und Server-Infrastruktur.',
    features: ['AWS/Azure/GCP', 'Firewall Configuration', 'Access Control', 'Monitoring Setup'],
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80',
  },
  {
    id: 'risk',
    title: 'Risiko-Analyse & Prävention',
    description: 'Proaktive Identifizierung und Minimierung von Sicherheitsrisiken.',
    features: ['Threat Modeling', 'Risk Assessment', 'Security Policies', 'Incident Response'],
    image: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=600&q=80',
  },
];

export const clients = [
  { name: 'TechVision', logo: null },
  { name: 'StartupHub', logo: null },
  { name: 'SecureBank', logo: null },
  { name: 'InnovateCorp', logo: null },
  { name: 'DigiTrans', logo: null },
  { name: 'CloudFirst', logo: null },
];

export const navigationLinks = [
  { label: 'Home', path: '/' },
  { label: 'Über uns', path: '/about' },
  { label: 'Services', path: '/services' },
  { label: 'Portfolio', path: '/portfolio' },
  { label: 'Blog', path: '/blog' },
  { label: 'Kostenlose Analyse', path: '/kostenlose-analyse' },
  { label: 'Kontakt', path: '/contact' },
];

export const footerLinks = {
  services: [
    { label: 'Webentwicklung', path: '/services/webentwicklung' },
    { label: 'App-Entwicklung', path: '/services/app-entwicklung' },
    { label: 'Cyber Security', path: '/services/cyber-security' },
    { label: 'UI/UX Design', path: '/services/ui-ux-design' },
    { label: 'Marketing & SEO', path: '/services/digitales-marketing-seo' },
  ],
  company: [
    { label: 'Über uns', path: '/about' },
    { label: 'Portfolio', path: '/portfolio' },
    { label: 'Blog', path: '/blog' },
  ],
  legal: [
    { label: 'Impressum', path: '/impressum' },
    { label: 'Datenschutz', path: '/datenschutz' },
    { label: 'AGB', path: '/agb' },
  ],
};

export const chatbotConfig = {
  welcomeMessage: 'Hallo! 👋 Ich bin der zebick Assistent. Wie kann ich Ihnen heute helfen?',
  quickReplies: [
    'Services erkunden',
    'Projekt anfragen',
    'Preise erfahren',
    'Cyber Security Beratung',
  ],
};

export const features = [
  {
    title: 'Agile Entwicklung',
    description: 'Flexible Prozesse mit wöchentlichen Sprints und kontinuierlichem Feedback.',
    icon: 'Zap',
  },
  {
    title: 'Modernste Technologien',
    description: 'React, Node.js, Python, Cloud-Native – wir setzen auf bewährte Stacks.',
    icon: 'Code',
  },
  {
    title: 'Security First',
    description: 'Sicherheit ist in jeden Entwicklungsschritt integriert.',
    icon: 'Shield',
  },
  {
    title: '24/7 Support',
    description: 'Rund-um-die-Uhr Erreichbarkeit für kritische Systeme.',
    icon: 'Headphones',
  },
];
