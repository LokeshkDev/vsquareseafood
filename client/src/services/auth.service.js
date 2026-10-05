import { api } from './api.js';

export const authService = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },

  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },

  logout: async () => {
    const res = await api.post('/auth/logout');
    return res.data;
  },

  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },

  updateProfile: async (profileData) => {
    const res = await api.put('/auth/profile', profileData);
    return res.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const res = await api.put('/auth/change-password', { currentPassword, newPassword });
    return res.data;
  },
};

