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
