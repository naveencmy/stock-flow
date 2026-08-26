/**
 * Dashboard Controller
 * Handles HTTP request/response flow for dashboard data.
 * Delegates business logic to dashboardService.
 */
const asyncHandler = require('../middleware/asyncHandler');
const dashboardService = require('../services/dashboardService');

// @desc    Get dashboard summary KPIs
// @route   GET /api/dashboard/summary
const getDashboardSummary = asyncHandler(async (req, res) => {
  const data = await dashboardService.getDashboardSummary();

  res.status(200).json({
    success: true,
    data,
  });
});

// @desc    Get revenue chart data for last 30 days
// @route   GET /api/dashboard/revenue-chart
const getRevenueChart = asyncHandler(async (req, res) => {
  const data = await dashboardService.getRevenueChart();

  res.status(200).json({
    success: true,
    data,
  });
});

module.exports = {
  getDashboardSummary,
  getRevenueChart,
};
