import React, { useState, useEffect } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import { initialCategories } from '../../api/mockData';

const UNIT_OPTIONS = ['piece', 'meter', 'box', 'coil', 'kg', 'set'];
const GST_RATES = [0, 5, 12, 18, 28];

export const ProductForm = ({
  initialData = null,
  categories = initialCategories,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    category: categories[0] || 'Wires & Cables',
    brand: '',
    unit: 'piece',
    unitPrice: '',
    stockQty: '',
    reorderLevel: '5',
    gstRate: '18',
    barcode: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        category: initialData.category || categories[0] || 'Wires & Cables',
        brand: initialData.brand || '',
        unit: initialData.unit || 'piece',
        unitPrice: initialData.unitPrice !== undefined ? String(initialData.unitPrice) : '',
        stockQty: initialData.stockQty !== undefined ? String(initialData.stockQty) : '',
        reorderLevel: initialData.reorderLevel !== undefined ? String(initialData.reorderLevel) : '5',
        gstRate: initialData.gstRate !== undefined ? String(initialData.gstRate) : '18',
        barcode: initialData.barcode || ''
      });
    }
  }, [initialData, categories]);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = 'Product name is required';
    } else if (formData.name.length > 100) {
      errs.name = 'Name must be 100 characters or less';
    }

    if (!formData.category) {
      errs.category = 'Category is required';
    }

    if (formData.brand && formData.brand.length > 50) {
      errs.brand = 'Brand must be 50 characters or less';
    }

    if (formData.unitPrice === '' || Number(formData.unitPrice) < 0) {
      errs.unitPrice = 'Valid price is required (min 0)';
    }

    if (formData.stockQty === '' || Number(formData.stockQty) < 0) {
      errs.stockQty = 'Valid stock quantity is required (min 0)';
    }

    if (formData.reorderLevel === '' || Number(formData.reorderLevel) < 0) {
      errs.reorderLevel = 'Valid reorder level is required (min 0)';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      name: formData.name.trim(),
      category: formData.category,
      brand: formData.brand.trim(),
      unit: formData.unit,
      unitPrice: parseFloat(formData.unitPrice),
      stockQty: parseInt(formData.stockQty, 10),
      reorderLevel: parseInt(formData.reorderLevel, 10),
      gstRate: parseFloat(formData.gstRate),
      barcode: formData.barcode.trim()
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Product Name */}
      <Input
        label="Product Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="e.g. Finolex 1.5 sq mm FR PVC Wire (Red 90m)"
        error={errors.name}
        required
        maxLength={100}
      />

      {/* Category & Brand */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Category <span className="text-red-500 font-bold">*</span>
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-xs text-red-600 font-medium">{errors.category}</p>
          )}
        </div>

        <Input
          label="Brand Name"
          name="brand"
          value={formData.brand}
          onChange={handleChange}
          placeholder="e.g. Finolex, Havells, Anchor"
          error={errors.brand}
          maxLength={50}
        />
      </div>

      {/* Unit, Unit Price, GST */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Unit of Measure <span className="text-red-500 font-bold">*</span>
          </label>
          <select
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 capitalize"
          >
            {UNIT_OPTIONS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Unit Price (₹)"
          name="unitPrice"
          type="number"
          step="0.01"
          min="0"
          value={formData.unitPrice}
          onChange={handleChange}
          placeholder="0.00"
          prefix="₹"
          error={errors.unitPrice}
          required
        />

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            GST Rate (%) <span className="text-red-500 font-bold">*</span>
          </label>
          <select
            name="gstRate"
            value={formData.gstRate}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {GST_RATES.map((rate) => (
              <option key={rate} value={rate}>
                {rate}% GST {rate === 18 ? '(Default - 9% CGST + 9% SGST)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stock Qty, Reorder Level, Barcode */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          label="Initial / Current Stock"
          name="stockQty"
          type="number"
          min="0"
          value={formData.stockQty}
          onChange={handleChange}
          placeholder="0"
          error={errors.stockQty}
          required
        />

        <Input
          label="Reorder Level"
          name="reorderLevel"
          type="number"
          min="0"
          value={formData.reorderLevel}
          onChange={handleChange}
          placeholder="5"
          error={errors.reorderLevel}
          helperText="Alert when stock hits this count"
          required
        />

        <Input
          label="Barcode / SKU (Optional)"
          name="barcode"
          value={formData.barcode}
          onChange={handleChange}
          placeholder="e.g. 890123456"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={loading}>
          {initialData ? 'Update Product' : 'Add Product'}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
