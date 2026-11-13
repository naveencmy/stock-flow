import React, { useState, useMemo } from 'react';
import { Trash2, MessageCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import CartItem from './CartItem';
import { formatCurrency } from '../../utils/formatCurrency';
import { calculateGst } from '../../utils/calculateGst';

export const Cart = ({ onCheckout, loading = false }) => {
  const { cart, updateCartQty, removeFromCart, clearCart, playChime } = useApp();

  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerGstin, setCustomerGstin] = useState('');
  const [autoSendWhatsApp, setAutoSendWhatsApp] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash', 'upi', 'card', 'khata'
  const [discount, setDiscount] = useState('0');

  // Compute bill financials
  const totals = useMemo(() => {
    let subtotal = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    let totalTax = 0;

    cart.forEach((item) => {
      const linePrice = (Number(item.unitPrice) || 0) * (Number(item.quantity) || 1);
      const gst = calculateGst(linePrice, item.gstRate || 18);
      subtotal += linePrice;
      totalCgst += gst.cgst;
      totalSgst += gst.sgst;
      totalTax += gst.totalGst;
    });

    const discountAmount = Math.max(0, Number(discount) || 0);
    const rawGrandTotal = subtotal + totalTax - discountAmount;
    const roundedGrandTotal = Math.round(rawGrandTotal);
    const roundOff = +(roundedGrandTotal - rawGrandTotal).toFixed(2);

    return {
      subtotal,
      cgst: totalCgst,
      sgst: totalSgst,
      totalTax,
      discountAmount,
      roundOff,
      grandTotal: roundedGrandTotal
    };
  }, [cart, discount]);

  const handleCheckoutSubmit = (printImmediately = true) => {
    if (cart.length === 0) return;

    if (playChime) playChime('success');

    onCheckout({
      customerName: customerName.trim() || 'Walk-in Customer',
      customerPhone: customerPhone.trim() || undefined,
      customerGstin: customerGstin.trim() || undefined,
      autoSendWhatsApp,
      paymentMethod,
      discountAmt: totals.discountAmount,
      roundOff: totals.roundOff,
      items: cart.map((i) => ({
        productId: i.productId,
        productName: i.productName,
        tamilName: i.tamilName || '',
        sku: i.sku || '',
        rackLocation: i.rackLocation || '',
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        gstRate: i.gstRate || 18,
        lineTotal: i.unitPrice * i.quantity,
        unit: i.unit || 'piece'
      })),
      subtotal: totals.subtotal,
      cgst: totals.cgst,
      sgst: totals.sgst,
      totalGst: totals.totalTax,
      grandTotal: totals.grandTotal,
      printImmediately
    });
  };

  return (
    <div className="bg-[#faf8f5] dark:bg-[#0c1322] rounded border border-[#ded9cb] dark:border-slate-800 p-3 sm:p-4 flex flex-col h-full font-mono text-xs shadow-xs transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[#ded9cb] dark:border-slate-800 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white">
              ACTIVE INVOICE TRAY
            </h3>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5 font-tamil">
            {cart.length} பொருட்கள் பதிவாகியுள்ளன
          </p>
        </div>

        {cart.length > 0 && (
          <button
            type="button"
            onClick={clearCart}
            className="text-[10px] font-bold text-slate-500 hover:text-rose-600 transition-colors flex items-center gap-1 px-2 py-0.5 rounded border border-[#ded9cb] dark:border-slate-700 bg-white dark:bg-slate-900"
          >
            <Trash2 className="w-3 h-3" />
            Clear Tray
          </button>
        )}
      </div>

      {/* Customer Info Form */}
      <div className="py-2.5 space-y-2 border-b border-[#ded9cb] dark:border-slate-800 shrink-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Customer Name */}
          <div>
            <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-0.5">
              CUSTOMER / நிறுவனம்
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Senthil Contractor / Walk-in"
              className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-[#ded9cb] dark:border-slate-700 rounded text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-blue-500 font-mono"
            />
          </div>

          {/* Customer Phone & Auto-WhatsApp */}
          <div>
            <div className="flex items-center justify-between mb-0.5">
              <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">
                PHONE NUMBER
              </label>
              {customerPhone.trim().length >= 10 && (
                <label className="text-[9px] text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1 cursor-pointer select-none bg-emerald-50 dark:bg-emerald-950/60 px-1 py-0.2 rounded border border-emerald-300 dark:border-emerald-800">
                  <input
                    type="checkbox"
                    checked={autoSendWhatsApp}
                    onChange={(e) => setAutoSendWhatsApp(e.target.checked)}
                    className="w-2.5 h-2.5"
                  />
                  <MessageCircle className="w-2.5 h-2.5" />
                  <span>AUTO-WHATSAPP</span>
                </label>
              )}
            </div>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="10-digit mobile (e.g. 9150673040)"
              maxLength={12}
              className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-[#ded9cb] dark:border-slate-700 rounded text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-blue-500 font-mono"
            />
          </div>
        </div>

        {/* Optional GSTIN for Contractor / B2B */}
        <div>
          <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-0.5">
            GSTIN (FOR B2B TAX INVOICE - OPTIONAL)
          </label>
          <input
            type="text"
            value={customerGstin}
            onChange={(e) => setCustomerGstin(e.target.value.toUpperCase())}
            placeholder="e.g. 33AAAAB0000A1Z5"
            maxLength={15}
            className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-[#ded9cb] dark:border-slate-700 rounded text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-blue-500 font-mono"
          />
        </div>
      </div>

      {/* Cart Items Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-1.5 py-2 min-h-[140px]">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-white dark:bg-slate-900 rounded border border-dashed border-[#ded9cb] dark:border-slate-800">
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400">Invoice tray is empty</p>
            <p className="text-[10px] text-slate-400 mt-0.5 font-tamil">
              பொருட்களைச் சேர்க்க இடதுபுறம் கிளிக் செய்யவும்
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

      {/* Calculations Breakdown */}
      <div className="pt-2 border-t border-[#ded9cb] dark:border-slate-800 space-y-1 text-xs shrink-0 bg-[#f4f1e8] dark:bg-slate-900/60 p-2.5 rounded">
        <div className="flex justify-between text-slate-600 dark:text-slate-400">
          <span>Sub-Total (Taxable Value):</span>
          <span className="font-bold text-slate-900 dark:text-white">
            {formatCurrency(totals.subtotal)}
          </span>
        </div>
        <div className="flex justify-between text-slate-600 dark:text-slate-400 text-[11px]">
          <span>CGST (9%):</span>
          <span>{formatCurrency(totals.cgst)}</span>
        </div>
        <div className="flex justify-between text-slate-600 dark:text-slate-400 text-[11px]">
          <span>SGST (9%):</span>
          <span>{formatCurrency(totals.sgst)}</span>
        </div>
        <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-[11px]">
          <span>Contractor Discount:</span>
          <div className="flex items-center gap-1">
            <span>₹</span>
            <input
              type="number"
              min="0"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              className="w-16 px-1 py-0.5 text-right rounded border border-[#ded9cb] dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
            />
          </div>
        </div>
        {totals.roundOff !== 0 && (
          <div className="flex justify-between text-slate-500 text-[11px]">
            <span>Round-off:</span>
            <span>{totals.roundOff > 0 ? `+${totals.roundOff.toFixed(2)}` : totals.roundOff.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between items-center pt-1.5 border-t border-[#ded9cb] dark:border-slate-700">
          <span className="font-black text-xs uppercase tracking-tight text-slate-900 dark:text-white">
            NET PAYABLE (செலுத்த வேண்டிய தொகை):
          </span>
          <span className="font-black text-base text-blue-700 dark:text-blue-400">
            {formatCurrency(totals.grandTotal)}
          </span>
        </div>
      </div>

      {/* Payment Method Selector */}
      <div className="pt-2 shrink-0">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
          {[
            { id: 'cash', label: 'CASH [F10]', sub: 'ரொக்கம்' },
            { id: 'upi', label: 'UPI / QR', sub: 'ஜிபே/போன்பே' },
            { id: 'card', label: 'CARD', sub: 'கார்டு' },
            { id: 'khata', label: 'KHATA', sub: 'கடன் கணக்கு' }
          ].map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => setPaymentMethod(mode.id)}
              className={`py-1.5 px-1 rounded border text-center font-bold text-[10px] uppercase transition-all ${
                paymentMethod === mode.id
                  ? 'bg-black text-white border-black shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-[#ded9cb] dark:border-slate-700 hover:bg-[#eee9dc]'
              }`}
            >
              <div>{mode.label}</div>
              <div className="font-tamil text-[9px] font-normal opacity-80">{mode.sub}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Checkout Action CTAs */}
      <div className="pt-2.5 space-y-1.5 shrink-0">
        <button
          type="button"
          disabled={cart.length === 0 || loading}
          onClick={() => handleCheckoutSubmit(true)}
          className="w-full py-2.5 px-4 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50 active:scale-95"
        >
          <span>PRINT THERMAL RECEIPT [ENTER]</span>
        </button>

        <button
          type="button"
          disabled={cart.length === 0 || loading}
          onClick={() => handleCheckoutSubmit(false)}
          className="w-full py-1.5 px-4 rounded border border-[#ded9cb] dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold text-[10px] hover:bg-[#eee9dc] transition-all disabled:opacity-50 text-center"
        >
          Save Invoice (No Print)
        </button>
      </div>
    </div>
  );
};

export default Cart;
