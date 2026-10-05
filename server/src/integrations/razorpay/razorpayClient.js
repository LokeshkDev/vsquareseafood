import Razorpay from 'razorpay';
import crypto from 'crypto';
import { config } from '../../config/env.js';

let razorpayInstance = null;

export const getRazorpay = () => {
  if (!razorpayInstance) {
    if (!config.razorpay.keyId || !config.razorpay.keySecret) {
      return null;
    }
    razorpayInstance = new Razorpay({
      key_id: config.razorpay.keyId,
      key_secret: config.razorpay.keySecret,
    });
  }
  return razorpayInstance;
};

export const createRazorpayOrder = async ({ amount, receipt, notes = {} }) => {
  const razorpay = getRazorpay();
  if (!razorpay) {
    return {
      id: `order_dev_${Date.now()}`,
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt,
      status: 'created',
    };
  }
  const amountInPaise = Math.round(amount * 100);
  return razorpay.orders.create({
    amount: amountInPaise,
    currency: 'INR',
    receipt,
    notes,
  });
};

export const verifyPaymentSignature = ({ orderId, paymentId, signature }) => {
  if (!config.razorpay.keySecret) {
    return true;
  }
  const generatedSignature = crypto
    .createHmac('sha256', config.razorpay.keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return generatedSignature === signature;
};

export const verifyWebhookSignature = (body, signature) => {
  if (!config.razorpay.webhookSecret) return false;
  const expectedSignature = crypto
    .createHmac('sha256', config.razorpay.webhookSecret)
    .update(typeof body === 'string' ? body : JSON.stringify(body))
    .digest('hex');

  return expectedSignature === signature;
};
