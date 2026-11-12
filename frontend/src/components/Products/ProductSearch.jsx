import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, X } from 'lucide-react';
import Button from '../common/Button';

export const ProductSearch = ({
  search = '',
  onSearchChange,
  category = 'All',
  onCategoryChange,
  categories = [],
  onAddNew
}) => {
  const [localSearch, setLocalSearch] = useState(search);

  // Debounce search by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      onSearchChange(localSearch);
    }, 300);
    return () => clearTimeout(handler);
  }, [localSearch, onSearchChange]);

  return (
    <div className="bg-white/90 dark:bg-[#121a2d]/90 backdrop-blur-md rounded-2xl p-4 shadow-xs border border-slate-200/80 dark:border-slate-800/90 flex flex-col md:flex-row items-center justify-between gap-3 transition-colors">
      {/* Search Input */}
      <div className="relative w-full md:w-80 lg:w-96">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Search by name, brand, barcode..."
          className="w-full pl-10 pr-9 py-2 text-sm bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
        />
        {localSearch && (
          <button
            type="button"
            onClick={() => setLocalSearch('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category filter & Add button */}
      <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 hidden sm:block" />
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="py-2 px-3 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-medium cursor-pointer"
          >
            <option value="All">All Categories</option>
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
        </div>

        <Button
          variant="primary"
          icon={Plus}
          onClick={onAddNew}
          className="shrink-0 font-semibold shadow-glow-sm"
        >
          Add Product
        </Button>
      </div>
    </div>
  );
};

export default ProductSearch;
