import React from 'react';
import { Cookie, Shield, BarChart3, Target, Clock, Info } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Chatbot from '../components/chatbot/Chatbot';
import Seo from '../components/common/Seo';

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
    ],
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
    ],
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
    ],
  },
];

const CookieRichtliniePage = () => {
  const handleOpenSettings = () => {
    localStorage.removeItem('zebick-cookie-consent');
    window.location.reload();
  };

  return (
    <>
      <Seo title="Cookie-Richtlinie" description="Welche Cookies Zebick einsetzt und wie Sie Ihre Auswahl verwalten können." path="/cookie-richtlinie" />
      <Header />

      {/* Hero Section */}
      <section style={{
        paddingTop: '140px',
        paddingBottom: '60px',
        background: 'var(--bg-primary)',
      }}>
        <div className="container">
          <div style={{ maxWidth: '800px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 20px',
              background: 'rgba(255, 107, 0, 0.1)',
              border: '1px solid rgba(255, 107, 0, 0.3)',
              borderRadius: '50px',
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--accent-primary)',
              marginBottom: '24px',
            }}>
              <Cookie size={16} />
              Rechtliches
            </span>

            <h1 style={{
              fontSize: '48px',
              fontWeight: 900,
              marginBottom: '16px',
            }}>
              Cookie-Richtlinie
            </h1>

            <p style={{
              fontSize: '18px',
              color: 'var(--text-muted)',
            }}>
              Welche Cookies wir einsetzen und wie Sie Ihre Auswahl verwalten können
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section style={{
        padding: '40px 0 100px',
        background: 'var(--bg-secondary)',
      }}>
        <div className="container">
          <div style={{
            maxWidth: '900px',
            display: 'flex',
            flexDirection: 'column',
            gap: '32px',
          }}>
            {/* Intro */}
            <div style={{
              padding: '40px',
              background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '20px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <div style={{
                  width: '56px', height: '56px', background: 'rgba(255, 107, 0, 0.15)', borderRadius: '14px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Info size={28} color="var(--accent-primary)" />
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: 700 }}>Was sind Cookies?</h2>
              </div>
              <p style={{ lineHeight: 1.8, color: 'var(--text-secondary)', fontSize: '15px' }}>
                Cookies sind kleine Textdateien, die beim Besuch unserer Website auf Ihrem Endgerät gespeichert werden.
                Sie richten keinen Schaden an und dienen dazu, unsere Website sicherer, nutzerfreundlicher und
                effizienter zu machen. Nähere Informationen zur Verarbeitung Ihrer Daten finden Sie in unserer{' '}
                <a href="/datenschutz" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>Datenschutzerklärung</a>.
              </p>
              <button
                onClick={handleOpenSettings}
                style={{
                  marginTop: '24px',
                  padding: '12px 24px',
                  background: 'var(--accent-primary)',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Cookie-Einstellungen öffnen
              </button>
            </div>

            {/* Categories */}
            {cookieCategories.map((category) => {
              const Icon = category.icon;
              return (
                <div
                  key={category.id}
                  style={{
                    padding: '40px',
                    background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '20px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                    <div style={{
                      width: '56px', height: '56px', background: 'rgba(255, 107, 0, 0.15)', borderRadius: '14px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <Icon size={28} color="var(--accent-primary)" />
                    </div>
                    <div>
                      <h2 style={{ fontSize: '22px', fontWeight: 700 }}>{category.name}</h2>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
                        <Clock size={13} />
                        {category.duration}
                        {category.required && (
                          <span style={{
                            marginLeft: '8px', padding: '2px 10px', borderRadius: '20px',
                            background: 'rgba(255, 107, 0, 0.15)', color: 'var(--accent-primary)', fontSize: '11px', fontWeight: 700,
                          }}>Erforderlich</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <p style={{ lineHeight: 1.8, color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '20px' }}>
                    {category.description}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{
                      display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '12px',
                      fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase',
                      padding: '0 16px', letterSpacing: '0.05em',
                    }}>
                      <span>Cookie</span>
                      <span>Zweck</span>
                      <span>Laufzeit</span>
                    </div>
                    {category.cookies.map((cookie, idx) => (
                      <div key={idx} style={{
                        display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '12px',
                        padding: '14px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px',
                        fontSize: '14px', color: 'var(--text-secondary)',
                      }}>
                        <span style={{ fontFamily: 'monospace', color: 'var(--text-primary)' }}>{cookie.name}</span>
                        <span>{cookie.purpose}</span>
                        <span>{cookie.duration}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Stand */}
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
              Stand: Januar 2026
            </p>
          </div>
        </div>
      </section>

      <Footer />
      <Chatbot />
    </>
  );
};

export default CookieRichtliniePage;
