import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Cookie, 
  Shield, 
  BarChart3, 
  Target, 
  Check, 
  ChevronDown, 
  ChevronUp,
  Clock,
  Info,
  Lock,
  ExternalLink
} from 'lucide-react';
import './CookieBanner.css';

// Cookie data with detailed information
const cookieCategories = [
  {
    id: 'necessary',
    name: 'Notwendig',
    icon: Shield,
    description: 'Diese Cookies sind für die Grundfunktionen der Website unerlässlich. Sie ermöglichen grundlegende Funktionen wie Seitennavigation und Zugriff auf sichere Bereiche.',
    duration: 'Session - 1 Jahr',
    required: true,
    cookies: [
      { name: 'session_id', purpose: 'Sitzungsverwaltung', duration: 'Session' },
      { name: 'cookie_consent', purpose: 'Speichert Ihre Cookie-Einstellungen', duration: '1 Jahr' },
      { name: 'csrf_token', purpose: 'Sicherheit gegen Cross-Site-Angriffe', duration: 'Session' },
    ]
  },
  {
    id: 'analytics',
    name: 'Analyse & Statistik',
    icon: BarChart3,
    description: 'Diese Cookies helfen uns zu verstehen, wie Besucher mit unserer Website interagieren. Die gesammelten Informationen werden anonymisiert und dienen zur Verbesserung unserer Dienste.',
    duration: 'Bis zu 2 Jahre',
    required: false,
    cookies: [
      { name: '_ga', purpose: 'Google Analytics - Unterscheidung von Nutzern', duration: '2 Jahre' },
      { name: '_gid', purpose: 'Google Analytics - Unterscheidung von Nutzern', duration: '24 Stunden' },
      { name: '_gat', purpose: 'Google Analytics - Anfragenrate drosseln', duration: '1 Minute' },
    ]
  },
  {
    id: 'marketing',
    name: 'Marketing & Werbung',
    icon: Target,
    description: 'Marketing-Cookies werden verwendet, um Besuchern relevante Werbung anzuzeigen. Diese Cookies verfolgen Besucher über verschiedene Websites hinweg.',
    duration: 'Bis zu 2 Jahre',
    required: false,
    cookies: [
      { name: '_fbp', purpose: 'Facebook Pixel - Werbung', duration: '3 Monate' },
      { name: 'fr', purpose: 'Facebook - Werbeanzeigen', duration: '3 Monate' },
      { name: 'IDE', purpose: 'Google DoubleClick - Werbung', duration: '1 Jahr' },
    ]
  }
];

const CookieBanner = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/zb-panel-8x2k');
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    if (isAdminRoute) return; // never show on admin routes
    const consent = localStorage.getItem('zebick-cookie-consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, [isAdminRoute]);

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
      version: '1.0',
    };
    localStorage.setItem('zebick-cookie-consent', JSON.stringify(allAccepted));
    window.dispatchEvent(new Event('zebick-consent-updated'));
    setIsVisible(false);
  };

  const handleAcceptNecessary = () => {
    const necessaryOnly = {
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
      version: '1.0',
    };
    localStorage.setItem('zebick-cookie-consent', JSON.stringify(necessaryOnly));
    window.dispatchEvent(new Event('zebick-consent-updated'));
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    const savedPreferences = {
      ...preferences,
      timestamp: new Date().toISOString(),
      version: '1.0',
    };
    localStorage.setItem('zebick-cookie-consent', JSON.stringify(savedPreferences));
    window.dispatchEvent(new Event('zebick-consent-updated'));
    setIsVisible(false);
  };

  const togglePreference = (key) => {
    if (key === 'necessary') return;
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleCategoryExpand = (categoryId) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  if (!isVisible) return null;

  return (
    <div className="cookie-banner-wrapper" data-testid="cookie-banner-overlay">
      <div className={`cookie-banner-container ${showDetails ? 'expanded' : ''}`} data-testid="cookie-banner">
        
        {/* Header */}
        <div className="cookie-header">
          <div className="cookie-header-icon">
            <Lock size={20} />
          </div>
          <div className="cookie-header-text">
            <h3 data-testid="cookie-banner-title">Datenschutz-Einstellungen</h3>
            <p className="cookie-subtitle">Wir respektieren Ihre Privatsphäre</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="cookie-main">
          <p className="cookie-description">
            <span className="cookie-desc-full">
              Wir verwenden Cookies und ähnliche Technologien, um Ihnen ein optimales Website-Erlebnis zu bieten. 
              Einige Cookies sind technisch notwendig, andere helfen uns, die Website zu verbessern und Ihnen 
              personalisierte Inhalte anzuzeigen.
            </span>
            <span className="cookie-desc-short">
              Wir nutzen Cookies, um Ihre Erfahrung zu verbessern. Notwendige Cookies sind aktiv, weitere können Sie selbst wählen.
            </span>
          </p>

          {/* Quick Stats */}
          <div className="cookie-stats">
            <div className="cookie-stat">
              <Shield size={14} />
              <span>DSGVO-konform</span>
            </div>
            <div className="cookie-stat">
              <Lock size={14} />
              <span>SSL-verschlüsselt</span>
            </div>
            <div className="cookie-stat">
              <Clock size={14} />
              <span>Jederzeit widerrufbar</span>
            </div>
          </div>

          {/* Details Section */}
          {showDetails && (
            <div className="cookie-details" data-testid="cookie-settings">
              <div className="cookie-details-header">
                <Info size={16} />
                <span>Cookie-Kategorien im Detail</span>
              </div>

              <div className="cookie-categories">
                {cookieCategories.map((category) => {
                  const IconComponent = category.icon;
                  const isExpanded = expandedCategory === category.id;
                  const isActive = preferences[category.id];

                  return (
                    <div 
                      key={category.id} 
                      className={`cookie-category ${isActive ? 'active' : ''} ${category.required ? 'required' : ''}`}
                    >
                      {/* Category Header */}
                      <div className="cookie-category-header">
                        <div className="cookie-category-left">
                          <div className={`cookie-category-icon ${category.id}`}>
                            <IconComponent size={18} />
                          </div>
                          <div className="cookie-category-info">
                            <div className="cookie-category-title">
                              {category.name}
                              {category.required && (
                                <span className="cookie-required-badge">Erforderlich</span>
                              )}
                            </div>
                            <div className="cookie-category-duration">
                              <Clock size={12} />
                              <span>{category.duration}</span>
                            </div>
                          </div>
                        </div>

                        <div className="cookie-category-right">
                          {category.required ? (
                            <div className="cookie-always-on">
                              <Check size={14} />
                              <span>Immer aktiv</span>
                            </div>
                          ) : (
                            <button 
                              className={`cookie-toggle ${isActive ? 'active' : ''}`}
                              onClick={() => togglePreference(category.id)}
                              data-testid={`toggle-${category.id}`}
                              aria-label={`${category.name} cookies toggle`}
                            >
                              <span className="cookie-toggle-track">
                                <span className="cookie-toggle-thumb" />
                              </span>
                            </button>
                          )}
                          
                          <button 
                            className="cookie-expand-btn"
                            onClick={() => toggleCategoryExpand(category.id)}
                            aria-label={`${category.name} Details ${isExpanded ? 'ausblenden' : 'anzeigen'}`}
                          >
                            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </button>
                        </div>
                      </div>

                      {/* Category Description */}
                      <p className="cookie-category-desc">{category.description}</p>

                      {/* Expanded Cookie List */}
                      {isExpanded && (
                        <div className="cookie-list">
                          <div className="cookie-list-header">
                            <span>Cookie</span>
                            <span>Zweck</span>
                            <span>Laufzeit</span>
                          </div>
                          {category.cookies.map((cookie, idx) => (
                            <div key={idx} className="cookie-list-item">
                              <span className="cookie-name">{cookie.name}</span>
                              <span className="cookie-purpose">{cookie.purpose}</span>
                              <span className="cookie-duration">{cookie.duration}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="cookie-actions">
          <div className="cookie-buttons">
            {!showDetails ? (
              <>
                <button 
                  className="cookie-btn secondary"
                  onClick={() => setShowDetails(true)}
                  data-testid="cookie-settings-btn"
                >
                  Einstellungen anpassen
                </button>
                <button 
                  className="cookie-btn outline"
                  onClick={handleAcceptNecessary}
                  data-testid="cookie-decline-btn"
                >
                  Nur Notwendige
                </button>
                <button
                  className="cookie-btn primary btn-fill"
                  onClick={handleAcceptAll}
                  data-testid="cookie-accept-btn"
                >
                  <Check size={16} />
                  Alle akzeptieren
                </button>
              </>
            ) : (
              <>
                <button 
                  className="cookie-btn secondary"
                  onClick={() => setShowDetails(false)}
                  data-testid="cookie-back-btn"
                >
                  Zurück
                </button>
                <button
                  className="cookie-btn primary btn-fill"
                  onClick={handleSavePreferences}
                  data-testid="cookie-save-btn"
                >
                  <Check size={16} />
                  Auswahl bestätigen
                </button>
              </>
            )}
          </div>

          {/* Footer Links */}
          <div className="cookie-footer">
            <div className="cookie-links">
              <Link to="/datenschutz" className="cookie-link" data-testid="cookie-privacy-link">
                <ExternalLink size={12} />
                Datenschutzerklärung
              </Link>
              <Link to="/impressum" className="cookie-link">
                <ExternalLink size={12} />
                Impressum
              </Link>
              <Link to="/cookie-richtlinie" className="cookie-link">
                <ExternalLink size={12} />
                Cookie-Richtlinie
              </Link>
            </div>
            <p className="cookie-copyright">
              © {new Date().getFullYear()} Zebick. Alle Rechte vorbehalten.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
