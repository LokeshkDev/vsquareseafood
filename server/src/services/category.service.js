import prisma from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import { generateSlug } from '../utils/slug.js';

const sanitizeCategoryInput = (data) => {
  if (!data) return {};
  const {
    id,
    _id,
    department,
    _count,
    products,
    createdAt,
    updatedAt,
    name,
    tamilName,
    slug,
    icon,
    description,
    image,
    sortOrder,
    isActive,
  } = data;

  const sanitized = {};
  if (name !== undefined) sanitized.name = String(name).trim();
  if (tamilName !== undefined) sanitized.tamilName = tamilName ? String(tamilName).trim() : null;
  if (slug !== undefined) sanitized.slug = String(slug).trim();
  if (icon !== undefined) sanitized.icon = icon ? String(icon).trim() : null;
  if (description !== undefined) sanitized.description = description ? String(description).trim() : null;
  if (image !== undefined) sanitized.image = image ? String(image).trim() : null;
  if (sortOrder !== undefined) sanitized.sortOrder = Number(sortOrder) || 0;
  if (isActive !== undefined) sanitized.isActive = Boolean(isActive);

  return sanitized;
};

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
  const sanitized = sanitizeCategoryInput(data);
  if (!sanitized.name) throw AppError.badRequest('Category name is required', 'NAME_REQUIRED');

  const slug = sanitized.slug || generateSlug(sanitized.name);
  const existing = await prisma.category.findFirst({
    where: {
      OR: [{ id: slug }, { slug: slug }],
    },
  });
  if (existing) throw AppError.conflict('Category with this slug already exists', 'SLUG_EXISTS');

  return prisma.category.create({
    data: {
      ...sanitized,
      slug,
    },
  });
};

export const updateCategory = async (id, data) => {
  const existing = await prisma.category.findFirst({
    where: {
      OR: [{ id }, { slug: id }],
    },
  });
  if (!existing) throw AppError.notFound('Category not found', 'CATEGORY_NOT_FOUND');

  const sanitized = sanitizeCategoryInput(data);
  if (sanitized.name && !sanitized.slug) {
    sanitized.slug = generateSlug(sanitized.name);
  }

  if (sanitized.slug && sanitized.slug !== existing.slug) {
    const slugConflict = await prisma.category.findFirst({
      where: {
        slug: sanitized.slug,
        NOT: { id: existing.id },
      },
    });
    if (slugConflict) {
      throw AppError.conflict('Category with this slug already exists', 'SLUG_EXISTS');
    }
  }

  return prisma.category.update({
    where: { id: existing.id },
    data: sanitized,
  });
};

export const deleteCategory = async (id) => {
  const existing = await prisma.category.findFirst({
    where: {
      OR: [{ id }, { slug: id }],
    },
  });
  if (!existing) throw AppError.notFound('Category not found', 'CATEGORY_NOT_FOUND');

  const productCount = await prisma.product.count({
    where: { categoryId: existing.id },
  });

  if (productCount > 0) {
    const fallbackCategory = await prisma.category.findFirst({
      where: {
        NOT: { id: existing.id },
      },
      orderBy: { sortOrder: 'asc' },
    });

    if (fallbackCategory) {
      await prisma.product.updateMany({
        where: { categoryId: existing.id },
        data: { categoryId: fallbackCategory.id },
      });
    } else {
      await prisma.product.deleteMany({
        where: { categoryId: existing.id },
      });
    }
  }

  await prisma.category.delete({
    where: { id: existing.id },
  });

  return {
    message: `Category "${existing.name}" permanently removed from database.`,
    deleted: true,
  };
};

export const bulkUpdateCategoryActive = async (ids, isActive) => {
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    throw AppError.badRequest('Category IDs array is required');
  }

  const categories = await prisma.category.findMany({
    where: {
      OR: [{ id: { in: ids } }, { slug: { in: ids } }],
    },
    select: { id: true },
  });

  const validIds = categories.map((c) => c.id);
  if (validIds.length === 0) {
    return { success: true, count: 0, message: 'No matching categories found.' };
  }

  const res = await prisma.category.updateMany({
    where: { id: { in: validIds } },
    data: { isActive: Boolean(isActive) },
  });

  return {
    success: true,
    count: res.count,
    message: `Updated ${res.count} category(ies) to ${isActive ? 'Active' : 'Inactive'}.`,
  };
};

export const bulkDeleteCategories = async (ids) => {
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    throw AppError.badRequest('Category IDs array is required');
  }

  const categories = await prisma.category.findMany({
    where: {
      OR: [{ id: { in: ids } }, { slug: { in: ids } }],
    },
    select: { id: true, name: true },
  });

  if (categories.length === 0) {
    return { success: true, count: 0, message: 'No matching categories found.' };
  }

  const targetIds = categories.map((c) => c.id);

  // Check if any categories have products
  const productCount = await prisma.product.count({
    where: { categoryId: { in: targetIds } },
  });

  if (productCount > 0) {
    const fallbackCategory = await prisma.category.findFirst({
      where: { id: { notIn: targetIds } },
      orderBy: { sortOrder: 'asc' },
    });

    if (fallbackCategory) {
      await prisma.product.updateMany({
        where: { categoryId: { in: targetIds } },
        data: { categoryId: fallbackCategory.id },
      });
    }
  }

  const res = await prisma.category.deleteMany({
    where: { id: { in: targetIds } },
  });

  return {
    success: true,
    count: res.count,
    message: `Permanently removed ${res.count} category(ies) from database.`,
  };
};

