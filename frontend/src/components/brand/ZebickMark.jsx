import React from 'react';

/**
 * ZebickMark — compact square brand mark (the favicon motif: "‹ze›" in
 * brackets with the orange accent). For icon badges where a generic lucide
 * icon would otherwise sit (e.g. next to a section heading), not for the
 * full wordmark — use ZebickLogoA/B for that.
 */
const ZebickMark = ({ size = 24, color = '#FFFFFF', accent = '#FF6B00' }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="zebick">
    <path d="M14 20 L8 32 L14 44" stroke={accent} strokeWidth="3.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M50 20 L56 32 L50 44" stroke={accent} strokeWidth="3.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <text x="32" y="42" fontFamily="'Outfit', 'Inter', sans-serif" fontWeight="800" fontSize="26" letterSpacing="-1.5" textAnchor="middle" fill={color}>
      z<tspan fill={accent}>e</tspan>
    </text>
    <rect x="20" y="48" width="24" height="3" rx="1.5" fill={accent} />
    <rect x="38" y="14" width="4.5" height="4.5" fill={accent} />
  </svg>
);

export default ZebickMark;
