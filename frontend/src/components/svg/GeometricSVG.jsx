import React from 'react';

const GeometricSVG = () => {
  return (
    <svg
      className="hero-svg"
      viewBox="0 0 1920 1080"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="geomGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#FF6B00" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Rotating Hexagons */}
      {[200, 400, 600].map((size, i) => (
        <g key={`hex${i}`} transform={`translate(1500, 300)`}>
          <polygon
            points={`${size * 0.866},${size * 0.5} ${size * 0.866},${-size * 0.5} 0,${-size} ${-size * 0.866},${-size * 0.5} ${-size * 0.866},${size * 0.5} 0,${size}`}
            fill="none"
            stroke="#FF6B00"
            strokeWidth="2"
            opacity={0.3 - i * 0.08}
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0"
              to="360"
              dur={`${20 + i * 10}s`}
              repeatCount="indefinite"
            />
          </polygon>
        </g>
      ))}

      {/* Triangles */}
      {[...Array(15)].map((_, i) => {
        const x = Math.random() * 1920;
        const y = Math.random() * 1080;
        const size = Math.random() * 60 + 40;
        
        return (
          <polygon
            key={`tri${i}`}
            points={`${x},${y - size} ${x + size * 0.866},${y + size * 0.5} ${x - size * 0.866},${y + size * 0.5}`}
            fill="url(#geomGradient)"
            opacity="0.1"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from={`0 ${x} ${y}`}
              to={`360 ${x} ${y}`}
              dur={`${15 + Math.random() * 10}s`}
              repeatCount="indefinite"
            />
          </polygon>
        );
      })}

      {/* Grid Lines */}
      {[...Array(10)].map((_, i) => (
        <g key={`grid${i}`}>
          <line
            x1="0"
            y1={i * 120}
            x2="1920"
            y2={i * 120}
            stroke="#FF6B00"
            strokeWidth="0.5"
            opacity="0.1"
          />
          <line
            x1={i * 192}
            y1="0"
            x2={i * 192}
            y2="1080"
            stroke="#FF6B00"
            strokeWidth="0.5"
            opacity="0.1"
          />
        </g>
      ))}
    </svg>
  );
};

export default GeometricSVG;