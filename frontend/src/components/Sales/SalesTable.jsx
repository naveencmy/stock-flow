import React from 'react';
import { Eye, Printer, Receipt, ChevronLeft, ChevronRight, User, MessageCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDateTime } from '../../utils/formatDate';
import { sendWhatsAppBill } from '../../utils/whatsapp';
import Button from '../common/Button';

export const SalesTable = ({
  sales = [],
  loading = false,
  onView,
  onPrint,
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  onPageChange
}) => {
  if (!loading && sales.length === 0) {
    return (
      <div className="bg-white/90 dark:bg-[#121a2d]/90 backdrop-blur-md rounded-2xl p-12 text-center border border-slate-200/80 dark:border-slate-800/90 shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-cyan-400 flex items-center justify-center mx-auto mb-4 border border-blue-200/50 dark:border-cyan-800/50">
          <Receipt className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">No Sales Records Found</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
          No bills match your current search or date range filters.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/90 dark:bg-[#121a2d]/90 backdrop-blur-md rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-800/90 overflow-hidden transition-colors">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/80 dark:bg-[#151f32]/80 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200/80 dark:border-slate-800/80">
            <tr>
              <th className="px-5 py-3.5">Bill #</th>
              <th className="px-4 py-3.5">Date & Time</th>
              <th className="px-4 py-3.5">Customer</th>
              <th className="px-4 py-3.5 text-center">Items</th>
              <th className="px-4 py-3.5 text-center">Payment</th>
              <th className="px-4 py-3.5 text-right">Grand Total</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {sales.map((sale) => (
              <tr key={sale._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                <td className="px-5 py-3.5">
                  <span className="font-mono font-bold text-blue-700 dark:text-cyan-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-1 rounded-md text-xs border border-blue-200/60 dark:border-cyan-800/60">
                    {sale.billNumber}
                  </span>
                </td>

                <td className="px-4 py-3.5 text-xs text-slate-600 dark:text-slate-400 font-mono">
                  {formatDateTime(sale.createdAt)}
                </td>

                <td className="px-4 py-3.5 text-xs font-medium text-slate-900 dark:text-white">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{sale.customerName || 'Walk-in Customer'}</span>
                  </div>
                  {sale.customerPhone && (
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 block ml-5 font-mono">
                      {sale.customerPhone}
                    </span>
                  )}
                </td>

                <td className="px-4 py-3.5 text-center">
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold font-tabular text-xs">
                    {sale.items?.length || 0}
                  </span>
                </td>

                <td className="px-4 py-3.5 text-center">
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold capitalize border border-slate-200/60 dark:border-slate-700/60">
                    {sale.paymentMethod || 'cash'}
                  </span>
                </td>

                <td className="px-4 py-3.5 text-right font-bold text-slate-900 dark:text-white">
                  <span className="font-tabular text-blue-600 dark:text-cyan-400 text-sm">
                    {formatCurrency(sale.grandTotal)}
                  </span>
                </td>

                <td className="px-5 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {sale.customerPhone && (
                      <button
                        type="button"
                        onClick={() => sendWhatsAppBill(sale, true)}
                        className="p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                        title="Send invoice on WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onView(sale)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 dark:hover:text-cyan-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                      title="View Invoice Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onPrint(sale)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Print Invoice"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="px-5 py-3.5 bg-slate-50/80 dark:bg-[#151f32]/60 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div>
            Showing <span className="font-bold font-tabular text-slate-700 dark:text-slate-200">{(currentPage - 1) * 10 + 1}</span> to{' '}
            <span className="font-bold font-tabular text-slate-700 dark:text-slate-200">
              {Math.min(currentPage * 10, totalItems)}
            </span>{' '}
            of <span className="font-bold font-tabular text-slate-700 dark:text-slate-200">{totalItems}</span> invoices
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-semibold font-tabular">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesTable;
