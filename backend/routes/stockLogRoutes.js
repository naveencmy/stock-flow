/**
 * Stock Log Routes
 * Mounts stock log controller functions with validation middleware.
 */
const express = require('express');
const router = express.Router();
const {
  getStockLogs,
  getProductStockLogs,
  adjustStock,
} = require('../controllers/stockLogController');
const {
  validateStockAdjust,
  validateProductIdParam,
} = require('../middleware/validate');

router.get('/', getStockLogs);
router.get('/product/:productId', validateProductIdParam, getProductStockLogs);
router.post('/adjust', validateStockAdjust, adjustStock);

module.exports = router;
