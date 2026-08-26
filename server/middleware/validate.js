/**
 * Validation Middleware
 * Uses express-validator to validate request bodies.
 * Each export is an array of validation rules + a result checker.
 */
const { body, param, validationResult } = require('express-validator');

/**
 * Checks validation results and returns 400 with errors if any.
 */
const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(
      errors
        .array()
        .map((e) => e.msg)
        .join(', ')
    );
  }
  next();
};

// ─── PRODUCT VALIDATION ──────────────────────────────────────────────────────

const validateCreateProduct = [
  body('name')
    .notEmpty()
    .withMessage('Product name is required')
    .isString()
    .withMessage('Product name must be a string')
    .trim()
    .isLength({ max: 100 })
    .withMessage('Product name must be at most 100 characters'),
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isMongoId()
    .withMessage('Category must be a valid ID'),
  body('brand')
    .optional()
    .isString()
    .withMessage('Brand must be a string')
    .trim()
    .isLength({ max: 100 })
    .withMessage('Brand must be at most 100 characters'),
  body('unit')
    .optional()
    .isString()
    .withMessage('Unit must be a string')
    .trim(),
  body('unitPrice')
    .notEmpty()
    .withMessage('Unit price is required')
    .isFloat({ min: 0 })
    .withMessage('Unit price must be a non-negative number'),
  body('stockQty')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock quantity must be a non-negative integer'),
  body('reorderLevel')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Reorder level must be a non-negative integer'),
  body('gstRate')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('GST rate must be between 0 and 100'),
  body('barcode')
    .optional()
    .isString()
    .withMessage('Barcode must be a string')
    .trim(),
  checkValidation,
];

const validateUpdateProduct = [
  body('name')
    .optional()
    .isString()
    .withMessage('Product name must be a string')
    .trim()
    .isLength({ max: 100 })
    .withMessage('Product name must be at most 100 characters'),
  body('category')
    .optional()
    .isMongoId()
    .withMessage('Category must be a valid ID'),
  body('brand')
    .optional()
    .isString()
    .withMessage('Brand must be a string')
    .trim()
    .isLength({ max: 100 })
    .withMessage('Brand must be at most 100 characters'),
  body('unit')
    .optional()
    .isString()
    .withMessage('Unit must be a string')
    .trim(),
  body('unitPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Unit price must be a non-negative number'),
  body('stockQty')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock quantity must be a non-negative integer'),
  body('reorderLevel')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Reorder level must be a non-negative integer'),
  body('gstRate')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('GST rate must be between 0 and 100'),
  body('barcode')
    .optional()
    .isString()
    .withMessage('Barcode must be a string')
    .trim(),
  checkValidation,
];

// ─── CATEGORY VALIDATION ─────────────────────────────────────────────────────

const validateCreateCategory = [
  body('name')
    .notEmpty()
    .withMessage('Category name is required')
    .isString()
    .withMessage('Category name must be a string')
    .trim()
    .isLength({ max: 100 })
    .withMessage('Category name must be at most 100 characters'),
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .trim(),
  checkValidation,
];

const validateUpdateCategory = [
  body('name')
    .optional()
    .isString()
    .withMessage('Category name must be a string')
    .trim()
    .isLength({ max: 100 })
    .withMessage('Category name must be at most 100 characters'),
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .trim(),
  checkValidation,
];

// ─── SALE VALIDATION ─────────────────────────────────────────────────────────

const validateCreateSale = [
  body('customerName')
    .optional()
    .isString()
    .withMessage('Customer name must be a string')
    .trim()
    .isLength({ max: 100 })
    .withMessage('Customer name must be at most 100 characters'),
  body('customerPhone')
    .optional()
    .matches(/^\d{10}$/)
    .withMessage('Customer phone must be a 10-digit number'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),
  body('items.*.productId')
    .notEmpty()
    .withMessage('Product ID is required for each item')
    .isMongoId()
    .withMessage('Product ID must be a valid ID'),
  body('items.*.quantity')
    .notEmpty()
    .withMessage('Quantity is required for each item')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  body('discountAmt')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Discount amount must be a non-negative number'),
  body('paymentMethod')
    .optional()
    .isString()
    .withMessage('Payment method must be a string')
    .trim(),
  checkValidation,
];

// ─── STOCK ADJUSTMENT VALIDATION ─────────────────────────────────────────────

const validateStockAdjust = [
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Product ID must be a valid ID'),
  body('qtyChange')
    .notEmpty()
    .withMessage('Quantity change is required')
    .isInt()
    .withMessage('Quantity change must be an integer'),
  body('note')
    .optional()
    .isString()
    .withMessage('Note must be a string')
    .trim(),
  checkValidation,
];

// ─── PARAM VALIDATION ────────────────────────────────────────────────────────

const validateMongoId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  checkValidation,
];

const validateProductIdParam = [
  param('productId')
    .isMongoId()
    .withMessage('Invalid Product ID format'),
  checkValidation,
];

module.exports = {
  validateCreateProduct,
  validateUpdateProduct,
  validateCreateCategory,
  validateUpdateCategory,
  validateCreateSale,
  validateStockAdjust,
  validateMongoId,
  validateProductIdParam,
};
