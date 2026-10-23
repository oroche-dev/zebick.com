import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as LucideIcons from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

/** Map String-Icon-Name → Lucide-Komponente, mit Fallback. */
const resolveIcon = (name) => {
  if (!name) return LucideIcons.Building2;
  return LucideIcons[name] || LucideIcons.Building2;
};

const sectionLabel = (label) => (
  <div style={{
    display: 'inline-flex', alignItems: 'center', gap: '8px',
    padding: '6px 14px', background: 'rgba(255,107,0,0.08)',
    border: '1px solid rgba(255,107,0,0.2)', borderRadius: '999px', marginBottom: '20px',
  }}>
    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-primary)' }} />
    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', fontWeight: 700, color: 'var(--accent-primary)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
      {label}
    </span>
  </div>
);

/**
 * Rendert die "Sicherheit für jede Branche" / Branchen-Sektion dynamisch aus dem Backend.
 * Fallback: defaultItems (Hardcoded-Daten aus der Seite).
 */
const ServiceIndustries = ({
  slug,
  defaultItems = [],
  defaultHeading = 'Branchen',
  defaultSubtitle = '',
  eyebrowLabel = 'Branchen',
}) => {
  const [data, setData] = useState({
    industries_enabled: defaultItems.length > 0,
    industries: defaultItems,
    industries_heading: defaultHeading,
    industries_subtitle: defaultSubtitle,
  });

  useEffect(() => {
    let mounted = true;
    axios.get(`${API}/service-pages/${slug}`)
      .then((r) => {
        if (!mounted || !r.data) return;
        const hasDb = Array.isArray(r.data.industries) && r.data.industries.length > 0;
        setData({
          industries_enabled: typeof r.data.industries_enabled === 'boolean'
            ? r.data.industries_enabled
            : hasDb,
          industries: hasDb ? r.data.industries : defaultItems,
          industries_heading: r.data.industries_heading || defaultHeading,
          industries_subtitle: r.data.industries_subtitle || defaultSubtitle,
        });
      })
      .catch(() => { /* fallback bleibt */ });
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (!data.industries_enabled || !data.industries?.length) return null;

  return (
    <section
      className="section"
      data-testid={`industries-section-${slug}`}
      style={{ background: 'var(--bg-secondary)', padding: '120px 0', position: 'relative' }}
    >
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '72px' }}>
          {sectionLabel(eyebrowLabel)}
          <h2 className="heading-1" style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 900, marginBottom: '20px' }}>
            {data.industries_heading}
          </h2>
          {data.industries_subtitle && (
            <p style={{ fontSize: '17px', color: 'var(--text-muted)', maxWidth: '640px', margin: '0 auto', lineHeight: 1.6 }}>
              {data.industries_subtitle}
            </p>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {data.industries.map((c, i) => {
            const Icon = resolveIcon(c.icon);
            return (
              <div
                key={i}
                data-testid={`industry-card-${slug}-${i}`}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-xl)',
                  padding: 0,
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-primary)';
                  e.currentTarget.style.transform = 'translateY(-6px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {c.img && (
                  <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
                    <img src={c.img} alt={c.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 0%, rgba(8,8,8,0.9) 100%)' }} />
                    {c.tag && (
                      <div style={{
                        position: 'absolute', top: '16px', left: '16px', padding: '6px 12px',
                        background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,107,0,0.4)',
                        borderRadius: '999px', color: 'var(--accent-primary)', fontSize: '11px',
                        fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', backdropFilter: 'blur(8px)',
                      }}>{c.tag}</div>
                    )}
                    <div style={{
                      position: 'absolute', bottom: '16px', left: '16px', width: '44px', height: '44px',
                      background: 'rgba(255,107,0,0.9)', borderRadius: 'var(--radius-md)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon size={22} color="#000" />
                    </div>
                  </div>
                )}
                <div style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '10px', color: 'var(--text-primary)' }}>{c.title}</h3>
                  <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '14px' }}>{c.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServiceIndustries;
