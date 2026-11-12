import React from 'react';
import { AlertTriangle, CheckCircle2, ArrowRight, PackageOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';

export const LowStockAlert = ({ products = [], onRestockClick }) => {
  const navigate = useNavigate();

  return (
    <div className="rounded-2xl bg-white/90 dark:bg-[#121a2d]/90 backdrop-blur-md shadow-xs border border-slate-200/80 dark:border-slate-800/90 overflow-hidden transition-colors">
      <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Low Stock Radar</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Items at or below reorder threshold requiring immediate restocking
            </p>
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
          products.length > 0
            ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 animate-pulse'
            : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
        }`}>
          {products.length} {products.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      {products.length === 0 ? (
        <div className="p-8 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">All Stock Levels Healthy</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
            All electrical and hardware supplies are currently above their minimum safety limits.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/70 dark:bg-[#151f32]/60 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200/80 dark:border-slate-800/80">
              <tr>
                <th className="px-5 py-3">Product Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-center">Stock Level</th>
                <th className="px-4 py-3 text-center">Safety Limit</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {products.map((item) => (
                <tr key={item._id} className="hover:bg-amber-50/40 dark:hover:bg-amber-950/20 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-slate-900 dark:text-white">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
                      <span className="font-semibold">{item.name}</span>
                    </div>
                    {item.brand && (
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 block ml-4">
                        Brand: {item.brand}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-600 dark:text-slate-400">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-medium">
                      {typeof item.category === 'object' && item.category !== null
                        ? item.category.name
                        : (item.category || 'General')}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center font-tabular font-bold">
                    <span className="bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 px-2.5 py-1 rounded-full text-xs">
                      {item.stockQty} {item.unit || 'pcs'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center text-xs font-tabular font-semibold text-slate-500 dark:text-slate-400">
                    {item.reorderLevel} {item.unit || 'pcs'}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onRestockClick ? onRestockClick(item) : navigate('/products')}
                      className="text-xs py-1 px-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 border-none shadow-xs"
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

      <div className="p-3 bg-slate-50/70 dark:bg-[#151f32]/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-5">
        <span>Keep your inventory replenished to prevent checkout stock-outs</span>
        <button
          type="button"
          onClick={() => navigate('/products')}
          className="font-semibold text-blue-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
        >
          <span>Catalog</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default LowStockAlert;
