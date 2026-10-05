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

export const syncCatalogItems = async (items = [], categories = []) => {
  let syncedCategories = 0;
  let syncedProducts = 0;

  for (const cat of categories) {
    if (cat.id && cat.id !== 'all') {
      await prisma.category.upsert({
        where: { slug: cat.id },
        update: {
          name: cat.name,
          tamilName: cat.tamil || null,
          icon: cat.icon || null,
        },
        create: {
          id: cat.id,
          name: cat.name,
          tamilName: cat.tamil || null,
          slug: cat.id,
          icon: cat.icon || null,
          isActive: true,
        },
      });
      syncedCategories++;
    }
  }

  for (const item of items) {
    if (!item.slug || !item.name) continue;

    let productType = 'RAW';
    const rawType = (item.type || '').toLowerCase();
    if (rawType === 'kitchen') productType = 'KITCHEN';
    else if (rawType === 'ready-to-cook') productType = 'READY_TO_COOK';

    const targetSlug = (item.category === 'all' || !item.category) ? 'sea-fish' : item.category;
    let categoryRecord = await prisma.category.findUnique({ where: { slug: targetSlug } });
    if (!categoryRecord) {
      categoryRecord = await prisma.category.create({
        data: {
          id: targetSlug,
          slug: targetSlug,
          name: targetSlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          isActive: true,
        },
      });
    }
    const categoryId = categoryRecord.id;

    const product = await prisma.product.upsert({
      where: { slug: item.slug },
      update: {
        name: item.name,
        localName: item.localName || null,
        categoryId: categoryId,
        type: productType,
        basePrice: Number(item.price || 0),
        grossWeight: item.grossWeight || null,
        netWeight: item.netWeight || null,
        serves: item.serves || null,
        harborSource: item.harborSource || null,
        storageTemp: item.storageTemp || null,
        cookingTips: item.cookingTips || null,
        badge: item.badge || null,
        isFreshCatch: !!item.isFreshCatch,
        isPopular: !!item.isPopular,
        isFeatured: !!item.isFeatured,
        rating: item.rating ? Number(item.rating) : null,
        reviewsCount: item.reviewsCount || 0,
        description: item.description || null,
      },
      create: {
        slug: item.slug,
        name: item.name,
        localName: item.localName || null,
        categoryId: categoryId,
        type: productType,
        basePrice: Number(item.price || 0),
        grossWeight: item.grossWeight || null,
        netWeight: item.netWeight || null,
        serves: item.serves || null,
        harborSource: item.harborSource || null,
        storageTemp: item.storageTemp || null,
        cookingTips: item.cookingTips || null,
        badge: item.badge || null,
        isFreshCatch: !!item.isFreshCatch,
        isPopular: !!item.isPopular,
        isFeatured: !!item.isFeatured,
        rating: item.rating ? Number(item.rating) : null,
        reviewsCount: item.reviewsCount || 0,
        description: item.description || null,
        status: 'ACTIVE',
      },
    });

    if (item.image) {
      const existingImg = await prisma.productImage.findFirst({
        where: { productId: product.id },
      });
      if (!existingImg) {
        await prisma.productImage.create({
          data: {
            productId: product.id,
            r2Key: `products/${product.id}/default.webp`,
            publicUrl: item.image,
            isPrimary: true,
            altText: item.name,
          },
        });
      } else {
        await prisma.productImage.update({
          where: { id: existingImg.id },
          data: { publicUrl: item.image },
        });
      }
    }

    const defaultSku = `${item.slug.toUpperCase().slice(0, 16)}-STD`;
    const variant = await prisma.productVariant.upsert({
      where: { sku: defaultSku },
      update: {
        price: Number(item.price || 0),
        compareAtPrice: item.mrp ? Number(item.mrp) : null,
      },
      create: {
        productId: product.id,
        sku: defaultSku,
        cutType: item.defaultCleaning ? 'FRY_CUT' : 'WHOLE',
        cleaningOption: item.defaultCleaning || null,
        price: Number(item.price || 0),
        compareAtPrice: item.mrp ? Number(item.mrp) : null,
        isAvailable: true,
      },
    });

    await prisma.inventory.upsert({
      where: { productVariantId: variant.id },
      update: {},
      create: {
        productVariantId: variant.id,
        availableQuantity: 40,
        lowStockThreshold: 5,
      },
    });

    syncedProducts++;
  }

  return {
    syncedCategories,
    syncedProducts,
    message: `Successfully synchronized ${syncedProducts} products and ${syncedCategories} categories into MySQL`,
  };
};
