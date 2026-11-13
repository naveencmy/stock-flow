import React from 'react';
import { formatCurrency } from '../../utils/formatCurrency';
import toast from 'react-hot-toast';

export const ThermalReceiptEmulator = ({ sale, onReprintThermal, onExportPdf }) => {
  if (!sale) {
    return (
      <div className="bg-[#faf8f5] dark:bg-[#0c1322] rounded border border-[#ded9cb] dark:border-slate-800 p-8 text-center text-xs font-mono">
        <p className="text-slate-500">Select a transaction from the list to preview 80mm ESC/POS receipt.</p>
      </div>
    );
  }

  const dateObj = new Date(sale.createdAt || Date.now());
  const dateFormatted = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeFormatted = dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });

  const taxableSubtotal = Number(sale.subTotal) || 0;
  const halfGst = (Number(sale.totalGst) || 0) / 2;
  const roundOffVal = Number(sale.roundOff) || 0;
  const netAmount = Number(sale.grandTotal) || 0;

  return (
    <div className="flex flex-col h-full bg-[#faf8f5] dark:bg-[#0c1322] rounded border border-[#ded9cb] dark:border-slate-800 p-3 font-mono text-xs shadow-xs">
      {/* Top Telemetry Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#ded9cb] dark:border-slate-800 text-[11px]">
        <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>80MM THERMAL FEED READY</span>
        </div>
        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
          ESC/POS EMULATOR
        </span>
      </div>

      {/* Monospace 80mm Receipt Body */}
      <div className="flex-1 bg-white dark:bg-[#060a12] text-slate-900 dark:text-slate-100 p-4 rounded border border-[#e2ded4] dark:border-slate-800 font-mono text-[11px] leading-tight select-text shadow-inner overflow-y-auto max-h-[580px]">
        <div className="text-center">
          <div className="text-slate-500 text-[10px]">===================================</div>
          <div className="font-black text-xs uppercase tracking-wider">
            NANDHIPRIYA ELECTRICALS &amp; HARDWARE
          </div>
          <div className="font-tamil text-[11px] text-slate-700 dark:text-slate-300 mt-0.5">
            நந்திப்பிரியா எலக்ட்ரிக்கல்ஸ்
          </div>
          <div className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5">
            14, Main Road, Dharapuram - 638656
          </div>
          <div className="text-[10px] text-slate-600 dark:text-slate-400">
            GSTIN: 33AABCN4921M1Z4
          </div>
          <div className="text-[10px] text-slate-600 dark:text-slate-400">
            Phone: +91 4258 220451
          </div>
          <div className="text-slate-500 text-[10px] mt-1">-----------------------------------</div>
        </div>

        {/* Invoice Info */}
        <div className="space-y-0.5 my-1 text-[10px]">
          <div className="flex justify-between">
            <span>INV: <strong className="font-bold">{sale.billNumber}</strong></span>
            <span>ORIGINAL</span>
          </div>
          <div className="flex justify-between">
            <span>DATE: {dateFormatted}</span>
            <span>TIME: {timeFormatted}</span>
          </div>
          <div>CUST: {sale.customerName || 'Walk-in Customer'}</div>
          {sale.customerPhone && <div>MOB: +91 {sale.customerPhone}</div>}
          {sale.customerGstin && <div>GSTIN: {sale.customerGstin}</div>}
        </div>

        <div className="text-slate-500 text-[10px]">-----------------------------------</div>
        <div className="flex justify-between font-bold text-[10px] py-0.5">
          <span className="w-1/2">ITEM</span>
          <span className="w-1/4 text-center">QTY</span>
          <span className="w-1/4 text-right">AMT</span>
        </div>
        <div className="text-slate-500 text-[10px]">-----------------------------------</div>

        {/* Line Items */}
        <div className="space-y-1.5 my-1">
          {sale.items?.map((item, idx) => (
            <div key={idx} className="text-[10px]">
              <div className="flex justify-between font-semibold">
                <span className="w-1/2 truncate">{item.productName}</span>
                <span className="w-1/4 text-center text-slate-600 dark:text-slate-400">
                  {item.quantity}{item.unit ? item.unit[0] : 'p'} @{Math.round(item.unitPrice)}
                </span>
                <span className="w-1/4 text-right font-bold">
                  {item.lineTotal?.toFixed(2)}
                </span>
              </div>
              {item.tamilName && (
                <div className="text-[9px] text-slate-500 font-tamil pl-1">
                  {item.tamilName}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-slate-500 text-[10px]">-----------------------------------</div>

        {/* Calculations */}
        <div className="space-y-0.5 text-[10px]">
          <div className="flex justify-between">
            <span>SUB-TOTAL (TAXABLE):</span>
            <span className="font-bold">{formatCurrency(taxableSubtotal)}</span>
          </div>
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>CGST @ 9%:</span>
            <span>{formatCurrency(halfGst)}</span>
          </div>
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>SGST @ 9%:</span>
            <span>{formatCurrency(halfGst)}</span>
          </div>
          {roundOffVal !== 0 && (
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>ROUND-OFF:</span>
              <span>{roundOffVal > 0 ? `+${roundOffVal.toFixed(2)}` : roundOffVal.toFixed(2)}</span>
            </div>
          )}
        </div>

        <div className="text-slate-500 text-[10px]">-----------------------------------</div>

        {/* Net Amount */}
        <div className="flex justify-between items-center py-1">
          <span className="font-black text-xs">NET AMOUNT:</span>
          <span className="font-black text-sm">{formatCurrency(netAmount)}</span>
        </div>

        <div className="text-[10px] space-y-0.5 pt-0.5">
          <div className="flex justify-between">
            <span>PAID VIA:</span>
            <span className="font-bold uppercase">{sale.paymentMethod || 'CASH'}</span>
          </div>
          {sale.paymentMethod === 'upi' && (
            <div className="flex justify-between text-slate-500">
              <span>TXN ID:</span>
              <span>UPI-{String(sale._id || '').slice(-10)}</span>
            </div>
          )}
        </div>

        <div className="text-slate-500 text-[10px] mt-1">===================================</div>
        <div className="text-center text-[10px] pt-1">
          <div className="font-bold">THANK YOU! VISIT AGAIN!</div>
          <div className="font-tamil text-[9px] text-slate-600 dark:text-slate-400">
            மீண்டும் வருக! நன்றி!
          </div>
          <div className="text-[8px] text-slate-500 mt-1">
            Goods once sold cannot be returned without original bill
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-3 space-y-2">
        <button
          type="button"
          onClick={() => onReprintThermal(sale)}
          className="w-full py-2.5 px-3 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider shadow-xs transition-all flex items-center justify-center gap-1.5 active:scale-95"
        >
          <span>REPRINT THERMAL RECEIPT [F6]</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => toast.success(`Credit Note drafted for ${sale.billNumber}`)}
            className="py-1.5 px-2 rounded border border-[#ded9cb] dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold text-[10px] uppercase hover:bg-[#eee9dc] text-center"
          >
            ISSUE CREDIT NOTE
          </button>
          <button
            type="button"
            onClick={() => onExportPdf(sale)}
            className="py-1.5 px-2 rounded border border-[#ded9cb] dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold text-[10px] uppercase hover:bg-[#eee9dc] text-center"
          >
            EXPORT PDF BILL
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThermalReceiptEmulator;

