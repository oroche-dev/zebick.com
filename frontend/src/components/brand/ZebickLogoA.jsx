import React from 'react';

/**
 * ZebickLogoA
 * Stil: Modern Geometric Bold
 * - Dicke, klare Sans-Serif (Inter/Space Grotesk Feeling)
 * - Orange runder Punkt als i-Tuepfelchen
 * - Orange Pfeil-Akzent als Cursor am k
 * - Dunkle Monochrom-Variante aus reinem Weiß/Orange
 */
const ZebickLogoA = ({ height = 72, showArrow = true, color = '#FFFFFF', accent = '#FF6B00' }) => {
  const w = height * (320 / 96);
  return (
    <svg
      width={w}
      height={height}
      viewBox="0 0 320 96"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="zebick"
      style={{ display: 'block' }}
    >
      <g fontFamily="'Space Grotesk', 'Inter', sans-serif" fontWeight="800" fontSize="76" letterSpacing="-3">
        {/* z e b */}
        <text x="0"  y="72" fill={color}>z</text>
        <text x="43" y="72" fill={accent}>e</text>
        <text x="92" y="72" fill={color}>b</text>
        {/* i with orange dot already via glyph, but we overlay a larger orange circle */}
        <text x="141" y="72" fill={color}>i</text>
        <circle cx="158" cy="20" r="8" fill={accent} />
        {/* c k */}
        <text x="166" y="72" fill={color}>c</text>
        <text x="211" y="72" fill={color}>k</text>
      </g>
      {/* Orange cursor arrow at bottom-right of k */}
      {showArrow && (
        <g transform="translate(268, 58)">
          <path
            d="M0 0 L22 9 L11 14 L8 26 Z"
            fill={accent}
          />
        </g>
      )}
    </svg>
  );
};

export default ZebickLogoA;
