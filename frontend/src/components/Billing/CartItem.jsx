import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';

export const CartItem = ({ item, onUpdateQty, onRemove }) => {
  const lineTotal = (Number(item.unitPrice) || 0) * (Number(item.quantity) || 1);
  const isAtMaxStock = item.quantity >= item.stockQty;

  return (
    <div className="p-2.5 bg-white dark:bg-[#060a12] rounded border border-[#ded9cb] dark:border-slate-800 transition-all flex items-center justify-between gap-2.5 font-mono text-xs">
      {/* Product Title & Rate */}
      <div className="min-w-0 flex-1">
        <h4 className="font-bold text-slate-900 dark:text-white truncate font-sans text-xs">
          {item.productName}
        </h4>
        {item.tamilName && (
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-tamil truncate">
            {item.tamilName}
          </p>
        )}
        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-600 dark:text-slate-400">
          <span className="font-bold text-slate-800 dark:text-slate-200">
            {formatCurrency(item.unitPrice)}
          </span>
          <span>×</span>
          <span className="font-bold">{item.quantity}</span>
          <span>=</span>
          <span className="font-black text-slate-900 dark:text-white">
            {formatCurrency(lineTotal)}
          </span>
        </div>
      </div>

      {/* Quantity Stepper */}
      <div className="flex items-center gap-1 shrink-0 bg-[#f4f1e8] dark:bg-slate-800 p-0.5 rounded border border-[#ded9cb] dark:border-slate-700">
        <button
          type="button"
          onClick={() => onUpdateQty(item.productId, item.quantity - 1)}
          className="w-5 h-5 rounded bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-[#eee9dc] flex items-center justify-center font-bold text-xs"
        >
          <Minus className="w-3 h-3" />
        </button>

        <span className="w-6 text-center text-xs font-bold text-slate-900 dark:text-white">
          {item.quantity}
        </span>

        <button
          type="button"
          onClick={() => onUpdateQty(item.productId, item.quantity + 1)}
          disabled={isAtMaxStock}
          className={`w-5 h-5 rounded flex items-center justify-center font-bold text-xs ${
            isAtMaxStock
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-[#eee9dc]'
          }`}
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      {/* Remove */}
      <button
        type="button"
        onClick={() => onRemove(item.productId)}
        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
        title="Remove item"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default CartItem;
