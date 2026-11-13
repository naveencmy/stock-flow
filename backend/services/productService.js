/**
 * Product Service
 * Contains all business logic for product operations.
 */
const Product = require('../models/Product');

/**
 * Get products with filters & pagination.
 * @param {Object} options - { search, category, rackLocation, lowStock, page, limit }
 * @returns {{ products, total, page, limit }}
 */
const getProducts = async ({ search, category, rackLocation, lowStock, page = 1, limit = 10 }) => {
  const filter = { isActive: true };

  if (search) {
    const searchRegex = { $regex: search, $options: 'i' };
    filter.$or = [
      { name: searchRegex },
      { tamilName: searchRegex },
      { sku: searchRegex },
      { barcode: searchRegex },
      { rackLocation: searchRegex },
      { brand: searchRegex },
    ];
  }

  if (category) {
    filter.category = category;
  }

  if (rackLocation) {
    filter.rackLocation = { $regex: rackLocation, $options: 'i' };
  }

  if (lowStock === 'true') {
    filter.$expr = { $lte: ['$stockQty', '$reorderLevel'] };
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Product.countDocuments(filter),
  ]);

  return {
    products,
    total,
    page: pageNum,
    limit: limitNum,
  };
};

/**
 * Get all low-stock products (stockQty <= reorderLevel).
 * @returns {Array} products
 */
const getLowStockProducts = async () => {
  const products = await Product.find({
    isActive: true,
    $expr: { $lte: ['$stockQty', '$reorderLevel'] },
  })
    .populate('category', 'name')
    .sort({ stockQty: 1 });

  return products;
};

/**
 * Get a single product by ID.
 * @param {String} id - Product ID
 * @returns {Object} product
 * @throws {Error} if not found
 */
const getProductById = async (id) => {
  const product = await Product.findById(id).populate('category', 'name');

  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  return product;
};

/**
 * Create a new product.
 * @param {Object} data - Product fields
 * @returns {Object} created product (populated)
 */
const createProduct = async (data) => {
  const {
    name,
    tamilName,
    sku,
    rackLocation,
    packagingConversion,
    purchasePrice,
    hsnCode,
    category,
    brand,
    unit,
    unitPrice,
    stockQty,
    reorderLevel,
    gstRate,
    barcode,
  } = data;

  const product = await Product.create({
    name,
    tamilName,
    sku,
    rackLocation,
    packagingConversion,
    purchasePrice,
    hsnCode,
    category,
    brand,
    unit,
    unitPrice,
    stockQty,
    reorderLevel,
    gstRate,
    barcode,
  });

  const populated = await Product.findById(product._id).populate('category', 'name');
  return populated;
};

/**
 * Update a product by ID.
 * @param {String} id - Product ID
 * @param {Object} data - Fields to update
 * @returns {Object} updated product (populated)
 * @throws {Error} if not found
 */
const updateProduct = async (id, data) => {
  let product = await Product.findById(id);

  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  product = await Product.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).populate('category', 'name');

  return product;
};

/**
 * Soft-delete a product (set isActive: false).
 * @param {String} id - Product ID
 * @throws {Error} if not found
 */
const deleteProduct = async (id) => {
  const product = await Product.findById(id);

  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  product.isActive = false;
  await product.save();
};

/**
 * Get distinct active rack locations
 * @returns {Array<String>}
 */
const getDistinctRacks = async () => {
  const racks = await Product.distinct('rackLocation', { isActive: true, rackLocation: { $exists: true, $ne: '' } });
  return racks.filter(Boolean).sort();
};

/**
 * Get inventory statistics (valuation, counts, occupancy)
 * @returns {Object}
 */
const getInventoryStats = async () => {
  const [totalSkus, lowStockCount, racks, agg] = await Promise.all([
    Product.countDocuments({ isActive: true }),
    Product.countDocuments({ isActive: true, $expr: { $lte: ['$stockQty', '$reorderLevel'] } }),
    Product.distinct('rackLocation', { isActive: true, rackLocation: { $exists: true, $ne: '' } }),
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
          totalStockQty: { $sum: '$stockQty' },
        },
      },
    ]),
  ]);

  const healthyCount = Math.max(0, totalSkus - lowStockCount);
  const totalValuation = Math.round(agg[0]?.totalValuation || 0);
  const totalStockQty = agg[0]?.totalStockQty || 0;
  const rackCount = racks.filter(Boolean).length;
  const rackOccupancy = Math.min(100, Math.max(10, Math.round((rackCount / Math.max(rackCount, 12)) * 88)));

  return {
    totalSkus,
    healthyCount,
    lowStockCount,
    totalValuation,
    totalStockQty,
    rackCount,
    racks: racks.filter(Boolean).sort(),
    rackOccupancy,
  };
};

module.exports = {
  getProducts,
  getLowStockProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getDistinctRacks,
  getInventoryStats,
};
