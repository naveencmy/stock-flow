const mongoose = require('mongoose');

const saleItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  gstRate: { type: Number, required: true, min: 0 },
  lineTotal: { type: Number, required: true, min: 0 }
}, { _id: true });

const saleSchema = new mongoose.Schema({
  billNumber: { type: String, required: true },
  customerName: { type: String, trim: true, maxlength: 100, default: 'Walk-in Customer' },
  customerPhone: {
    type: String,
    trim: true,
    default: null,
    validate: {
      validator: function(v) {
        return !v || /^\d{10}$/.test(v);
      },
      message: '10 digits only'
    }
  },
  items: [saleItemSchema],
  subTotal: { type: Number, required: true, min: 0 },
  totalGst: { type: Number, required: true, min: 0 },
  discountAmt: { type: Number, default: 0, min: 0 },
  grandTotal: { type: Number, required: true, min: 0 },
  paymentMethod: {
    type: String,
    enum: ['cash', 'upi', 'card', 'credit'],
    default: 'cash',
    lowercase: true,
    trim: true
  },
  whatsappSent: { type: Boolean, default: false },
  whatsappSentAt: { type: Date, default: null },
  whatsappProvider: { type: String, default: null }
}, { timestamps: true });

saleSchema.index({ billNumber: 1 }, { unique: true });
saleSchema.index({ createdAt: -1 });
saleSchema.index({ customerPhone: 1 });

module.exports = mongoose.model('Sale', saleSchema);
