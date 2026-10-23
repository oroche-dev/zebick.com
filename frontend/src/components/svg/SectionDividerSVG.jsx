import React from 'react';

const SectionDividerSVG = ({ variant = 'minimal' }) => {
  // Minimal clean divider - just a subtle line
  if (variant === 'code' || variant === 'modern' || variant === 'minimal') {
    return (
      <svg
        viewBox="0 0 1920 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '60px', display: 'block' }}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="minimalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF6B00" stopOpacity="0" />
            <stop offset="50%" stopColor="#FF6B00" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#FF6B00" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Simple gradient line */}
        <line x1="300" y1="30" x2="1620" y2="30" stroke="url(#minimalGrad)" strokeWidth="1" />
        
        {/* Center dot */}
        <circle cx="960" cy="30" r="3" fill="#FF6B00" opacity="0.6">
          <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2s" repeatCount="indefinite" />
        </circle>
      </svg>
    );
  }

  // Circuit Animation
  if (variant === 'wave' || variant === 'circuit') {
    return (
      <svg
        viewBox="0 0 1920 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '80px', display: 'block' }}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="circuitGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF6B00" stopOpacity="0" />
            <stop offset="50%" stopColor="#FF6B00" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#FF6B00" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        <line x1="200" y1="40" x2="1720" y2="40" stroke="url(#circuitGradient)" strokeWidth="1" />
        
        {[400, 700, 960, 1220, 1520].map((x, i) => (
          <circle key={i} cx={x} cy="40" r="2" fill="#FF6B00" opacity="0.5">
            <animate attributeName="opacity" values="0.3;0.7;0.3" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </svg>
    );
  }

  if (variant === 'geometric') {
    return (
      <svg
        viewBox="0 0 1920 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '80px', display: 'block' }}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="geoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF6B00" stopOpacity="0" />
            <stop offset="50%" stopColor="#FF6B00" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#FF6B00" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        <line x1="200" y1="40" x2="1720" y2="40" stroke="url(#geoGradient)" strokeWidth="1" />
        <circle cx="960" cy="40" r="3" fill="#FF6B00" opacity="0.5" />
      </svg>
    );
  }

  return null;
};

export default SectionDividerSVG;
