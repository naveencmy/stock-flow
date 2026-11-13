import React, { useState } from 'react';
import { useSales } from '../hooks/useSales';
import { useApp } from '../context/AppContext';
import ProductSelector from '../components/Billing/ProductSelector';
import Cart from '../components/Billing/Cart';
import BillPreview from '../components/Billing/BillPreview';
import { sendWhatsAppBill } from '../utils/whatsapp';
import useHotkeys from '../hooks/useHotkeys';
import toast from 'react-hot-toast';

export const Billing = () => {
  const { clearCart, cart } = useApp();
  const { recordSale, loading } = useSales();
  const [completedSale, setCompletedSale] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleCheckout = async (salePayload) => {
    try {
      const created = await recordSale(salePayload);
      setCompletedSale(created);
      if (salePayload.printImmediately) {
        setIsPreviewOpen(true);
      }
      clearCart();

      // Automatically dispatch WhatsApp message
      const shouldAutoSend = salePayload.autoSendWhatsApp !== false;
      if (shouldAutoSend && created?.customerPhone) {
        if (created.whatsappSent) {
          toast.success(`Open-WA auto-sent receipt to +91 ${created.customerPhone}!`, {
            icon: '⚡',
            duration: 5000,
          });
        } else {
          setTimeout(() => {
            sendWhatsAppBill(created, false);
            toast.success(`WhatsApp invoice dispatched to +91 ${created.customerPhone}!`, {
              icon: '📱',
              duration: 5000,
            });
          }, 200);
        }
      }
    } catch {
      // Handled via toast in hook
    }
  };

  const handleNewBill = () => {
    setIsPreviewOpen(false);
    setCompletedSale(null);
  };

  return (
    <div className="space-y-3 font-mono">
      {/* Split Screen Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start no-print">
        {/* Left: Product Catalog & Rack Locator (7 cols) */}
        <div className="lg:col-span-7 h-[calc(100vh-8.5rem)] min-h-[580px]">
          <ProductSelector />
        </div>

        {/* Right: Active Invoice Tray (5 cols) */}
        <div className="lg:col-span-5 h-[calc(100vh-8.5rem)] min-h-[580px]">
          <Cart onCheckout={handleCheckout} loading={loading} />
        </div>
      </div>

      {/* Printable Invoice Modal / Isolated Iframe */}
      <BillPreview
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        sale={completedSale}
        onNewBill={handleNewBill}
      />
    </div>
  );
};

export default Billing;
