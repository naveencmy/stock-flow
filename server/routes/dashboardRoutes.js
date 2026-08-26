/**
 * Dashboard Routes
 * Mounts dashboard controller functions.
 */
const express = require('express');
const router = express.Router();
const {
  getDashboardSummary,
  getRevenueChart,
} = require('../controllers/dashboardController');

router.get('/summary', getDashboardSummary);
router.get('/revenue-chart', getRevenueChart);

module.exports = router;
