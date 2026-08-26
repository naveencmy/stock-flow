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
    <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-3">
      {/* Search Input */}
      <div className="relative w-full md:w-80 lg:w-96">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Search by name, brand, barcode..."
          className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        />
        {localSearch && (
          <button
            type="button"
            onClick={() => setLocalSearch('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category filter & Add button */}
      <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer"
          >
            <option value="All">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          onClick={onAddNew}
          className="shrink-0"
        >
          Add Product
        </Button>
      </div>
    </div>
  );
};

export default ProductSearch;
