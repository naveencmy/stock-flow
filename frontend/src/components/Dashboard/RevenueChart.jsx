import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { TrendingUp, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';

export const RevenueChart = ({ data = [] }) => {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950/95 text-white p-3.5 rounded-xl shadow-2xl border border-slate-700/80 text-xs backdrop-blur-md">
          <p className="font-semibold text-slate-300 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            {label}
          </p>
          <p className="font-bold font-tabular text-cyan-400 text-base mt-1">
            {formatCurrency(payload[0].value)}
          </p>
          {payload[0].payload.bills && (
            <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
              Invoices: <span className="text-white font-semibold">{payload[0].payload.bills}</span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const totalPeriodRevenue = data.reduce((acc, curr) => acc + (Number(curr.revenue) || 0), 0);

  return (
    <div className="rounded-2xl p-5 sm:p-6 bg-white/90 dark:bg-[#121a2d]/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/90 shadow-xs relative overflow-hidden transition-colors">
      {/* Header with Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Revenue Dynamics
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-400 border border-blue-200/60 dark:border-cyan-800/60 text-[10px] font-bold uppercase tracking-wider">
              30-Day Pulse
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Daily shop turnover and cashier transaction trends
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          <span className="text-xs text-slate-500 dark:text-slate-400">Total:</span>
          <span className="text-sm font-bold font-tabular text-slate-900 dark:text-white">
            {formatCurrency(totalPeriodRevenue)}
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-72 w-full">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-sm">
            No sales activity recorded in this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenueGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                  <stop offset="50%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-100 dark:text-slate-800/80" />
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#06b6d4"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorRevenueGlow)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default RevenueChart;
