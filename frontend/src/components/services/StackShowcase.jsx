import React from 'react';
import { CheckCircle } from 'lucide-react';

/**
 * Shared "why build with us" showcase pieces. Each service page composes
 * its OWN grid shape from these building blocks (StackShowcaseSection just
 * provides the header + wrapper + shared keyframes) so the 10 category
 * pages can look structurally different instead of all reusing one fixed
 * 3+3 grid. SMIL <animateMotion> for orbiting icons reuses the same
 * technique as ServerDevelopmentPage's network diagram — no
 * framer-motion/GSAP dependency.
 */
const baseCardStyle = {
  background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 'var(--radius-xl)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
};

const sectionLabel = (text) => (
  <span style={{
    display: 'inline-block', padding: '6px 14px', borderRadius: '999px',
    background: 'rgba(255,107,0,0.1)', border: '1px solid rgba(255,107,0,0.25)',
    color: 'var(--accent-primary)', fontSize: '12px', fontWeight: 600, letterSpacing: '0.12em',
    textTransform: 'uppercase', marginBottom: '20px',
  }}>{text}</span>
);

export const StackShowcaseSection = ({ eyebrow, title, subtitle, testid, children }) => (
  <section className="section" data-testid={testid} style={{ padding: '120px 0', background: 'var(--bg-primary)' }}>
    <div className="container">
      <div data-reveal style={{ textAlign: 'center', marginBottom: '56px', opacity: 0, transform: 'translateY(30px)', transition: 'all 0.8s ease' }}>
        {sectionLabel(eyebrow)}
        <h2 className="heading-1" style={{ fontSize: '48px', fontWeight: 900, marginBottom: '20px' }}>{title}</h2>
        <p style={{ fontSize: '17px', color: 'var(--text-muted)', maxWidth: '640px', margin: '0 auto' }}>{subtitle}</p>
      </div>

      <div className="asf-stack-outer">{children}</div>

      <style>{`
        @media (max-width: 860px) {
          /* Every page composes its showcase from 2 separate "asf-row" grids
             (3 cards each). Collapsing each row to its own 1-column stack
             left a lone card dangling under the paired-up row above it.
             display:contents dissolves both row-divs so all cards become
             direct children of .asf-stack-outer, which lays them out as ONE
             continuous 2-column grid — no orphaned single card, ever (3+3 is
             always even). !important is required: the row divs' inline
             display:'grid' style would otherwise win over this class rule. */
          .asf-stack-outer { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .asf-stack-outer .asf-row { display: contents !important; }
          .asf-stack-outer .asf-row > div { min-height: 160px !important; }
          .asf-stack-outer .asf-row > div > h3 { font-size: 12px !important; padding: 12px 8px 0 !important; }
          .asf-stack-outer .asf-row > div > div { transform: scale(0.55); }
          /* A site-wide mobile rule collapses any inline grid-template-columns
             to a single column (for real layout grids) — but NativeGrid is a
             decorative fixed-cell pattern, not a layout grid, so that rule
             was squashing its 5x3 cells into one 15-row column and ballooning
             the card height. data-keep-grid opts it out of the display:flex
             conversion; this restores the column/row tracks that index.css's
             unconditional [style*="grid-template-columns"] rule still nukes. */
          .native-grid-pattern { display: grid !important; grid-template-columns: repeat(5, 44px) !important; grid-template-rows: repeat(3, 44px) !important; }
        }
        @keyframes asfCheckIn { from { opacity: 0.25; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
        @keyframes asfSpring { 0%, 100% { transform: translateX(-34px); } 50% { transform: translateX(34px); } }
        @keyframes asfPing { 0% { transform: scale(0.6); opacity: 0.8; } 100% { transform: scale(1.7); opacity: 0; } }
        .asf-grid-ping { animation: asfPing 2.2s ease-out infinite; }
        @keyframes asfOrbitTrace { to { stroke-dashoffset: -365; } }
        .asf-orbit-trace { animation: asfOrbitTrace 4s linear infinite; }
        @keyframes asfOrbitPulse { 0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(0.9); } 50% { opacity: 1; transform: translate(-50%, -50%) scale(1.15); } }
        .asf-orbit-pulse { animation: asfOrbitPulse 2.4s ease-in-out infinite; pointer-events: none; }
        @media (prefers-reduced-motion: reduce) {
          .asf-check, .asf-spring-dot, .asf-orbit-sat, .asf-grid-ping, .asf-orbit-trace, .asf-orbit-pulse { animation: none !important; opacity: 1 !important; }
        }
      `}</style>
    </div>
  </section>
);

// Same hover language as every other card in this codebase (TechCard,
// project cards, FAQ cards, …): border lights up to the accent color, the
// card lifts 6px, and an orange glow fades in underneath.
const cardHoverIn = (e) => {
  e.currentTarget.style.borderColor = 'var(--accent-primary)';
  e.currentTarget.style.transform = 'translateY(-6px)';
  e.currentTarget.style.boxShadow = '0 20px 60px rgba(255,107,0,0.2)';
};
const cardHoverOut = (e) => {
  e.currentTarget.style.borderColor = 'var(--border-subtle)';
  e.currentTarget.style.transform = 'translateY(0)';
  e.currentTarget.style.boxShadow = 'none';
};

export const StackCard = ({ title, children, style }) => (
  <div data-reveal style={{ ...baseCardStyle, minHeight: '264px', display: 'flex', flexDirection: 'column', overflow: 'hidden', opacity: 0, transform: 'translateY(30px)', transition: 'all 0.6s ease', ...style }}
    onMouseEnter={cardHoverIn} onMouseLeave={cardHoverOut}>
    <h3 style={{ fontSize: '17px', fontWeight: 700, textAlign: 'center', padding: '28px 24px 0' }}>{title}</h3>
    <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{children}</div>
  </div>
);

export const StatTile = ({ value, label }) => (
  <div data-reveal style={{ ...baseCardStyle, padding: '32px 24px', textAlign: 'center', opacity: 0, transform: 'translateY(30px)', transition: 'all 0.6s ease' }}
    onMouseEnter={cardHoverIn} onMouseLeave={cardHoverOut}>
    <div style={{ fontSize: '38px', fontWeight: 900, color: 'var(--accent-primary)', lineHeight: 1, marginBottom: '10px' }}>{value}</div>
    <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>{label}</div>
  </div>
);

export const MiniCard = ({ icon: Icon, title, desc }) => (
  <div data-reveal style={{ ...baseCardStyle, padding: '18px', display: 'flex', alignItems: 'center', gap: '14px', opacity: 0, transform: 'translateY(20px)', transition: 'all 0.6s ease' }}
    onMouseEnter={cardHoverIn} onMouseLeave={cardHoverOut}>
    <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'rgba(255,107,0,0.12)', border: '1px solid rgba(255,107,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={18} color="var(--accent-primary)" />
    </div>
    <div>
      <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '2px' }}>{title}</div>
      <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4 }}>{desc}</div>
    </div>
  </div>
);

const RADIAL_POSITIONS = [
  { gridColumn: '2', gridRow: '1' },
  { gridColumn: '3', gridRow: '2' },
  { gridColumn: '2', gridRow: '3' },
  { gridColumn: '1', gridRow: '2' },
];
export const RadialHub = ({ centerIcon, items }) => (
  <div data-reveal style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', alignItems: 'center', opacity: 0, transform: 'translateY(30px)', transition: 'all 0.8s ease' }}>
    <div aria-hidden style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '220px', height: '220px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,107,0,0.14) 0%, transparent 70%)', filter: 'blur(30px)', pointerEvents: 'none' }} />
    <div style={{ gridColumn: '2', gridRow: '2', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
      <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'var(--bg-primary)', border: '1px solid rgba(255,107,0,0.4)', boxShadow: '0 0 0 8px rgba(255,107,0,0.08), 0 20px 50px rgba(255,107,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {centerIcon}
      </div>
    </div>
    {items.map((it, i) => (
      <div key={i} style={{ ...RADIAL_POSITIONS[i], zIndex: 1 }}>
        <MiniCard icon={it.icon} title={it.title} desc={it.desc} />
      </div>
    ))}
  </div>
);

export const NativeGrid = ({ icon: Icon, color = 'var(--accent-primary)', bg = 'rgba(255,107,0,0.1)' }) => {
  const cols = 5, rows = 3, main = 1 * cols + 2;
  // two diagonal "echo" cells pulse in after the main one — reads as the
  // icon's native reach rippling outward across the grid instead of one
  // static lit square
  const echoes = [main - cols - 1, main + cols + 1];
  return (
    <div className="native-grid-pattern" data-keep-grid style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 44px)`, gridTemplateRows: `repeat(${rows}, 44px)`, WebkitMaskImage: 'radial-gradient(ellipse 75% 75% at 50% 50%, #000 35%, transparent 88%)', maskImage: 'radial-gradient(ellipse 75% 75% at 50% 50%, #000 35%, transparent 88%)' }}>
      {Array.from({ length: cols * rows }).map((_, i) => {
        const isMain = i === main;
        const echoAt = echoes.indexOf(i);
        return (
          <div key={i} style={{ position: 'relative', width: 44, height: 44, border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isMain || echoAt !== -1 ? bg : 'transparent' }}>
            {isMain && (
              <>
                <span aria-hidden className="asf-grid-ping" style={{ position: 'absolute', inset: 8, borderRadius: '50%', border: `1px solid ${color}` }} />
                <Icon size={20} color={color} />
              </>
            )}
            {echoAt !== -1 && (
              <span className="asf-check" style={{ width: 9, height: 9, borderRadius: '50%', background: color, animation: `asfCheckIn 0.5s ${0.35 + echoAt * 0.3}s ease both` }} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export const WorkflowChecklist = ({ steps }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '0 32px 28px', width: '100%', maxWidth: '260px' }}>
    {steps.map((step, i) => (
      <div key={step} className="asf-check" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', animation: `asfCheckIn 0.5s ${i * 0.3}s ease both` }}>
        <CheckCircle size={16} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: '13px', fontWeight: 600 }}>{step}</span>
      </div>
    ))}
  </div>
);

const DEFAULT_ORBIT_PATH = 'M90 36 A78 34 0 1 1 89.99 36';
export const OrbitCard = ({ centerLogo, centerBg, centerBorder, satellites }) => {
  const n = satellites.length;
  return (
    <div style={{ position: 'relative', width: 180, height: 140 }}>
      <svg viewBox="0 0 180 140" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}>
        <ellipse cx="90" cy="70" rx="78" ry="34" fill="none" stroke="var(--border-subtle)" strokeWidth="1.5" strokeDasharray="4 5" />
        {/* a lit segment chases the dashed track, so the orbit itself reads
            as a live connection instead of a static ring */}
        <ellipse className="asf-orbit-trace" cx="90" cy="70" rx="78" ry="34" fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeDasharray="28 337" strokeLinecap="round" opacity="0.65" />
        {satellites.map((sat, i) => (
          <g key={i} className="asf-orbit-sat">
            <animateMotion dur="7s" begin={`${-i * (7 / n)}s`} repeatCount="indefinite" path={DEFAULT_ORBIT_PATH} />
            <foreignObject x="-14" y="-14" width="28" height="28" style={{ overflow: 'visible' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: sat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 16px ${sat.bg}80` }}>
                {sat.node}
              </div>
            </foreignObject>
          </g>
        ))}
      </svg>
      <div aria-hidden className="asf-orbit-pulse" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 74, height: 74, borderRadius: '50%', background: `radial-gradient(circle, ${centerBg} 0%, transparent 72%)` }} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 52, height: 52, borderRadius: 'var(--radius-md)', background: centerBg, border: centerBorder, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
        {centerLogo}
      </div>
    </div>
  );
};

export const FileMock = ({ filename, lines }) => (
  <div style={{ width: '100%', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)', margin: '0 20px 24px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
      <div style={{ display: 'flex', gap: '6px' }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FF5F57' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FFBD2E' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28CA42' }} />
      </div>
      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{filename}</span>
    </div>
    <pre style={{ margin: 0, padding: '14px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: '11.5px', lineHeight: 1.75, overflow: 'hidden' }}>
      {lines.map((line, i) => <div key={i}>{line}</div>)}
    </pre>
  </div>
);

const DEFAULT_BELT_PATH = 'M10 150C60 150 85 50 160 50C235 50 260 150 310 150';
export const TechBelt = ({ tools, path = DEFAULT_BELT_PATH, dur = 18 }) => {
  const [errored, setErrored] = React.useState({});
  const n = tools.length;
  return (
    <svg viewBox="0 0 320 200" style={{ width: '100%', maxWidth: 360, height: 'auto', aspectRatio: '320 / 200', display: 'block', margin: '0 auto', overflow: 'visible' }}>
      {tools.map((t, i) => (
        <g key={t.name}>
          <animateMotion dur={`${dur}s`} begin={`${-i * (dur / n)}s`} repeatCount="indefinite" path={path} />
          <foreignObject x="-20" y="-20" width="40" height="40" style={{ overflow: 'visible' }}>
            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: `${t.color}18`, border: `1px solid ${t.color}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 18px ${t.color}30` }}>
              {!errored[t.name] ? (
                <img src={t.logo} alt={t.name} loading="lazy" style={{ width: 22, height: 22, objectFit: 'contain' }} onError={() => setErrored((p) => ({ ...p, [t.name]: true }))} />
              ) : (
                <span style={{ fontSize: 13, fontWeight: 800, color: t.color }}>{t.name.charAt(0)}</span>
              )}
            </div>
          </foreignObject>
        </g>
      ))}
    </svg>
  );
};

export const SpringMotion = () => (
  <div style={{ position: 'relative', width: 140, height: 40 }}>
    <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 2, background: 'var(--border-subtle)', transform: 'translateY(-50%)' }} />
    {/* two smaller, fainter echoes trail the lead dot on the same spring
        path — reads as a motion trail instead of one bouncing ball */}
    {[0, 1, 2].map((i) => (
      <div key={i} className="asf-spring-dot" style={{
        position: 'absolute', top: '50%', left: '50%',
        width: 22 - i * 6, height: 22 - i * 6, borderRadius: '50%',
        background: 'var(--accent-primary)', opacity: 1 - i * 0.32,
        boxShadow: i === 0 ? '0 0 20px rgba(255,107,0,0.6)' : 'none',
        animation: 'asfSpring 1.6s cubic-bezier(0.34,1.56,0.64,1) infinite',
        animationDelay: `${i * 0.09}s`,
        zIndex: 3 - i,
      }} />
    ))}
  </div>
);
