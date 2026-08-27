import React, { useState, useEffect } from 'react';
import { Menu, Plus, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import Button from '../common/Button';
import Logo from '../common/Logo';

export const Header = () => {
  const { toggleSidebar, isSidebarCollapsed } = useApp();
  const navigate = useNavigate();
  const [currentDateTime, setCurrentDateTime] = useState('');

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
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between no-print shadow-xs transition-all duration-300">
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

        {/* Brand context on Header */}
        <div className="flex items-center gap-2.5">
          {/* Logo icon shown when desktop sidebar is collapsed or on mobile */}
          {isSidebarCollapsed && (
            <div className="hidden lg:block animate-fadeIn">
              <Logo collapsed size="sm" />
            </div>
          )}

          <div>
            <h2 className="text-sm font-bold text-slate-800 tracking-tight sm:text-base flex items-center gap-2">
              <span>NANDHIPRIYA ELECTRICALS</span>
              <span className="hidden md:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                POS LIVE
              </span>
            </h2>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Pongandhurai, Dharapuram, Tiruppur | Ph: 9842156789
            </p>
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
