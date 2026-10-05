import { Router } from 'express';
import * as reviewController from '../controllers/review.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/authorize.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.get('/product/:productId', reviewController.getProductReviews);
router.post('/', authenticate, reviewController.createReview);

router.get('/', authenticate, requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN), reviewController.getAllReviewsAdmin);
router.patch('/:id/status', authenticate, requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN), reviewController.updateReviewStatusAdmin);

export default router;
