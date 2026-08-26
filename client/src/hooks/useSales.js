import { useState, useCallback } from 'react';
import { salesService } from '../api/services';
import toast from 'react-hot-toast';

export const useSales = () => {
  const [sales, setSales] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentSale, setCurrentSale] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSales = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await salesService.getAll(params);
      setSales(data.sales || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
      return data;
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load sales records');
      return { sales: [], total: 0, totalPages: 1 };
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSaleById = useCallback(async (id) => {
    setLoading(true);
    try {
      const data = await salesService.getById(id);
      setCurrentSale(data);
      return data;
    } catch (err) {
      toast.error('Failed to load bill details');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const recordSale = async (saleData) => {
    setLoading(true);
    try {
      const created = await salesService.create(saleData);
      toast.success(`Bill ${created.billNumber} created successfully!`);
      return created;
    } catch (err) {
      toast.error(err.message || 'Failed to complete sale');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    sales,
    total,
    totalPages,
    currentSale,
    loading,
    error,
    fetchSales,
    fetchSaleById,
    recordSale
  };
};

export default useSales;
