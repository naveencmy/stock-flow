import React, { useEffect, useState, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { useSales } from '../hooks/useSales';
import SalesTable from '../components/Sales/SalesTable';
import ThermalReceiptEmulator from '../components/Sales/ThermalReceiptEmulator';
import BillPreview from '../components/Billing/BillPreview';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatCurrency } from '../utils/formatCurrency';
import useHotkeys from '../hooks/useHotkeys';
import toast from 'react-hot-toast';
import axios from 'axios';

export const SalesHistory = () => {
  const { sales, total, totalPages, loading, fetchSales } = useSales();

  const [search, setSearch] = useState('');
  const [datePreset, setDatePreset] = useState('today');
  const [payFilter, setPayFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Selected sale for thermal emulator and full bill modal
  const [selectedSale, setSelectedSale] = useState(null);
  const [fullBillSale, setFullBillSale] = useState(null);

  const loadData = useCallback(() => {
    let startDate = '';
    let endDate = '';
    const now = new Date();

    if (datePreset === 'today') {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      startDate = start.toISOString();
    } else if (datePreset === 'yesterday') {
      const yest = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      const yestEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);
      startDate = yest.toISOString();
      endDate = yestEnd.toISOString();
    } else if (datePreset === 'week') {
      const weekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      startDate = weekAgo.toISOString();
    }

    fetchSales({
      search,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      page: currentPage,
      limit: 15
    });
  }, [fetchSales, search, datePreset, currentPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Set default selected sale when sales list arrives
  useEffect(() => {
    if (sales.length > 0 && !selectedSale) {
      setSelectedSale(sales[0]);
    }
  }, [sales, selectedSale]);

  // F6 hotkey for thermal reprint
  useHotkeys({
    onF6: () => {
      if (selectedSale) {
        handleReprintThermal(selectedSale);
      }
    }
  });

  const handleReprintThermal = (sale) => {
    toast.success(`Printing ESC/POS Thermal Receipt for ${sale.billNumber}...`);
    // Opens print dialog or isolated iframe
    setFullBillSale(sale);
  };

  const handleExportPdf = async (sale) => {
    toast.loading('Downloading Tax Invoice PDF...', { id: 'pdf-dl' });
    try {
      const response = await axios.get(`/api/sales/${sale._id}/pdf`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `Invoice_${sale.billNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Tax Invoice PDF downloaded', { id: 'pdf-dl' });
    } catch {
      toast.error('Could not download PDF from server', { id: 'pdf-dl' });
    }
  };

  // Filter sales locally by payFilter if needed
  const filteredSales = sales.filter((s) => {
    if (payFilter === 'all') return true;
    return (s.paymentMethod || 'cash').toLowerCase() === payFilter.toLowerCase();
  });

  const settledTotal = sales
    .filter(s => (s.paymentMethod || 'cash').toLowerCase() !== 'khata')
    .reduce((sum, s) => sum + (Number(s.grandTotal) || 0), 0);

  const khataTotal = sales
    .filter(s => (s.paymentMethod || 'cash').toLowerCase() === 'khata')
    .reduce((sum, s) => sum + (Number(s.grandTotal) || 0), 0);

  const cashCount = sales.filter(s => (s.paymentMethod || 'cash').toLowerCase() === 'cash').length;
  const upiCount = sales.filter(s => (s.paymentMethod || 'cash').toLowerCase() === 'upi').length;
  const khataCount = sales.filter(s => (s.paymentMethod || 'cash').toLowerCase() === 'khata').length;

  return (
    <div className="space-y-3 font-mono">
      {/* Top Filter and Telemetry Header */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-[#f4f1e8] dark:bg-[#121c30] p-2.5 rounded border border-[#ded9cb] dark:border-slate-800 text-xs shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Search Invoice #, Customer, Mobile... (e.g. 9842...)"
            className="w-full pl-8 pr-8 py-1.5 rounded border border-[#ded9cb] dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs outline-none focus:ring-1 focus:ring-blue-500"
          />
          {search && (
            <button
              type="button"
              onClick={() => { setSearch(''); setCurrentPage(1); }}
              className="absolute inset-y-0 right-0 pr-2 flex items-center text-slate-400 hover:text-black"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Date Presets */}
        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-0.5 rounded border border-[#ded9cb] dark:border-slate-700 text-[11px]">
          {[
            { id: 'today', label: `Today (${datePreset === 'today' ? total || sales.length : 'Today'})` },
            { id: 'yesterday', label: 'Yesterday' },
            { id: 'week', label: 'Last 7 Days' },
            { id: 'all', label: `All (${total || sales.length})` }
          ].map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => { setDatePreset(preset.id); setCurrentPage(1); }}
              className={`px-2 py-1 rounded font-bold transition-all ${
                datePreset === preset.id
                  ? 'bg-black text-white'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-[#eee9dc]'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Summary Telemetry Pill */}
        <div className="px-3 py-1.5 rounded border border-[#ded9cb] dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center gap-3 text-xs">
          <span>
            SETTLED: <strong className="text-emerald-700 dark:text-emerald-400">{formatCurrency(settledTotal)}</strong>
          </span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span>
            KHATA OUTSTANDING: <strong className="text-amber-700 dark:text-amber-400">{formatCurrency(khataTotal)}</strong>
          </span>
        </div>
      </div>

      {/* Payment Mode Filter Tabs */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-slate-500 text-[11px] font-bold">MODE:</span>
        {[
          { id: 'all', label: `All Modes (${sales.length})` },
          { id: 'cash', label: `Cash (${cashCount})` },
          { id: 'upi', label: `UPI (${upiCount})` },
          { id: 'khata', label: `Khata (${khataCount})` }
        ].map((mode) => (
          <button
            key={mode.id}
            type="button"
            onClick={() => setPayFilter(mode.id)}
            className={`px-2.5 py-1 rounded border text-xs font-bold transition-all ${
              payFilter === mode.id
                ? 'bg-black text-white border-black'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-[#ded9cb] dark:border-slate-700 hover:bg-[#eee9dc]'
            }`}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {/* Main Split Screen: Left Ledger + Right 80mm ESC/POS Emulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start relative">
        {loading && <LoadingSpinner overlay message="Syncing ledger..." />}

        {/* Left Side: Transactions Register (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <SalesTable
            sales={filteredSales}
            selectedSaleId={selectedSale?._id}
            onSelectSale={(s) => setSelectedSale(s)}
            onReprint={handleReprintThermal}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={total}
            onPageChange={setCurrentPage}
          />
        </div>

        {/* Right Side: 80mm Thermal Receipt Emulator (5 cols) */}
        <div className="lg:col-span-5 sticky top-16">
          <ThermalReceiptEmulator
            sale={selectedSale}
            onReprintThermal={handleReprintThermal}
            onExportPdf={handleExportPdf}
          />
        </div>
      </div>

      {/* Full Bill A4 Preview / Print Modal */}
      {fullBillSale && (
        <BillPreview
          isOpen={Boolean(fullBillSale)}
          onClose={() => setFullBillSale(null)}
          sale={fullBillSale}
        />
      )}
    </div>
  );
};

export default SalesHistory;
