import React, { useState, useEffect } from 'react';
import { Search, Plus, PackageCheck, AlertCircle, Scan } from 'lucide-react';
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

  useEffect(() => {
    productService.getCategories().then((cats) => {
      setCategories(cats || []);
    });
  }, []);

  useEffect(() => {
    let active = true;
    const fetchTimer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await productService.getAll({
          search: searchTerm,
          category: selectedCategory === 'All' ? '' : selectedCategory,
          page: 1,
          limit: 20
        });
        if (active) {
          setSearchResults(data.products || []);
        }
      } catch (err) {
        console.error('Failed to search products', err);
      } finally {
        if (active) setLoading(false);
      }
    }, 200);

    return () => {
      active = false;
      clearTimeout(fetchTimer);
    };
  }, [searchTerm, selectedCategory]);

  return (
    <div className="bg-[#faf8f5] dark:bg-[#0c1322] rounded border border-[#ded9cb] dark:border-slate-800 p-3 sm:p-4 flex flex-col h-full font-mono text-xs shadow-xs transition-colors">
      {/* Search Header */}
      <div className="space-y-2.5 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white">
              PRODUCT CATALOG &amp; RACKS
            </h3>
          </div>
          <span className="px-2 py-0.5 rounded bg-[#eee9dc] dark:bg-slate-800 border border-[#ded9cb] dark:border-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-300">
            [● SCAN READY]
          </span>
        </div>

        {/* Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Scan barcode or type name, Tamil, SKU (e.g. 1.5 wire, MCB)..."
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-[#ded9cb] dark:border-slate-700 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none placeholder:text-slate-400 text-slate-900 dark:text-white font-mono"
            autoFocus
          />
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedCategory('All')}
            className={`px-2.5 py-1 rounded font-bold transition-all shrink-0 border ${
              selectedCategory === 'All'
                ? 'bg-black text-white border-black shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-[#ded9cb] dark:border-slate-700 hover:bg-[#eee9dc]'
            }`}
          >
            ALL ({searchResults.length})
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
                className={`px-2.5 py-1 rounded font-bold uppercase transition-all shrink-0 border ${
                  isSelected
                    ? 'bg-black text-white border-black shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-[#ded9cb] dark:border-slate-700 hover:bg-[#eee9dc]'
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
          <div className="h-48 flex items-center justify-center">
            <LoadingSpinner size="sm" message="Searching catalog..." />
          </div>
        ) : searchResults.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-center p-6 bg-white dark:bg-slate-900 rounded border border-dashed border-[#ded9cb] dark:border-slate-800">
            <AlertCircle className="w-6 h-6 text-slate-400 mb-1" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No matching items found</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Try searching with barcode, SKU, or name</p>
          </div>
        ) : (
          searchResults.map((product) => {
            const cartItem = cart.find((i) => i.productId === product._id);
            const inCartQty = cartItem ? cartItem.quantity : 0;
            const isOutOfStock = product.stockQty <= 0;
            const isMaxInCart = inCartQty >= product.stockQty;
            const isCritical = product.stockQty <= product.reorderLevel;

            return (
              <div
                key={product._id}
                onClick={() => !isOutOfStock && !isMaxInCart && addToCart(product)}
                className={`p-2.5 rounded border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                  isOutOfStock
                    ? 'bg-slate-100 dark:bg-slate-900 border-[#ded9cb] dark:border-slate-800 opacity-60 cursor-not-allowed'
                    : inCartQty > 0
                    ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-400 dark:border-blue-700'
                    : 'bg-white dark:bg-slate-900 border-[#ded9cb] dark:border-slate-700 hover:border-black dark:hover:border-slate-400'
                }`}
              >
                {/* Product Details */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate">
                      {product.name}
                    </span>
                  </div>

                  {product.tamilName && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-tamil truncate">
                      {product.tamilName}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px]">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatCurrency(product.unitPrice)}
                      <span className="text-[9px] text-slate-500 font-normal ml-0.5">
                        /{product.unit || 'pc'}
                      </span>
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">|</span>
                    <span className="px-1.5 py-0.2 rounded bg-[#eee9dc] dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                      {product.rackLocation || 'RACK E-03'}
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">|</span>
                    <span
                      className={`text-[10px] font-bold ${
                        isOutOfStock
                          ? 'text-rose-600'
                          : isCritical
                          ? 'text-rose-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {isOutOfStock ? 'OUT OF STOCK' : `Stock: ${product.stockQty} ${product.unit || 'pcs'}`}
                    </span>
                  </div>
                </div>

                {/* Add to Bill Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(product);
                  }}
                  disabled={isOutOfStock || isMaxInCart}
                  className={`px-3 py-1.5 rounded text-xs font-bold transition-all shrink-0 active:scale-95 ${
                    isOutOfStock
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : isMaxInCart
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-black text-white hover:bg-slate-800'
                  }`}
                >
                  {isMaxInCart ? (
                    <span>Max ({inCartQty})</span>
                  ) : (
                    <span>{inCartQty > 0 ? `+ Add (${inCartQty})` : '+ Add'}</span>
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
