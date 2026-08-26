import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Receipt,
  ClipboardList,
  BarChart3,
  Zap,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Sidebar = () => {
  const { cart, isSidebarOpen, closeSidebar } = useApp();

  const navItems = [
    {
      name: 'Dashboard',
      path: '/',
      icon: LayoutDashboard,
      badge: null
    },
    {
      name: 'Products',
      path: '/products',
      icon: Package,
      badge: null
    },
    {
      name: 'Billing',
      path: '/billing',
      icon: Receipt,
      badge: cart.length > 0 ? `${cart.length}` : null,
      badgeColor: 'bg-emerald-500'
    },
    {
      name: 'Sales History',
      path: '/sales',
      icon: ClipboardList,
      badge: null
    },
    {
      name: 'Stock Logs',
      path: '/stock-logs',
      icon: BarChart3,
      badge: null
    }
  ];

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden no-print"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 no-print ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-20 flex items-center justify-between px-5 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30 ring-2 ring-blue-400/20">
              <Zap className="w-6 h-6 text-amber-300 fill-amber-300" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-wider text-white uppercase font-mono">
                NP ELECTRICALS
              </h1>
              <p className="text-[10px] text-blue-300 font-medium tracking-tight">
                NANDHIPRIYA STORE
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeSidebar}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Main Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeSidebar}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-150 group ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold text-white shadow-xs ${
                      item.badgeColor || 'bg-blue-500'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Footer Info Box */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60">
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/50">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wide">
                Shopkeeper
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-xs font-semibold text-white mt-1">
              Kuppusamy M.
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5 truncate">
              Pongandhurai, Dharapuram
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
