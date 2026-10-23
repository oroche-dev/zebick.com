import React from 'react';

const ModernParticlesSVG = () => {
  return (
    <svg
      className="hero-svg"
      viewBox="0 0 1920 1080"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id="particleGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#FF6B00" stopOpacity="0" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Floating Particles */}
      {[...Array(40)].map((_, i) => {
        const x = Math.random() * 1920;
        const y = Math.random() * 1080;
        const size = Math.random() * 4 + 2;
        const duration = Math.random() * 10 + 15;
        const delay = Math.random() * 5;
        
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={size}
            fill="#FF6B00"
            opacity={Math.random() * 0.5 + 0.3}
            filter="url(#glow)"
          >
            <animate
              attributeName="cy"
              values={`${y};${y - 100};${y}`}
              dur={`${duration}s`}
              repeatCount="indefinite"
              begin={`${delay}s`}
            />
            <animate
              attributeName="opacity"
              values="0.3;0.8;0.3"
              dur={`${duration * 0.5}s`}
              repeatCount="indefinite"
              begin={`${delay}s`}
            />
          </circle>
        );
      })}

      {/* Connecting Lines */}
      {[...Array(20)].map((_, i) => {
        const x1 = Math.random() * 1920;
        const y1 = Math.random() * 1080;
        const x2 = x1 + (Math.random() * 400 - 200);
        const y2 = y1 + (Math.random() * 400 - 200);
        
        return (
          <line
            key={`line${i}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#FF6B00"
            strokeWidth="1"
            opacity="0.2"
          >
            <animate
              attributeName="opacity"
              values="0.1;0.3;0.1"
              dur="4s"
              repeatCount="indefinite"
              begin={`${i * 0.2}s`}
            />
          </line>
        );
      })}

      {/* Orbital Rings */}
      {[300, 500, 700].map((r, i) => (
        <circle
          key={`ring${i}`}
          cx="960"
          cy="540"
          r={r}
          fill="none"
          stroke="#FF6B00"
          strokeWidth="1"
          opacity="0.1"
        >
          <animate
            attributeName="r"
            values={`${r};${r + 50};${r}`}
            dur={`${8 + i * 2}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}
    </svg>
  );
};

export default ModernParticlesSVG;