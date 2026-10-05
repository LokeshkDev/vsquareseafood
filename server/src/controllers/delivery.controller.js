import * as deliveryService from '../services/delivery.service.js';
import { successResponse, createdResponse } from '../utils/response.js';

export const calculateDelivery = async (req, res, next) => {
  try {
    const amount = Number(req.query.amount) || 0;
    const result = await deliveryService.calculateDeliveryCharge({
      amount,
      pincode: req.query.pincode,
      location: req.query.location,
    });
    return successResponse(res, result);
  } catch (error) {
    next(error);
  }
};

export const getRules = async (req, res, next) => {
  try {
    const rules = await deliveryService.getDeliveryRules();
    return successResponse(res, rules);
  } catch (error) {
    next(error);
  }
};

export const createRule = async (req, res, next) => {
  try {
    const rule = await deliveryService.createDeliveryRule(req.body);
    return createdResponse(res, rule);
  } catch (error) {
    next(error);
  }
};

export const updateRule = async (req, res, next) => {
  try {
    const rule = await deliveryService.updateDeliveryRule(req.params.id, req.body);
    return successResponse(res, rule);
  } catch (error) {
    next(error);
  }
};

export const deleteRule = async (req, res, next) => {
  try {
    await deliveryService.deleteDeliveryRule(req.params.id);
    return successResponse(res, { message: 'Rule deleted successfully' });
  } catch (error) {
    next(error);
  }
};
