/**
 * Category Service
 * Contains all business logic for category operations.
 */
const Category = require('../models/Category');
const Product = require('../models/Product');

/**
 * Get all categories sorted by name.
 * @returns {Array} categories
 */
const getCategories = async () => {
  const categories = await Category.find().sort({ name: 1 });
  return categories;
};

/**
 * Get a single category by ID.
 * @param {String} id - Category ID
 * @returns {Object} category
 * @throws {Error} if not found
 */
const getCategoryById = async (id) => {
  const category = await Category.findById(id);

  if (!category) {
    const error = new Error('Category not found');
    error.statusCode = 404;
    throw error;
  }

  return category;
};

/**
 * Create a new category.
 * @param {Object} data - { name, description? }
 * @returns {Object} created category
 */
const createCategory = async (data) => {
  const { name, description } = data;
  const category = await Category.create({ name, description });
  return category;
};

/**
 * Update a category by ID.
 * @param {String} id - Category ID
 * @param {Object} data - Fields to update
 * @returns {Object} updated category
 * @throws {Error} if not found
 */
const updateCategory = async (id, data) => {
  let category = await Category.findById(id);

  if (!category) {
    const error = new Error('Category not found');
    error.statusCode = 404;
    throw error;
  }

  category = await Category.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  return category;
};

/**
 * Delete a category. Blocks if active products reference it.
 * @param {String} id - Category ID
 * @throws {Error} if not found or products reference it
 */
const deleteCategory = async (id) => {
  const category = await Category.findById(id);

  if (!category) {
    const error = new Error('Category not found');
    error.statusCode = 404;
    throw error;
  }

  const productCount = await Product.countDocuments({
    category: id,
    isActive: true,
  });

  if (productCount > 0) {
    const error = new Error(
      `Cannot delete category. ${productCount} active product(s) still reference it.`
    );
    error.statusCode = 400;
    throw error;
  }

  await Category.findByIdAndDelete(id);
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
