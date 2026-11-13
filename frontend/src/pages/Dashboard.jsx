import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../hooks/useDashboard';
import { useProducts } from '../hooks/useProducts';
import { formatCurrency } from '../utils/formatCurrency';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StockAdjustmentDrawer from '../components/StockLogs/StockAdjustmentDrawer';
import toast from 'react-hot-toast';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { summary, lowStockProducts, loading, fetchDashboardData } = useDashboard();
  const { products } = useProducts();
  const [selectedAdjustProduct, setSelectedAdjustProduct] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const todayRevenue = summary.todayRevenue ?? 0;
  const activeInvoices = summary.todayBillsCount ?? 0;
  const criticalCount = lowStockProducts.length || summary.lowStockCount || 0;
  const pendingKhata = summary.pendingKhataTotal ?? 0;
  const pendingKhataAccounts = summary.pendingKhataAccountsCount ?? 0;
  const topKhataAccount = summary.topKhataAccount || 'No pending dues';
  const growthPct = summary.revenueGrowthPct ?? 0;
  const paymentBreakdown = summary.paymentBreakdown || {
    cash: { count: 0, revenue: 0 },
    upi: { count: 0, revenue: 0 },
    card: { count: 0, revenue: 0 },
    khata: { count: 0, revenue: 0 },
  };

  const hourlyVelocity = summary.hourlyVelocity && summary.hourlyVelocity.length > 0
    ? summary.hourlyVelocity
    : [
        { hour: '09:00', bills: 0, revenue: 0 },
        { hour: '10:00', bills: 0, revenue: 0 },
        { hour: '11:00', bills: 0, revenue: 0 },
        { hour: '12:00', bills: 0, revenue: 0 },
        { hour: '13:00', bills: 0, revenue: 0 },
        { hour: '14:00', bills: 0, revenue: 0 },
        { hour: '15:00', bills: 0, revenue: 0 },
        { hour: '16:00', bills: 0, revenue: 0 },
        { hour: '17:00', bills: 0, revenue: 0 },
        { hour: '18:00', bills: 0, revenue: 0 },
        { hour: '19:00', bills: 0, revenue: 0 }
      ];

  const maxRev = Math.max(...hourlyVelocity.map((h) => h.revenue), 100);

  // Top fast moving items from live DB aggregation or fallback to first products
  const topFastMoving = summary.topFastMoving && summary.topFastMoving.length > 0
    ? summary.topFastMoving
    : products.slice(0, 4).map(p => ({
        name: p.name,
        tamil: p.tamilName || '',
        rack: p.rackLocation || 'RACK-01',
        qty: `${p.stockQty || 0} ${p.unit || 'units'} in stock`,
        rev: formatCurrency(p.unitPrice || 0)
      }));

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* 4 Top Industrial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Today's Turnover */}
        <div className="p-3.5 rounded bg-white dark:bg-[#0c1322] border border-[#ded9cb] dark:border-slate-800 shadow-xs">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
            TODAY'S TURNOVER
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            {formatCurrency(todayRevenue)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] font-bold">
            <span className={growthPct >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
              {growthPct >= 0 ? `+${growthPct}%` : `${growthPct}%`} vs yesterday
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-slate-500 font-normal">{activeInvoices} receipts</span>
          </div>
        </div>

        {/* Card 2: Active Invoices */}
        <div className="p-3.5 rounded bg-white dark:bg-[#0c1322] border border-[#ded9cb] dark:border-slate-800 shadow-xs">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
            ACTIVE INVOICES
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            {activeInvoices} BILLS
          </div>
          <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-600 dark:text-slate-400">
            <span>Cash: <strong className="text-black dark:text-white">{paymentBreakdown.cash.count}</strong></span>
            <span>•</span>
            <span>UPI: <strong className="text-black dark:text-white">{paymentBreakdown.upi.count}</strong></span>
            <span>•</span>
            <span>Khata: <strong className="text-black dark:text-white">{paymentBreakdown.khata.count}</strong></span>
          </div>
        </div>

        {/* Card 3: Low Stock Alerts */}
        <div
          onClick={() => navigate('/products')}
          className="p-3.5 rounded bg-white dark:bg-[#0c1322] border border-rose-300 dark:border-rose-900/60 shadow-xs cursor-pointer hover:bg-rose-50/30 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-rose-700 dark:text-rose-400 uppercase tracking-wider font-bold">
              LOW STOCK ALERTS
            </span>
            <span className="px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 font-bold text-[9px]">
              CRITICAL
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {criticalCount} ITEMS
          </div>
          <div className="text-[10px] text-slate-500 mt-2">
            Click to open Products &amp; Racks catalog [F3]
          </div>
        </div>

        {/* Card 4: Pending Khata */}
        <div className="p-3.5 rounded bg-white dark:bg-[#0c1322] border border-amber-300 dark:border-amber-900/60 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-amber-700 dark:text-amber-400 uppercase tracking-wider font-bold">
              PENDING KHATA / CREDIT
            </span>
            <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold text-[9px]">
              {pendingKhataAccounts} ACCOUNTS
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-700 dark:text-amber-400 mt-1">
            {formatCurrency(pendingKhata)}
          </div>
          <div className="text-[10px] text-slate-500 mt-2 truncate">
            Top: {topKhataAccount}
          </div>
        </div>
      </div>

      {/* Main Grid: Hourly Velocity Chart + Fast Moving Items */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
        {/* Hourly Sales Velocity (7 cols) */}
        <div className="lg:col-span-7 bg-[#faf8f5] dark:bg-[#0c1322] rounded border border-[#ded9cb] dark:border-slate-800 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#ded9cb] dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white uppercase text-xs">
                HOURLY SALES VELOCITY (DHARAPURAM COUNTER)
              </h3>
              <p className="text-[10px] text-slate-500 font-tamil mt-0.5">
                மணிநேர விற்பனை வீதம் மற்றும் பில் எண்ணிக்கை
              </p>
            </div>
            <span className="px-2 py-0.5 rounded bg-[#eee9dc] dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300">
              09:00 - 19:00 IST
            </span>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-52 flex items-end justify-between gap-1.5 pt-4 px-2">
            {hourlyVelocity.map((h, i) => {
              const heightPct = Math.round((h.revenue / maxRev) * 100);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                  <span className="text-[9px] font-bold text-slate-600 dark:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    ₹{h.revenue >= 1000 ? `${(h.revenue / 1000).toFixed(1)}k` : h.revenue}
                  </span>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-t h-36 flex items-end">
                    <div
                      className="w-full bg-blue-600 group-hover:bg-blue-500 rounded-t transition-all"
                      style={{ height: `${Math.max(4, heightPct)}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono mt-1">
                    {h.hour.slice(0, 2)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-[#ded9cb] dark:border-slate-800 flex justify-between text-[10px] text-slate-500">
            <span>Peak hour: {hourlyVelocity.reduce((max, h) => h.revenue > max.revenue ? h : max, hourlyVelocity[0])?.hour || '17:00'}</span>
            <span>Avg ticket size: {activeInvoices > 0 ? formatCurrency(todayRevenue / activeInvoices) : '₹0.00'}</span>
          </div>
        </div>

        {/* Top Fast-Moving Items (5 cols) */}
        <div className="lg:col-span-5 bg-[#faf8f5] dark:bg-[#0c1322] rounded border border-[#ded9cb] dark:border-slate-800 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#ded9cb] dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white uppercase text-xs">
                TOP FAST-MOVING SKUS (LIVE DB)
              </h3>
              <p className="text-[10px] text-slate-500 font-tamil mt-0.5">
                அதிகம் விற்பனையாகும் பொருட்கள்
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {topFastMoving.map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded bg-white dark:bg-[#060a12] border border-[#ded9cb] dark:border-slate-800 flex items-center justify-between gap-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-slate-900 dark:text-white truncate text-xs font-sans">
                    {item.name}
                  </div>
                  {item.tamil && (
                    <div className="text-[10px] text-slate-500 font-tamil truncate">
                      {item.tamil}
                    </div>
                  )}
                  <div className="text-[9px] text-slate-500 mt-0.5">
                    Location: <span className="font-bold">{item.rack}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-black text-slate-900 dark:text-white text-xs">{item.rev}</div>
                  <div className="text-[10px] text-emerald-600 font-bold">{item.qty}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Critical Stock Radar with quick Adjust drawer */}
      <div className="bg-[#faf8f5] dark:bg-[#0c1322] rounded border border-[#ded9cb] dark:border-slate-800 p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#ded9cb] dark:border-slate-800">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white uppercase text-xs">
              LOW STOCK ATTENTION RADAR
            </h3>
            <p className="text-[10px] text-slate-500 font-tamil mt-0.5">
              மறுவரிசை வரம்பை எட்டிய பொருட்கள்
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="px-2.5 py-1 rounded bg-blue-600 text-white font-bold text-[10px] hover:bg-blue-700"
          >
            Manage Racks [F3]
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {products
            .filter((p) => Number(p.stockQty) <= Number(p.reorderLevel))
            .slice(0, 6)
            .map((p) => (
              <div
                key={p._id}
                className="p-3 rounded bg-white dark:bg-[#060a12] border border-rose-300 dark:border-rose-900/60 flex items-center justify-between gap-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-slate-900 dark:text-white truncate font-sans text-xs">
                    {p.name}
                  </div>
                  {p.tamilName && (
                    <div className="text-[10px] text-slate-500 font-tamil truncate">
                      {p.tamilName}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-1 text-[10px]">
                    <span className="font-black text-rose-600">
                      {p.stockQty} {p.unit} remaining
                    </span>
                    <span className="text-slate-300">|</span>
                    <span className="text-slate-500">Min: {p.reorderLevel}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => toast.success(`Draft PO created for ${p.name}`)}
                    className="px-2 py-1 rounded bg-rose-50 text-rose-700 border border-rose-300 font-bold text-[9px] hover:bg-rose-100"
                  >
                    + PO
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedAdjustProduct(p)}
                    className="px-2 py-1 rounded border border-[#ded9cb] bg-white text-slate-700 font-bold text-[9px] hover:bg-[#eee9dc]"
                  >
                    Adjust [F8]
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Manual Stock Adjustment Drawer [F8] */}
      <StockAdjustmentDrawer
        isOpen={!!selectedAdjustProduct}
        onClose={() => setSelectedAdjustProduct(null)}
        product={selectedAdjustProduct}
        onSuccess={fetchDashboardData}
      />
    </div>
  );
};

export default Dashboard;
