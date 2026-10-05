import fs from 'fs';
import path from 'path';

const write = (relPath, content) => {
  const fullPath = path.resolve('src', relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Wrote', relPath);
};

// 1. routes/auth.routes.js
write('routes/auth.routes.js', `
import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
} from '../validators/auth.validator.js';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/logout', authController.logout);

router.get('/me', authenticate, authController.getMe);
router.put('/profile', authenticate, validate(updateProfileSchema), authController.updateProfile);
router.put('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword);

export default router;
`);

// 2. routes/category.routes.js
write('routes/category.routes.js', `
import { Router } from 'express';
import * as categoryController from '../controllers/category.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/authorize.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.get('/', categoryController.getCategories);
router.get('/:slug', categoryController.getCategoryBySlug);

router.post('/', authenticate, requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN), categoryController.createCategory);
router.put('/:id', authenticate, requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN), categoryController.updateCategory);
router.delete('/:id', authenticate, requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN), categoryController.deleteCategory);

export default router;
`);

// 3. routes/product.routes.js
write('routes/product.routes.js', `
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
`);

// 4. routes/cart.routes.js
write('routes/cart.routes.js', `
import { Router } from 'express';
import * as cartController from '../controllers/cart.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { addToCartSchema, updateCartItemSchema } from '../validators/cart.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', cartController.getCart);
router.post('/items', validate(addToCartSchema), cartController.addItem);
router.patch('/items/:id', validate(updateCartItemSchema), cartController.updateItem);
router.delete('/items/:id', cartController.removeItem);
router.delete('/', cartController.clearCart);

export default router;
`);

// 5. routes/order.routes.js
write('routes/order.routes.js', `
import { Router } from 'express';
import * as orderController from '../controllers/order.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/authorize.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(authenticate);

router.post('/', orderController.createOrder);
router.get('/my-orders', orderController.getMyOrders);
router.get('/:id', orderController.getOrderById);
router.post('/:id/cancel', orderController.cancelOrder);

router.get('/', requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN), orderController.getAllOrdersAdmin);
router.patch('/:id/status', requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN), orderController.updateOrderStatusAdmin);

export default router;
`);

// 6. routes/payment.routes.js
write('routes/payment.routes.js', `
import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.post('/create', authenticate, paymentController.createPaymentIntent);
router.post('/verify', authenticate, paymentController.verifyPayment);
router.post('/webhook', paymentController.handleWebhook);

export default router;
`);

// 7. routes/delivery.routes.js
write('routes/delivery.routes.js', `
import { Router } from 'express';
import * as deliveryController from '../controllers/delivery.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/authorize.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.get('/calculate', deliveryController.calculateDelivery);

router.get('/', authenticate, requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN), deliveryController.getRules);
router.post('/', authenticate, requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN), deliveryController.createRule);
router.put('/:id', authenticate, requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN), deliveryController.updateRule);
router.delete('/:id', authenticate, requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN), deliveryController.deleteRule);

export default router;
`);

// 8. routes/coupon.routes.js
write('routes/coupon.routes.js', `
import { Router } from 'express';
import * as couponController from '../controllers/coupon.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/authorize.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.post('/validate', authenticate, couponController.validateCoupon);

router.get('/', authenticate, requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN), couponController.getCoupons);
router.post('/', authenticate, requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN), couponController.createCoupon);
router.put('/:id', authenticate, requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN), couponController.updateCoupon);
router.delete('/:id', authenticate, requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN), couponController.deleteCoupon);

export default router;
`);

// 9. routes/review.routes.js
write('routes/review.routes.js', `
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
`);

// 10. routes/banner.routes.js
write('routes/banner.routes.js', `
import { Router } from 'express';
import * as bannerController from '../controllers/banner.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/authorize.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.get('/', bannerController.getActiveBanners);

router.get('/all', authenticate, requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN), bannerController.getAllBanners);
router.post('/', authenticate, requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN), bannerController.createBanner);
router.put('/:id', authenticate, requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN), bannerController.updateBanner);
router.delete('/:id', authenticate, requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN), bannerController.deleteBanner);

export default router;
`);

// 11. routes/media.routes.js
write('routes/media.routes.js', `
import { Router } from 'express';
import * as mediaController from '../controllers/media.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/authorize.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(authenticate, requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN));

router.post('/presign', mediaController.getPresignedUrl);
router.post('/confirm', mediaController.confirmUpload);
router.delete('/:id', mediaController.deleteMedia);

export default router;
`);

// 12. routes/admin.routes.js
write('routes/admin.routes.js', `
import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/authorize.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(authenticate, requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN));

router.get('/dashboard', adminController.getDashboard);
router.get('/customers', adminController.getCustomers);
router.patch('/customers/:id/status', adminController.updateCustomerStatus);
router.get('/inventory', adminController.getInventory);
router.patch('/inventory/:variantId', adminController.adjustInventory);
router.get('/audit-logs', adminController.getAuditLogs);

export default router;
`);

console.log('Part 4 complete!');
