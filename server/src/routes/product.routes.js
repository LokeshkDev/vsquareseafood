import { Router } from 'express';
import * as productController from '../controllers/product.controller.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/authorize.js';
import { ROLES } from '../constants/roles.js';
import {
  queryProductsSchema,
  createProductSchema,
  updateProductSchema,
} from '../validators/product.validator.js';

const router = Router();

router.get('/', validate(queryProductsSchema), productController.getProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/popular', productController.getPopularProducts);

// Bulk endpoints MUST be before /:slug and /:id
router.post(
  '/bulk-status',
  authenticate,
  requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  productController.bulkUpdateStatus
);

router.post(
  '/bulk-delete',
  authenticate,
  requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  productController.bulkDeleteProducts
);

router.get('/:slug', productController.getProductBySlug);

router.post(
  '/',
  authenticate,
  requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  validate(createProductSchema),
  productController.createProduct
);

router.put(
  '/:id',
  authenticate,
  requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  validate(updateProductSchema),
  productController.updateProduct
);

router.delete(
  '/:id',
  authenticate,
  requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  productController.deleteProduct
);

export default router;

