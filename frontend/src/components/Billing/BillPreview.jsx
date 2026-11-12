import React, { useRef, useState, useEffect } from 'react';
import {
  Printer,
  Download,
  X,
  CheckCircle2,
  Zap,
  MessageCircle,
  QrCode,
  FileText,
  Receipt
} from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDateTime } from '../../utils/formatDate';
import { sendWhatsAppBill } from '../../utils/whatsapp';
import { whatsappService } from '../../api/services';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';

export const BillPreview = ({
  isOpen,
  onClose,
  sale = null,
  onNewBill
}) => {
  const printRef = useRef(null);
  const [sendWhatsAppOnPrint, setSendWhatsAppOnPrint] = useState(true);
  const [invoiceFormat, setInvoiceFormat] = useState('a4'); // 'a4' | 'thermal'

  useEffect(() => {
    if (sale?.customerPhone) {
      setSendWhatsAppOnPrint(true);
    }
  }, [sale]);

  if (!sale) return null;

  // Normalized financial values
  const subTotal = Number(sale.subTotal ?? sale.subtotal ?? 0);
  const totalGst = Number(sale.totalGst ?? ((sale.cgst || 0) + (sale.sgst || 0)) ?? 0);
  const cgst = Number(sale.cgst ?? (totalGst / 2) ?? 0);
  const sgst = Number(sale.sgst ?? (totalGst / 2) ?? 0);
  const discount = Number(sale.discountAmt ?? sale.discount ?? 0);
  const grandTotal = Number(sale.grandTotal ?? 0);

  const handleResendWhatsApp = async () => {
    if (!sale?.customerPhone) return;
    try {
      if (sale._id) {
        const res = await whatsappService.sendBill(sale._id);
        if (res.success) {
          toast.success(`Open-WA dispatched invoice PDF to +91 ${sale.customerPhone}!`, { icon: '⚡' });
          return;
        }
      }
    } catch {
      // Continue to client-side fallback
    }
    sendWhatsAppBill(sale, true);
  };

  const handlePrint = () => {
    if (!printRef.current) {
      window.print();
      return;
    }

    const printElement = printRef.current;
    const iframe = document.createElement('iframe');
    iframe.id = 'pos-print-frame';
    iframe.style.position = 'fixed';
    iframe.style.top = '-9999px';
    iframe.style.left = '-9999px';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const pri = iframe.contentWindow;
    pri.document.open();

    // Copy all styles from parent document so Tailwind CSS classes render perfectly
    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map((el) => el.outerHTML)
      .join('\n');

    pri.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice_${sale.billNumber || 'Bill'}</title>
          <meta charset="utf-8" />
          ${styles}
          <style>
            @page {
              size: ${invoiceFormat === 'thermal' ? '80mm auto' : 'A4 portrait'};
              margin: ${invoiceFormat === 'thermal' ? '2mm' : '8mm'};
            }
            *, *::before, *::after {
              box-sizing: border-box;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
              color: #000000 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              width: 100% !important;
            }
            .bill-container {
              width: 100% !important;
              max-width: 100% !important;
              padding: 0 !important;
              margin: 0 !important;
              border: none !important;
              box-shadow: none !important;
            }
            .no-print {
              display: none !important;
            }
            table {
              border-collapse: collapse !important;
              width: 100% !important;
            }
            tr {
              page-break-inside: avoid;
            }
          </style>
        </head>
        <body class="bg-white text-slate-900 p-0 m-0">
          ${printElement.outerHTML}
        </body>
      </html>
    `);
    pri.document.close();

    setTimeout(() => {
      pri.focus();
      pri.print();
      setTimeout(() => {
        try {
          document.body.removeChild(iframe);
        } catch (_) {}
      }, 1500);
    }, 250);
  };

  const handleDownloadPdf = async () => {
    // If backend sale has _id, download sharp vector PDF from backend
    if (sale._id) {
      try {
        const toastId = toast.loading('Downloading Tax Invoice PDF...');
        const response = await fetch(`/api/sales/${sale._id}/pdf?download=true`);
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `Invoice_${sale.billNumber || 'Bill'}.pdf`);
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
          toast.success('Invoice PDF downloaded successfully!', { id: toastId });
          return;
        }
      } catch (e) {
        console.warn('Backend PDF download fallback to client render:', e);
      }
    }

    // Client-side fallback via html2canvas
    if (!printRef.current) return;
    const toastId = toast.loading('Generating PDF invoice...');
    try {
      const element = printRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Invoice_${sale.billNumber || 'Bill'}.pdf`);
      toast.success('Invoice downloaded successfully!', { id: toastId });
    } catch (err) {
      console.error('PDF generation failed', err);
      toast.error('Failed to generate PDF', { id: toastId });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth={invoiceFormat === 'thermal' ? 'max-w-md' : 'max-w-3xl'}
      title="Tax Invoice & Receipt"
      subtitle={`Invoice #${sale.billNumber}`}
      footer={
        <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between">
            <Button
              variant="secondary"
              onClick={onNewBill || onClose}
            >
              Done / Close
            </Button>

            {sale.customerPhone && (
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <input
                  type="checkbox"
                  checked={sendWhatsAppOnPrint}
                  onChange={(e) => setSendWhatsAppOnPrint(e.target.checked)}
                  className="rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                />
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>WhatsApp on Print</span>
              </label>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {sale.customerPhone && (
              <Button
                variant="secondary"
                icon={MessageCircle}
                onClick={handleResendWhatsApp}
                className="bg-emerald-600 hover:bg-emerald-700 text-white border-transparent"
              >
                WhatsApp
              </Button>
            )}
            <Button
              variant="secondary"
              icon={Download}
              onClick={handleDownloadPdf}
            >
              PDF
            </Button>
            <Button
              variant="primary"
              icon={Printer}
              onClick={handlePrint}
            >
              Print ({invoiceFormat === 'thermal' ? '80mm' : 'A4'})
            </Button>
          </div>
        </div>
      }
    >
      {/* WhatsApp Status Alert Bar */}
      {sale.customerPhone && (
        <div className="flex items-center justify-between bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-xl px-3.5 py-2 mb-3.5 text-xs text-emerald-800 dark:text-emerald-200 no-print">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              {sale.whatsappSent ? (
                <>
                  <strong className="text-emerald-700 dark:text-emerald-300">Open-WA Auto-Dispatched</strong> to <strong>+91 {sale.customerPhone}</strong>
                </>
              ) : (
                <>
                  WhatsApp receipt auto-dispatched to <strong>+91 {sale.customerPhone}</strong>
                </>
              )}
            </span>
          </div>
          <button
            type="button"
            onClick={handleResendWhatsApp}
            className="text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 underline ml-2 shrink-0 cursor-pointer"
          >
            Re-send
          </button>
        </div>
      )}

      {/* Format Selector Tab */}
      <div className="flex items-center justify-center gap-2 mb-4 no-print">
        <button
          type="button"
          onClick={() => setInvoiceFormat('a4')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            invoiceFormat === 'a4'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Standard A4 GST</span>
        </button>
        <button
          type="button"
          onClick={() => setInvoiceFormat('thermal')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            invoiceFormat === 'thermal'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Thermal 80mm Slip</span>
        </button>
      </div>

      {/* Printable Area Wrapper */}
      <div className="print-area flex justify-center">
        {invoiceFormat === 'thermal' ? (
          /* ─── THERMAL 80mm RECEIPT SLIP ─── */
          <div
            ref={printRef}
            className="w-full max-w-[340px] bg-white text-black p-4 rounded-xl border border-slate-300 font-mono text-[11px] leading-tight shadow-md select-none"
          >
            <div className="text-center pb-2 border-b border-dashed border-black">
              <h2 className="text-base font-black tracking-wider uppercase">NANDHIPRIYA ELECTRICALS</h2>
              <p className="text-[10px] mt-0.5 font-sans">Pongandhurai, Dharapuram - 638656</p>
              <p className="text-[10px] font-sans">Ph: +91 98421 56789</p>
              <p className="text-[9px] mt-1 font-bold">GSTIN: 33AAAAA0000A1Z5</p>
            </div>

            <div className="py-2 border-b border-dashed border-black text-[10px] space-y-0.5">
              <div className="flex justify-between">
                <span>INV: #{sale.billNumber}</span>
                <span>{sale.paymentMethod?.toUpperCase() || 'CASH'}</span>
              </div>
              <div className="flex justify-between">
                <span>Date: {new Date(sale.createdAt || Date.now()).toLocaleDateString('en-IN')}</span>
                <span>{new Date(sale.createdAt || Date.now()).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div>Cust: {sale.customerName || 'Walk-in'}</div>
              {sale.customerPhone && <div>Ph: {sale.customerPhone}</div>}
            </div>

            {/* Line items */}
            <div className="py-2 border-b border-dashed border-black">
              <div className="flex justify-between font-bold border-b border-black pb-1 mb-1 text-[10px]">
                <span className="flex-1">ITEM</span>
                <span className="w-8 text-center">QTY</span>
                <span className="w-14 text-right">PRICE</span>
                <span className="w-16 text-right">TOTAL</span>
              </div>
              {sale.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between py-0.5">
                  <span className="flex-1 truncate pr-1">{item.productName}</span>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <span className="w-14 text-right">{formatCurrency(item.unitPrice)}</span>
                  <span className="w-16 text-right font-bold">
                    {formatCurrency(item.lineTotal || (item.unitPrice * item.quantity))}
                  </span>
                </div>
              ))}
            </div>

            {/* Financial breakdown */}
            <div className="py-2 border-b border-dashed border-black space-y-0.5 text-[10px]">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(subTotal)}</span>
              </div>
              {totalGst > 0 && (
                <div className="flex justify-between">
                  <span>GST Total:</span>
                  <span>{formatCurrency(totalGst)}</span>
                </div>
              )}
              {discount > 0 && (
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span>- {formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black pt-1 border-t border-black">
                <span>TOTAL:</span>
                <span>{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            {/* Simulated UPI Payment QR Code */}
            <div className="pt-3 pb-2 text-center flex flex-col items-center">
              <div className="p-2 border-2 border-black rounded-lg inline-block bg-white">
                {/* SVG QR Code Pattern */}
                <svg className="w-20 h-20" viewBox="0 0 100 100" fill="currentColor">
                  <rect width="100" height="100" fill="white" />
                  {/* Corner Position Detection Squares */}
                  <rect x="5" y="5" width="28" height="28" fill="black" />
                  <rect x="9" y="9" width="20" height="20" fill="white" />
                  <rect x="13" y="13" width="12" height="12" fill="black" />

                  <rect x="67" y="5" width="28" height="28" fill="black" />
                  <rect x="71" y="9" width="20" height="20" fill="white" />
                  <rect x="75" y="13" width="12" height="12" fill="black" />

                  <rect x="5" y="67" width="28" height="28" fill="black" />
                  <rect x="9" y="71" width="20" height="20" fill="white" />
                  <rect x="13" y="75" width="12" height="12" fill="black" />

                  {/* Simulated Data Grid */}
                  <rect x="40" y="8" width="6" height="6" fill="black" />
                  <rect x="50" y="12" width="8" height="6" fill="black" />
                  <rect x="42" y="24" width="6" height="8" fill="black" />
                  <rect x="54" y="26" width="6" height="6" fill="black" />
                  <rect x="8" y="42" width="8" height="6" fill="black" />
                  <rect x="22" y="44" width="6" height="8" fill="black" />
                  <rect x="38" y="40" width="10" height="10" fill="black" />
                  <rect x="52" y="44" width="8" height="8" fill="black" />
                  <rect x="68" y="42" width="6" height="6" fill="black" />
                  <rect x="82" y="44" width="8" height="6" fill="black" />
                  <rect x="40" y="68" width="8" height="6" fill="black" />
                  <rect x="54" y="72" width="6" height="8" fill="black" />
                  <rect x="70" y="68" width="8" height="8" fill="black" />
                  <rect x="84" y="74" width="6" height="6" fill="black" />
                  <rect x="44" y="84" width="12" height="6" fill="black" />
                  <rect x="68" y="84" width="6" height="8" fill="black" />
                </svg>
              </div>
              <p className="text-[9px] font-bold mt-1 tracking-wider uppercase">Scan with GPay / PhonePe / Paytm</p>
              <p className="text-[8px] text-slate-600">UPI: nandhipriya@upi</p>
            </div>

            <div className="pt-2 border-t border-dashed border-black text-center text-[9px]">
              *** Thank You! Visit Again ***
            </div>
          </div>
        ) : (
          /* ─── STANDARD A4 GST INVOICE ─── */
          <div
            ref={printRef}
            className="bill-container w-full bg-white p-6 sm:p-8 rounded-xl border border-slate-200 text-slate-800 text-xs shadow-md"
          >
            {/* Header Banner */}
            <div className="border-b-2 border-slate-900 pb-4 mb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-xl print:border print:border-black">
                    <Zap className="w-7 h-7 fill-amber-400" />
                  </div>
                  <div>
                    <h1 className="text-xl font-black tracking-wider uppercase text-slate-900 font-mono">
                      NANDHIPRIYA ELECTRICALS
                    </h1>
                    <p className="text-[11px] font-semibold text-slate-600">
                      Dealers in Finolex, Havells, Anchor, Crompton, PVC & Electrical Goods
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Pongandhurai, Dharapuram, Tiruppur - 638656 | Ph: +91 98421 56789
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-slate-900 text-white font-mono font-bold text-xs uppercase tracking-widest rounded print:border print:border-black print:bg-white print:text-black">
                    TAX INVOICE
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1 font-mono">
                    GSTIN: 33AAAAA0000A1Z5
                  </p>
                </div>
              </div>
            </div>

            {/* Invoice & Customer Metadata Bar */}
            <div className="grid grid-cols-2 gap-4 py-3 px-4 bg-slate-50 rounded-lg border border-slate-200/80 mb-5 text-[11px]">
              <div>
                <p className="text-slate-500 font-medium">Billed To:</p>
                <p className="font-bold text-slate-900 text-sm mt-0.5">
                  {sale.customerName || 'Walk-in Customer'}
                </p>
                {sale.customerPhone && (
                  <p className="text-slate-600 font-mono mt-0.5">
                    Phone: {sale.customerPhone}
                  </p>
                )}
              </div>

              <div className="text-right space-y-0.5">
                <p>
                  <span className="text-slate-500">Invoice No:</span>{' '}
                  <span className="font-bold font-mono text-slate-900">{sale.billNumber}</span>
                </p>
                <p>
                  <span className="text-slate-500">Date:</span>{' '}
                  <span className="font-medium">{formatDateTime(sale.createdAt || new Date())}</span>
                </p>
                <p>
                  <span className="text-slate-500">Payment:</span>{' '}
                  <span className="font-semibold text-slate-800 uppercase">{sale.paymentMethod || 'Cash'}</span>
                </p>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="overflow-x-auto mb-4 border border-slate-300 rounded-lg">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-900 bg-slate-100 text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                    <th className="py-2.5 px-3 text-center w-12">#</th>
                    <th className="py-2.5 px-3 text-left">Item Description</th>
                    <th className="py-2.5 px-3 text-center w-20">Qty</th>
                    <th className="py-2.5 px-3 text-right w-28">Unit Rate</th>
                    <th className="py-2.5 px-3 text-center w-20">GST</th>
                    <th className="py-2.5 px-3 text-right w-32">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-[11px]">
                  {sale.items?.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 text-center text-slate-500 font-mono">
                        {index + 1}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {item.productName}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold font-tabular text-slate-700">
                        {item.quantity} {item.unit || ''}
                      </td>
                      <td className="py-2.5 px-3 text-right font-tabular text-slate-700">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-500 font-tabular">
                        {item.gstRate || 18}%
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold font-tabular text-slate-900">
                        {formatCurrency(item.lineTotal || (item.unitPrice * item.quantity))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals & Tax Breakup Summary */}
            <div className="border-t-2 border-slate-900 pt-4 grid grid-cols-2 gap-6 items-start">
              <div className="text-[11px] text-slate-600 space-y-1.5">
                <p className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                  Terms & Conditions:
                </p>
                <p className="text-[10px] leading-relaxed">
                  1. Goods once sold will not be taken back without original invoice.<br />
                  2. Subject to Dharapuram Jurisdiction only.
                </p>
                <div className="pt-8">
                  <div className="w-36 border-b border-slate-300 pb-1 mb-1"></div>
                  <p className="text-slate-400 text-[10px]">Customer Signature</p>
                </div>
              </div>

              <div className="space-y-1.5 text-[11px] text-slate-700">
                <div className="flex justify-between items-center py-1 border-b border-slate-200">
                  <span className="text-slate-600 font-medium">Subtotal (Excl. Tax):</span>
                  <span className="font-tabular font-bold text-slate-900">{formatCurrency(subTotal)}</span>
                </div>

                {totalGst > 0 && (
                  <>
                    <div className="flex justify-between items-center py-0.5 text-slate-500">
                      <span>CGST (50%):</span>
                      <span className="font-tabular">{formatCurrency(cgst)}</span>
                    </div>
                    <div className="flex justify-between items-center py-0.5 text-slate-500">
                      <span>SGST (50%):</span>
                      <span className="font-tabular">{formatCurrency(sgst)}</span>
                    </div>
                  </>
                )}

                {discount > 0 && (
                  <div className="flex justify-between items-center py-0.5 text-emerald-600 font-semibold">
                    <span>Discount:</span>
                    <span className="font-tabular">- {formatCurrency(discount)}</span>
                  </div>
                )}

                <div className="border-t-2 border-slate-900 mt-2 pt-2.5 flex justify-between items-center text-sm font-black text-slate-900 bg-slate-50 px-2 py-1.5 rounded">
                  <span className="uppercase tracking-wider">NET TOTAL:</span>
                  <span className="text-base font-tabular text-blue-700 print:text-black">
                    {formatCurrency(grandTotal)}
                  </span>
                </div>

                <div className="pt-6 text-right">
                  <p className="font-bold text-slate-800 text-[11px]">
                    For NANDHIPRIYA ELECTRICALS
                  </p>
                  <p className="text-slate-400 text-[10px] mt-6">Authorized Signatory</p>
                </div>
              </div>
            </div>

            {/* Footer Note */}
            <div className="mt-8 pt-3 border-t border-dashed border-slate-300 text-center text-[10px] text-slate-500 font-medium">
              *** Thank you for your business! Visit NP Electricals again. ***
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default BillPreview;
