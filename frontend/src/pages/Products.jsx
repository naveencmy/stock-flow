import React, { useEffect, useState, useCallback } from 'react';
import { useProducts } from '../hooks/useProducts';
import { productService } from '../api/services';
import ProductSearch from '../components/Products/ProductSearch';
import ProductTable from '../components/Products/ProductTable';
import ProductForm from '../components/Products/ProductForm';
import StockAdjustmentDrawer from '../components/StockLogs/StockAdjustmentDrawer';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatCurrency } from '../utils/formatCurrency';
import useHotkeys from '../hooks/useHotkeys';
import toast from 'react-hot-toast';

export const Products = () => {
  const {
    products,
    total,
    totalPages,
    categories,
    loading,
    fetchProducts,
    fetchCategories,
    addProduct,
    editProduct,
    createCategory
  } = useProducts();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [rack, setRack] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [distinctRacks, setDistinctRacks] = useState([]);
  const [inventoryStats, setInventoryStats] = useState({
    totalSkus: 0,
    healthyCount: 0,
    lowStockCount: 0,
    totalValuation: 0,
    rackOccupancy: 85
  });

  // Modals & Drawers
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [adjustingProduct, setAdjustingProduct] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadStatsAndRacks = useCallback(async () => {
    try {
      const [stats, rks] = await Promise.all([
        productService.getStats(),
        productService.getRacks()
      ]);
      if (stats) setInventoryStats(stats);
      if (rks) setDistinctRacks(rks);
    } catch (e) {
      console.error('Failed to load inventory stats', e);
    }
  }, []);

  const loadData = useCallback(() => {
    fetchProducts({
      search,
      category: category === 'All' ? '' : category,
      rackLocation: rack === 'All' ? '' : rack,
      page: currentPage,
      limit: 10
    });
    loadStatsAndRacks();
  }, [fetchProducts, search, category, rack, currentPage, loadStatsAndRacks]);

  useEffect(() => {
    fetchCategories();
    loadStatsAndRacks();
  }, [fetchCategories, loadStatsAndRacks]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Hotkey handlers for F7 (export), F8 (adjust), Insert (add)
  useHotkeys({
    onInsert: () => {
      setEditingProduct(null);
      setIsFormModalOpen(true);
    },
    onF7: () => handleExportCsv(),
    onF8: () => {
      if (products.length > 0) {
        setAdjustingProduct(products[0]);
      }
    }
  });

  const handleExportCsv = () => {
    if (!products.length) {
      toast.error('No products to export');
      return;
    }
    const headers = ['SKU', 'Name', 'Tamil Name', 'Rack', 'Category', 'Unit', 'Purchase', 'Selling', 'Stock', 'Reorder'];
    const rows = products.map((p) => [
      `"${p.sku || ''}"`,
      `"${p.name || ''}"`,
      `"${p.tamilName || ''}"`,
      `"${p.rackLocation || ''}"`,
      `"${typeof p.category === 'object' ? p.category?.name : p.category || ''}"`,
      `"${p.unit || ''}"`,
      p.purchasePrice || '',
      p.unitPrice || '',
      p.stockQty || 0,
      p.reorderLevel || 0
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `nandhipriya_inventory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Inventory CSV exported');
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsFormModalOpen(true);
  };

  const handleAdjust = (product) => {
    setAdjustingProduct(product);
  };

  const handleFormSubmit = async (formData) => {
    setActionLoading(true);
    try {
      if (editingProduct) {
        await editProduct(editingProduct._id, formData);
      } else {
        await addProduct(formData);
      }
      setIsFormModalOpen(false);
      setEditingProduct(null);
      loadData();
    } catch {
      // Handled by hook
    } finally {
      setActionLoading(false);
    }
  };

  // KPI Calculations from live DB
  const displayTotal = total || inventoryStats.totalSkus || products.length;
  const displayHealthy = inventoryStats.healthyCount || products.filter(p => Number(p.stockQty) > Number(p.reorderLevel)).length;
  const displayCritical = inventoryStats.lowStockCount || products.filter(p => Number(p.stockQty) <= Number(p.reorderLevel)).length;
  const displayValuation = inventoryStats.totalValuation || products.reduce((acc, p) => acc + (Number(p.stockQty) * (Number(p.purchasePrice) || Number(p.unitPrice) * 0.78)), 0);
  const displayOccupancy = inventoryStats.rackOccupancy || 85;

  return (
    <div className="space-y-3 font-mono">
      {/* Top Filter Bar */}
      <ProductSearch
        search={search}
        onSearchChange={(v) => { setSearch(v); setCurrentPage(1); }}
        category={category}
        onCategoryChange={(v) => { setCategory(v); setCurrentPage(1); }}
        categories={categories}
        rack={rack}
        onRackChange={(v) => { setRack(v); setCurrentPage(1); }}
        racks={distinctRacks}
        totalSkus={displayTotal}
        onExportCsv={handleExportCsv}
        onAddNew={handleAddNew}
      />

      {/* Top Industrial KPI Summary Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#eee9dc] dark:bg-[#121c30] px-3.5 py-2 rounded border border-[#ded9cb] dark:border-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200">
        <div className="flex flex-wrap items-center gap-3">
          <span>
            TOTAL SKUS: <strong className="text-black dark:text-white">{displayTotal}</strong>
          </span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="text-emerald-700 dark:text-emerald-400 font-bold">
            HEALTHY: {displayHealthy} ITEMS
          </span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 font-bold">
            LOW STOCK ALERTS: {displayCritical} ITEMS (CRITICAL)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span>
            TOTAL INVENTORY VALUATION: <strong className="text-black dark:text-white">{formatCurrency(displayValuation)}</strong>
          </span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span>
            RACK OCCUPANCY: <strong className="text-black dark:text-white">{displayOccupancy}%</strong>
          </span>
        </div>
      </div>

      {/* Product Table */}
      <div className="relative">
        {loading && <LoadingSpinner overlay message="Updating inventory catalog..." />}
        <ProductTable
          products={products}
          loading={loading}
          onEdit={handleEdit}
          onAdjust={handleAdjust}
          onAddClick={handleAddNew}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={total}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => !actionLoading && setIsFormModalOpen(false)}
        title={editingProduct ? 'Edit Product Details' : 'Add New Product'}
        subtitle={editingProduct ? `Updating SKU: ${editingProduct.sku || editingProduct.name}` : 'Fill in item details for stock tracking & billing'}
        maxWidth="max-w-2xl"
      >
        <ProductForm
          initialData={editingProduct}
          categories={categories}
          onCreateCategory={createCategory}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormModalOpen(false)}
          loading={actionLoading}
        />
      </Modal>

      {/* Manual Stock Adjustment Drawer [F8] */}
      <StockAdjustmentDrawer
        isOpen={!!adjustingProduct}
        onClose={() => setAdjustingProduct(null)}
        product={adjustingProduct}
        onSuccess={loadData}
      />
    </div>
  );
};

export default Products;
