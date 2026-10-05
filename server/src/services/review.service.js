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
