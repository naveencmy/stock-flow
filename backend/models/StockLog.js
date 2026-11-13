const mongoose = require('mongoose');

const stockLogSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  tamilName: { type: String, default: '' },
  sku: { type: String, default: '' },
  rackLocation: { type: String, default: '' },
  unit: { type: String, default: 'piece' },
  changeType: {
    type: String,
    enum: ['sale', 'purchase', 'adjustment', 'return', 'damaged', 'surplus', 'theft', 'store_use'],
    required: true
  },
  qtyChange: { type: Number, required: true },
  prevStock: { type: Number, required: true, min: 0 },
  newStock: { type: Number, required: true, min: 0 },
  reasonCode: { type: String, default: 'General' },
  financialLoss: { type: Number, default: 0 },
  operator: { type: String, default: 'Naveen [Staff]' },
  referenceId: { type: String, default: null },
  note: { type: String, trim: true, maxlength: 500 }
}, { timestamps: true });

stockLogSchema.index({ product: 1, createdAt: -1 });
stockLogSchema.index({ changeType: 1 });
stockLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('StockLog', stockLogSchema);
