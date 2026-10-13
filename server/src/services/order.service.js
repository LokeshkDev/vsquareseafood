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

const CUT_PREFERENCE_NAMES = {
  'full-piece-uncut': 'Full Piece / Whole (Uncut)',
  'curry-cut': 'Curry Cut',
  'fry-cut': 'Fry Cut / Steaks',
  'whole-cleaned': 'Whole Cleaned',
  'fillet': 'Boneless Fillet',
  'prawns-peeled': 'Peeled & Deveined',
  'prawns-whole': 'Whole Prawns (Shell-On)',
  'crab-cleaned': 'Cleaned & Dressed Crab',
  'crab-whole': 'Whole Live Crab',
  'squid-rings': 'Squid Rings & Tentacles',
  'ready-to-eat': 'Ready to Eat (Cooked)',
};

const formatCutPreference = (rawCut) => {
  if (!rawCut) return 'Whole Cleaned';
  const key = String(rawCut).toLowerCase().replace(/_/g, '-').replace(/\s+/g, '-').trim();
  if (CUT_PREFERENCE_NAMES[key]) return CUT_PREFERENCE_NAMES[key];
  return String(rawCut).replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

const isSyntheticEmail = (email) => {
  if (!email) return true;
  const lower = String(email).toLowerCase();
  return (
    lower.includes('@v2seafood.guest') ||
    lower.includes('@v2seafood.in') ||
    lower.includes('guest') ||
    lower.includes('@placeholder') ||
    lower.endsWith('.guest')
  );
};

const sanitizeOrder = (order) => {
  if (!order) return order;
  const sanitized = { ...order };
  if (sanitized.user) {
    sanitized.user = {
      ...sanitized.user,
      email: isSyntheticEmail(sanitized.user.email) ? null : sanitized.user.email,
    };
  }
  return sanitized;
};

export const createOrder = async ({
  userId,
  items: rawItems,
  address,
  addressId,
  customAddress,
  deliverySlot,
  paymentMethod = 'COD',
  notes,
  deliveryCharge: clientDeliveryCharge,
  packagingFee: clientPackagingFee,
  subtotal: clientSubtotal,
  total: clientTotal,
  couponCode,
}) => {
  // 1. Resolve Delivery Address
  let deliveryAddress = address || customAddress;
  if (!deliveryAddress && addressId && userId) {
    deliveryAddress = await prisma.address.findFirst({ where: { id: addressId, userId } });
  }

  if (!deliveryAddress || !deliveryAddress.name || !deliveryAddress.phone) {
    throw AppError.badRequest('Customer name and contact phone number are required', 'ADDRESS_REQUIRED');
  }

  // 2. Resolve User (Logged in vs Guest)
  let user = null;
  if (userId) {
    user = await prisma.user.findUnique({ where: { id: userId } });
  }

  if (!user) {
    const cleanPhone = (deliveryAddress.phone || '').replace(/\D/g, '');
    if (cleanPhone) {
      user = await prisma.user.findFirst({ where: { phone: cleanPhone } });
    }
    if (!user) {
      const guestEmail = cleanPhone ? `${cleanPhone}@v2seafood.guest` : `guest-${Date.now()}@v2seafood.in`;
      const existingByEmail = await prisma.user.findUnique({ where: { email: guestEmail } });
      if (existingByEmail) {
        user = existingByEmail;
      } else {
        const nameParts = (deliveryAddress.name || 'Customer').trim().split(' ');
        const firstName = nameParts[0] || 'Customer';
        const lastName = nameParts.slice(1).join(' ') || '';
        user = await prisma.user.create({
          data: {
            email: guestEmail,
            phone: cleanPhone || null,
            passwordHash: 'GUEST_CHECKOUT',
            firstName,
            lastName: lastName || null,
            role: 'CUSTOMER',
          },
        });
      }
    }
  }

  // 3. Resolve Items
  let orderItemsData = [];
  if (Array.isArray(rawItems) && rawItems.length > 0) {
    for (const it of rawItems) {
      const qty = Math.max(1, Number(it.quantity) || 1);
      const unitPrice = Number(it.unitPrice || it.price || 0);

      // Find or resolve Product
      let product = null;
      if (it.productId) {
        product = await prisma.product.findFirst({
          where: { OR: [{ id: it.productId }, { slug: it.productId }] },
          include: { variants: true },
        });
      }
      if (!product && it.name) {
        product = await prisma.product.findFirst({
          where: { name: { contains: it.name } },
          include: { variants: true },
        });
      }
      if (!product) {
        product = await prisma.product.findFirst({
          where: { status: 'ACTIVE' },
          include: { variants: true },
        });
      }
      if (!product) {
        throw AppError.badRequest('No active products available to fulfill order', 'NO_PRODUCTS');
      }

      // Find or resolve Variant matching customer cut preference
      let variant = null;
      const requestedCut = it.cleaningOption || it.cutPreference || '';

      if (requestedCut) {
        variant = product.variants?.find((v) =>
          (v.cleaningOption && v.cleaningOption.toLowerCase() === requestedCut.toLowerCase()) ||
          (v.cutType && v.cutType.toLowerCase() === requestedCut.toLowerCase())
        );
      }
      if (!variant && it.variantId) {
        variant = product.variants?.find((v) => v.id === it.variantId);
      }
      if (!variant && product.variants?.length > 0) {
        variant = product.variants[0];
      }

      if (!variant) {
        const fallbackSku = `${(product.slug || 'SEAFOOD').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)}-STD-${Date.now().toString().slice(-4)}`;
        variant = await prisma.productVariant.create({
          data: {
            productId: product.id,
            sku: fallbackSku,
            cutType: 'WHOLE',
            price: unitPrice > 0 ? unitPrice : product.basePrice,
            isAvailable: true,
          },
        });
        await prisma.inventory.create({
          data: { productVariantId: variant.id, availableQuantity: 100, lowStockThreshold: 5 },
        });
      }

      const finalPrice = unitPrice > 0 ? unitPrice : Number(variant.price || product.basePrice || 0);
      const cutChoice = formatCutPreference(requestedCut || variant.cleaningOption || variant.cutType || 'Whole Cleaned');

      orderItemsData.push({
        productId: product.id,
        variantId: variant.id,
        productNameSnapshot: product.name,
        variantNameSnapshot: cutChoice,
        skuSnapshot: variant.sku || 'SKU-STD',
        unitPrice: finalPrice,
        quantity: qty,
        subtotal: finalPrice * qty,
      });
    }
  } else {
    // Fallback to DB cart
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            productVariant: { include: { product: true, inventory: true } },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw AppError.badRequest('Your cart is empty. Please add items before checking out.', 'CART_EMPTY');
    }

    for (const item of cart.items) {
      const variant = item.productVariant;
      const unitPrice = Number(variant.price);
      orderItemsData.push({
        productId: variant.productId,
        variantId: variant.id,
        productNameSnapshot: variant.product.name,
        variantNameSnapshot: `${variant.weightValue || ''}${variant.weightUnit || ''} ${variant.cutType || ''}`.trim(),
        skuSnapshot: variant.sku,
        unitPrice,
        quantity: item.quantity,
        subtotal: unitPrice * item.quantity,
      });
    }
  }

  // 4. Financials
  const subtotal = clientSubtotal !== undefined && Number(clientSubtotal) > 0
    ? Number(clientSubtotal)
    : orderItemsData.reduce((acc, it) => acc + it.subtotal, 0);

  let discount = 0;
  let validatedCoupon = null;
  if (couponCode) {
    try {
      validatedCoupon = await validateCoupon({ code: couponCode, userId: user.id, subtotal });
      discount = validatedCoupon.discount;
    } catch (e) {}
  }

  const deliveryCharge = clientDeliveryCharge !== undefined && !isNaN(Number(clientDeliveryCharge))
    ? Number(clientDeliveryCharge)
    : (subtotal >= 699 ? 0 : 49);

  const packagingFee = clientPackagingFee !== undefined && !isNaN(Number(clientPackagingFee))
    ? Number(clientPackagingFee)
    : 19;

  const total = clientTotal !== undefined && Number(clientTotal) > 0
    ? Number(clientTotal)
    : Math.max(0, subtotal - discount + deliveryCharge + packagingFee);

  const orderNumber = generateOrderNumber();

  // 5. Delivery Slot and Snapshot Formatting
  const slotDate = deliverySlot?.date || '';
  const slotTime = deliverySlot?.time || '';
  const slotStr = slotDate && slotTime ? `${slotDate} (${slotTime})` : (slotDate || slotTime || 'Morning 6:00 AM - 10:00 AM');

  const addressSnapshotObj = {
    name: deliveryAddress.name,
    phone: deliveryAddress.phone,
    flatNo: deliveryAddress.flatNo || deliveryAddress.addressLine1 || '',
    street: deliveryAddress.street || deliveryAddress.addressLine2 || '',
    landmark: deliveryAddress.landmark || '',
    city: deliveryAddress.city || 'Chennai',
    state: deliveryAddress.state || 'Tamil Nadu',
    pincode: deliveryAddress.pincode || '',
    deliveryDate: slotDate,
    deliveryTime: slotTime,
    deliverySlot: slotStr,
    paymentMethod: paymentMethod || 'COD',
    deliveryCharge,
    packagingFee,
    items: orderItemsData.map((d) => ({
      name: d.productNameSnapshot,
      cutPreference: d.variantNameSnapshot,
      unitPrice: d.unitPrice,
      quantity: d.quantity,
    })),
  };
  const addressSnapshotStr = JSON.stringify(addressSnapshotObj);

  return prisma.$transaction(async (tx) => {
    // Inventory reservation
    for (const item of orderItemsData) {
      try {
        await tx.inventory.update({
          where: { productVariantId: item.variantId },
          data: {
            availableQuantity: { decrement: item.quantity },
            reservedQuantity: { increment: item.quantity },
          },
        });

        await tx.inventoryTransaction.create({
          data: {
            productVariantId: item.variantId,
            type: 'RESERVATION',
            quantity: item.quantity,
            referenceType: 'order_reservation',
            referenceId: orderNumber,
            notes: `Reserved for order ${orderNumber}`,
          },
        });
      } catch (e) {
        // Inventory update skipped if record is unmanaged
      }
    }

    if (validatedCoupon) {
      await tx.couponUsage.create({ data: { couponId: validatedCoupon.couponId, userId: user.id } });
      await tx.coupon.update({ where: { id: validatedCoupon.couponId }, data: { usedCount: { increment: 1 } } });
    }

    const order = await tx.order.create({
      data: {
        orderNumber,
        userId: user.id,
        status: ORDER_STATUS.PENDING,
        subtotal,
        discount,
        deliveryCharge,
        tax: 0,
        total,
        couponCode: validatedCoupon?.code || null,
        paymentStatus: 'PENDING',
        deliveryStatus: `Slot: ${slotStr}`,
        customerNameSnapshot: deliveryAddress.name,
        phoneSnapshot: deliveryAddress.phone,
        addressSnapshot: addressSnapshotStr,
        notes: notes || `[${paymentMethod}] Slot: ${slotStr}`,
      },
    });

    for (const item of orderItemsData) {
      await tx.orderItem.create({
        data: {
          orderId: order.id,
          productId: item.productId,
          variantId: item.variantId,
          productNameSnapshot: item.productNameSnapshot,
          variantNameSnapshot: item.variantNameSnapshot,
          skuSnapshot: item.skuSnapshot,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          subtotal: item.subtotal,
        },
      });
    }

    await tx.payment.create({
      data: {
        orderId: order.id,
        provider: paymentMethod === 'COD' ? 'cod' : 'razorpay',
        method: paymentMethod || 'COD',
        amount: total,
        currency: 'INR',
        status: 'PENDING',
      },
    });

    // Cleanup DB cart if user had one
    try {
      const userCart = await tx.cart.findUnique({ where: { userId: user.id } });
      if (userCart) {
        await tx.cartItem.deleteMany({ where: { cartId: userCart.id } });
      }
    } catch (e) {}

    const freshOrder = await tx.order.findUnique({
      where: { id: order.id },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, images: true } },
            variant: true,
          },
        },
        payments: true,
        user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } },
      },
    });
    return sanitizeOrder(freshOrder);
  });
};

export const getOrderById = async (orderId, userId, isAdmin = false) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: { include: { images: { where: { isPrimary: true }, take: 1 } } },
          variant: true,
        },
      },
      payments: true,
      user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } },
    },
  });

  if (!order) throw AppError.notFound('Order not found', 'ORDER_NOT_FOUND');
  if (!isAdmin && order.userId !== userId) throw AppError.forbidden('Access denied', 'FORBIDDEN');
  return sanitizeOrder(order);
};

export const getUserOrders = async (userId, { page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, images: true } },
            variant: true,
          },
        },
        payments: true,
      },
    }),
    prisma.order.count({ where: { userId } }),
  ]);

  return { orders: orders.map(sanitizeOrder), pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const getAllOrders = async ({ status, search, page = 1, limit = 50 }) => {
  const where = { ...(status && status !== 'ALL' && { status }) };
  if (search) {
    where.OR = [
      { orderNumber: { contains: search } },
      { customerNameSnapshot: { contains: search } },
      { phoneSnapshot: { contains: search } },
      { id: { contains: search } },
    ];
  }
  const skip = (page - 1) * limit;
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, images: true } },
            variant: true,
          },
        },
        payments: true,
        user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return { orders: orders.map(sanitizeOrder), pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const updateOrderStatus = async (orderId, newStatus, adminId = null) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) throw AppError.notFound('Order not found', 'ORDER_NOT_FOUND');
  if (!ORDER_STATUS[newStatus]) {
    throw AppError.badRequest(`Invalid order status: ${newStatus}`, 'INVALID_STATUS');
  }

  // Customer self-cancellation must follow strict transition rules
  if (!adminId && !isValidTransition(order.status, newStatus)) {
    throw AppError.badRequest(`Cannot transition order from ${order.status} to ${newStatus}`, 'INVALID_STATUS_TRANSITION');
  }

  return prisma.$transaction(async (tx) => {
    if (newStatus === ORDER_STATUS.CANCELLED) {
      for (const item of order.items) {
        try {
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
        } catch (e) {}
      }
    }

    if (newStatus === ORDER_STATUS.CONFIRMED && order.status === ORDER_STATUS.PENDING) {
      for (const item of order.items) {
        try {
          await tx.inventory.update({
            where: { productVariantId: item.variantId },
            data: { reservedQuantity: { decrement: item.quantity }, soldQuantity: { increment: item.quantity } },
          });
        } catch (e) {}
      }
    }

    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: { status: newStatus },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, images: true } },
            variant: true,
          },
        },
        payments: true,
        user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } },
      },
    });
    return sanitizeOrder(updatedOrder);
  });
};

export const updateOrderAdmin = async (orderId, updateData) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw AppError.notFound('Order not found', 'ORDER_NOT_FOUND');

  const dataToUpdate = {};
  if (updateData.status && ORDER_STATUS[updateData.status]) {
    dataToUpdate.status = updateData.status;
  }
  if (updateData.paymentStatus) {
    dataToUpdate.paymentStatus = updateData.paymentStatus;
    await prisma.payment.updateMany({
      where: { orderId },
      data: { status: updateData.paymentStatus },
    });
  }
  if (updateData.notes !== undefined) dataToUpdate.notes = updateData.notes;
  if (updateData.deliveryStatus !== undefined) dataToUpdate.deliveryStatus = updateData.deliveryStatus;
  if (updateData.customerNameSnapshot) dataToUpdate.customerNameSnapshot = updateData.customerNameSnapshot;
  if (updateData.phoneSnapshot) dataToUpdate.phoneSnapshot = updateData.phoneSnapshot;
  if (updateData.addressSnapshot) {
    dataToUpdate.addressSnapshot = typeof updateData.addressSnapshot === 'object'
      ? JSON.stringify(updateData.addressSnapshot)
      : updateData.addressSnapshot;
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: dataToUpdate,
    include: {
      items: {
        include: {
          product: { select: { id: true, name: true, images: true } },
          variant: true,
        },
      },
      payments: true,
      user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } },
    },
  });
  return sanitizeOrder(updated);
};

export const deleteOrder = async (orderId) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) throw AppError.notFound('Order not found', 'ORDER_NOT_FOUND');

  for (const it of order.items) {
    try {
      await prisma.inventory.update({
        where: { productVariantId: it.variantId },
        data: {
          availableQuantity: { increment: it.quantity },
          reservedQuantity: { decrement: it.quantity },
        },
      });
    } catch (e) {}
  }

  await prisma.order.delete({ where: { id: orderId } });
  return { success: true, message: `Order ${order.orderNumber} deleted successfully` };
};

export const cancelCustomerOrder = async (orderId, userId) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.userId !== userId) throw AppError.notFound('Order not found', 'ORDER_NOT_FOUND');
  if (order.status !== ORDER_STATUS.PENDING && order.status !== ORDER_STATUS.CONFIRMED) {
    throw AppError.badRequest(`Cannot cancel order with status ${order.status}`, 'CANNOT_CANCEL');
  }
  return updateOrderStatus(orderId, ORDER_STATUS.CANCELLED, null);
};
