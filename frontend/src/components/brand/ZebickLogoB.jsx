import React from 'react';

/**
 * ZebickLogoB — mit wählbarer Schrift-Variante
 * Design-Elemente bleiben identisch: Klammern, Cursor-Box, Unterstrich, Dot-Cluster.
 * Nur die Typografie ändert sich.
 *
 * variant:
 *  - 'geist'   → Geist Mono (Vercel 2024, extrem modern, tech aber frisch)
 *  - 'outfit'  → Outfit (proportional, geometric modern sans — weniger "code", eleganter)
 *  - 'sora'    → Sora (modern geometric, premium)
 *  - 'jetbrains' → Original (JetBrains Mono)
 */
const FONTS = {
  geist:     { family: "'Geist Mono', 'JetBrains Mono', monospace", weight: 700, size: 62, spacing: 0.5, mono: true },
  outfit:    { family: "'Outfit', 'Inter', sans-serif",              weight: 800, size: 72, spacing: -2,  mono: false },
  sora:      { family: "'Sora', 'Inter', sans-serif",                weight: 800, size: 70, spacing: -2,  mono: false },
  jetbrains: { family: "'JetBrains Mono', monospace",                weight: 700, size: 62, spacing: 1,   mono: true },
};

const ZebickLogoB = ({ height = 72, color = '#FFFFFF', accent = '#FF6B00', variant = 'geist' }) => {
  const f = FONTS[variant] || FONTS.geist;
  // Monospace = breiter, proportional = schmaler
  const vbWidth = f.mono ? 400 : 340;
  const w = height * (vbWidth / 96);

  // Positionen anpassen je nach mono/proportional
  const pos = f.mono
    ? { z: 40, e: 85, b: 130, i: 175, dot: 185, c: 205, k: 250, bracket1End: 24, bracket2Start: 304, bracket2End: 322, underStart: 85, underEnd: 128, dots: [342, 354, 366] }
    : { z: 36, e: 74, b: 112, i: 155, dot: 162, c: 178, k: 215, bracket1End: 22, bracket2Start: 255, bracket2End: 273, underStart: 74, underEnd: 110, dots: [292, 302, 312] };

  return (
    <svg
      width={w}
      height={height}
      viewBox={`0 0 ${vbWidth} 96`}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="zebick"
      style={{ display: 'block' }}
    >
      {/* Opening angle bracket */}
      <path d={`M${pos.bracket1End} 26 L6 50 L${pos.bracket1End} 74`} stroke={accent} strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />

      <g fontFamily={f.family} fontWeight={f.weight} fontSize={f.size} letterSpacing={f.spacing}>
        <text x={pos.z} y="68" fill={color}>z</text>
        <text x={pos.e} y="68" fill={accent}>e</text>
        <text x={pos.b} y="68" fill={color}>b</text>
        <text x={pos.i} y="68" fill={color}>i</text>
        <rect x={pos.dot} y="18" width="10" height="10" fill={accent}>
          <animate attributeName="opacity" values="1;0;1" dur="1.2s" repeatCount="indefinite" />
        </rect>
        <text x={pos.c} y="68" fill={color}>c</text>
        <text x={pos.k} y="68" fill={color}>k</text>
      </g>

      {/* Underscore under the orange 'e' */}
      <line x1={pos.underStart} y1="80" x2={pos.underEnd} y2="80" stroke={accent} strokeWidth="5" strokeLinecap="round" />

      {/* Closing angle bracket */}
      <path d={`M${pos.bracket2Start} 26 L${pos.bracket2End} 50 L${pos.bracket2Start} 74`} stroke={accent} strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />

      {/* Dot cluster */}
      <circle cx={pos.dots[0]} cy="48" r="3" fill={accent} opacity="0.5" />
      <circle cx={pos.dots[1]} cy="48" r="3" fill={accent} opacity="0.7" />
      <circle cx={pos.dots[2]} cy="48" r="3" fill={accent} />
    </svg>
  );
};

export default ZebickLogoB;
