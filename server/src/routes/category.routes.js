import { Router } from 'express';
import * as categoryController from '../controllers/category.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/authorize.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.get('/', categoryController.getCategories);

// Bulk endpoints MUST be before /:slug and /:id
router.post(
  '/bulk-status',
  authenticate,
  requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  categoryController.bulkUpdateStatus
);

router.post(
  '/bulk-delete',
  authenticate,
  requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  categoryController.bulkDeleteCategories
);

router.get('/:slug', categoryController.getCategoryBySlug);

router.post(
  '/',
  authenticate,
  requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  categoryController.createCategory
);

router.put(
  '/:id',
  authenticate,
  requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  categoryController.updateCategory
);

router.delete(
  '/:id',
  authenticate,
  requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  categoryController.deleteCategory
);

export default router;

