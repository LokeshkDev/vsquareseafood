import { api } from './api.js';

export const productService = {
  getProducts: async (params = {}) => {
    return api.get('/products', params);
  },

  getProductBySlug: async (slug) => {
    const res = await api.get(`/products/${slug}`);
    return res.data;
  },

  getFeatured: async () => {
    const res = await api.get('/products/featured');
    return res.data;
  },

  getPopular: async () => {
    const res = await api.get('/products/popular');
    return res.data;
  },
};

