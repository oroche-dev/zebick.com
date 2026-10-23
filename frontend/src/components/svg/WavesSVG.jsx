import React from 'react';

const WavesSVG = () => {
  return (
    <svg
      className="hero-svg"
      viewBox="0 0 1920 1080"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#FF6B00" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Animated Waves */}
      {[0, 1, 2, 3, 4].map((i) => (
        <path
          key={i}
          d={`M0,${400 + i * 80} Q480,${300 + i * 80} 960,${400 + i * 80} T1920,${400 + i * 80} V1080 H0 Z`}
          fill="url(#waveGradient)"
          opacity={0.15 - i * 0.02}
        >
          <animate
            attributeName="d"
            values={
              `M0,${400 + i * 80} Q480,${300 + i * 80} 960,${400 + i * 80} T1920,${400 + i * 80} V1080 H0 Z;` +
              `M0,${400 + i * 80} Q480,${500 + i * 80} 960,${400 + i * 80} T1920,${400 + i * 80} V1080 H0 Z;` +
              `M0,${400 + i * 80} Q480,${300 + i * 80} 960,${400 + i * 80} T1920,${400 + i * 80} V1080 H0 Z`
            }
            dur={`${8 + i * 2}s`}
            repeatCount="indefinite"
          />
        </path>
      ))}

      {/* Floating Dots */}
      {[...Array(30)].map((_, i) => {
        const x = Math.random() * 1920;
        const y = Math.random() * 600 + 200;
        
        return (
          <circle
            key={`dot${i}`}
            cx={x}
            cy={y}
            r="3"
            fill="#FF6B00"
            opacity="0.4"
          >
            <animate
              attributeName="cy"
              values={`${y};${y - 50};${y}`}
              dur={`${6 + Math.random() * 4}s`}
              repeatCount="indefinite"
            />
          </circle>
        );
      })}
    </svg>
  );
};

export default WavesSVG;