import { Router } from 'express';
import * as orderController from '../controllers/order.controller.js';
import { authenticate, optionalAuthenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/authorize.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

// Public / Guest / Customer order placement
router.post('/', optionalAuthenticate, orderController.createOrder);

// Customer endpoints
router.get('/my-orders', authenticate, orderController.getMyOrders);
router.post('/:id/cancel', authenticate, orderController.cancelOrder);

// Admin Order Management Endpoints (Full CRUD)
router.get('/', authenticate, requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN), orderController.getAllOrdersAdmin);
router.post('/admin', authenticate, requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN), orderController.createOrderAdmin);
router.patch('/:id/status', authenticate, requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN), orderController.updateOrderStatusAdmin);
router.put('/:id', authenticate, requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN), orderController.updateOrderAdmin);
router.delete('/:id', authenticate, requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN), orderController.deleteOrderAdmin);

// Order lookup by ID
router.get('/:id', optionalAuthenticate, orderController.getOrderById);

export default router;
