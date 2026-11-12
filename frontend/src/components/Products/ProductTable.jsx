import React from 'react';
import {
  Edit2,
  Trash2,
  AlertTriangle,
  Package,
  ChevronLeft,
  ChevronRight,
  Barcode
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import Button from '../common/Button';

export const ProductTable = ({
  products = [],
  loading = false,
  onEdit,
  onDelete,
  onAddClick,
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  onPageChange
}) => {
  if (!loading && products.length === 0) {
    return (
      <div className="bg-white/90 dark:bg-[#121a2d]/90 backdrop-blur-md rounded-2xl p-12 text-center border border-slate-200/80 dark:border-slate-800/90 shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-cyan-400 flex items-center justify-center mx-auto mb-4 border border-blue-200/50 dark:border-cyan-800/50">
          <Package className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">No Products Found</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
          No inventory products match your search or filter criteria. Add a new item to get started.
        </p>
        <div className="mt-5">
          <Button variant="primary" onClick={onAddClick}>
            Add First Product
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/90 dark:bg-[#121a2d]/90 backdrop-blur-md rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-800/90 overflow-hidden transition-colors">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/80 dark:bg-[#151f32]/80 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200/80 dark:border-slate-800/80">
            <tr>
              <th className="px-5 py-3.5">Product & Details</th>
              <th className="px-4 py-3.5">Category</th>
              <th className="px-4 py-3.5 text-right">Unit Price</th>
              <th className="px-4 py-3.5 text-center">Stock Level</th>
              <th className="px-4 py-3.5 text-center">Reorder At</th>
              <th className="px-4 py-3.5 text-center">GST Rate</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {products.map((item) => {
              const isLowStock = Number(item.stockQty) <= Number(item.reorderLevel);
              const stockPercent = Math.min(100, Math.max(8, (Number(item.stockQty) / Math.max(Number(item.reorderLevel) * 2, 20)) * 100));

              return (
                <tr
                  key={item._id}
                  className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                    isLowStock ? 'bg-amber-50/30 dark:bg-amber-950/20' : ''
                  }`}
                >
                  <td className="px-5 py-4">
                    <div className="font-semibold text-slate-900 dark:text-white leading-snug">
                      {item.name}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {item.brand && (
                        <span className="font-medium text-slate-600 dark:text-slate-300">
                          Brand: {item.brand}
                        </span>
                      )}
                      {item.barcode && (
                        <span className="flex items-center gap-1 font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400">
                          <Barcode className="w-3 h-3 text-slate-400" />
                          {item.barcode}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-4 text-xs">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium border border-slate-200/60 dark:border-slate-700/60">
                      {typeof item.category === 'object' && item.category !== null
                        ? item.category.name
                        : (item.category || 'General')}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-right font-bold text-slate-900 dark:text-white">
                    <span className="font-tabular text-sm">{formatCurrency(item.unitPrice)}</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal block">
                      per {item.unit || 'unit'}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-center">
                    <div className="inline-flex flex-col items-center">
                      {isLowStock ? (
                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 font-bold font-tabular text-xs">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>
                            {item.stockQty} {item.unit || 'pcs'}
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold font-tabular text-xs border border-emerald-200/50 dark:border-emerald-800/50">
                          {item.stockQty} {item.unit || 'pcs'}
                        </span>
                      )}
                      {/* Visual stock meter */}
                      <div className="w-14 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isLowStock ? 'bg-rose-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${stockPercent}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4 text-center text-xs font-semibold font-tabular text-slate-500 dark:text-slate-400">
                    {item.reorderLevel} {item.unit || 'pcs'}
                  </td>

                  <td className="px-4 py-4 text-center text-xs font-tabular">
                    <span className="font-bold text-slate-700 dark:text-slate-300">{item.gstRate}%</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
                      {item.gstRate === 18 ? '9% + 9%' : 'GST'}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 dark:hover:text-cyan-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                        title="Edit Product"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(item._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
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
      {totalPages > 1 && (
        <div className="px-5 py-3.5 bg-slate-50/80 dark:bg-[#151f32]/60 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div>
            Showing <span className="font-bold font-tabular text-slate-700 dark:text-slate-200">{(currentPage - 1) * 10 + 1}</span> to{' '}
            <span className="font-bold font-tabular text-slate-700 dark:text-slate-200">
              {Math.min(currentPage * 10, totalItems)}
            </span>{' '}
            of <span className="font-bold font-tabular text-slate-700 dark:text-slate-200">{totalItems}</span> products
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

export default ProductTable;
