import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.post('/create', authenticate, paymentController.createPaymentIntent);
router.post('/verify', authenticate, paymentController.verifyPayment);
router.post('/webhook', paymentController.handleWebhook);

export default router;
