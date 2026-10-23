import React from 'react';

const WebDevSVG = () => {
  return (
    <svg
      className="hero-svg"
      viewBox="0 0 1920 1080"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id="webGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.7" />
          <stop offset="50%" stopColor="#FF6B00" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#FF6B00" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="codeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#FF6B00" stopOpacity="0.1" />
        </linearGradient>
        <filter id="webGlowFilter" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="10" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Large ambient glow */}
      <circle cx="1400" cy="400" r="350" fill="url(#webGlow)" opacity="0.4">
        <animate attributeName="r" values="350;400;350" dur="8s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.4;0.6;0.4" dur="8s" repeatCount="indefinite" />
      </circle>

      {/* Code Editor Window with glow */}
      <g filter="url(#webGlowFilter)" transform="translate(1200, 180)">
        {/* Window */}
        <rect x="0" y="0" width="450" height="350" rx="15" fill="url(#codeGradient)" stroke="#FF6B00" strokeWidth="2" opacity="0.6">
          <animate attributeName="opacity" values="0.6;0.9;0.6" dur="4s" repeatCount="indefinite" />
        </rect>
        
        {/* Title Bar */}
        <rect x="0" y="0" width="450" height="45" rx="15" fill="#FF6B00" opacity="0.2" />
        <circle cx="25" cy="22" r="7" fill="#FF6B00" opacity="0.6" />
        <circle cx="55" cy="22" r="7" fill="#FF6B00" opacity="0.6" />
        <circle cx="85" cy="22" r="7" fill="#FF6B00" opacity="0.6" />
        
        {/* File tabs */}
        <rect x="120" y="10" width="80" height="25" rx="5" fill="#FF6B00" opacity="0.15" />
        <rect x="210" y="10" width="80" height="25" rx="5" fill="none" stroke="#FF6B00" strokeWidth="1" opacity="0.3" />
        
        {/* Code Brackets - Large */}
        <text x="180" y="220" fill="#FF6B00" fontSize="120" opacity="0.7" fontFamily="monospace" fontWeight="bold">&lt;/&gt;</text>
        
        {/* Code Lines with animation */}
        {[70, 100, 130, 160, 190, 220, 250, 280].map((y, i) => (
          <g key={i}>
            <line x1="30" y1={y} x2={140 + i * 20} y2={y} stroke="#FF6B00" strokeWidth="2" opacity="0.4">
              <animate attributeName="opacity" values="0.4;0.7;0.4" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
            </line>
          </g>
        ))}
        
        {/* Cursor blink */}
        <rect x="180" y="270" width="3" height="20" fill="#FF6B00" opacity="0.8">
          <animate attributeName="opacity" values="0.8;0;0.8" dur="1s" repeatCount="indefinite" />
        </rect>
      </g>

      {/* Code fragments floating */}
      <g opacity="0.3" fontFamily="monospace" fill="#FF6B00" fontSize="16">
        {[
          { text: '<div>', x: 100, y: 150, dur: '12s' },
          { text: 'function()', x: 250, y: 100, dur: '14s' },
          { text: 'const', x: 400, y: 180, dur: '16s' },
          { text: 'return', x: 150, y: 300, dur: '13s' },
          { text: '{...}', x: 80, y: 500, dur: '15s' },
          { text: 'import', x: 1700, y: 150, dur: '11s' },
          { text: 'export', x: 1550, y: 220, dur: '14s' },
          { text: '( ) =>', x: 1800, y: 180, dur: '13s' },
        ].map((item, i) => (
          <text key={i} x={item.x} y={item.y} opacity="0.5">
            <animate attributeName="y" values={`${item.y};1100`} dur={item.dur} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;0.8;0.5" dur="3s" repeatCount="indefinite" />
            {item.text}
          </text>
        ))}
      </g>

      {/* Circuit lines with glow */}
      <g filter="url(#webGlowFilter)" stroke="#FF6B00" strokeWidth="1.5" opacity="0.4">
        <path d="M0,350 H220 L260,310 H420 L460,350 H640">
          <animate attributeName="stroke-dasharray" values="0,1000;600,400;1000,0" dur="4s" repeatCount="indefinite" />
        </path>
        <path d="M0,550 H180 L220,600 H360 L400,550 H580 L620,600 H800">
          <animate attributeName="stroke-dasharray" values="0,1200;700,500;1200,0" dur="5s" repeatCount="indefinite" />
        </path>
        <path d="M1920,280 H1750 L1710,320 H1560 L1520,280 H1350">
          <animate attributeName="stroke-dasharray" values="0,800;450,350;800,0" dur="3.5s" repeatCount="indefinite" />
        </path>
        <path d="M1920,450 H1800 L1760,490 H1620 L1580,450 H1440">
          <animate attributeName="stroke-dasharray" values="0,900;500,400;900,0" dur="4.5s" repeatCount="indefinite" />
        </path>
        <path d="M400,800 L500,750 L600,800 L700,750">
          <animate attributeName="stroke-dasharray" values="0,500;300,200;500,0" dur="3s" repeatCount="indefinite" />
        </path>
      </g>

      {/* Connection nodes with glow */}
      <g filter="url(#webGlowFilter)">
        {[
          [220, 350], [460, 350], [220, 600], [400, 550],
          [1710, 320], [1520, 280], [1760, 490], [1580, 450],
          [500, 750], [700, 750]
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

      {/* HTML tags grid */}
      <g filter="url(#webGlowFilter)" opacity="0.25" fontSize="12" fontFamily="monospace" fill="#FF6B00">
        {['<html>', '<body>', '<div>', '<span>', '<h1>', '<p>'].map((tag, i) => (
          <text key={i} x={100 + (i % 3) * 150} y={700 + Math.floor(i / 3) * 50}>
            <animate attributeName="opacity" values="0.3;0.6;0.3" dur={`${3 + i * 0.5}s`} repeatCount="indefinite" />
            {tag}
          </text>
        ))}
      </g>

      {/* Bracket animations */}
      <g filter="url(#webGlowFilter)" opacity="0.3">
        {[...Array(6)].map((_, i) => (
          <g key={i}>
            <path
              d={`M${1100 + (i % 3) * 100},${650 + Math.floor(i / 3) * 80} q-15,-15 -15,-30 q0,-15 15,-30`}
              fill="none"
              stroke="#FF6B00"
              strokeWidth="2"
            >
              <animate attributeName="opacity" values="0.3;0.6;0.3" dur={`${2.5 + i * 0.4}s`} repeatCount="indefinite" />
            </path>
          </g>
        ))}
      </g>

      {/* Scan line effect */}
      <rect x="0" y="0" width="1920" height="4" fill="#FF6B00" opacity="0.15">
        <animate attributeName="y" values="0;1080;0" dur="6s" repeatCount="indefinite" />
      </rect>

      {/* Bottom glow */}
      <ellipse cx="960" cy="1100" rx="800" ry="200" fill="url(#webGlow)" opacity="0.2" />
    </svg>
  );
};

export default WebDevSVG;