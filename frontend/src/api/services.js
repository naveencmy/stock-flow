import api from './axiosConfig';
import { mockApi } from './mockService';

export const productService = {
  async getAll(params) {
    try {
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
    } catch (err) {
      console.warn('Backend API unavailable, using mock fallback:', err.message);
      return await mockApi.getProducts(params);
    }
  },

  async getLowStock() {
    try {
      const res = await api.get('/products/low-stock');
      return res.data?.data !== undefined ? res.data.data : res.data;
    } catch (err) {
      console.warn('Backend API unavailable, using mock fallback:', err.message);
      return await mockApi.getLowStockProducts();
    }
  },

  async getCategories() {
    try {
      const res = await api.get('/categories');
      return res.data?.data !== undefined ? res.data.data : res.data;
    } catch (err) {
      console.warn('Backend API unavailable, using mock fallback:', err.message);
      return await mockApi.getCategories();
    }
  },

  async create(data) {
    try {
      const res = await api.post('/products', data);
      return res.data?.data !== undefined ? res.data.data : res.data;
    } catch (err) {
      console.warn('Backend API unavailable, using mock fallback:', err.message);
      return await mockApi.createProduct(data);
    }
  },

  async update(id, data) {
    try {
      const res = await api.put(`/products/${id}`, data);
      return res.data?.data !== undefined ? res.data.data : res.data;
    } catch (err) {
      console.warn('Backend API unavailable, using mock fallback:', err.message);
      return await mockApi.updateProduct(id, data);
    }
  },

  async delete(id) {
    try {
      const res = await api.delete(`/products/${id}`);
      return res.data?.data !== undefined ? res.data.data : res.data;
    } catch (err) {
      console.warn('Backend API unavailable, using mock fallback:', err.message);
      return await mockApi.deleteProduct(id);
    }
  }
};

export const salesService = {
  async getAll(params) {
    try {
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
    } catch (err) {
      console.warn('Backend API unavailable, using mock fallback:', err.message);
      return await mockApi.getSales(params);
    }
  },

  async getById(id) {
    try {
      const res = await api.get(`/sales/${id}`);
      return res.data?.data !== undefined ? res.data.data : res.data;
    } catch (err) {
      console.warn('Backend API unavailable, using mock fallback:', err.message);
      return await mockApi.getSaleById(id);
    }
  },

  async create(data) {
    try {
      const res = await api.post('/sales', data);
      return res.data?.data !== undefined ? res.data.data : res.data;
    } catch (err) {
      console.warn('Backend API unavailable, using mock fallback:', err.message);
      return await mockApi.createSale(data);
    }
  }
};

export const dashboardService = {
  async getSummary() {
    try {
      const res = await api.get('/dashboard/summary');
      const payload = res.data?.data !== undefined ? res.data.data : res.data;
      return payload;
    } catch (err) {
      console.warn('Backend API unavailable, using mock fallback:', err.message);
      return await mockApi.getDashboardSummary();
    }
  },

  async getRevenueChart() {
    try {
      const res = await api.get('/dashboard/revenue-chart');
      return res.data?.data !== undefined ? res.data.data : res.data;
    } catch (err) {
      console.warn('Backend API unavailable, using mock fallback:', err.message);
      return await mockApi.getRevenueChart();
    }
  }
};

export const stockLogService = {
  async getAll(params) {
    try {
      const res = await api.get('/stock-logs', { params });
      const payload = res.data;
      if (payload && payload.data && payload.pagination) {
        // Map backend stock log field names to frontend component expected field names if needed
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
    } catch (err) {
      console.warn('Backend API unavailable, using mock fallback:', err.message);
      return await mockApi.getStockLogs(params);
    }
  }
};
