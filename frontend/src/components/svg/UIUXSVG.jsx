import React from 'react';

const UIUXSVG = () => {
  return (
    <svg
      className="hero-svg"
      viewBox="0 0 1920 1080"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id="uiGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#FF6B00" stopOpacity="0" />
        </radialGradient>
        <filter id="uiGlowFilter">
          <feGaussianBlur stdDeviation="10" />
        </filter>
      </defs>

      <circle cx="1400" cy="400" r="350" fill="url(#uiGlow)" opacity="0.4">
        <animate attributeName="r" values="350;400;350" dur="8s" repeatCount="indefinite" />
      </circle>

      {/* Pen Tool / Design Tool */}
      <g transform="translate(1250, 180)" filter="url(#uiGlowFilter)">
        {/* Pen/Cursor */}
        <path
          d="M100,50 L120,100 L70,90 Z"
          fill="none"
          stroke="#FF6B00"
          strokeWidth="3"
          opacity="0.7"
        >
          <animate attributeName="opacity" values="0.7;1;0.7" dur="3s" repeatCount="indefinite" />
        </path>
        
        {/* Bezier Curves */}
        <path
          d="M50,200 Q150,100 250,200"
          fill="none"
          stroke="#FF6B00"
          strokeWidth="2"
          opacity="0.5"
        />
        <circle cx="50" cy="200" r="5" fill="#FF6B00" opacity="0.6" />
        <circle cx="150" cy="100" r="5" fill="#FF6B00" opacity="0.6" />
        <circle cx="250" cy="200" r="5" fill="#FF6B00" opacity="0.6" />
        
        {/* Color Palette */}
        <g transform="translate(0, 280)">
          {[0, 1, 2, 3, 4].map((i) => (
            <circle
              key={i}
              cx={50 + i * 40}
              cy="0"
              r="15"
              fill="none"
              stroke="#FF6B00"
              strokeWidth="2"
              opacity={0.4 + i * 0.1}
            >
              <animate attributeName="opacity" values={`${0.4 + i * 0.1};${0.7 + i * 0.1};${0.4 + i * 0.1}`} dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
            </circle>
          ))}
        </g>
        
        {/* Grid */}
        {[...Array(5)].map((_, i) => (
          <line
            key={`v${i}`}
            x1={i * 50}
            y1="0"
            x2={i * 50}
            y2="250"
            stroke="#FF6B00"
            strokeWidth="0.5"
            opacity="0.15"
          />
        ))}
        {[...Array(5)].map((_, i) => (
          <line
            key={`h${i}`}
            x1="0"
            y1={i * 50}
            x2="200"
            y2={i * 50}
            stroke="#FF6B00"
            strokeWidth="0.5"
            opacity="0.15"
          />
        ))}
      </g>

      {/* Floating design elements */}
      <g filter="url(#uiGlowFilter)">
        {[...Array(6)].map((_, i) => (
          <rect
            key={i}
            x={1100 + (i % 3) * 100}
            y={600 + Math.floor(i / 3) * 100}
            width="50"
            height="50"
            rx="8"
            fill="none"
            stroke="#FF6B00"
            strokeWidth="2"
            opacity="0.3"
          >
            <animate attributeName="opacity" values="0.3;0.6;0.3" dur={`${3 + i * 0.5}s`} repeatCount="indefinite" />
          </rect>
        ))}
      </g>
    </svg>
  );
};

export default UIUXSVG;