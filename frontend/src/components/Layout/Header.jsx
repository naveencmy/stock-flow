import React, { useState, useEffect } from 'react';
import {
  Menu,
  Plus,
  Calendar,
  MapPin,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Search,
  Sparkles
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import Button from '../common/Button';
import Logo from '../common/Logo';

export const Header = () => {
  const {
    toggleSidebar,
    isSidebarCollapsed,
    theme,
    toggleTheme,
    soundEnabled,
    toggleSound,
    setIsCommandPaletteOpen
  } = useApp();

  const navigate = useNavigate();
  const location = useLocation();
  const [currentDateTime, setCurrentDateTime] = useState('');

  const getPageInfo = (path) => {
    switch (path) {
      case '/':
        return { title: 'Dashboard', desc: 'Real-time sales & inventory metrics' };
      case '/products':
        return { title: 'Product Catalog', desc: 'Manage electrical items & stock limits' };
      case '/billing':
        return { title: 'POS Billing Counter', desc: 'Create tax invoices & fast checkout' };
      case '/sales':
        return { title: 'Sales Ledger', desc: 'Historical customer transactions' };
      case '/stock-logs':
        return { title: 'Stock Movement Logs', desc: 'Audit trail & adjustments' };
      default:
        return { title: 'Nandhipriya Electricals', desc: 'Stock & Billing System' };
    }
  };

  const pageInfo = getPageInfo(location.pathname);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = now.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      setCurrentDateTime(formatted);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/85 dark:bg-[#0f172a]/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 flex items-center justify-between no-print shadow-xs transition-colors duration-200">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={toggleSidebar}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* CASE A: When Sidebar is Collapsed OR on Mobile Screen */}
        <div className={`items-center gap-2.5 ${isSidebarCollapsed ? 'flex' : 'flex lg:hidden'}`}>
          <Logo collapsed size="sm" />
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-1.5 font-mono">
              <span>NANDHIPRIYA</span>
              <span className="px-1.5 py-0.2 rounded-md bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800 text-[9px] font-bold">
                POS
              </span>
            </h2>
          </div>
        </div>

        {/* CASE B: When Sidebar is Expanded (Desktop) */}
        <div className={`items-center gap-3 ${!isSidebarCollapsed ? 'hidden lg:flex' : 'hidden'}`}>
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300 bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 px-2.5 py-1 rounded-lg">
              <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400 shrink-0" />
              <span>Dharapuram Main Store</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-bold text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
              POS Terminal Live
            </span>
          </div>
        </div>
      </div>

      {/* Center / Action Bar */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Omnibar / Command Palette search button */}
        <button
          type="button"
          onClick={() => setIsCommandPaletteOpen(true)}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/70 hover:bg-slate-200/70 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/80 text-xs font-medium text-slate-600 dark:text-slate-300 transition-all hover:border-blue-400 group"
          title="Search anything (Ctrl+K)"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 transition-colors" />
          <span className="text-slate-500 dark:text-slate-400">Quick search...</span>
          <kbd className="ml-1 px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] font-mono font-bold text-slate-500 shadow-xs">
            Ctrl+K
          </kbd>
        </button>

        {/* Real-time Date Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{currentDateTime}</span>
        </div>

        {/* Audio Feedback Toggle */}
        <button
          type="button"
          onClick={toggleSound}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          title={soundEnabled ? 'Mute POS Chimes' : 'Enable POS Chimes'}
          aria-label="Toggle Sound"
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {/* Dark / Light Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-transform active:scale-95 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45" />
          ) : (
            <Moon className="w-4 h-4 text-blue-600 transition-transform hover:-rotate-12" />
          )}
        </button>

        {/* Fast Action New Bill Button */}
        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => navigate('/billing')}
          className="shadow-glow-sm font-semibold hover:shadow-glow-md transition-all active:scale-95"
        >
          <span className="hidden sm:inline">New</span> Bill
        </Button>
      </div>
    </header>
  );
};

export default Header;
