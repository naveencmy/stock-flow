import { initialProducts, initialCategories, initialSales, initialStockLogs, generate30DayRevenue } from './mockData';

const STORAGE_KEYS = {
  PRODUCTS: 'np_products',
  CATEGORIES: 'np_categories',
  SALES: 'np_sales',
  STOCK_LOGS: 'np_stock_logs',
  REVENUE: 'np_revenue'
};

// Initialize localStorage if empty
const initStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(initialProducts));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(initialCategories));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SALES)) {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(initialSales));
  }
  if (!localStorage.getItem(STORAGE_KEYS.STOCK_LOGS)) {
    localStorage.setItem(STORAGE_KEYS.STOCK_LOGS, JSON.stringify(initialStockLogs));
  }
  if (!localStorage.getItem(STORAGE_KEYS.REVENUE)) {
    localStorage.setItem(STORAGE_KEYS.REVENUE, JSON.stringify(generate30DayRevenue()));
  }
};

// Helpers
const getStorageItem = (key, fallback = []) => {
  try {
    initStorage();
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (err) {
    console.error('Storage access error', err);
    return fallback;
  }
};

const setStorageItem = (key, val) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.error('Storage write error', err);
  }
};

// Mock Backend API Handler
export const mockApi = {
  // PRODUCTS
  async getProducts({ search = '', category = '', page = 1, limit = 10 } = {}) {
    const products = getStorageItem(STORAGE_KEYS.PRODUCTS);
    let filtered = products.filter(p => !p.isDeleted);

    if (category && category !== 'All') {
      filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    if (search && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(q) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.barcode && p.barcode.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q))
      );
    }

    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    return {
      products: paginated,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit) || 1
    };
  },

  async getLowStockProducts() {
    const products = getStorageItem(STORAGE_KEYS.PRODUCTS);
    return products.filter(p => !p.isDeleted && Number(p.stockQty) <= Number(p.reorderLevel));
  },

  async getCategories() {
    return getStorageItem(STORAGE_KEYS.CATEGORIES);
  },

  async createProduct(productData) {
    const products = getStorageItem(STORAGE_KEYS.PRODUCTS);
    const newProduct = {
      _id: 'prod-' + Date.now().toString().slice(-6),
      name: productData.name.trim(),
      category: productData.category,
      brand: productData.brand?.trim() || '',
      unit: productData.unit || 'piece',
      unitPrice: Number(productData.unitPrice) || 0,
      stockQty: Number(productData.stockQty) || 0,
      reorderLevel: Number(productData.reorderLevel) || 0,
      gstRate: Number(productData.gstRate) || 18,
      barcode: productData.barcode?.trim() || '',
      createdAt: new Date().toISOString()
    };

    products.unshift(newProduct);
    setStorageItem(STORAGE_KEYS.PRODUCTS, products);

    // Add initial stock log
    if (newProduct.stockQty > 0) {
      const logs = getStorageItem(STORAGE_KEYS.STOCK_LOGS);
      logs.unshift({
        _id: 'log-' + Date.now().toString().slice(-6),
        productId: newProduct._id,
        productName: newProduct.name,
        changeType: 'purchase',
        changeQty: newProduct.stockQty,
        balanceQty: newProduct.stockQty,
        reference: 'INIT-ENTRY',
        notes: 'Initial inventory creation',
        createdAt: new Date().toISOString()
      });
      setStorageItem(STORAGE_KEYS.STOCK_LOGS, logs);
    }

    return newProduct;
  },

  async updateProduct(id, productData) {
    const products = getStorageItem(STORAGE_KEYS.PRODUCTS);
    const index = products.findIndex(p => p._id === id);
    if (index === -1) throw new Error('Product not found');

    const oldProduct = products[index];
    const stockDiff = Number(productData.stockQty) - Number(oldProduct.stockQty);

    const updated = {
      ...oldProduct,
      name: productData.name?.trim() ?? oldProduct.name,
      category: productData.category ?? oldProduct.category,
      brand: productData.brand?.trim() ?? oldProduct.brand,
      unit: productData.unit ?? oldProduct.unit,
      unitPrice: productData.unitPrice !== undefined ? Number(productData.unitPrice) : oldProduct.unitPrice,
      stockQty: productData.stockQty !== undefined ? Number(productData.stockQty) : oldProduct.stockQty,
      reorderLevel: productData.reorderLevel !== undefined ? Number(productData.reorderLevel) : oldProduct.reorderLevel,
      gstRate: productData.gstRate !== undefined ? Number(productData.gstRate) : oldProduct.gstRate,
      barcode: productData.barcode?.trim() ?? oldProduct.barcode,
      updatedAt: new Date().toISOString()
    };

    products[index] = updated;
    setStorageItem(STORAGE_KEYS.PRODUCTS, products);

    // If stock qty changed directly via edit, record audit adjustment
    if (stockDiff !== 0) {
      const logs = getStorageItem(STORAGE_KEYS.STOCK_LOGS);
      logs.unshift({
        _id: 'log-' + Date.now().toString().slice(-6),
        productId: updated._id,
        productName: updated.name,
        changeType: stockDiff > 0 ? 'purchase' : 'adjustment',
        changeQty: stockDiff,
        balanceQty: updated.stockQty,
        reference: 'MANUAL-ADJ',
        notes: `Inventory quantity manually updated (${oldProduct.stockQty} → ${updated.stockQty})`,
        createdAt: new Date().toISOString()
      });
      setStorageItem(STORAGE_KEYS.STOCK_LOGS, logs);
    }

    return updated;
  },

  async deleteProduct(id) {
    const products = getStorageItem(STORAGE_KEYS.PRODUCTS);
    const index = products.findIndex(p => p._id === id);
    if (index === -1) throw new Error('Product not found');

    products[index].isDeleted = true;
    setStorageItem(STORAGE_KEYS.PRODUCTS, products);
    return { success: true, message: 'Product deleted successfully' };
  },

  // SALES & BILLING
  async getSales({ from = '', to = '', search = '', page = 1, limit = 15 } = {}) {
    const sales = getStorageItem(STORAGE_KEYS.SALES);
    let filtered = [...sales];

    if (search && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(s => 
        s.billNumber.toLowerCase().includes(q) ||
        s.customerName.toLowerCase().includes(q) ||
        (s.customerPhone && s.customerPhone.includes(q))
      );
    }

    if (from) {
      const fromDate = new Date(from);
      fromDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(s => new Date(s.createdAt) >= fromDate);
    }

    if (to) {
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(s => new Date(s.createdAt) <= toDate);
    }

    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    return {
      sales: paginated,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit) || 1
    };
  },

  async getSaleById(id) {
    const sales = getStorageItem(STORAGE_KEYS.SALES);
    const sale = sales.find(s => s._id === id || s.billNumber === id);
    if (!sale) throw new Error('Invoice not found');
    return sale;
  },

  async createSale(saleData) {
    const sales = getStorageItem(STORAGE_KEYS.SALES);
    const products = getStorageItem(STORAGE_KEYS.PRODUCTS);
    const logs = getStorageItem(STORAGE_KEYS.STOCK_LOGS);

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const seq = String(sales.length + 1).padStart(3, '0');
    const billNumber = `NP-${dateStr}-${seq}`;

    // Validate and deduct stock
    for (const item of saleData.items) {
      const product = products.find(p => p._id === item.productId);
      if (product) {
        if (product.stockQty < item.quantity) {
          throw new Error(`Insufficient stock for "${product.name}". Available: ${product.stockQty}, Requested: ${item.quantity}`);
        }
        product.stockQty -= item.quantity;

        // Log deduction
        logs.unshift({
          _id: 'log-' + Math.random().toString(36).substr(2, 9),
          productId: product._id,
          productName: product.name,
          changeType: 'sale',
          changeQty: -item.quantity,
          balanceQty: product.stockQty,
          reference: billNumber,
          notes: `Billed to ${saleData.customerName || 'Walk-in Customer'}`,
          createdAt: now.toISOString()
        });
      }
    }

    const newSale = {
      _id: 'sale-' + Date.now().toString(),
      billNumber,
      createdAt: now.toISOString(),
      customerName: saleData.customerName || 'Walk-in Customer',
      customerPhone: saleData.customerPhone || '',
      paymentMethod: saleData.paymentMethod || 'Cash',
      items: saleData.items,
      subtotal: Number(saleData.subtotal) || 0,
      cgst: Number(saleData.cgst) || 0,
      sgst: Number(saleData.sgst) || 0,
      igst: Number(saleData.igst) || 0,
      totalGst: Number(saleData.totalGst) || 0,
      discount: Number(saleData.discount) || 0,
      grandTotal: Number(saleData.grandTotal) || 0
    };

    sales.unshift(newSale);

    // Save updated states
    setStorageItem(STORAGE_KEYS.SALES, sales);
    setStorageItem(STORAGE_KEYS.PRODUCTS, products);
    setStorageItem(STORAGE_KEYS.STOCK_LOGS, logs);

    return newSale;
  },

  // STOCK LOGS
  async getStockLogs({ product = '', changeType = '', page = 1, limit = 15 } = {}) {
    const logs = getStorageItem(STORAGE_KEYS.STOCK_LOGS);
    let filtered = [...logs];

    if (product && product !== 'All') {
      filtered = filtered.filter(l => l.productId === product || l.productName === product);
    }

    if (changeType && changeType !== 'All') {
      filtered = filtered.filter(l => l.changeType.toLowerCase() === changeType.toLowerCase());
    }

    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    return {
      logs: paginated,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit) || 1
    };
  },

  // DASHBOARD
  async getDashboardSummary() {
    const products = getStorageItem(STORAGE_KEYS.PRODUCTS).filter(p => !p.isDeleted);
    const lowStock = products.filter(p => Number(p.stockQty) <= Number(p.reorderLevel));
    const sales = getStorageItem(STORAGE_KEYS.SALES);

    const todayStr = new Date().toISOString().slice(0, 10);
    const thisMonthStr = new Date().toISOString().slice(0, 7);

    const todaySales = sales.filter(s => s.createdAt.slice(0, 10) === todayStr);
    const monthSales = sales.filter(s => s.createdAt.slice(0, 7) === thisMonthStr);

    const todayRevenue = todaySales.reduce((sum, s) => sum + (Number(s.grandTotal) || 0), 0);
    const monthRevenue = monthSales.reduce((sum, s) => sum + (Number(s.grandTotal) || 0), 0);

    return {
      totalProducts: products.length,
      lowStockCount: lowStock.length,
      todayRevenue,
      todayBillsCount: todaySales.length,
      monthlyRevenue: monthRevenue || 124500, // fallback baseline
      monthlyBillsCount: monthSales.length || 68
    };
  },

  async getRevenueChart() {
    return getStorageItem(STORAGE_KEYS.REVENUE, generate30DayRevenue());
  }
};
