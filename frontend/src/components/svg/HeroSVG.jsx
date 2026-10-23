import React from 'react';

const HeroSVG = () => {
  return (
    <svg
      className="hero-svg"
      viewBox="0 0 1920 1080"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id="heroGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.4" />
          <stop offset="70%" stopColor="#FF6B00" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#FF6B00" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FF6B00" stopOpacity="0" />
          <stop offset="50%" stopColor="#FF6B00" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#FF6B00" stopOpacity="0" />
        </linearGradient>

        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="softGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="12" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background Glow - Rechts */}
      <circle cx="1600" cy="350" r="400" fill="url(#heroGlow)" opacity="0.6">
        <animate attributeName="r" values="400;450;400" dur="8s" repeatCount="indefinite" />
      </circle>
      
      {/* Background Glow - Unten */}
      <circle cx="1200" cy="900" r="300" fill="url(#heroGlow)" opacity="0.3">
        <animate attributeName="r" values="300;350;300" dur="10s" repeatCount="indefinite" />
      </circle>

      {/* === HAUPTELEMENT: Code Editor Window - Rechts oben === */}
      <g transform="translate(1050, 80)" filter="url(#glow)">
        <rect x="0" y="0" width="420" height="280" rx="10" fill="rgba(15, 15, 15, 0.8)" stroke="#FF6B00" strokeWidth="1.5" opacity="0.9">
          <animate attributeName="opacity" values="0.85;1;0.85" dur="3s" repeatCount="indefinite" />
        </rect>
        
        {/* Window Header */}
        <rect x="0" y="0" width="420" height="30" rx="10" fill="rgba(255, 107, 0, 0.15)" />
        <rect x="0" y="15" width="420" height="15" fill="rgba(255, 107, 0, 0.15)" />
        <circle cx="18" cy="15" r="5" fill="#FF6B00" opacity="0.9" />
        <circle cx="36" cy="15" r="5" fill="#FF6B00" opacity="0.5" />
        <circle cx="54" cy="15" r="5" fill="#FF6B00" opacity="0.3" />
        
        {/* Tab */}
        <rect x="80" y="8" width="100" height="18" rx="3" fill="rgba(255, 107, 0, 0.2)" />
        <text x="95" y="20" fill="#FF6B00" fontSize="9" fontFamily="monospace">index.jsx</text>
        
        {/* Code Content */}
        <g transform="translate(15, 45)">
          <text x="0" y="0" fill="#FF6B00" fontSize="12" fontFamily="monospace" opacity="0.7">1</text>
          <text x="25" y="0" fill="#FF8A33" fontSize="12" fontFamily="monospace">import</text>
          <text x="75" y="0" fill="#FFF" fontSize="12" fontFamily="monospace" opacity="0.8">React</text>
          <text x="115" y="0" fill="#FF8A33" fontSize="12" fontFamily="monospace">from</text>
          <text x="155" y="0" fill="#FF6B00" fontSize="12" fontFamily="monospace">'react'</text>
          
          <text x="0" y="22" fill="#FF6B00" fontSize="12" fontFamily="monospace" opacity="0.7">2</text>
          <text x="25" y="22" fill="#FFF" fontSize="12" fontFamily="monospace" opacity="0.5"></text>
          
          <text x="0" y="44" fill="#FF6B00" fontSize="12" fontFamily="monospace" opacity="0.7">3</text>
          <text x="25" y="44" fill="#FF8A33" fontSize="12" fontFamily="monospace">const</text>
          <text x="65" y="44" fill="#FFF" fontSize="12" fontFamily="monospace">App</text>
          <text x="95" y="44" fill="#FF6B00" fontSize="12" fontFamily="monospace">= () =&gt; {'{'}</text>
          
          <text x="0" y="66" fill="#FF6B00" fontSize="12" fontFamily="monospace" opacity="0.7">4</text>
          <text x="25" y="66" fill="#FF8A33" fontSize="12" fontFamily="monospace">  return</text>
          <text x="85" y="66" fill="#FFF" fontSize="12" fontFamily="monospace">(</text>
          
          <text x="0" y="88" fill="#FF6B00" fontSize="12" fontFamily="monospace" opacity="0.7">5</text>
          <text x="25" y="88" fill="#FF6B00" fontSize="12" fontFamily="monospace">    {'<div>'}</text>
          
          <text x="0" y="110" fill="#FF6B00" fontSize="12" fontFamily="monospace" opacity="0.7">6</text>
          <text x="25" y="110" fill="#FFF" fontSize="12" fontFamily="monospace" opacity="0.8">      Hello World</text>
          
          <text x="0" y="132" fill="#FF6B00" fontSize="12" fontFamily="monospace" opacity="0.7">7</text>
          <text x="25" y="132" fill="#FF6B00" fontSize="12" fontFamily="monospace">    {'</div>'}</text>
          
          {/* Blinkender Cursor */}
          <rect x="100" y="122" width="8" height="14" fill="#FF6B00">
            <animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite" />
          </rect>
        </g>
      </g>

      {/* === Terminal Window - Rechts unten === */}
      <g transform="translate(1150, 420)" filter="url(#glow)">
        <rect x="0" y="0" width="350" height="180" rx="8" fill="rgba(15, 15, 15, 0.75)" stroke="#FF6B00" strokeWidth="1" opacity="0.8">
          <animate attributeName="y" values="0;5;0" dur="6s" repeatCount="indefinite" />
        </rect>
        
        {/* Terminal Header */}
        <rect x="0" y="0" width="350" height="25" rx="8" fill="rgba(255, 107, 0, 0.12)" />
        <rect x="0" y="12" width="350" height="13" fill="rgba(255, 107, 0, 0.12)" />
        <text x="15" y="17" fill="#FF6B00" fontSize="10" fontFamily="monospace" opacity="0.8">terminal</text>
        
        {/* Terminal Content */}
        <g transform="translate(12, 40)">
          <text x="0" y="0" fill="#FF6B00" fontSize="11" fontFamily="monospace">$</text>
          <text x="15" y="0" fill="#FFF" fontSize="11" fontFamily="monospace" opacity="0.7">npm run build</text>
          
          <text x="0" y="22" fill="#FFF" fontSize="10" fontFamily="monospace" opacity="0.5">Creating optimized build...</text>
          
          <text x="0" y="44" fill="#FF6B00" fontSize="11" fontFamily="monospace">✓</text>
          <text x="15" y="44" fill="#FFF" fontSize="10" fontFamily="monospace" opacity="0.6">Compiled successfully!</text>
          
          <text x="0" y="66" fill="#FF6B00" fontSize="11" fontFamily="monospace">$</text>
          <rect x="15" y="56" width="6" height="12" fill="#FF6B00">
            <animate attributeName="opacity" values="1;0;1" dur="0.8s" repeatCount="indefinite" />
          </rect>
        </g>
      </g>

      {/* === Browser Preview - Unten Mitte === */}
      <g transform="translate(750, 620)" filter="url(#glow)">
        <rect x="0" y="0" width="320" height="200" rx="8" fill="rgba(15, 15, 15, 0.7)" stroke="#FF6B00" strokeWidth="1" opacity="0.7">
          <animate attributeName="y" values="0;-8;0" dur="7s" repeatCount="indefinite" />
        </rect>
        
        {/* Browser Header */}
        <rect x="0" y="0" width="320" height="28" rx="8" fill="rgba(255, 107, 0, 0.1)" />
        <rect x="0" y="14" width="320" height="14" fill="rgba(255, 107, 0, 0.1)" />
        <circle cx="16" cy="14" r="4" fill="#FF6B00" opacity="0.7" />
        <circle cx="30" cy="14" r="4" fill="#FF6B00" opacity="0.4" />
        <circle cx="44" cy="14" r="4" fill="#FF6B00" opacity="0.2" />
        <rect x="70" y="8" width="180" height="12" rx="3" fill="rgba(255,255,255,0.08)" />
        <text x="80" y="17" fill="#FF6B00" fontSize="8" fontFamily="monospace" opacity="0.6">localhost:3000</text>
        
        {/* Preview Content */}
        <rect x="20" y="45" width="120" height="14" rx="2" fill="#FF6B00" opacity="0.5" />
        <rect x="20" y="68" width="200" height="8" rx="2" fill="#FF6B00" opacity="0.2" />
        <rect x="20" y="82" width="180" height="8" rx="2" fill="#FF6B00" opacity="0.2" />
        <rect x="20" y="96" width="160" height="8" rx="2" fill="#FF6B00" opacity="0.2" />
        <rect x="20" y="120" width="80" height="28" rx="4" fill="#FF6B00" opacity="0.4">
          <animate attributeName="opacity" values="0.4;0.6;0.4" dur="2s" repeatCount="indefinite" />
        </rect>
      </g>

      {/* === Floating Tech Symbols === */}
      
      {/* React Symbol - Links */}
      <g transform="translate(1550, 650)" filter="url(#glow)">
        <ellipse cx="0" cy="0" rx="35" ry="12" fill="none" stroke="#FF6B00" strokeWidth="1.5" opacity="0.5">
          <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="8s" repeatCount="indefinite" />
        </ellipse>
        <ellipse cx="0" cy="0" rx="35" ry="12" fill="none" stroke="#FF6B00" strokeWidth="1.5" opacity="0.5" transform="rotate(60)">
          <animateTransform attributeName="transform" type="rotate" from="60" to="420" dur="8s" repeatCount="indefinite" />
        </ellipse>
        <ellipse cx="0" cy="0" rx="35" ry="12" fill="none" stroke="#FF6B00" strokeWidth="1.5" opacity="0.5" transform="rotate(120)">
          <animateTransform attributeName="transform" type="rotate" from="120" to="480" dur="8s" repeatCount="indefinite" />
        </ellipse>
        <circle cx="0" cy="0" r="6" fill="#FF6B00" opacity="0.8">
          <animate attributeName="r" values="6;8;6" dur="2s" repeatCount="indefinite" />
        </circle>
      </g>

      {/* Node/Server Symbol */}
      <g transform="translate(1700, 480)" opacity="0.6">
        <rect x="-25" y="-30" width="50" height="60" rx="4" fill="none" stroke="#FF6B00" strokeWidth="1.5" />
        <line x1="-20" y1="-15" x2="20" y2="-15" stroke="#FF6B00" strokeWidth="1" opacity="0.5" />
        <line x1="-20" y1="0" x2="20" y2="0" stroke="#FF6B00" strokeWidth="1" opacity="0.5" />
        <line x1="-20" y1="15" x2="20" y2="15" stroke="#FF6B00" strokeWidth="1" opacity="0.5" />
        <circle cx="15" cy="-15" r="3" fill="#FF6B00" opacity="0.8">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="15" cy="0" r="3" fill="#FF6B00" opacity="0.6">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" begin="0.5s" />
        </circle>
        <circle cx="15" cy="15" r="3" fill="#FF6B00" opacity="0.4">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="2.5s" repeatCount="indefinite" begin="1s" />
        </circle>
      </g>

      {/* Git Branch Symbol */}
      <g transform="translate(980, 450)" filter="url(#glow)" opacity="0.5">
        <circle cx="0" cy="0" r="6" fill="#FF6B00" />
        <line x1="0" y1="6" x2="0" y2="40" stroke="#FF6B00" strokeWidth="2" />
        <circle cx="0" cy="46" r="6" fill="#FF6B00" />
        <path d="M0,20 Q20,20 25,35" fill="none" stroke="#FF6B00" strokeWidth="2" />
        <circle cx="28" cy="40" r="5" fill="#FF6B00" opacity="0.7" />
      </g>

      {/* === Verbindungslinien === */}
      <g filter="url(#softGlow)" opacity="0.4">
        <line x1="1050" y1="220" x2="980" y2="420" stroke="url(#lineGrad)" strokeWidth="1" strokeDasharray="5,5">
          <animate attributeName="stroke-dashoffset" values="0;10" dur="1s" repeatCount="indefinite" />
        </line>
        <line x1="1150" y1="600" x2="1070" y2="620" stroke="url(#lineGrad)" strokeWidth="1" strokeDasharray="5,5">
          <animate attributeName="stroke-dashoffset" values="0;10" dur="1s" repeatCount="indefinite" />
        </line>
        <line x1="1470" y1="360" x2="1540" y2="620" stroke="url(#lineGrad)" strokeWidth="1" strokeDasharray="5,5">
          <animate attributeName="stroke-dashoffset" values="0;10" dur="1s" repeatCount="indefinite" />
        </line>
      </g>

      {/* === Code Symbole verteilt === */}
      <g filter="url(#glow)" opacity="0.4">
        <text x="1750" y="200" fill="#FF6B00" fontSize="50" fontFamily="monospace" fontWeight="200">{'{ }'}</text>
        <text x="1600" y="850" fill="#FF6B00" fontSize="35" fontFamily="monospace" fontWeight="200">{'</>'}</text>
        <text x="950" y="850" fill="#FF6B00" fontSize="30" fontFamily="monospace" fontWeight="200">{'( )'}</text>
      </g>

      {/* === Floating Particles === */}
      {[...Array(15)].map((_, i) => (
        <circle
          key={`particle-${i}`}
          cx={900 + (i % 5) * 200}
          cy={100 + Math.floor(i / 5) * 300}
          r="2"
          fill="#FF6B00"
          opacity="0.4"
          filter="url(#glow)"
        >
          <animate
            attributeName="cy"
            values={`${100 + Math.floor(i / 5) * 300};${130 + Math.floor(i / 5) * 300};${100 + Math.floor(i / 5) * 300}`}
            dur={`${4 + (i % 3)}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.3;0.7;0.3"
            dur={`${3 + (i % 2)}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}

      {/* === Subtle Grid rechts === */}
      <g opacity="0.08">
        {[...Array(8)].map((_, i) => (
          <line key={`vgrid-${i}`} x1={1000 + i * 120} y1="50" x2={1000 + i * 120} y2="900" stroke="#FF6B00" strokeWidth="0.5" />
        ))}
        {[...Array(10)].map((_, i) => (
          <line key={`hgrid-${i}`} x1="950" y1={50 + i * 90} x2="1920" y2={50 + i * 90} stroke="#FF6B00" strokeWidth="0.5" />
        ))}
      </g>

      {/* Corner Accent */}
      <ellipse cx="1920" cy="0" rx="300" ry="200" fill="url(#heroGlow)" opacity="0.3" />
    </svg>
  );
};

export default HeroSVG;
