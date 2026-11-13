import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import FooterStatusBar from './FooterStatusBar';
import CommandPalette from '../common/CommandPalette';
import useHotkeys from '../../hooks/useHotkeys';

export const Layout = () => {
  // Bind global F1-F5 function key shortcuts
  useHotkeys();

  return (
    <div className="min-h-screen bg-[#f6f4ee] dark:bg-[#0b1120] text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white transition-colors duration-150 pb-10">
      {/* Global Command Palette (Ctrl+K) */}
      <CommandPalette />

      {/* Top Industrial Header with Hotkey Nav */}
      <Header />

      {/* Full-width Tactical Main Work Area */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto p-2 sm:p-4 md:p-5 relative z-10">
        <Outlet />
      </main>

      {/* Bottom Global Status Bar */}
      <FooterStatusBar />
    </div>
  );
};

export default Layout;
