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
