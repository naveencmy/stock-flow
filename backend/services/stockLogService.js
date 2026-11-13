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
const getStockLogs = async ({ page = 1, limit = 20, product, changeType, search, startDate, endDate }) => {
  const filter = {};
  if (product) {
    filter.product = product;
  }
  if (changeType && changeType !== 'all') {
    filter.changeType = changeType;
  }
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) {
      const e = new Date(endDate);
      e.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = e;
    }
  }
  if (search && search.trim()) {
    const q = search.trim();
    filter.$or = [
      { productName: { $regex: q, $options: 'i' } },
      { tamilName: { $regex: q, $options: 'i' } },
      { sku: { $regex: q, $options: 'i' } },
      { rackLocation: { $regex: q, $options: 'i' } },
      { referenceId: { $regex: q, $options: 'i' } },
      { note: { $regex: q, $options: 'i' } }
    ];
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 20;
  const skip = (pageNum - 1) * limitNum;

  const [logs, total] = await Promise.all([
    StockLog.find(filter)
      .populate('product', 'name productCode brand unit')
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
 * @param {Object} data - { productId, qtyChange, note?, reasonCode?, changeType?, operator?, referenceId? }
 * @returns {{ stockLog, productName, prevStock, newStock }}
 * @throws {Error} if product not found or insufficient stock
 */
const adjustStock = async ({
  productId,
  qtyChange,
  note,
  reasonCode,
  changeType = 'adjustment',
  operator = 'Naveen [Staff]',
  referenceId,
}) => {
  const product = await Product.findById(productId);
  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  const delta = parseInt(qtyChange, 10);
  const prevStock = product.stockQty;
  const newStock = prevStock + delta;

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

  // Financial loss calculation (if reduction)
  const unitCost = product.purchasePrice || (product.unitPrice * 0.8) || 0;
  const financialLoss = delta < 0 ? Math.abs(delta) * unitCost : 0;

  // Auto reference number if not provided
  const refNum = referenceId || `ADJ-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;

  // Create stock log entry
  const stockLog = await StockLog.create({
    product: productId,
    productName: product.name,
    tamilName: product.tamilName || '',
    sku: product.sku || '',
    rackLocation: product.rackLocation || '',
    unit: product.unit || 'piece',
    changeType,
    qtyChange: delta,
    prevStock,
    newStock,
    reasonCode: reasonCode || (delta >= 0 ? 'Physical Count Surplus' : 'Breakage / Damaged'),
    financialLoss: Math.round(financialLoss * 100) / 100,
    operator,
    referenceId: refNum,
    note: note || `Manual adjustment of ${delta} ${product.unit || 'units'} (${reasonCode || 'Audit'})`,
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
