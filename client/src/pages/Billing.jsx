import React, { useState } from 'react';
import { useSales } from '../hooks/useSales';
import { useApp } from '../context/AppContext';
import ProductSelector from '../components/Billing/ProductSelector';
import Cart from '../components/Billing/Cart';
import BillPreview from '../components/Billing/BillPreview';

export const Billing = () => {
  const { clearCart } = useApp();
  const { recordSale, loading } = useSales();
  const [completedSale, setCompletedSale] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleCheckout = async (salePayload) => {
    try {
      const created = await recordSale(salePayload);
      setCompletedSale(created);
      setIsPreviewOpen(true);
      clearCart();
    } catch {
      // Error is handled via react-hot-toast in hook
    }
  };

  const handleNewBill = () => {
    setIsPreviewOpen(false);
    setCompletedSale(null);
  };

  return (
    <div className="space-y-4">
      {/* Page Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Point of Sale & Billing
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Rapid checkout, GST calculation, inventory deduction & instant invoice printing.
          </p>
        </div>
      </div>

      {/* Split Screen Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Product Selector (7 cols on desktop) */}
        <div className="lg:col-span-7 h-[calc(100vh-12rem)] min-h-[580px]">
          <ProductSelector />
        </div>

        {/* Right Column: Cart & Summary (5 cols on desktop) */}
        <div className="lg:col-span-5 h-[calc(100vh-12rem)] min-h-[580px]">
          <Cart onCheckout={handleCheckout} loading={loading} />
        </div>
      </div>

      {/* Printable Invoice Modal */}
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
