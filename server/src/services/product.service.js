import prisma from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import { generateSlug, generateUniqueSlug } from '../utils/slug.js';

export const ALL_CUT_IDS = [
  'full-piece-uncut',
  'curry-cut',
  'fry-cut',
  'whole-cleaned',
  'fillet',
  'prawns-peeled',
  'prawns-whole',
  'crab-cleaned',
  'crab-whole',
  'squid-rings',
];

export const enrichProductWithVariantsAndCuts = (product) => {
  if (!product) return product;

  let cleaningOptions = [];
  let cutPrices = {};
  let cutAvailability = null;
  let hasExplicitCutConfig = false;

  // 1. Try to read from seoDescription if stored as JSON
  if (product.seoDescription) {
    try {
      const parsed = JSON.parse(product.seoDescription);
      if (parsed && typeof parsed === 'object') {
        if (parsed.cutAvailability && typeof parsed.cutAvailability === 'object') {
          cutAvailability = parsed.cutAvailability;
          cleaningOptions = Object.keys(cutAvailability).filter((k) => cutAvailability[k] === true);
          hasExplicitCutConfig = true;
        } else if (Array.isArray(parsed.cleaningOptions)) {
          cleaningOptions = parsed.cleaningOptions;
          hasExplicitCutConfig = true;
        }
        if (parsed.cutPrices && typeof parsed.cutPrices === 'object') {
          cutPrices = parsed.cutPrices;
        }
      }
    } catch (e) {}
  }

  // 2. If not explicitly configured in seoDescription, check variants
  if (!hasExplicitCutConfig && Array.isArray(product.variants) && product.variants.length > 0) {
    const varCuts = product.variants
      .filter((v) => v.isAvailable && v.cleaningOption)
      .map((v) => v.cleaningOption);
    if (varCuts.length > 0) {
      cleaningOptions = [...new Set(varCuts)];
      hasExplicitCutConfig = true;
    }
    product.variants.forEach((v) => {
      if (v.cleaningOption && v.isAvailable) {
        cutPrices[v.cleaningOption] = Number(v.price);
      }
    });
  }

  // 3. Fallback: Sensible category/name defaults for raw products ONLY if no explicit config exists
  if (!hasExplicitCutConfig && cleaningOptions.length === 0 && (product.type === 'RAW' || !product.type)) {
    const catSlug = (
      (typeof product.category === 'object' ? product.category?.slug : product.category) ||
      product.categoryId ||
      ''
    ).toLowerCase();
    const nameLower = (product.name || '').toLowerCase();

    if (catSlug.includes('prawn') || nameLower.includes('prawn') || nameLower.includes('shrimp')) {
      cleaningOptions = ['whole-cleaned', 'prawns-peeled', 'prawns-whole'];
    } else if (catSlug.includes('crab') || nameLower.includes('crab') || nameLower.includes('nandu')) {
      cleaningOptions = ['crab-whole', 'crab-cleaned'];
    } else if (catSlug.includes('squid') || nameLower.includes('squid') || nameLower.includes('calamari') || nameLower.includes('kanava')) {
      cleaningOptions = ['whole-cleaned', 'squid-rings'];
    } else {
      cleaningOptions = ['full-piece-uncut', 'curry-cut', 'fry-cut', 'whole-cleaned', 'fillet'];
    }
  }

  // 4. Guarantee cutAvailability object with true/false booleans for all 10 cut options
  if (!cutAvailability || typeof cutAvailability !== 'object') {
    cutAvailability = {};
    const enabledSet = new Set(cleaningOptions);
    ALL_CUT_IDS.forEach((id) => {
      cutAvailability[id] = enabledSet.has(id);
    });
  } else {
    const normalizedAvailability = {};
    ALL_CUT_IDS.forEach((id) => {
      normalizedAvailability[id] = Boolean(cutAvailability[id]);
    });
    cutAvailability = normalizedAvailability;
  }

  const primaryImage = Array.isArray(product.images)
    ? (product.images.find((img) => img.isPrimary) || product.images[0])
    : null;
  const image = primaryImage?.publicUrl || product.image || null;

  return {
    ...product,
    image,
    cleaningOptions,
    cutPrices,
    cutAvailability,
  };
};

export const getProducts = async ({
  category,
  type,
  status,
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
  const isAllStatus = includeAllStatus === true || includeAllStatus === 'true';
  const where = {
    ...(type && { type }),
    ...(isFeatured !== undefined && { isFeatured }),
    ...(isPopular !== undefined && { isPopular }),
    ...(isFreshCatch !== undefined && { isFreshCatch }),
  };

  if (status && status !== 'ALL') {
    where.status = status;
  } else if (!isAllStatus) {
    where.status = 'ACTIVE';
  }

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

  const numPage = Math.max(1, Number(page) || 1);
  const numLimit = Math.max(1, Number(limit) || 20);
  const skip = (numPage - 1) * numLimit;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: numLimit,
      include: {
        category: { select: { id: true, name: true, tamilName: true, slug: true } },
        images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
        variants: {
          ...(isAllStatus ? {} : { where: { isAvailable: true } }),
          include: { inventory: { select: { availableQuantity: true, lowStockThreshold: true } } },
          orderBy: { price: 'asc' },
        },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products: products.map(enrichProductWithVariantsAndCuts),
    pagination: {
      page: numPage,
      limit: numLimit,
      total,
      totalPages: Math.ceil(total / numLimit),
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
  return enrichProductWithVariantsAndCuts(product);
};

export const getFeaturedProducts = async () => {
  const items = await prisma.product.findMany({
    where: { status: 'ACTIVE', isFeatured: true },
    take: 8,
    include: {
      images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
      variants: { where: { isAvailable: true } },
      category: { select: { name: true, slug: true } },
    },
  });
  return items.map(enrichProductWithVariantsAndCuts);
};

export const getPopularProducts = async () => {
  const items = await prisma.product.findMany({
    where: { status: 'ACTIVE', isPopular: true },
    take: 10,
    include: {
      images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
      variants: { where: { isAvailable: true } },
      category: { select: { name: true, slug: true } },
    },
  });
  return items.map(enrichProductWithVariantsAndCuts);
};

export const createProduct = async (data) => {
  const { 
    variants, 
    imageUrl, 
    images,
    initialStock = 30, 
    compareAtPrice, 
    categoryId, 
    cutPrices, 
    cleaningOptions, 
    cutAvailability,
    ...productData 
  } = data;
  const checkSlugExists = async (slug) => {
    const existing = await prisma.product.findUnique({ where: { slug } });
    return !!existing;
  };
  const slug = productData.slug || (await generateUniqueSlug(productData.name, checkSlugExists));

  // Ensure category exists
  let finalCategoryId = categoryId || 'sea-fish';
  const targetCat = await prisma.category.findFirst({
    where: { OR: [{ id: finalCategoryId }, { slug: finalCategoryId }] },
  });
  if (targetCat) finalCategoryId = targetCat.id;

  return prisma.$transaction(async (tx) => {
    let finalCutAvailability = null;
    let finalCleaningOptions = [];

    if (cutAvailability && typeof cutAvailability === 'object') {
      finalCutAvailability = {};
      ALL_CUT_IDS.forEach((id) => {
        finalCutAvailability[id] = Boolean(cutAvailability[id]);
      });
      finalCleaningOptions = ALL_CUT_IDS.filter((id) => finalCutAvailability[id]);
    } else if (Array.isArray(cleaningOptions)) {
      finalCutAvailability = {};
      const enabledSet = new Set(cleaningOptions);
      ALL_CUT_IDS.forEach((id) => {
        finalCutAvailability[id] = enabledSet.has(id);
      });
      finalCleaningOptions = cleaningOptions;
    }

    if (finalCutAvailability !== null) {
      productData.seoDescription = JSON.stringify({
        cutAvailability: finalCutAvailability,
        cleaningOptions: finalCleaningOptions,
        cutPrices: cutPrices || {},
      });
    }

    const product = await tx.product.create({
      data: { ...productData, categoryId: finalCategoryId, slug },
    });

    // Handle multiple images or single imageUrl
    const imageList = Array.isArray(images) && images.length > 0 
      ? images 
      : (imageUrl ? [imageUrl] : []);

    for (let i = 0; i < imageList.length; i++) {
      const img = imageList[i];
      const url = typeof img === 'string' ? img : (img.publicUrl || img.url);
      if (url && url.trim()) {
        const isPrimary = typeof img === 'object' && img.isPrimary !== undefined ? Boolean(img.isPrimary) : i === 0;
        const imgKey = (typeof img === 'object' && img.r2Key) ? img.r2Key : `products/${product.id}/${i}.webp`;
        await tx.productImage.create({
          data: {
            productId: product.id,
            r2Key: imgKey,
            publicUrl: url.trim(),
            isPrimary,
            sortOrder: i,
            altText: (typeof img === 'object' && img.altText) ? img.altText : product.name,
          },
        });
      }
    }

    if (variants && variants.length > 0) {
      for (const variant of variants) {
        const { initialStock: varStock = 20, ...variantFields } = variant;
        const createdVariant = await tx.productVariant.create({
          data: { ...variantFields, productId: product.id },
        });

        await tx.inventory.create({
          data: {
            productVariantId: createdVariant.id,
            availableQuantity: varStock,
            lowStockThreshold: 5,
          },
        });
      }
    } else if (finalCleaningOptions.length > 0) {
      for (const cutId of finalCleaningOptions) {
        const price = cutPrices?.[cutId] !== undefined && cutPrices[cutId] !== ''
          ? Number(cutPrices[cutId])
          : Number(productData.basePrice);
        const skuBase = slug.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
        const cutSku = cutId.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
        const randId = Math.random().toString(36).substring(2, 6).toUpperCase();
        const sku = `${skuBase}-${cutSku}-${randId}`;

        const createdVariant = await tx.productVariant.create({
          data: {
            productId: product.id,
            sku,
            cutType: 'WHOLE',
            cleaningOption: cutId,
            price,
            compareAtPrice: compareAtPrice || null,
            isAvailable: true,
          },
        });

        await tx.inventory.create({
          data: {
            productVariantId: createdVariant.id,
            availableQuantity: Number(initialStock) || 30,
            lowStockThreshold: 5,
          },
        });
      }
    } else {
      const defaultSku = `${slug.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 14)}-STD`;
      const createdVariant = await tx.productVariant.create({
        data: {
          productId: product.id,
          sku: defaultSku,
          cutType: 'WHOLE',
          price: productData.basePrice,
          compareAtPrice: compareAtPrice || null,
          isAvailable: true,
        },
      });

      await tx.inventory.create({
        data: {
          productVariantId: createdVariant.id,
          availableQuantity: initialStock,
          lowStockThreshold: 5,
        },
      });
    }

    const created = await tx.product.findUnique({
      where: { id: product.id },
      include: { category: true, variants: { include: { inventory: true } }, images: true },
    });
    return enrichProductWithVariantsAndCuts(created);
  });
};

export const updateProduct = async (id, data) => {
  const existing = await prisma.product.findUnique({
    where: { id },
    include: { variants: { include: { inventory: true } } },
  });
  if (!existing) throw AppError.notFound('Product not found', 'PRODUCT_NOT_FOUND');

  const {
    imageUrl,
    images,
    compareAtPrice,
    initialStock,
    categoryId,
    variants,
    cutPrices,
    cleaningOptions,
    cutAvailability,
    ...updateFields
  } = data;

  // Handle category connection if categoryId is provided
  if (categoryId) {
    const targetCat = await prisma.category.findFirst({
      where: { OR: [{ id: categoryId }, { slug: categoryId }] },
    });
    if (targetCat) {
      updateFields.category = { connect: { id: targetCat.id } };
    }
  }

  // Handle Image update/create/delete
  if (images !== undefined && Array.isArray(images)) {
    await prisma.productImage.deleteMany({
      where: { productId: id },
    });
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const url = typeof img === 'string' ? img : (img.publicUrl || img.url);
      if (url && url.trim()) {
        const isPrimary = typeof img === 'object' && img.isPrimary !== undefined ? Boolean(img.isPrimary) : i === 0;
        const imgKey = (typeof img === 'object' && img.r2Key) ? img.r2Key : `products/${id}/${i}.webp`;
        await prisma.productImage.create({
          data: {
            productId: id,
            r2Key: imgKey,
            publicUrl: url.trim(),
            isPrimary,
            sortOrder: i,
            altText: (typeof img === 'object' && img.altText) ? img.altText : (updateFields.name || existing.name),
          },
        });
      }
    }
  } else if (imageUrl === '') {
    await prisma.productImage.deleteMany({
      where: { productId: id },
    });
  } else if (imageUrl) {
    const primaryImg = await prisma.productImage.findFirst({
      where: { productId: id, isPrimary: true },
    });
    if (primaryImg) {
      await prisma.productImage.update({
        where: { id: primaryImg.id },
        data: { publicUrl: imageUrl },
      });
    } else {
      await prisma.productImage.create({
        data: {
          productId: id,
          r2Key: `products/${id}/main.webp`,
          publicUrl: imageUrl,
          isPrimary: true,
          altText: updateFields.name || existing.name,
        },
      });
    }
  }

  // Handle primary variant and inventory updates if compareAtPrice, basePrice, or initialStock changed
  const primaryVariant = existing.variants?.[0];
  if (primaryVariant) {
    const variantData = {};
    if (compareAtPrice !== undefined) variantData.compareAtPrice = compareAtPrice ? Number(compareAtPrice) : null;
    if (updateFields.basePrice !== undefined) variantData.price = Number(updateFields.basePrice);

    if (Object.keys(variantData).length > 0) {
      await prisma.productVariant.update({
        where: { id: primaryVariant.id },
        data: variantData,
      });
    }

    if (initialStock !== undefined && primaryVariant.inventory) {
      await prisma.inventory.update({
        where: { id: primaryVariant.inventory.id },
        data: { availableQuantity: Number(initialStock) },
      });
    } else if (initialStock !== undefined && !primaryVariant.inventory) {
      await prisma.inventory.create({
        data: {
          productVariantId: primaryVariant.id,
          availableQuantity: Number(initialStock),
          lowStockThreshold: 5,
        },
      });
    }
  }

  // Handle cleaningOptions and cutAvailability and cutPrices sync
  if (cutAvailability !== undefined || cleaningOptions !== undefined) {
    let finalCutAvailability = {};
    let finalCleaningOptions = [];

    if (cutAvailability && typeof cutAvailability === 'object') {
      ALL_CUT_IDS.forEach((cId) => {
        finalCutAvailability[cId] = Boolean(cutAvailability[cId]);
      });
      finalCleaningOptions = ALL_CUT_IDS.filter((cId) => finalCutAvailability[cId]);
    } else if (Array.isArray(cleaningOptions)) {
      const enabledSet = new Set(cleaningOptions);
      ALL_CUT_IDS.forEach((cId) => {
        finalCutAvailability[cId] = enabledSet.has(cId);
      });
      finalCleaningOptions = cleaningOptions;
    }

    updateFields.seoDescription = JSON.stringify({
      cutAvailability: finalCutAvailability,
      cleaningOptions: finalCleaningOptions,
      cutPrices: cutPrices || {},
    });

    const targetBasePrice = updateFields.basePrice !== undefined ? Number(updateFields.basePrice) : Number(existing.basePrice);
    const existingVariants = existing.variants || [];

    // Mark variants that are not selected in finalCleaningOptions as unavailable
    for (const v of existingVariants) {
      if (v.cleaningOption && !finalCleaningOptions.includes(v.cleaningOption)) {
        await prisma.productVariant.update({
          where: { id: v.id },
          data: { isAvailable: false },
        });
      }
    }

    // Upsert variant for each selected cleaning option
    for (const cutId of finalCleaningOptions) {
      const cutP = cutPrices?.[cutId] !== undefined && cutPrices[cutId] !== '' 
        ? Number(cutPrices[cutId]) 
        : targetBasePrice;
      const matched = existingVariants.find((v) => v.cleaningOption === cutId);

      if (matched) {
        await prisma.productVariant.update({
          where: { id: matched.id },
          data: {
            price: cutP,
            isAvailable: true,
            ...(compareAtPrice !== undefined ? { compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null } : {}),
          },
        });
      } else {
        const skuBase = (existing.slug || 'SEAFOOD').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
        const cutSku = cutId.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
        const randId = Math.random().toString(36).substring(2, 6).toUpperCase();
        const sku = `${skuBase}-${cutSku}-${randId}`;

        const createdV = await prisma.productVariant.create({
          data: {
            productId: id,
            sku,
            cutType: 'WHOLE',
            cleaningOption: cutId,
            price: cutP,
            compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
            isAvailable: true,
          },
        });

        await prisma.inventory.create({
          data: {
            productVariantId: createdV.id,
            availableQuantity: Number(initialStock) || 30,
            lowStockThreshold: 5,
          },
        });
      }
    }

    // Ensure a standard fallback variant is available if all cleaning options are disabled
    if (finalCleaningOptions.length === 0) {
      const hasBaseVariant = existingVariants.some((v) => !v.cleaningOption && v.isAvailable);
      if (!hasBaseVariant) {
        const stdVariant = existingVariants.find((v) => !v.cleaningOption);
        if (stdVariant) {
          await prisma.productVariant.update({
            where: { id: stdVariant.id },
            data: { isAvailable: true, price: targetBasePrice },
          });
        } else {
          const defaultSku = `${(existing.slug || 'SEAFOOD').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 14)}-STD`;
          const createdV = await prisma.productVariant.create({
            data: {
              productId: id,
              sku: defaultSku,
              cutType: 'WHOLE',
              price: targetBasePrice,
              compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
              isAvailable: true,
            },
          });
          await prisma.inventory.create({
            data: {
              productVariantId: createdV.id,
              availableQuantity: Number(initialStock) || 30,
              lowStockThreshold: 5,
            },
          });
        }
      }
    }
  }

  const updatedProduct = await prisma.product.update({
    where: { id },
    data: updateFields,
    include: { category: true, variants: { include: { inventory: true } }, images: true },
  });
  return enrichProductWithVariantsAndCuts(updatedProduct);
};

export const deleteProduct = async (id) => {
  const existing = await prisma.product.findUnique({
    where: { id },
    include: { _count: { select: { orderItems: true } } },
  });
  if (!existing) throw AppError.notFound('Product not found', 'PRODUCT_NOT_FOUND');

  if (existing._count.orderItems > 0) {
    await prisma.product.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });
    return {
      success: true,
      archived: true,
      message: `Product "${existing.name}" has past customer orders and was archived/deactivated.`,
    };
  }

  // Cleanup cart items pointing to variants of this product
  await prisma.cartItem.deleteMany({
    where: { productVariant: { productId: id } },
  }).catch(() => {});

  await prisma.product.delete({
    where: { id },
  });

  return {
    success: true,
    deleted: true,
    message: `Product "${existing.name}" permanently removed from database.`,
  };
};

export const archiveProduct = async (id) => deleteProduct(id);

export const bulkUpdateProductStatus = async (ids, status) => {
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    throw AppError.badRequest('Product IDs array is required');
  }
  const allowed = ['ACTIVE', 'INACTIVE', 'ARCHIVED'];
  if (!allowed.includes(status)) {
    throw AppError.badRequest(`Invalid status: ${status}. Must be one of ${allowed.join(', ')}`);
  }

  const res = await prisma.product.updateMany({
    where: { id: { in: ids } },
    data: { status },
  });

  return {
    success: true,
    count: res.count,
    message: `Successfully set ${res.count} product(s) to ${status}.`,
  };
};

export const bulkDeleteProducts = async (ids) => {
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    throw AppError.badRequest('Product IDs array is required');
  }

  const products = await prisma.product.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      name: true,
      _count: { select: { orderItems: true } },
    },
  });

  const idsWithOrders = products.filter((p) => p._count.orderItems > 0).map((p) => p.id);
  const idsWithoutOrders = products.filter((p) => p._count.orderItems === 0).map((p) => p.id);

  let deletedCount = 0;
  let archivedCount = 0;

  if (idsWithoutOrders.length > 0) {
    await prisma.cartItem.deleteMany({
      where: { productVariant: { productId: { in: idsWithoutOrders } } },
    }).catch(() => {});

    const res = await prisma.product.deleteMany({
      where: { id: { in: idsWithoutOrders } },
    });
    deletedCount = res.count;
  }

  if (idsWithOrders.length > 0) {
    const res = await prisma.product.updateMany({
      where: { id: { in: idsWithOrders } },
      data: { status: 'ARCHIVED' },
    });
    archivedCount = res.count;
  }

  return {
    success: true,
    deletedCount,
    archivedCount,
    totalAffected: deletedCount + archivedCount,
    message:
      archivedCount > 0
        ? `Permanently deleted ${deletedCount} product(s). ${archivedCount} product(s) with previous order history were archived.`
        : `Successfully deleted ${deletedCount} product(s) from database.`,
  };
};
