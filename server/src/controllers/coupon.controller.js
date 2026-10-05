import * as couponService from '../services/coupon.service.js';
import { successResponse, createdResponse } from '../utils/response.js';

export const validateCoupon = async (req, res, next) => {
  try {
    const { code, subtotal } = req.body;
    const result = await couponService.validateCoupon({
      code,
      userId: req.user?.id,
      subtotal: Number(subtotal),
    });
    return successResponse(res, result);
  } catch (error) {
    next(error);
  }
};

export const getCoupons = async (req, res, next) => {
  try {
    const coupons = await couponService.getCoupons();
    return successResponse(res, coupons);
  } catch (error) {
    next(error);
  }
};

export const createCoupon = async (req, res, next) => {
  try {
    const coupon = await couponService.createCoupon(req.body);
    return createdResponse(res, coupon);
  } catch (error) {
    next(error);
  }
};

export const updateCoupon = async (req, res, next) => {
  try {
    const coupon = await couponService.updateCoupon(req.params.id, req.body);
    return successResponse(res, coupon);
  } catch (error) {
    next(error);
  }
};

export const deleteCoupon = async (req, res, next) => {
  try {
    await couponService.deleteCoupon(req.params.id);
    return successResponse(res, { message: 'Coupon deleted successfully' });
  } catch (error) {
    next(error);
  }
};
