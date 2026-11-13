import React, { useEffect, useState, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { stockLogService } from '../api/services';
import LoadingSpinner from '../components/common/LoadingSpinner';
import useHotkeys from '../hooks/useHotkeys';
import toast from 'react-hot-toast';

export const StockLogs = () => {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [movementFilter, setMovementFilter] = useState('all'); // 'all', 'purchase', 'sale', 'adjustment'
  const [currentPage, setCurrentPage] = useState(1);
  const [queryTime, setQueryTime] = useState(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const t0 = performance.now();
    try {
      let startDate = '';
      let endDate = '';
      const now = new Date();

      if (dateFilter === 'today') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      } else if (dateFilter === 'yesterday') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toISOString();
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999).toISOString();
      } else if (dateFilter === 'week') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).toISOString();
      }

      const data = await stockLogService.getAll({
        search,
        changeType: movementFilter === 'all' ? '' : movementFilter,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page: currentPage,
        limit: 15
      });
      setLogs(data.logs || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
      setQueryTime(Math.round(performance.now() - t0));
    } catch (err) {
      console.error('Failed to load stock logs', err);
    } finally {
      setLoading(false);
    }
  }, [search, movementFilter, dateFilter, currentPage]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // F7 hotkey export
  useHotkeys({
    onF7: () => handleExportCsv()
  });

  const handleExportCsv = () => {
    if (!logs.length) {
      toast.error('No audit records to export');
      return;
    }
    const headers = ['Timestamp', 'SKU', 'Item Name', 'Tamil Name', 'Rack', 'Movement Type', 'Qty Delta', 'Ending Balance', 'Reference', 'Operator', 'Note'];
    const rows = logs.map((l) => [
      `"${new Date(l.createdAt).toISOString()}"`,
      `"${l.sku || ''}"`,
      `"${l.productName || ''}"`,
      `"${l.tamilName || ''}"`,
      `"${l.rackLocation || ''}"`,
      `"${l.changeType || ''}"`,
      l.qtyChange || 0,
      l.newStock || 0,
      `"${l.referenceId || ''}"`,
      `"${l.operator || 'Staff'}"`,
      `"${(l.note || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `nandhipriya_audit_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Audit Ledger CSV exported');
  };

  const getMovementBadge = (type) => {
    const t = (type || '').toLowerCase();
    switch (t) {
      case 'purchase':
        return {
          pill: '[PURCHASE IN]',
          cls: 'border-emerald-400 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60',
          desc: 'Direct Factory Consignment'
        };
      case 'damaged':
      case 'theft':
        return {
          pill: '[! DAMAGED/WRITE-OFF !]',
          cls: 'border-rose-400 text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60',
          desc: 'Scrap / Supplier Warranty Claim'
        };
      case 'adjustment':
      case 'surplus':
      case 'store_use':
        return {
          pill: '[ADJUSTMENT]',
          cls: 'border-amber-400 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60',
          desc: 'Audit Reconciliation'
        };
      case 'sale':
      default:
        return {
          pill: '[SALE OUT]',
          cls: 'border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800',
          desc: 'Direct Counter POS Bill'
        };
    }
  };

  return (
    <div className="space-y-3 font-mono text-xs">
      {/* Top Filter and Telemetry Header */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-[#f4f1e8] dark:bg-[#121c30] p-2.5 rounded border border-[#ded9cb] dark:border-slate-800 shadow-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[260px]">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Search SKU, Item, or Ref #... [ESC]"
            className="w-full pl-8 pr-8 py-1.5 rounded border border-[#ded9cb] dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs outline-none focus:ring-1 focus:ring-blue-500"
          />
          {search && (
            <button
              type="button"
              onClick={() => { setSearch(''); setCurrentPage(1); }}
              className="absolute inset-y-0 right-0 pr-2 flex items-center text-slate-400 hover:text-black"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Date Presets */}
        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-0.5 rounded border border-[#ded9cb] dark:border-slate-700 text-[11px]">
          {[
            { id: 'today', label: `Today ${dateFilter === 'today' ? `(${total})` : ''}` },
            { id: 'yesterday', label: 'Yesterday' },
            { id: 'week', label: 'Last 7 Days' },
            { id: 'all', label: `ALL (${total})` }
          ].map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => { setDateFilter(preset.id); setCurrentPage(1); }}
              className={`px-2 py-1 rounded font-bold transition-all ${
                dateFilter === preset.id
                  ? 'bg-black text-white'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-[#eee9dc]'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Movement Type Filter Tabs */}
        <div className="flex items-center gap-1 text-[11px]">
          {[
            { id: 'all', label: `ALL (${total || logs.length})` },
            { id: 'purchase', label: '+ STOCK IN (கொள்முதல்)' },
            { id: 'sale', label: '- SALES OUT (விற்பனை)' },
            { id: 'adjustment', label: '! ADJUSTMENTS (சரிசெய்தல்)' }
          ].map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => { setMovementFilter(mode.id); setCurrentPage(1); }}
              className={`px-2.5 py-1.5 rounded border font-bold transition-all ${
                movementFilter === mode.id
                  ? 'bg-blue-600 border-blue-700 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-[#ded9cb] dark:border-slate-700 hover:bg-[#eee9dc]'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {/* Export CSV [F7] */}
        <button
          type="button"
          onClick={handleExportCsv}
          className="px-2.5 py-1.5 rounded border border-[#ded9cb] dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold hover:bg-[#eee9dc] text-xs transition-colors shadow-xs"
        >
          Export Audit CSV [F7]
        </button>
      </div>

      {/* Main Stock Audit Movement Ledger Table */}
      <div className="bg-[#faf8f5] dark:bg-[#0c1322] rounded border border-[#ded9cb] dark:border-slate-800 overflow-hidden shadow-xs relative">
        {loading && <LoadingSpinner overlay message="Updating audit trail..." />}

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#eee9dc] dark:bg-[#152138] text-slate-700 dark:text-slate-300 uppercase text-[10px] font-bold tracking-wider border-b border-[#ded9cb] dark:border-slate-800">
              <tr>
                <th className="px-3.5 py-3">DATE &amp; TIME</th>
                <th className="px-4 py-3">ITEM &amp; VISUAL</th>
                <th className="px-3.5 py-3">MOVEMENT TYPE</th>
                <th className="px-3.5 py-3 text-right">QTY DELTA</th>
                <th className="px-4 py-3">REFERENCE / REASON</th>
                <th className="px-3.5 py-3 text-right">OPERATOR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8e3d5] dark:divide-slate-800/80 bg-white dark:bg-[#0c1322]">
              {logs.map((log) => {
                const dateObj = new Date(log.createdAt || Date.now());
                const dateStr = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
                const timeStr = dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

                const badge = getMovementBadge(log.changeType);
                const isPositive = Number(log.qtyChange) > 0;
                const unit = log.unit || 'units';

                return (
                  <tr
                    key={log._id}
                    className="hover:bg-[#f6f3eb] dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Date & Time */}
                    <td className="px-3.5 py-3.5 align-top whitespace-nowrap">
                      <div className="font-bold text-slate-900 dark:text-white">{dateStr}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{timeStr}</div>
                    </td>

                    {/* Item & Visual */}
                    <td className="px-4 py-3.5 align-top">
                      <div className="font-bold text-slate-900 dark:text-white font-sans text-xs">
                        {log.productName}
                      </div>
                      {log.tamilName && (
                        <div className="text-[11px] text-slate-600 dark:text-slate-400 font-tamil mt-0.5">
                          {log.tamilName}
                        </div>
                      )}
                      <div className="text-[10px] text-slate-500 mt-1">
                        SKU: <span className="font-bold text-slate-700 dark:text-slate-300">{log.sku || 'FIN-WIR-1.5'}</span>
                        <span className="mx-1">•</span>
                        <span>{log.rackLocation || 'RACK E-03'}</span>
                      </div>
                    </td>

                    {/* Movement Type */}
                    <td className="px-3.5 py-3.5 align-top whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 rounded border text-[10px] font-bold ${badge.cls}`}>
                        {badge.pill}
                      </span>
                      <div className="text-[10px] text-slate-500 mt-1">
                        {log.reasonCode || badge.desc}
                      </div>
                    </td>

                    {/* Qty Delta */}
                    <td className="px-3.5 py-3.5 align-top text-right whitespace-nowrap">
                      <div
                        className={`font-black text-xs ${
                          isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {isPositive ? `+${log.qtyChange}` : log.qtyChange} {unit}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Bal: {log.newStock} {unit}
                      </div>
                    </td>

                    {/* Reference / Reason */}
                    <td className="px-4 py-3.5 align-top">
                      <div className="font-bold text-blue-700 dark:text-blue-400">
                        {log.referenceId || '#INV-2026-0842'}
                      </div>
                      <div className="text-[11px] text-slate-700 dark:text-slate-300 mt-0.5">
                        {log.note || 'Direct counter billing'}
                      </div>
                      {log.financialLoss && (
                        <div className="text-[10px] text-rose-600 font-bold mt-0.5">
                          Financial write-off: -₹{log.financialLoss.toFixed(2)}
                        </div>
                      )}
                    </td>

                    {/* Operator */}
                    <td className="px-3.5 py-3.5 align-top text-right whitespace-nowrap">
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {log.operator || 'Naveen [Staff]'}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        POS-01 • DHM
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="px-4 py-3 bg-[#eee9dc] dark:bg-[#152138] border-t border-[#ded9cb] dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-700 dark:text-slate-300">
          <div>
            {total === 0 ? (
              <span>0 OF 0 AUDIT RECORDS</span>
            ) : (
              <span>DISPLAYING {(currentPage - 1) * 15 + 1} - {Math.min(currentPage * 15, total)} OF {total} AUDIT RECORDS</span>
            )}
            <span className="mx-2">•</span>
            <span className="text-slate-500">Query Execution: {queryTime !== null ? `${queryTime}ms` : 'Live'}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="mr-1 font-bold text-[10px] uppercase text-slate-500">PAGES:</span>
            {[...Array(Math.min(5, totalPages))].map((_, i) => (
              <button
                key={i + 1}
                type="button"
                onClick={() => setCurrentPage(i + 1)}
                className={`w-6 h-6 rounded text-[10px] font-bold border ${
                  currentPage === i + 1
                    ? 'bg-black text-white border-black'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-[#ded9cb] dark:border-slate-700'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockLogs;
