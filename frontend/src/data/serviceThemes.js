/**
 * Per-category hero theming for dynamic /services/:slug pages.
 * Mirrors the look of the existing static landing pages
 * (e.g. "Maximale Sicherheit für Ihr Business" hero on Cyber Security).
 *
 * Key: kebab-case slug. Falls back to a generic block-style hero.
 */

export const SERVICE_THEMES = {
  'webentwicklung': {
    badge: 'Webentwicklung',
    heroLines: ['Performante', 'Websites', 'die wirken.'],
    accentWord: 'Websites',
    description:
      'Wir entwickeln moderne, schnelle und SEO-optimierte Websites & Web-Apps – von der Landingpage bis zur komplexen Plattform. Mit React, Next.js und FastAPI bauen wir Lösungen, die heute liefern und morgen skalieren.',
    primaryCta: 'Kostenloses Web-Konzept anfragen',
    stats: [
      { value: '50+', label: 'Websites & Web-Apps' },
      { value: '99%', label: 'Lighthouse-Score' },
      { value: '< 4 W.', label: 'Time-to-Launch' },
    ],
  },
  'app-entwicklung': {
    badge: 'App-Entwicklung',
    heroLines: ['Apps die', 'begeistern', 'auf iOS & Android.'],
    accentWord: 'begeistern',
    description:
      'Native und Cross-Platform Apps für iOS und Android. Vom MVP bis zum Store-Launch – mit React Native, Flutter oder Swift bauen wir Apps, die deine Nutzer:innen lieben.',
    primaryCta: 'App-Idee besprechen',
    stats: [
      { value: '30+', label: 'Veröffentlichte Apps' },
      { value: '4.8★', label: 'Ø Store-Rating' },
      { value: 'iOS+', label: 'Cross-Platform' },
    ],
  },
  'cyber-security': {
    badge: 'Cyber Security',
    heroLines: ['Maximale', 'Sicherheit', 'für Ihr Business.'],
    accentWord: 'Sicherheit',
    description:
      'Schützen Sie Ihre digitalen Assets mit unseren professionellen Cyber Security Services. Von Penetration Testing bis Cloud Hardening – wir sichern Ihre IT-Infrastruktur.',
    primaryCta: 'Kostenlose Sicherheitsanalyse',
    stats: [
      { value: '500+', label: 'Security Audits' },
      { value: '24/7', label: 'Monitoring' },
      { value: 'ISO 27k', label: 'Compliance' },
    ],
  },
  'ui-ux-design': {
    badge: 'UI/UX Design',
    heroLines: ['Design das', 'verkauft', 'und Nutzer liebt.'],
    accentWord: 'verkauft',
    description:
      'Nutzerzentriertes Interface- und Experience-Design. Von User Research über Prototyping bis Design-System – wir machen Produkte einfacher, schöner und profitabler.',
    primaryCta: 'Design-Audit starten',
    stats: [
      { value: '120+', label: 'Design-Projekte' },
      { value: '+38%', label: 'Ø Conversion-Lift' },
      { value: 'WCAG', label: 'Accessibility-First' },
    ],
  },
  'gaming-entwicklung': {
    badge: 'Gaming-Entwicklung',
    heroLines: ['Games die', 'fesseln.', '2D · 3D · VR.'],
    accentWord: 'fesseln.',
    description:
      'Wir entwickeln Spielmechaniken, Game-Worlds und Multiplayer-Erlebnisse mit Unity & Unreal Engine – auf PC, Konsole, Mobile und VR/AR.',
    primaryCta: 'Game-Konzept einreichen',
    stats: [
      { value: '15+', label: 'Released Games' },
      { value: 'Unity', label: '& Unreal Engine' },
      { value: 'VR-ready', label: 'Cross-Platform' },
    ],
  },
  'chatbot-entwicklung': {
    badge: 'Chatbot-Entwicklung',
    heroLines: ['KI die', 'verkauft.', '24/7 für dich.'],
    accentWord: 'verkauft.',
    description:
      'GPT-gestützte Chatbots, die Leads qualifizieren, Fragen beantworten und Termine buchen – integriert in Website, WhatsApp, Slack & mehr.',
    primaryCta: 'Demo-Bot anfragen',
    stats: [
      { value: '24/7', label: 'Verfügbar' },
      { value: 'GPT-5', label: 'KI-Modelle' },
      { value: '+62%', label: 'Mehr Leads' },
    ],
  },
  'server-systeme': {
    badge: 'Server & Systeme',
    heroLines: ['Infrastruktur', 'die hält.', 'DevOps & Cloud.'],
    accentWord: 'hält.',
    description:
      'AWS, Azure, Kubernetes, CI/CD – wir bauen, härten und betreiben deine Server-Landschaft mit 99,9 % Uptime und vollständigem Monitoring.',
    primaryCta: 'Infrastruktur-Audit anfragen',
    stats: [
      { value: '99.9%', label: 'Uptime SLA' },
      { value: 'K8s', label: 'Container-Native' },
      { value: '24/7', label: 'On-Call' },
    ],
  },
  'digitales-marketing-seo': {
    badge: 'Digitales Marketing & SEO',
    heroLines: ['Sichtbarkeit', 'die wächst.', 'SEO + Performance.'],
    accentWord: 'wächst.',
    description:
      'Google Ads, SEO-Strategie, Content-Marketing und Analytics – wir sorgen dafür, dass deine Zielgruppe dich findet und bei dir kauft.',
    primaryCta: 'Kostenloses SEO-Audit',
    stats: [
      { value: '+248%', label: 'Ø Traffic-Wachstum' },
      { value: 'ROAS', label: 'fokussiert' },
      { value: 'Top-10', label: 'Google-Ranking' },
    ],
  },
  'grafikdesign': {
    badge: 'Grafikdesign',
    heroLines: ['Brands die', 'bleiben.', 'Logo · Print · Motion.'],
    accentWord: 'bleiben.',
    description:
      'Logo-Entwicklung, Brand-Identity, Print & digitale Assets, Motion-Graphics – wir geben deiner Marke ein Gesicht, an das man sich erinnert.',
    primaryCta: 'Branding-Projekt starten',
    stats: [
      { value: '80+', label: 'Brand-Identitäten' },
      { value: 'Print+', label: 'Digital' },
      { value: 'Motion', label: 'Graphics' },
    ],
  },
};

export function getThemeForCategory(category) {
  if (!category) return null;
  const fromMap = SERVICE_THEMES[category.slug];
  if (fromMap) return fromMap;
  // Auto-generate a generic 3-line hero from name
  const words = (category.name || '').split(' ');
  const accentWord = words[words.length - 1] || category.name || 'starten.';
  return {
    badge: category.name,
    heroLines: [category.name],
    accentWord,
    description: category.description || `Professionelle ${category.name}-Leistungen von Zebick.`,
    primaryCta: 'Jetzt unverbindlich anfragen',
    stats: [],
  };
}
