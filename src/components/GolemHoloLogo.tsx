import React from 'react';

interface GolemHoloLogoProps {
  size?: number;
  glow?: boolean;
}

export const GolemHoloLogo: React.FC<GolemHoloLogoProps> = ({ size = 72, glow = true }) => {
  return (
    <div 
      className="relative flex items-center justify-center select-none"
      style={{ width: size, height: size }}
    >
      {/* Outer ambient glow */}
      {glow && (
        <div 
          className="absolute inset-0 rounded-full blur-xl opacity-60 bg-cyan-400 animate-pulse pointer-events-none"
          style={{ transform: 'scale(0.85)' }}
        />
      )}

      {/* Holographic Polygonal Stone Facet SVG */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 drop-shadow-[0_0_12px_rgba(0,240,255,0.7)]"
      >
        <defs>
          <linearGradient id="facetStoneGrad" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#0369a1" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.3" />
          </linearGradient>

          <linearGradient id="obsidianFacetGrad" x1="90" y1="10" x2="10" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0f172a" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#020617" stopOpacity="0.95" />
          </linearGradient>
        </defs>

        {/* Outer Faceted Octagon Border */}
        <polygon
          points="25,4 75,4 96,25 96,75 75,96 25,96 4,75 4,25"
          fill="url(#obsidianFacetGrad)"
          stroke="#00f0ff"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Inner Crystalline Facets */}
        {/* Top facet */}
        <polygon points="25,4 75,4 50,30" fill="url(#facetStoneGrad)" opacity="0.45" />
        {/* Right facet */}
        <polygon points="75,4 96,25 68,50 50,30" fill="url(#facetStoneGrad)" opacity="0.3" />
        {/* Bottom-right facet */}
        <polygon points="96,75 75,96 50,70 68,50" fill="url(#facetStoneGrad)" opacity="0.5" />
        {/* Bottom facet */}
        <polygon points="75,96 25,96 50,70" fill="url(#facetStoneGrad)" opacity="0.6" />
        {/* Bottom-left facet */}
        <polygon points="25,96 4,75 32,50 50,70" fill="url(#facetStoneGrad)" opacity="0.35" />
        {/* Left facet */}
        <polygon points="4,25 25,4 50,30 32,50" fill="url(#facetStoneGrad)" opacity="0.4" />

        {/* Central Core Rhombus */}
        <polygon
          points="50,30 68,50 50,70 32,50"
          fill="#00f0ff"
          fillOpacity="0.25"
          stroke="#38bdf8"
          strokeWidth="1.8"
        />

        {/* Central Eye / Golem Core Node */}
        <circle cx="50" cy="50" r="4.5" fill="#00f0ff" />
        <circle cx="50" cy="50" r="8" stroke="#00f0ff" strokeWidth="1" strokeDasharray="2 2" opacity="0.8" />

        {/* Crystalline Accent Nodes on outer vertices */}
        <circle cx="25" cy="4" r="2" fill="#00f0ff" />
        <circle cx="75" cy="4" r="2" fill="#00f0ff" />
        <circle cx="96" cy="25" r="2" fill="#00f0ff" />
        <circle cx="96" cy="75" r="2" fill="#00f0ff" />
        <circle cx="75" cy="96" r="2" fill="#00f0ff" />
        <circle cx="25" cy="96" r="2" fill="#00f0ff" />
        <circle cx="4" cy="75" r="2" fill="#00f0ff" />
        <circle cx="4" cy="25" r="2" fill="#00f0ff" />
      </svg>
    </div>
  );
};
