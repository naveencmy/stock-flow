import React, { useState, useEffect } from 'react';
import { Menu, Plus, Calendar, MapPin, Store } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import Button from '../common/Button';
import Logo from '../common/Logo';

export const Header = () => {
  const { toggleSidebar, isSidebarCollapsed } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentDateTime, setCurrentDateTime] = useState('');

  const getPageInfo = (path) => {
    switch (path) {
      case '/':
        return { title: 'Dashboard Overview', desc: 'Real-time sales & inventory metrics' };
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
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between no-print shadow-xs transition-all duration-300">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={toggleSidebar}
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* ─── CASE A: When Sidebar is Collapsed OR on Mobile Screen ─── */}
        <div className={`items-center gap-2.5 ${isSidebarCollapsed ? 'flex' : 'flex lg:hidden'}`}>
          <Logo collapsed size="sm" />
          <div>
            <h2 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-1.5 font-mono">
              <span>NANDHIPRIYA</span>
              <span className="px-1.5 py-0.2 rounded-md bg-cyan-50 text-cyan-700 border border-cyan-200 text-[9px] font-bold">
                POS
              </span>
            </h2>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Pongandhurai, Dharapuram
            </p>
          </div>
        </div>

        {/* ─── CASE B: When Sidebar is Expanded (Desktop) ─────────────── */}
        {/* Shows clean Location & Store Status without duplicating brand name */}
        <div className={`items-center gap-3 ${!isSidebarCollapsed ? 'hidden lg:flex' : 'hidden'}`}>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="flex items-center gap-1.5 font-semibold text-slate-700 bg-slate-100/80 border border-slate-200 px-2.5 py-1 rounded-lg">
              <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Dharapuram Main Store</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              POS Terminal Live
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Real-time Date Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/80 border border-slate-200 text-xs font-semibold text-slate-600">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>{currentDateTime}</span>
        </div>

        {/* Fast Action New Bill Button */}
        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => navigate('/billing')}
          className="shadow-sm font-semibold hover:shadow-md transition-shadow"
        >
          <span className="hidden sm:inline">New</span> Bill
        </Button>
      </div>
    </header>
  );
};

export default Header;
