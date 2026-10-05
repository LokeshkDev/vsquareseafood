import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import productRoutes from './product.routes.js';
import categoryRoutes from './category.routes.js';
import cartRoutes from './cart.routes.js';
import orderRoutes from './order.routes.js';
import paymentRoutes from './payment.routes.js';
import deliveryRoutes from './delivery.routes.js';
import couponRoutes from './coupon.routes.js';
import reviewRoutes from './review.routes.js';
import mediaRoutes from './media.routes.js';
import bannerRoutes from './banner.routes.js';
import adminRoutes from './admin.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/delivery', deliveryRoutes);
router.use('/coupons', couponRoutes);
router.use('/reviews', reviewRoutes);
router.use('/media', mediaRoutes);
router.use('/banners', bannerRoutes);
router.use('/admin', adminRoutes);

export default router;
