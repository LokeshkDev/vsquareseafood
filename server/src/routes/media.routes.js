import { Router } from 'express';
import * as mediaController from '../controllers/media.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/authorize.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(authenticate, requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN));

router.get('/r2-status', mediaController.getR2Status);
router.post('/upload', mediaController.upload.single('image'), mediaController.directUpload);
router.post('/upload-multiple', mediaController.upload.array('images', 10), mediaController.directUploadMultiple);
router.post('/delete-file', mediaController.deleteUploadedFile);
router.post('/presign', mediaController.getPresignedUrl);
router.post('/confirm', mediaController.confirmUpload);
router.delete('/:id', mediaController.deleteMedia);

export default router;
