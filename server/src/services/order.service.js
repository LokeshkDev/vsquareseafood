import prisma from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import { ORDER_STATUS, isValidTransition } from '../constants/orderStatus.js';
import { calculateDeliveryCharge } from './delivery.service.js';
import { validateCoupon } from './coupon.service.js';

const generateOrderNumber = () => {
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `V2S-${dateStr}-${random}`;
};

export const createOrder = async ({ userId, addressId, customAddress, couponCode, notes }) => {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          productVariant: { include: { product: true, inventory: true } },
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw AppError.badRequest('Your cart is empty', 'CART_EMPTY');
  }

  let deliveryAddress = null;
  if (addressId) {
    deliveryAddress = await prisma.address.findFirst({ where: { id: addressId, userId } });
    if (!deliveryAddress) throw AppError.notFound('Selected delivery address not found', 'ADDRESS_NOT_FOUND');
  } else if (customAddress) {
    deliveryAddress = customAddress;
  } else {
    throw AppError.badRequest('Delivery address is required', 'ADDRESS_REQUIRED');
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw AppError.notFound('User not found', 'USER_NOT_FOUND');

  let subtotal = 0;
  for (const item of cart.items) {
    const variant = item.productVariant;
    if (!variant || !variant.isAvailable || variant.product.status !== 'ACTIVE') {
      throw AppError.badRequest(`Product "${variant?.product?.name || 'Item'}" is currently unavailable`, 'ITEM_UNAVAILABLE');
    }
    const available = variant.inventory?.availableQuantity ?? 0;
    if (available < item.quantity) {
      throw AppError.badRequest(`Insufficient stock for "${variant.product.name}". Only ${available} available`, 'INSUFFICIENT_STOCK');
    }
    subtotal += Number(variant.price) * item.quantity;
  }

  let discount = 0;
  let validatedCoupon = null;
  if (couponCode) {
    validatedCoupon = await validateCoupon({ code: couponCode, userId, subtotal });
    discount = validatedCoupon.discount;
  }

  const deliveryResult = await calculateDeliveryCharge({
    amount: subtotal - discount,
    pincode: deliveryAddress.pincode,
    location: deliveryAddress.city,
  });
  const deliveryCharge = deliveryResult.charge;
  const total = Math.max(0, subtotal - discount + deliveryCharge);
  const orderNumber = generateOrderNumber();

  return prisma.$transaction(async (tx) => {
    for (const item of cart.items) {
      const variant = item.productVariant;
      await tx.inventory.update({
        where: { productVariantId: variant.id },
        data: {
          availableQuantity: { decrement: item.quantity },
          reservedQuantity: { increment: item.quantity },
        },
      });

      await tx.inventoryTransaction.create({
        data: {
          productVariantId: variant.id,
          type: 'RESERVATION',
          quantity: item.quantity,
          referenceType: 'order_reservation',
          referenceId: orderNumber,
          notes: `Reserved for order ${orderNumber}`,
        },
      });
    }

    if (validatedCoupon) {
      await tx.couponUsage.create({ data: { couponId: validatedCoupon.couponId, userId } });
      await tx.coupon.update({ where: { id: validatedCoupon.couponId }, data: { usedCount: { increment: 1 } } });
    }

    const addressSnapshotStr = JSON.stringify({
      name: deliveryAddress.name || `${user.firstName} ${user.lastName || ''}`.trim(),
      phone: deliveryAddress.phone || user.phone,
      addressLine1: deliveryAddress.addressLine1,
      addressLine2: deliveryAddress.addressLine2 || '',
      city: deliveryAddress.city,
      state: deliveryAddress.state,
      pincode: deliveryAddress.pincode,
      landmark: deliveryAddress.landmark || '',
    });

    const order = await tx.order.create({
      data: {
        orderNumber,
        userId,
        status: ORDER_STATUS.PENDING,
        subtotal,
        discount,
        deliveryCharge,
        tax: 0,
        total,
        couponCode: validatedCoupon?.code || null,
        paymentStatus: 'PENDING',
        customerNameSnapshot: deliveryAddress.name || `${user.firstName} ${user.lastName || ''}`.trim(),
        phoneSnapshot: deliveryAddress.phone || user.phone || '',
        addressSnapshot: addressSnapshotStr,
        notes: notes || null,
      },
    });

    for (const item of cart.items) {
      const variant = item.productVariant;
      const unitPrice = Number(variant.price);
      await tx.orderItem.create({
        data: {
          orderId: order.id,
          productId: variant.productId,
          variantId: variant.id,
          productNameSnapshot: variant.product.name,
          variantNameSnapshot: `${variant.weightValue || ''}${variant.weightUnit || ''} ${variant.cutType || ''}`.trim(),
          skuSnapshot: variant.sku,
          unitPrice,
          quantity: item.quantity,
          subtotal: unitPrice * item.quantity,
        },
      });
    }

    await tx.payment.create({
      data: {
        orderId: order.id,
        provider: 'razorpay',
        amount: total,
        currency: 'INR',
        status: 'PENDING',
      },
    });

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return tx.order.findUnique({
      where: { id: order.id },
      include: { items: true, payments: true },
    });
  });
};

export const getOrderById = async (orderId, userId, isAdmin = false) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          productVariant: {
            include: { product: { include: { images: { where: { isPrimary: true }, take: 1 } } } },
          },
        },
      },
      payments: true,
      user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } },
    },
  });

  if (!order) throw AppError.notFound('Order not found', 'ORDER_NOT_FOUND');
  if (!isAdmin && order.userId !== userId) throw AppError.forbidden('Access denied', 'FORBIDDEN');
  return order;
};

export const getUserOrders = async (userId, { page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: { items: true, payments: { select: { status: true, provider: true } } },
    }),
    prisma.order.count({ where: { userId } }),
  ]);

  return { orders, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const getAllOrders = async ({ status, search, page = 1, limit = 20 }) => {
  const where = { ...(status && { status }) };
  if (search) {
    where.OR = [
      { orderNumber: { contains: search } },
      { customerNameSnapshot: { contains: search } },
      { phoneSnapshot: { contains: search } },
    ];
  }
  const skip = (page - 1) * limit;
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: { items: true, payments: true, user: { select: { email: true, firstName: true, lastName: true } } },
    }),
    prisma.order.count({ where }),
  ]);

  return { orders, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const updateOrderStatus = async (orderId, newStatus, adminId) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) throw AppError.notFound('Order not found', 'ORDER_NOT_FOUND');
  if (!isValidTransition(order.status, newStatus)) {
    throw AppError.badRequest(`Cannot transition order from ${order.status} to ${newStatus}`, 'INVALID_STATUS_TRANSITION');
  }

  return prisma.$transaction(async (tx) => {
    if (newStatus === ORDER_STATUS.CANCELLED) {
      for (const item of order.items) {
        if (order.status === ORDER_STATUS.PENDING) {
          await tx.inventory.update({
            where: { productVariantId: item.variantId },
            data: { availableQuantity: { increment: item.quantity }, reservedQuantity: { decrement: item.quantity } },
          });
        } else {
          await tx.inventory.update({
            where: { productVariantId: item.variantId },
            data: { availableQuantity: { increment: item.quantity }, soldQuantity: { decrement: item.quantity } },
          });
        }
      }
    }

    if (newStatus === ORDER_STATUS.CONFIRMED && order.status === ORDER_STATUS.PENDING) {
      for (const item of order.items) {
        await tx.inventory.update({
          where: { productVariantId: item.variantId },
          data: { reservedQuantity: { decrement: item.quantity }, soldQuantity: { increment: item.quantity } },
        });
      }
    }

    return tx.order.update({ where: { id: orderId }, data: { status: newStatus } });
  });
};

export const cancelCustomerOrder = async (orderId, userId) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.userId !== userId) throw AppError.notFound('Order not found', 'ORDER_NOT_FOUND');
  if (order.status !== ORDER_STATUS.PENDING && order.status !== ORDER_STATUS.CONFIRMED) {
    throw AppError.badRequest(`Cannot cancel order with status ${order.status}`, 'CANNOT_CANCEL');
  }
  return updateOrderStatus(orderId, ORDER_STATUS.CANCELLED, null);
};
