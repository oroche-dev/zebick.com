import React, { useRef, useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { useSectionReveal } from './useSectionReveal';

const DEFAULT_IMAGE = 'https://images.pexels.com/photos/12627677/pexels-photo-12627677.jpeg';

// Background photo per benefit, keyed by the lucide icon's displayName —
// reuses the icon already chosen for each item as the theme signal, so no
// per-page curation is needed.
const U = (id) => `https://images.unsplash.com/${id}?w=500&q=70&auto=format&fit=crop`;
const ICON_BG = {
  HeartHandshake: U('photo-1521737604893-d14cc237f11d'),
  MessageSquare: U('photo-1611606063065-ee7946f0787a'),
  Bell: U('photo-1611162617213-7d7a39e9b1d7'),
  TrendingUp: U('photo-1460925895917-afdab827c52f'),
  Sparkles: U('photo-1503676260728-1c00da094a0b'),
  Award: U('photo-1552664730-d307ca884978'),
  RefreshCw: U('photo-1601584115197-04ecc0da31d7'),
  // lucide-react's displayName reflects the icon's canonical name, not the
  // (possibly aliased) import name these pages use — BarChart/BarChart3/
  // LineChart all resolve to different displayNames than their import.
  ChartNoAxesColumnIncreasing: U('photo-1551434678-e076c223a692'),
  ChartColumn: U('photo-1551434678-e076c223a692'),
  ChartLine: U('photo-1551434678-e076c223a692'),
  Clock: U('photo-1551076805-e1869033e561'),
  ShieldCheck: U('photo-1563013544-824ae1b704d3'),
  Globe: U('photo-1526378722484-bd91ca387e72'),
  Zap: U('photo-1517245386807-bb43f82c33c4'),
  Smile: U('photo-1517248135467-4c7edcad34c4'),
  Layers: U('photo-1550751827-4bd374c3f58b'),
  Eye: U('photo-1551836022-d5d88e9218df'),
  Lock: U('photo-1556742502-ec7c0e9f34b1'),
  Users: U('photo-1522335789203-aabd1fc54bc9'),
  Rocket: U('photo-1605733160314-4fc7dac4bb16'),
  Heart: U('photo-1542751110-97427bbecf20'),
  ShoppingBag: U('photo-1472099645785-5658abf4ff4e'),
  Star: U('photo-1559028012-481c04fa702d'),
  DollarSign: U('photo-1543269865-cbf427effbad'),
  Megaphone: U('photo-1542751371-adc38448a05e'),
  MousePointer2: U('photo-1498050108023-c5249f4df085'),
};
const getIconBg = (Icon) => (Icon?.displayName ? ICON_BG[Icon.displayName] : undefined);

const renderTitle = (title, accentWord) => {
  if (!accentWord || !title?.includes?.(accentWord)) return title;
  const [a, b] = title.split(accentWord);
  return (<>{a}<span className="text-gradient">{accentWord}</span>{b}</>);
};

/**
 * ModernBenefits — "Vorteile" as a sticky editorial split.
 * Left: sticky eyebrow + heading + image. Right: numbered benefit rows.
 * items: [{ icon, title, desc, points?: string[] }]
 */
export const ModernBenefits = ({
  eyebrow = 'Vorteile', title, accentWord, subtitle, items = [],
  image = DEFAULT_IMAGE, background = 'var(--bg-secondary)', testid = 'section-benefits',
}) => {
  const ref = useRef(null);
  useSectionReveal(ref);

  // Desktop (≥1024px): invisible scroll "triggers", one per item. Each card
  // scrolls up normally until it reaches its own stick point, then locks in
  // place — slightly lower than the previous one — so later cards stack on
  // top of earlier ones as you keep scrolling. Mobile falls back to a plain
  // stacked list (see .mb-rows-mobile) since there's no room to pin anything.
  const rowRefs = useRef([]);
  const cardRefs = useRef([]);
  const rowsRef = useRef(null);
  const gridRef = useRef(null);
  const leftRef = useRef(null);
  const imgRef = useRef(null);
  const [cardStyles, setCardStyles] = useState(() => items.map(() => ({})));
  const [leftStyle, setLeftStyle] = useState({});

  // Pins the left column and each card manually instead of via CSS
  // position:sticky: this site's #root/.App have overflow-x:hidden (for
  // mobile horizontal-scroll prevention — see index.css), and per spec that
  // silently promotes overflow-y to auto too, which turns them into real
  // (if inert) scroll containers — confirmed empirically — and that's
  // enough to make native sticky resolve against them instead of the
  // viewport, i.e. never stick. .mb-rows's own rect stays reliable
  // throughout (its height comes from the always-in-flow .mb-triggers, a
  // sibling unaffected by the cards' position toggling), so it doubles as
  // the left column's width reference too (grid gap is the one hardcoded
  // constant here — keep in sync with .mb-grid's `gap` below).
  useEffect(() => {
    const STICKY_TOP = 100;
    const STACK_OFFSET = 20; // px each later card rests below the previous one
    const GRID_GAP = 64;
    let raf = null;
    const update = () => {
      raf = null;
      const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
      const triggers = rowRefs.current;
      if (!isDesktop || !rowsRef.current || !gridRef.current || !leftRef.current || triggers.some((t) => !t)) {
        setCardStyles(items.map(() => ({})));
        setLeftStyle({});
        return;
      }
      const rowsRect = rowsRef.current.getBoundingClientRect();
      const gridRect = gridRef.current.getBoundingClientRect();
      const leftWidth = rowsRect.left - gridRect.left - GRID_GAP;
      const leftHeight = leftRef.current.offsetHeight;

      // The eyebrow/heading/subtitle scroll past normally above the image —
      // only the image itself needs to end up pinned at STICKY_TOP. Shifting
      // the stick point up by the image's own offset within the column means
      // the column only locks once the image has scrolled all the way to
      // STICKY_TOP (i.e. is already fully visible), instead of locking as
      // soon as the much-earlier top of the heading text reaches it.
      const imgOffsetTop = imgRef.current?.offsetTop || 0;
      const leftStickTop = STICKY_TOP - imgOffsetTop;

      if (gridRect.top > leftStickTop) {
        setLeftStyle({ position: 'absolute', top: 0, left: 0, width: leftWidth });
      } else if (gridRect.bottom < leftStickTop + leftHeight) {
        setLeftStyle({ position: 'absolute', bottom: 0, left: 0, width: leftWidth });
      } else {
        setLeftStyle({ position: 'fixed', top: leftStickTop, left: gridRect.left, width: leftWidth });
      }

      setCardStyles(items.map((_, i) => {
        const stickTop = STICKY_TOP + i * STACK_OFFSET;
        const triggerRect = triggers[i].getBoundingClientRect();
        const cardHeight = cardRefs.current[i]?.offsetHeight || 420;
        if (triggerRect.top > stickTop) {
          return { position: 'absolute', top: triggerRect.top - rowsRect.top, left: 0, width: '100%', zIndex: i + 1 };
        }
        if (rowsRect.bottom < stickTop + cardHeight) {
          return { position: 'absolute', bottom: (items.length - 1 - i) * STACK_OFFSET, left: 0, width: '100%', zIndex: i + 1 };
        }
        return { position: 'fixed', top: stickTop, left: rowsRect.left, width: rowsRect.width, zIndex: i + 1 };
      }));
    };
    const onScroll = () => { if (raf === null) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [items]);

  return (
    <section ref={ref} className="section mb-section" data-testid={testid} style={{ padding: '120px 0', background, position: 'relative' }}>
      {/* clipped separately from the section itself — overflow:hidden on the
          section would also clip the sticky card's positioning range */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', bottom: '-140px', left: '-120px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(255,107,0,0.07) 0%, transparent 60%)', filter: 'blur(110px)' }} />
      </div>
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="mb-grid" ref={gridRef}>
          {/* Sticky left */}
          <div className="mb-sticky" ref={leftRef} data-testid="vorteile-sticky-col" style={leftStyle}>
            <span className="mb-eyebrow">{eyebrow}</span>
            <h2 className="heading-1" style={{ fontSize: 'clamp(30px, 4vw, 46px)', fontWeight: 900, margin: '18px 0 18px', letterSpacing: '-0.02em', lineHeight: 1.1 }}>{renderTitle(title, accentWord)}</h2>
            {subtitle && <p style={{ fontSize: '16px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '28px' }}>{subtitle}</p>}
            <div ref={imgRef} data-reveal data-testid="vorteile-sticky-image" className="mb-img-wrap" style={{ opacity: 0, transform: 'translateY(24px)', transition: 'all 0.8s ease' }}>
              <img src={image} alt={typeof title === 'string' ? title : 'Vorteile'} loading="lazy" />
              <div className="mb-img-overlay" aria-hidden />
            </div>
          </div>

          {/* Scrolling right */}
          <div className="mb-rows" ref={rowsRef}>
            {/* desktop: invisible scroll triggers, one per item — define the
                scrollable range each stacked card below reads from */}
            <div className="mb-triggers">
              {items.map((b, i) => (
                <div key={i} ref={(el) => { rowRefs.current[i] = el; }} className="mb-trigger" data-testid={`benefit-trigger-${i}`} aria-hidden="true" />
              ))}
            </div>

            {/* desktop: every card, each pinned at its own (slightly lower)
                offset once reached — later cards stack on top of earlier ones */}
            {items.map((b, i) => {
              const Icon = b.icon;
              const bg = getIconBg(Icon);
              return (
                <div key={i} ref={(el) => { cardRefs.current[i] = el; }} className="mb-sticky-card" data-testid={`benefit-stack-card-${i}`}
                  style={cardStyles[i]}>
                  {bg && <div className="mb-row-bg"><img src={bg} alt="" loading="lazy" /><div className="mb-row-bg-overlay" /></div>}
                  <div className="mb-index">{String(i + 1).padStart(2, '0')}</div>
                  <div className="mb-content">
                    <div className="mb-head">
                      <span className="mb-row-icon">{Icon ? <Icon size={22} strokeWidth={1.8} /> : null}</span>
                      <h3 style={{ fontSize: '20px', fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>{b.title}</h3>
                    </div>
                    <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '15px', margin: '12px 0 0' }}>{b.desc}</p>
                    {b.points?.length > 0 && (
                      <ul style={{ listStyle: 'none', padding: 0, margin: '16px 0 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {b.points.map((p, k) => (
                          <li key={k} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13.5px', color: 'var(--text-secondary)' }}>
                            <Check size={15} style={{ color: 'var(--accent-primary)', flexShrink: 0, marginTop: '2px' }} />{p}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              );
            })}

            {/* mobile: plain stacked list (no room to pin a sticky card) */}
            <div className="mb-rows-mobile">
              {items.map((b, i) => {
                const Icon = b.icon;
                const bg = getIconBg(Icon);
                return (
                  <div key={i} data-testid={`benefit-row-mobile-${i}`} className="mb-row">
                    {bg && <div className="mb-row-bg"><img src={bg} alt="" loading="lazy" /><div className="mb-row-bg-overlay" /></div>}
                    <div className="mb-index">{String(i + 1).padStart(2, '0')}</div>
                    <div className="mb-content">
                      <div className="mb-head">
                        <span className="mb-row-icon">{Icon ? <Icon size={22} strokeWidth={1.8} /> : null}</span>
                        <h3 style={{ fontSize: '20px', fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>{b.title}</h3>
                      </div>
                      <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '15px', margin: '12px 0 0' }}>{b.desc}</p>
                      {b.points?.length > 0 && (
                        <ul style={{ listStyle: 'none', padding: 0, margin: '16px 0 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {b.points.map((p, k) => (
                            <li key={k} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13.5px', color: 'var(--text-secondary)' }}>
                              <Check size={15} style={{ color: 'var(--accent-primary)', flexShrink: 0, marginTop: '2px' }} />{p}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .mb-eyebrow { display:inline-block; padding:7px 16px; border-radius:999px; background:rgba(255,107,0,0.10); border:1px solid rgba(255,107,0,0.25); color:var(--accent-primary); font-size:12px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; }
        .mb-grid { display:grid; grid-template-columns:1fr; gap:48px; position:relative; }
        .mb-img-wrap { position:relative; border-radius:var(--radius-xl); overflow:hidden; border:1px solid var(--border-subtle); aspect-ratio:4/5; max-height:420px; }
        .mb-img-wrap img { width:100%; height:100%; object-fit:cover; display:block; }
        .mb-img-overlay { position:absolute; inset:0; background:linear-gradient(180deg, rgba(8,8,8,0.1) 0%, rgba(8,8,8,0.55) 100%); }
        .mb-rows { position:relative; }
        .mb-row { position:relative; display:flex; gap:24px; padding:28px; border-radius:var(--radius-xl); border:1px solid var(--border-subtle); background:linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)); }
        .mb-row:hover { border-color:rgba(255,107,0,0.45); transform:translateX(6px); background:linear-gradient(145deg, rgba(255,107,0,0.06), rgba(255,255,255,0.01)); }
        .mb-sticky-card { position:relative; }
        /* clipped on a child, not the row/card itself, so the card's own box-shadow isn't cut off */
        .mb-row-bg { position:absolute; inset:0; overflow:hidden; border-radius:inherit; z-index:0; }
        .mb-row-bg img { width:100%; height:100%; object-fit:cover; opacity:0.5; }
        .mb-row-bg-overlay { position:absolute; inset:0; background:rgba(10,10,10,0.68); }
        .mb-index, .mb-content { position:relative; z-index:1; }
        .mb-index { font-family:'JetBrains Mono', monospace; font-size:30px; font-weight:800; color:rgba(255,107,0,0.35); line-height:1; flex-shrink:0; min-width:46px; }
        .mb-head { display:flex; align-items:center; gap:14px; }
        .mb-row-icon { width:42px; height:42px; flex-shrink:0; border-radius:var(--radius-md); background:linear-gradient(135deg, rgba(255,107,0,0.16), rgba(255,107,0,0.05)); border:1px solid rgba(255,107,0,0.3); display:flex; align-items:center; justify-content:center; color:var(--accent-primary); }

        /* mobile fallback: plain stacked list */
        .mb-rows-mobile { display:flex; flex-direction:column; gap:20px; }
        .mb-triggers, .mb-sticky-card { display:none; }

        @media (min-width:1024px) {
          .mb-grid { grid-template-columns:0.85fr 1.15fr; gap:64px; align-items:start; }
          /* explicit column: once .mb-sticky goes position:fixed/absolute it
             stops being a grid item at all, so without this .mb-rows would
             auto-place into the now-empty first track instead of staying put */
          .mb-rows { grid-column:2; }

          .mb-rows-mobile { display:none; }
          .mb-triggers { display:block; }
          .mb-trigger { height:65vh; }
          .mb-sticky-card {
            display:flex; gap:24px; box-sizing:border-box;
            padding:28px; border-radius:var(--radius-xl); border:1px solid var(--border-subtle);
            background:var(--bg-primary);
            box-shadow:0 24px 48px rgba(0,0,0,0.45);
          }
        }
      `}</style>
    </section>
  );
};

export default ModernBenefits;
