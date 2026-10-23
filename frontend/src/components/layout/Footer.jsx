import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Linkedin, Twitter, Github, Instagram, Mail, MapPin, Phone, ArrowRight, Sparkles, Send, ChevronRight, Globe, Shield, Award, ArrowUpRight, Clock, Zap } from 'lucide-react';
import { companyInfo, footerLinks } from '../../data/mock';
import ZebickLogoB from '../brand/ZebickLogoB';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [socials, setSocials] = useState({});

  useEffect(() => {
    axios.get(`${BACKEND_URL}/api/settings/public`).then((r) => setSocials(r.data || {})).catch(() => {});
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post(`${BACKEND_URL}/api/newsletter/subscribe`, {
        email: email
      });

      if (response.status === 200) {
        setIsSubscribed(true);
        setEmail('');
        setTimeout(() => setIsSubscribed(false), 5000);
      }
    } catch (err) {
      console.error('Newsletter subscription error:', err);
      if (err.response?.status === 400) {
        setError('Diese E-Mail ist bereits registriert');
      } else {
        setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
      }
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer data-testid="ultra-modern-footer" style={{
      background: 'linear-gradient(180deg, var(--bg-secondary) 0%, #000000 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated Background */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {/* Gradient Mesh */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          left: '30%',
          width: '700px',
          height: '700px',
          background: 'radial-gradient(circle, rgba(255, 107, 0, 0.1) 0%, transparent 60%)',
          borderRadius: '50%',
          filter: 'blur(120px)',
          animation: 'footerPulse 15s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '10%',
          right: '20%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(255, 107, 0, 0.06) 0%, transparent 60%)',
          borderRadius: '50%',
          filter: 'blur(100px)',
          animation: 'footerPulse 12s ease-in-out infinite reverse',
        }} />
        
        {/* Floating Lines */}
        <svg style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.03 }}>
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="50%" stopColor="#FF6B00" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
          {[...Array(8)].map((_, i) => (
            <line 
              key={i}
              x1="0" 
              y1={100 + i * 80} 
              x2="100%" 
              y2={100 + i * 80} 
              stroke="url(#lineGrad)" 
              strokeWidth="1"
              style={{
                animation: `lineFloat ${10 + i * 2}s ease-in-out infinite`,
                animationDelay: `${i * 0.5}s`,
              }}
            />
          ))}
        </svg>
      </div>

      {/* Combined Pre-Footer: Vision + Newsletter (compact, no glow) */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
      }}>
        <div className="container" style={{ padding: 'clamp(40px, 6vw, 64px) 16px' }}>
          <div data-testid="prefooter-cta" style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 107, 0, 0.12)',
            borderRadius: '14px',
            padding: 'clamp(24px, 4vw, 40px)',
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
            gap: 'clamp(24px, 4vw, 48px)',
            alignItems: 'center',
          }}>
            {/* Left: Vision CTA */}
            <div style={{ minWidth: 0 }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--accent-primary)',
                opacity: 0.85,
                marginBottom: '14px',
              }}>
                <span style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: 'var(--accent-primary)',
                }} />
                Kostenlose Beratung
              </div>

              <h3 style={{
                fontSize: 'clamp(20px, 2.6vw, 26px)',
                fontWeight: 700,
                margin: '0 0 12px',
                lineHeight: 1.25,
                letterSpacing: '-0.01em',
                color: 'var(--text-primary)',
              }}>
                Lassen Sie uns Ihre Vision verwirklichen
              </h3>

              <p style={{
                fontSize: '14px',
                color: 'var(--text-muted)',
                lineHeight: 1.6,
                margin: '0 0 18px',
                maxWidth: '520px',
              }}>
                Unverbindliches Erstgespräch und Newsletter mit Tech-Insights — alles an einem Ort.
              </p>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <Link
                  to="/contact"
                  data-testid="prefooter-cta-primary"
                  className="btn-fill btn-fill-dark"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    background: 'var(--accent-primary)',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '13px',
                    textDecoration: 'none',
                  }}
                >
                  Gespräch buchen <ArrowRight size={14} />
                </Link>
                <a
                  href={`mailto:${companyInfo.email}`}
                  data-testid="prefooter-cta-secondary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontWeight: 500,
                    fontSize: '13px',
                    textDecoration: 'none',
                    transition: 'border-color 0.2s ease',
                  }}
                >
                  <Mail size={14} /> E-Mail senden
                </a>
              </div>
            </div>

            {/* Right: Newsletter compact */}
            <div data-testid="newsletter-section" style={{
              padding: '18px',
              background: 'rgba(0, 0, 0, 0.25)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '10px',
              minWidth: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{
                  width: '30px',
                  height: '30px',
                  background: 'rgba(255, 107, 0, 0.12)',
                  border: '1px solid rgba(255, 107, 0, 0.22)',
                  borderRadius: '7px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Mail size={14} color="var(--accent-primary)" />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    lineHeight: 1.2,
                  }}>
                    Newsletter
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    lineHeight: 1.3,
                  }}>
                    Kein Spam, jederzeit abbestellbar.
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubscribe} style={{
                display: 'flex',
                gap: '6px',
              }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ihre.email@beispiel.de"
                  data-testid="newsletter-input"
                  required
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '7px',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                    minWidth: 0,
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(255, 107, 0, 0.4)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  }}
                />
                <button
                  type="submit"
                  data-testid="newsletter-submit"
                  disabled={isLoading}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    background: isSubscribed
                      ? '#10B981'
                      : error
                      ? '#EF4444'
                      : 'var(--accent-primary)',
                    border: 'none',
                    borderRadius: '7px',
                    color: isSubscribed || error ? '#fff' : '#000',
                    fontWeight: 600,
                    fontSize: '12px',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    transition: 'opacity 0.2s ease',
                    opacity: isLoading ? 0.7 : 1,
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  {isLoading ? '…' : error ? '!' : isSubscribed ? '✓' : (<><Send size={12} /></>)}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container" style={{ padding: '80px 0 48px', position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2.5fr 1fr 1fr 1fr 1.5fr',
          gap: '64px',
        }}>
          {/* Brand Column */}
          <div>
            <Link to="/" style={{ display: 'inline-block', marginBottom: '28px' }} aria-label="Zebick Startseite">
              <ZebickLogoB height={56} variant="outfit" />
            </Link>
            <p style={{ 
              fontSize: '15px', 
              color: 'var(--text-muted)', 
              lineHeight: 1.8, 
              marginBottom: '28px',
              maxWidth: '300px'
            }}>
              Digitalagentur & Cyber Security seit 2024. Wir entwickeln digitale Lösungen, die begeistern und Unternehmen nachhaltig transformieren.
            </p>

            {/* Social Links - Modern Style — dynamisch aus Admin-Settings */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {[
                { icon: Linkedin, href: socials.social_linkedin, color: '#0A66C2', name: 'LinkedIn' },
                { icon: Twitter, href: socials.social_twitter, color: '#1DA1F2', name: 'Twitter' },
                { icon: Github, href: socials.social_github, color: '#fff', name: 'GitHub' },
                { icon: Instagram, href: socials.social_instagram, color: '#E4405F', name: 'Instagram' },
              ].filter(s => s.href && s.href.trim()).map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  data-testid={`footer-social-${social.name.toLowerCase()}`}
                  style={{
                    width: '42px',
                    height: '42px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px',
                    color: 'var(--text-muted)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = social.color;
                    e.currentTarget.style.borderColor = social.color;
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)';
                    e.currentTarget.style.boxShadow = `0 10px 30px ${social.color}40`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.color = 'var(--text-muted)';
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Services Column */}
          <div>
            <h4 style={{ 
              fontSize: '13px', 
              fontWeight: 700, 
              color: 'var(--accent-primary)',
              marginBottom: '24px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }}>
              Services
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {footerLinks.services.map((link) => (
                <Link 
                  key={link.path} 
                  to={link.path}
                  style={{
                    fontSize: '14px',
                    color: 'var(--text-muted)',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = 'var(--text-primary)';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = 'var(--text-muted)';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <ChevronRight size={14} style={{ opacity: 0.5 }} />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Company Column */}
          <div>
            <h4 style={{ 
              fontSize: '13px', 
              fontWeight: 700, 
              color: 'var(--accent-primary)',
              marginBottom: '24px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }}>
              Unternehmen
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {footerLinks.company.map((link) => (
                <Link 
                  key={link.path} 
                  to={link.path}
                  style={{
                    fontSize: '14px',
                    color: 'var(--text-muted)',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = 'var(--text-primary)';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = 'var(--text-muted)';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <ChevronRight size={14} style={{ opacity: 0.5 }} />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Legal Column */}
          <div>
            <h4 style={{ 
              fontSize: '13px', 
              fontWeight: 700, 
              color: 'var(--accent-primary)',
              marginBottom: '24px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }}>
              Rechtliches
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {footerLinks.legal.map((link) => (
                <Link 
                  key={link.path} 
                  to={link.path}
                  style={{
                    fontSize: '14px',
                    color: 'var(--text-muted)',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = 'var(--text-primary)';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = 'var(--text-muted)';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <ChevronRight size={14} style={{ opacity: 0.5 }} />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact Column */}
          <div>
            <h4 style={{ 
              fontSize: '13px', 
              fontWeight: 700, 
              color: 'var(--accent-primary)',
              marginBottom: '24px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }}>
              Kontakt
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { icon: Mail, text: socials.contact_email || companyInfo.email, href: `mailto:${socials.contact_email || companyInfo.email}` },
                { icon: Phone, text: socials.contact_phone || companyInfo.phone, href: `tel:${(socials.contact_phone || companyInfo.phone || '').replace(/\s/g,'')}` },
                ...(socials.whatsapp_link ? [{ icon: Phone, text: 'WhatsApp Chat starten', href: socials.whatsapp_link }] : []),
                { icon: MapPin, text: socials.address || companyInfo.address, href: null },
              ].filter(item => item.text).map((item, idx) => (
                item.href ? (
                  <a 
                    key={idx}
                    href={item.href}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '14px',
                      fontSize: '14px',
                      color: 'var(--text-muted)',
                      textDecoration: 'none',
                      transition: 'color 0.3s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-primary)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    <div style={{
                      width: '36px',
                      height: '36px',
                      background: 'linear-gradient(135deg, rgba(255, 107, 0, 0.15) 0%, rgba(255, 107, 0, 0.05) 100%)',
                      border: '1px solid rgba(255, 107, 0, 0.2)',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <item.icon size={16} color="var(--accent-primary)" />
                    </div>
                    <span style={{ paddingTop: '8px' }}>{item.text}</span>
                  </a>
                ) : (
                  <div 
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '14px',
                      fontSize: '14px',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <div style={{
                      width: '36px',
                      height: '36px',
                      background: 'linear-gradient(135deg, rgba(255, 107, 0, 0.15) 0%, rgba(255, 107, 0, 0.05) 100%)',
                      border: '1px solid rgba(255, 107, 0, 0.2)',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <item.icon size={16} color="var(--accent-primary)" />
                    </div>
                    <span style={{ paddingTop: '8px', lineHeight: 1.5 }}>{item.text}</span>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>

        {/* Certifications Bar */}
        <div style={{
          marginTop: '64px',
          paddingTop: '32px',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex',
          justifyContent: 'center',
          gap: '32px',
          flexWrap: 'wrap',
        }}>
          {['DSGVO Konform', 'SSL Secured'].map((cert, idx) => (
            <div key={idx} style={{
              padding: '10px 20px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <Shield size={14} color="var(--accent-primary)" />
              {cert}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        background: 'rgba(0, 0, 0, 0.3)',
        position: 'relative',
        zIndex: 1,
      }}>
        <div className="container" style={{ 
          padding: '20px 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            © {currentYear} {companyInfo.name}. Alle Rechte vorbehalten.
          </p>

          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            padding: '8px 16px',
            background: 'rgba(255, 107, 0, 0.1)',
            borderRadius: '50px',
          }}>
            <span style={{ 
              width: '8px', 
              height: '8px', 
              background: '#10B981', 
              borderRadius: '50%',
              animation: 'statusPulse 2s ease-in-out infinite',
            }} />
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Made with <span style={{ color: 'var(--accent-primary)' }}>♥</span> in Riehen
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              🇩🇪 Deutsch
            </span>
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                color: 'var(--text-muted)',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--accent-primary)';
                e.currentTarget.style.color = 'var(--bg-primary)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
            >
              Nach oben <ArrowUpRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes footerPulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        @keyframes lineFloat {
          0%, 100% { opacity: 0.02; }
          50% { opacity: 0.05; }
        }
        @keyframes statusPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
