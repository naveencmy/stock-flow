import React from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export const FooterStatusBar = () => {
  const location = useLocation();
  const { language } = useApp();

  const getActiveTab = () => {
    switch (location.pathname) {
      case '/':
        return 'F1';
      case '/billing':
        return 'F2';
      case '/products':
        return 'F3';
      case '/sales':
        return 'F4';
      case '/stock-logs':
        return 'F5';
      default:
        return '';
    }
  };

  const activeKey = getActiveTab();

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 bg-[#f4f1e8] dark:bg-[#0b1120] border-t border-[#dcd7cb] dark:border-slate-800 text-[11px] font-mono text-slate-700 dark:text-slate-300 px-3 py-1.5 flex items-center justify-between overflow-x-auto no-print select-none shadow-xs">
      <div className="flex items-center gap-2 sm:gap-3 whitespace-nowrap">
        <span
          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${activeKey === 'F1'
              ? 'bg-blue-600 text-white'
              : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
        >
          F1: Dashboard
        </span>
        <span
          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${activeKey === 'F2'
              ? 'bg-blue-600 text-white'
              : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
        >
          F2: Billing
        </span>
        <span
          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${activeKey === 'F3'
              ? 'bg-blue-600 text-white'
              : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
        >
          [F3]: Products Active
        </span>
        <span
          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${activeKey === 'F4'
              ? 'bg-blue-600 text-white'
              : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
        >
          F4: History
        </span>
        <span
          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${activeKey === 'F5'
              ? 'bg-blue-600 text-white'
              : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
        >
          F5: Stock Audit
        </span>
        <span className="text-slate-300 dark:text-slate-700">|</span>
        <span className="text-slate-500 dark:text-slate-400 hidden md:inline">
          Insert: New SKU
        </span>
        <span className="text-slate-500 dark:text-slate-400 hidden md:inline">
          F7: CSV Export
        </span>
      </div>

      <div className="flex items-center gap-3 whitespace-nowrap pl-4">
        <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="hidden lg:inline">Live Audit Replication:</span> 14ms Latency
        </span>
        <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>
        <span className="text-slate-600 dark:text-slate-400 font-tamil text-[10px] hidden sm:inline">
          தமிழ் பயன்படுமுறை தயார்
        </span>
        <span className="text-slate-300 dark:text-slate-700 hidden lg:inline">|</span>
        <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-[9px] border border-emerald-300 dark:border-emerald-800 hidden lg:inline">
          GST AUDIT
        </span>
      </div>
    </footer>
  );
};

export default FooterStatusBar;
