import React, { useState, useEffect } from 'react';
import { Search, Plus, PackageCheck, AlertCircle, Zap } from 'lucide-react';
import { productService } from '../../api/services';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatCurrency';
import LoadingSpinner from '../common/LoadingSpinner';

export const ProductSelector = () => {
  const { addToCart, cart } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load categories on mount
  useEffect(() => {
    productService.getCategories().then((cats) => {
      setCategories(cats || []);
    });
  }, []);

  // Fetch search products with 250ms debounce
  useEffect(() => {
    let active = true;
    const fetchTimer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await productService.getAll({
          search: searchTerm,
          category: selectedCategory === 'All' ? '' : selectedCategory,
          page: 1,
          limit: 10
        });
        if (active) {
          setSearchResults(data.products || []);
        }
      } catch (err) {
        console.error('Failed to search products', err);
      } finally {
        if (active) setLoading(false);
      }
    }, 250);

    return () => {
      active = false;
      clearTimeout(fetchTimer);
    };
  }, [searchTerm, selectedCategory]);

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-4 sm:p-5 flex flex-col h-full">
      {/* Search Header */}
      <div className="space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Zap className="w-4 h-4 fill-blue-600" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Select Products</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {searchResults.length} available
          </span>
        </div>

        {/* Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Scan barcode or type name (e.g. wire, fan, bulb)..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-slate-400"
            autoFocus
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            type="button"
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 ${
              selectedCategory === 'All'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All
          </button>
          {categories.map((cat, idx) => {
            const val = typeof cat === 'object' && cat !== null ? (cat._id || cat.name) : cat;
            const label = typeof cat === 'object' && cat !== null ? cat.name : cat;
            const isSelected = selectedCategory === val || selectedCategory === label;
            return (
              <button
                key={val || idx}
                type="button"
                onClick={() => setSelectedCategory(val)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Results Grid */}
      <div className="mt-4 flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[360px]">
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <LoadingSpinner size="md" message="Searching products..." />
          </div>
        ) : searchResults.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <AlertCircle className="w-8 h-8 text-slate-400 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No matching items found</p>
            <p className="text-xs text-slate-500 mt-1">Try another search term or category</p>
          </div>
        ) : (
          searchResults.map((product) => {
            const cartItem = cart.find((i) => i.productId === product._id);
            const inCartQty = cartItem ? cartItem.quantity : 0;
            const isOutOfStock = product.stockQty <= 0;
            const isMaxInCart = inCartQty >= product.stockQty;

            return (
              <div
                key={product._id}
                className={`p-3.5 rounded-xl border transition-all duration-150 flex items-center justify-between gap-3 ${
                  isOutOfStock
                    ? 'bg-slate-50/70 border-slate-200 opacity-60'
                    : inCartQty > 0
                    ? 'bg-blue-50/40 border-blue-200 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-xs'
                }`}
              >
                {/* Product Details */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 truncate">
                      {product.name}
                    </h4>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">
                      {formatCurrency(product.unitPrice)}
                      <span className="text-[10px] text-slate-400 font-normal ml-0.5">
                        /{product.unit || 'pc'}
                      </span>
                    </span>
                    <span className="text-slate-300">•</span>
                    <span
                      className={`font-semibold ${
                        isOutOfStock
                          ? 'text-red-600'
                          : product.stockQty <= product.reorderLevel
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {isOutOfStock ? 'Out of stock' : `Stock: ${product.stockQty} ${product.unit || 'pcs'}`}
                    </span>
                    {product.brand && (
                      <>
                        <span className="text-slate-300 hidden sm:inline">•</span>
                        <span className="text-slate-500 hidden sm:inline">{product.brand}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Add to Bill Button */}
                <button
                  type="button"
                  onClick={() => addToCart(product)}
                  disabled={isOutOfStock || isMaxInCart}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                    isOutOfStock
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : isMaxInCart
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-sm'
                  }`}
                >
                  {isMaxInCart ? (
                    <>
                      <PackageCheck className="w-3.5 h-3.5" />
                      <span>Max ({inCartQty})</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>{inCartQty > 0 ? `+ Add (${inCartQty})` : '+ Add to Bill'}</span>
                    </>
                  )}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ProductSelector;
