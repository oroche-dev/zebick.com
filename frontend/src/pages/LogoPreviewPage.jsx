import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Sparkles } from 'lucide-react';
import ZebickLogoB from '../components/brand/ZebickLogoB';
import Seo from '../components/common/Seo';

const VARIANTS = [
  {
    id: 'geist',
    name: 'Geist Mono',
    tagline: 'Vercel 2024 · Tech, aber frisch',
    description: 'Die neueste Mono-Schrift von Vercel (den Machern von Next.js). Klarer, geometrischer und modernerer als JetBrains Mono — behält aber die Code-Ästhetik. Perfekt für eine Digitalagentur mit Tech-DNA.',
  },
  {
    id: 'outfit',
    name: 'Outfit',
    tagline: 'Proportional · Premium & Minimal',
    description: 'Moderne geometrische Sans-Serif — nicht mehr Monospace. Eleganter, hochwertiger, weniger „Terminal". Wirkt wie ein zeitgenössisches Studio-Branding. Sehr beliebt bei Premium-Startups 2024/25.',
  },
  {
    id: 'sora',
    name: 'Sora',
    tagline: 'Premium Geometric · Bold & Clean',
    description: 'Etwas runder und freundlicher als Outfit, trotzdem scharf und modern. Premium-Feeling mit einer Prise Menschlichkeit. Aktuell einer der beliebtesten Fonts für Tech-Brands.',
  },
  {
    id: 'jetbrains',
    name: 'JetBrains Mono',
    tagline: 'Original · Dev-Tool Klassiker',
    description: 'Die ursprüngliche Variante zur Referenz.',
  },
];

const LogoPreviewPage = () => {
  const [selected, setSelected] = useState('geist');

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', padding: '60px 24px' }}>
      <Seo title="Logo-Varianten" description="Interne Logo-Vorschau." path="/logo-varianten" noindex />
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px', marginBottom: '32px' }}>
          <ArrowLeft size={16} /> Zurück zur Website
        </Link>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 18px', background: 'rgba(255,107,0,0.12)', border: '1px solid rgba(255,107,0,0.25)', borderRadius: '999px', marginBottom: '18px' }}>
          <Sparkles size={14} color="var(--accent-primary)" />
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-primary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Schrift-Varianten
          </span>
        </div>

        <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '12px' }}>
          Welche Schrift ist <span style={{ color: 'var(--accent-primary)' }}>am modernsten</span>?
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '16px', marginBottom: '36px', maxWidth: '740px', lineHeight: 1.6 }}>
          Das Design bleibt identisch (Klammern, blinkender Cursor, Unterstrich). Nur die Schrift ändert sich.
          Unten können Sie zwischen den Varianten umschalten — sie werden alle in Header-Größe angezeigt.
        </p>

        {/* Live Preview (Hero-Karte) */}
        <section style={{
          background: 'linear-gradient(145deg, rgba(255,107,0,0.06), rgba(255,107,0,0.02))',
          border: '1px solid rgba(255,107,0,0.25)',
          borderRadius: 'var(--radius-xl)',
          padding: 'clamp(40px, 6vw, 72px) 32px',
          marginBottom: '40px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, rgba(255,107,0,0.08), transparent 60%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'center', marginBottom: '36px' }}>
            <ZebickLogoB height={140} variant={selected} />
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
            Aktuell ausgewählt
          </div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--accent-primary)' }}>
            {VARIANTS.find((v) => v.id === selected)?.name}
          </div>
        </section>

        {/* Variant Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          {VARIANTS.map((v) => {
            const isActive = selected === v.id;
            return (
              <button
                key={v.id}
                onClick={() => setSelected(v.id)}
                style={{
                  textAlign: 'left',
                  background: isActive ? 'linear-gradient(145deg, rgba(255,107,0,0.1), rgba(255,107,0,0.02))' : 'rgba(255,255,255,0.03)',
                  border: '1px solid',
                  borderColor: isActive ? 'var(--accent-primary)' : 'var(--border-subtle)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '24px',
                  cursor: 'pointer',
                  transition: 'border-color 0.3s, background 0.3s, transform 0.2s',
                  transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
                  color: 'inherit',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.borderColor = 'rgba(255,107,0,0.4)'; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
                  <div style={{ fontSize: '10px', color: 'var(--accent-primary)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    {v.tagline}
                  </div>
                  {isActive && (
                    <div style={{ width: '20px', height: '20px', background: 'var(--accent-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={12} color="#000" />
                    </div>
                  )}
                </div>
                <div style={{ height: '80px', display: 'flex', alignItems: 'center', marginBottom: '18px', padding: '0 8px', background: '#000', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <ZebickLogoB height={52} variant={v.id} />
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '8px', letterSpacing: '-0.01em' }}>{v.name}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>{v.description}</p>
              </button>
            );
          })}
        </div>

        {/* Confirmation box */}
        <div style={{ padding: '28px', background: 'rgba(255,107,0,0.06)', border: '1px solid rgba(255,107,0,0.25)', borderRadius: 'var(--radius-xl)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px' }}>So machen Sie weiter</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
            Schreiben Sie einfach die Abkürzung der gewählten Schrift:
            <br /><br />
            • <strong style={{ color: 'var(--accent-primary)' }}>„geist"</strong> — Geist Mono (modernste Tech-Mono)<br />
            • <strong style={{ color: 'var(--accent-primary)' }}>„outfit"</strong> — Outfit (premium proportional)<br />
            • <strong style={{ color: 'var(--accent-primary)' }}>„sora"</strong> — Sora (premium mit mehr Runden)<br />
            • <strong style={{ color: 'var(--accent-primary)' }}>„bleibt"</strong> — JetBrains Mono (Original behalten)
            <br /><br />
            Dann baue ich die gewählte Schrift sofort überall ein (Header, Footer, Favicon).
          </p>
        </div>
      </div>
    </div>
  );
};

export default LogoPreviewPage;
