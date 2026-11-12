import React from 'react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'blue',
  alert = false
}) => {
  const colorMap = {
    blue: {
      accent: 'from-blue-600 to-cyan-500',
      bg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-cyan-400 ring-1 ring-blue-500/20',
      glow: 'from-blue-500/10 via-transparent to-transparent'
    },
    amber: {
      accent: 'from-amber-500 to-orange-500',
      bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20',
      glow: 'from-amber-500/10 via-transparent to-transparent'
    },
    emerald: {
      accent: 'from-emerald-600 to-teal-500',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20',
      glow: 'from-emerald-500/10 via-transparent to-transparent'
    },
    purple: {
      accent: 'from-indigo-600 to-purple-500',
      bg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 ring-1 ring-purple-500/20',
      glow: 'from-purple-500/10 via-transparent to-transparent'
    }
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div className="group relative rounded-2xl p-5 bg-white/90 dark:bg-[#121a2d]/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/90 shadow-xs hover:shadow-lg dark:hover:shadow-glow-sm transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
      {/* Subtle top accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${scheme.accent}`} />

      {/* Ambient background glow */}
      <div className={`absolute -right-8 -top-8 w-28 h-28 bg-gradient-to-bl ${scheme.glow} rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500`} />

      <div className="flex items-center justify-between relative z-10">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${scheme.bg} transition-transform duration-300 group-hover:scale-110 shadow-xs`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2 relative z-10">
        <h3 className={`text-2xl sm:text-3xl font-black font-tabular tracking-tight ${alert ? 'text-amber-500 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
          {value}
        </h3>
        {alert && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700 animate-pulse">
            ⚠️ Needs Restock
          </span>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-2.5 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 relative z-10">
          {trend && (
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
              {trend}
            </span>
          )}
          {subtitle && <span className="truncate">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};

export default StatCard;
