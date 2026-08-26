import React, { useState, useEffect } from 'react';
import { Menu, Plus, Calendar, Store } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import Button from '../common/Button';

export const Header = () => {
  const { toggleSidebar } = useApp();
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
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between no-print shadow-xs">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleSidebar}
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <Store className="w-5 h-5 text-blue-600 hidden sm:block" />
          <div>
            <h2 className="text-sm font-bold text-slate-800 tracking-tight sm:text-base">
              NANDHIPRIYA ELECTRICALS
            </h2>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Pongandhurai, Dharapuram, Tiruppur | Ph: 9842156789
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100/80 border border-slate-200 text-xs font-semibold text-slate-600">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>{currentDateTime}</span>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => navigate('/billing')}
          className="shadow-sm font-semibold"
        >
          <span className="hidden sm:inline">Create</span> Bill
        </Button>
      </div>
    </header>
  );
};

export default Header;
