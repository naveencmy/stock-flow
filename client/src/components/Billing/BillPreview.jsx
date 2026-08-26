import React, { useRef } from 'react';
import { Printer, Download, X, CheckCircle2, Zap } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDateTime } from '../../utils/formatDate';
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

  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!printRef.current) return;
    const toastId = toast.loading('Generating PDF invoice...');
    try {
      const element = printRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false
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
      maxWidth="max-w-3xl"
      title="Tax Invoice Preview"
      subtitle={`Invoice #${sale.billNumber}`}
      footer={
        <div className="flex items-center justify-between w-full">
          <Button
            variant="secondary"
            onClick={onNewBill || onClose}
          >
            Done / Close
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              icon={Download}
              onClick={handleDownloadPdf}
            >
              Download PDF
            </Button>
            <Button
              variant="primary"
              icon={Printer}
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Print Invoice (A4)
            </Button>
          </div>
        </div>
      }
    >
      {/* Printable Area Wrapper */}
      <div className="print-area">
        <div
          ref={printRef}
          className="bill-container bg-white p-6 sm:p-8 rounded-xl border border-slate-200 text-slate-800 text-xs"
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
                <span className="font-semibold text-slate-800">{sale.paymentMethod || 'Cash'}</span>
              </p>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-t border-slate-300 bg-slate-100 text-[11px] font-bold text-slate-700 uppercase">
                  <th className="py-2 px-2 text-center w-10">#</th>
                  <th className="py-2 px-3">Item Description</th>
                  <th className="py-2 px-2 text-center w-16">Qty</th>
                  <th className="py-2 px-2 text-right w-24">Unit Rate</th>
                  <th className="py-2 px-2 text-center w-16">GST</th>
                  <th className="py-2 px-3 text-right w-28">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[11px]">
                {sale.items?.map((item, index) => (
                  <tr key={index}>
                    <td className="py-2.5 px-2 text-center text-slate-500 font-mono">
                      {index + 1}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {item.productName}
                    </td>
                    <td className="py-2.5 px-2 text-center font-bold">
                      {item.quantity} {item.unit || ''}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="py-2.5 px-2 text-center text-slate-500 font-mono">
                      {item.gstRate || 18}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold font-mono text-slate-900">
                      {formatCurrency(item.lineTotal || (item.unitPrice * item.quantity))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Tax Breakup Summary */}
          <div className="border-t-2 border-slate-300 pt-3 grid grid-cols-2 gap-4">
            <div className="text-[10px] text-slate-500 space-y-1">
              <p className="font-bold text-slate-700 uppercase tracking-wider">
                Terms & Conditions:
              </p>
              <p>1. Goods once sold will not be taken back or exchanged without original invoice.</p>
              <p>2. Subject to Dharapuram Jurisdiction only.</p>
              <div className="pt-6">
                <p className="text-slate-400">Customer Signature</p>
              </div>
            </div>

            <div className="space-y-1.5 text-[11px] text-slate-700">
              <div className="flex justify-between">
                <span>Subtotal (Excl. Tax):</span>
                <span className="font-mono font-medium">{formatCurrency(sale.subtotal)}</span>
              </div>

              {sale.cgst > 0 && (
                <>
                  <div className="flex justify-between text-slate-500">
                    <span>CGST (9%):</span>
                    <span className="font-mono">{formatCurrency(sale.cgst)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>SGST (9%):</span>
                    <span className="font-mono">{formatCurrency(sale.sgst)}</span>
                  </div>
                </>
              )}

              {sale.igst > 0 && (
                <div className="flex justify-between text-slate-500">
                  <span>IGST:</span>
                  <span className="font-mono">{formatCurrency(sale.igst)}</span>
                </div>
              )}

              {sale.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount:</span>
                  <span className="font-mono">- {formatCurrency(sale.discount)}</span>
                </div>
              )}

              <div className="border-t-2 border-slate-900 pt-2 flex justify-between items-center text-sm font-black text-slate-900">
                <span className="uppercase">Net Total:</span>
                <span className="text-base font-mono text-blue-700 print:text-black">
                  {formatCurrency(sale.grandTotal)}
                </span>
              </div>

              <div className="pt-6 text-right">
                <p className="font-bold text-slate-800 text-[10px]">
                  For NANDHIPRIYA ELECTRICALS
                </p>
                <p className="text-slate-400 text-[9px] mt-4">Authorized Signatory</p>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-8 pt-3 border-t border-dashed border-slate-300 text-center text-[10px] text-slate-500 font-medium">
            *** Thank you for your business! Visit NP Electricals again. ***
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default BillPreview;
