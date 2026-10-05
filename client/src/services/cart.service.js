import { api } from './api.js';

export const cartService = {
  getCart: async () => {
    const res = await api.get('/cart');
    return res.data;
  },

  addItem: async (variantId, quantity = 1) => {
    const res = await api.post('/cart/items', { variantId, quantity });
    return res.data;
  },

  updateItem: async (itemId, quantity) => {
    const res = await api.patch(`/cart/items/${itemId}`, { quantity });
    return res.data;
  },

  removeItem: async (itemId) => {
    const res = await api.delete(`/cart/items/${itemId}`);
    return res.data;
  },

  clearCart: async () => {
    const res = await api.delete('/cart');
    return res.data;
  },
};

