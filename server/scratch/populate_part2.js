import fs from 'fs';
import path from 'path';

const write = (relPath, content) => {
  const fullPath = path.resolve('src', relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Wrote', relPath);
};

// 1. services/auth.service.js
write('services/auth.service.js', `
import bcrypt from 'bcrypt';
import prisma from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import { generateToken } from '../utils/token.js';
import { ROLES } from '../constants/roles.js';

const sanitizeUser = (user) => {
  const { passwordHash, ...sanitized } = user;
  return sanitized;
};

export const register = async ({ email, phone, password, firstName, lastName }) => {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email },
        ...(phone ? [{ phone }] : []),
      ],
    },
  });

  if (existingUser) {
    if (existingUser.email === email) {
      throw AppError.conflict('An account with this email already exists', 'EMAIL_ALREADY_EXISTS');
    }
    if (phone && existingUser.phone === phone) {
      throw AppError.conflict('An account with this phone number already exists', 'PHONE_ALREADY_EXISTS');
    }
  }

  const saltRounds = 12;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const userCount = await prisma.user.count();
  const role = userCount === 0 ? ROLES.SUPER_ADMIN : ROLES.CUSTOMER;

  const user = await prisma.user.create({
    data: {
      email,
      phone: phone || null,
      passwordHash,
      firstName,
      lastName: lastName || null,
      role,
    },
  });

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return { user: sanitizeUser(user), token };
};

export const login = async (email, password) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) {
    throw AppError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw AppError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return { user: sanitizeUser(user), token };
};

export const getMe = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { addresses: { orderBy: { isDefault: 'desc' } } },
  });
  if (!user) throw AppError.notFound('User not found', 'USER_NOT_FOUND');
  return sanitizeUser(user);
};

export const updateProfile = async (userId, { firstName, lastName, phone }) => {
  if (phone) {
    const existingPhone = await prisma.user.findFirst({
      where: { phone, NOT: { id: userId } },
    });
    if (existingPhone) {
      throw AppError.conflict('Phone number is already associated with another account', 'PHONE_TAKEN');
    }
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(firstName !== undefined && { firstName }),
      ...(lastName !== undefined && { lastName }),
      ...(phone !== undefined && { phone: phone || null }),
    },
  });

  return sanitizeUser(user);
};

export const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw AppError.notFound('User not found', 'USER_NOT_FOUND');

  const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isPasswordValid) {
    throw AppError.badRequest('Current password does not match', 'INVALID_CURRENT_PASSWORD');
  }

  const saltRounds = 12;
  const passwordHash = await bcrypt.hash(newPassword, saltRounds);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  return { message: 'Password updated successfully' };
};
`);

// 2. services/category.service.js
write('services/category.service.js', `
import prisma from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import { generateSlug } from '../utils/slug.js';

export const getAllCategories = async (includeInactive = false) => {
  return prisma.category.findMany({
    where: includeInactive ? {} : { isActive: true },
    orderBy: { sortOrder: 'asc' },
    include: {
      _count: {
        select: { products: { where: { status: 'ACTIVE' } } },
      },
    },
  });
};

export const getCategoryBySlug = async (slug) => {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      products: {
        where: { status: 'ACTIVE' },
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          variants: { where: { isAvailable: true } },
        },
      },
    },
  });
  if (!category) throw AppError.notFound('Category not found', 'CATEGORY_NOT_FOUND');
  return category;
};

export const createCategory = async (data) => {
  const slug = data.slug || generateSlug(data.name);
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) throw AppError.conflict('Category with this slug already exists', 'SLUG_EXISTS');
  return prisma.category.create({ data: { ...data, slug } });
};

export const updateCategory = async (id, data) => {
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) throw AppError.notFound('Category not found', 'CATEGORY_NOT_FOUND');
  if (data.name && !data.slug) data.slug = generateSlug(data.name);
  return prisma.category.update({ where: { id }, data });
};

export const deleteCategory = async (id) => {
  return prisma.category.update({ where: { id }, data: { isActive: false } });
};
`);

// 3. services/delivery.service.js
write('services/delivery.service.js', `
import prisma from '../config/db.js';

export const calculateDeliveryCharge = async ({ amount, pincode, location }) => {
  const rules = await prisma.deliveryRule.findMany({
    where: { isActive: true },
    orderBy: { priority: 'desc' },
  });

  if (rules.length === 0) {
    if (amount >= 999) return { charge: 0, ruleName: 'Default Free Delivery (>₹999)' };
    return { charge: 49, ruleName: 'Standard Flat Delivery' };
  }

  for (const rule of rules) {
    const min = rule.minAmount ? Number(rule.minAmount) : 0;
    const max = rule.maxAmount ? Number(rule.maxAmount) : Infinity;
    const charge = Number(rule.charge);

    switch (rule.strategy) {
      case 'PINCODE':
        if (pincode && rule.pincode === pincode) return { charge, ruleName: rule.name };
        break;
      case 'PRICE':
        if (amount >= min && amount <= max) return { charge, ruleName: rule.name };
        break;
      case 'FREE_ABOVE_AMOUNT':
        if (amount >= min) return { charge: 0, ruleName: rule.name };
        break;
      case 'LOCATION':
        if (location && rule.location && location.toLowerCase().includes(rule.location.toLowerCase())) {
          return { charge, ruleName: rule.name };
        }
        break;
      case 'FLAT':
        return { charge, ruleName: rule.name };
      default:
        break;
    }
  }

  return { charge: 49, ruleName: 'Default Delivery' };
};

export const getDeliveryRules = async () => prisma.deliveryRule.findMany({ orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }] });
export const createDeliveryRule = async (data) => prisma.deliveryRule.create({ data });
export const updateDeliveryRule = async (id, data) => prisma.deliveryRule.update({ where: { id }, data });
export const deleteDeliveryRule = async (id) => prisma.deliveryRule.delete({ where: { id } });
`);

// 4. services/coupon.service.js
write('services/coupon.service.js', `
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
      throw AppError.badRequest(\`You have already used this coupon the maximum allowed times (\${coupon.perUserLimit})\`, 'COUPON_USER_LIMIT');
    }
  }

  const minOrder = coupon.minOrderValue ? Number(coupon.minOrderValue) : 0;
  if (subtotal < minOrder) {
    throw AppError.badRequest(\`Minimum order value of ₹\${minOrder} required to apply this coupon\`, 'MIN_ORDER_NOT_MET');
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
`);

// 5. services/product.service.js
write('services/product.service.js', `
import prisma from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import { generateSlug, generateUniqueSlug } from '../utils/slug.js';

export const getProducts = async ({
  category,
  type,
  search,
  minPrice,
  maxPrice,
  isFeatured,
  isPopular,
  isFreshCatch,
  sort = 'popular',
  page = 1,
  limit = 20,
  includeAllStatus = false,
}) => {
  const where = {
    ...(includeAllStatus ? {} : { status: 'ACTIVE' }),
    ...(type && { type }),
    ...(isFeatured !== undefined && { isFeatured }),
    ...(isPopular !== undefined && { isPopular }),
    ...(isFreshCatch !== undefined && { isFreshCatch }),
  };

  if (category && category !== 'all') {
    where.OR = [
      { categoryId: category },
      { category: { slug: category } },
    ];
  }

  if (search) {
    where.AND = [
      ...(where.AND || []),
      {
        OR: [
          { name: { contains: search } },
          { localName: { contains: search } },
          { description: { contains: search } },
        ],
      },
    ];
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.basePrice = {
      ...(minPrice !== undefined && { gte: minPrice }),
      ...(maxPrice !== undefined && { lte: maxPrice }),
    };
  }

  let orderBy = { createdAt: 'desc' };
  if (sort === 'price_asc') orderBy = { basePrice: 'asc' };
  else if (sort === 'price_desc') orderBy = { basePrice: 'desc' };
  else if (sort === 'rating') orderBy = { rating: 'desc' };
  else if (sort === 'popular') orderBy = [{ isPopular: 'desc' }, { rating: 'desc' }];
  else if (sort === 'newest') orderBy = { createdAt: 'desc' };

  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        category: { select: { id: true, name: true, tamilName: true, slug: true } },
        images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
        variants: {
          where: { isAvailable: true },
          include: { inventory: { select: { availableQuantity: true, lowStockThreshold: true } } },
          orderBy: { price: 'asc' },
        },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getProductBySlug = async (slug) => {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
      variants: {
        where: { isAvailable: true },
        include: { inventory: { select: { availableQuantity: true, lowStockThreshold: true } } },
        orderBy: { sortOrder: 'asc' },
      },
      reviews: {
        where: { status: 'APPROVED' },
        include: { user: { select: { firstName: true, lastName: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });
  if (!product) throw AppError.notFound('Product not found', 'PRODUCT_NOT_FOUND');
  return product;
};

export const getFeaturedProducts = async () => prisma.product.findMany({
  where: { status: 'ACTIVE', isFeatured: true },
  take: 8,
  include: {
    images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
    variants: { where: { isAvailable: true }, take: 1 },
    category: { select: { name: true, slug: true } },
  },
});

export const getPopularProducts = async () => prisma.product.findMany({
  where: { status: 'ACTIVE', isPopular: true },
  take: 10,
  include: {
    images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
    variants: { where: { isAvailable: true }, take: 1 },
    category: { select: { name: true, slug: true } },
  },
});

export const createProduct = async (data) => {
  const { variants, ...productData } = data;
  const checkSlugExists = async (slug) => {
    const existing = await prisma.product.findUnique({ where: { slug } });
    return !!existing;
  };
  const slug = productData.slug || (await generateUniqueSlug(productData.name, checkSlugExists));

  return prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: { ...productData, slug },
    });

    if (variants && variants.length > 0) {
      for (const variant of variants) {
        const { initialStock = 20, ...variantFields } = variant;
        const createdVariant = await tx.productVariant.create({
          data: { ...variantFields, productId: product.id },
        });

        await tx.inventory.create({
          data: {
            productVariantId: createdVariant.id,
            availableQuantity: initialStock,
            lowStockThreshold: 5,
          },
        });
      }
    }

    return tx.product.findUnique({
      where: { id: product.id },
      include: { category: true, variants: { include: { inventory: true } }, images: true },
    });
  });
};

export const updateProduct = async (id, data) => {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) throw AppError.notFound('Product not found', 'PRODUCT_NOT_FOUND');
  return prisma.product.update({
    where: { id },
    data,
    include: { category: true, variants: { include: { inventory: true } }, images: true },
  });
};

export const archiveProduct = async (id) => prisma.product.update({ where: { id }, data: { status: 'ARCHIVED' } });
`);

// 6. services/cart.service.js
write('services/cart.service.js', `
import prisma from '../config/db.js';
import { AppError } from '../utils/AppError.js';

export const getOrCreateCart = async (userId) => {
  let cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) cart = await prisma.cart.create({ data: { userId } });
  return cart;
};

export const getCart = async (userId) => {
  const cart = await getOrCreateCart(userId);
  const cartWithItems = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: {
      items: {
        include: {
          productVariant: {
            include: {
              product: { include: { images: { where: { isPrimary: true }, take: 1 } } },
              inventory: { select: { availableQuantity: true } },
            },
          },
        },
      },
    },
  });

  let subtotal = 0;
  const items = cartWithItems.items.map((item) => {
    const variant = item.productVariant;
    const price = Number(variant.price);
    const itemSubtotal = price * item.quantity;
    subtotal += itemSubtotal;

    return {
      id: item.id,
      variantId: variant.id,
      productId: variant.productId,
      name: variant.product.name,
      localName: variant.product.localName,
      sku: variant.sku,
      image: variant.product.images[0]?.publicUrl || null,
      cutType: variant.cutType,
      cleaningOption: variant.cleaningOption,
      weightValue: variant.weightValue,
      weightUnit: variant.weightUnit,
      unitPrice: price,
      quantity: item.quantity,
      subtotal: itemSubtotal,
      availableStock: variant.inventory?.availableQuantity ?? 0,
      isAvailable: variant.isAvailable && variant.product.status === 'ACTIVE',
    };
  });

  return {
    cartId: cart.id,
    items,
    itemCount: items.reduce((acc, curr) => acc + curr.quantity, 0),
    subtotal,
  };
};

export const addItem = async (userId, variantId, quantity = 1) => {
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    include: { product: true, inventory: true },
  });

  if (!variant || !variant.isAvailable || variant.product.status !== 'ACTIVE') {
    throw AppError.badRequest('This product variant is currently unavailable', 'VARIANT_UNAVAILABLE');
  }

  if (variant.inventory && variant.inventory.availableQuantity < quantity) {
    throw AppError.badRequest(\`Only \${variant.inventory.availableQuantity} items available in stock\`, 'INSUFFICIENT_STOCK');
  }

  const cart = await getOrCreateCart(userId);
  const existingItem = await prisma.cartItem.findUnique({
    where: { cartId_productVariantId: { cartId: cart.id, productVariantId: variantId } },
  });

  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;
    if (variant.inventory && variant.inventory.availableQuantity < newQuantity) {
      throw AppError.badRequest(\`Cannot add more. Only \${variant.inventory.availableQuantity} items in stock\`, 'INSUFFICIENT_STOCK');
    }
    await prisma.cartItem.update({ where: { id: existingItem.id }, data: { quantity: newQuantity } });
  } else {
    await prisma.cartItem.create({ data: { cartId: cart.id, productVariantId: variantId, quantity } });
  }

  return getCart(userId);
};

export const updateItem = async (userId, itemId, quantity) => {
  const cart = await getOrCreateCart(userId);
  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, cartId: cart.id },
    include: { productVariant: { include: { inventory: true } } },
  });

  if (!item) throw AppError.notFound('Item not found in cart', 'ITEM_NOT_FOUND');

  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: itemId } });
  } else {
    const available = item.productVariant.inventory?.availableQuantity ?? 0;
    if (available < quantity) throw AppError.badRequest(\`Only \${available} items in stock\`, 'INSUFFICIENT_STOCK');
    await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
  }
  return getCart(userId);
};

export const removeItem = async (userId, itemId) => {
  const cart = await getOrCreateCart(userId);
  const item = await prisma.cartItem.findFirst({ where: { id: itemId, cartId: cart.id } });
  if (!item) throw AppError.notFound('Item not found in cart', 'ITEM_NOT_FOUND');
  await prisma.cartItem.delete({ where: { id: itemId } });
  return getCart(userId);
};

export const clearCart = async (userId) => {
  const cart = await getOrCreateCart(userId);
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  return { message: 'Cart cleared successfully' };
};
`);

// 7. services/order.service.js
write('services/order.service.js', `
import prisma from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import { ORDER_STATUS, isValidTransition } from '../constants/orderStatus.js';
import { calculateDeliveryCharge } from './delivery.service.js';
import { validateCoupon } from './coupon.service.js';

const generateOrderNumber = () => {
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const random = Math.floor(1000 + Math.random() * 9000);
  return \`V2S-\${dateStr}-\${random}\`;
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
      throw AppError.badRequest(\`Product "\${variant?.product?.name || 'Item'}" is currently unavailable\`, 'ITEM_UNAVAILABLE');
    }
    const available = variant.inventory?.availableQuantity ?? 0;
    if (available < item.quantity) {
      throw AppError.badRequest(\`Insufficient stock for "\${variant.product.name}". Only \${available} available\`, 'INSUFFICIENT_STOCK');
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
          notes: \`Reserved for order \${orderNumber}\`,
        },
      });
    }

    if (validatedCoupon) {
      await tx.couponUsage.create({ data: { couponId: validatedCoupon.couponId, userId } });
      await tx.coupon.update({ where: { id: validatedCoupon.couponId }, data: { usedCount: { increment: 1 } } });
    }

    const addressSnapshotStr = JSON.stringify({
      name: deliveryAddress.name || \`\${user.firstName} \${user.lastName || ''}\`.trim(),
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
        customerNameSnapshot: deliveryAddress.name || \`\${user.firstName} \${user.lastName || ''}\`.trim(),
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
          variantNameSnapshot: \`\${variant.weightValue || ''}\${variant.weightUnit || ''} \${variant.cutType || ''}\`.trim(),
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
    throw AppError.badRequest(\`Cannot transition order from \${order.status} to \${newStatus}\`, 'INVALID_STATUS_TRANSITION');
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
    throw AppError.badRequest(\`Cannot cancel order with status \${order.status}\`, 'CANNOT_CANCEL');
  }
  return updateOrderStatus(orderId, ORDER_STATUS.CANCELLED, null);
};
`);

// 8. services/review.service.js
write('services/review.service.js', `
import prisma from '../config/db.js';
import { AppError } from '../utils/AppError.js';

const recalculateProductRating = async (productId) => {
  const aggregate = await prisma.review.aggregate({
    where: { productId, status: 'APPROVED' },
    _avg: { rating: true },
    _count: { rating: true },
  });

  const avgRating = aggregate._avg.rating ? Math.round(aggregate._avg.rating * 10) / 10 : null;
  const count = aggregate._count.rating || 0;

  await prisma.product.update({
    where: { id: productId },
    data: { rating: avgRating, reviewsCount: count },
  });
};

export const createReview = async ({ userId, productId, rating, title, comment }) => {
  const existing = await prisma.review.findUnique({
    where: { productId_userId: { productId, userId } },
  });
  if (existing) throw AppError.conflict('Review already submitted', 'REVIEW_EXISTS');

  const review = await prisma.review.create({
    data: { userId, productId, rating, title: title || null, comment: comment || null, status: 'APPROVED' },
  });
  await recalculateProductRating(productId);
  return review;
};

export const getProductReviews = async (productId, { page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;
  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { productId, status: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: { user: { select: { firstName: true, lastName: true } } },
    }),
    prisma.review.count({ where: { productId, status: 'APPROVED' } }),
  ]);
  return { reviews, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const getAllReviewsAdmin = async ({ status, page = 1, limit = 20 }) => {
  const where = status ? { status } : {};
  const skip = (page - 1) * limit;
  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        product: { select: { name: true, slug: true } },
      },
    }),
    prisma.review.count({ where }),
  ]);
  return { reviews, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const updateReviewStatus = async (reviewId, status) => {
  const review = await prisma.review.update({ where: { id: reviewId }, data: { status } });
  await recalculateProductRating(review.productId);
  return review;
};
`);

// 9. services/banner.service.js
write('services/banner.service.js', `
import prisma from '../config/db.js';

export const getActiveBanners = async (placement = 'home_hero') => prisma.banner.findMany({
  where: { isActive: true, placement },
  orderBy: { sortOrder: 'asc' },
});
export const getAllBanners = async () => prisma.banner.findMany({ orderBy: [{ placement: 'asc' }, { sortOrder: 'asc' }] });
export const createBanner = async (data) => prisma.banner.create({ data });
export const updateBanner = async (id, data) => prisma.banner.update({ where: { id }, data });
export const deleteBanner = async (id) => prisma.banner.delete({ where: { id } });
`);

// 10. services/admin.service.js
write('services/admin.service.js', `
import prisma from '../config/db.js';
import { AppError } from '../utils/AppError.js';

export const getDashboardStats = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    todayOrders,
    todayRevenueAgg,
    pendingOrdersCount,
    processingOrdersCount,
    deliveredOrdersCount,
    totalCustomers,
    totalProducts,
    recentOrders,
    lowStockVariants,
  ] = await Promise.all([
    prisma.order.count({ where: { createdAt: { gte: today } } }),
    prisma.order.aggregate({
      where: { createdAt: { gte: today }, paymentStatus: 'PAID' },
      _sum: { total: true },
    }),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.order.count({ where: { status: 'PROCESSING' } }),
    prisma.order.count({ where: { status: 'DELIVERED' } }),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.product.count({ where: { status: 'ACTIVE' } }),
    prisma.order.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        orderNumber: true,
        customerNameSnapshot: true,
        total: true,
        status: true,
        paymentStatus: true,
        createdAt: true,
      },
    }),
    prisma.inventory.findMany({
      where: { availableQuantity: { lte: 5 } },
      take: 10,
      include: {
        productVariant: {
          include: { product: { select: { name: true, slug: true } } },
        },
      },
    }),
  ]);

  return {
    todayOrders,
    todayRevenue: Number(todayRevenueAgg._sum.total || 0),
    pendingOrdersCount,
    processingOrdersCount,
    deliveredOrdersCount,
    totalCustomers,
    totalProducts,
    recentOrders,
    lowStockVariants: lowStockVariants.map((item) => ({
      id: item.id,
      variantId: item.productVariantId,
      productName: item.productVariant.product.name,
      sku: item.productVariant.sku,
      availableQuantity: item.availableQuantity,
      lowStockThreshold: item.lowStockThreshold,
    })),
  };
};

export const getCustomersAdmin = async ({ search, page = 1, limit = 20 }) => {
  const where = { role: 'CUSTOMER' };
  if (search) {
    where.OR = [
      { email: { contains: search } },
      { firstName: { contains: search } },
      { lastName: { contains: search } },
      { phone: { contains: search } },
    ];
  }
  const skip = (page - 1) * limit;
  const [customers, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
        _count: { select: { orders: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return { customers, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const updateCustomerStatus = async (id, isActive, adminId) => prisma.user.update({
  where: { id },
  data: { isActive },
  select: { id: true, email: true, isActive: true },
});

export const getInventoryAdmin = async ({ lowStockOnly = false, page = 1, limit = 25 }) => {
  const where = lowStockOnly ? { availableQuantity: { lte: 5 } } : {};
  const skip = (page - 1) * limit;

  const [inventoryList, total] = await Promise.all([
    prisma.inventory.findMany({
      where,
      skip,
      take: limit,
      include: {
        productVariant: {
          include: { product: { select: { id: true, name: true, slug: true } } },
        },
      },
      orderBy: { availableQuantity: 'asc' },
    }),
    prisma.inventory.count({ where }),
  ]);

  return {
    inventory: inventoryList.map((item) => ({
      id: item.id,
      variantId: item.productVariantId,
      productName: item.productVariant.product.name,
      productId: item.productVariant.product.id,
      sku: item.productVariant.sku,
      price: Number(item.productVariant.price),
      availableQuantity: item.availableQuantity,
      reservedQuantity: item.reservedQuantity,
      soldQuantity: item.soldQuantity,
      lowStockThreshold: item.lowStockThreshold,
      isLowStock: item.availableQuantity <= item.lowStockThreshold,
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

export const adjustInventory = async (variantId, { quantity, notes }, adminId) => {
  const currentInv = await prisma.inventory.findUnique({ where: { productVariantId: variantId } });
  if (!currentInv) throw AppError.notFound('Inventory record not found', 'INVENTORY_NOT_FOUND');
  const newQuantity = currentInv.availableQuantity + quantity;
  if (newQuantity < 0) throw AppError.badRequest('Available stock cannot be negative', 'NEGATIVE_STOCK');

  return prisma.$transaction(async (tx) => {
    return tx.inventory.update({
      where: { productVariantId: variantId },
      data: { availableQuantity: newQuantity },
    });
  });
};

export const getAuditLogs = async ({ page = 1, limit = 30 }) => {
  const skip = (page - 1) * limit;
  const [logs, total] = await Promise.all([
    prisma.adminLog.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { admin: { select: { id: true, firstName: true, lastName: true, email: true } } },
    }),
    prisma.adminLog.count(),
  ]);
  return { logs, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};
`);

console.log('Part 2 complete!');
