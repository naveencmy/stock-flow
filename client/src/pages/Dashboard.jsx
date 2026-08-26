import React, { useEffect, useState } from 'react';
import {
  Package,
  AlertTriangle,
  TrendingUp,
  CreditCard,
  Plus,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../hooks/useDashboard';
import { useProducts } from '../hooks/useProducts';
import StatCard from '../components/Dashboard/StatCard';
import RevenueChart from '../components/Dashboard/RevenueChart';
import LowStockAlert from '../components/Dashboard/LowStockAlert';
import ProductForm from '../components/Products/ProductForm';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatCurrency } from '../utils/formatCurrency';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { summary, revenueChart, lowStockProducts, loading, fetchDashboardData } = useDashboard();
  const { editProduct } = useProducts();
  const [restockProduct, setRestockProduct] = useState(null);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleRestockClick = (product) => {
    setRestockProduct(product);
    setIsRestockModalOpen(true);
  };

  const handleSaveRestock = async (formData) => {
    if (!restockProduct) return;
    await editProduct(restockProduct._id, formData);
    setIsRestockModalOpen(false);
    setRestockProduct(null);
    fetchDashboardData();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-sans">
            Store Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Welcome back, Kuppusamy! Here is today's overview of stock and sales.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            onClick={fetchDashboardData}
            loading={loading}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => navigate('/billing')}
          >
            New Quick Bill
          </Button>
        </div>
      </div>

      {loading && !summary.totalProducts ? (
        <div className="py-20">
          <LoadingSpinner size="lg" message="Loading store analytics..." />
        </div>
      ) : (
        <>
          {/* Stat Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <StatCard
              title="Total Products"
              value={summary.totalProducts || 0}
              subtitle="Active inventory items"
              icon={Package}
              color="blue"
            />
            <StatCard
              title="Low Stock Alert"
              value={summary.lowStockCount || 0}
              subtitle="Items need reordering"
              icon={AlertTriangle}
              color="amber"
              alert={summary.lowStockCount > 0}
            />
            <StatCard
              title="Today's Sales"
              value={formatCurrency(summary.todayRevenue || 0)}
              subtitle={`${summary.todayBillsCount || 0} bills generated`}
              icon={CreditCard}
              color="emerald"
            />
            <StatCard
              title="Monthly Turnover"
              value={formatCurrency(summary.monthlyRevenue || 124500)}
              subtitle={`${summary.monthlyBillsCount || 68} bills this month`}
              icon={TrendingUp}
              color="purple"
            />
          </div>

          {/* 30-Day Revenue Chart */}
          <RevenueChart data={revenueChart} />

          {/* Low Stock Alerts Section */}
          <LowStockAlert
            products={lowStockProducts}
            onRestockClick={handleRestockClick}
          />
        </>
      )}

      {/* Quick Restock / Edit Modal */}
      <Modal
        isOpen={isRestockModalOpen}
        onClose={() => setIsRestockModalOpen(false)}
        title="Restock Product"
        subtitle="Quickly adjust inventory stock count or pricing"
        maxWidth="max-w-xl"
      >
        {restockProduct && (
          <ProductForm
            initialData={restockProduct}
            onSubmit={handleSaveRestock}
            onCancel={() => setIsRestockModalOpen(false)}
          />
        )}
      </Modal>
    </div>
  );
};

export default Dashboard;
