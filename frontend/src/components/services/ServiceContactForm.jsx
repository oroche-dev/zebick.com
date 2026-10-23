import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, Clock, Users, Calendar, Globe, Sparkles, Zap, MessageSquare } from 'lucide-react';
import ZebickMark from '../brand/ZebickMark';
import { companyInfo, services } from '../../data/mock';

const API_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * Unified contact section for every service page – identical to the one on /contact.
 * Pass `defaultService` (service id) to pre-select the dropdown.
 */
const ServiceContactForm = ({ defaultService = '', eyebrow = 'Kontakt', title = 'Lassen Sie uns reden', subtitle = 'Erzählen Sie uns von Ihrem Projekt – Antwort innerhalb von 24 Stunden, kostenlose Erstberatung.' }) => {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', company: '',
    service: defaultService, budget: '', message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/contact/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Fehler beim Senden der Anfrage');
      setIsSubmitted(true);
      setFormData({ name: '', email: '', phone: '', company: '', service: defaultService, budget: '', message: '' });
    } catch (err) {
      console.error('Form submission error:', err);
      setError('Es gab ein Problem beim Senden Ihrer Anfrage. Bitte versuchen Sie es erneut.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '16px 20px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)', fontSize: '16px',
    transition: 'all 0.3s ease',
  };

  const labelStyle = {
    display: 'block', marginBottom: '10px',
    fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 600,
  };

  return (
    <section className="section" data-testid="section-contact" style={{
      background: 'var(--bg-secondary)',
      padding: '100px 0 120px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', bottom: '10%', left: '5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(255,107,0,0.08) 0%, transparent 60%)', filter: 'blur(100px)' }} />
        <div style={{ position: 'absolute', top: '5%', right: '5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(255,107,0,0.06) 0%, transparent 60%)', filter: 'blur(100px)' }} />
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Intro */}
        <div style={{ textAlign: 'center', marginBottom: '56px', maxWidth: '720px', marginLeft: 'auto', marginRight: 'auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 18px', background: 'rgba(255,107,0,0.1)', border: '1px solid rgba(255,107,0,0.25)', borderRadius: '999px', fontSize: '12px', fontWeight: 700, color: 'var(--accent-primary)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '20px' }}>
            <MessageSquare size={14} /> {eyebrow}
          </div>
          <h2 className="heading-1" style={{ fontSize: '48px', fontWeight: 900, lineHeight: 1.1, marginBottom: '18px' }}>{title}</h2>
          <p style={{ fontSize: '17px', color: 'var(--text-muted)', lineHeight: 1.7 }}>{subtitle}</p>
        </div>

        {/* Quick badges */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap', marginBottom: '56px' }}>
          {[
            { icon: Clock, text: 'Antwort in < 24h' },
            { icon: Users, text: 'Kostenlose Erstberatung' },
            { icon: Globe, text: 'DACH-weit tätig' },
          ].map((item, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <item.icon size={18} color="var(--accent-primary)" />
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500 }}>{item.text}</span>
            </div>
          ))}
        </div>

        {isSubmitted ? (
          /* Success state */
          <div data-testid="contact-form-success" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '64px 40px', background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)', border: '1px solid rgba(255,107,0,0.25)', borderRadius: 'var(--radius-xl)' }}>
            <div style={{ width: '120px', height: '120px', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-dark, #cc5500))', borderRadius: '50%', margin: '0 auto 36px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 60px rgba(255,107,0,0.4)' }}>
              <CheckCircle size={56} color="var(--bg-primary)" />
            </div>
            <h3 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '16px' }}>Vielen Dank!</h3>
            <p style={{ fontSize: '17px', color: 'var(--text-muted)', marginBottom: '32px', lineHeight: 1.7 }}>
              Ihre Anfrage wurde erfolgreich übermittelt. Wir melden uns innerhalb von 24 Stunden bei Ihnen.
            </p>
            <button
              onClick={() => setIsSubmitted(false)}
              data-testid="contact-form-reset"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '16px 32px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', borderRadius: '12px', color: 'var(--text-primary)', fontWeight: 600, fontSize: '15px', cursor: 'pointer', transition: 'all 0.3s ease' }}
            >
              Neue Anfrage stellen
            </button>
          </div>
        ) : (
          <div className="contact-grid-unified" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '48px' }}>
            {/* Form */}
            <div style={{ padding: '48px', background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, var(--accent-primary), transparent)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <div style={{ width: '56px', height: '56px', background: '#0a0a0a', border: '1px solid rgba(255, 107, 0, 0.3)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ZebickMark size={38} />
                </div>
                <div>
                  <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '4px' }}>Projektanfrage</h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Erzählen Sie uns von Ihrem Vorhaben</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                <div className="contact-grid-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={labelStyle} htmlFor="contact-name">Name *</label>
                    <input id="contact-name" type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Max Mustermann" data-testid="contact-name" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle} htmlFor="contact-email">E-Mail *</label>
                    <input id="contact-email" type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="max@beispiel.de" data-testid="contact-email" style={inputStyle} />
                  </div>
                </div>

                <div>
                  <label style={labelStyle} htmlFor="contact-phone">Telefon</label>
                  <input id="contact-phone" type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+49 …" data-testid="contact-phone" style={inputStyle} />
                </div>

                <div>
                  <label style={labelStyle} htmlFor="contact-company">Unternehmen</label>
                  <input id="contact-company" type="text" name="company" value={formData.company} onChange={handleChange} placeholder="Ihr Unternehmen" data-testid="contact-company" style={inputStyle} />
                </div>

                <div className="contact-grid-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={labelStyle} htmlFor="contact-service">Service *</label>
                    <select id="contact-service" name="service" value={formData.service} onChange={handleChange} required data-testid="contact-service" style={{ ...inputStyle, color: formData.service ? 'var(--text-primary)' : 'var(--text-muted)', fontFamily: 'inherit', cursor: 'pointer', colorScheme: 'dark' }}>
                      <option value="" style={{ background: '#1a1a1a', color: '#888' }}>Bitte wählen</option>
                      {services.map(s => (
                        <option key={s.id} value={s.id} style={{ background: '#1a1a1a', color: '#fff' }}>{s.title}</option>
                      ))}
                      <option value="support" style={{ background: '#1a1a1a', color: '#fff' }}>Support (bestehendes Projekt)</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle} htmlFor="contact-budget">Budget</label>
                    <select id="contact-budget" name="budget" value={formData.budget} onChange={handleChange} data-testid="contact-budget" style={{ ...inputStyle, color: formData.budget ? 'var(--text-primary)' : 'var(--text-muted)', fontFamily: 'inherit', cursor: 'pointer', colorScheme: 'dark' }}>
                      <option value="" style={{ background: '#1a1a1a', color: '#888' }}>Bitte wählen</option>
                      <option value="750-1500" style={{ background: '#1a1a1a', color: '#fff' }}>€750 - €1.500</option>
                      <option value="2500-5000" style={{ background: '#1a1a1a', color: '#fff' }}>€2.500 - €5.000</option>
                      <option value="5k-10k" style={{ background: '#1a1a1a', color: '#fff' }}>€5.000 - €10.000</option>
                      <option value="10k-25k" style={{ background: '#1a1a1a', color: '#fff' }}>€10.000 - €25.000</option>
                      <option value="25k-50k" style={{ background: '#1a1a1a', color: '#fff' }}>€25.000 - €50.000</option>
                      <option value="50k+" style={{ background: '#1a1a1a', color: '#fff' }}>€50.000+</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={labelStyle} htmlFor="contact-message">Projektbeschreibung *</label>
                  <textarea id="contact-message" name="message" value={formData.message} onChange={handleChange} required rows={5} placeholder="Beschreiben Sie Ihr Projekt …" data-testid="contact-message" style={{ ...inputStyle, resize: 'vertical', minHeight: '150px', fontFamily: 'inherit' }} />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  data-testid="contact-form-submit"
                  className="btn-fill btn-fill-dark"
                  style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    padding: '18px 36px',
                    background: isSubmitting ? 'rgba(255,107,0,0.5)' : 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-dark, #cc5500) 100%)',
                    border: 'none', borderRadius: '12px',
                    fontWeight: 700, fontSize: '16px',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    boxShadow: isSubmitting ? 'none' : '0 15px 50px rgba(255,107,0,0.4)',
                    marginTop: '8px',
                  }}
                >
                  {isSubmitting ? 'Wird gesendet …' : 'Anfrage senden'}
                  <Send size={18} />
                </button>

                {error && (
                  <div data-testid="contact-form-error" style={{ padding: '14px 18px', background: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.3)', borderRadius: 'var(--radius-md)', color: '#ff3b30', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Zap size={18} /> {error}
                  </div>
                )}
              </form>
            </div>

            {/* Info sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ marginBottom: '4px' }}>
                <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Kontaktdaten</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Oder erreichen Sie uns direkt</p>
              </div>

              {[
                { icon: Mail, title: 'E-Mail', value: companyInfo.email, href: `mailto:${companyInfo.email}` },
                { icon: Phone, title: 'Telefon', value: companyInfo.phone, href: `tel:${companyInfo.phone}` },
                { icon: MapPin, title: 'Adresse', value: companyInfo.address, href: null },
              ].map((item, idx) => (
                <div key={idx} style={{ padding: '22px', background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', transition: 'all 0.3s ease' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                    <div style={{ width: '44px', height: '44px', background: 'rgba(255,107,0,0.15)', border: '1px solid rgba(255,107,0,0.3)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <item.icon size={20} color="var(--accent-primary)" />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{item.title}</h4>
                      {item.href ? (
                        <a href={item.href} style={{ color: 'var(--text-primary)', fontSize: '15px', fontWeight: 500, textDecoration: 'none' }}>{item.value}</a>
                      ) : (
                        <p style={{ color: 'var(--text-primary)', fontSize: '15px', fontWeight: 500, margin: 0 }}>{item.value}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <div style={{ padding: '22px', background: 'linear-gradient(145deg, rgba(255,107,0,0.08) 0%, rgba(255,107,0,0.02) 100%)', border: '1px solid rgba(255,107,0,0.2)', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <Calendar size={18} color="var(--accent-primary)" />
                  <h4 style={{ fontSize: '15px', fontWeight: 700 }}>Geschäftszeiten</h4>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { day: 'Mo – Fr', time: '09:00 – 18:00' },
                    { day: 'Samstag', time: 'Nach Vereinbarung' },
                    { day: 'Sonntag', time: 'Geschlossen' },
                  ].map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{item.day}</span>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: item.time === 'Geschlossen' ? 'var(--text-muted)' : 'var(--text-primary)' }}>{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <Sparkles size={16} color="var(--accent-primary)" />
                  <span style={{ fontSize: '13px', fontWeight: 700 }}>Garantierte Qualität</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {['DSGVO konform', 'SSL Secured'].map((badge, idx) => (
                    <span key={idx} style={{ padding: '6px 12px', background: 'rgba(255,107,0,0.1)', border: '1px solid rgba(255,107,0,0.2)', borderRadius: '50px', fontSize: '11px', fontWeight: 600, color: 'var(--accent-primary)' }}>{badge}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`
        @media (max-width: 900px) {
          .contact-grid-unified { grid-template-columns: 1fr !important; gap: 32px !important; }
          .contact-grid-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
};

export default ServiceContactForm;
