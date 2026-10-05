import * as cartService from '../services/cart.service.js';
import { successResponse } from '../utils/response.js';

export const getCart = async (req, res, next) => {
  try {
    const cart = await cartService.getCart(req.user.id);
    return successResponse(res, cart);
  } catch (error) {
    next(error);
  }
};

export const addItem = async (req, res, next) => {
  try {
    const { variantId, quantity } = req.body;
    const cart = await cartService.addItem(req.user.id, variantId, quantity);
    return successResponse(res, cart);
  } catch (error) {
    next(error);
  }
};

export const updateItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const cart = await cartService.updateItem(req.user.id, req.params.id, quantity);
    return successResponse(res, cart);
  } catch (error) {
    next(error);
  }
};

export const removeItem = async (req, res, next) => {
  try {
    const cart = await cartService.removeItem(req.user.id, req.params.id);
    return successResponse(res, cart);
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    const result = await cartService.clearCart(req.user.id);
    return successResponse(res, result);
  } catch (error) {
    next(error);
  }
};
