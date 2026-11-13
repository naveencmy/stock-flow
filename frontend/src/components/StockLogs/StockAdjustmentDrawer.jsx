import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, ShieldCheck, Check } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import toast from 'react-hot-toast';
import { stockLogService } from '../../api/services';

const REASON_CODES = [
  { value: 'Physical Count Surplus', label: 'Physical Count Surplus (நேரடி கணக்கெடுப்பு உபரி)', type: 'surplus' },
  { value: 'Breakage / Damaged', label: 'Breakage / Damaged (சேதம் / உடைந்த பொருட்கள்)', type: 'damaged' },
  { value: 'Theft / Unaccounted Loss', label: 'Theft / Unaccounted Loss (திருட்டு / கணக்கில் வராத இழப்பு)', type: 'theft' },
  { value: 'Supplier Return / Defect', label: 'Supplier Return / Defect (சப்ளையர் திருப்பம் / குறைபாடு)', type: 'return' },
  { value: 'Internal Store Use', label: 'Internal Store Use (கடை பயன்பாட்டிற்கு)', type: 'store_use' },
  { value: 'Routine Calibration', label: 'Routine Calibration (வழக்கமான திருத்தம்)', type: 'adjustment' }
];

export const StockAdjustmentDrawer = ({ isOpen, onClose, product, onSuccess }) => {
  const [selectedReason, setSelectedReason] = useState(REASON_CODES[1].value);
  const [countMode, setCountMode] = useState('delta'); // 'delta' or 'physical'
  const [deltaQty, setDeltaQty] = useState(-1);
  const [physicalCount, setPhysicalCount] = useState(1);
  const [remarks, setRemarks] = useState('');
  const [supervisorPin, setSupervisorPin] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setPhysicalCount(Math.max(0, (product.stockQty || 0) - 1));
      setDeltaQty(-1);
      setRemarks('');
      setSupervisorPin('');
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const currentStock = Number(product.stockQty) || 0;
  const unitCost = Number(product.purchasePrice) || Number(product.unitPrice) * 0.8 || 0;

  const calculatedDelta = countMode === 'delta' ? Number(deltaQty) : Number(physicalCount) - currentStock;
  const newStock = Math.max(0, currentStock + calculatedDelta);
  const financialImpact = calculatedDelta * unitCost;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!remarks.trim()) {
      toast.error('Audit remarks are mandatory for compliance.');
      return;
    }

    if (supervisorPin !== '1234' && supervisorPin !== '9999' && supervisorPin !== '0000') {
      toast.error('Invalid Supervisor PIN. Use 1234 for demo.');
      return;
    }

    setLoading(true);
    try {
      const reasonObj = REASON_CODES.find(r => r.value === selectedReason) || REASON_CODES[0];

      await stockLogService.adjust({
        productId: product._id,
        qtyChange: calculatedDelta,
        newStockQty: newStock,
        changeType: reasonObj.type,
        reasonCode: selectedReason,
        operator: 'Admin [Super]',
        note: `${remarks} | Super PIN verified`
      });

      toast.success(`Stock adjusted for ${product.name}`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to adjust stock');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end no-print">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-lg bg-[#faf8f5] dark:bg-[#0f172a] h-full shadow-2xl border-l border-[#ded9cb] dark:border-slate-800 flex flex-col z-10 overflow-y-auto">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#ded9cb] dark:border-slate-800 bg-[#f4f1e8] dark:bg-[#121c30] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-mono text-[10px] font-bold">
                [F8]
              </span>
              <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-tight font-sans">
                MANUAL STOCK ADJUSTMENT
              </h2>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-tamil">
              சரக்கு இருப்பு கைமுறை திருத்தம் மற்றும் தணிக்கைப் பதிவு
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg border border-[#ded9cb] dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:text-black dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 flex-1 text-xs font-mono">
          {/* Selected Product Card */}
          <div className="p-3.5 rounded-lg border border-[#ded9cb] dark:border-slate-800 bg-white dark:bg-slate-900/80 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white font-sans text-sm">
                  {product.name}
                </h3>
                {product.tamilName && (
                  <p className="text-slate-600 dark:text-slate-400 font-tamil text-xs">
                    {product.tamilName}
                  </p>
                )}
              </div>
              <span className="px-2 py-0.5 rounded bg-[#eee9dc] dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-[#d5d0c2] dark:border-slate-700 text-[11px] font-bold">
                {product.rackLocation || 'RACK-GEN'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#ded9cb] dark:border-slate-800 text-[11px]">
              <div>
                <span className="text-slate-500">Current Book Stock:</span>
                <span className="font-bold text-slate-900 dark:text-white ml-1">
                  {currentStock} {product.unit || 'units'}
                </span>
              </div>
              <div>
                <span className="text-slate-500">FIFO Cost Basis:</span>
                <span className="font-bold text-slate-900 dark:text-white ml-1">
                  {formatCurrency(unitCost)}
                </span>
              </div>
            </div>
          </div>

          {/* Adjustment Reason */}
          <div>
            <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase mb-1">
              Adjustment Reason Code (Mandatory) *
            </label>
            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              className="w-full px-3 py-2 rounded border border-[#ded9cb] dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-sans focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {REASON_CODES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Mode Toggle */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCountMode('delta')}
              className={`flex-1 py-1.5 rounded text-xs font-bold border ${
                countMode === 'delta'
                  ? 'bg-blue-600 text-white border-blue-700'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-[#ded9cb] dark:border-slate-700'
              }`}
            >
              [DELTA ADJUSTMENT (+/-)]
            </button>
            <button
              type="button"
              onClick={() => setCountMode('physical')}
              className={`flex-1 py-1.5 rounded text-xs font-bold border ${
                countMode === 'physical'
                  ? 'bg-blue-600 text-white border-blue-700'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-[#ded9cb] dark:border-slate-700'
              }`}
            >
              [PHYSICAL COUNT ENTRY]
            </button>
          </div>

          {/* Quantity Input */}
          {countMode === 'delta' ? (
            <div>
              <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase mb-1">
                Delta Quantity (+ to add, - to write-off)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDeltaQty((q) => q - 1)}
                  className="w-10 h-10 rounded border border-[#ded9cb] dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-bold text-lg"
                >
                  -
                </button>
                <input
                  type="number"
                  value={deltaQty}
                  onChange={(e) => setDeltaQty(Number(e.target.value))}
                  className="flex-1 h-10 px-3 text-center rounded border border-[#ded9cb] dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-base text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setDeltaQty((q) => q + 1)}
                  className="w-10 h-10 rounded border border-[#ded9cb] dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-bold text-lg"
                >
                  +
                </button>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase mb-1">
                Actual Physical Count on Rack
              </label>
              <input
                type="number"
                min="0"
                value={physicalCount}
                onChange={(e) => setPhysicalCount(Number(e.target.value))}
                className="w-full h-10 px-3 text-center rounded border border-[#ded9cb] dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-base text-slate-900 dark:text-white"
              />
            </div>
          )}

          {/* Real-time Calculation Summary Card */}
          <div className="p-3.5 rounded-lg border border-[#ded9cb] dark:border-slate-800 bg-[#f4f1e8] dark:bg-slate-900/60 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400">Ledger Quantity Delta:</span>
              <span
                className={`font-bold ${
                  calculatedDelta >= 0 ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {calculatedDelta > 0 ? `+${calculatedDelta}` : calculatedDelta}{' '}
                {product.unit || 'units'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400">New Book Balance:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {newStock} {product.unit || 'units'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-[#ded9cb] dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-400">Financial Loss / Surplus:</span>
              <span
                className={`font-bold text-sm ${
                  financialImpact < 0
                    ? 'text-rose-700 dark:text-rose-400'
                    : 'text-emerald-700 dark:text-emerald-400'
                }`}
              >
                {financialImpact < 0 ? '-' : '+'}
                {formatCurrency(Math.abs(financialImpact))}
              </span>
            </div>
          </div>

          {/* Audit Remarks */}
          <div>
            <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase mb-1">
              Audit Remarks & Reason Details *
            </label>
            <textarea
              rows="2"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g., Cracked casing during unloading | Physical audit count mismatch"
              className="w-full px-3 py-2 rounded border border-[#ded9cb] dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-sans text-xs outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Supervisor PIN */}
          <div>
            <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase mb-1 flex items-center justify-between">
              <span>Supervisor Authorization PIN *</span>
              <span className="text-[10px] text-slate-400 font-normal">Demo PIN: 1234</span>
            </label>
            <input
              type="password"
              maxLength="4"
              value={supervisorPin}
              onChange={(e) => setSupervisorPin(e.target.value)}
              placeholder="••••"
              className="w-full h-10 px-3 tracking-widest text-center rounded border border-[#ded9cb] dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-base text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Action CTAs */}
          <div className="pt-3 space-y-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>COMMIT ADJUSTMENT TO AUDIT LEDGER</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 px-4 rounded border border-[#ded9cb] dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-[#eee9dc]"
            >
              CANCEL [ESC]
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockAdjustmentDrawer;
