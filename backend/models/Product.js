const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name required'],
    trim: true,
    maxlength: [100, 'Max 100 chars']
  },
  tamilName: {
    type: String,
    trim: true,
    maxlength: [150, 'Max 150 chars'],
    default: ''
  },
  sku: {
    type: String,
    trim: true,
    uppercase: true,
    maxlength: [30, 'Max 30 chars']
  },
  rackLocation: {
    type: String,
    trim: true,
    uppercase: true,
    default: 'RACK A-01'
  },
  packagingConversion: {
    type: String,
    trim: true,
    default: '1 Unit = 1 Pc'
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category required']
  },
  brand: {
    type: String,
    trim: true,
    maxlength: [50, 'Max 50 chars'],
    default: 'Generic'
  },
  unit: {
    type: String,
    enum: ['piece', 'meter', 'box', 'coil', 'kg', 'set', 'bag', 'length', 'unit', 'coils', 'pcs', 'boxes'],
    default: 'piece'
  },
  purchasePrice: {
    type: Number,
    min: [0, 'Cannot be negative'],
    default: 0
  },
  unitPrice: {
    type: Number,
    required: [true, 'Unit price required'],
    min: [0, 'Cannot be negative'],
    validate: {
      validator: v => v === Math.round(v * 100) / 100,
      message: 'Max 2 decimal places'
    }
  },
  hsnCode: {
    type: String,
    trim: true,
    default: '8544'
  },
  stockQty: {
    type: Number,
    required: true,
    min: [0, 'Cannot be negative'],
    default: 0
  },
  reorderLevel: {
    type: Number,
    required: true,
    min: [0, 'Cannot be negative'],
    default: 5
  },
  gstRate: {
    type: Number,
    required: true,
    min: [0, 'Cannot be negative'],
    max: [100, 'Max 100'],
    default: 18
  },
  barcode: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

productSchema.virtual('isLowStock').get(function() {
  return this.stockQty <= this.reorderLevel;
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

productSchema.index({ name: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ stockQty: 1, reorderLevel: 1 });
productSchema.index({ barcode: 1 }, { sparse: true, unique: true });
productSchema.index({ isActive: 1 });

module.exports = mongoose.model('Product', productSchema);
