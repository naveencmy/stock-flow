import { useState, useCallback } from 'react';
import { productService } from '../api/services';
import toast from 'react-hot-toast';

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await productService.getAll(params);
      setProducts(data.products || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
      return data;
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load products');
      return { products: [], total: 0, totalPages: 1 };
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const cats = await productService.getCategories();
      setCategories(cats || []);
      return cats;
    } catch (err) {
      console.error('Failed to load categories', err);
      return [];
    }
  }, []);

  const fetchLowStock = useCallback(async () => {
    setLoading(true);
    try {
      const items = await productService.getLowStock();
      setLowStockProducts(items || []);
      return items;
    } catch (err) {
      console.error('Failed to load low stock items', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const addProduct = async (productData) => {
    setLoading(true);
    try {
      const newProd = await productService.create(productData);
      toast.success(`"${newProd.name}" added successfully`);
      return newProd;
    } catch (err) {
      toast.error(err.message || 'Failed to add product');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const editProduct = async (id, productData) => {
    setLoading(true);
    try {
      const updated = await productService.update(id, productData);
      toast.success(`"${updated.name}" updated successfully`);
      return updated;
    } catch (err) {
      toast.error(err.message || 'Failed to update product');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeProduct = async (id) => {
    setLoading(true);
    try {
      await productService.delete(id);
      toast.success('Product deleted successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to delete product');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    products,
    total,
    totalPages,
    categories,
    lowStockProducts,
    loading,
    error,
    fetchProducts,
    fetchCategories,
    fetchLowStock,
    addProduct,
    editProduct,
    removeProduct
  };
};

export default useProducts;
