/**
 * ============================================================================
 * OUTCOME-BASED LEARNING (OBL) ENGINEERING HIT: API SERVICE LAYER
 * ============================================================================
 * WHAT IS IT?
 *   - The client-side API abstraction service module using Axios.
 * 
 * WHAT IT CAN DO?
 *   - Communicates dynamically with Express REST API endpoints (/api/products,
 *     /api/sales, /api/categories, /api/dashboard, /api/stock-logs).
 *   - Normalizes backend envelope payloads ({ success, data, pagination })
 *     into frontend consuming interfaces for seamless state updates.
 *   - Completely dynamic — 0 static mock dependencies.
 * 
 * WHY WE USE IT?
 *   - Decouples UI components from HTTP transport specifics.
 *   - Ensures clean Separation of Concerns (SoC) and Centralized API maintenance.
 * ============================================================================
 */
import api from './axiosConfig';

export const productService = {
  /**
   * Fetch paginated & filtered products
   * @param {Object} params - { search, category, lowStock, page, limit }
   */
  async getAll(params) {
    const res = await api.get('/products', { params });
    const payload = res.data;
    if (payload && payload.data && payload.pagination) {
      return {
        products: payload.data,
        total: payload.pagination.total,
        totalPages: payload.pagination.pages || 1,
        page: payload.pagination.page || 1
      };
    }
    return payload;
  },

  /**
   * Fetch products where stockQty <= reorderLevel
   */
  async getLowStock() {
    const res = await api.get('/products/low-stock');
    return res.data?.data !== undefined ? res.data.data : res.data;
  },

  /**
   * Fetch all product categories
   */
  async getCategories() {
    const res = await api.get('/categories');
    return res.data?.data !== undefined ? res.data.data : res.data;
  },

  /**
   * Create a new product entry
   * @param {Object} data - Product schema payload
   */
  async create(data) {
    const res = await api.post('/products', data);
    return res.data?.data !== undefined ? res.data.data : res.data;
  },

  /**
   * Update an existing product by ID
   * @param {string} id - Product ObjectId
   * @param {Object} data - Delta update payload
   */
  async update(id, data) {
    const res = await api.put(`/products/${id}`, data);
    return res.data?.data !== undefined ? res.data.data : res.data;
  },

  /**
   * Fetch distinct rack locations
   */
  async getRacks() {
    const res = await api.get('/products/racks');
    return res.data?.data !== undefined ? res.data.data : res.data;
  },

  /**
   * Fetch live inventory statistics (valuation, counts, occupancy)
   */
  async getStats() {
    const res = await api.get('/products/stats');
    return res.data?.data !== undefined ? res.data.data : res.data;
  },

  /**
   * Soft-delete product by ID (sets isActive: false)
   * @param {string} id - Product ObjectId
   */
  async delete(id) {
    const res = await api.delete(`/products/${id}`);
    return res.data?.data !== undefined ? res.data.data : res.data;
  }
};

export const salesService = {
  /**
   * Fetch sales history with date range and pagination
   * @param {Object} params - { from, to, search, page, limit }
   */
  async getAll(params) {
    const res = await api.get('/sales', { params });
    const payload = res.data;
    if (payload && payload.data && payload.pagination) {
      return {
        sales: payload.data,
        total: payload.pagination.total,
        totalPages: payload.pagination.pages || 1,
        page: payload.pagination.page || 1
      };
    }
    return payload;
  },

  /**
   * Get single invoice / sale details with populated items
   * @param {string} id - Sale ObjectId
   */
  async getById(id) {
    const res = await api.get(`/sales/${id}`);
    return res.data?.data !== undefined ? res.data.data : res.data;
  },

  /**
   * Record new atomic sale with inventory deduction and billing
   * @param {Object} data - { customerName, customerPhone, items, discountAmt, paymentMethod }
   */
  async create(data) {
    const res = await api.post('/sales', data);
    return res.data?.data !== undefined ? res.data.data : res.data;
  },

  /**
   * Trigger server-side WhatsApp dispatch for a sale
   * @param {string} id - Sale ObjectId
   */
  async sendWhatsApp(id) {
    const res = await api.post(`/sales/${id}/whatsapp`);
    return res.data?.data !== undefined ? res.data.data : res.data;
  }
};

export const dashboardService = {
  /**
   * Fetch aggregated summary KPIs for top analytics cards
   */
  async getSummary() {
    const res = await api.get('/dashboard/summary');
    return res.data?.data !== undefined ? res.data.data : res.data;
  },

  /**
   * Fetch 30-day daily revenue array for recharts visualization
   */
  async getRevenueChart() {
    const res = await api.get('/dashboard/revenue-chart');
    return res.data?.data !== undefined ? res.data.data : res.data;
  }
};

export const stockLogService = {
  /**
   * Fetch inventory audit trail logs with product & type filters
   * @param {Object} params - { product, changeType, page, limit }
   */
  async getAll(params) {
    const res = await api.get('/stock-logs', { params });
    const payload = res.data;
    if (payload && payload.data && payload.pagination) {
      const mappedLogs = payload.data.map((log) => ({
        _id: log._id,
        product: log.product,
        productId: typeof log.product === 'object' ? log.product?._id : log.product,
        productName: log.productName || log.product?.name,
        changeType: log.changeType,
        changeQty: log.qtyChange ?? log.changeQty,
        balanceQty: log.newStock ?? log.balanceQty,
        reference: log.referenceId ?? log.reference,
        notes: log.note ?? log.notes,
        createdAt: log.createdAt
      }));

      return {
        logs: mappedLogs,
        total: payload.pagination.total,
        totalPages: payload.pagination.pages || 1,
        page: payload.pagination.page || 1
      };
    }
    return payload;
  },

  /**
   * Perform manual inventory adjustment
   * @param {Object} data - { productId, qtyChange, note }
   */
  async adjust(data) {
    const res = await api.post('/stock-logs/adjust', data);
    return res.data?.data !== undefined ? res.data.data : res.data;
  }
};

export const categoryService = {
  /**
   * Fetch all categories
   */
  async getAll() {
    const res = await api.get('/categories');
    return res.data?.data !== undefined ? res.data.data : res.data;
  },

  /**
   * Create a new category
   * @param {Object} data - { name, description }
   */
  async create(data) {
    const res = await api.post('/categories', data);
    return res.data?.data !== undefined ? res.data.data : res.data;
  },

  /**
   * Update category
   */
  async update(id, data) {
    const res = await api.put(`/categories/${id}`, data);
    return res.data?.data !== undefined ? res.data.data : res.data;
  },

  /**
   * Delete category
   */
  async delete(id) {
    const res = await api.delete(`/categories/${id}`);
    return res.data?.data !== undefined ? res.data.data : res.data;
  }
};

export const whatsappService = {
  /**
   * Get WhatsApp integration & Open-WA server connectivity status
   */
  async getStatus() {
    const res = await api.get('/whatsapp/status');
    return res.data?.data !== undefined ? res.data.data : res.data;
  },

  /**
   * Send test message via Open-WA
   * @param {Object} data - { phone, message }
   */
  async sendTest(data) {
    const res = await api.post('/whatsapp/test', data);
    return res.data;
  },

  /**
   * Dispatch bill via Open-WA
   * @param {string} saleId - Sale ObjectId
   */
  async sendBill(saleId) {
    const res = await api.post(`/whatsapp/send-bill/${saleId}`);
    return res.data;
  }
};
