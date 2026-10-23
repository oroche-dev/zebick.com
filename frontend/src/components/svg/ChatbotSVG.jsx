import React from 'react';

const ChatbotSVG = () => {
  return (
    <svg
      className="hero-svg"
      viewBox="0 0 1920 1080"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id="botGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#FF6B00" stopOpacity="0" />
        </radialGradient>
        <filter id="botGlowFilter">
          <feGaussianBlur stdDeviation="10" />
        </filter>
      </defs>

      <circle cx="1400" cy="400" r="350" fill="url(#botGlow)" opacity="0.4">
        <animate attributeName="r" values="350;400;350" dur="8s" repeatCount="indefinite" />
      </circle>

      {/* Robot Head */}
      <g transform="translate(1250, 180)" filter="url(#botGlowFilter)">
        {/* Head */}
        <rect x="50" y="50" width="200" height="200" rx="20" fill="none" stroke="#FF6B00" strokeWidth="3" opacity="0.6">
          <animate attributeName="opacity" values="0.6;0.9;0.6" dur="4s" repeatCount="indefinite" />
        </rect>
        
        {/* Antenna */}
        <line x1="150" y1="20" x2="150" y2="50" stroke="#FF6B00" strokeWidth="2" opacity="0.5" />
        <circle cx="150" cy="15" r="8" fill="#FF6B00" opacity="0.7">
          <animate attributeName="opacity" values="0.7;1;0.7" dur="1.5s" repeatCount="indefinite" />
        </circle>
        
        {/* Eyes */}
        <circle cx="110" cy="120" r="20" fill="none" stroke="#FF6B00" strokeWidth="2" opacity="0.8">
          <animate attributeName="r" values="20;22;20" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="190" cy="120" r="20" fill="none" stroke="#FF6B00" strokeWidth="2" opacity="0.8">
          <animate attributeName="r" values="20;22;20" dur="2s" repeatCount="indefinite" />
        </circle>
        
        {/* Pupils */}
        <circle cx="110" cy="120" r="8" fill="#FF6B00" opacity="0.9" />
        <circle cx="190" cy="120" r="8" fill="#FF6B00" opacity="0.9" />
        
        {/* Mouth - Chat Bars */}
        <line x1="90" y1="190" x2="140" y2="190" stroke="#FF6B00" strokeWidth="3" opacity="0.6" />
        <line x1="160" y1="190" x2="210" y2="190" stroke="#FF6B00" strokeWidth="3" opacity="0.6" />
      </g>

      {/* Chat Bubbles */}
      <g filter="url(#botGlowFilter)">
        {[0, 1, 2].map((i) => (
          <g key={i} opacity="0.4">
            <rect
              x={1100 + i * 100}
              y={600 + i * 50}
              width="80"
              height="40"
              rx="20"
              fill="none"
              stroke="#FF6B00"
              strokeWidth="2"
            >
              <animate attributeName="opacity" values="0.4;0.7;0.4" dur={`${2 + i}s`} repeatCount="indefinite" />
            </rect>
            <line
              x1={1120 + i * 100}
              y1={620 + i * 50}
              x2={1160 + i * 100}
              y2={620 + i * 50}
              stroke="#FF6B00"
              strokeWidth="1.5"
              opacity="0.5"
            />
          </g>
        ))}
      </g>

      {/* Message particles */}
      <g opacity="0.3" fontSize="14" fontFamily="monospace" fill="#FF6B00">
        {['Hello', 'Hi!', '...', 'OK'].map((text, i) => (
          <text key={i} x={200 + i * 150} y={150 + i * 80}>
            <animate attributeName="y" values={`${150 + i * 80};1100`} dur={`${10 + i * 2}s`} repeatCount="indefinite" />
            {text}
          </text>
        ))}
      </g>
    </svg>
  );
};

export default ChatbotSVG;