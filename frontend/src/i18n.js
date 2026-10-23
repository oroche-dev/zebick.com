import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Übersetzungen
const resources = {
  de: {
    translation: {
      // Navigation
      nav: {
        home: 'Startseite',
        about: 'Über uns',
        services: 'Leistungen',
        portfolio: 'Portfolio',
        contact: 'Kontakt',
      },
      // Hero Section
      hero: {
        badge: 'Digitalagentur & Cyber Security seit 2012',
        title: 'Wir entwickeln digitale Lösungen, die begeistern',
        subtitle: 'Von Webentwicklung bis Cyber Security – Ihr Partner für digitale Exzellenz',
        cta: 'Projekt starten',
        learnMore: 'Mehr erfahren',
      },
      // Services
      services: {
        title: 'Unsere Leistungen',
        subtitle: '9 Servicebereiche für Ihren digitalen Erfolg',
        cyberSecurity: 'Cyber Security',
        cyberSecurityDesc: 'Umfassender Schutz für Ihre digitale Infrastruktur',
        webDev: 'Web Development',
        webDevDesc: 'Moderne, performante Websites',
        appDev: 'App Development',
        appDevDesc: 'Native & Cross-Platform Apps',
        uiux: 'UI/UX Design',
        uiuxDesc: 'Benutzerfreundliche Interfaces',
        gaming: 'Gaming Development',
        gamingDesc: 'Games für alle Plattformen',
        chatbot: 'Chatbot Development',
        chatbotDesc: 'KI-gestützte Chatbots',
        server: 'Server & Cloud',
        serverDesc: 'Zuverlässige Infrastruktur',
        marketing: 'Digital Marketing',
        marketingDesc: 'SEO & Performance Marketing',
        graphics: 'Grafikdesign',
        graphicsDesc: 'Kreative Design-Lösungen',
      },
      // Contact
      contact: {
        title: 'Kontakt aufnehmen',
        subtitle: 'Lassen Sie uns über Ihr Projekt sprechen',
        name: 'Name',
        email: 'E-Mail',
        company: 'Firma',
        service: 'Service',
        budget: 'Budget',
        message: 'Nachricht',
        send: 'Anfrage senden',
        success: 'Vielen Dank! Wir melden uns bald bei Ihnen.',
        selectService: 'Service auswählen',
        selectBudget: 'Budget auswählen',
      },
      // Footer
      footer: {
        tagline: 'Digitale Lösungen die begeistern',
        services: 'Leistungen',
        company: 'Unternehmen',
        about: 'Über uns',
        team: 'Team',
        careers: 'Karriere',
        legal: 'Rechtliches',
        privacy: 'Datenschutz',
        imprint: 'Impressum',
        terms: 'AGB',
        newsletter: 'Newsletter abonnieren',
        newsletterDesc: 'Exklusive Tech-Insights und Sonderangebote direkt in Ihr Postfach.',
        newsletterPlaceholder: 'ihre.email@beispiel.de',
        subscribe: 'Jetzt abonnieren',
        subscribed: 'Erfolgreich abonniert!',
        allRights: 'Alle Rechte vorbehalten',
      },
      // Common
      common: {
        loading: 'Lädt...',
        error: 'Ein Fehler ist aufgetreten',
        retry: 'Erneut versuchen',
        close: 'Schließen',
        save: 'Speichern',
        cancel: 'Abbrechen',
        delete: 'Löschen',
        edit: 'Bearbeiten',
        readMore: 'Mehr lesen',
      },
    },
  },
  en: {
    translation: {
      // Navigation
      nav: {
        home: 'Home',
        about: 'About',
        services: 'Services',
        portfolio: 'Portfolio',
        contact: 'Contact',
      },
      // Hero Section
      hero: {
        badge: 'Digital Agency & Cyber Security since 2012',
        title: 'We develop digital solutions that inspire',
        subtitle: 'From web development to cyber security – Your partner for digital excellence',
        cta: 'Start Project',
        learnMore: 'Learn More',
      },
      // Services
      services: {
        title: 'Our Services',
        subtitle: '9 service areas for your digital success',
        cyberSecurity: 'Cyber Security',
        cyberSecurityDesc: 'Comprehensive protection for your digital infrastructure',
        webDev: 'Web Development',
        webDevDesc: 'Modern, high-performance websites',
        appDev: 'App Development',
        appDevDesc: 'Native & Cross-Platform Apps',
        uiux: 'UI/UX Design',
        uiuxDesc: 'User-friendly interfaces',
        gaming: 'Gaming Development',
        gamingDesc: 'Games for all platforms',
        chatbot: 'Chatbot Development',
        chatbotDesc: 'AI-powered chatbots',
        server: 'Server & Cloud',
        serverDesc: 'Reliable infrastructure',
        marketing: 'Digital Marketing',
        marketingDesc: 'SEO & Performance Marketing',
        graphics: 'Graphic Design',
        graphicsDesc: 'Creative design solutions',
      },
      // Contact
      contact: {
        title: 'Get in Touch',
        subtitle: "Let's talk about your project",
        name: 'Name',
        email: 'Email',
        company: 'Company',
        service: 'Service',
        budget: 'Budget',
        message: 'Message',
        send: 'Send Request',
        success: 'Thank you! We will get back to you soon.',
        selectService: 'Select Service',
        selectBudget: 'Select Budget',
      },
      // Footer
      footer: {
        tagline: 'Digital solutions that inspire',
        services: 'Services',
        company: 'Company',
        about: 'About',
        team: 'Team',
        careers: 'Careers',
        legal: 'Legal',
        privacy: 'Privacy',
        imprint: 'Imprint',
        terms: 'Terms',
        newsletter: 'Subscribe to Newsletter',
        newsletterDesc: 'Exclusive tech insights and special offers directly to your inbox.',
        newsletterPlaceholder: 'your.email@example.com',
        subscribe: 'Subscribe Now',
        subscribed: 'Successfully subscribed!',
        allRights: 'All rights reserved',
      },
      // Common
      common: {
        loading: 'Loading...',
        error: 'An error occurred',
        retry: 'Try again',
        close: 'Close',
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        readMore: 'Read more',
      },
    },
  },
  fr: {
    translation: {
      // Navigation
      nav: {
        home: 'Accueil',
        about: 'À propos',
        services: 'Services',
        portfolio: 'Portfolio',
        contact: 'Contact',
      },
      // Hero Section
      hero: {
        badge: 'Agence digitale & Cyber sécurité depuis 2012',
        title: 'Nous développons des solutions digitales qui inspirent',
        subtitle: "Du développement web à la cyber sécurité – Votre partenaire pour l'excellence digitale",
        cta: 'Démarrer le projet',
        learnMore: 'En savoir plus',
      },
      // Services
      services: {
        title: 'Nos Services',
        subtitle: '9 domaines de service pour votre succès digital',
        cyberSecurity: 'Cyber Sécurité',
        cyberSecurityDesc: 'Protection complète de votre infrastructure digitale',
        webDev: 'Développement Web',
        webDevDesc: 'Sites web modernes et performants',
        appDev: 'Développement App',
        appDevDesc: 'Applications natives & multi-plateformes',
        uiux: 'Design UI/UX',
        uiuxDesc: 'Interfaces conviviales',
        gaming: 'Développement Gaming',
        gamingDesc: 'Jeux pour toutes les plateformes',
        chatbot: 'Développement Chatbot',
        chatbotDesc: 'Chatbots avec IA',
        server: 'Serveur & Cloud',
        serverDesc: 'Infrastructure fiable',
        marketing: 'Marketing Digital',
        marketingDesc: 'SEO & Marketing de performance',
        graphics: 'Design Graphique',
        graphicsDesc: 'Solutions de design créatives',
      },
      // Contact
      contact: {
        title: 'Nous contacter',
        subtitle: 'Parlons de votre projet',
        name: 'Nom',
        email: 'Email',
        company: 'Entreprise',
        service: 'Service',
        budget: 'Budget',
        message: 'Message',
        send: 'Envoyer la demande',
        success: 'Merci! Nous vous répondrons bientôt.',
        selectService: 'Sélectionner le service',
        selectBudget: 'Sélectionner le budget',
      },
      // Footer
      footer: {
        tagline: 'Solutions digitales qui inspirent',
        services: 'Services',
        company: 'Entreprise',
        about: 'À propos',
        team: 'Équipe',
        careers: 'Carrières',
        legal: 'Légal',
        privacy: 'Confidentialité',
        imprint: 'Mentions légales',
        terms: 'CGU',
        newsletter: "S'abonner à la newsletter",
        newsletterDesc: 'Insights technologiques exclusifs et offres spéciales directement dans votre boîte mail.',
        newsletterPlaceholder: 'votre.email@exemple.com',
        subscribe: "S'abonner maintenant",
        subscribed: 'Abonnement réussi!',
        allRights: 'Tous droits réservés',
      },
      // Common
      common: {
        loading: 'Chargement...',
        error: 'Une erreur est survenue',
        retry: 'Réessayer',
        close: 'Fermer',
        save: 'Enregistrer',
        cancel: 'Annuler',
        delete: 'Supprimer',
        edit: 'Modifier',
        readMore: 'Lire la suite',
      },
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'de',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
