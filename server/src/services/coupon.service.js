import prisma from '../config/db.js';
import { AppError } from '../utils/AppError.js';

export const validateCoupon = async ({ code, userId, subtotal, itemIds = [] }) => {
  const coupon = await prisma.coupon.findUnique({
    where: { code: code.toUpperCase().trim() },
  });

  if (!coupon || !coupon.isActive) {
    throw AppError.badRequest('Invalid or inactive coupon code', 'INVALID_COUPON');
  }

  const now = new Date();
  if (coupon.startDate && now < coupon.startDate) throw AppError.badRequest('This coupon is not active yet', 'COUPON_NOT_STARTED');
  if (coupon.expiryDate && now > coupon.expiryDate) throw AppError.badRequest('This coupon has expired', 'COUPON_EXPIRED');
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) throw AppError.badRequest('This coupon usage limit has been reached', 'COUPON_LIMIT_REACHED');

  if (userId) {
    const userUsageCount = await prisma.couponUsage.count({
      where: { couponId: coupon.id, userId },
    });
    if (userUsageCount >= coupon.perUserLimit) {
      throw AppError.badRequest(`You have already used this coupon the maximum allowed times (${coupon.perUserLimit})`, 'COUPON_USER_LIMIT');
    }
  }

  const minOrder = coupon.minOrderValue ? Number(coupon.minOrderValue) : 0;
  if (subtotal < minOrder) {
    throw AppError.badRequest(`Minimum order value of ₹${minOrder} required to apply this coupon`, 'MIN_ORDER_NOT_MET');
  }

  let discount = 0;
  const couponValue = Number(coupon.value);
  if (coupon.type === 'PERCENTAGE') {
    discount = (subtotal * couponValue) / 100;
    if (coupon.maxDiscount && discount > Number(coupon.maxDiscount)) {
      discount = Number(coupon.maxDiscount);
    }
  } else if (coupon.type === 'FIXED') {
    discount = Math.min(couponValue, subtotal);
  }

  discount = Math.round(discount * 100) / 100;
  return { couponId: coupon.id, code: coupon.code, type: coupon.type, discount };
};

export const getCoupons = async () => prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
export const createCoupon = async (data) => {
  const code = data.code.toUpperCase().trim();
  const existing = await prisma.coupon.findUnique({ where: { code } });
  if (existing) throw AppError.conflict('A coupon with this code already exists', 'COUPON_EXISTS');
  return prisma.coupon.create({ data: { ...data, code } });
};
export const updateCoupon = async (id, data) => {
  if (data.code) data.code = data.code.toUpperCase().trim();
  return prisma.coupon.update({ where: { id }, data });
};
export const deleteCoupon = async (id) => prisma.coupon.delete({ where: { id } });
