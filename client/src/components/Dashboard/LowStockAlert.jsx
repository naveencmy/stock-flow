import React from 'react';
import { AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';

export const LowStockAlert = ({ products = [], onRestockClick }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Low Stock Alerts</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Items at or below reorder threshold requiring immediate restocking
            </p>
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${products.length > 0 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
          {products.length} {products.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      {products.length === 0 ? (
        <div className="p-8 text-center flex flex-col items-center justify-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-2" />
          <h4 className="text-sm font-bold text-slate-800">All Stock Levels Healthy</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            All electrical products are currently well above their respective reorder limits.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="px-5 py-3">Product Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-center">Current Stock</th>
                <th className="px-4 py-3 text-center">Reorder At</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((item) => (
                <tr key={item._id} className="hover:bg-amber-50/40 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-slate-900">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0" />
                      <span>{item.name}</span>
                    </div>
                    {item.brand && (
                      <span className="text-[11px] text-slate-400 block ml-4">
                        Brand: {item.brand}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-600">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 font-medium">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center font-bold text-red-600">
                    <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded-full text-xs font-black">
                      {item.stockQty} {item.unit || 'pcs'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center text-xs font-semibold text-slate-500">
                    {item.reorderLevel} {item.unit || 'pcs'}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onRestockClick ? onRestockClick(item) : navigate('/products')}
                      className="text-xs py-1 px-3 bg-amber-600 hover:bg-amber-700"
                    >
                      Restock
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 px-5">
        <span>View all products to update reorder thresholds</span>
        <button
          type="button"
          onClick={() => navigate('/products')}
          className="font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          <span>All Products</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default LowStockAlert;
