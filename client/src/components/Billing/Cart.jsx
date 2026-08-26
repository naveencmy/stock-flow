import React, { useState, useMemo } from 'react';
import {
  ShoppingCart,
  User,
  Phone,
  CreditCard,
  Trash2,
  Printer,
  Receipt,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import CartItem from './CartItem';
import Button from '../common/Button';
import { formatCurrency } from '../../utils/formatCurrency';
import { calculateGst } from '../../utils/calculateGst';

export const Cart = ({ onCheckout, loading = false }) => {
  const { cart, updateCartQty, removeFromCart, clearCart } = useApp();

  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [discount, setDiscount] = useState('0');

  // Compute bill financials
  const totals = useMemo(() => {
    let subtotal = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    let totalIgst = 0;
    let totalTax = 0;

    cart.forEach((item) => {
      const linePrice = (Number(item.unitPrice) || 0) * (Number(item.quantity) || 1);
      const gst = calculateGst(linePrice, item.gstRate || 18);
      subtotal += linePrice;
      totalCgst += gst.cgst;
      totalSgst += gst.sgst;
      totalIgst += gst.igst;
      totalTax += gst.totalGst;
    });

    const discountAmount = Math.max(0, Number(discount) || 0);
    const grandTotal = Math.max(0, subtotal + totalTax - discountAmount);

    return {
      subtotal,
      cgst: totalCgst,
      sgst: totalSgst,
      igst: totalIgst,
      totalTax,
      discountAmount,
      grandTotal
    };
  }, [cart, discount]);

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    onCheckout({
      customerName: customerName.trim() || 'Walk-in Customer',
      customerPhone: customerPhone.trim(),
      paymentMethod,
      items: cart.map((i) => ({
        productId: i.productId,
        productName: i.productName,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        gstRate: i.gstRate || 18,
        lineTotal: i.unitPrice * i.quantity,
        unit: i.unit || 'piece'
      })),
      subtotal: totals.subtotal,
      cgst: totals.cgst,
      sgst: totals.sgst,
      igst: totals.igst,
      totalGst: totals.totalTax,
      discount: totals.discountAmount,
      grandTotal: totals.grandTotal
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-4 sm:p-5 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
            <Receipt className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Current Bill</h3>
            <p className="text-xs text-slate-500">{cart.length} unique items</p>
          </div>
        </div>

        {cart.length > 0 && (
          <button
            type="button"
            onClick={clearCart}
            className="text-xs font-semibold text-slate-400 hover:text-red-600 transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* Customer Info Section */}
      <div className="py-3 space-y-2.5 border-b border-slate-100 shrink-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Customer Name */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Customer
            </label>
            <div className="relative">
              <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Customer Name"
                className="w-full pl-8 pr-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Customer Phone */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="10-digit mobile"
                maxLength={10}
                className="w-full pl-8 pr-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Payment Method Choice */}
        <div className="flex items-center gap-1.5 pt-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
            Payment:
          </span>
          {['Cash', 'UPI', 'Card', 'Credit'].map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setPaymentMethod(mode)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                paymentMethod === mode
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Cart Line Items */}
      <div className="flex-1 overflow-y-auto py-3 space-y-2 min-h-[180px] max-h-[300px]">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <ShoppingCart className="w-10 h-10 mb-2 stroke-1" />
            <p className="text-sm font-semibold text-slate-600">Cart is empty</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Click "+ Add to Bill" from the product list to begin
            </p>
          </div>
        ) : (
          cart.map((item) => (
            <CartItem
              key={item.productId}
              item={item}
              onUpdateQty={updateCartQty}
              onRemove={removeFromCart}
            />
          ))
        )}
      </div>

      {/* Financial Summary & Breakdown */}
      <div className="pt-3 border-t border-slate-200/80 space-y-2 shrink-0 bg-slate-50/50 -mx-4 -mb-4 p-4 rounded-b-2xl">
        <div className="space-y-1.5 text-xs text-slate-600">
          <div className="flex justify-between">
            <span>Items Subtotal:</span>
            <span className="font-semibold text-slate-800">
              {formatCurrency(totals.subtotal)}
            </span>
          </div>

          {/* GST Breakup */}
          {totals.cgst > 0 && (
            <>
              <div className="flex justify-between text-slate-500 pl-2 text-[11px]">
                <span>• CGST (9%):</span>
                <span>{formatCurrency(totals.cgst)}</span>
              </div>
              <div className="flex justify-between text-slate-500 pl-2 text-[11px]">
                <span>• SGST (9%):</span>
                <span>{formatCurrency(totals.sgst)}</span>
              </div>
            </>
          )}

          {totals.igst > 0 && (
            <div className="flex justify-between text-slate-500 pl-2 text-[11px]">
              <span>• IGST:</span>
              <span>{formatCurrency(totals.igst)}</span>
            </div>
          )}

          {/* Discount Input */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-slate-600 font-medium">Special Discount:</span>
            <div className="flex items-center gap-1 w-24">
              <span className="text-xs text-slate-400 font-semibold">₹</span>
              <input
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                placeholder="0"
                className="w-full px-2 py-1 text-right text-xs bg-white border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none font-semibold text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Grand Total Bar */}
        <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Grand Total
            </span>
            <span className="text-[10px] text-slate-400">Incl. all taxes & discounts</span>
          </div>
          <span className="text-2xl font-black text-blue-700 font-mono">
            {formatCurrency(totals.grandTotal)}
          </span>
        </div>

        {/* Save & Print Trigger */}
        <Button
          variant="primary"
          size="lg"
          icon={Printer}
          onClick={handleCheckoutSubmit}
          disabled={cart.length === 0 || loading}
          loading={loading}
          className="w-full font-bold shadow-md bg-blue-600 hover:bg-blue-700 active:bg-blue-800 mt-2"
        >
          Save & Print Invoice (A4)
        </Button>
      </div>
    </div>
  );
};

export default Cart;
