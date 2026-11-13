import React from 'react';
import { formatCurrency } from '../../utils/formatCurrency';

export const SalesTable = ({
  sales = [],
  selectedSaleId = null,
  onSelectSale,
  onReprint,
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  onPageChange
}) => {
  if (sales.length === 0) {
    return (
      <div className="bg-white dark:bg-[#0c1322] rounded border border-[#ded9cb] dark:border-slate-800 p-8 text-center text-xs font-mono">
        <p className="text-slate-500">No transactions recorded for this period.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#faf8f5] dark:bg-[#0c1322] rounded border border-[#ded9cb] dark:border-slate-800 overflow-hidden font-mono text-xs shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-[#eee9dc] dark:bg-[#152138] text-slate-700 dark:text-slate-300 uppercase text-[10px] font-bold tracking-wider border-b border-[#ded9cb] dark:border-slate-800">
            <tr>
              <th className="px-3 py-2.5">DATE &amp; TIME</th>
              <th className="px-3 py-2.5">INVOICE #</th>
              <th className="px-3 py-2.5">CUSTOMER &amp; CONTACT</th>
              <th className="px-3 py-2.5 text-center">PAYMENT STATUS</th>
              <th className="px-3 py-2.5 text-right">TOTAL (₹)</th>
              <th className="px-3 py-2.5 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e8e3d5] dark:divide-slate-800/80 bg-white dark:bg-[#0c1322]">
            {sales.map((sale) => {
              const dateObj = new Date(sale.createdAt || Date.now());
              const dateStr = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
              const timeStr = dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });

              const isSelected = selectedSaleId === sale._id;
              const pay = (sale.paymentMethod || 'cash').toLowerCase();

              let badgeClass = 'bg-slate-100 text-slate-700 border-slate-300';
              let badgeText = 'CASH - SETTLED';

              if (pay === 'upi') {
                badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-300';
                badgeText = 'UPI - PAID';
              } else if (pay === 'khata') {
                badgeClass = 'bg-amber-50 text-amber-700 border-amber-300';
                badgeText = 'KHATA - PENDING';
              } else if (pay === 'card') {
                badgeClass = 'bg-blue-50 text-blue-700 border-blue-300';
                badgeText = 'CARD - PAID';
              }

              return (
                <tr
                  key={sale._id}
                  onClick={() => onSelectSale(sale)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-l-4 border-l-blue-600'
                      : 'hover:bg-[#f6f3eb] dark:hover:bg-slate-800/40'
                  }`}
                >
                  {/* Date & Time */}
                  <td className="px-3 py-3 align-top whitespace-nowrap">
                    <span className="font-bold text-slate-900 dark:text-white">{dateStr}</span>
                    <span className="text-slate-500 ml-1.5">{timeStr}</span>
                  </td>

                  {/* Invoice # */}
                  <td className="px-3 py-3 align-top whitespace-nowrap">
                    <span className="font-bold text-blue-700 dark:text-blue-400">
                      {sale.billNumber}
                    </span>
                  </td>

                  {/* Customer & Contact */}
                  <td className="px-3 py-3 align-top">
                    <div className="font-bold text-slate-900 dark:text-white font-sans text-xs">
                      {sale.customerName || 'Walk-in Customer'}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {sale.customerPhone ? `+91 ${sale.customerPhone}` : 'Counter Sale'}
                      {sale.customerGstin && ` • GSTIN: ${sale.customerGstin}`}
                    </div>
                  </td>

                  {/* Payment Status Badge */}
                  <td className="px-3 py-3 align-top text-center whitespace-nowrap">
                    <span
                      className={`inline-block px-2 py-0.5 rounded border text-[10px] font-bold ${badgeClass}`}
                    >
                      {badgeText}
                    </span>
                  </td>

                  {/* Total */}
                  <td className="px-3 py-3 align-top text-right font-black text-slate-900 dark:text-white whitespace-nowrap">
                    {formatCurrency(sale.grandTotal)}
                  </td>

                  {/* Actions */}
                  <td className="px-3 py-3 align-top text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => onSelectSale(sale)}
                        className="px-2 py-1 rounded border border-[#ded9cb] dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px] hover:bg-[#eee9dc]"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => onReprint(sale)}
                        className="px-2 py-1 rounded border border-[#ded9cb] dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px] hover:bg-[#eee9dc]"
                      >
                        Reprint
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-3 py-2.5 bg-[#eee9dc] dark:bg-[#152138] border-t border-[#ded9cb] dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-700 dark:text-slate-300">
        <div>
          DISPLAYING {(currentPage - 1) * 15 + 1} - {Math.min(currentPage * 15, totalItems)} OF {totalItems} TRANSACTIONS
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="px-2 py-0.5 rounded border border-[#ded9cb] dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 text-[10px] font-bold"
          >
            Prev
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              type="button"
              onClick={() => onPageChange(i + 1)}
              className={`w-6 h-6 rounded text-[10px] font-bold border ${
                currentPage === i + 1
                  ? 'bg-black text-white border-black'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-[#ded9cb] dark:border-slate-700'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="px-2 py-0.5 rounded border border-[#ded9cb] dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 text-[10px] font-bold"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalesTable;
