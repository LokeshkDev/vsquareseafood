import { api } from './api.js';

export const orderService = {
  createOrder: async (orderData) => {
    const res = await api.post('/orders', orderData);
    return res.data;
  },

  getMyOrders: async (params = {}) => {
    return api.get('/orders/my-orders', params);
  },

  getOrderById: async (id) => {
    const res = await api.get(`/orders/${id}`);
    return res.data;
  },

  cancelOrder: async (id) => {
    const res = await api.post(`/orders/${id}/cancel`);
    return res.data;
  },
};

