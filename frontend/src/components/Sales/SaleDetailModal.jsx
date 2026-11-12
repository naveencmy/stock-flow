import React from 'react';
import { Printer, Calendar, User, Phone, CreditCard, Receipt, MessageCircle } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDateTime } from '../../utils/formatDate';
import { sendWhatsAppBill } from '../../utils/whatsapp';

export const SaleDetailModal = ({
  isOpen,
  onClose,
  sale = null,
  onPrint
}) => {
  if (!sale) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sale Invoice Details"
      subtitle={`Bill Reference: ${sale.billNumber}`}
      maxWidth="max-w-2xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <div className="flex items-center gap-2">
            {sale.customerPhone && (
              <Button
                variant="secondary"
                icon={MessageCircle}
                onClick={() => sendWhatsAppBill(sale, true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white border-transparent"
              >
                Send WhatsApp
              </Button>
            )}
            <Button
              variant="primary"
              icon={Printer}
              onClick={() => {
                onClose();
                if (onPrint) onPrint(sale);
              }}
            >
              Open Printable Invoice
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4 text-xs">
        {/* Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 dark:bg-[#151f32] rounded-xl border border-slate-200/80 dark:border-slate-800">
          <div>
            <span className="text-slate-400 font-semibold block text-[10px] uppercase">Customer</span>
            <div className="flex items-center gap-1 mt-0.5 font-bold text-slate-800 dark:text-white text-sm">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>{sale.customerName || 'Walk-in Customer'}</span>
            </div>
          </div>

          <div>
            <span className="text-slate-400 font-semibold block text-[10px] uppercase">Phone</span>
            <div className="flex items-center gap-1 mt-0.5 font-mono text-slate-700 dark:text-slate-300">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{sale.customerPhone || 'N/A'}</span>
            </div>
          </div>

          <div>
            <span className="text-slate-400 font-semibold block text-[10px] uppercase">Date & Time</span>
            <div className="flex items-center gap-1 mt-0.5 text-slate-700 dark:text-slate-300 font-mono">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatDateTime(sale.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Items List */}
        <div>
          <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide text-[10px]">
            Line Items ({sale.items?.length || 0})
          </h4>
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-[#151f32] text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Item</th>
                  <th className="py-2.5 px-2 text-center">Qty</th>
                  <th className="py-2.5 px-2 text-right">Unit Price</th>
                  <th className="py-2.5 px-3 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {sale.items?.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200">
                      {item.productName}
                    </td>
                    <td className="py-2 px-2 text-center font-bold font-tabular text-slate-700 dark:text-slate-300">
                      {item.quantity}
                    </td>
                    <td className="py-2 px-2 text-right font-tabular text-slate-600 dark:text-slate-400">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="py-2 px-3 text-right font-bold font-tabular text-slate-900 dark:text-white">
                      {formatCurrency(item.lineTotal || (item.unitPrice * item.quantity))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="p-3 bg-slate-50 dark:bg-[#151f32] rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Subtotal:</span>
            <span className="font-tabular font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(sale.subTotal ?? sale.subtotal ?? 0)}</span>
          </div>
          {sale.totalGst > 0 && (
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>GST Total:</span>
              <span className="font-tabular">{formatCurrency(sale.totalGst)}</span>
            </div>
          )}
          {sale.discount > 0 && (
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
              <span>Discount:</span>
              <span className="font-tabular">- {formatCurrency(sale.discount)}</span>
            </div>
          )}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-2 flex justify-between items-center text-sm font-black text-slate-900 dark:text-white">
            <span>Grand Total:</span>
            <span className="font-tabular text-base text-blue-600 dark:text-cyan-400">{formatCurrency(sale.grandTotal)}</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SaleDetailModal;
