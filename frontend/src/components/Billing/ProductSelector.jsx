import React, { useState, useEffect } from 'react';
import { Search, Plus, PackageCheck, AlertCircle, Zap, Sparkles } from 'lucide-react';
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
          limit: 12
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
    <div className="bg-white/90 dark:bg-[#121a2d]/90 backdrop-blur-md rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-800/90 p-4 sm:p-5 flex flex-col h-full transition-colors">
      {/* Search Header */}
      <div className="space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-cyan-400 border border-blue-200/50 dark:border-cyan-800/50">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Product Catalog</h3>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono font-medium">
            {searchResults.length} in view
          </span>
        </div>

        {/* Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Scan barcode or search (e.g. 2.5mm wire, LED bulb, MCB)..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-white"
            autoFocus
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all shrink-0 ${
              selectedCategory === 'All'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
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
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all shrink-0 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Results Grid */}
      <div className="mt-3 flex-1 overflow-y-auto space-y-2 pr-1 min-h-[340px]">
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <LoadingSpinner size="md" message="Searching catalog..." />
          </div>
        ) : searchResults.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <AlertCircle className="w-8 h-8 text-slate-400 mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No matching items found</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Try another search keyword or category filter</p>
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
                className={`p-3 rounded-xl border transition-all duration-150 flex items-center justify-between gap-3 ${
                  isOutOfStock
                    ? 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 opacity-60'
                    : inCartQty > 0
                    ? 'bg-blue-50/40 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 shadow-xs'
                    : 'bg-white dark:bg-[#151f32] border-slate-200/80 dark:border-slate-800 hover:border-blue-400 dark:hover:border-cyan-500 hover:shadow-xs'
                }`}
              >
                {/* Product Details */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {product.name}
                    </h4>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold font-tabular text-slate-800 dark:text-slate-200">
                      {formatCurrency(product.unitPrice)}
                      <span className="text-[10px] text-slate-400 font-normal ml-0.5">
                        /{product.unit || 'pc'}
                      </span>
                    </span>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <span
                      className={`font-semibold text-[11px] ${
                        isOutOfStock
                          ? 'text-rose-500'
                          : product.stockQty <= product.reorderLevel
                          ? 'text-amber-500'
                          : 'text-emerald-500'
                      }`}
                    >
                      {isOutOfStock ? 'Out of stock' : `Stock: ${product.stockQty} ${product.unit || 'pcs'}`}
                    </span>
                    {product.brand && (
                      <>
                        <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">•</span>
                        <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">{product.brand}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Add to Bill Button */}
                <button
                  type="button"
                  onClick={() => addToCart(product)}
                  disabled={isOutOfStock || isMaxInCart}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 active:scale-95 ${
                    isOutOfStock
                      ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                      : isMaxInCart
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                      : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-xs'
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
                      <span>{inCartQty > 0 ? `+ Add (${inCartQty})` : '+ Add'}</span>
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
