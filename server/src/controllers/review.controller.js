import * as reviewService from '../services/review.service.js';
import { successResponse, createdResponse, paginatedResponse } from '../utils/response.js';

export const createReview = async (req, res, next) => {
  try {
    const { productId, rating, title, comment } = req.body;
    const review = await reviewService.createReview({
      userId: req.user.id,
      productId,
      rating: Number(rating),
      title,
      comment,
    });
    return createdResponse(res, review);
  } catch (error) {
    next(error);
  }
};

export const getProductReviews = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const result = await reviewService.getProductReviews(req.params.productId, { page, limit });
    return paginatedResponse(res, result.reviews, result.pagination);
  } catch (error) {
    next(error);
  }
};

export const getAllReviewsAdmin = async (req, res, next) => {
  try {
    const { status, page, limit } = req.query;
    const result = await reviewService.getAllReviewsAdmin({
      status,
      page: Number(page) || 1,
      limit: Number(limit) || 20,
    });
    return paginatedResponse(res, result.reviews, result.pagination);
  } catch (error) {
    next(error);
  }
};

export const updateReviewStatusAdmin = async (req, res, next) => {
  try {
    const { status } = req.body;
    const updated = await reviewService.updateReviewStatus(req.params.id, status);
    return successResponse(res, updated);
  } catch (error) {
    next(error);
  }
};
