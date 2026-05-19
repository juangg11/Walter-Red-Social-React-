import { Router } from 'express';
import { mediaController } from '../controllers/media.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(authMiddleware);
router.post('/signature', asyncHandler(mediaController.signature));
router.post('/commit', asyncHandler(mediaController.commit));

export default router;
