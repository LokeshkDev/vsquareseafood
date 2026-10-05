import * as adminService from '../services/admin.service.js';
import { successResponse, paginatedResponse } from '../utils/response.js';

export const getDashboard = async (req, res, next) => {
  try {
    const stats = await adminService.getDashboardStats();
    return successResponse(res, stats);
  } catch (error) {
    next(error);
  }
};

export const getCustomers = async (req, res, next) => {
  try {
    const { search, page, limit } = req.query;
    const result = await adminService.getCustomersAdmin({
      search,
      page: Number(page) || 1,
      limit: Number(limit) || 20,
    });
    return paginatedResponse(res, result.customers, result.pagination);
  } catch (error) {
    next(error);
  }
};

export const updateCustomerStatus = async (req, res, next) => {
  try {
    const customer = await adminService.updateCustomerStatus(req.params.id, req.body.isActive, req.user.id);
    return successResponse(res, customer);
  } catch (error) {
    next(error);
  }
};

export const getInventory = async (req, res, next) => {
  try {
    const { lowStockOnly, page, limit } = req.query;
    const result = await adminService.getInventoryAdmin({
      lowStockOnly: lowStockOnly === 'true',
      page: Number(page) || 1,
      limit: Number(limit) || 25,
    });
    return paginatedResponse(res, result.inventory, result.pagination);
  } catch (error) {
    next(error);
  }
};

export const adjustInventory = async (req, res, next) => {
  try {
    const updated = await adminService.adjustInventory(req.params.variantId, { quantity: Number(req.body.quantity), notes: req.body.notes }, req.user.id);
    return successResponse(res, updated);
  } catch (error) {
    next(error);
  }
};

export const getAuditLogs = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await adminService.getAuditLogs({
      page: Number(page) || 1,
      limit: Number(limit) || 30,
    });
    return paginatedResponse(res, result.logs, result.pagination);
  } catch (error) {
    next(error);
  }
};

export const syncCatalog = async (req, res, next) => {
  try {
    const { items, categories } = req.body;
    const result = await adminService.syncCatalogItems(items, categories);
    return successResponse(res, result);
  } catch (error) {
    next(error);
  }
};

