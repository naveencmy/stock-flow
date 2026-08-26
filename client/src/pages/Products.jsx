import React, { useEffect, useState, useCallback } from 'react';
import { useProducts } from '../hooks/useProducts';
import ProductSearch from '../components/Products/ProductSearch';
import ProductTable from '../components/Products/ProductTable';
import ProductForm from '../components/Products/ProductForm';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import LoadingSpinner from '../components/common/LoadingSpinner';

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
    removeProduct
  } = useProducts();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = useCallback(() => {
    fetchProducts({
      search,
      category: category === 'All' ? '' : category,
      page: currentPage,
      limit: 10
    });
  }, [fetchProducts, search, category, currentPage]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSearchChange = (val) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const handleCategoryChange = (val) => {
    setCategory(val);
    setCurrentPage(1);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsFormModalOpen(true);
  };

  const handleDeletePrompt = (product) => {
    setDeletingProduct(product);
    setIsDeleteDialogOpen(true);
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
      // Error handled by hook toast
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    setActionLoading(true);
    try {
      await removeProduct(deletingProduct._id);
      setIsDeleteDialogOpen(false);
      setDeletingProduct(null);
      loadData();
    } catch {
      // Error handled by hook toast
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Inventory & Products
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage stock catalog, price lists, barcodes, and reorder levels.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <ProductSearch
        search={search}
        onSearchChange={handleSearchChange}
        category={category}
        onCategoryChange={handleCategoryChange}
        categories={categories}
        onAddNew={handleAddNew}
      />

      {/* Table Section with Overlay Loading */}
      <div className="relative">
        {loading && <LoadingSpinner overlay message="Updating product catalog..." />}
        <ProductTable
          products={products}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDeletePrompt}
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
        subtitle={editingProduct ? `Updating SKU: ${editingProduct.name}` : 'Fill in item details for stock tracking & billing'}
        maxWidth="max-w-2xl"
      >
        <ProductForm
          initialData={editingProduct}
          categories={categories}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormModalOpen(false)}
          loading={actionLoading}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
        title="Delete Product?"
        message={`Are you sure you want to remove "${deletingProduct?.name}"? It will no longer appear in search or billing.`}
        confirmText="Delete Product"
        danger
        loading={actionLoading}
      />
    </div>
  );
};

export default Products;
