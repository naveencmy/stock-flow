import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Moon, Sun, Volume2, VolumeX, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import logoSvg from '../../assets/logo.svg';

export const Header = () => {
  const {
    theme,
    toggleTheme,
    soundEnabled,
    toggleSound,
    language,
    toggleLanguage,
  } = useApp();

  const navigate = useNavigate();
  const location = useLocation();
  const [liveTime, setLiveTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-GB', { hour12: false });
      setLiveTime(timeStr);
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { key: 'F1', path: '/', label: 'Dashboard', hotkey: '[F1]' },
    { key: 'F2', path: '/billing', label: 'Billing', hotkey: '[F2]' },
    { key: 'F3', path: '/products', label: 'Products & Racks', hotkey: '[F3]' },
    { key: 'F4', path: '/sales', label: 'Sales History', hotkey: '[F4]' },
    { key: 'F5', path: '/stock-logs', label: 'Stock Logs', hotkey: '[F5]' },
  ];

  const currentPath = location.pathname;

  return (
    <header className="sticky top-0 z-40 bg-[#f7f5ef] dark:bg-[#0c1220] border-b border-[#ded9cb] dark:border-slate-800 px-3 sm:px-4 py-1.5 no-print shadow-xs transition-colors duration-150">
      <div className="flex items-center justify-between gap-2 sm:gap-4 flex-nowrap w-full">
        {/* Brand identity block: Wide Logo in Slim Header */}
        <div
          className="flex items-center shrink-0 cursor-pointer select-none"
          onClick={() => navigate('/')}
          title="Nandhipriya Electricals"
        >
          <img
            src={logoSvg}
            alt="Nandhipriya Electricals"
            className="h-10 sm:h-11 md:h-12 w-auto max-h-12 object-contain rounded drop-shadow-xs transition-transform duration-200 hover:scale-[1.02]"
          />
        </div>

        {/* Center POS Function Key Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {navItems.map((item) => {
            const isActive =
              item.path === '/'
                ? currentPath === '/'
                : currentPath.startsWith(item.path);

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => navigate(item.path)}
                className={`px-2 sm:px-2.5 md:px-3 py-1.5 rounded text-xs font-mono font-semibold transition-all flex items-center gap-1 sm:gap-1.5 border whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 border-blue-700 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-[#ded9cb] dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-[#efece2] dark:hover:bg-slate-800'
                }`}
              >
                <span className={isActive ? 'text-blue-100' : 'text-slate-400'}>
                  {item.hotkey}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Status Controls - One Line */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Language Switcher [EN] [தமிழ்] */}
          <div className="flex items-center rounded border border-[#ded9cb] dark:border-slate-700 bg-white dark:bg-slate-900 p-0.5 text-[11px] font-mono">
            <button
              type="button"
              onClick={toggleLanguage}
              className={`px-1.5 py-0.5 rounded font-bold transition-all ${
                language === 'en'
                  ? 'bg-black text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-black'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={toggleLanguage}
              className={`px-1.5 py-0.5 rounded font-bold font-tamil transition-all ${
                language === 'ta'
                  ? 'bg-black text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-black'
              }`}
            >
              தமிழ்
            </button>
          </div>

          {/* Live Branch Clock */}
          <div className="hidden xl:flex flex-col text-right font-mono text-[11px] leading-tight text-slate-700 dark:text-slate-300">
            <span className="font-bold tabular-nums text-xs">{liveTime}</span>
            <span className="text-[9px] text-slate-500 uppercase tracking-wider">
              DHARAPURAM BRANCH
            </span>
          </div>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={toggleSound}
            className="p-1.5 rounded border border-[#ded9cb] dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-[#efece2] dark:hover:bg-slate-800"
            title={soundEnabled ? 'Mute POS Chimes' : 'Enable POS Chimes'}
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-1.5 rounded border border-[#ded9cb] dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-[#efece2] dark:hover:bg-slate-800"
            title="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-blue-600" />
            )}
          </button>

          {/* New Bill Button */}
          <button
            type="button"
            onClick={() => navigate('/billing')}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded bg-white dark:bg-slate-900 border border-[#ded9cb] dark:border-slate-700 text-slate-800 dark:text-white font-mono text-xs font-bold hover:bg-[#efece2] dark:hover:bg-slate-800 active:scale-95 transition-all shadow-xs whitespace-nowrap"
          >
            <Plus className="w-3 h-3 text-blue-600" />
            <span>+ New Bill [F2]</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
