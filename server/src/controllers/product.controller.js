import * as productService from '../services/product.service.js';
import { successResponse, createdResponse, paginatedResponse } from '../utils/response.js';

export const getProducts = async (req, res, next) => {
  try {
    const { products, pagination } = await productService.getProducts(req.query);
    return paginatedResponse(res, products, pagination);
  } catch (error) {
    next(error);
  }
};

export const getProductBySlug = async (req, res, next) => {
  try {
    const product = await productService.getProductBySlug(req.params.slug);
    return successResponse(res, product);
  } catch (error) {
    next(error);
  }
};

export const getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await productService.getFeaturedProducts();
    return successResponse(res, products);
  } catch (error) {
    next(error);
  }
};

export const getPopularProducts = async (req, res, next) => {
  try {
    const products = await productService.getPopularProducts();
    return successResponse(res, products);
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body);
    return createdResponse(res, product);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    return successResponse(res, product);
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const result = await productService.deleteProduct(req.params.id);
    return successResponse(res, result);
  } catch (error) {
    next(error);
  }
};

export const bulkUpdateStatus = async (req, res, next) => {
  try {
    const { ids, status } = req.body;
    const result = await productService.bulkUpdateProductStatus(ids, status);
    return successResponse(res, result);
  } catch (error) {
    next(error);
  }
};

export const bulkDeleteProducts = async (req, res, next) => {
  try {
    const { ids } = req.body;
    const result = await productService.bulkDeleteProducts(ids);
    return successResponse(res, result);
  } catch (error) {
    next(error);
  }
};
