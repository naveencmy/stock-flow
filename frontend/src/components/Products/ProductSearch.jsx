import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

export const ProductSearch = ({
  search = '',
  onSearchChange,
  category = 'All',
  onCategoryChange,
  categories = [],
  rack = 'All',
  onRackChange,
  racks = [],
  totalSkus = 0,
  onExportCsv,
  onAddNew
}) => {
  const [localSearch, setLocalSearch] = useState(search);

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearchChange(localSearch);
    }, 250);
    return () => clearTimeout(handler);
  }, [localSearch, onSearchChange]);

  const rackOptions = ['All Racks & Bins', ...(racks || [])];

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 bg-[#f4f1e8] dark:bg-[#121c30] p-2.5 rounded border border-[#ded9cb] dark:border-slate-800 font-mono text-xs shadow-xs">
      {/* Left SKUs Badge + Search Input */}
      <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
        <div className="px-2.5 py-1.5 rounded border border-[#ded9cb] dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-slate-800 dark:text-slate-200 text-xs whitespace-nowrap shadow-xs">
          [ {totalSkus} ACTIVE SKUS ]
        </div>

        <div className="relative flex-1 min-w-[220px]">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search by SKU, Name, தமிழ் பெயர்..."
            className="w-full pl-8 pr-12 py-1.5 rounded border border-[#ded9cb] dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs outline-none focus:ring-1 focus:ring-blue-500 font-mono"
          />
          {localSearch && (
            <button
              type="button"
              onClick={() => setLocalSearch('')}
              className="absolute inset-y-0 right-0 pr-2 flex items-center text-[10px] font-bold text-slate-400 hover:text-black dark:hover:text-white uppercase"
            >
              CLEAR
            </button>
          )}
        </div>
      </div>

      {/* Dropdowns and Action Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Category Dropdown */}
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="px-2.5 py-1.5 rounded border border-[#ded9cb] dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-mono outline-none cursor-pointer"
        >
          <option value="All">All Categories ({totalSkus})</option>
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

        {/* Rack Dropdown */}
        <select
          value={rack}
          onChange={(e) => onRackChange && onRackChange(e.target.value)}
          className="px-2.5 py-1.5 rounded border border-[#ded9cb] dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-mono outline-none cursor-pointer"
        >
          {rackOptions.map((r) => (
            <option key={r} value={r === 'All Racks & Bins' ? 'All' : r}>
              {r}
            </option>
          ))}
        </select>

        {/* Export CSV [F7] */}
        <button
          type="button"
          onClick={onExportCsv}
          className="px-2.5 py-1.5 rounded border border-[#ded9cb] dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold hover:bg-[#eee9dc] text-xs transition-colors shadow-xs"
        >
          Export CSV [F7]
        </button>

        {/* Add Product [Insert] */}
        <button
          type="button"
          onClick={onAddNew}
          className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1 active:scale-95"
        >
          <span>+ Add New Product [Insert]</span>
        </button>
      </div>
    </div>
  );
};

export default ProductSearch;
