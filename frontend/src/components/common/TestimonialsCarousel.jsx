import React, { useEffect, useRef, useState } from 'react';
import { Star } from 'lucide-react';

/**
 * TestimonialsCarousel — one testimonial at a time, auto-advancing, same
 * behaviour on mobile and desktop (no separate breakpoint layout). Pauses on
 * hover/focus and respects prefers-reduced-motion. Dots below for manual nav.
 *
 * items: [{ name, role, rating, content, avatar }]
 */
const TestimonialsCarousel = ({ items = [], interval = 6000 }) => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useRef(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    if (paused || reducedMotion.current || items.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % items.length), interval);
    return () => clearInterval(id);
  }, [paused, items.length, interval]);

  // Clamp index if the item count shrinks (e.g. data reloads with fewer entries).
  useEffect(() => {
    if (index >= items.length) setIndex(0);
  }, [items.length, index]);

  if (items.length === 0) return null;

  return (
    <div
      data-testid="testimonials-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      style={{ maxWidth: '720px', margin: '0 auto' }}
    >
      <div style={{ overflow: 'hidden', borderRadius: '20px' }}>
        <div
          style={{
            display: 'flex',
            transform: `translateX(-${index * 100}%)`,
            transition: 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          {items.map((t, i) => (
            <div key={i} data-testid={`testimonial-${i}`} style={{ flex: '0 0 100%', padding: '4px' }}>
              <div style={{
                padding: 'clamp(28px, 4vw, 44px)',
                background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                border: '1px solid rgba(255, 107, 0, 0.15)',
                borderRadius: '20px',
                textAlign: 'center',
              }}>
                <div style={{ display: 'flex', gap: '3px', justifyContent: 'center', marginBottom: '18px' }}>
                  {[...Array(5)].map((_, s) => (
                    <Star key={s} size={18} fill={s < (t.rating || 5) ? 'var(--accent-primary)' : 'transparent'} color="var(--accent-primary)" />
                  ))}
                </div>
                <p style={{
                  fontSize: 'clamp(15px, 2vw, 18px)', lineHeight: 1.7, color: 'var(--text-secondary)',
                  marginBottom: '26px', fontStyle: 'italic',
                }}>
                  "{t.content}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px' }}>
                  {t.avatar ? (
                    <img src={t.avatar} alt={t.name} loading="lazy" style={{
                      width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover',
                      border: '2px solid rgba(255, 107, 0, 0.4)',
                    }} />
                  ) : (
                    <div style={{
                      width: '52px', height: '52px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--accent-primary), #cc5500)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, color: '#000', fontSize: '18px', flexShrink: 0,
                    }}>
                      {(t.name || '?').charAt(0)}
                    </div>
                  )}
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>{t.name}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {items.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Bewertung ${i + 1} von ${items.length}`}
              data-testid={`testimonials-dot-${i}`}
              style={{
                width: i === index ? '22px' : '8px', height: '8px', borderRadius: '999px',
                background: i === index ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.18)',
                border: 'none', cursor: 'pointer', padding: 0,
                transition: 'width 0.3s ease, background 0.3s ease',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TestimonialsCarousel;
