import React from 'react';
import { Printer, Calendar, User, Phone, CreditCard, Receipt } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDateTime } from '../../utils/formatDate';

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
      }
    >
      <div className="space-y-4 text-xs">
        {/* Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
          <div>
            <span className="text-slate-400 font-semibold block">Customer Name</span>
            <div className="flex items-center gap-1 mt-0.5 font-bold text-slate-800 text-sm">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>{sale.customerName || 'Walk-in Customer'}</span>
            </div>
          </div>

          <div>
            <span className="text-slate-400 font-semibold block">Contact Number</span>
            <div className="flex items-center gap-1 mt-0.5 font-mono text-slate-700">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{sale.customerPhone || 'N/A'}</span>
            </div>
          </div>

          <div>
            <span className="text-slate-400 font-semibold block">Date & Time</span>
            <div className="flex items-center gap-1 mt-0.5 text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatDateTime(sale.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Items List */}
        <div>
          <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-2">
            Billed Items ({sale.items?.length || 0})
          </h4>
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-slate-600 font-bold text-[11px]">
                <tr>
                  <th className="py-2 px-3">Item Description</th>
                  <th className="py-2 px-2 text-center">Qty</th>
                  <th className="py-2 px-2 text-right">Unit Rate</th>
                  <th className="py-2 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {sale.items?.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-medium text-slate-900">
                      {item.productName}
                    </td>
                    <td className="py-2 px-2 text-center font-bold">
                      {item.quantity}
                    </td>
                    <td className="py-2 px-2 text-right font-mono">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(item.lineTotal || item.unitPrice * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-1.5 font-medium">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal:</span>
            <span className="font-mono">{formatCurrency(sale.subtotal)}</span>
          </div>

          {sale.cgst > 0 && (
            <div className="flex justify-between text-slate-500 text-[11px]">
              <span>CGST (9%) + SGST (9%):</span>
              <span className="font-mono">{formatCurrency(sale.cgst + sale.sgst)}</span>
            </div>
          )}

          {sale.igst > 0 && (
            <div className="flex justify-between text-slate-500 text-[11px]">
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

          <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-sm font-black text-slate-900">
            <span>Grand Total:</span>
            <span className="text-base font-mono text-blue-700">
              {formatCurrency(sale.grandTotal)}
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SaleDetailModal;
