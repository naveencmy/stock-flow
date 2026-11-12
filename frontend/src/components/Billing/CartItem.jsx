import React from 'react';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';

export const CartItem = ({
  item,
  onUpdateQty,
  onRemove
}) => {
  const lineTotal = (Number(item.unitPrice) || 0) * (Number(item.quantity) || 1);
  const isAtMaxStock = item.quantity >= item.stockQty;

  return (
    <div className="p-3 bg-white dark:bg-[#151f32] rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex items-center justify-between gap-3">
      {/* Product Title & Line Price */}
      <div className="min-w-0 flex-1">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
          {item.productName}
        </h4>
        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-700 dark:text-slate-300 font-tabular">
            {formatCurrency(item.unitPrice)}
          </span>
          <span>×</span>
          <span className="font-tabular font-bold text-slate-800 dark:text-slate-200">{item.quantity}</span>
          <span>=</span>
          <span className="font-bold font-tabular text-blue-600 dark:text-cyan-400">
            {formatCurrency(lineTotal)}
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
            ({item.gstRate}% GST)
          </span>
        </div>
      </div>

      {/* Quantity Stepper */}
      <div className="flex items-center gap-1.5 shrink-0 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={() => onUpdateQty(item.productId, item.quantity - 1)}
          className="w-6 h-6 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center justify-center shadow-xs transition-colors"
          title="Decrease"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        <span className="w-7 text-center text-xs font-bold text-slate-900 dark:text-white font-tabular">
          {item.quantity}
        </span>

        <button
          type="button"
          onClick={() => onUpdateQty(item.productId, item.quantity + 1)}
          disabled={isAtMaxStock}
          className={`w-6 h-6 rounded-lg flex items-center justify-center shadow-xs transition-colors ${
            isAtMaxStock
              ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
              : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600'
          }`}
          title={isAtMaxStock ? `Max stock reached (${item.stockQty})` : 'Increase'}
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Delete Item */}
      <button
        type="button"
        onClick={() => onRemove(item.productId)}
        className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
        title="Remove item"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

export default CartItem;
