import React from 'react';

const GraphicDesignSVG = () => {
  return (
    <svg
      className="hero-svg"
      viewBox="0 0 1920 1080"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id="designGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#FF6B00" stopOpacity="0" />
        </radialGradient>
        <filter id="designGlowFilter">
          <feGaussianBlur stdDeviation="10" />
        </filter>
      </defs>

      <circle cx="1400" cy="400" r="350" fill="url(#designGlow)" opacity="0.4">
        <animate attributeName="r" values="350;400;350" dur="8s" repeatCount="indefinite" />
      </circle>

      {/* Brush / Pen Tool */}
      <g transform="translate(1250, 180)" filter="url(#designGlowFilter)">
        {/* Brush */}
        <path
          d="M100,50 L120,30 L140,50 L120,200 L100,200 Z"
          fill="none"
          stroke="#FF6B00"
          strokeWidth="3"
          opacity="0.6"
        >
          <animate attributeName="opacity" values="0.6;0.9;0.6" dur="4s" repeatCount="indefinite" />
        </path>
        
        {/* Brush tip */}
        <path
          d="M100,200 L90,230 L120,240 L150,230 L140,200"
          fill="#FF6B00"
          opacity="0.3"
        />
        
        {/* Paint stroke */}
        <path
          d="M160,150 Q200,120 240,140 T320,130"
          fill="none"
          stroke="#FF6B00"
          strokeWidth="5"
          opacity="0.4"
          strokeLinecap="round"
        >
          <animate attributeName="stroke-dasharray" values="0,500;500,0" dur="3s" repeatCount="indefinite" />
        </path>
      </g>

      {/* Color palette circles */}
      <g transform="translate(1200, 550)" filter="url(#designGlowFilter)">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <circle
            key={i}
            cx={(i % 3) * 80}
            cy={Math.floor(i / 3) * 80}
            r="25"
            fill="none"
            stroke="#FF6B00"
            strokeWidth="2"
            opacity={0.3 + i * 0.1}
          >
            <animate attributeName="opacity" values={`${0.3 + i * 0.1};${0.6 + i * 0.1};${0.3 + i * 0.1}`} dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </g>

      {/* Geometric shapes */}
      <g filter="url(#designGlowFilter)" opacity="0.3">
        <polygon
          points="1450,700 1500,650 1550,700 1500,750"
          fill="none"
          stroke="#FF6B00"
          strokeWidth="2"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 1500 700"
            to="360 1500 700"
            dur="20s"
            repeatCount="indefinite"
          />
        </polygon>
        
        <rect
          x="1350"
          y="800"
          width="60"
          height="60"
          fill="none"
          stroke="#FF6B00"
          strokeWidth="2"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 1380 830"
            to="360 1380 830"
            dur="15s"
            repeatCount="indefinite"
          />
        </rect>
      </g>

      {/* Creative particles */}
      <g filter="url(#designGlowFilter)">
        {[...Array(10)].map((_, i) => (
          <circle
            key={i}
            cx={1100 + (i % 5) * 70}
            cy={600 + Math.floor(i / 5) * 100}
            r="4"
            fill="#FF6B00"
            opacity="0.4"
          >
            <animate attributeName="r" values="4;7;4" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0.7;0.4" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </g>
    </svg>
  );
};

export default GraphicDesignSVG;