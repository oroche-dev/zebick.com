import React from 'react';

const AppDevSVG = () => {
  return (
    <svg
      className="hero-svg"
      viewBox="0 0 1920 1080"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id="appGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.7" />
          <stop offset="50%" stopColor="#FF6B00" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#FF6B00" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="phoneGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#FF6B00" stopOpacity="0.1" />
        </linearGradient>
        <filter id="appGlowFilter" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="10" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Large ambient glow */}
      <circle cx="1400" cy="400" r="350" fill="url(#appGlow)" opacity="0.4">
        <animate attributeName="r" values="350;400;350" dur="8s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.4;0.6;0.4" dur="8s" repeatCount="indefinite" />
      </circle>

      {/* Mobile Phone - Large */}
      <g transform="translate(1270, 120)" filter="url(#appGlowFilter)">
        <rect x="0" y="0" width="250" height="500" rx="30" fill="url(#phoneGradient)" stroke="#FF6B00" strokeWidth="3" opacity="0.6">
          <animate attributeName="opacity" values="0.6;0.9;0.6" dur="4s" repeatCount="indefinite" />
        </rect>
        
        {/* Screen */}
        <rect x="18" y="50" width="214" height="400" rx="15" fill="#FF6B00" opacity="0.15" />
        
        {/* Notch */}
        <rect x="75" y="12" width="100" height="25" rx="12" fill="#FF6B00" opacity="0.3" />
        
        {/* App Icons Grid - Animated */}
        {[...Array(12)].map((_, i) => (
          <rect
            key={i}
            x={40 + (i % 3) * 70}
            y={100 + Math.floor(i / 3) * 70}
            width="45"
            height="45"
            rx="10"
            fill="none"
            stroke="#FF6B00"
            strokeWidth="2"
            opacity="0.5"
          >
            <animate attributeName="opacity" values="0.5;0.8;0.5" dur={`${2 + i * 0.2}s`} repeatCount="indefinite" />
          </rect>
        ))}
        
        {/* Status bar */}
        <line x1="180" y1="25" x2="215" y2="25" stroke="#FF6B00" strokeWidth="2" opacity="0.6" />
        <circle cx="165" cy="25" r="4" fill="#FF6B00" opacity="0.7">
          <animate attributeName="opacity" values="0.7;1;0.7" dur="1.5s" repeatCount="indefinite" />
        </circle>
        
        {/* Home indicator */}
        <rect x="100" y="470" width="50" height="5" rx="2.5" fill="#FF6B00" opacity="0.5" />
      </g>

      {/* Notification waves */}
      <g filter="url(#appGlowFilter)">
        {[0, 1, 2].map((i) => (
          <circle
            key={i}
            cx="1395"
            cy="220"
            r={30 + i * 25}
            fill="none"
            stroke="#FF6B00"
            strokeWidth="2"
            opacity="0.4"
          >
            <animate attributeName="r" values={`${30 + i * 25};${80 + i * 25}`} dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0;0.4" dur="3s" repeatCount="indefinite" />
          </circle>
        ))}
      </g>

      {/* App data streams */}
      <g opacity="0.3" fontSize="14" fontFamily="monospace" fill="#FF6B00">
        {[
          { text: 'iOS', x: 100, y: 150, dur: '11s' },
          { text: 'Android', x: 250, y: 100, dur: '13s' },
          { text: 'Swift', x: 150, y: 250, dur: '12s' },
          { text: 'Kotlin', x: 80, y: 450, dur: '14s' },
          { text: 'React Native', x: 1700, y: 150, dur: '10s' },
          { text: 'Flutter', x: 1800, y: 220, dur: '15s' },
          { text: 'API', x: 1600, y: 320, dur: '13s' },
        ].map((item, i) => (
          <text key={i} x={item.x} y={item.y}>
            <animate attributeName="y" values={`${item.y};1100`} dur={item.dur} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;0.8;0.5" dur="3s" repeatCount="indefinite" />
            {item.text}
          </text>
        ))}
      </g>

      {/* Connection lines */}
      <g filter="url(#appGlowFilter)" stroke="#FF6B00" strokeWidth="1.5" opacity="0.4">
        <path d="M0,350 H200 L240,310 H400 L440,350 H620">
          <animate attributeName="stroke-dasharray" values="0,1000;600,400;1000,0" dur="4s" repeatCount="indefinite" />
        </path>
        <path d="M0,550 H160 L200,600 H340 L380,550 H560 L600,600 H780">
          <animate attributeName="stroke-dasharray" values="0,1200;700,500;1200,0" dur="5s" repeatCount="indefinite" />
        </path>
        <path d="M1920,280 H1750 L1710,320 H1560 L1520,280 H1350">
          <animate attributeName="stroke-dasharray" values="0,800;450,350;800,0" dur="3.5s" repeatCount="indefinite" />
        </path>
        <path d="M1920,620 H1750 L1700,670 H1550">
          <animate attributeName="stroke-dasharray" values="0,600;350,250;600,0" dur="4s" repeatCount="indefinite" />
        </path>
      </g>

      {/* Connection nodes */}
      <g filter="url(#appGlowFilter)">
        {[
          [200, 350], [440, 350], [200, 600], [380, 550],
          [1710, 320], [1520, 280], [1700, 670]
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

      {/* Touch gesture circles */}
      <g filter="url(#appGlowFilter)" opacity="0.25">
        {[...Array(8)].map((_, i) => (
          <circle
            key={i}
            cx={1100 + (i % 4) * 100}
            cy={650 + Math.floor(i / 4) * 120}
            r="35"
            fill="none"
            stroke="#FF6B00"
            strokeWidth="2"
          >
            <animate attributeName="r" values="35;45;35" dur={`${3 + i * 0.4}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;0.6;0.3" dur={`${3 + i * 0.4}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </g>

      {/* Scan line effect */}
      <rect x="0" y="0" width="1920" height="4" fill="#FF6B00" opacity="0.15">
        <animate attributeName="y" values="0;1080;0" dur="6s" repeatCount="indefinite" />
      </rect>

      {/* Bottom glow */}
      <ellipse cx="960" cy="1100" rx="800" ry="200" fill="url(#appGlow)" opacity="0.2" />
    </svg>
  );
};

export default AppDevSVG;