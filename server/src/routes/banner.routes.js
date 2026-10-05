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
