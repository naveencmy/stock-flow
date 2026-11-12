import React, { useEffect, useState, useCallback } from 'react';
import {
  BarChart3,
  Filter,
  RefreshCw,
  ArrowUpRight,
  ArrowDownLeft,
  RotateCcw,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Package
} from 'lucide-react';
import { stockLogService, productService } from '../api/services';
import { formatDateTime } from '../utils/formatDate';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';

export const StockLogs = () => {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [selectedProduct, setSelectedProduct] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await stockLogService.getAll({
        product: selectedProduct === 'All' ? '' : selectedProduct,
        changeType: selectedType === 'All' ? '' : selectedType,
        page: currentPage,
        limit: 15
      });
      setLogs(data.logs || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Failed to load stock logs', err);
    } finally {
      setLoading(false);
    }
  }, [selectedProduct, selectedType, currentPage]);

  useEffect(() => {
    productService.getAll({ limit: 100 }).then((res) => {
      setProductsList(res.products || []);
    });
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const getTypeBadge = (type) => {
    const t = (type || '').toLowerCase();
    switch (t) {
      case 'sale':
        return {
          label: 'Sale Deduct',
          bg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-200/60 dark:border-rose-800/60',
          icon: ArrowDownLeft
        };
      case 'purchase':
        return {
          label: 'Purchase / Inward',
          bg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/60',
          icon: ArrowUpRight
        };
      case 'adjustment':
        return {
          label: 'Adjustment',
          bg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/60',
          icon: SlidersHorizontal
        };
      case 'return':
        return {
          label: 'Customer Return',
          bg: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-cyan-400 border-blue-200/60 dark:border-cyan-800/60',
          icon: RotateCcw
        };
      default:
        return {
          label: type,
          bg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
          icon: BarChart3
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Inventory Stock Logs
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Complete audit trail of sales deductions, supplier inward entries, and inventory adjustments.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          onClick={fetchLogs}
          loading={loading}
        >
          Refresh Logs
        </Button>
      </div>

      {/* Filter Control Card */}
      <div className="bg-white/90 dark:bg-[#121a2d]/90 backdrop-blur-md rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80 dark:border-slate-800/90 flex flex-col md:flex-row items-center justify-between gap-3 transition-colors">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Product Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
            <select
              value={selectedProduct}
              onChange={(e) => {
                setSelectedProduct(e.target.value);
                setCurrentPage(1);
              }}
              className="py-2 px-3 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-medium"
            >
              <option value="All">All Products</option>
              {productsList.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Change Type Filter */}
          <div className="flex items-center gap-2">
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setCurrentPage(1);
              }}
              className="py-2 px-3 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-medium"
            >
              <option value="All">All Change Types</option>
              <option value="purchase">Purchase (Inward)</option>
              <option value="sale">Sale (Deduction)</option>
              <option value="adjustment">Manual Adjustment</option>
              <option value="return">Customer Return</option>
            </select>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 overflow-x-auto w-full md:w-auto justify-start md:justify-end">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Purchase
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> Sale
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Adjustment
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500" /> Return
          </span>
        </div>
      </div>

      {/* Stock Logs Table */}
      <div className="bg-white/90 dark:bg-[#121a2d]/90 backdrop-blur-md rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-800/90 overflow-hidden relative transition-colors">
        {loading && <LoadingSpinner overlay message="Updating audit logs..." />}

        {logs.length === 0 && !loading ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            <BarChart3 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">No Stock Logs Found</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              No inventory movements recorded matching your current filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 dark:bg-[#151f32]/80 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200/80 dark:border-slate-800/80">
                <tr>
                  <th className="px-5 py-3.5">Timestamp</th>
                  <th className="px-4 py-3.5">Product Name</th>
                  <th className="px-4 py-3.5 text-center">Type</th>
                  <th className="px-4 py-3.5 text-center">Quantity Change</th>
                  <th className="px-4 py-3.5 text-center">Ending Balance</th>
                  <th className="px-5 py-3.5">Reference / Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {logs.map((log) => {
                  const badge = getTypeBadge(log.changeType);
                  const Icon = badge.icon;
                  const isPositive = Number(log.changeQty) > 0;

                  return (
                    <tr key={log._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-3.5 text-xs text-slate-600 dark:text-slate-400 font-mono">
                        {formatDateTime(log.createdAt)}
                      </td>

                      <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-white">
                        {log.productName}
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold border ${badge.bg}`}
                        >
                          <Icon className="w-3 h-3 shrink-0" />
                          <span>{badge.label}</span>
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-center font-tabular font-bold">
                        <span
                          className={
                            isPositive
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }
                        >
                          {isPositive ? `+${log.changeQty}` : log.changeQty}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-center font-bold font-tabular text-slate-800 dark:text-slate-200">
                        {log.balanceQty}
                      </td>

                      <td className="px-5 py-3.5 text-xs text-slate-500 dark:text-slate-400">
                        {log.reference && (
                          <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                            Ref: {log.reference}
                          </span>
                        )}
                        <span>{log.notes || '—'}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="p-4 bg-slate-50/80 dark:bg-[#151f32]/60 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
          <div>
            Showing <span className="font-semibold font-tabular text-slate-900 dark:text-white">{logs.length}</span> of{' '}
            <span className="font-semibold font-tabular text-slate-900 dark:text-white">{total}</span> log events
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage <= 1}
              icon={ChevronLeft}
            >
              Previous
            </Button>
            <span className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold font-tabular text-slate-800 dark:text-slate-200">
              Page {currentPage} of {totalPages || 1}
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4 shrink-0" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockLogs;
