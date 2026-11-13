import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      return localStorage.getItem('np_pos_sound') !== 'false';
    } catch {
      return true;
    }
  });

  const [language, setLanguage] = useState(() => {
    try {
      return localStorage.getItem('np_pos_lang') || 'en';
    } catch {
      return 'en';
    }
  });

  const toggleLanguage = () => {
    setLanguage(prev => {
      const next = prev === 'en' ? 'ta' : 'en';
      try {
        localStorage.setItem('np_pos_lang', next);
      } catch (e) {
        console.error('Failed to persist language', e);
      }
      return next;
    });
  };

  // Dark/Light Theme state with system / localStorage support
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('np_theme');
      if (saved) return saved;
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  // Sync document root class with theme
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('np_theme', theme);
    } catch (e) {
      console.error('Failed to persist theme', e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleSound = () => {
    setSoundEnabled(prev => {
      const next = !prev;
      try {
        localStorage.setItem('np_pos_sound', String(next));
      } catch (e) {
        console.error('Failed to persist sound preference', e);
      }
      return next;
    });
  };

  // Modern Web Audio API synthesizer for cashier feedback (no external assets required)
  const playChime = useCallback((type = 'beep') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'beep') {
        // High crisp beep for barcode scan / add item
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === 'success') {
        // Pleasant double cash register chord
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16); // G5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.36);
      } else if (type === 'remove') {
        // Subtle low thud
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.1);
      }
    } catch (e) {
      // Audio context might be restricted before interaction
    }
  }, [soundEnabled]);

  // Global keyboard shortcut: Ctrl+K / Cmd+K to open Command Palette
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('np_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(prev => {
      const nextVal = !prev;
      try {
        localStorage.setItem('np_sidebar_collapsed', String(nextVal));
      } catch (e) {
        console.error('Failed to save sidebar state', e);
      }
      return nextVal;
    });
  };

  const addToCart = (product) => {
    if (!product || product.stockQty <= 0) {
      toast.error(`"${product?.name || 'Item'}" is out of stock!`);
      return;
    }

    playChime('beep');
    setCart(prev => {
      const existing = prev.find(item => item.productId === product._id);
      if (existing) {
        if (existing.quantity >= product.stockQty) {
          toast.error(`Only ${product.stockQty} ${product.unit || 'units'} available in stock`);
          return prev;
        }
        toast.success(`Updated ${product.name} quantity`);
        return prev.map(item =>
          item.productId === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      toast.success(`Added ${product.name} to bill`);
      return [...prev, {
        productId: product._id,
        productName: product.name,
        tamilName: product.tamilName || '',
        sku: product.sku || '',
        rackLocation: product.rackLocation || '',
        unitPrice: Number(product.unitPrice) || 0,
        gstRate: Number(product.gstRate) || 18,
        quantity: 1,
        stockQty: Number(product.stockQty) || 0,
        unit: product.unit || 'piece'
      }];
    });
  };

  const updateCartQty = (productId, qty) => {
    const numQty = Number(qty);
    setCart(prev => {
      const item = prev.find(i => i.productId === productId);
      if (item && numQty > item.stockQty) {
        toast.error(`Only ${item.stockQty} ${item.unit || 'units'} in stock`);
        return prev.map(i => i.productId === productId ? { ...i, quantity: item.stockQty } : i);
      }
      return prev.map(item =>
        item.productId === productId ? { ...item, quantity: numQty } : item
      ).filter(item => item.quantity > 0);
    });
  };

  const removeFromCart = (productId) => {
    playChime('remove');
    setCart(prev => prev.filter(item => item.productId !== productId));
    toast.success('Removed item from bill');
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <AppContext.Provider value={{
      products, setProducts,
      categories, setCategories,
      cart, setCart,
      loading, setLoading,
      addToCart, updateCartQty, removeFromCart, clearCart,
      isSidebarOpen, toggleSidebar, closeSidebar,
      isSidebarCollapsed, toggleSidebarCollapse,
      language, setLanguage, toggleLanguage,
      theme, setTheme, toggleTheme,
      soundEnabled, toggleSound, playChime,
      isCommandPaletteOpen, setIsCommandPaletteOpen
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
