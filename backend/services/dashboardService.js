/**
 * Dashboard Service
 * Contains all business logic for dashboard KPIs and chart data.
 */
const Product = require('../models/Product');
const Sale = require('../models/Sale');

/**
 * Get dashboard summary KPIs.
 * @returns {{ totalProducts, lowStockCount, todaySales: { count, revenue }, monthlyRevenue }}
 */
const getDashboardSummary = async () => {
  // Total active products
  const totalProducts = await Product.countDocuments({ isActive: true });

  // Low stock count
  const lowStockCount = await Product.countDocuments({
    $expr: { $lte: ['$stockQty', '$reorderLevel'] },
    isActive: true,
  });

  // Today's sales
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todaySalesAgg = await Sale.aggregate([
    { $match: { createdAt: { $gte: today } } },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        revenue: { $sum: '$grandTotal' },
      },
    },
  ]);

  const todaySales = todaySalesAgg[0] || { count: 0, revenue: 0 };

  // Monthly stats (revenue + bill count)
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthlyAgg = await Sale.aggregate([
    { $match: { createdAt: { $gte: monthStart } } },
    {
      $group: {
        _id: null,
        total: { $sum: '$grandTotal' },
        count: { $sum: 1 },
      },
    },
  ]);

  const monthlySales = monthlyAgg[0] || { total: 0, count: 0 };

  return {
    totalProducts,
    lowStockCount,
    todayRevenue: todaySales.revenue,
    todayBillsCount: todaySales.count,
    monthlyRevenue: monthlySales.total,
    monthlyBillsCount: monthlySales.count,
  };
};

/**
 * Get revenue chart data for the last 30 days.
 * @returns {Array} [{ date, revenue }, ...]
 */
const getRevenueChart = async () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const data = await Sale.aggregate([
    { $match: { createdAt: { $gte: thirtyDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$grandTotal' },
        bills: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const salesMap = {};
  data.forEach((item) => {
    salesMap[item._id] = {
      revenue: Math.round(item.revenue),
      bills: item.bills,
    };
  });

  // Always generate a continuous 30-day timeline
  const chartData = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateKey = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

    chartData.push({
      date: dayLabel,
      fullDate: dateKey,
      revenue: salesMap[dateKey]?.revenue || 0,
      bills: salesMap[dateKey]?.bills || 0,
    });
  }

  return chartData;
};

module.exports = {
  getDashboardSummary,
  getRevenueChart,
};
