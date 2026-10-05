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
    throw AppError.badRequest(`Only ${variant.inventory.availableQuantity} items available in stock`, 'INSUFFICIENT_STOCK');
  }

  const cart = await getOrCreateCart(userId);
  const existingItem = await prisma.cartItem.findUnique({
    where: { cartId_productVariantId: { cartId: cart.id, productVariantId: variantId } },
  });

  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;
    if (variant.inventory && variant.inventory.availableQuantity < newQuantity) {
      throw AppError.badRequest(`Cannot add more. Only ${variant.inventory.availableQuantity} items in stock`, 'INSUFFICIENT_STOCK');
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
    if (available < quantity) throw AppError.badRequest(`Only ${available} items in stock`, 'INSUFFICIENT_STOCK');
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
