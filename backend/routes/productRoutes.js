/**
 * Product Routes
 * Mounts product controller functions with validation middleware.
 * Note: /low-stock must come BEFORE /:id to avoid param conflict.
 */
const express = require('express');
const router = express.Router();
const {
  getProducts,
  getLowStockProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getDistinctRacks,
  getInventoryStats,
} = require('../controllers/productController');
const {
  validateCreateProduct,
  validateUpdateProduct,
  validateMongoId,
} = require('../middleware/validate');

router.route('/').get(getProducts).post(validateCreateProduct, createProduct);

// Static routes before parameterized routes
router.get('/low-stock', getLowStockProducts);
router.get('/racks', getDistinctRacks);
router.get('/stats', getInventoryStats);

router
  .route('/:id')
  .get(validateMongoId, getProduct)
  .put(validateMongoId, validateUpdateProduct, updateProduct)
  .delete(validateMongoId, deleteProduct);

module.exports = router;
