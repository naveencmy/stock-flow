/**
 * Category Routes
 * Mounts category controller functions with validation middleware.
 */
const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const {
  validateCreateCategory,
  validateUpdateCategory,
  validateMongoId,
} = require('../middleware/validate');

router.route('/').get(getCategories).post(validateCreateCategory, createCategory);

router
  .route('/:id')
  .get(validateMongoId, getCategory)
  .put(validateMongoId, validateUpdateCategory, updateCategory)
  .delete(validateMongoId, deleteCategory);

module.exports = router;
