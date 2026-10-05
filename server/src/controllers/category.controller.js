import * as categoryService from '../services/category.service.js';
import { successResponse, createdResponse } from '../utils/response.js';

export const getCategories = async (req, res, next) => {
  try {
    const categories = await categoryService.getAllCategories(req.query.all === 'true');
    return successResponse(res, categories);
  } catch (error) {
    next(error);
  }
};

export const getCategoryBySlug = async (req, res, next) => {
  try {
    const category = await categoryService.getCategoryBySlug(req.params.slug);
    return successResponse(res, category);
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const category = await categoryService.createCategory(req.body);
    return createdResponse(res, category);
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const category = await categoryService.updateCategory(req.params.id, req.body);
    return successResponse(res, category);
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const result = await categoryService.deleteCategory(req.params.id);
    return successResponse(res, result);
  } catch (error) {
    next(error);
  }
};

export const bulkUpdateStatus = async (req, res, next) => {
  try {
    const { ids, isActive } = req.body;
    const result = await categoryService.bulkUpdateCategoryActive(ids, isActive);
    return successResponse(res, result);
  } catch (error) {
    next(error);
  }
};

export const bulkDeleteCategories = async (req, res, next) => {
  try {
    const { ids } = req.body;
    const result = await categoryService.bulkDeleteCategories(ids);
    return successResponse(res, result);
  } catch (error) {
    next(error);
  }
};
