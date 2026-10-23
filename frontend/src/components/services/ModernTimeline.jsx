import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { CheckCircle, Clock } from 'lucide-react';

// Flowing wave: a smooth curve that touches down exactly at each bubble's
// measured center and bulges up/down between consecutive bubbles.
const buildWavePath = (points, amp = 36) => {
  if (points.length < 2) return '';
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i], p2 = points[i + 1];
    const dir = i % 2 === 0 ? -1 : 1;
    const cp1x = p1.x + (p2.x - p1.x) * 0.3;
    const cp2x = p1.x + (p2.x - p1.x) * 0.7;
    const cpY = (p1.y + p2.y) / 2 + dir * amp;
    d += ` C ${cp1x} ${cpY}, ${cp2x} ${cpY}, ${p2.x} ${p2.y}`;
  }
  return d;
};

/**
 * Unified "Unser Vorgehen" timeline — used across every service page.
 *
 * Both desktop and mobile get the same pinned, horizontally-scrolling
 * track — the section stays stuck to the viewport while vertical scroll
 * drives the card row sideways (same mechanic as a GSAP ScrollTrigger
 * pinned-horizontal-scroll, done with a scroll listener + manual pin
 * instead of adding GSAP as a dependency). Card/bubble/gap sizing scales
 * down on narrow viewports via the `isDesktop` flag. Respects
 * `prefers-reduced-motion` by falling back to a plain `overflow-x: auto`
 * row (no scroll-jacking) on both breakpoints.
 *
 * Prop API is unchanged from the previous version, so no service page's
 * data needed to change — only how it's rendered.
 *
 * Props:
 *  - eyebrow:   small label above heading (default "Unser Vorgehen")
 *  - title:     headline (string or ReactNode)
 *  - subtitle:  intro paragraph
 *  - steps:     [{ icon, title, desc, duration, deliverables: string[], image }]
 *  - background: optional css background for the section
 */
const ModernTimeline = ({
  eyebrow = 'Unser Vorgehen',
  title = 'So gehen wir vor',
  subtitle = 'Ein strukturierter, transparenter Prozess – von der ersten Idee bis zum erfolgreichen Go-Live.',
  steps = [],
  background = 'var(--bg-primary)',
}) => {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window === 'undefined' || window.innerWidth > 768
  );
  const [reducedMotion, setReducedMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth > 768);
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const onMotionChange = () => setReducedMotion(!!mq?.matches);
    window.addEventListener('resize', onResize);
    mq?.addEventListener?.('change', onMotionChange);
    return () => {
      window.removeEventListener('resize', onResize);
      mq?.removeEventListener?.('change', onMotionChange);
    };
  }, []);

  return (
    <section
      className="section"
      data-testid="section-process"
      style={{
        padding: 'clamp(70px, 10vw, 120px) 0',
        background,
        position: 'relative',
      }}
    >
      {/* overflow:hidden lives on this inner wrapper, not the <section> itself —
          position:sticky in HorizontalTrack below needs the section to NOT be a
          clipping/scroll ancestor, or the sticky pin breaks (clipped away as
          soon as the section scrolls past, instead of holding in the viewport). */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <div aria-hidden style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '900px', height: '900px',
          background: 'radial-gradient(circle, rgba(255, 107, 0, 0.05) 0%, transparent 60%)',
          filter: 'blur(120px)', pointerEvents: 'none',
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            textAlign: 'center', marginBottom: 'clamp(40px, 6vw, 80px)',
            maxWidth: '720px', marginLeft: 'auto', marginRight: 'auto',
          }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 18px',
              background: 'rgba(255, 107, 0, 0.1)', border: '1px solid rgba(255, 107, 0, 0.25)',
              borderRadius: '999px', fontSize: '12px', fontWeight: 700, color: 'var(--accent-primary)',
              letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '20px',
            }}>{eyebrow}</div>
            <h2 className="heading-1" style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 900, lineHeight: 1.15, marginBottom: '16px' }}>
              {title}
            </h2>
            <p style={{ fontSize: 'clamp(14px, 2vw, 17px)', color: 'var(--text-muted)', lineHeight: 1.7 }}>
              {subtitle}
            </p>
          </div>
        </div>
      </div>

      <HorizontalTrack steps={steps} reducedMotion={reducedMotion} isDesktop={isDesktop} />

      <style>{`
        .timeline-card { min-height: 340px; }
        .timeline-card-image { border-radius: inherit; }
        @media (prefers-reduced-motion: reduce) {
          .timeline-card, .timeline-card img, .timeline-icon, .timeline::before {
            animation: none !important;
            transition: none !important;
            transform: none !important;
          }
        }
      `}</style>
    </section>
  );
};

/* =========================================================
   PINNED HORIZONTAL SCROLL TRACK — vertical page scroll drives
   the row sideways, same mechanic on desktop and mobile (sized
   down on narrow viewports via `isDesktop`).
   ========================================================= */
const HorizontalTrack = ({ steps, reducedMotion, isDesktop }) => {
  const sectionRef = useRef(null); // tall wrapper — its height is the scroll distance
  const trackRef = useRef(null); // the translating flex row
  const bubbleRefs = useRef([]);
  const [maxTranslate, setMaxTranslate] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [points, setPoints] = useState([]);
  const [trackSize, setTrackSize] = useState({ width: 0, height: 0 });
  // 'before' | 'pinned' | 'after' — this site wraps every page in a div with
  // overflow-x:hidden (for horizontal-scroll safety), and per the CSS spec
  // ANY ancestor with overflow other than visible becomes the containing
  // block for position:sticky, even if that ancestor never actually scrolls
  // itself. That silently breaks sticky here (confirmed: the pinned div's
  // rect just scrolls away instead of holding at top:0). Faking the pin by
  // hand with position:fixed/absolute — swapped on scroll — sidesteps it
  // without touching that site-wide overflow rule.
  const [pinMode, setPinMode] = useState('before');

  // Measure how far the track needs to travel so it exactly clears the
  // viewport, and the real on-screen center of every bubble — gives the
  // section's scroll-distance and the connecting wave's shape real
  // measured values instead of guessed constants.
  useLayoutEffect(() => {
    if (reducedMotion) return;
    const measure = () => {
      if (!trackRef.current) return;
      const mt = Math.max(0, trackRef.current.scrollWidth - window.innerWidth);
      setMaxTranslate(mt);
      const trackRect = trackRef.current.getBoundingClientRect();
      setTrackSize({ width: trackRef.current.scrollWidth, height: trackRect.height });
      setPoints(
        bubbleRefs.current
          .filter(Boolean)
          .map((el) => {
            const r = el.getBoundingClientRect();
            return { x: r.left - trackRect.left + r.width / 2, y: r.top - trackRect.top + r.height / 2 };
          })
      );
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [steps.length, reducedMotion]);

  useEffect(() => {
    if (reducedMotion || maxTranslate <= 0) return;
    const onScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      // rect.top is 0 the instant the section reaches the top of the
      // viewport (pin starts) and goes negative as the page keeps
      // scrolling through the section's extra height (pin holds) — that
      // negative delta, clamped, is exactly how far the track should shift.
      const raw = -rect.top;
      setTranslateX(Math.max(0, Math.min(maxTranslate, raw)));
      if (rect.top > 0) setPinMode('before');
      else if (raw >= maxTranslate) setPinMode('after');
      else setPinMode('pinned');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [maxTranslate, reducedMotion]);

  if (reducedMotion) {
    // No scroll-jacking for users who asked for less motion — a plain,
    // natively swipeable/scrollable row instead.
    return (
      <div style={{ overflowX: 'auto', padding: '8px 16px 24px' }}>
        <div style={{ display: 'flex', gap: isDesktop ? '100px' : '36px', width: 'max-content', margin: '0 auto', padding: '70px 8px 0' }}>
          {steps.map((step, idx) => <TrackItem key={idx} step={step} idx={idx} isDesktop={isDesktop} />)}
        </div>
      </div>
    );
  }

  const progress = maxTranslate > 0 ? translateX / maxTranslate : 0;
  const pinStyle = pinMode === 'pinned'
    ? { position: 'fixed', top: 0, left: 0, width: '100%' }
    : pinMode === 'after'
      ? { position: 'absolute', bottom: 0, left: 0, width: '100%' }
      : { position: 'absolute', top: 0, left: 0, width: '100%' };

  const pathD = buildWavePath(points, isDesktop ? 36 : 20);
  const dashLen = Math.max(1200, trackSize.width * 1.3);

  return (
    <div
      ref={sectionRef}
      data-testid="timeline-h-wrap"
      // The wrapper's height = (scroll budget to drive the horizontal
      // translate) + (height the content needs once released). It used to
      // be maxTranslate + 100vh — a full viewport of *trailing* space,
      // because the pinned/fixed phase is height:100vh. But once released
      // ('after'), the content shrinks to its own height (see pinStyle
      // below), so reserving a full 100vh past that point was dead space
      // the user had to scroll through before the next section could
      // appear. trackSize.height (the content's real height) is the
      // correct trailing amount instead.
      style={{ height: maxTranslate > 0 ? `calc(${trackSize.height || 0}px + ${maxTranslate}px)` : 'auto', position: 'relative' }}
    >
      {/* 'after' intentionally drops the 100vh + center-justify sizing used
          while pinned: with those, this box stays a full viewport tall even
          once released, and since the (shorter) card content just sits
          centered inside it, the box's bottom half is empty — that empty
          half still has to scroll past before the next section appears,
          showing up as a dead gap after the last card. Shrinking to the
          content's own height once unpinned removes that gap. */}
      <div style={{ ...pinStyle, height: pinMode === 'after' ? 'auto' : '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: pinMode === 'after' ? 'flex-start' : 'center' }}>
        <div
          ref={trackRef}
          style={{
            position: 'relative', display: 'flex', alignItems: 'flex-start', gap: isDesktop ? '140px' : '40px',
            padding: isDesktop ? '110px 8vw 0' : '64px 7vw 0', width: 'max-content',
            transform: `translateX(${-translateX}px)`,
            willChange: 'transform',
          }}
        >
          {pathD && (
            <svg
              aria-hidden
              width={trackSize.width} height={trackSize.height}
              viewBox={`0 0 ${trackSize.width} ${trackSize.height}`}
              style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible', pointerEvents: 'none' }}
            >
              <path d={pathD} fill="none" stroke="rgba(255, 107, 0, 0.15)" strokeWidth="3" strokeLinecap="round" />
              <path
                d={pathD} fill="none" stroke="url(#mtWaveGrad)" strokeWidth="4" strokeLinecap="round"
                strokeDasharray={dashLen} strokeDashoffset={dashLen - dashLen * progress}
                style={{ transition: 'stroke-dashoffset 0.1s linear', filter: 'drop-shadow(0 0 8px rgba(255, 107, 0, 0.5))' }}
              />
              <defs>
                <linearGradient id="mtWaveGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#FF6B00" />
                  <stop offset="100%" stopColor="#FF8533" />
                </linearGradient>
              </defs>
            </svg>
          )}

          {steps.map((step, idx) => (
            <TrackItem
              key={idx} step={step} idx={idx} isDesktop={isDesktop}
              bubbleRef={(el) => { bubbleRefs.current[idx] = el; }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const TrackItem = ({ step, idx, bubbleRef, isDesktop = true }) => (
  <div data-testid={`process-step-${idx}`} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: isDesktop ? '24px' : '16px', flexShrink: 0, width: isDesktop ? 'clamp(300px, 34vw, 420px)' : 'clamp(240px, 78vw, 320px)' }}>
    <div ref={bubbleRef} className="timeline-bubble" style={{
      width: isDesktop ? '56px' : '44px', height: isDesktop ? '56px' : '44px', borderRadius: '50%', flexShrink: 0,
      background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-dark, #cc5500) 100%)',
      border: isDesktop ? '4px solid #0a0a0a' : '3px solid #0a0a0a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: isDesktop ? '18px' : '14px', fontWeight: 900, color: '#000',
      boxShadow: '0 0 0 4px rgba(255, 107, 0, 0.25), 0 12px 30px rgba(255, 107, 0, 0.5)',
    }}>
      {String(idx + 1).padStart(2, '0')}
    </div>
    <StepCard step={step} />
  </div>
);

const StepCard = ({ step }) => (
  <div
    className="timeline-card"
    style={{
      width: '100%',
      background: 'linear-gradient(145deg, rgba(255, 107, 0, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
      border: '1px solid rgba(255, 107, 0, 0.25)',
      borderRadius: '20px',
      overflow: 'hidden',
      textAlign: 'left',
      transition: 'all 0.3s ease',
      cursor: 'default',
    }}
    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = '#FF6B00'; }}
    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255, 107, 0, 0.25)'; }}
  >
    {step.image && (
      <div className="timeline-card-image" style={{ position: 'relative', height: '140px', overflow: 'hidden' }}>
        <img src={step.image} alt={step.title} loading="lazy" style={{
          width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: 0.75,
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, transparent 0%, rgba(10,10,10,0.7) 100%)',
        }} />
        {step.duration && (
          <div style={{
            position: 'absolute', top: '12px', right: '12px',
            display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px',
            background: 'rgba(10,10,10,0.6)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255, 107, 0, 0.35)',
            borderRadius: '999px', fontSize: '11px', fontWeight: 700, color: 'var(--accent-primary)',
            fontFamily: 'JetBrains Mono, monospace',
          }}>
            <Clock size={11} /> {step.duration}
          </div>
        )}
        <div className="timeline-icon" style={{
          position: 'absolute', bottom: '12px', left: '16px',
          width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
          background: 'linear-gradient(135deg, #FF6B00, #cc5500)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 6px 20px rgba(255, 107, 0, 0.4)',
        }}>
          {step.icon && React.createElement(step.icon, { size: 20, color: '#000', strokeWidth: 2.2 })}
        </div>
      </div>
    )}

    <div style={{ padding: '22px 26px 26px' }}>
      {!step.image && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px', flexWrap: 'wrap' }}>
          <div className="timeline-icon" style={{
            width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
            background: 'linear-gradient(135deg, #FF6B00, #cc5500)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 6px 20px rgba(255, 107, 0, 0.4)',
          }}>
            {step.icon && React.createElement(step.icon, { size: 20, color: '#000', strokeWidth: 2.2 })}
          </div>
          {step.duration && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px',
              background: 'rgba(255, 107, 0, 0.1)', border: '1px solid rgba(255, 107, 0, 0.25)',
              borderRadius: '999px', fontSize: '11px', fontWeight: 700, color: 'var(--accent-primary)',
              fontFamily: 'JetBrains Mono, monospace',
            }}>
              <Clock size={11} /> {step.duration}
            </div>
          )}
        </div>
      )}

      <h3 style={{ fontSize: '19px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
        {step.title}
      </h3>
      <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--text-muted)', marginBottom: step.deliverables?.length ? '16px' : 0 }}>
        {step.desc}
      </p>

      {step.deliverables?.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '14px', borderTop: '1px dashed rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '4px' }}>
            Ergebnisse
          </div>
          {step.deliverables.map((d, k) => (
            <div key={k} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              <CheckCircle size={14} color="var(--accent-primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
              <span>{d}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

export default ModernTimeline;
