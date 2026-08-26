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
    <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex items-center justify-between gap-3">
      {/* Product Title & Line Price */}
      <div className="min-w-0 flex-1">
        <h4 className="text-sm font-bold text-slate-900 truncate">
          {item.productName}
        </h4>
        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
          <span className="font-semibold text-slate-700">
            {formatCurrency(item.unitPrice)}
          </span>
          <span>× {item.quantity}</span>
          <span>=</span>
          <span className="font-bold text-blue-600">
            {formatCurrency(lineTotal)}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            ({item.gstRate}% GST)
          </span>
        </div>
      </div>

      {/* Quantity Stepper */}
      <div className="flex items-center gap-1.5 shrink-0 bg-slate-100 p-1 rounded-lg border border-slate-200">
        <button
          type="button"
          onClick={() => onUpdateQty(item.productId, item.quantity - 1)}
          className="w-6 h-6 rounded-md bg-white text-slate-700 hover:bg-slate-200 flex items-center justify-center shadow-xs transition-colors"
          title="Decrease"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        <span className="w-8 text-center text-xs font-bold text-slate-900 font-mono">
          {item.quantity}
        </span>

        <button
          type="button"
          onClick={() => onUpdateQty(item.productId, item.quantity + 1)}
          disabled={isAtMaxStock}
          className={`w-6 h-6 rounded-md flex items-center justify-center shadow-xs transition-colors ${
            isAtMaxStock
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-white text-slate-700 hover:bg-slate-200'
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
        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
        title="Remove item"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

export default CartItem;
