import api from './axiosConfig';
import { mockApi } from './mockService';

export const productService = {
  async getAll(params) {
    try {
      const res = await api.get('/products', { params });
      return res.data;
    } catch {
      return await mockApi.getProducts(params);
    }
  },

  async getLowStock() {
    try {
      const res = await api.get('/products/low-stock');
      return res.data;
    } catch {
      return await mockApi.getLowStockProducts();
    }
  },

  async getCategories() {
    try {
      const res = await api.get('/categories');
      return res.data;
    } catch {
      return await mockApi.getCategories();
    }
  },

  async create(data) {
    try {
      const res = await api.post('/products', data);
      return res.data;
    } catch {
      return await mockApi.createProduct(data);
    }
  },

  async update(id, data) {
    try {
      const res = await api.put(`/products/${id}`, data);
      return res.data;
    } catch {
      return await mockApi.updateProduct(id, data);
    }
  },

  async delete(id) {
    try {
      const res = await api.delete(`/products/${id}`);
      return res.data;
    } catch {
      return await mockApi.deleteProduct(id);
    }
  }
};

export const salesService = {
  async getAll(params) {
    try {
      const res = await api.get('/sales', { params });
      return res.data;
    } catch {
      return await mockApi.getSales(params);
    }
  },

  async getById(id) {
    try {
      const res = await api.get(`/sales/${id}`);
      return res.data;
    } catch {
      return await mockApi.getSaleById(id);
    }
  },

  async create(data) {
    try {
      const res = await api.post('/sales', data);
      return res.data;
    } catch {
      return await mockApi.createSale(data);
    }
  }
};

export const dashboardService = {
  async getSummary() {
    try {
      const res = await api.get('/dashboard/summary');
      return res.data;
    } catch {
      return await mockApi.getDashboardSummary();
    }
  },

  async getRevenueChart() {
    try {
      const res = await api.get('/dashboard/revenue-chart');
      return res.data;
    } catch {
      return await mockApi.getRevenueChart();
    }
  }
};

export const stockLogService = {
  async getAll(params) {
    try {
      const res = await api.get('/stock-logs', { params });
      return res.data;
    } catch {
      return await mockApi.getStockLogs(params);
    }
  }
};
