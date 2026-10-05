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
router.post('/sync-catalog', adminController.syncCatalog);

export default router;
