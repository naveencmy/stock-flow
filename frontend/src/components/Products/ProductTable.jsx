import React from 'react';
import { formatCurrency } from '../../utils/formatCurrency';

export const ProductTable = ({
  products = [],
  loading = false,
  onEdit,
  onAdjust,
  onAddClick,
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  onPageChange
}) => {
  if (!loading && products.length === 0) {
    return (
      <div className="bg-[#faf8f5] dark:bg-[#121a2d] rounded border border-[#ded9cb] dark:border-slate-800 p-12 text-center shadow-xs">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 font-sans">
          No Products Found
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          No inventory products match your search or filter criteria.
        </p>
        <button
          onClick={onAddClick}
          className="mt-4 px-4 py-1.5 rounded bg-blue-600 text-white font-mono text-xs font-bold"
        >
          + Add First Product [Insert]
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#faf8f5] dark:bg-[#0e1626] rounded border border-[#ded9cb] dark:border-slate-800 overflow-hidden shadow-xs transition-colors">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-[#eee9dc] dark:bg-[#152138] text-slate-700 dark:text-slate-300 uppercase text-[10px] font-bold tracking-wider border-b border-[#ded9cb] dark:border-slate-800">
            <tr>
              <th className="px-4 py-3">ITEM &amp; VISUAL DESCRIPTION</th>
              <th className="px-3 py-3">SKU / LOCATION</th>
              <th className="px-3 py-3">PACKAGING &amp; CONVERSION</th>
              <th className="px-3 py-3">STOCK LEVEL &amp; SAFETY</th>
              <th className="px-3 py-3 text-right">PURCHASE (₹)</th>
              <th className="px-3 py-3 text-right">SELLING (₹)</th>
              <th className="px-4 py-3 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e8e3d5] dark:divide-slate-800/80 bg-white dark:bg-[#0c1322]">
            {products.map((item) => {
              const stock = Number(item.stockQty) || 0;
              const reorder = Number(item.reorderLevel) || 5;
              const isCritical = stock <= reorder;

              const purchase = Number(item.purchasePrice) || Math.round((Number(item.unitPrice) || 0) * 0.78);
              const selling = Number(item.unitPrice) || 0;
              const margin = purchase > 0 ? (((selling - purchase) / purchase) * 100).toFixed(1) : 0;

              return (
                <tr
                  key={item._id}
                  className="hover:bg-[#f6f3eb] dark:hover:bg-slate-800/40 transition-colors"
                >
                  {/* Col 1: Item & Visual Description */}
                  <td className="px-4 py-3.5 align-top">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded border border-[#ded9cb] dark:border-slate-700 bg-[#f4f1e8] dark:bg-slate-800 text-slate-500 text-[9px] font-bold flex items-center justify-center shrink-0 uppercase">
                        {item.brand ? item.brand.slice(0, 3) : 'PRD'}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white font-sans text-xs">
                          {item.name}
                        </div>
                        {item.tamilName && (
                          <div className="text-[11px] text-slate-600 dark:text-slate-400 font-tamil mt-0.5">
                            {item.tamilName}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Col 2: SKU / Location */}
                  <td className="px-3 py-3.5 align-top whitespace-nowrap">
                    <div className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                      {item.sku || item.barcode || 'FIN-WIR-1.5'}
                    </div>
                    <div className="mt-1">
                      <span className="inline-block px-1.5 py-0.5 rounded border border-[#d2cbba] dark:border-slate-700 bg-[#eee9dc] dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                        {item.rackLocation || 'RACK E-03'}
                      </span>
                    </div>
                  </td>

                  {/* Col 3: Packaging & Conversion */}
                  <td className="px-3 py-3.5 align-top">
                    <div className="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">
                      {item.packagingConversion || `1 ${item.unit || 'Box'} = Standard Pack`}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Base Unit: {item.unit || 'unit'}
                    </div>
                  </td>

                  {/* Col 4: Stock Level & Safety */}
                  <td className="px-3 py-3.5 align-top whitespace-nowrap">
                    {isCritical ? (
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-rose-600 dark:text-rose-400 text-xs">
                          {stock} {item.unit || 'Pcs'}
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 text-[9px] font-black tracking-wider">
                          CRITICAL
                        </span>
                      </div>
                    ) : (
                      <div className="font-black text-emerald-600 dark:text-emerald-400 text-xs">
                        {stock} {item.unit || 'Coils'}
                      </div>
                    )}
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Min Reorder: {reorder} {item.unit || 'Pcs'}
                    </div>
                  </td>

                  {/* Col 5: Purchase Price */}
                  <td className="px-3 py-3.5 align-top text-right whitespace-nowrap">
                    <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                      {formatCurrency(purchase)}
                    </div>
                  </td>

                  {/* Col 6: Selling Price */}
                  <td className="px-3 py-3.5 align-top text-right whitespace-nowrap">
                    <div className="font-black text-slate-900 dark:text-white text-xs">
                      {formatCurrency(selling)}
                    </div>
                    <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      +{margin}%
                    </div>
                  </td>

                  {/* Col 7: Action */}
                  <td className="px-4 py-3.5 align-top text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {isCritical && (
                        <button
                          type="button"
                          onClick={() => alert(`Draft Purchase Order generated for ${item.name}`)}
                          className="px-2 py-1 rounded border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold text-[10px] hover:bg-rose-100"
                        >
                          + PO
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        className="px-2 py-1 rounded border border-[#ded9cb] dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px] hover:bg-[#eee9dc]"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onAdjust(item)}
                        className="px-2 py-1 rounded border border-[#ded9cb] dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px] hover:bg-[#eee9dc]"
                      >
                        Adjust
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination & Status Footer */}
      <div className="px-4 py-3 bg-[#eee9dc] dark:bg-[#152138] border-t border-[#ded9cb] dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-700 dark:text-slate-300">
        <div>
          DISPLAYING {(currentPage - 1) * 10 + 1} - {Math.min(currentPage * 10, totalItems)} OF{' '}
          {totalItems} INVENTORY ITEMS
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="px-2.5 py-1 rounded border border-[#ded9cb] dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 font-bold text-[11px]"
          >
            Prev
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              type="button"
              onClick={() => onPageChange(i + 1)}
              className={`w-7 h-7 rounded text-[11px] font-bold border ${
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
            className="px-2.5 py-1 rounded border border-[#ded9cb] dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 font-bold text-[11px]"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductTable;
