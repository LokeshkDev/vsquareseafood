import { api, API_BASE_URL } from './api.js';

export const adminService = {
  // Dashboard & Metrics
  getDashboard: async () => {
    const res = await api.get('/admin/dashboard');
    return res.data;
  },

  // Products CRUD
  getProducts: async (params = {}) => {
    return api.get('/products', { includeAllStatus: 'true', ...params });
  },

  createProduct: async (productData) => {
    const res = await api.post('/products', productData);
    return res.data;
  },

  updateProduct: async (id, productData) => {
    const res = await api.put(`/products/${id}`, productData);
    return res.data;
  },

  deleteProduct: async (id) => {
    const res = await api.delete(`/products/${id}`);
    return res.data;
  },

  bulkUpdateProductStatus: async (ids, status) => {
    const res = await api.post('/products/bulk-status', { ids, status });
    return res.data;
  },

  bulkDeleteProducts: async (ids) => {
    const res = await api.post('/products/bulk-delete', { ids });
    return res.data;
  },

  // Categories CRUD
  getCategories: async (includeAll = true) => {
    const res = await api.get('/categories', { all: includeAll ? 'true' : 'false' });
    return res.data;
  },

  createCategory: async (categoryData) => {
    const res = await api.post('/categories', categoryData);
    return res.data;
  },

  updateCategory: async (id, categoryData) => {
    const res = await api.put(`/categories/${id}`, categoryData);
    return res.data;
  },

  deleteCategory: async (id) => {
    const res = await api.delete(`/categories/${id}`);
    return res.data;
  },

  bulkUpdateCategoryStatus: async (ids, isActive) => {
    const res = await api.post('/categories/bulk-status', { ids, isActive });
    return res.data;
  },

  bulkDeleteCategories: async (ids) => {
    const res = await api.post('/categories/bulk-delete', { ids });
    return res.data;
  },

  // Inventory Management
  getInventory: async (params = {}) => {
    return api.get('/admin/inventory', params);
  },

  adjustInventory: async (variantId, quantity, notes = '') => {
    const res = await api.patch(`/admin/inventory/${variantId}`, { quantity, notes });
    return res.data;
  },

  // Orders Management
  getOrders: async (params = {}) => {
    return api.get('/orders', params);
  },

  updateOrderStatus: async (id, status) => {
    const res = await api.patch(`/orders/${id}/status`, { status });
    return res.data;
  },

  // CMS Banners
  getAllBanners: async () => {
    const res = await api.get('/banners/all');
    return res.data;
  },

  createBanner: async (bannerData) => {
    const res = await api.post('/banners', bannerData);
    return res.data;
  },

  updateBanner: async (id, bannerData) => {
    const res = await api.put(`/banners/${id}`, bannerData);
    return res.data;
  },

  deleteBanner: async (id) => {
    const res = await api.delete(`/banners/${id}`);
    return res.data;
  },

  // Customers Management
  getCustomers: async (params = {}) => {
    return api.get('/admin/customers', params);
  },

  updateCustomerStatus: async (id, isActive) => {
    const res = await api.patch(`/admin/customers/${id}/status`, { isActive });
    return res.data;
  },

  // Audit Logs
  getAuditLogs: async (params = {}) => {
    return api.get('/admin/audit-logs', params);
  },

  // Image Upload (Products, Categories, CMS Banners)
  uploadImage: async (file, folder = 'catalog') => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);
    const res = await api.upload('/media/upload', formData);
    return res.data; // { url, r2Key, storage, filename, size, mimetype }
  },

  // Upload multiple images simultaneously
  uploadMultipleImages: async (files, folder = 'catalog') => {
    const formData = new FormData();
    for (const f of files) {
      formData.append('images', f);
    }
    formData.append('folder', folder);
    try {
      const res = await api.upload('/media/upload-multiple', formData);
      return res.data; // array of { url, r2Key, storage, ... }
    } catch (err) {
      // Fallback: Upload sequentially if multi-route had an issue (or if backend multi-limit reached)
      const results = [];
      for (const f of files) {
        const singleRes = await adminService.uploadImage(f, folder);
        if (singleRes) results.push(singleRes);
      }
      return results;
    }
  },

  // Delete uploaded media file from R2 or local disk
  deleteImage: async (url, r2Key) => {
    try {
      const res = await api.post('/media/delete-file', { url, r2Key });
      return res.data;
    } catch (err) {
      console.warn('Media deletion warning:', err.message);
      return null;
    }
  },

  // Check Cloudflare R2 Connection Status
  getR2Status: async (refresh = false) => {
    const res = await api.get('/media/r2-status', { refresh: refresh ? 'true' : 'false' });
    return res.data;
  },

  // One-Click Catalog Sync
  syncCatalog: async (items, categories) => {
    const res = await api.post('/admin/sync-catalog', { items, categories });
    return res.data;
  },
};
