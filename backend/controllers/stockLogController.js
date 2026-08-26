/**
 * Stock Log Controller
 * Handles HTTP request/response flow for stock logs.
 * Delegates business logic to stockLogService.
 */
const asyncHandler = require('../middleware/asyncHandler');
const stockLogService = require('../services/stockLogService');

// @desc    Get all stock logs with pagination & optional product filter
// @route   GET /api/stock-logs
const getStockLogs = asyncHandler(async (req, res) => {
  const { page, limit, product, changeType } = req.query;
  const result = await stockLogService.getStockLogs({ page, limit, product, changeType });

  res.status(200).json({
    success: true,
    data: result.logs,
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      pages: Math.ceil(result.total / result.limit),
    },
  });
});

// @desc    Get stock logs for a specific product
// @route   GET /api/stock-logs/product/:productId
const getProductStockLogs = asyncHandler(async (req, res) => {
  const logs = await stockLogService.getProductStockLogs(req.params.productId);

  res.status(200).json({
    success: true,
    data: logs,
  });
});

// @desc    Manual stock adjustment
// @route   POST /api/stock-logs/adjust
const adjustStock = asyncHandler(async (req, res) => {
  const result = await stockLogService.adjustStock(req.body);

  res.status(201).json({
    success: true,
    data: result.stockLog,
    message: `Stock adjusted. ${result.productName}: ${result.prevStock} → ${result.newStock}`,
  });
});

module.exports = {
  getStockLogs,
  getProductStockLogs,
  adjustStock,
};
