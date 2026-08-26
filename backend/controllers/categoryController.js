/**
 * Category Controller
 * Handles HTTP request/response flow for categories.
 * Delegates business logic to categoryService.
 */
const asyncHandler = require('../middleware/asyncHandler');
const categoryService = require('../services/categoryService');

// @desc    Get all categories
// @route   GET /api/categories
const getCategories = asyncHandler(async (req, res) => {
  const categories = await categoryService.getCategories();

  res.status(200).json({
    success: true,
    data: categories,
  });
});

// @desc    Get single category by ID
// @route   GET /api/categories/:id
const getCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.getCategoryById(req.params.id);

  res.status(200).json({
    success: true,
    data: category,
  });
});

// @desc    Create a new category
// @route   POST /api/categories
const createCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.body);

  res.status(201).json({
    success: true,
    data: category,
    message: 'Category created successfully',
  });
});

// @desc    Update a category
// @route   PUT /api/categories/:id
const updateCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.updateCategory(req.params.id, req.body);

  res.status(200).json({
    success: true,
    data: category,
    message: 'Category updated successfully',
  });
});

// @desc    Delete a category (blocked if products reference it)
// @route   DELETE /api/categories/:id
const deleteCategory = asyncHandler(async (req, res) => {
  await categoryService.deleteCategory(req.params.id);

  res.status(200).json({
    success: true,
    data: {},
    message: 'Category deleted successfully',
  });
});

module.exports = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};
