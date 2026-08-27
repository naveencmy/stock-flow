import { createContext, useContext, useState } from 'react';
import toast from 'react-hot-toast';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
      isSidebarCollapsed, toggleSidebarCollapse
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
