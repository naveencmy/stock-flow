/**
 * Stock Log Service
 * Contains all business logic for stock log operations and manual adjustments.
 */
const StockLog = require('../models/StockLog');
const Product = require('../models/Product');

/**
 * Get stock logs with pagination & optional product filter.
 * @param {Object} options - { page, limit, product }
 * @returns {{ logs, total, page, limit }}
 */
const getStockLogs = async ({ page = 1, limit = 20, product }) => {
  const filter = {};
  if (product) {
    filter.product = product;
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 20;
  const skip = (pageNum - 1) * limitNum;

  const [logs, total] = await Promise.all([
    StockLog.find(filter)
      .populate('product', 'name productCode')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    StockLog.countDocuments(filter),
  ]);

  return { logs, total, page: pageNum, limit: limitNum };
};

/**
 * Get stock logs for a specific product.
 * @param {String} productId - Product ID
 * @returns {Array} logs
 * @throws {Error} if product not found
 */
const getProductStockLogs = async (productId) => {
  const product = await Product.findById(productId);
  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  const logs = await StockLog.find({ product: productId }).sort({
    createdAt: -1,
  });

  return logs;
};

/**
 * Manually adjust stock for a product.
 * Creates a stock log entry and updates product stockQty.
 * @param {Object} data - { productId, qtyChange, note? }
 * @returns {{ stockLog, productName, prevStock, newStock }}
 * @throws {Error} if product not found or insufficient stock
 */
const adjustStock = async ({ productId, qtyChange, note }) => {
  const product = await Product.findById(productId);
  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  const prevStock = product.stockQty;
  const newStock = prevStock + parseInt(qtyChange, 10);

  if (newStock < 0) {
    const error = new Error(
      `Insufficient stock for "${product.name}". Current: ${prevStock}, Adjustment: ${qtyChange}`
    );
    error.statusCode = 400;
    throw error;
  }

  // Update product stock
  product.stockQty = newStock;
  await product.save();

  // Create stock log entry
  const stockLog = await StockLog.create({
    product: productId,
    productName: product.name,
    changeType: 'adjustment',
    qtyChange: parseInt(qtyChange, 10),
    prevStock,
    newStock,
    note: note || `Manual adjustment of ${qtyChange} units`,
  });

  return {
    stockLog,
    productName: product.name,
    prevStock,
    newStock,
  };
};

module.exports = {
  getStockLogs,
  getProductStockLogs,
  adjustStock,
};
