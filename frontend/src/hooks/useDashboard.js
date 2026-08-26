import { useState, useCallback } from 'react';
import { dashboardService, productService } from '../api/services';
import toast from 'react-hot-toast';

export const useDashboard = () => {
  const [summary, setSummary] = useState({
    totalProducts: 0,
    lowStockCount: 0,
    todayRevenue: 0,
    todayBillsCount: 0,
    monthlyRevenue: 0,
    monthlyBillsCount: 0
  });
  const [revenueChart, setRevenueChart] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [sumData, chartData, lowData] = await Promise.all([
        dashboardService.getSummary(),
        dashboardService.getRevenueChart(),
        productService.getLowStock()
      ]);

      setSummary(sumData || {});
      setRevenueChart(chartData || []);
      setLowStockProducts(lowData || []);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
      toast.error('Failed to update dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    summary,
    revenueChart,
    lowStockProducts,
    loading,
    fetchDashboardData
  };
};

export default useDashboard;
