import { Router } from 'express';
import { publicacionesController } from '../controllers/publicaciones.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(publicacionesController.getAll));
router.get('/:id', asyncHandler(publicacionesController.getById));
router.post('/', authMiddleware, asyncHandler(publicacionesController.create));
router.delete('/:id', authMiddleware, asyncHandler(publicacionesController.remove));
router.post('/:id/votar', authMiddleware, asyncHandler(publicacionesController.vote));

export default router;
