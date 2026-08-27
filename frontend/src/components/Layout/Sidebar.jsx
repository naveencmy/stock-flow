import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Receipt,
  ClipboardList,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Logo from '../common/Logo';

export const Sidebar = () => {
  const {
    cart,
    isSidebarOpen,
    closeSidebar,
    isSidebarCollapsed,
    toggleSidebarCollapse
  } = useApp();

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
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden no-print"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 bg-slate-900 text-white flex flex-col transition-all duration-300 ease-in-out lg:translate-x-0 no-print border-r border-slate-800/80 shadow-xl ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        } ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Brand Header */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-slate-800 bg-slate-950/40 relative">
          <div className="flex items-center overflow-hidden">
            <Logo collapsed={isSidebarCollapsed} size={isSidebarCollapsed ? 'sm' : 'md'} />
          </div>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={closeSidebar}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Desktop Collapse / Expand Toggle Button */}
          <button
            type="button"
            onClick={toggleSidebarCollapse}
            className="hidden lg:flex absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-blue-600 hover:bg-blue-500 text-white items-center justify-center shadow-md shadow-blue-900/50 border-2 border-slate-900 transition-transform duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-400"
            title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto overflow-x-hidden">
          {!isSidebarCollapsed && (
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 animate-fadeIn">
              Main Menu
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.path} className="relative group">
                <NavLink
                  to={item.path}
                  onClick={closeSidebar}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `flex items-center rounded-xl font-medium text-sm transition-all duration-200 ${
                      isSidebarCollapsed
                        ? 'justify-center p-3'
                        : 'justify-between px-3.5 py-3'
                    } ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110" />
                    {!isSidebarCollapsed && (
                      <span className="truncate">{item.name}</span>
                    )}
                  </div>

                  {!isSidebarCollapsed && item.badge && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold text-white shadow-xs ${
                        item.badgeColor || 'bg-blue-500'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {/* Dot indicator when collapsed if badge exists */}
                  {isSidebarCollapsed && item.badge && (
                    <span
                      className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full ring-2 ring-slate-900 ${
                        item.badgeColor || 'bg-blue-500'
                      }`}
                    />
                  )}
                </NavLink>

                {/* Floating Tooltip when Collapsed */}
                {isSidebarCollapsed && (
                  <div className="hidden lg:group-hover:flex absolute left-full top-1/2 -translate-y-1/2 ml-3.5 px-3 py-1.5 bg-slate-950 text-white text-xs font-semibold rounded-lg shadow-xl border border-slate-700/80 z-50 whitespace-nowrap items-center gap-2 pointer-events-none animate-fadeIn">
                    <span>{item.name}</span>
                    {item.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold text-white ${
                          item.badgeColor || 'bg-blue-500'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                    {/* Tooltip Arrow */}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-950" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Shopkeeper Status Box */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 overflow-hidden">
          {isSidebarCollapsed ? (
            <div className="flex justify-center p-2 group relative">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-blue-300 border border-slate-700 relative">
                KM
                <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5 ring-2 ring-slate-900 animate-pulse" />
              </div>
              {/* Tooltip for Shopkeeper */}
              <div className="hidden lg:group-hover:block absolute left-full bottom-2 ml-3.5 px-3 py-2 bg-slate-950 text-white text-xs font-semibold rounded-lg shadow-xl border border-slate-700 z-50 whitespace-nowrap pointer-events-none animate-fadeIn">
                <p className="font-bold text-white">Kuppusamy M.</p>
                <p className="text-[10px] text-slate-400">Shopkeeper &bull; Online</p>
                <div className="absolute right-full bottom-3 border-4 border-transparent border-r-slate-950" />
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/50">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wide">
                  Shopkeeper
                </span>
                <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Online
                </span>
              </div>
              <p className="text-xs font-semibold text-white mt-1">
                Kuppusamy M.
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                Pongandhurai, Dharapuram
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
