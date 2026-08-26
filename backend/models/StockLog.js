const mongoose = require('mongoose');

const stockLogSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  changeType: { type: String, enum: ['sale', 'purchase', 'adjustment', 'return'], required: true },
  qtyChange: { type: Number, required: true },
  prevStock: { type: Number, required: true, min: 0 },
  newStock: { type: Number, required: true, min: 0 },
  referenceId: { type: String, default: null },
  note: { type: String, trim: true, maxlength: 300 }
}, { timestamps: true });

stockLogSchema.index({ product: 1, createdAt: -1 });
stockLogSchema.index({ changeType: 1 });
stockLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('StockLog', stockLogSchema);
