import React, { useState, useEffect } from 'react';
import { Plus, Minus, HelpCircle } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const FAQSection = ({ title = 'Häufig gestellte Fragen', subtitle = 'Antworten auf die wichtigsten Fragen' }) => {
  const [items, setItems] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/faq/items`)
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setItems(d))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (items.length === 0) return null;

  return (
    <section style={{
      padding: '120px 0',
      background: 'var(--bg-primary)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(255,107,0,0.05) 0%, transparent 50%)',
      }} />
      <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '900px' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 18px', background: 'rgba(255,107,0,0.12)', border: '1px solid rgba(255,107,0,0.25)', borderRadius: '999px', marginBottom: '18px' }}>
            <HelpCircle size={14} color="var(--accent-primary)" />
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-primary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              FAQ
            </span>
          </div>
          <h2 style={{ fontSize: 'clamp(32px, 4.5vw, 48px)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: '14px' }}>
            {title.split(' ').map((w, i, arr) => (
              <span key={i} style={{ color: i === arr.length - 1 ? 'var(--accent-primary)' : 'inherit' }}>
                {w}{i < arr.length - 1 ? ' ' : ''}
              </span>
            ))}
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--text-muted)', lineHeight: 1.6 }}>{subtitle}</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {items.map((f) => {
            const open = openId === f.id;
            return (
              <div
                key={f.id}
                data-testid={`faq-item-${f.id}`}
                style={{
                  background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
                  border: '1px solid',
                  borderColor: open ? 'rgba(255,107,0,0.3)' : 'var(--border-subtle)',
                  borderRadius: 'var(--radius-xl)',
                  overflow: 'hidden',
                  transition: 'border-color 0.3s ease',
                }}
              >
                <button
                  onClick={() => setOpenId(open ? null : f.id)}
                  style={{
                    width: '100%',
                    padding: '22px 28px',
                    background: 'none',
                    border: 'none',
                    color: 'inherit',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '20px',
                    fontFamily: 'inherit',
                  }}
                >
                  <span style={{ fontSize: '16px', fontWeight: 600, lineHeight: 1.4, letterSpacing: '-0.01em' }}>
                    {f.question}
                  </span>
                  <span style={{
                    flexShrink: 0,
                    width: '36px', height: '36px',
                    background: open ? 'var(--accent-primary)' : 'rgba(255,107,0,0.12)',
                    color: open ? '#000' : 'var(--accent-primary)',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.2s, color 0.2s',
                  }}>
                    {open ? <Minus size={16} /> : <Plus size={16} />}
                  </span>
                </button>
                {open && (
                  <div style={{
                    padding: '0 28px 26px',
                    color: 'var(--text-secondary)',
                    fontSize: '15px',
                    lineHeight: 1.7,
                    whiteSpace: 'pre-line',
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '20px',
                  }}>
                    {f.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
