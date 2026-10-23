import React from 'react';
import { Link } from 'react-router-dom';

/**
 * PeopleSection — modern, editorial content blocks with varied layouts.
 *
 * Supported layouts (pass as `layout` prop):
 *   - "feature-list" — small framed portrait + numbered feature list with SVG check-draw animation
 *   - "card-grid"    — masonry-ish card grid: header card + 2-3 mini team/stat cards
 *   - "cta-banner"   — compact horizontal strip with avatar, quote + inline CTA
 *   - "banner"       — legacy editorial banner (image + italic quote)
 *   - "grid"         — legacy 3-image grid
 *
 * All layouts share a brand-accent color + SVG animations.
 */

// ─── Utilities ─────────────────────────────────────────────────────────────
const buildSrcSet = (src) => {
  if (!src || !src.includes('images.unsplash.com')) return undefined;
  return [360, 560, 800].map((w) => `${src.replace(/w=\d+/, `w=${w}`)} ${w}w`).join(', ');
};

const MONO = '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace';
const DISPLAY = '"Space Grotesk", system-ui, -apple-system, sans-serif';

const extractIndex = (testid) => {
  const m = /-(\d+)$/.exec(testid || '');
  return m ? parseInt(m[1], 10) : 1;
};

const initials = (name) => (name || '??').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

// ─── Shared keyframes (injected once) ─────────────────────────────────────
const ANIMATIONS_CSS = `
@keyframes zb-draw { from { stroke-dashoffset: var(--len, 100); } to { stroke-dashoffset: 0; } }
@keyframes zb-pulse { 0%,100% { transform: scale(1); opacity: 0.85; } 50% { transform: scale(1.15); opacity: 1; } }
@keyframes zb-rotate { to { transform: rotate(360deg); } }
@keyframes zb-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
@keyframes zb-shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
@keyframes zb-reveal-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
`;

const Animations = () => (
  <style dangerouslySetInnerHTML={{ __html: ANIMATIONS_CSS }} />
);

// ─── Shared: numbered eyebrow ─────────────────────────────────────────────
const NumberEyebrow = ({ index, label, accent }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontFamily: MONO, fontSize: '11px', letterSpacing: '2.8px', color: accent, textTransform: 'uppercase', fontWeight: 700 }}>
    <span>{String(index).padStart(2, '0')}</span>
    <span aria-hidden style={{ flex: '0 0 36px', height: '1px', background: `linear-gradient(90deg, ${accent}, transparent)` }} />
    <span style={{ color: '#8a8a8a', letterSpacing: '2.5px' }}>{label}</span>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════
// LAYOUT 1 — FEATURE LIST
// ═══════════════════════════════════════════════════════════════════════════
const FeatureListLayout = ({ image, title, quote, features = [], author, role, accent, direction = 'left', testid, index }) => {
  const isRight = direction === 'right';
  const defaultFeatures = [
    { title: 'Persönlicher Ansprechpartner', desc: 'Ein Team, kein Callcenter.' },
    { title: 'Transparente Meilensteine', desc: 'Sie wissen immer, wo wir stehen.' },
    { title: 'Festpreis-Garantie', desc: 'Keine Überraschungen auf der Rechnung.' },
    { title: 'Support nach Launch', desc: '30 Tage inklusive, jederzeit erreichbar.' },
  ];
  const items = features.length ? features : defaultFeatures;

  return (
    <section data-testid={testid} className="section" style={{ padding: '90px 20px', position: 'relative', overflow: 'hidden' }}>
      <Animations />
      {/* Ambient accent circles */}
      <svg aria-hidden style={{ position: 'absolute', top: '10%', [isRight ? 'left' : 'right']: '-8%', width: '320px', height: '320px', opacity: 0.08, animation: 'zb-rotate 40s linear infinite' }}>
        <circle cx="160" cy="160" r="140" fill="none" stroke={accent} strokeWidth="1" strokeDasharray="3 6" />
        <circle cx="160" cy="160" r="90" fill="none" stroke={accent} strokeWidth="1" strokeDasharray="2 10" />
      </svg>

      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(240px, 340px) 1fr', gap: '60px', alignItems: 'center', direction: isRight ? 'rtl' : 'ltr' }}>
        {/* IMAGE — compact, polaroid-style */}
        <div style={{ direction: 'ltr', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '-14px', left: '-14px', width: '100%', height: '100%', border: `2px dashed ${accent}`, borderRadius: '16px', opacity: 0.35 }} />
          <figure style={{ margin: 0, position: 'relative', borderRadius: '16px', overflow: 'hidden', aspectRatio: '4 / 5', background: '#111', boxShadow: `0 24px 60px -20px ${accent}50` }}>
            <img src={(image?.src || '').replace(/w=\d+/, 'w=560')} srcSet={buildSrcSet(image?.src)} sizes="(max-width: 900px) 80vw, 340px"
              alt={image?.alt || ''} loading="lazy" decoding="async"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'saturate(0.95)' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '22px 18px 16px', background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.85) 100%)' }}>
              <div style={{ color: '#fff', fontSize: '13px', fontWeight: 700 }}>{author}</div>
              <div style={{ color: accent, fontSize: '10.5px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: '3px', fontFamily: MONO }}>{role}</div>
            </div>
            {/* Live dot */}
            <div style={{ position: 'absolute', top: '14px', right: '14px', width: '10px', height: '10px', borderRadius: '50%', background: accent, boxShadow: `0 0 16px ${accent}`, animation: 'zb-pulse 2s ease-in-out infinite' }} />
          </figure>
        </div>

        {/* TEXT + FEATURES */}
        <div style={{ direction: 'ltr' }}>
          <NumberEyebrow index={extractIndex(testid) || index || 1} label="Warum Sie uns vertrauen" accent={accent} />
          {title && <h3 style={{ fontFamily: DISPLAY, fontSize: 'clamp(24px, 3vw, 34px)', color: '#f5f5f5', margin: '20px 0 12px', lineHeight: 1.2, fontWeight: 700, letterSpacing: '-0.5px' }}>{title}</h3>}
          {quote && <p style={{ color: '#b8b8b8', fontSize: '15px', lineHeight: 1.7, margin: '0 0 28px', maxWidth: '560px' }}>{quote}</p>}

          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
            {items.map((f, i) => (
              <li key={i}
                style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', padding: '14px 16px', background: `linear-gradient(135deg, ${accent}0A, transparent)`, border: `1px solid ${accent}22`, borderRadius: '12px', animation: `zb-reveal-up 0.5s ease-out ${i * 0.08}s backwards` }}>
                <svg width="22" height="22" viewBox="0 0 22 22" style={{ flex: '0 0 22px', marginTop: '2px' }}>
                  <circle cx="11" cy="11" r="10" fill="none" stroke={accent} strokeWidth="1.5" />
                  <path d="M6 11.5 L9.5 15 L16 7.5" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    style={{ strokeDasharray: 20, strokeDashoffset: 20, animation: `zb-draw 0.6s ease-out ${0.3 + i * 0.1}s forwards`, ['--len']: 20 }} />
                </svg>
                <div>
                  <div style={{ color: '#fff', fontSize: '14px', fontWeight: 700, marginBottom: '3px' }}>{f.title}</div>
                  {f.desc && <div style={{ color: '#999', fontSize: '13px', lineHeight: 1.5 }}>{f.desc}</div>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// LAYOUT 2 — CARD GRID
// ═══════════════════════════════════════════════════════════════════════════
const CardGridLayout = ({ eyebrow, title, quote, cards = [], accent, testid }) => {
  const defaults = [
    { name: 'Team', role: 'Specialist', stat: '5+ Jahre' },
    { name: 'Team', role: 'Specialist', stat: '5+ Jahre' },
    { name: 'Team', role: 'Specialist', stat: '5+ Jahre' },
  ];
  const items = cards.length ? cards : defaults;

  return (
    <section data-testid={testid} className="section" style={{ padding: '90px 20px', position: 'relative', overflow: 'hidden' }}>
      <Animations />
      <div style={{ maxWidth: '1240px', margin: '0 auto', position: 'relative' }}>
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '24px' }}>
          <div style={{ maxWidth: '640px' }}>
            <NumberEyebrow index={extractIndex(testid)} label={eyebrow || 'Menschen & Expertise'} accent={accent} />
            {title && <h3 style={{ fontFamily: DISPLAY, fontSize: 'clamp(26px, 3.2vw, 36px)', color: '#f5f5f5', margin: '18px 0 14px', lineHeight: 1.15, fontWeight: 700, letterSpacing: '-0.6px' }}>{title}</h3>}
            {quote && <p style={{ color: '#b0b0b0', fontSize: '14px', lineHeight: 1.65, margin: 0 }}>{quote}</p>}
          </div>
          {/* SVG decorative — animated concentric arcs */}
          <svg aria-hidden width="140" height="140" style={{ animation: 'zb-float 5s ease-in-out infinite' }}>
            <g fill="none" strokeLinecap="round">
              <path d="M 70 15 A 55 55 0 0 1 125 70" stroke={accent} strokeWidth="2" opacity="0.9" />
              <path d="M 70 25 A 45 45 0 0 1 115 70" stroke={accent} strokeWidth="1.5" opacity="0.5" strokeDasharray="4 4" />
              <circle cx="70" cy="70" r="6" fill={accent} />
              <circle cx="70" cy="70" r="20" stroke={accent} strokeWidth="1" opacity="0.3" />
              <circle cx="70" cy="70" r="32" stroke={accent} strokeWidth="1" opacity="0.2" />
            </g>
          </svg>
        </div>

        {/* Cards row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          {items.map((c, i) => (
            <article key={i}
              data-testid={`${testid}-card-${i}`}
              style={{
                position: 'relative',
                padding: '22px',
                background: `linear-gradient(160deg, ${accent}0E 0%, rgba(20,20,20,0.4) 100%)`,
                border: `1px solid ${accent}25`,
                borderRadius: '18px',
                overflow: 'hidden',
                transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1), box-shadow 0.35s',
                animation: `zb-reveal-up 0.5s ease-out ${i * 0.08}s backwards`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = `0 24px 50px -20px ${accent}50`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Corner number */}
              <div aria-hidden style={{ position: 'absolute', top: '14px', right: '16px', fontFamily: MONO, fontSize: '10px', color: accent, opacity: 0.6, letterSpacing: '2px' }}>0{i + 1}</div>

              {/* Small round portrait or monogram */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                {c.image ? (
                  <img src={(c.image).replace(/w=\d+/, 'w=160')} srcSet={buildSrcSet(c.image)} sizes="64px" alt={c.name} loading="lazy"
                    style={{ width: '58px', height: '58px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${accent}`, flex: '0 0 58px' }} />
                ) : (
                  <div style={{ width: '58px', height: '58px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg, ${accent}, ${accent}99)`, color: '#0a0a0a', fontWeight: 800, fontSize: '16px', flex: '0 0 58px' }}>
                    {initials(c.name)}
                  </div>
                )}
                <div>
                  <div style={{ color: '#fff', fontSize: '15px', fontWeight: 700 }}>{c.name}</div>
                  <div style={{ color: '#9a9a9a', fontSize: '11.5px', letterSpacing: '1.2px', textTransform: 'uppercase', fontFamily: MONO, marginTop: '3px' }}>{c.role}</div>
                </div>
              </div>

              {/* Stat pill */}
              {c.stat && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 14px', background: `${accent}15`, border: `1px solid ${accent}40`, borderRadius: '99px', fontSize: '12px', color: accent, fontWeight: 700, letterSpacing: '0.3px' }}>
                  <svg width="12" height="12" viewBox="0 0 12 12"><circle cx="6" cy="6" r="4" fill={accent} style={{ animation: 'zb-pulse 2s ease-in-out infinite', transformOrigin: '6px 6px' }} /></svg>
                  {c.stat}
                </div>
              )}

              {/* Quote snippet */}
              {c.quote && <p style={{ color: '#c4c4c4', fontSize: '13.5px', lineHeight: 1.55, margin: '14px 0 0', fontFamily: DISPLAY, fontWeight: 400 }}>&ldquo;{c.quote}&rdquo;</p>}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// LAYOUT 3 — CTA BANNER
// ═══════════════════════════════════════════════════════════════════════════
const CtaBannerLayout = ({ image, quote, author, role, accent, testid, ctaLabel = 'Projekt starten', ctaTo = '/contact' }) => {
  return (
    <section data-testid={testid} className="section" style={{ padding: '70px 20px', position: 'relative' }}>
      <Animations />
      <div
        style={{
          maxWidth: '1180px',
          margin: '0 auto',
          position: 'relative',
          padding: '36px 44px',
          borderRadius: '24px',
          background: `linear-gradient(110deg, #0d0d0d 0%, ${accent}22 55%, #0d0d0d 100%)`,
          border: `1px solid ${accent}40`,
          overflow: 'hidden',
          backgroundSize: '200% 100%',
          animation: 'zb-shimmer 12s ease-in-out infinite',
        }}
      >
        {/* Animated SVG underline — drawing effect */}
        <svg aria-hidden style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '3px' }} preserveAspectRatio="none">
          <line x1="0" y1="1.5" x2="100%" y2="1.5" stroke={accent} strokeWidth="2"
            style={{ strokeDasharray: 2000, strokeDashoffset: 2000, animation: 'zb-draw 2.5s ease-out forwards', ['--len']: 2000 }} />
        </svg>

        {/* Background swirl */}
        <svg aria-hidden style={{ position: 'absolute', right: '-40px', top: '50%', transform: 'translateY(-50%)', width: '240px', height: '240px', opacity: 0.1, pointerEvents: 'none' }}>
          <g fill="none" stroke={accent} strokeWidth="1.2">
            <circle cx="120" cy="120" r="60" strokeDasharray="4 6" style={{ transformOrigin: '120px 120px', animation: 'zb-rotate 35s linear infinite' }} />
            <circle cx="120" cy="120" r="95" strokeDasharray="2 12" style={{ transformOrigin: '120px 120px', animation: 'zb-rotate 50s linear reverse infinite' }} />
          </g>
        </svg>

        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '28px', alignItems: 'center', position: 'relative' }}>
          {/* Small rounded portrait */}
          {image && (
            <figure style={{ margin: 0, position: 'relative', width: '84px', height: '84px', flex: '0 0 84px' }}>
              <div aria-hidden style={{ position: 'absolute', inset: '-6px', border: `2px solid ${accent}`, borderRadius: '50%', borderStyle: 'dashed', animation: 'zb-rotate 20s linear infinite' }} />
              <img src={image.src.replace(/w=\d+/, 'w=240')} srcSet={buildSrcSet(image.src)} sizes="84px" alt={image.alt || ''} loading="lazy"
                style={{ width: '84px', height: '84px', borderRadius: '50%', objectFit: 'cover', display: 'block', boxShadow: `0 10px 30px -10px ${accent}60` }} />
            </figure>
          )}

          {/* Quote + author */}
          <div style={{ minWidth: 0 }}>
            <NumberEyebrow index={extractIndex(testid)} label="Kurz gesagt" accent={accent} />
            <blockquote style={{ margin: '10px 0 8px', fontFamily: DISPLAY, fontSize: 'clamp(17px, 1.8vw, 22px)', lineHeight: 1.4, color: '#fff', fontWeight: 600, letterSpacing: '-0.2px' }}>
              &ldquo;{quote}&rdquo;
            </blockquote>
            <div style={{ color: '#999', fontSize: '12px', fontFamily: MONO, letterSpacing: '1.2px', textTransform: 'uppercase' }}>
              — <span style={{ color: accent, fontWeight: 700 }}>{author}</span>{role ? ` · ${role}` : ''}
            </div>
          </div>

          {/* CTA */}
          <Link
            to={ctaTo}
            data-testid={`${testid}-cta`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '14px 26px',
              background: `linear-gradient(135deg, ${accent} 0%, ${accent}CC 100%)`,
              color: '#0a0a0a',
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '14px',
              textDecoration: 'none',
              boxShadow: `0 18px 40px -12px ${accent}70`,
              letterSpacing: '0.3px',
              whiteSpace: 'nowrap',
              transition: 'transform 0.25s, box-shadow 0.25s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = `0 24px 50px -12px ${accent}90`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = `0 18px 40px -12px ${accent}70`;
            }}
          >
            {ctaLabel}
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M4 9 H14 M10 5 L14 9 L10 13" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// LEGACY LAYOUTS (kept for backward compat)
// ═══════════════════════════════════════════════════════════════════════════
const GridLayout = ({ eyebrow, title, subtitle, accent, images, testid }) => (
  <section data-testid={testid} className="section" style={{ padding: '100px 20px', position: 'relative' }}>
    <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px', maxWidth: '780px', margin: '0 auto 48px' }}>
        <div style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '3px', color: accent, marginBottom: '14px', textTransform: 'uppercase' }}>{eyebrow}</div>
        <h2 style={{ fontSize: 'clamp(26px, 3.4vw, 36px)', fontWeight: 700, color: '#fff', lineHeight: 1.2, margin: '0 0 14px' }}>{title}</h2>
        {subtitle && <p style={{ fontSize: '15px', color: '#b0b0b0', lineHeight: 1.65, margin: 0 }}>{subtitle}</p>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
        {images.slice(0, 3).map((img, i) => (
          <figure key={i} style={{ margin: 0, borderRadius: '16px', overflow: 'hidden', aspectRatio: '4 / 5', border: `1px solid ${accent}22` }}>
            <img src={img.src.replace(/w=\d+/, 'w=560')} srcSet={buildSrcSet(img.src)} sizes="(max-width:1024px) 40vw, 320px" alt={img.alt || ''} loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </figure>
        ))}
      </div>
    </div>
  </section>
);

// ─── Root dispatcher ───────────────────────────────────────────────────────
const PeopleSection = (props) => {
  const { layout = 'cta-banner' } = props;
  if (layout === 'feature-list') return <FeatureListLayout {...props} />;
  if (layout === 'card-grid') return <CardGridLayout {...props} />;
  if (layout === 'cta-banner' || layout === 'banner') return <CtaBannerLayout {...props} />;
  if (layout === 'grid') return <GridLayout {...props} />;
  return <CtaBannerLayout {...props} />;
};

export default PeopleSection;
