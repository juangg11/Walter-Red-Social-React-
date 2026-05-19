import { Router } from 'express';
import { notificacionesController } from '../controllers/notificaciones.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/', authMiddleware, asyncHandler(notificacionesController.getAll));
router.get('/no-leidas', authMiddleware, asyncHandler(notificacionesController.countUnread));
router.patch('/leer-todas', authMiddleware, asyncHandler(notificacionesController.markAllRead));
router.patch('/:id/leer', authMiddleware, asyncHandler(notificacionesController.markAsRead));
router.delete('/:id', authMiddleware, asyncHandler(notificacionesController.remove));

export default router;
