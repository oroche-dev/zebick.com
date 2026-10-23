import React from 'react';

const SecuritySVG = () => {
  return (
    <svg
      className="hero-svg"
      viewBox="0 0 1920 1080"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id="securityGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.7" />
          <stop offset="50%" stopColor="#FF6B00" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#FF6B00" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#FF6B00" stopOpacity="0.1" />
        </linearGradient>

        <filter id="secGlowFilter" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="10" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="textGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Large ambient glow */}
      <circle cx="1400" cy="400" r="350" fill="url(#securityGlow)" opacity="0.4">
        <animate attributeName="r" values="350;400;350" dur="8s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.4;0.6;0.4" dur="8s" repeatCount="indefinite" />
      </circle>

      {/* Shield with glow */}
      <g filter="url(#secGlowFilter)" transform="translate(1250, 180)">
        {/* Outer shield */}
        <path
          d="M120,0 L240,50 L240,150 C240,220 180,280 120,320 C60,280 0,220 0,150 L0,50 Z"
          fill="url(#shieldGradient)"
          stroke="#FF6B00"
          strokeWidth="2"
          opacity="0.6"
        >
          <animate attributeName="opacity" values="0.6;0.9;0.6" dur="4s" repeatCount="indefinite" />
        </path>
        
        {/* Inner shield */}
        <path
          d="M120,30 L210,70 L210,150 C210,200 165,245 120,275 C75,245 30,200 30,150 L30,70 Z"
          fill="none"
          stroke="#FF6B00"
          strokeWidth="1"
          opacity="0.4"
        />

        {/* Lock icon */}
        <rect x="95" y="130" width="50" height="45" rx="5" fill="none" stroke="#FF6B00" strokeWidth="2" opacity="0.8" />
        <path d="M105,130 L105,110 A15,15 0 0,1 135,110 L135,130" fill="none" stroke="#FF6B00" strokeWidth="2" opacity="0.8" />
        <circle cx="120" cy="152" r="6" fill="#FF6B00" opacity="0.9">
          <animate attributeName="opacity" values="0.9;1;0.9" dur="1.5s" repeatCount="indefinite" />
          <animate attributeName="r" values="6;8;6" dur="1.5s" repeatCount="indefinite" />
        </circle>
      </g>

      {/* Binary data streams */}
      <g filter="url(#textGlow)" style={{ fontFamily: 'monospace', fontSize: '13px', fill: '#FF6B00' }}>
        {[
          { x: 80, y: 150, text: '01001011', dur: '12s' },
          { x: 200, y: 80, text: '10110101', dur: '14s' },
          { x: 350, y: 200, text: '11001100', dur: '16s' },
          { x: 1700, y: 100, text: '01110011', dur: '13s' },
          { x: 1550, y: 180, text: '10001111', dur: '15s' },
          { x: 1800, y: 250, text: '01010101', dur: '11s' },
        ].map((item, i) => (
          <text key={i} x={item.x} y={item.y} opacity="0.5">
            <animate attributeName="y" values={`${item.y};1100`} dur={item.dur} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;0.8;0.5" dur="3s" repeatCount="indefinite" />
            {item.text}
          </text>
        ))}
      </g>

      {/* Circuit lines with glow */}
      <g filter="url(#secGlowFilter)" stroke="#FF6B00" strokeWidth="1.5" opacity="0.4">
        <path d="M0,350 H180 L220,310 H380 L420,350 H580">
          <animate attributeName="stroke-dasharray" values="0,1000;600,400;1000,0" dur="4s" repeatCount="indefinite" />
        </path>
        <path d="M0,550 H140 L180,600 H320 L360,550 H520 L560,600 H720">
          <animate attributeName="stroke-dasharray" values="0,1200;700,500;1200,0" dur="5s" repeatCount="indefinite" />
        </path>
        <path d="M1920,280 H1750 L1710,320 H1560 L1520,280 H1350">
          <animate attributeName="stroke-dasharray" values="0,800;450,350;800,0" dur="3.5s" repeatCount="indefinite" />
        </path>
        <path d="M1920,450 H1800 L1760,490 H1620 L1580,450 H1440">
          <animate attributeName="stroke-dasharray" values="0,900;500,400;900,0" dur="4.5s" repeatCount="indefinite" />
        </path>
      </g>

      {/* Connection nodes with glow */}
      <g filter="url(#secGlowFilter)">
        {[
          [180, 350], [420, 350], [180, 600], [360, 550], 
          [1710, 320], [1520, 280], [1760, 490], [1580, 450]
        ].map(([cx, cy], i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="8" fill="#FF6B00" opacity="0.3" />
            <circle cx={cx} cy={cy} r="4" fill="#FF6B00" opacity="0.8">
              <animate attributeName="r" values="4;6;4" dur={`${2 + i % 2}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;1;0.8" dur={`${2 + i % 2}s`} repeatCount="indefinite" />
            </circle>
          </g>
        ))}
      </g>

      {/* Scan line effect */}
      <rect x="0" y="0" width="1920" height="4" fill="#FF6B00" opacity="0.15">
        <animate attributeName="y" values="0;1080;0" dur="6s" repeatCount="indefinite" />
      </rect>

      {/* Hexagon grid pattern */}
      <g filter="url(#secGlowFilter)" opacity="0.2">
        {[...Array(8)].map((_, i) => (
          <polygon
            key={i}
            points="30,0 60,17 60,52 30,69 0,52 0,17"
            fill="none"
            stroke="#FF6B00"
            strokeWidth="1"
            transform={`translate(${1100 + (i % 4) * 70}, ${600 + Math.floor(i / 4) * 60})`}
          >
            <animate attributeName="opacity" values="0.2;0.5;0.2" dur={`${3 + i % 2}s`} repeatCount="indefinite" />
          </polygon>
        ))}
      </g>

      {/* Radar sweep */}
      <g transform="translate(250, 750)">
        <circle cx="0" cy="0" r="100" fill="none" stroke="#FF6B00" strokeWidth="1" opacity="0.2" />
        <circle cx="0" cy="0" r="70" fill="none" stroke="#FF6B00" strokeWidth="1" opacity="0.15" />
        <circle cx="0" cy="0" r="40" fill="none" stroke="#FF6B00" strokeWidth="1" opacity="0.1" />
        <line x1="0" y1="0" x2="100" y2="0" stroke="#FF6B00" strokeWidth="2" opacity="0.6">
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 0 0"
            to="360 0 0"
            dur="4s"
            repeatCount="indefinite"
          />
        </line>
        <circle cx="0" cy="0" r="5" fill="#FF6B00" opacity="0.8" filter="url(#secGlowFilter)" />
      </g>

      {/* Warning triangles */}
      <g filter="url(#secGlowFilter)" opacity="0.3">
        <polygon points="1600,800 1650,720 1700,800" fill="none" stroke="#FF6B00" strokeWidth="1.5">
          <animate attributeName="opacity" values="0.3;0.6;0.3" dur="2s" repeatCount="indefinite" />
        </polygon>
        <text x="1640" y="775" fill="#FF6B00" fontSize="24" fontWeight="bold">!</text>
      </g>

      {/* Bottom glow */}
      <ellipse cx="960" cy="1100" rx="800" ry="200" fill="url(#securityGlow)" opacity="0.2" />
    </svg>
  );
};

export default SecuritySVG;
