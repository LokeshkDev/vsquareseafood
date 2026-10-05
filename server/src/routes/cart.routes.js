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
