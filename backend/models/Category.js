const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [50, 'Max 50 chars']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Max 200 chars']
  }
}, { timestamps: true });

categorySchema.index({ name: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });

module.exports = mongoose.model('Category', categorySchema);
