import React from 'react';
import { Eye, Printer, Receipt, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDateTime } from '../../utils/formatDate';
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
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
          <Receipt className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-800">No Sales Records Found</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
          No bills match your current search or date range filters.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200/80">
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
          <tbody className="divide-y divide-slate-100">
            {sales.map((sale) => (
              <tr key={sale._id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-5 py-3.5">
                  <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-md text-xs border border-blue-200/60">
                    {sale.billNumber}
                  </span>
                </td>

                <td className="px-4 py-3.5 text-xs text-slate-600">
                  {formatDateTime(sale.createdAt)}
                </td>

                <td className="px-4 py-3.5 text-xs font-medium text-slate-900">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{sale.customerName || 'Walk-in Customer'}</span>
                  </div>
                  {sale.customerPhone && (
                    <span className="text-[11px] text-slate-400 block ml-5 font-mono">
                      {sale.customerPhone}
                    </span>
                  )}
                </td>

                <td className="px-4 py-3.5 text-center text-xs">
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                    {sale.items?.reduce((acc, i) => acc + (Number(i.quantity) || 1), 0) || 0} pcs
                  </span>
                </td>

                <td className="px-4 py-3.5 text-center text-xs">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold text-[11px]">
                    {sale.paymentMethod || 'Cash'}
                  </span>
                </td>

                <td className="px-4 py-3.5 text-right font-black text-slate-900 font-mono">
                  {formatCurrency(sale.grandTotal)}
                </td>

                <td className="px-5 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => onView(sale)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="View Bill"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onPrint(sale)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
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
      <div className="p-4 bg-slate-50 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
        <div>
          Showing <span className="font-semibold text-slate-900">{sales.length}</span> of{' '}
          <span className="font-semibold text-slate-900">{totalItems}</span> total sales
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            icon={ChevronLeft}
          >
            Previous
          </Button>
          <span className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 font-bold text-slate-800">
            Page {currentPage} of {totalPages || 1}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Next
            <ChevronRight className="w-4 h-4 shrink-0" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SalesTable;
