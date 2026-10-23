import React, { useEffect, useRef, useState } from 'react';

/**
 * AutoSlider — generic one-at-a-time auto-advancing slider. Same mechanics
 * as TestimonialsCarousel but takes a renderItem render-prop instead of a
 * fixed card shape, so it works for any item type (team members, logos, …).
 * Pauses on hover/focus, respects prefers-reduced-motion. Dots for manual
 * nav are optional (showDots, default true).
 */
const AutoSlider = ({ items = [], renderItem, interval = 4500, testid = 'auto-slider', showDots = true }) => {
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

  useEffect(() => {
    if (index >= items.length) setIndex(0);
  }, [items.length, index]);

  if (items.length === 0) return null;

  return (
    <div
      data-testid={testid}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div style={{ overflow: 'hidden' }}>
        <div style={{
          display: 'flex',
          transform: `translateX(-${index * 100}%)`,
          transition: 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
        }}>
          {items.map((item, i) => (
            <div key={i} data-testid={`${testid}-item-${i}`} style={{ flex: '0 0 100%', minWidth: 0 }}>
              {renderItem(item, i)}
            </div>
          ))}
        </div>
      </div>

      {showDots && items.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '18px' }}>
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`${i + 1} von ${items.length}`}
              data-testid={`${testid}-dot-${i}`}
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

export default AutoSlider;
