import fs from 'fs';
import path from 'path';

const write = (relPath, content) => {
  const fullPath = path.resolve('src', relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Wrote', relPath);
};

// 1. controllers/auth.controller.js
write('controllers/auth.controller.js', `
import * as authService from '../services/auth.service.js';
import { successResponse, createdResponse } from '../utils/response.js';
import { getCookieOptions } from '../utils/token.js';

export const register = async (req, res, next) => {
  try {
    const { user, token } = await authService.register(req.body);
    res.cookie('token', token, getCookieOptions());
    return createdResponse(res, { user, token });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.login(email, password);
    res.cookie('token', token, getCookieOptions());
    return successResponse(res, { user, token });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    return successResponse(res, { message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);
    return successResponse(res, user);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const user = await authService.updateProfile(req.user.id, req.body);
    return successResponse(res, user);
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await authService.changePassword(req.user.id, currentPassword, newPassword);
    return successResponse(res, result);
  } catch (error) {
    next(error);
  }
};
`);

// 2. controllers/category.controller.js
write('controllers/category.controller.js', `
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
    await categoryService.deleteCategory(req.params.id);
    return successResponse(res, { message: 'Category deactivated successfully' });
  } catch (error) {
    next(error);
  }
};
`);

// 3. controllers/product.controller.js
write('controllers/product.controller.js', `
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
    await productService.archiveProduct(req.params.id);
    return successResponse(res, { message: 'Product archived successfully' });
  } catch (error) {
    next(error);
  }
};
`);

// 4. controllers/cart.controller.js
write('controllers/cart.controller.js', `
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
`);

// 5. controllers/order.controller.js
write('controllers/order.controller.js', `
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
`);

// 6. controllers/payment.controller.js
write('controllers/payment.controller.js', `
import prisma from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import { successResponse } from '../utils/response.js';
import { config } from '../config/env.js';
import { createRazorpayOrder, verifyPaymentSignature, verifyWebhookSignature } from '../integrations/razorpay/razorpayClient.js';
import { updateOrderStatus } from '../services/order.service.js';
import { ORDER_STATUS } from '../constants/orderStatus.js';

export const createPaymentIntent = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payments: true },
    });

    if (!order) throw AppError.notFound('Order not found', 'ORDER_NOT_FOUND');
    if (order.userId !== req.user.id) throw AppError.forbidden('Access denied', 'FORBIDDEN');
    if (order.paymentStatus === 'PAID') throw AppError.badRequest('Order is already paid', 'ALREADY_PAID');

    const rzpOrder = await createRazorpayOrder({
      amount: Number(order.total),
      receipt: order.orderNumber,
      notes: { orderId: order.id, orderNumber: order.orderNumber, userId: order.userId },
    });

    await prisma.payment.updateMany({
      where: { orderId: order.id, status: 'PENDING' },
      data: { providerOrderId: rzpOrder.id },
    });

    return successResponse(res, {
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      keyId: config.razorpay.keyId || 'rzp_test_placeholder',
      orderNumber: order.orderNumber,
      customer: { name: order.customerNameSnapshot, phone: order.phoneSnapshot, email: req.user.email },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const isValid = verifyPaymentSignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
    });

    const payment = await prisma.payment.findFirst({ where: { orderId } });
    if (!payment) throw AppError.notFound('Payment record not found', 'PAYMENT_NOT_FOUND');

    if (!isValid) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED', failureReason: 'Invalid signature verification' },
      });
      throw AppError.badRequest('Invalid payment signature', 'PAYMENT_VERIFICATION_FAILED');
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        providerOrderId: razorpayOrderId,
        providerPaymentId: razorpayPaymentId,
        providerSignature: razorpaySignature,
        status: 'PAID',
      },
    });

    await prisma.order.update({ where: { id: orderId }, data: { paymentStatus: 'PAID' } });
    const confirmedOrder = await updateOrderStatus(orderId, ORDER_STATUS.CONFIRMED, null);

    return successResponse(res, {
      message: 'Payment verified and order confirmed successfully',
      order: confirmedOrder,
    });
  } catch (error) {
    next(error);
  }
};

export const handleWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const event = req.body;

    if (config.nodeEnv === 'production') {
      const isValid = verifyWebhookSignature(req.body, signature);
      if (!isValid) return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
    }

    const eventType = event.event;
    const paymentEntity = event.payload?.payment?.entity;
    const rzpOrderId = paymentEntity?.order_id;
    if (!rzpOrderId) return res.status(200).json({ received: true });

    const payment = await prisma.payment.findFirst({
      where: { providerOrderId: rzpOrderId },
      include: { order: true },
    });
    if (!payment) return res.status(200).json({ received: true });
    if (payment.webhookVerified && payment.status === 'PAID') return res.status(200).json({ received: true, status: 'already_processed' });

    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'PAID', providerPaymentId: paymentEntity.id, method: paymentEntity.method, webhookVerified: true },
      });
      if (payment.order.status === ORDER_STATUS.PENDING) {
        await updateOrderStatus(payment.orderId, ORDER_STATUS.CONFIRMED, null);
      }
    } else if (eventType === 'payment.failed') {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED', failureReason: paymentEntity.error_description || 'Payment failed', webhookVerified: true },
      });
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    next(error);
  }
};
`);

// 7. controllers/delivery.controller.js
write('controllers/delivery.controller.js', `
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
`);

// 8. controllers/coupon.controller.js
write('controllers/coupon.controller.js', `
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
`);

// 9. controllers/review.controller.js
write('controllers/review.controller.js', `
import * as reviewService from '../services/review.service.js';
import { successResponse, createdResponse, paginatedResponse } from '../utils/response.js';

export const createReview = async (req, res, next) => {
  try {
    const { productId, rating, title, comment } = req.body;
    const review = await reviewService.createReview({
      userId: req.user.id,
      productId,
      rating: Number(rating),
      title,
      comment,
    });
    return createdResponse(res, review);
  } catch (error) {
    next(error);
  }
};

export const getProductReviews = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const result = await reviewService.getProductReviews(req.params.productId, { page, limit });
    return paginatedResponse(res, result.reviews, result.pagination);
  } catch (error) {
    next(error);
  }
};

export const getAllReviewsAdmin = async (req, res, next) => {
  try {
    const { status, page, limit } = req.query;
    const result = await reviewService.getAllReviewsAdmin({
      status,
      page: Number(page) || 1,
      limit: Number(limit) || 20,
    });
    return paginatedResponse(res, result.reviews, result.pagination);
  } catch (error) {
    next(error);
  }
};

export const updateReviewStatusAdmin = async (req, res, next) => {
  try {
    const { status } = req.body;
    const updated = await reviewService.updateReviewStatus(req.params.id, status);
    return successResponse(res, updated);
  } catch (error) {
    next(error);
  }
};
`);

// 10. controllers/banner.controller.js
write('controllers/banner.controller.js', `
import * as bannerService from '../services/banner.service.js';
import { successResponse, createdResponse } from '../utils/response.js';

export const getActiveBanners = async (req, res, next) => {
  try {
    const banners = await bannerService.getActiveBanners(req.query.placement || 'home_hero');
    return successResponse(res, banners);
  } catch (error) {
    next(error);
  }
};

export const getAllBanners = async (req, res, next) => {
  try {
    const banners = await bannerService.getAllBanners();
    return successResponse(res, banners);
  } catch (error) {
    next(error);
  }
};

export const createBanner = async (req, res, next) => {
  try {
    const banner = await bannerService.createBanner(req.body);
    return createdResponse(res, banner);
  } catch (error) {
    next(error);
  }
};

export const updateBanner = async (req, res, next) => {
  try {
    const banner = await bannerService.updateBanner(req.params.id, req.body);
    return successResponse(res, banner);
  } catch (error) {
    next(error);
  }
};

export const deleteBanner = async (req, res, next) => {
  try {
    await bannerService.deleteBanner(req.params.id);
    return successResponse(res, { message: 'Banner deleted successfully' });
  } catch (error) {
    next(error);
  }
};
`);

// 11. controllers/media.controller.js
write('controllers/media.controller.js', `
import prisma from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import { successResponse, createdResponse } from '../utils/response.js';
import { getPresignedUploadUrl, deleteR2Object } from '../integrations/r2/r2Client.js';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

export const getPresignedUrl = async (req, res, next) => {
  try {
    const { folder, filename, mimeType } = req.body;
    if (!mimeType || !ALLOWED_MIME_TYPES.includes(mimeType)) {
      throw AppError.badRequest(\`Invalid file type. Allowed types: \${ALLOWED_MIME_TYPES.join(', ')}\`, 'INVALID_MIME_TYPE');
    }
    const result = await getPresignedUploadUrl({ folder: folder || 'products', filename, mimeType });
    return successResponse(res, result);
  } catch (error) {
    next(error);
  }
};

export const confirmUpload = async (req, res, next) => {
  try {
    const { productId, r2Key, publicUrl, altText, isPrimary, mimeType, fileSize } = req.body;
    if (!productId || !r2Key || !publicUrl) throw AppError.badRequest('Missing fields', 'MISSING_FIELDS');

    if (isPrimary) {
      await prisma.productImage.updateMany({ where: { productId }, data: { isPrimary: false } });
    }

    const image = await prisma.productImage.create({
      data: { productId, r2Key, publicUrl, altText: altText || null, isPrimary: !!isPrimary, mimeType: mimeType || null, fileSize: fileSize || null },
    });
    return createdResponse(res, image);
  } catch (error) {
    next(error);
  }
};

export const deleteMedia = async (req, res, next) => {
  try {
    const image = await prisma.productImage.findUnique({ where: { id: req.params.id } });
    if (!image) throw AppError.notFound('Image record not found', 'IMAGE_NOT_FOUND');
    await deleteR2Object(image.r2Key);
    await prisma.productImage.delete({ where: { id: req.params.id } });
    return successResponse(res, { message: 'Image deleted successfully' });
  } catch (error) {
    next(error);
  }
};
`);

// 12. controllers/admin.controller.js
write('controllers/admin.controller.js', `
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
`);

console.log('Part 3 complete!');
