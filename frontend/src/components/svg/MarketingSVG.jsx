import React from 'react';

const MarketingSVG = () => {
  return (
    <svg
      className="hero-svg"
      viewBox="0 0 1920 1080"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id="marketGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#FF6B00" stopOpacity="0" />
        </radialGradient>
        <filter id="marketGlowFilter">
          <feGaussianBlur stdDeviation="10" />
        </filter>
      </defs>

      <circle cx="1400" cy="400" r="350" fill="url(#marketGlow)" opacity="0.4">
        <animate attributeName="r" values="350;400;350" dur="8s" repeatCount="indefinite" />
      </circle>

      {/* Megaphone / Marketing Icon */}
      <g transform="translate(1250, 180)" filter="url(#marketGlowFilter)">
        {/* Megaphone */}
        <path
          d="M50,150 L150,100 L250,80 L250,220 L150,200 L50,150 Z"
          fill="none"
          stroke="#FF6B00"
          strokeWidth="3"
          opacity="0.6"
        >
          <animate attributeName="opacity" values="0.6;0.9;0.6" dur="4s" repeatCount="indefinite" />
        </path>
        
        {/* Handle */}
        <path
          d="M80,170 L60,200 L90,210 L110,180"
          fill="none"
          stroke="#FF6B00"
          strokeWidth="2"
          opacity="0.5"
        />
        
        {/* Sound waves */}
        {[0, 1, 2, 3].map((i) => (
          <path
            key={i}
            d={`M${260 + i * 30},${150 - i * 20} Q${300 + i * 30},${150} ${260 + i * 30},${150 + i * 20}`}
            fill="none"
            stroke="#FF6B00"
            strokeWidth="2"
            opacity={0.6 - i * 0.1}
          >
            <animate attributeName="opacity" values={`${0.6 - i * 0.1};${0.3 - i * 0.1};${0.6 - i * 0.1}`} dur={`${2 + i * 0.5}s`} repeatCount="indefinite" />
          </path>
        ))}
      </g>

      {/* Chart/Analytics */}
      <g transform="translate(1100, 600)" filter="url(#marketGlowFilter)">
        {/* Bar Chart */}
        {[40, 80, 60, 100, 75].map((height, i) => (
          <rect
            key={i}
            x={i * 50}
            y={100 - height}
            width="35"
            height={height}
            fill="none"
            stroke="#FF6B00"
            strokeWidth="2"
            opacity="0.5"
          >
            <animate attributeName="opacity" values="0.5;0.8;0.5" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
          </rect>
        ))}
        
        {/* Upward Arrow */}
        <path
          d="M280,30 L280,80 M260,50 L280,30 L300,50"
          stroke="#FF6B00"
          strokeWidth="3"
          opacity="0.7"
        >
          <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite" />
        </path>
      </g>

      {/* SEO Keywords floating */}
      <g opacity="0.3" fontSize="14" fontFamily="Arial" fill="#FF6B00">
        {['SEO', '#1', 'ROI', '+250%'].map((text, i) => (
          <text key={i} x={200 + i * 180} y={150 + i * 70}>
            <animate attributeName="y" values={`${150 + i * 70};1100`} dur={`${12 + i * 2}s`} repeatCount="indefinite" />
            {text}
          </text>
        ))}
      </g>
    </svg>
  );
};

export default MarketingSVG;