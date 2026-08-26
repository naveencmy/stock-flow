/**
 * Product Controller
 * Handles HTTP request/response flow for products.
 * Delegates business logic to productService.
 */
const asyncHandler = require('../middleware/asyncHandler');
const productService = require('../services/productService');

// @desc    Get all products with filters & pagination
// @route   GET /api/products
const getProducts = asyncHandler(async (req, res) => {
  const { search, category, page, limit, lowStock } = req.query;
  const result = await productService.getProducts({ search, category, lowStock, page, limit });

  res.status(200).json({
    success: true,
    data: result.products,
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      pages: Math.ceil(result.total / result.limit),
    },
  });
});

// @desc    Get low-stock products (stockQty <= reorderLevel)
// @route   GET /api/products/low-stock
const getLowStockProducts = asyncHandler(async (req, res) => {
  const products = await productService.getLowStockProducts();

  res.status(200).json({
    success: true,
    data: products,
  });
});

// @desc    Get single product by ID
// @route   GET /api/products/:id
const getProduct = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);

  res.status(200).json({
    success: true,
    data: product,
  });
});

// @desc    Create a new product
// @route   POST /api/products
const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body);

  res.status(201).json({
    success: true,
    data: product,
    message: 'Product created successfully',
  });
});

// @desc    Update a product
// @route   PUT /api/products/:id
const updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body);

  res.status(200).json({
    success: true,
    data: product,
    message: 'Product updated successfully',
  });
});

// @desc    Soft-delete a product (set isActive: false)
// @route   DELETE /api/products/:id
const deleteProduct = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.params.id);

  res.status(200).json({
    success: true,
    data: {},
    message: 'Product deactivated successfully',
  });
});

module.exports = {
  getProducts,
  getLowStockProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
