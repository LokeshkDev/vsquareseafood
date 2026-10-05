import * as orderService from '../services/order.service.js';
import { successResponse, createdResponse, paginatedResponse } from '../utils/response.js';

export const createOrder = async (req, res, next) => {
  try {
    const { addressId, customAddress, couponCode, notes } = req.body;
    const order = await orderService.createOrder({
      userId: req.user.id,
      addressId,
      customAddress,
      couponCode,
      notes,
    });
    return createdResponse(res, order);
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { orders, pagination } = await orderService.getUserOrders(req.user.id, { page, limit });
    return paginatedResponse(res, orders, pagination);
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN';
    const order = await orderService.getOrderById(req.params.id, req.user.id, isAdmin);
    return successResponse(res, order);
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const order = await orderService.cancelCustomerOrder(req.params.id, req.user.id);
    return successResponse(res, { message: 'Order cancelled successfully', order });
  } catch (error) {
    next(error);
  }
};

export const getAllOrdersAdmin = async (req, res, next) => {
  try {
    const { status, search, page, limit } = req.query;
    const { orders, pagination } = await orderService.getAllOrders({
      status,
      search,
      page: Number(page) || 1,
      limit: Number(limit) || 20,
    });
    return paginatedResponse(res, orders, pagination);
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatusAdmin = async (req, res, next) => {
  try {
    const { status } = req.body;
    const updated = await orderService.updateOrderStatus(req.params.id, status, req.user.id);
    return successResponse(res, updated);
  } catch (error) {
    next(error);
  }
};
