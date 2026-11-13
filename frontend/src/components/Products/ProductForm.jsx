import React, { useState, useEffect } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';

const UNIT_OPTIONS = ['piece', 'coil', 'box', 'meter', 'bag', 'unit', 'set', 'kg'];
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

  const defaultCategory = categories.length > 0 ? getCatValue(categories[0]) : '';

  const [formData, setFormData] = useState({
    name: '',
    tamilName: '',
    sku: '',
    rackLocation: 'RACK E-01',
    packagingConversion: '',
    purchasePrice: '',
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
        tamilName: initialData.tamilName || '',
        sku: initialData.sku || '',
        rackLocation: initialData.rackLocation || 'RACK E-01',
        packagingConversion: initialData.packagingConversion || '',
        purchasePrice: String(initialData.purchasePrice ?? ''),
        category: initialCatVal || defaultCategory,
        brand: initialData.brand || '',
        unit: initialData.unit || 'piece',
        unitPrice: String(initialData.unitPrice ?? ''),
        stockQty: String(initialData.stockQty ?? ''),
        reorderLevel: String(initialData.reorderLevel ?? '5'),
        gstRate: String(initialData.gstRate ?? '18'),
        barcode: initialData.barcode || ''
      });
    } else if (!formData.category && categories.length > 0) {
      setFormData((prev) => ({
        ...prev,
        category: prev.category || getCatValue(categories[0])
      }));
    }
  }, [initialData, categories, defaultCategory]);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Product name is required';
    if (!formData.category) errs.category = 'Category is required';
    if (!formData.unitPrice || isNaN(formData.unitPrice) || Number(formData.unitPrice) < 0) {
      errs.unitPrice = 'Enter a valid selling price';
    }
    if (!formData.stockQty || isNaN(formData.stockQty) || Number(formData.stockQty) < 0) {
      errs.stockQty = 'Enter a valid stock quantity';
    }
    if (!formData.reorderLevel || isNaN(formData.reorderLevel) || Number(formData.reorderLevel) < 0) {
      errs.reorderLevel = 'Enter a valid reorder level';
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
      tamilName: formData.tamilName.trim(),
      sku: formData.sku.trim() || formData.barcode.trim(),
      rackLocation: formData.rackLocation.trim(),
      packagingConversion: formData.packagingConversion.trim(),
      purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : Math.round(parseFloat(formData.unitPrice) * 0.78),
      category: formData.category,
      brand: formData.brand.trim(),
      unit: formData.unit,
      unitPrice: parseFloat(formData.unitPrice),
      stockQty: parseInt(formData.stockQty, 10),
      reorderLevel: parseInt(formData.reorderLevel, 10),
      gstRate: parseFloat(formData.gstRate),
      barcode: formData.barcode.trim() || formData.sku.trim()
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
      {/* Product Name (English) */}
      <Input
        label="PRODUCT NAME (ENGLISH) *"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="e.g. Finolex 1.5 sq mm FR PVC Wire (Red 90m)"
        error={errors.name}
        required
        maxLength={100}
      />

      {/* Tamil Name */}
      <div>
        <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase mb-1">
          TAMIL NAME / தமிழ் பெயர் (OPTIONAL)
        </label>
        <input
          type="text"
          name="tamilName"
          value={formData.tamilName}
          onChange={handleChange}
          placeholder="எ.கா. பினோலெக்ஸ் 1.5 மிமீ காப்பர் ஒயர் (சிவப்பு)"
          className="w-full px-3 py-2 rounded border border-[#ded9cb] dark:border-slate-700 bg-white dark:bg-slate-900 font-tamil text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Category & Brand */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase">
              CATEGORY *
            </label>
            {onCreateCategory && !isAddingCategory && (
              <button
                type="button"
                onClick={() => setIsAddingCategory(true)}
                className="text-[11px] font-bold text-blue-600 hover:underline"
              >
                + New
              </button>
            )}
          </div>

          {isAddingCategory ? (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Category name"
                className="flex-1 px-2.5 py-1.5 rounded border border-blue-500 bg-white dark:bg-slate-900 text-xs"
              />
              <button
                type="button"
                onClick={handleCreateCategory}
                className="px-2 py-1.5 bg-blue-600 text-white rounded text-xs font-bold"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsAddingCategory(false)}
                className="px-2 py-1.5 text-slate-500 text-xs"
              >
                X
              </button>
            </div>
          ) : (
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded border border-[#ded9cb] dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Category</option>
              {categories.map((cat, idx) => {
                const val = typeof cat === 'object' && cat !== null ? (cat._id || cat.name) : cat;
                const label = typeof cat === 'object' && cat !== null ? cat.name : cat;
                return (
                  <option key={val || idx} value={val}>
                    {label}
                  </option>
                );
              })}
            </select>
          )}
        </div>

        <Input
          label="BRAND NAME"
          name="brand"
          value={formData.brand}
          onChange={handleChange}
          placeholder="e.g. Finolex, Havells, Crompton"
        />
      </div>

      {/* SKU & Rack Location */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="SKU CODE"
          name="sku"
          value={formData.sku}
          onChange={handleChange}
          placeholder="e.g. FIN-WIR-1.5-RD"
        />
        <Input
          label="RACK / BIN LOCATION"
          name="rackLocation"
          value={formData.rackLocation}
          onChange={handleChange}
          placeholder="e.g. RACK E-03, BIN P-14"
        />
      </div>

      {/* Unit of Measure & Packaging Conversion */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase mb-1">
            UNIT OF MEASURE *
          </label>
          <select
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded border border-[#ded9cb] dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-blue-500 capitalize"
          >
            {UNIT_OPTIONS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="PACKAGING CONVERSION"
          name="packagingConversion"
          value={formData.packagingConversion}
          onChange={handleChange}
          placeholder="e.g. 1 Coil = 90 meters, 1 Box = 12 Pcs"
        />
      </div>

      {/* Pricing: Purchase vs Selling */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input
          label="PURCHASE PRICE (₹)"
          name="purchasePrice"
          type="number"
          step="0.01"
          min="0"
          value={formData.purchasePrice}
          onChange={handleChange}
          placeholder="1180.00"
        />
        <Input
          label="SELLING PRICE (₹) *"
          name="unitPrice"
          type="number"
          step="0.01"
          min="0"
          value={formData.unitPrice}
          onChange={handleChange}
          placeholder="1450.00"
          error={errors.unitPrice}
          required
        />
        <div>
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase mb-1">
            GST RATE (%)
          </label>
          <select
            name="gstRate"
            value={formData.gstRate}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded border border-[#ded9cb] dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-blue-500"
          >
            {GST_RATES.map((rate) => (
              <option key={rate} value={rate}>
                {rate}% GST
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stock Quantity & Reorder Alert */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="CURRENT STOCK QUANTITY *"
          name="stockQty"
          type="number"
          min="0"
          value={formData.stockQty}
          onChange={handleChange}
          placeholder="51"
          error={errors.stockQty}
          required
        />
        <Input
          label="REORDER ALERT LEVEL *"
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

      {/* Barcode / SKU */}
      <Input
        label="BARCODE / SCANNER EAN-13 (OPTIONAL)"
        name="barcode"
        value={formData.barcode}
        onChange={handleChange}
        placeholder="890123400001"
      />

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#ded9cb] dark:border-slate-800">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" loading={loading} className="bg-blue-600 hover:bg-blue-700 font-bold">
          {initialData ? 'Update Product' : 'Add Product'}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
