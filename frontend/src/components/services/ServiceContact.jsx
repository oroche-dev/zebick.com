import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

/**
 * ServiceContact — premium contact section with form + sidebar contact info.
 *
 * info: {
 *   address?: string,
 *   email: string,
 *   phone: string,
 *   emergencyPhone?: string,
 *   socials?: [{ name, url, icon }]
 * }
 */
const ServiceContact = ({
  eyebrow = 'Kontakt',
  title = 'Bereit für den nächsten Schritt?',
  accentWord = 'Schritt?',
  subtitle = 'Lassen Sie uns über Ihr Projekt sprechen. Wir melden uns innerhalb von 24 Stunden zurück.',
  info = {},
  topic = 'Anfrage',
  testid = 'service-contact',
}) => {
  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      await axios.post(`${API}/contact/submit`, {
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        company: form.company || undefined,
        service: topic,
        message: form.message,
      });
      setSent(true);
      toast.success('Nachricht gesendet! Wir melden uns in Kürze.');
      setForm({ name: '', company: '', email: '', phone: '', message: '' });
    } catch (err) {
      toast.error('Senden fehlgeschlagen. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      data-testid={testid}
      style={{ padding: '120px 0', background: 'var(--bg-primary)', borderTop: '1px solid var(--border-subtle)' }}
    >
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '48px', alignItems: 'start' }}>
          {/* Left: Info */}
          <div>
            <div
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '8px 18px', background: 'rgba(255,107,0,0.10)',
                border: '1px solid rgba(255,107,0,0.25)', borderRadius: '999px',
                marginBottom: '18px', fontSize: '12px', fontWeight: 700,
                color: 'var(--accent-primary)', letterSpacing: '0.08em', textTransform: 'uppercase',
              }}
            >
              {eyebrow}
            </div>
            <h2
              style={{
                fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-0.02em',
                lineHeight: 1.15, marginBottom: '18px', color: 'var(--text-primary)',
              }}
            >
              {title.replace(accentWord, '')}<span className="text-gradient">{accentWord}</span>
            </h2>
            <p style={{ fontSize: '16px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '36px' }}>
              {subtitle}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {info.address && (
                <ContactInfoRow icon={MapPin} label="Adresse" value={info.address} />
              )}
              {info.email && (
                <ContactInfoRow icon={Mail} label="E-Mail" value={info.email} href={`mailto:${info.email}`} />
              )}
              {info.phone && (
                <ContactInfoRow icon={Phone} label="Telefon" value={info.phone} href={`tel:${info.phone.replace(/\s/g, '')}`} />
              )}
              {info.emergencyPhone && (
                <ContactInfoRow icon={AlertCircle} label="Notfall-Hotline · 24/7" value={info.emergencyPhone} href={`tel:${info.emergencyPhone.replace(/\s/g, '')}`} accent="#FF4444" />
              )}
            </div>

            {info.socials && info.socials.length > 0 && (
              <div style={{ marginTop: '32px', display: 'flex', gap: '12px' }}>
                {info.socials.map((s) => (
                  <a
                    key={s.name}
                    href={s.url}
                    target="_blank" rel="noopener noreferrer"
                    title={s.name}
                    data-testid={`${testid}-social-${s.name.toLowerCase()}`}
                    style={{
                      width: '44px', height: '44px', borderRadius: 'var(--radius-md)',
                      background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--text-muted)', transition: 'all 0.3s ease', textDecoration: 'none',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.color = 'var(--accent-primary)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                  >
                    {s.icon && <s.icon size={18} />}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Right: Form */}
          <form
            onSubmit={handleSubmit}
            data-testid={`${testid}-form`}
            style={{
              padding: '40px',
              background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xl)',
              display: 'flex', flexDirection: 'column', gap: '18px',
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
              <Input testid={`${testid}-input-name`} placeholder="Name *" required value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
              <Input testid={`${testid}-input-company`} placeholder="Unternehmen" value={form.company} onChange={(v) => setForm({ ...form, company: v })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
              <Input testid={`${testid}-input-email`} type="email" placeholder="E-Mail *" required value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
              <Input testid={`${testid}-input-phone`} type="tel" placeholder="Telefon" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
            </div>
            <textarea
              data-testid={`${testid}-input-message`}
              placeholder="Ihre Nachricht *"
              required
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              style={{
                width: '100%', padding: '14px 16px',
                background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
                fontSize: '15px', fontFamily: 'inherit', resize: 'vertical', outline: 'none',
                transition: 'border-color 0.2s ease',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
            />
            <button
              type="submit"
              disabled={loading || sent}
              data-testid={`${testid}-submit`}
              className="btn-primary"
              style={{ justifyContent: 'center', gap: '10px' }}
            >
              {loading ? <><Loader2 size={18} className="animate-spin" /> Wird gesendet...</>
                : sent ? <><CheckCircle size={18} /> Gesendet</>
                  : <>Nachricht senden <Send size={18} /></>}
            </button>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>
              Wir melden uns innerhalb von 24 Stunden zurück. Ihre Daten werden DSGVO-konform behandelt.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};

const Input = ({ testid, value, onChange, ...rest }) => (
  <input
    data-testid={testid}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    {...rest}
    style={{
      width: '100%', padding: '14px 16px',
      background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
      fontSize: '15px', outline: 'none',
      transition: 'border-color 0.2s ease',
    }}
    onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; }}
    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
  />
);

const ContactInfoRow = ({ icon: Icon, label, value, href, accent = 'var(--accent-primary)' }) => {
  const content = (
    <>
      <div
        style={{
          width: '44px', height: '44px', borderRadius: 'var(--radius-md)',
          background: `${accent === '#FF4444' ? 'rgba(255,68,68,0.12)' : 'rgba(255,107,0,0.12)'}`,
          border: `1px solid ${accent === '#FF4444' ? 'rgba(255,68,68,0.25)' : 'rgba(255,107,0,0.25)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}
      >
        <Icon size={18} color={accent} />
      </div>
      <div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{label}</div>
        <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>{value}</div>
      </div>
    </>
  );
  if (href) {
    return (
      <a href={href} style={{ display: 'flex', alignItems: 'center', gap: '14px', textDecoration: 'none' }}>
        {content}
      </a>
    );
  }
  return <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>{content}</div>;
};

export default ServiceContact;
