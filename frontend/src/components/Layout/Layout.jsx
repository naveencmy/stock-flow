import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import CommandPalette from '../common/CommandPalette';
import { useApp } from '../../context/AppContext';

export const Layout = () => {
  const { isSidebarCollapsed } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex relative selection:bg-blue-500 selection:text-white transition-colors duration-200">
      {/* Background Ambient Glow Meshes */}
      <div className="fixed top-0 left-0 right-0 h-96 bg-gradient-to-b from-blue-500/5 dark:from-blue-600/10 via-transparent to-transparent pointer-events-none" />
      <div className="fixed -top-40 -right-40 w-96 h-96 rounded-full bg-cyan-500/5 dark:bg-cyan-500/10 blur-3xl pointer-events-none" />

      {/* Global Command Palette (Ctrl+K) */}
      <CommandPalette />

      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main content wrapper dynamically adapting to sidebar collapse */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <Header />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto relative z-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
