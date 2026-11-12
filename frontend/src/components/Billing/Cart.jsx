import React, { useState, useMemo } from 'react';
import {
  ShoppingCart,
  User,
  Phone,
  CreditCard,
  Trash2,
  Printer,
  Receipt,
  Sparkles,
  Coins,
  QrCode,
  Banknote,
  Keyboard,
  MessageCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import CartItem from './CartItem';
import Button from '../common/Button';
import { formatCurrency } from '../../utils/formatCurrency';
import { calculateGst } from '../../utils/calculateGst';

export const Cart = ({ onCheckout, loading = false }) => {
  const { cart, updateCartQty, removeFromCart, clearCart, playChime } = useApp();

  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState('');
  const [autoSendWhatsApp, setAutoSendWhatsApp] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [discount, setDiscount] = useState('0');
  const [tenderedAmount, setTenderedAmount] = useState('');

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

  // Real-time change return calculation
  const numericTendered = Number(tenderedAmount) || 0;
  const changeDue = numericTendered > 0 ? numericTendered - totals.grandTotal : 0;

  const handleSetExactTender = () => {
    setTenderedAmount(String(Math.ceil(totals.grandTotal)));
  };

  const handleAddTender = (amount) => {
    const current = Number(tenderedAmount) || 0;
    setTenderedAmount(String(current + amount));
  };

  const handleCheckoutSubmit = (e) => {
    e?.preventDefault();
    if (cart.length === 0) return;

    if (playChime) playChime('success');

    onCheckout({
      customerName: customerName.trim() || 'Walk-in Customer',
      customerPhone: customerPhone.trim() || undefined,
      autoSendWhatsApp,
      paymentMethod: (paymentMethod || 'cash').toLowerCase(),
      discountAmt: totals.discountAmount,
      discount: totals.discountAmount,
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
      grandTotal: totals.grandTotal,
      tenderedAmount: numericTendered || totals.grandTotal,
      changeDue: Math.max(0, changeDue)
    });
  };

  return (
    <div className="bg-white/90 dark:bg-[#121a2d]/90 backdrop-blur-md rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-800/90 p-4 sm:p-5 flex flex-col h-full transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50">
            <Receipt className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Active Invoice</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{cart.length} items in tray</p>
          </div>
        </div>

        {cart.length > 0 && (
          <button
            type="button"
            onClick={clearCart}
            className="text-xs font-semibold text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* Customer Info Section */}
      <div className="py-3 space-y-2.5 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Customer Name */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Customer
            </label>
            <div className="relative">
              <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Customer Name"
                className="w-full pl-8 pr-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Customer Phone */}
          <div>
            <label className="flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              <span>Phone Number</span>
              {customerPhone.trim().length === 10 && (
                <label className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 cursor-pointer select-none bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                  <input
                    type="checkbox"
                    checked={autoSendWhatsApp}
                    onChange={(e) => setAutoSendWhatsApp(e.target.checked)}
                    className="rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500 w-3 h-3"
                  />
                  <MessageCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>Auto-WhatsApp</span>
                </label>
              )}
            </label>
            <div className="relative">
              <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="10-digit mobile"
                maxLength={10}
                className="w-full pl-8 pr-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Payment Method Choice */}
        <div className="flex items-center gap-1.5 pt-1">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-1">
            Mode:
          </span>
          {[
            { id: 'Cash', icon: Banknote },
            { id: 'UPI', icon: QrCode },
            { id: 'Card', icon: CreditCard },
            { id: 'Credit', icon: Coins }
          ].map(({ id: mode, icon: ModeIcon }) => (
            <button
              key={mode}
              type="button"
              onClick={() => setPaymentMethod(mode)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                paymentMethod === mode
                  ? 'bg-blue-600 text-white shadow-xs ring-1 ring-blue-400'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <ModeIcon className="w-3 h-3" />
              <span>{mode}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Cart Line Items */}
      <div className="flex-1 overflow-y-auto py-3 space-y-2 min-h-[160px] max-h-[260px]">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800/60 flex items-center justify-center mb-2">
              <ShoppingCart className="w-6 h-6 stroke-1 text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Invoice tray is empty</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Click "+ Add" from product selector or use quick search (Ctrl+K)
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
      <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 space-y-2.5 shrink-0 bg-slate-50/70 dark:bg-[#0c1322]/80 -mx-4 -mb-4 p-4 rounded-b-2xl">
        <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex justify-between">
            <span>Items Subtotal:</span>
            <span className="font-semibold font-tabular text-slate-800 dark:text-slate-200">
              {formatCurrency(totals.subtotal)}
            </span>
          </div>

          {/* GST Breakup */}
          {totals.cgst > 0 && (
            <div className="flex justify-between text-slate-500 dark:text-slate-400 text-[11px]">
              <span>Tax (CGST + SGST):</span>
              <span className="font-tabular">{formatCurrency(totals.totalTax)}</span>
            </div>
          )}

          {/* Discount Input */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-slate-600 dark:text-slate-400 font-medium">Special Discount:</span>
            <div className="flex items-center gap-1 w-24">
              <span className="text-xs text-slate-400 font-semibold">₹</span>
              <input
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                placeholder="0"
                className="w-full px-2 py-1 text-right text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none font-tabular font-semibold text-slate-800 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Grand Total Bar */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Grand Total
            </span>
            <span className="text-[10px] text-slate-400">Incl. all taxes</span>
          </div>
          <span className="text-2xl font-black font-tabular text-blue-600 dark:text-cyan-400">
            {formatCurrency(totals.grandTotal)}
          </span>
        </div>

        {/* Quick Cash Tender Calculator (Only for Cash mode) */}
        {paymentMethod === 'Cash' && cart.length > 0 && (
          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Cash Tendered:
              </span>
              <div className="flex items-center gap-1 w-28">
                <span className="text-xs text-slate-400 font-semibold font-mono">₹</span>
                <input
                  type="number"
                  value={tenderedAmount}
                  onChange={(e) => setTenderedAmount(e.target.value)}
                  placeholder={String(Math.ceil(totals.grandTotal))}
                  className="w-full px-2 py-1 text-right text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-tabular font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Quick Currency Chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={handleSetExactTender}
                className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
              >
                Exact
              </button>
              {[100, 200, 500, 1000].map((note) => (
                <button
                  key={note}
                  type="button"
                  onClick={() => handleAddTender(note)}
                  className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-cyan-400 font-mono"
                >
                  +{note}
                </button>
              ))}
            </div>

            {/* Change Due Visualizer */}
            {numericTendered > 0 && (
              <div className={`pt-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold ${
                changeDue >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
              }`}>
                <span>{changeDue >= 0 ? 'Change to Return:' : 'Balance Due:'}</span>
                <span className="font-tabular text-sm">
                  {formatCurrency(Math.abs(changeDue))}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Auto-WhatsApp Helper Indicator */}
        {customerPhone.trim().length === 10 && autoSendWhatsApp && (
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/30 py-1.5 px-3 rounded-xl border border-emerald-200/50 dark:border-emerald-800/40 animate-fade-in">
            <MessageCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Auto-dispatches WhatsApp invoice to +91 {customerPhone.trim()}</span>
          </div>
        )}

        {/* Save & Print Trigger */}
        <Button
          variant="primary"
          size="lg"
          icon={Printer}
          onClick={handleCheckoutSubmit}
          disabled={cart.length === 0 || loading}
          loading={loading}
          className="w-full font-bold shadow-glow-sm hover:shadow-glow-md"
        >
          Save & Print Invoice (A4 / Thermal)
        </Button>
      </div>
    </div>
  );
};

export default Cart;
