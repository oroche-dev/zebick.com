import React from 'react';

const GamingSVG = () => {
  return (
    <svg
      className="hero-svg"
      viewBox="0 0 1920 1080"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id="gameGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.7" />
          <stop offset="50%" stopColor="#FF6B00" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#FF6B00" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="controllerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#FF6B00" stopOpacity="0.1" />
        </linearGradient>
        <filter id="gameGlowFilter" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="10" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Large ambient glow */}
      <circle cx="1400" cy="400" r="350" fill="url(#gameGlow)" opacity="0.4">
        <animate attributeName="r" values="350;400;350" dur="8s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.4;0.6;0.4" dur="8s" repeatCount="indefinite" />
      </circle>

      {/* Game Controller - Large */}
      <g transform="translate(1150, 180)" filter="url(#gameGlowFilter)">
        {/* Controller Body */}
        <path
          d="M150,100 Q70,100 40,150 L15,230 Q0,260 25,275 L80,290 Q110,297 125,270 L150,210 L250,210 L275,270 Q290,297 320,290 L375,275 Q400,260 385,230 L360,150 Q330,100 250,100 Z"
          fill="url(#controllerGradient)"
          stroke="#FF6B00"
          strokeWidth="4"
          opacity="0.6"
        >
          <animate attributeName="opacity" values="0.6;0.9;0.6" dur="4s" repeatCount="indefinite" />
        </path>
        
        {/* Left Grip Texture */}
        {[...Array(6)].map((_, i) => (
          <line
            key={`left${i}`}
            x1={45 + i * 8}
            y1={250 + i * 5}
            x2={55 + i * 8}
            y2={260 + i * 5}
            stroke="#FF6B00"
            strokeWidth="1"
            opacity="0.3"
          />
        ))}
        
        {/* Right Grip Texture */}
        {[...Array(6)].map((_, i) => (
          <line
            key={`right${i}`}
            x1={340 - i * 8}
            y1={250 + i * 5}
            x2={330 - i * 8}
            y2={260 + i * 5}
            stroke="#FF6B00"
            strokeWidth="1"
            opacity="0.3"
          />
        ))}
        
        {/* D-Pad with glow */}
        <g filter="url(#gameGlowFilter)">
          <line x1="100" y1="150" x2="100" y2="190" stroke="#FF6B00" strokeWidth="4" opacity="0.7" />
          <line x1="80" y1="170" x2="120" y2="170" stroke="#FF6B00" strokeWidth="4" opacity="0.7" />
          <circle cx="100" cy="170" r="8" fill="#FF6B00" opacity="0.4" />
        </g>
        
        {/* Buttons A, B, X, Y with pulse animation */}
        {[
          { cx: 300, cy: 150, label: 'X', delay: 0 },
          { cx: 275, cy: 175, label: 'Y', delay: 0.3 },
          { cx: 325, cy: 175, label: 'B', delay: 0.6 },
          { cx: 300, cy: 200, label: 'A', delay: 0.9 },
        ].map((btn, i) => (
          <g key={i}>
            <circle
              cx={btn.cx}
              cy={btn.cy}
              r="15"
              fill="none"
              stroke="#FF6B00"
              strokeWidth="3"
              opacity="0.7"
            >
              <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" begin={`${btn.delay}s`} repeatCount="indefinite" />
            </circle>
            <text x={btn.cx} y={btn.cy + 5} fill="#FF6B00" fontSize="12" textAnchor="middle" opacity="0.8">{btn.label}</text>
          </g>
        ))}
        
        {/* Joysticks */}
        <circle cx="150" cy="220" r="20" fill="none" stroke="#FF6B00" strokeWidth="2" opacity="0.5">
          <animate attributeName="r" values="20;22;20" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="250" cy="220" r="20" fill="none" stroke="#FF6B00" strokeWidth="2" opacity="0.5">
          <animate attributeName="r" values="20;22;20" dur="3.5s" repeatCount="indefinite" />
        </circle>
        
        {/* Start/Select buttons */}
        <rect x="180" y="145" width="40" height="8" rx="4" fill="none" stroke="#FF6B00" strokeWidth="1" opacity="0.5" />
      </g>

      {/* Game particles/power-ups */}
      <g filter="url(#gameGlowFilter)">
        {[...Array(12)].map((_, i) => (
          <circle
            key={i}
            cx={1050 + (i % 4) * 100}
            cy={600 + Math.floor(i / 4) * 100}
            r="8"
            fill="#FF6B00"
            opacity="0.5"
          >
            <animate attributeName="r" values="8;12;8" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;0.9;0.5" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </g>

      {/* Gaming text floating */}
      <g opacity="0.3" fontSize="16" fontFamily="monospace" fill="#FF6B00">
        {[
          { text: 'LEVEL UP', x: 100, y: 150, dur: '11s' },
          { text: 'SCORE', x: 250, y: 100, dur: '13s' },
          { text: 'HP', x: 150, y: 300, dur: '12s' },
          { text: 'XP', x: 80, y: 500, dur: '14s' },
          { text: 'Unity', x: 1700, y: 150, dur: '10s' },
          { text: 'Unreal', x: 1800, y: 220, dur: '15s' },
          { text: 'C#', x: 1600, y: 320, dur: '13s' },
        ].map((item, i) => (
          <text key={i} x={item.x} y={item.y}>
            <animate attributeName="y" values={`${item.y};1100`} dur={item.dur} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;0.8;0.5" dur="3s" repeatCount="indefinite" />
            {item.text}
          </text>
        ))}
      </g>

      {/* Circuit lines */}
      <g filter="url(#gameGlowFilter)" stroke="#FF6B00" strokeWidth="1.5" opacity="0.4">
        <path d="M0,350 H200 L240,310 H400 L440,350 H620">
          <animate attributeName="stroke-dasharray" values="0,1000;600,400;1000,0" dur="4s" repeatCount="indefinite" />
        </path>
        <path d="M0,550 H160 L200,600 H340 L380,550 H560">
          <animate attributeName="stroke-dasharray" values="0,900;500,400;900,0" dur="5s" repeatCount="indefinite" />
        </path>
        <path d="M1920,280 H1750 L1710,320 H1560 L1520,280 H1350">
          <animate attributeName="stroke-dasharray" values="0,800;450,350;800,0" dur="3.5s" repeatCount="indefinite" />
        </path>
      </g>

      {/* Connection nodes */}
      <g filter="url(#gameGlowFilter)">
        {[
          [200, 350], [440, 350], [200, 600], [380, 550],
          [1710, 320], [1520, 280]
        ].map(([cx, cy], i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="8" fill="#FF6B00" opacity="0.3" />
            <circle cx={cx} cy={cy} r="4" fill="#FF6B00" opacity="0.8">
              <animate attributeName="r" values="4;6;4" dur={`${2 + i % 2}s`} repeatCount="indefinite" />
            </circle>
          </g>
        ))}
      </g>

      {/* Pixel grid pattern */}
      <g opacity="0.15">
        {[...Array(20)].map((_, i) => (
          <rect
            key={i}
            x={100 + (i % 5) * 50}
            y={700 + Math.floor(i / 5) * 50}
            width="30"
            height="30"
            fill="none"
            stroke="#FF6B00"
            strokeWidth="1"
          >
            <animate attributeName="opacity" values="0.2;0.5;0.2" dur={`${3 + i * 0.2}s`} repeatCount="indefinite" />
          </rect>
        ))}
      </g>

      {/* Scan line effect */}
      <rect x="0" y="0" width="1920" height="4" fill="#FF6B00" opacity="0.15">
        <animate attributeName="y" values="0;1080;0" dur="6s" repeatCount="indefinite" />
      </rect>

      {/* Bottom glow */}
      <ellipse cx="960" cy="1100" rx="800" ry="200" fill="url(#gameGlow)" opacity="0.2" />
    </svg>
  );
};

export default GamingSVG;