import React from 'react';
import { Building, Mail, Phone, Globe, FileText, Scale } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Chatbot from '../components/chatbot/Chatbot';
import Seo from '../components/common/Seo';

const ImpressumPage = () => {
  return (
    <>
      <Seo title="Impressum" description="Impressum von Zebick: Firmeninformationen, Kontaktdaten und rechtliche Angaben gemäss Schweizer Recht (OR Art. 3)." path="/impressum" />
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
              <Scale size={16} />
              Rechtliches
            </span>
            
            <h1 style={{
              fontSize: '48px',
              fontWeight: 900,
              marginBottom: '16px',
            }}>
              Impressum
            </h1>
            
            <p style={{
              fontSize: '18px',
              color: 'var(--text-muted)',
            }}>
              Angaben gemäss Schweizer Recht (OR Art. 3)
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section style={{
        padding: '60px 0 100px',
        background: 'var(--bg-secondary)',
      }}>
        <div className="container">
          <div style={{
            maxWidth: '800px',
            display: 'flex',
            flexDirection: 'column',
            gap: '40px',
          }}>
            {/* Firmeninformationen */}
            <div style={{
              padding: '40px',
              background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '20px',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '24px',
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'rgba(255, 107, 0, 0.15)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Building size={24} color="var(--accent-primary)" />
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: 700 }}>Firmeninformationen</h2>
              </div>
              
              <div style={{ lineHeight: 2, color: 'var(--text-secondary)', fontSize: '16px' }}>
                <p><strong style={{ color: 'var(--text-primary)' }}>Firma:</strong> Zebick</p>
                <p><strong style={{ color: 'var(--text-primary)' }}>Inhaber:</strong> [Ihr Name]</p>
                <p><strong style={{ color: 'var(--text-primary)' }}>Rechtsform:</strong> Einzelunternehmen</p>
                <p style={{ marginTop: '16px' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Adresse:</strong><br />
                  Stellimattweg 36<br />
                  4125 Riehen<br />
                  Schweiz
                </p>
              </div>
            </div>

            {/* Kontakt */}
            <div style={{
              padding: '40px',
              background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '20px',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '24px',
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'rgba(255, 107, 0, 0.15)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Mail size={24} color="var(--accent-primary)" />
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: 700 }}>Kontakt</h2>
              </div>
              
              <div style={{ lineHeight: 2, color: 'var(--text-secondary)', fontSize: '16px' }}>
                <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={18} color="var(--accent-primary)" />
                  <strong style={{ color: 'var(--text-primary)' }}>E-Mail:</strong> kontakt@zebick.com
                </p>
                <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Phone size={18} color="var(--accent-primary)" />
                  <strong style={{ color: 'var(--text-primary)' }}>Telefon:</strong> +41 61 123 45 67
                </p>
                <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Globe size={18} color="var(--accent-primary)" />
                  <strong style={{ color: 'var(--text-primary)' }}>Website:</strong> www.zebick.com
                </p>
              </div>
            </div>

            {/* Registrierung (optional) */}
            <div style={{
              padding: '40px',
              background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '20px',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '24px',
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'rgba(255, 107, 0, 0.15)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <FileText size={24} color="var(--accent-primary)" />
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: 700 }}>Registrierung</h2>
              </div>
              
              <div style={{ lineHeight: 2, color: 'var(--text-secondary)', fontSize: '16px' }}>
                <p><strong style={{ color: 'var(--text-primary)' }}>UID-Nummer:</strong> Nicht MWST-pflichtig</p>
                <p><strong style={{ color: 'var(--text-primary)' }}>Handelsregister:</strong> Nicht im Handelsregister eingetragen</p>
              </div>
            </div>

            {/* Haftungsausschluss */}
            <div style={{
              padding: '40px',
              background: 'linear-gradient(145deg, rgba(255, 107, 0, 0.08) 0%, rgba(255, 107, 0, 0.02) 100%)',
              border: '1px solid rgba(255, 107, 0, 0.2)',
              borderRadius: '20px',
            }}>
              <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '20px' }}>Haftungsausschluss</h2>
              
              <div style={{ lineHeight: 1.8, color: 'var(--text-secondary)', fontSize: '15px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px', marginTop: '20px' }}>
                  Haftung für Inhalte
                </h3>
                <p>
                  Die Inhalte unserer Seiten wurden mit grösster Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit 
                  und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter sind wir 
                  für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.
                </p>

                <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px', marginTop: '20px' }}>
                  Haftung für Links
                </h3>
                <p>
                  Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss haben. 
                  Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten 
                  Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
                </p>

                <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px', marginTop: '20px' }}>
                  Urheberrecht
                </h3>
                <p>
                  Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem Schweizer 
                  Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung ausserhalb der 
                  Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
                </p>
              </div>
            </div>

            {/* Stand */}
            <p style={{
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '14px',
            }}>
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

export default ImpressumPage;
