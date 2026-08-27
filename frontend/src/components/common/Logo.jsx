import React from 'react';

/**
 * Unique Brand Identity Logo Component for Nandhipriya Electricals (Stock Flow)
 * Features an electric power circuit + stock flow dynamic nexus emblem.
 */
export const Logo = ({ collapsed = false, className = '', size = 'md' }) => {
  const iconDimensions = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  }[size] || 'w-10 h-10';

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Dynamic Electric Nexus SVG Emblem */}
      <div
        className={`${iconDimensions} relative rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 p-0.5 flex items-center justify-center shadow-lg shadow-blue-500/25 ring-2 ring-blue-400/20 shrink-0 transition-transform duration-300 hover:scale-105`}
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1.5"
        >
          {/* Circuit Hexagonal Grid Lines */}
          <path
            d="M24 4L40 13V35L24 44L8 35V13L24 4Z"
            stroke="rgba(255, 255, 255, 0.35)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Glowing Energy Flow Waves */}
          <path
            d="M12 28C16 25 20 29 24 26C28 23 32 27 36 24"
            stroke="#38bdf8"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Electric Lightning Bolt */}
          <path
            d="M26 8L16 24H25L22 40L34 22H24L26 8Z"
            fill="url(#boltGradient)"
            filter="drop-shadow(0px 2px 6px rgba(251, 191, 36, 0.6))"
          />

          {/* Ambient Glow Node */}
          <circle cx="34" cy="22" r="2" fill="#67e8f9" />
          <circle cx="16" cy="24" r="2" fill="#fbbf24" />

          <defs>
            <linearGradient
              id="boltGradient"
              x1="16"
              y1="8"
              x2="34"
              y2="40"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#fef08a" />
              <stop offset="0.5" stopColor="#fbbf24" />
              <stop offset="1" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Brand Typography (Hidden when collapsed) */}
      {!collapsed && (
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-black tracking-wider text-white font-mono leading-tight truncate">
              NANDHIPRIYA
            </span>
            <span className="px-1.5 py-0.2 rounded-md bg-cyan-500/20 text-cyan-300 text-[9px] font-black tracking-widest border border-cyan-400/30 uppercase">
              POS
            </span>
          </div>
          <span className="text-[10px] font-semibold text-blue-300/90 tracking-tight truncate flex items-center gap-1">
            <span>ELECTRICALS</span>
            <span className="text-slate-500">•</span>
            <span className="text-cyan-400 font-mono">STOCK FLOW</span>
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
