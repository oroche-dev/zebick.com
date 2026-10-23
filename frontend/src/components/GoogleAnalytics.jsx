import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Google Analytics 4 — sicher, deaktivierbar und consent-gated.
 *
 * Aktivieren: In `frontend/.env` setzen:
 *   REACT_APP_GA_ID=G-XXXXXXXXXX
 *
 * Wenn leer/nicht gesetzt: Keine Scripts geladen, kein Tracking, keine Cookies.
 * Lädt zusätzlich NUR, wenn der Besucher der "Analyse & Statistik"-Kategorie im
 * Cookie-Banner zugestimmt hat (zebick-cookie-consent.analytics === true) —
 * reagiert live auf das 'zebick-consent-updated' Event aus CookieBanner.jsx,
 * ohne dass ein Reload nötig ist.
 */

const GA_MEASUREMENT_ID = process.env.REACT_APP_GA_ID || '';
const CONFIGURED = GA_MEASUREMENT_ID.startsWith('G-');

function hasAnalyticsConsent() {
  try {
    const raw = localStorage.getItem('zebick-cookie-consent');
    if (!raw) return false;
    return JSON.parse(raw)?.analytics === true;
  } catch {
    return false;
  }
}

function loadGtag() {
  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  script.async = true;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID, {
    anonymize_ip: true, // DSGVO: IP-Anonymisierung
  });
}

const GoogleAnalytics = () => {
  const location = useLocation();
  const [consented, setConsented] = useState(() => CONFIGURED && hasAnalyticsConsent());

  useEffect(() => {
    if (!CONFIGURED) return;
    const onConsentUpdate = () => setConsented(hasAnalyticsConsent());
    window.addEventListener('zebick-consent-updated', onConsentUpdate);
    return () => window.removeEventListener('zebick-consent-updated', onConsentUpdate);
  }, []);

  useEffect(() => {
    if (!CONFIGURED || !consented || window.gtag) return;
    loadGtag();
  }, [consented]);

  useEffect(() => {
    if (!CONFIGURED || !consented || !window.gtag) return;
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: location.pathname + location.search,
      anonymize_ip: true,
    });
  }, [location, consented]);

  return null;
};

export default GoogleAnalytics;

// ===== Tracking Helpers =====
// window.gtag only exists once the user has actually consented and the
// script has loaded (see loadGtag above), so checking it here is sufficient.
export const trackEvent = (eventName, eventParams = {}) => {
  if (CONFIGURED && window.gtag) {
    window.gtag('event', eventName, eventParams);
  }
};

export const trackContactForm = (service) => {
  trackEvent('contact_form_submit', {
    event_category: 'engagement',
    event_label: service || 'general',
  });
};

export const trackNewsletterSignup = () => {
  trackEvent('newsletter_signup', { event_category: 'engagement' });
};

export const trackServiceClick = (serviceName) => {
  trackEvent('service_click', {
    event_category: 'engagement',
    event_label: serviceName,
  });
};
