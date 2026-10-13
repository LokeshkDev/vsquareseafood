import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth.service.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const userData = await authService.getMe();
      if (userData?.token) {
        localStorage.setItem('v2_token', userData.token);
        localStorage.setItem('token', userData.token);
      }
      setUser(userData);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    const token = data?.token || data?.data?.token;
    if (token) {
      localStorage.setItem('v2_token', token);
      localStorage.setItem('token', token);
    }
    setUser(data?.user || data?.data?.user || data);
    return data;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    const token = data?.token || data?.data?.token;
    if (token) {
      localStorage.setItem('v2_token', token);
      localStorage.setItem('token', token);
    }
    setUser(data?.user || data?.data?.user || data);
    return data;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      localStorage.removeItem('v2_token');
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        login,
        register,
        logout,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

