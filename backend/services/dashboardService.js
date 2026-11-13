/**
 * Dashboard Service
 * Contains all business logic for dashboard KPIs and chart data.
 */
const Product = require('../models/Product');
const Sale = require('../models/Sale');

/**
 * Get dashboard summary KPIs with live DB aggregations.
 * @returns {Object} Live KPIs & chart data
 */
const getDashboardSummary = async () => {
  // Total active products
  const totalProducts = await Product.countDocuments({ isActive: true });

  // Low stock count
  const lowStockCount = await Product.countDocuments({
    $expr: { $lte: ['$stockQty', '$reorderLevel'] },
    isActive: true,
  });

  // Today start & end (local time bounds)
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0);

  // Today's sales aggregation with payment breakdown
  const [todayAgg, yesterdayAgg, khataAgg, hourlyAgg, topItemsAgg, inventoryStats] = await Promise.all([
    Sale.aggregate([
      { $match: { createdAt: { $gte: todayStart } } },
      {
        $group: {
          _id: { $toLower: '$paymentMethod' },
          count: { $sum: 1 },
          revenue: { $sum: '$grandTotal' },
        },
      },
    ]),
    Sale.aggregate([
      { $match: { createdAt: { $gte: yesterdayStart, $lt: todayStart } } },
      {
        $group: {
          _id: null,
          revenue: { $sum: '$grandTotal' },
        },
      },
    ]),
    Sale.aggregate([
      { $match: { paymentMethod: { $regex: /^khata$/i } } },
      {
        $group: {
          _id: '$customerName',
          totalDue: { $sum: '$grandTotal' },
          billsCount: { $sum: 1 },
        },
      },
      { $sort: { totalDue: -1 } },
    ]),
    Sale.aggregate([
      { $match: { createdAt: { $gte: todayStart } } },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          bills: { $sum: 1 },
          revenue: { $sum: '$grandTotal' },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Sale.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productName',
          tamilName: { $first: '$items.tamilName' },
          rackLocation: { $first: '$items.rackLocation' },
          qty: { $sum: '$items.quantity' },
          revenue: { $sum: '$items.lineTotal' },
        },
      },
      { $sort: { qty: -1 } },
      { $limit: 5 },
    ]),
    Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalValuation: {
            $sum: {
              $multiply: [
                '$stockQty',
                { $ifNull: ['$purchasePrice', { $multiply: ['$unitPrice', 0.78] }] },
              ],
            },
          },
        },
      },
    ]),
  ]);

  // Aggregate today's totals and payment breakdown
  let todayRevenue = 0;
  let todayBillsCount = 0;
  const paymentBreakdown = {
    cash: { count: 0, revenue: 0 },
    upi: { count: 0, revenue: 0 },
    card: { count: 0, revenue: 0 },
    khata: { count: 0, revenue: 0 },
  };

  todayAgg.forEach((p) => {
    const method = (p._id || 'cash').toLowerCase();
    todayRevenue += p.revenue;
    todayBillsCount += p.count;
    if (paymentBreakdown[method]) {
      paymentBreakdown[method].count = p.count;
      paymentBreakdown[method].revenue = p.revenue;
    } else {
      paymentBreakdown.cash.count += p.count;
      paymentBreakdown.cash.revenue += p.revenue;
    }
  });

  const yesterdayRevenue = yesterdayAgg[0]?.revenue || 0;
  const revenueGrowthPct = yesterdayRevenue > 0
    ? +(((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100).toFixed(1)
    : 0;

  // Khata accounts calculation from live DB
  let pendingKhataTotal = 0;
  khataAgg.forEach((k) => {
    pendingKhataTotal += k.totalDue;
  });
  const pendingKhataAccountsCount = khataAgg.length;
  const topKhataAccount = khataAgg[0]
    ? `${khataAgg[0]._id} (₹${Math.round(khataAgg[0].totalDue).toLocaleString('en-IN')})`
    : 'None';

  // Format hourly velocity for 09:00 - 19:00 business hours
  const hourlyMap = {};
  hourlyAgg.forEach((h) => {
    hourlyMap[h._id] = { bills: h.bills, revenue: Math.round(h.revenue) };
  });

  const businessHours = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
  const hourlyVelocity = businessHours.map((hour) => ({
    hour: `${String(hour).padStart(2, '0')}:00`,
    bills: hourlyMap[hour]?.bills || 0,
    revenue: hourlyMap[hour]?.revenue || 0,
  }));

  // Format top fast-moving items from live DB
  const topFastMoving = topItemsAgg.map((item) => ({
    name: item._id,
    tamil: item.tamilName || '',
    rack: item.rackLocation || 'RACK-GEN',
    qty: `${item.qty} units`,
    rev: `₹${Math.round(item.revenue).toLocaleString('en-IN')}`,
  }));

  // Monthly stats
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
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
    todayRevenue: Math.round(todayRevenue),
    todayBillsCount,
    yesterdayRevenue: Math.round(yesterdayRevenue),
    revenueGrowthPct,
    paymentBreakdown,
    pendingKhataTotal: Math.round(pendingKhataTotal),
    pendingKhataAccountsCount,
    topKhataAccount,
    hourlyVelocity,
    topFastMoving,
    inventoryValuation: Math.round(inventoryStats[0]?.totalValuation || 0),
    monthlyRevenue: Math.round(monthlySales.total),
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
