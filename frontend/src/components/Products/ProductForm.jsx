import React, { useState, useEffect } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';

const UNIT_OPTIONS = ['piece', 'meter', 'box', 'coil', 'kg', 'set'];
const GST_RATES = [0, 5, 12, 18, 28];

export const ProductForm = ({
  initialData = null,
  categories = [],
  onCreateCategory,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const getCatValue = (cat) => (typeof cat === 'object' && cat !== null ? cat._id || cat.name : cat);
  const getCatLabel = (cat) => (typeof cat === 'object' && cat !== null ? cat.name : cat);

  const defaultCategory = categories.length > 0 ? getCatValue(categories[0]) : '';

  const [formData, setFormData] = useState({
    name: '',
    category: defaultCategory,
    brand: '',
    unit: 'piece',
    unitPrice: '',
    stockQty: '',
    reorderLevel: '5',
    gstRate: '18',
    barcode: ''
  });

  const [errors, setErrors] = useState({});
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [creatingCatLoading, setCreatingCatLoading] = useState(false);

  const handleCreateCategory = async (e) => {
    e?.preventDefault();
    if (!newCategoryName.trim()) return;
    if (!onCreateCategory) return;
    setCreatingCatLoading(true);
    try {
      const created = await onCreateCategory(newCategoryName.trim());
      const createdVal = getCatValue(created);
      setFormData((prev) => ({ ...prev, category: createdVal }));
      setNewCategoryName('');
      setIsAddingCategory(false);
      if (errors.category) {
        setErrors((prev) => ({ ...prev, category: '' }));
      }
    } catch {
      // Error handled by hook toast
    } finally {
      setCreatingCatLoading(false);
    }
  };

  useEffect(() => {
    if (initialData) {
      const initialCatVal = initialData.category 
        ? (typeof initialData.category === 'object' ? initialData.category._id : initialData.category)
        : defaultCategory;

      setFormData({
        name: initialData.name || '',
        category: initialCatVal || defaultCategory,
        brand: initialData.brand || '',
        unit: initialData.unit || 'piece',
        unitPrice: String(initialData.unitPrice ?? ''),
        stockQty: String(initialData.stockQty ?? ''),
        reorderLevel: String(initialData.reorderLevel ?? '5'),
        gstRate: String(initialData.gstRate ?? '18'),
        barcode: initialData.barcode || ''
      });
    }
  }, [initialData, categories, defaultCategory]);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Product name is required';
    if (!formData.category) errs.category = 'Category is required';
    if (!formData.unitPrice || isNaN(formData.unitPrice) || Number(formData.unitPrice) < 0) {
      errs.unitPrice = 'Enter a valid unit price';
    }
    if (!formData.stockQty || isNaN(formData.stockQty) || Number(formData.stockQty) < 0) {
      errs.stockQty = 'Enter a valid stock quantity';
    }
    if (!formData.reorderLevel || isNaN(formData.reorderLevel) || Number(formData.reorderLevel) < 0) {
      errs.reorderLevel = 'Enter a valid reorder limit';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
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
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Category <span className="text-red-500 font-bold">*</span>
            </label>
            {onCreateCategory && !isAddingCategory && (
              <button
                type="button"
                onClick={() => setIsAddingCategory(true)}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:underline"
              >
                + Add New
              </button>
            )}
          </div>

          {isAddingCategory ? (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Wires & Cables"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCreateCategory();
                    } else if (e.key === 'Escape') {
                      setIsAddingCategory(false);
                      setNewCategoryName('');
                    }
                  }}
                  className="flex-1 rounded-xl border border-blue-500 bg-white dark:bg-[#0f172a] px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
                <button
                  type="button"
                  disabled={creatingCatLoading || !newCategoryName.trim()}
                  onClick={handleCreateCategory}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-colors"
                >
                  {creatingCatLoading ? '...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingCategory(false);
                    setNewCategoryName('');
                  }}
                  className="px-2.5 py-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
              </div>
              <p className="text-[11px] text-slate-400">Press Enter to save, Esc to cancel</p>
            </div>
          ) : (
            <select
              name="category"
              value={formData.category}
              onChange={(e) => {
                if (e.target.value === '__NEW__') {
                  setIsAddingCategory(true);
                } else {
                  handleChange(e);
                }
              }}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f172a] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              {categories.length === 0 ? (
                <option value="">Select Category</option>
              ) : (
                <option value="">-- Select Category --</option>
              )}
              {categories.map((cat, idx) => {
                const val = getCatValue(cat);
                const label = getCatLabel(cat);
                return (
                  <option key={val || idx} value={val}>
                    {label}
                  </option>
                );
              })}
              {onCreateCategory && (
                <option value="__NEW__" className="font-semibold text-blue-600">
                  + Create New Category...
                </option>
              )}
            </select>
          )}

          {errors.category && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">{errors.category}</p>
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
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Unit of Measure <span className="text-red-500 font-bold">*</span>
          </label>
          <select
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f172a] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            {UNIT_OPTIONS.map((u) => (
              <option key={u} value={u}>
                {u.charAt(0).toUpperCase() + u.slice(1)}
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
          error={errors.unitPrice}
          required
        />

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            GST Rate (%)
          </label>
          <select
            name="gstRate"
            value={formData.gstRate}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f172a] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            {GST_RATES.map((rate) => (
              <option key={rate} value={rate}>
                {rate}% GST
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stock Quantity & Reorder Level */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Current Stock Quantity"
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
          label="Reorder Alert Level"
          name="reorderLevel"
          type="number"
          min="0"
          value={formData.reorderLevel}
          onChange={handleChange}
          placeholder="5"
          error={errors.reorderLevel}
          required
        />
      </div>

      {/* Barcode */}
      <Input
        label="Barcode / SKU (Optional)"
        name="barcode"
        value={formData.barcode}
        onChange={handleChange}
        placeholder="e.g. 8901234567890"
        maxLength={50}
      />

      {/* Form Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={loading}
        >
          {initialData ? 'Update Product' : 'Add Product'}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
