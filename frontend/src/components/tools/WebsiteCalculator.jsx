import React, { useState, useMemo } from 'react';
import {
  Mail, Send, CheckCircle, Layout, Building2, ShoppingCart, Cpu, Layers,
  FileText, Store, Globe2, Plug, Sparkles, Palette, Calculator
} from 'lucide-react';
import { baseCard, inputStyle, labelStyle, submitLead } from './toolStyles';

// Niedrigere Preise (Markt-angepasst, Jan 2026)
const TYPE_BASE_DEFAULT = { landing: 690, business: 1490, shop: 2500, saas: 6900, custom: 5400 };
const FEATURE_PRICES_DEFAULT = { cms: 490, shop: 2200, multilang: 690, integrations: 1090, ai: 1490, design: 990 };
const PER_PAGE_PRICE = 90; // statt 120

const PROJECT_TYPES = [
  { id: 'landing',  label: 'Landingpage',          desc: 'Single-Page mit Wow-Effekt', Icon: Layout },
  { id: 'business', label: 'Unternehmenswebsite',  desc: '5–15 Seiten, CMS',           Icon: Building2 },
  { id: 'shop',     label: 'Online-Shop',          desc: 'Produkte & Checkout',        Icon: ShoppingCart },
  { id: 'saas',     label: 'SaaS-Plattform',       desc: 'Login, Dashboard, Abo',      Icon: Cpu },
  { id: 'custom',   label: 'Web-App',              desc: 'Individuelle Anwendung',     Icon: Layers },
];

const FEATURES = [
  { id: 'cms',          label: 'CMS / Redaktion',     desc: 'Inhalte selbst bearbeiten',           Icon: FileText },
  { id: 'shop',         label: 'E-Commerce-Modul',    desc: 'Produkte, Warenkorb, Zahlung',        Icon: Store },
  { id: 'multilang',    label: 'Mehrsprachig',        desc: 'DE / EN / weitere Sprachen',          Icon: Globe2 },
  { id: 'integrations', label: 'API-Integrationen',   desc: 'CRM, ERP, Mailing, Analytics',        Icon: Plug },
  { id: 'ai',           label: 'KI-Funktionen',       desc: 'Chatbot, Empfehlungen, Automation',   Icon: Sparkles },
  { id: 'design',       label: 'Premium-Design',      desc: 'Custom UI mit Animationen',           Icon: Palette },
];

const WebsiteCalculator = ({ basePrices, featurePrices }) => {
  const TYPE_BASE = basePrices && Object.keys(basePrices).length ? basePrices : TYPE_BASE_DEFAULT;
  const FEATURE_PRICES = featurePrices && Object.keys(featurePrices).length ? featurePrices : FEATURE_PRICES_DEFAULT;

  const [pages, setPages] = useState(8);
  const [type, setType] = useState('business');
  const [features, setFeatures] = useState({
    cms: true, shop: false, multilang: false, integrations: false, ai: false, design: false,
  });
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const estimate = useMemo(() => {
    let base = TYPE_BASE[type] || 1990;
    base += pages * PER_PAGE_PRICE;
    Object.entries(features).forEach(([k, v]) => { if (v) base += (FEATURE_PRICES[k] || 0); });
    return { low: Math.round(base * 0.88), high: Math.round(base * 1.18) };
  }, [pages, type, features, TYPE_BASE, FEATURE_PRICES]);

  const toggle = (k) => setFeatures({ ...features, [k]: !features[k] });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px' }} className="tool-grid calc-root" data-testid="tool-kostenrechner">

      {/* ===== CONFIG CARD ===== */}
      <div style={{ ...baseCard, padding: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-dark))',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000',
          }}>
            <Calculator size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
              Konfiguriere dein Projekt
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
              Echtzeit-Schätzung in 30 Sekunden
            </p>
          </div>
        </div>

        {/* PROJEKT-TYP */}
        <SectionTitle number="01" title="Projekt-Typ" />
        <div className="calc-types-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginBottom: '32px' }}>
          {PROJECT_TYPES.map((t) => {
            const Icon = t.Icon;
            const active = type === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setType(t.id)}
                data-testid={`calc-type-${t.id}`}
                style={{
                  padding: '16px 14px', borderRadius: '14px', cursor: 'pointer',
                  background: active ? 'linear-gradient(135deg, rgba(255,107,0,0.18), rgba(255,107,0,0.04))' : 'rgba(255,255,255,0.025)',
                  border: active ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                  color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                  textAlign: 'left', transition: 'all 0.2s',
                  boxShadow: active ? '0 6px 20px rgba(255, 107, 0, 0.18)' : 'none',
                }}
              >
                <Icon size={20} style={{ color: active ? 'var(--accent-primary)' : 'var(--text-muted)', marginBottom: '8px' }} />
                <div style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '-0.01em' }}>{t.label}</div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.4 }}>{t.desc}</div>
              </button>
            );
          })}
        </div>

        {/* ANZAHL SEITEN */}
        <SectionTitle number="02" title="Anzahl Seiten" />
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ fontSize: '15px', color: 'var(--text-muted)' }}>Aktuell</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span className="text-gradient" style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>{pages}</span>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{pages === 1 ? 'Seite' : 'Seiten'}</span>
            </div>
          </div>
          <input
            type="range" min="1" max="50" value={pages}
            onChange={(e) => setPages(+e.target.value)}
            data-testid="calc-pages"
            style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
            <span>1</span><span>10</span><span>25</span><span>50</span>
          </div>
        </div>

        {/* FEATURES */}
        <SectionTitle number="03" title="Features" />
        <div className="calc-features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
          {FEATURES.map((f) => {
            const Icon = f.Icon;
            const active = features[f.id];
            return (
              <label
                key={f.id}
                data-testid={`calc-feature-${f.id}`}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px 16px',
                  background: active ? 'linear-gradient(135deg, rgba(255,107,0,0.14), rgba(255,107,0,0.04))' : 'rgba(255,255,255,0.025)',
                  border: active ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                  borderRadius: '14px', cursor: 'pointer', transition: 'all 0.2s',
                  boxShadow: active ? '0 4px 16px rgba(255, 107, 0, 0.12)' : 'none',
                }}
              >
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                  background: active ? 'rgba(255, 107, 0, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={18} color={active ? 'var(--accent-primary)' : 'var(--text-muted)'} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text-primary)' }}>{f.label}</span>
                    <input
                      type="checkbox" checked={active} onChange={() => toggle(f.id)}
                      style={{ accentColor: 'var(--accent-primary)', width: '16px', height: '16px', flexShrink: 0 }}
                    />
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.4 }}>{f.desc}</div>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* ===== ESTIMATE CARD ===== */}
      <div style={{ ...baseCard, padding: '36px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '-80px', right: '-80px', width: '280px', height: '280px',
          background: 'radial-gradient(circle, rgba(255, 107, 0, 0.18), transparent 70%)',
          filter: 'blur(40px)', pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '6px 12px', borderRadius: '999px',
            background: 'rgba(255, 107, 0, 0.12)', border: '1px solid rgba(255, 107, 0, 0.3)',
            fontSize: '11px', fontWeight: 700, color: 'var(--accent-primary)',
            letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '20px',
          }}>
            <Sparkles size={11} /> Geschätzte Kosten
          </div>
          <div style={{
            fontSize: 'clamp(34px, 4.5vw, 48px)',
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-0.025em',
            fontFamily: 'Space Grotesk, sans-serif',
            background: 'linear-gradient(135deg, #fff 0%, #FFB366 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            {estimate.low.toLocaleString('de-DE')} – {estimate.high.toLocaleString('de-DE')} €
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '14px', lineHeight: 1.6 }}>
            Unverbindliche Schätzung (netto). Endgültiger Preis nach kostenlosem 30-Min-Erstgespräch.
          </p>

          {/* Mini-Breakdown */}
          <div style={{ marginTop: '24px', padding: '16px 18px', background: 'rgba(255,255,255,0.025)', border: '1px solid var(--border-subtle)', borderRadius: '12px' }}>
            <Row label="Projekt-Typ" value={PROJECT_TYPES.find((p) => p.id === type)?.label || '–'} />
            <Row label="Seiten" value={`${pages}`} />
            <Row label="Features" value={`${Object.values(features).filter(Boolean).length} ausgewählt`} />
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitLead({
              tool: 'Website-Kostenrechner',
              payload: { pages, type, features, estimate },
              email,
              name: 'Kostenrechner-Lead',
              message: 'Ich möchte ein verbindliches Angebot.',
              onSuccess: () => setSent(true),
            });
          }}
          style={{ marginTop: '28px', position: 'relative' }}
        >
          <label style={{ ...labelStyle, marginBottom: '8px' }}>
            <Mail size={14} /> Sende mir das genaue Angebot
          </label>
          <input
            required type="email" placeholder="ihre@firma.de" value={email}
            onChange={(e) => setEmail(e.target.value)}
            data-testid="calc-email" style={inputStyle}
          />
          <button
            type="submit"
            disabled={!email || sent}
            data-testid="calc-submit"
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '12px', opacity: (!email || sent) ? 0.5 : 1 }}
          >
            {sent ? <><CheckCircle size={18} /> Gesendet!</> : <>Angebot anfordern <Send size={18} /></>}
          </button>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '10px' }}>
            Kein Spam. Innerhalb 24h Antwort.
          </div>
        </form>
      </div>

      {/* Mobile Style */}
      <style>{`
        @media (max-width: 768px) {
          .calc-root {
            display: grid !important;
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          .calc-types-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .calc-features-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

const SectionTitle = ({ number, title }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: '24px', height: '24px', borderRadius: '8px',
      background: 'rgba(255, 107, 0, 0.12)', border: '1px solid rgba(255, 107, 0, 0.3)',
      fontSize: '11px', fontWeight: 700, color: 'var(--accent-primary)',
      fontFamily: 'JetBrains Mono, monospace',
    }}>
      {number}
    </span>
    <span style={{
      fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)',
      textTransform: 'uppercase', letterSpacing: '0.08em',
    }}>
      {title}
    </span>
  </div>
);

const Row = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', fontSize: '13px' }}>
    <span style={{ color: 'var(--text-muted)' }}>{label}</span>
    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{value}</span>
  </div>
);

export default WebsiteCalculator;
