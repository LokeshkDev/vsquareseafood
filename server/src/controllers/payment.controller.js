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
