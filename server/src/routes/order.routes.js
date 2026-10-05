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
