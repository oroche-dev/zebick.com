import React from 'react';
import { Star } from 'lucide-react';

/**
 * Vertically auto-scrolling testimonial columns (infinite loop via CSS
 * keyframes, no framer-motion — matches this project's plain-React/inline-
 * style convention). Each column pauses on hover so a visitor can actually
 * read the card they're on. items: [{ name, role, rating, content, avatar }]
 */
const splitColumns = (items, n) => {
  const cols = Array.from({ length: n }, () => []);
  items.forEach((item, i) => cols[i % n].push(item));
  return cols;
};

const TestimonialCard = ({ t }) => (
  <li className="tmq-card">
    <div style={{ display: 'flex', gap: '3px', marginBottom: '14px' }}>
      {[...Array(5)].map((_, s) => (
        <Star key={s} size={14} fill={s < (t.rating || 5) ? 'var(--accent-primary)' : 'transparent'} color="var(--accent-primary)" />
      ))}
    </div>
    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.7, margin: 0, fontStyle: 'italic' }}>
      „{t.content}"
    </p>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '20px' }}>
      {t.avatar ? (
        <img src={t.avatar} alt={t.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,107,0,0.3)', flexShrink: 0 }} />
      ) : (
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-primary), #cc5500)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#000', fontSize: '15px', flexShrink: 0 }}>
          {(t.name || '?').charAt(0)}
        </div>
      )}
      <div>
        <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>{t.name}</div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.role}</div>
      </div>
    </div>
  </li>
);

const MarqueeColumn = ({ items, duration }) => {
  if (items.length === 0) return null;
  return (
    <div className="tmq-col">
      <ul className="tmq-track" style={{ animationDuration: `${duration}s` }}>
        {[0, 1].map((dup) => (
          <React.Fragment key={dup}>
            {items.map((t, i) => <TestimonialCard key={`${dup}-${i}`} t={t} />)}
          </React.Fragment>
        ))}
      </ul>
    </div>
  );
};

const TestimonialsMarquee = ({ items = [] }) => {
  const columns = splitColumns(items, 3).filter((c) => c.length > 0);
  if (columns.length === 0) return null;

  return (
    <div className="tmq-wrap" data-testid="testimonials-marquee">
      {columns.map((col, i) => (
        <MarqueeColumn key={i} items={col} duration={15 + i * 4} />
      ))}
      <style>{`
        .tmq-wrap {
          display: flex; justify-content: center; gap: 20px;
          max-height: 640px; overflow: hidden;
          -webkit-mask-image: linear-gradient(to bottom, transparent, black 12%, black 88%, transparent);
          mask-image: linear-gradient(to bottom, transparent, black 12%, black 88%, transparent);
        }
        .tmq-col { flex: 1 1 0; min-width: 0; max-width: 360px; overflow: hidden; }
        .tmq-col:nth-child(2), .tmq-col:nth-child(3) { display: none; }
        @media (min-width: 720px) { .tmq-col:nth-child(2) { display: block; } }
        @media (min-width: 1020px) { .tmq-col:nth-child(3) { display: block; } }
        .tmq-track {
          display: flex; flex-direction: column; gap: 20px;
          list-style: none; margin: 0; padding: 0;
          animation-name: tmqScroll; animation-timing-function: linear; animation-iteration-count: infinite;
        }
        .tmq-col:hover .tmq-track { animation-play-state: paused; }
        .tmq-card {
          padding: 28px; border-radius: var(--radius-xl, 20px);
          border: 1px solid var(--border-subtle);
          background: linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%);
          transition: border-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
        }
        .tmq-card:hover { border-color: var(--accent-primary); transform: translateY(-4px); box-shadow: 0 16px 36px rgba(255,107,0,0.15); }
        @keyframes tmqScroll { from { transform: translateY(0); } to { transform: translateY(-50%); } }
        @media (prefers-reduced-motion: reduce) { .tmq-track { animation: none; } }
      `}</style>
    </div>
  );
};

export default TestimonialsMarquee;
