/**
 * Sale Routes
 * Mounts sale controller functions with validation middleware.
 * IMPORTANT: Static routes (/today, /stats) MUST come before /:id
 */
const express = require('express');
const router = express.Router();
const {
  createSale,
  getSales,
  getTodaySales,
  getSaleStats,
  getSale,
  getSalePdf,
} = require('../controllers/saleController');
const {
  validateCreateSale,
  validateMongoId,
} = require('../middleware/validate');

router.route('/').get(getSales).post(validateCreateSale, createSale);

// Static routes BEFORE parameterized routes
router.get('/today', getTodaySales);
router.get('/stats', getSaleStats);

router.get('/:id', validateMongoId, getSale);
router.get('/:id/pdf', validateMongoId, getSalePdf);

module.exports = router;
