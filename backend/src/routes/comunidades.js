import { Router } from 'express';
import { comunidadesController } from '../controllers/comunidades.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(comunidadesController.getAll));
router.get('/:id', asyncHandler(comunidadesController.getById));
router.post('/', authMiddleware, asyncHandler(comunidadesController.create));
router.post('/:id/unirse', authMiddleware, asyncHandler(comunidadesController.join));
router.delete('/:id/abandonar', authMiddleware, asyncHandler(comunidadesController.leave));

export default router;
