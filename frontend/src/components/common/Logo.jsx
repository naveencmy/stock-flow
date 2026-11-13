import React from 'react';
import logoSvg from '../../assets/logo.svg';

/**
 * Official Brand Identity Logo Component for Nandhipriya Electricals & Hardware
 * Uses the primary logo SVG asset.
 */
export const Logo = ({ collapsed = false, className = '', size = 'md', showText = true }) => {
  const iconDimensions = {
    xs: 'h-8 w-auto',
    sm: 'h-10 w-auto',
    md: 'h-14 w-auto',
    lg: 'h-16 w-auto',
    xl: 'h-20 w-auto'
  }[size] || 'h-14 w-auto';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Primary SVG Logo */}
      <img
        src={logoSvg}
        alt="Nandhipriya Electricals & Hardware"
        className={`${iconDimensions} object-contain rounded drop-shadow-xs transition-transform duration-200 hover:scale-105`}
      />

      {/* Optional Brand Typography */}
      {showText && !collapsed && (
        <div className="flex flex-col min-w-0 leading-tight">
          <div className="flex items-center gap-1.5">
            <span className="text-xs sm:text-sm font-black tracking-tight text-slate-900 dark:text-white uppercase font-sans">
              NANDHIPRIYA
            </span>
            <span className="px-1.5 py-0.2 rounded border border-[#d2cbba] dark:border-slate-700 bg-[#eee9dc] dark:bg-slate-800 text-[9px] font-mono font-bold text-slate-700 dark:text-slate-300">
              POS
            </span>
          </div>
          <span className="text-[10px] text-slate-600 dark:text-slate-400 font-mono">
            ELECTRICALS &amp; HARDWARE
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
