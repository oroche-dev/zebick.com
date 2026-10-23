import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, Clock, MessageSquare, Zap, Users, Calendar, Globe, Sparkles, LifeBuoy } from 'lucide-react';
import Header from '../components/layout/Header';
import PageIntro from '../components/common/PageIntro';
import Seo from '../components/common/Seo';
import Footer from '../components/layout/Footer';
import Chatbot from '../components/chatbot/Chatbot';
import ZebickMark from '../components/brand/ZebickMark';
import { companyInfo, services } from '../data/mock';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: '',
    budget: '',
    message: '',
    consent: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const errStyle = {
    marginTop: '8px', fontSize: '13px', color: '#ff6b6b',
    display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500,
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFieldErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Inline validation so users see WHY a submit is blocked
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Bitte geben Sie Ihren Namen ein.';
    if (!formData.email.trim()) errs.email = 'Bitte geben Sie Ihre E-Mail-Adresse ein.';
    if (!formData.service) errs.service = 'Bitte wählen Sie einen Service.';
    if (!formData.budget) errs.budget = 'Bitte wählen Sie ein Budget.';
    if (!formData.message.trim()) errs.message = 'Bitte beschreiben Sie Ihr Projekt.';
    if (!formData.consent) errs.consent = 'Bitte stimmen Sie der Verarbeitung Ihrer Daten zu.';
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      const firstKey = Object.keys(errs)[0];
      const el = document.querySelector(`[data-testid="contact-${firstKey}"]`);
      if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.focus?.(); }
      return;
    }
    setFieldErrors({});
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/contact/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error('Fehler beim Senden der Anfrage');
      }
      
      setIsSubmitted(true);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        service: '',
        budget: '',
        message: '',
        consent: false,
      });
    } catch (err) {
      console.error('Form submission error:', err);
      setError('Es gab ein Problem beim Senden Ihrer Anfrage. Bitte versuchen Sie es erneut.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="page-transition">
        <Seo title="Anfrage gesendet" description="Ihre Anfrage wurde erfolgreich übermittelt." path="/contact" />
        <Header />
        <section className="hero" style={{ minHeight: '80vh' }}>
          <div className="hero-bg">
            <div className="grid-pattern"></div>
            <div className="ambient-glow ambient-glow-top-right"></div>
          </div>
          <div className="container">
            <div style={{
              maxWidth: '600px',
              margin: '0 auto',
              textAlign: 'center',
            }}>
              <div style={{
                width: '120px',
                height: '120px',
                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-dark))',
                borderRadius: '50%',
                margin: '0 auto 40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 20px 60px rgba(255, 107, 0, 0.4)',
              }}>
                <CheckCircle size={56} color="var(--bg-primary)" />
              </div>
              <h1 className="heading-1" style={{ fontSize: '48px', marginBottom: '20px' }}>Vielen Dank!</h1>
              <p style={{ fontSize: '18px', color: 'var(--text-muted)', marginBottom: '40px', lineHeight: 1.7 }}>
                Ihre Anfrage wurde erfolgreich übermittelt. Wir melden uns innerhalb von 24 Stunden bei Ihnen.
              </p>
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setFormData({ name: '', email: '', phone: '', company: '', service: '', budget: '', message: '', consent: false });
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '18px 36px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
              >
                Neue Anfrage stellen
              </button>
            </div>
          </div>
        </section>
        <Footer />
        <Chatbot />
      </div>
    );
  }

  return (
    <div className="page-transition">
      <Seo
        title="Kontakt"
        description="Kontaktieren Sie Zebick für eine kostenlose Erstberatung zu Ihrem Web-, App- oder Security-Projekt – Antwort in unter 24 Stunden."
        path="/contact"
      />
      <Header />
      
      {/* ========== INTRO (kompakt, kein Hero-Banner) ========== */}
      <PageIntro
        icon={<MessageSquare size={13} />}
        badge="Kontakt"
        title="Kontakt"
        description={<>Haben Sie ein Projekt im Sinn? Kontaktieren Sie uns für eine kostenlose Erstberatung.</>}
      />

      {/* Quick Stats — top padding clears the fixed header (64px) now that
          PageIntro above no longer takes up any visible space. A <div>, not
          <section> — bare section tags get their padding force-overridden
          by a global mobile rule (section{padding:48px 0!important}),
          which left this row tucked 12px under the fixed header. */}
      <div style={{
        background: 'var(--bg-secondary)',
        padding: '84px 0 40px',
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div className="container">
          <div className="contact-quick-stats" style={{ display: 'flex', justifyContent: 'center', gap: '64px', flexWrap: 'wrap' }}>
            {[
              { icon: Clock, text: 'Antwort in < 24h' },
              { icon: Users, text: 'Kostenlose Erstberatung' },
              { icon: Globe, text: 'DACH-weit tätig' },
            ].map((item, idx) => (
              <div key={idx} className="qs-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                <item.icon className="qs-icon" size={20} color="var(--accent-primary)" />
                <span className="qs-text" style={{ fontSize: '15px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Form & Info */}
      <section className="section" data-testid="contact-form-section" style={{ 
        background: 'var(--bg-secondary)',
        paddingTop: '80px',
        paddingBottom: '120px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{
            position: 'absolute',
            bottom: '10%',
            left: '5%',
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(255, 107, 0, 0.08) 0%, transparent 60%)',
            borderRadius: '50%',
            filter: 'blur(100px)',
          }} />
        </div>

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 0.8fr',
            gap: '64px',
          }}>
            {/* Contact Form */}
            <div style={{
              padding: '48px',
              background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xl)',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0,
                height: '3px',
                background: 'linear-gradient(90deg, var(--accent-primary), transparent)',
              }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  background: '#0a0a0a',
                  border: '1px solid rgba(255, 107, 0, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <ZebickMark size={38} />
                </div>
                <div>
                  <h2 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '4px' }}>Projektanfrage</h2>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Erzählen Sie uns von Ihrem Vorhaben</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '10px', 
                      fontSize: '14px', 
                      color: 'var(--text-secondary)',
                      fontWeight: 600,
                    }} htmlFor="contact-name">
                      Name *
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Max Mustermann"
                      data-testid="contact-name"
                      style={{
                        width: '100%',
                        padding: '16px 20px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-primary)',
                        fontSize: '16px',
                        transition: 'all 0.3s ease',
                      }}
                    />
                    {fieldErrors.name && <div style={errStyle} data-testid="contact-error-name">{fieldErrors.name}</div>}
                  </div>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '10px', 
                      fontSize: '14px', 
                      color: 'var(--text-secondary)',
                      fontWeight: 600,
                    }} htmlFor="contact-email">
                      E-Mail *
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="max@beispiel.de"
                      data-testid="contact-email"
                      style={{
                        width: '100%',
                        padding: '16px 20px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-primary)',
                        fontSize: '16px',
                        transition: 'all 0.3s ease',
                      }}
                    />
                    {fieldErrors.email && <div style={errStyle} data-testid="contact-error-email">{fieldErrors.email}</div>}
                  </div>
                </div>
                
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '10px', 
                    fontSize: '14px', 
                    color: 'var(--text-secondary)',
                    fontWeight: 600,
                  }} htmlFor="contact-phone">
                    Telefon
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+49 ..."
                    data-testid="contact-phone"
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)',
                      fontSize: '16px',
                      transition: 'all 0.3s ease',
                    }}
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '10px', 
                    fontSize: '14px', 
                    color: 'var(--text-secondary)',
                    fontWeight: 600,
                  }} htmlFor="contact-company">
                    Unternehmen
                  </label>
                  <input
                    id="contact-company"
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Ihr Unternehmen"
                    data-testid="contact-company"
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)',
                      fontSize: '16px',
                      transition: 'all 0.3s ease',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '10px', 
                      fontSize: '14px', 
                      color: 'var(--text-secondary)',
                      fontWeight: 600,
                    }} htmlFor="contact-service">
                      Service <span style={{ color: '#FF6B00' }}>*</span>
                    </label>
                    <select
                      id="contact-service"
                      name="service"
                      value={formData.service}
                      onChange={handleChange}
                      required
                      data-testid="contact-service"
                      style={{
                        width: '100%',
                        padding: '16px 20px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        color: formData.service ? 'var(--text-primary)' : 'var(--text-muted)',
                        fontSize: '16px',
                        fontFamily: 'inherit',
                        cursor: 'pointer',
                        colorScheme: 'dark',
                      }}
                    >
                      <option value="" style={{ background: '#1a1a1a', color: '#888' }}>Bitte wählen</option>
                      {services.map(s => (
                        <option key={s.id} value={s.id} style={{ background: '#1a1a1a', color: '#fff' }}>{s.title}</option>
                      ))}
                      <option value="support" style={{ background: '#1a1a1a', color: '#fff' }}>Support (bestehendes Projekt)</option>
                    </select>
                    {fieldErrors.service && <div style={errStyle} data-testid="contact-error-service">{fieldErrors.service}</div>}
                  </div>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '10px', 
                      fontSize: '14px', 
                      color: 'var(--text-secondary)',
                      fontWeight: 600,
                    }} htmlFor="contact-budget">
                      Budget <span style={{ color: '#FF6B00' }}>*</span>
                    </label>
                    <select
                      id="contact-budget"
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      required
                      data-testid="contact-budget"
                      style={{
                        width: '100%',
                        padding: '16px 20px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        color: formData.budget ? 'var(--text-primary)' : 'var(--text-muted)',
                        fontSize: '16px',
                        fontFamily: 'inherit',
                        cursor: 'pointer',
                        colorScheme: 'dark',
                      }}
                    >
                      <option value="" style={{ background: '#1a1a1a', color: '#888' }}>Bitte wählen</option>
                      <option value="750-1500" style={{ background: '#1a1a1a', color: '#fff' }}>€750 - €1.500</option>
                      <option value="2500-5000" style={{ background: '#1a1a1a', color: '#fff' }}>€2.500 - €5.000</option>
                      <option value="5k-10k" style={{ background: '#1a1a1a', color: '#fff' }}>€5.000 - €10.000</option>
                      <option value="10k-25k" style={{ background: '#1a1a1a', color: '#fff' }}>€10.000 - €25.000</option>
                      <option value="25k-50k" style={{ background: '#1a1a1a', color: '#fff' }}>€25.000 - €50.000</option>
                      <option value="50k+" style={{ background: '#1a1a1a', color: '#fff' }}>€50.000+</option>
                    </select>
                    {fieldErrors.budget && <div style={errStyle} data-testid="contact-error-budget">{fieldErrors.budget}</div>}
                  </div>
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '10px', 
                    fontSize: '14px', 
                    color: 'var(--text-secondary)',
                    fontWeight: 600,
                  }} htmlFor="contact-message">
                    Projektbeschreibung *
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder="Beschreiben Sie Ihr Projekt..."
                    data-testid="contact-message"
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)',
                      fontSize: '16px',
                      resize: 'vertical',
                      minHeight: '150px',
                      fontFamily: 'inherit',
                    }}
                  />
                  {fieldErrors.message && <div style={errStyle} data-testid="contact-error-message">{fieldErrors.message}</div>}
                </div>

                <div style={{ marginTop: '-4px' }}>
                  <label
                    htmlFor="contact-consent"
                    style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}
                  >
                    <input
                      id="contact-consent"
                      type="checkbox"
                      name="consent"
                      checked={formData.consent}
                      onChange={(e) => { setFormData({ ...formData, consent: e.target.checked }); setFieldErrors((prev) => ({ ...prev, consent: undefined })); }}
                      data-testid="contact-consent"
                      style={{
                        width: '18px', height: '18px', marginTop: '2px', flexShrink: 0,
                        accentColor: 'var(--accent-primary)', cursor: 'pointer',
                      }}
                    />
                    <span>
                      Ich habe die <a href="/datenschutz" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)', textDecoration: 'underline' }}>Datenschutzerklärung</a> gelesen und stimme der Verarbeitung meiner Daten zur Bearbeitung meiner Anfrage zu. <span style={{ color: '#FF6B00' }}>*</span>
                    </span>
                  </label>
                  {fieldErrors.consent && <div style={errStyle} data-testid="contact-error-consent">{fieldErrors.consent}</div>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  data-testid="contact-form-submit"
                  className="btn-fill btn-fill-dark"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    padding: '18px 36px',
                    background: isSubmitting
                      ? 'rgba(255, 107, 0, 0.5)'
                      : 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-dark) 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: 600,
                    fontSize: '16px',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    boxShadow: isSubmitting ? 'none' : '0 15px 50px rgba(255, 107, 0, 0.4)',
                    marginTop: '8px',
                  }}
                >
                  {isSubmitting ? 'Wird gesendet...' : 'Anfrage senden'}
                  <Send size={18} />
                </button>
                
                {error && (
                  <div style={{
                    marginTop: '16px',
                    padding: '16px 20px',
                    background: 'rgba(255, 59, 48, 0.1)',
                    border: '1px solid rgba(255, 59, 48, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    color: '#ff3b30',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }} data-testid="contact-form-error">
                    <Zap size={18} />
                    {error}
                  </div>
                )}
              </form>
            </div>

            {/* Contact Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ marginBottom: '8px' }}>
                <h2 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '8px' }}>Kontaktdaten</h2>
                <p style={{ fontSize: '15px', color: 'var(--text-muted)' }}>Oder erreichen Sie uns direkt</p>
              </div>
              
              {[
                { icon: Mail, title: 'E-Mail', value: companyInfo.email, href: `mailto:${companyInfo.email}` },
                { icon: LifeBuoy, title: 'Support', value: companyInfo.supportEmail, href: `mailto:${companyInfo.supportEmail}` },
                { icon: Phone, title: 'Telefon', value: companyInfo.phone, href: `tel:${companyInfo.phone}` },
                { icon: MapPin, title: 'Adresse', value: companyInfo.address, href: null },
              ].map((item, idx) => (
                <div key={idx} style={{
                  padding: '28px',
                  background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-xl)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--accent-primary)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                    <div style={{
                      width: '52px',
                      height: '52px',
                      background: 'rgba(255, 107, 0, 0.15)',
                      border: '1px solid rgba(255, 107, 0, 0.3)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <item.icon size={24} color="var(--accent-primary)" />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent-primary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.title}</h4>
                      {item.href ? (
                        <a href={item.href} style={{ color: 'var(--text-primary)', fontSize: '17px', fontWeight: 500, textDecoration: 'none' }}>
                          {item.value}
                        </a>
                      ) : (
                        <p style={{ color: 'var(--text-primary)', fontSize: '17px', fontWeight: 500, margin: 0 }}>{item.value}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <div style={{
                padding: '28px',
                background: 'linear-gradient(145deg, rgba(255, 107, 0, 0.08) 0%, rgba(255, 107, 0, 0.02) 100%)',
                border: '1px solid rgba(255, 107, 0, 0.2)',
                borderRadius: 'var(--radius-xl)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <Calendar size={20} color="var(--accent-primary)" />
                  <h4 style={{ fontSize: '18px', fontWeight: 700 }}>Geschäftszeiten</h4>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { day: 'Montag - Freitag', time: '09:00 - 18:00' },
                    { day: 'Samstag', time: 'Nach Vereinbarung' },
                    { day: 'Sonntag', time: 'Geschlossen' },
                  ].map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '15px', color: 'var(--text-muted)' }}>{item.day}</span>
                      <span style={{ 
                        fontSize: '15px', 
                        fontWeight: 600,
                        color: item.time === 'Geschlossen' ? 'var(--text-muted)' : 'var(--text-primary)',
                      }}>{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trust Badges */}
              <div style={{
                padding: '24px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-xl)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Sparkles size={18} color="var(--accent-primary)" />
                  <span style={{ fontSize: '14px', fontWeight: 600 }}>Garantierte Qualität</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {['DSGVO Konform', 'SSL Secured'].map((badge, idx) => (
                    <span key={idx} style={{
                      padding: '8px 14px',
                      background: 'rgba(255, 107, 0, 0.1)',
                      border: '1px solid rgba(255, 107, 0, 0.2)',
                      borderRadius: '50px',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'var(--accent-primary)',
                    }}>
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <Chatbot />

      <style>{`
        @media (max-width: 640px) {
          .contact-quick-stats {
            flex-wrap: nowrap !important;
            justify-content: center !important;
            gap: 6px !important;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            padding-bottom: 4px;
          }
          .qs-item { gap: 4px !important; }
          .qs-icon { width: 14px !important; height: 14px !important; flex-shrink: 0; }
          .qs-text { font-size: 10px !important; }
        }
      `}</style>
    </div>
  );
};

export default ContactPage;
