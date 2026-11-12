import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  LayoutDashboard,
  Package,
  Receipt,
  ClipboardList,
  BarChart3,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Plus,
  ArrowRight,
  Sparkles,
  Command,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { productService } from '../../api/services';
import { formatCurrency } from '../../utils/formatCurrency';

export const CommandPalette = () => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    theme,
    toggleTheme,
    soundEnabled,
    toggleSound,
    addToCart
  } = useApp();

  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [productResults, setProductResults] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Focus input on open
  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen]);

  // Static navigation actions
  const staticActions = [
    {
      id: 'nav-dash',
      title: 'Go to Dashboard Overview',
      category: 'Navigation',
      icon: LayoutDashboard,
      run: () => navigate('/')
    },
    {
      id: 'nav-bill',
      title: 'Open POS Billing Counter',
      category: 'Navigation',
      icon: Receipt,
      run: () => navigate('/billing')
    },
    {
      id: 'nav-prod',
      title: 'Manage Products Inventory',
      category: 'Navigation',
      icon: Package,
      run: () => navigate('/products')
    },
    {
      id: 'nav-sales',
      title: 'View Sales History',
      category: 'Navigation',
      icon: ClipboardList,
      run: () => navigate('/sales')
    },
    {
      id: 'nav-logs',
      title: 'Audit Stock Movement Logs',
      category: 'Navigation',
      icon: BarChart3,
      run: () => navigate('/stock-logs')
    },
    {
      id: 'theme-toggle',
      title: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
      category: 'Preferences',
      icon: theme === 'dark' ? Sun : Moon,
      run: () => toggleTheme()
    },
    {
      id: 'sound-toggle',
      title: `${soundEnabled ? 'Mute' : 'Enable'} POS Audio Chimes`,
      category: 'Preferences',
      icon: soundEnabled ? VolumeX : Volume2,
      run: () => toggleSound()
    }
  ];

  // Search products debounced
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setProductResults([]);
      return;
    }
    let active = true;
    setLoadingProducts(true);
    const timer = setTimeout(async () => {
      try {
        const res = await productService.getAll({ search: query.trim(), limit: 5 });
        if (active) {
          setProductResults(res.products || []);
        }
      } catch {
        // quiet error
      } finally {
        if (active) setLoadingProducts(false);
      }
    }, 200);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query]);

  // Filter actions
  const filteredActions = staticActions.filter(a =>
    a.title.toLowerCase().includes(query.toLowerCase()) ||
    a.category.toLowerCase().includes(query.toLowerCase())
  );

  // Total items list for keyboard navigation
  const allItems = [
    ...filteredActions.map(a => ({ type: 'action', data: a })),
    ...productResults.map(p => ({ type: 'product', data: p }))
  ];

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsCommandPaletteOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < allItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : allItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = allItems[selectedIndex];
      if (current) {
        if (current.type === 'action') {
          current.data.run();
          setIsCommandPaletteOpen(false);
        } else if (current.type === 'product') {
          addToCart(current.data);
          setIsCommandPaletteOpen(false);
          navigate('/billing');
        }
      }
    }
  };

  if (!isCommandPaletteOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={() => setIsCommandPaletteOpen(false)}
    >
      <div
        className="w-full max-w-xl rounded-2xl bg-white dark:bg-[#0f172a] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-800 dark:text-slate-100 flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 gap-3 bg-slate-50/50 dark:bg-[#151f32]/50">
          <Search className="w-5 h-5 text-blue-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, page name, or search product..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-semibold text-slate-500 bg-slate-200/60 dark:bg-slate-800">
            Esc
          </kbd>
          <button
            type="button"
            onClick={() => setIsCommandPaletteOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 space-y-1 divide-y divide-slate-100 dark:divide-slate-800/60">
          {/* Quick Actions */}
          {filteredActions.length > 0 && (
            <div className="p-1">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Navigation & Controls
              </div>
              {filteredActions.map((action, idx) => {
                const isSelected = selectedIndex === idx;
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => {
                      action.run();
                      setIsCommandPaletteOpen(false);
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-sm font-medium transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-white/20 text-white' : 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span>{action.title}</span>
                    </div>
                    <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400 opacity-50'}`} />
                  </button>
                );
              })}
            </div>
          )}

          {/* Product Search Results */}
          {productResults.length > 0 && (
            <div className="p-1 pt-2">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center justify-between">
                <span>Direct Product Quick-Bill (Press Enter to add to cart)</span>
                {loadingProducts && <span className="animate-spin text-xs">⏳</span>}
              </div>
              {productResults.map((product, pIdx) => {
                const itemIndex = filteredActions.length + pIdx;
                const isSelected = selectedIndex === itemIndex;
                return (
                  <button
                    key={product._id}
                    type="button"
                    onClick={() => {
                      addToCart(product);
                      setIsCommandPaletteOpen(false);
                      navigate('/billing');
                    }}
                    onMouseEnter={() => setSelectedIndex(itemIndex)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-sm font-medium transition-colors ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-white/20 text-white' : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'}`}>
                        <Package className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className="font-semibold truncate">{product.name}</div>
                        <div className={`text-[11px] ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                          Stock: {product.stockQty} {product.unit} • {product.category}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pl-2 shrink-0">
                      <span className={`font-mono font-bold text-xs ${isSelected ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {formatCurrency(product.unitPrice)}
                      </span>
                      <Plus className="w-3.5 h-3.5" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {allItems.length === 0 && (
            <div className="py-8 text-center text-slate-400 text-sm">
              No actions or products matching "{query}"
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#151f32]/40 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>Esc Close</span>
          </div>
          <div className="flex items-center gap-1.5 text-blue-500 font-sans font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Command Engine</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
