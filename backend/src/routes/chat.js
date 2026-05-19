import { Router } from 'express';
import { chatController } from '../controllers/chat.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(authMiddleware);
router.get('/usuarios', asyncHandler(chatController.searchUsers));
router.get('/', asyncHandler(chatController.list));
router.post('/', asyncHandler(chatController.create));
router.get('/:chatId/mensajes', asyncHandler(chatController.messages));
router.post('/:chatId/mensajes', asyncHandler(chatController.send));

export default router;
