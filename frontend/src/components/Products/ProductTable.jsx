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
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
          <Package className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-800">No Products Found</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
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
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200/80">
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
          <tbody className="divide-y divide-slate-100">
            {products.map((item) => {
              const isLowStock = Number(item.stockQty) <= Number(item.reorderLevel);
              return (
                <tr
                  key={item._id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    isLowStock ? 'bg-amber-50/30' : ''
                  }`}
                >
                  <td className="px-5 py-4">
                    <div className="font-semibold text-slate-900 leading-snug">
                      {item.name}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      {item.brand && (
                        <span className="font-medium text-slate-600">
                          Brand: {item.brand}
                        </span>
                      )}
                      {item.barcode && (
                        <span className="flex items-center gap-1 font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">
                          <Barcode className="w-3 h-3 text-slate-400" />
                          {item.barcode}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-4 text-xs">
                    <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium border border-slate-200/60">
                      {typeof item.category === 'object' && item.category !== null
                        ? item.category.name
                        : (item.category || 'General')}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-right font-bold text-slate-900">
                    {formatCurrency(item.unitPrice)}
                    <span className="text-[11px] text-slate-400 font-normal block">
                      per {item.unit || 'unit'}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-center">
                    {isLowStock ? (
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-700 font-bold text-xs">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          {item.stockQty} {item.unit || 'pcs'}
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-xs border border-emerald-200/50">
                        {item.stockQty} {item.unit || 'pcs'}
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-4 text-center text-xs font-semibold text-slate-500">
                    {item.reorderLevel} {item.unit || 'pcs'}
                  </td>

                  <td className="px-4 py-4 text-center text-xs">
                    <span className="font-bold text-slate-700">{item.gstRate}%</span>
                    <span className="text-[10px] text-slate-400 block">
                      {item.gstRate === 18 ? '9% + 9%' : 'IGST'}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Edit Product"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(item)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
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
      <div className="p-4 bg-slate-50 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
        <div>
          Showing <span className="font-semibold text-slate-900">{products.length}</span> of{' '}
          <span className="font-semibold text-slate-900">{totalItems}</span> total products
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

export default ProductTable;
