import React from 'react';

const TILT = [-7, 5, -4, 8, -6, 4, -8, 6, -3, 7, -5, 6];

// White (or near-white) brand colors would disappear on a white tile — fall
// back to a dark tile for those instead of hardcoding exceptions per tool.
function isNearWhite(hex) {
  if (!hex) return false;
  const c = hex.replace('#', '');
  const full = c.length === 3 ? c.split('').map((ch) => ch + ch).join('') : c;
  if (full.length !== 6) return false;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.85;
}

/**
 * macOS-dock-style magnifying tool row: flat, solid tiles that overlap and
 * tilt at rest, then scale up / lift / straighten the closer the pointer
 * gets, with a tooltip that glides to the nearest tile. Plain React state +
 * CSS transitions (no animation library) so it stays consistent with the
 * rest of this codebase. On touch devices there's no continuous pointer to
 * track, so tiles just sit at their tilted rest state — still reads as a
 * dock, just without the live magnification.
 *
 * jsdelivr's simple-icons SVGs ship as flat black silhouettes (no color of
 * their own), so those are rendered as a CSS mask filled with `color`.
 * Every other source (devicon's multi-tone "original" marks, simpleicons.org's
 * already-recolored SVGs) is already correctly colored — masking those would
 * flatten their real detail into a single-tone blob, so they render as a
 * plain `<img>` instead.
 */
const NEEDS_RECOLOR = 'cdn.jsdelivr.net/npm/simple-icons';

// cdn.simpleicons.org/<slug>/<hex> bakes its own recolor into the fetched
// SVG — that hex is what actually ends up on screen, which can differ from
// this tool's `color` field (often chosen as a UI accent, not a literal
// render color). Prefer it for contrast decisions so white-recolored icons
// don't land on a white tile.
function urlRecolorHex(url) {
  const m = url && url.match(/cdn\.simpleicons\.org\/[^/]+\/([0-9a-fA-F]{3,6})(?:[/?#]|$)/);
  return m ? `#${m[1]}` : null;
}
const ToolDock = ({ tools }) => {
  const railRef = React.useRef(null);
  const tileRefs = React.useRef([]);
  const [hover, setHover] = React.useState(null); // { swells: number[], nearest: number, tipX: number }

  const handleMove = (e) => {
    const rail = railRef.current;
    if (!rail) return;
    const railRect = rail.getBoundingClientRect();
    const x = e.clientX - railRect.left;
    let nearest = 0;
    let bestDist = Infinity;
    let tipX = 0;
    const swells = tileRefs.current.map((el, i) => {
      if (!el) return 0;
      const r = el.getBoundingClientRect();
      const center = r.left + r.width / 2 - railRect.left;
      const d = Math.abs(x - center);
      if (d < bestDist) { bestDist = d; nearest = i; tipX = center; }
      return Math.max(0, 1 - d / (r.width * 1.3)) ** 2;
    });
    setHover({ swells, nearest, tipX });
  };
  const handleLeave = () => setHover(null);

  return (
    <div style={{ position: 'relative', padding: '52px 4px 12px' }}>
      <div
        aria-hidden
        style={{
          position: 'absolute', top: 0, left: hover ? hover.tipX : 0, zIndex: 10,
          transform: 'translateX(-50%)', opacity: hover ? 1 : 0,
          transition: 'opacity 0.2s ease, left 0.18s cubic-bezier(0.22,1,0.36,1)',
          padding: '6px 12px', borderRadius: '8px', whiteSpace: 'nowrap',
          background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)',
          fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', pointerEvents: 'none',
        }}
      >
        {hover ? tools[hover.nearest].name : ''}
      </div>
      <div
        ref={railRef}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}
      >
        {tools.map((t, i) => {
          const swell = hover ? hover.swells[i] : 0;
          const tilt = TILT[i % TILT.length] * (1 - swell);
          const scale = 1 + swell * 0.32;
          const lift = swell * 16;
          const recolor = t.logo && t.logo.includes(NEEDS_RECOLOR);
          const renderedHex = (!recolor && t.logo && urlRecolorHex(t.logo)) || t.color;
          // Vary tile shade instead of making every logo tile white — near-white
          // brand colors always force a dark tile (contrast), everything else
          // alternates white/dark in a fixed pattern for visual variety.
          const dark = isNearWhite(renderedHex) || (t.logo && i % 3 === 2);
          return (
            <div
              key={t.name}
              ref={(el) => { tileRefs.current[i] = el; }}
              title={t.name}
              style={{
                width: 'clamp(36px, 8vw, 62px)', height: 'clamp(36px, 8vw, 62px)', flexShrink: 0,
                marginLeft: i === 0 ? 0 : 'clamp(-15px, -3.2vw, -9px)',
                zIndex: tools.length - i,
                transform: `translateY(${-lift}px) scale(${scale}) rotate(${tilt}deg)`,
                transformOrigin: 'bottom center',
                transition: 'transform 0.18s cubic-bezier(0.22,1,0.36,1)',
                borderRadius: '23%', background: dark ? '#141414' : (t.logo ? '#fff' : t.color), border: `1px solid ${renderedHex}70`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {t.logo && recolor ? (
                <div
                  role="img" aria-label={t.name}
                  style={{
                    width: '54%', height: '54%', pointerEvents: 'none',
                    backgroundColor: t.color,
                    WebkitMaskImage: `url(${t.logo})`, maskImage: `url(${t.logo})`,
                    WebkitMaskSize: 'contain', maskSize: 'contain',
                    WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
                    WebkitMaskPosition: 'center', maskPosition: 'center',
                  }}
                />
              ) : t.logo ? (
                <img
                  src={t.logo} alt={t.name}
                  loading="lazy"
                  style={{ width: '54%', height: '54%', objectFit: 'contain', pointerEvents: 'none' }}
                />
              ) : (
                <span style={{ fontSize: 'clamp(13px, 3vw, 19px)', fontWeight: 800, color: '#fff', pointerEvents: 'none' }}>
                  {t.name.charAt(0)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ToolDock;
