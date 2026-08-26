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
      border: 'border-l-blue-600',
      bg: 'bg-blue-50 text-blue-600',
      badge: 'bg-blue-100 text-blue-700'
    },
    amber: {
      border: 'border-l-amber-500',
      bg: 'bg-amber-50 text-amber-600',
      badge: 'bg-amber-100 text-amber-800'
    },
    emerald: {
      border: 'border-l-emerald-600',
      bg: 'bg-emerald-50 text-emerald-600',
      badge: 'bg-emerald-100 text-emerald-800'
    },
    purple: {
      border: 'border-l-purple-600',
      bg: 'bg-purple-50 text-purple-600',
      badge: 'bg-purple-100 text-purple-800'
    }
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div className={`bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 border-l-[5px] ${scheme.border} transition-all duration-150 hover:shadow-md relative overflow-hidden`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${scheme.bg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <h3 className={`text-2xl sm:text-3xl font-black tracking-tight ${alert ? 'text-amber-600' : 'text-slate-900'}`}>
          {value}
        </h3>
        {alert && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 animate-pulse">
            ⚠️ Alert
          </span>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
          {trend && <span className="font-semibold text-emerald-600">{trend}</span>}
          {subtitle && <span>{subtitle}</span>}
        </div>
      )}
    </div>
  );
};

export default StatCard;
