import React from 'react';

const ServerSVG = () => {
  return (
    <svg
      className="hero-svg"
      viewBox="0 0 1920 1080"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id="serverGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#FF6B00" stopOpacity="0" />
        </radialGradient>
        <filter id="serverGlowFilter">
          <feGaussianBlur stdDeviation="10" />
        </filter>
      </defs>

      <circle cx="1400" cy="400" r="350" fill="url(#serverGlow)" opacity="0.4">
        <animate attributeName="r" values="350;400;350" dur="8s" repeatCount="indefinite" />
      </circle>

      {/* Server Rack */}
      <g transform="translate(1250, 150)" filter="url(#serverGlowFilter)">
        {/* Rack Frame */}
        <rect x="0" y="0" width="300" height="400" rx="10" fill="none" stroke="#FF6B00" strokeWidth="3" opacity="0.5" />
        
        {/* Server Units */}
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <rect
              x="20"
              y={30 + i * 70}
              width="260"
              height="50"
              rx="5"
              fill="none"
              stroke="#FF6B00"
              strokeWidth="2"
              opacity="0.6"
            >
              <animate attributeName="opacity" values="0.6;0.9;0.6" dur={`${3 + i * 0.5}s`} repeatCount="indefinite" />
            </rect>
            
            {/* Status Lights */}
            <circle cx="40" cy={55 + i * 70} r="4" fill="#FF6B00" opacity="0.8">
              <animate attributeName="opacity" values="0.8;1;0.8" dur={`${1 + i * 0.2}s`} repeatCount="indefinite" />
            </circle>
            <circle cx="60" cy={55 + i * 70} r="4" fill="#FF6B00" opacity="0.6">
              <animate attributeName="opacity" values="0.6;0.9;0.6" dur={`${1.5 + i * 0.2}s`} repeatCount="indefinite" />
            </circle>
            
            {/* Server Lines */}
            <line x1="80" y1={50 + i * 70} x2="250" y2={50 + i * 70} stroke="#FF6B00" strokeWidth="1" opacity="0.4" />
            <line x1="80" y1={60 + i * 70} x2="220" y2={60 + i * 70} stroke="#FF6B00" strokeWidth="1" opacity="0.4" />
          </g>
        ))}
      </g>

      {/* Network connections */}
      <g stroke="#FF6B00" strokeWidth="1.5" opacity="0.3" filter="url(#serverGlowFilter)">
        {[0, 1, 2, 3].map((i) => (
          <path
            key={i}
            d={`M${1100 + i * 50},${500 + i * 50} Q${1300},${400} ${1400},${300 + i * 40}`}
            fill="none"
          >
            <animate attributeName="stroke-dasharray" values="0,500;500,0" dur={`${4 + i}s`} repeatCount="indefinite" />
          </path>
        ))}
      </g>

      {/* Data flow particles */}
      <g filter="url(#serverGlowFilter)">
        {[...Array(8)].map((_, i) => (
          <circle
            key={i}
            cx={1100 + (i % 4) * 80}
            cy={600 + Math.floor(i / 4) * 100}
            r="3"
            fill="#FF6B00"
            opacity="0.5"
          >
            <animate attributeName="cy" values={`${600 + Math.floor(i / 4) * 100};${200}`} dur={`${3 + i * 0.5}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;0;0.5" dur={`${3 + i * 0.5}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </g>
    </svg>
  );
};

export default ServerSVG;