import { Router } from 'express';
import { usuariosController } from '../controllers/usuarios.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/me', authMiddleware, asyncHandler(usuariosController.me));
router.get('/isAdmin', authMiddleware, asyncHandler(usuariosController.isAdmin));
router.patch('/perfil', authMiddleware, asyncHandler(usuariosController.updatePerfil));
router.get('/perfil/:username', authMiddleware, asyncHandler(usuariosController.getProfile));
router.get('/perfil/:username/publicaciones', authMiddleware, asyncHandler(usuariosController.getPublicaciones));
router.get('/perfil/:username/comentarios', authMiddleware, asyncHandler(usuariosController.getComentarios));
router.get('/perfil/:username/compartidos', authMiddleware, asyncHandler(usuariosController.getCompartidos));
router.post('/compartidos/:postId', authMiddleware, asyncHandler(usuariosController.sharePost));
router.delete('/compartidos/:postId', authMiddleware, asyncHandler(usuariosController.unsharePost));
router.post('/:username/follow', authMiddleware, asyncHandler(usuariosController.follow));
router.delete('/:username/follow', authMiddleware, asyncHandler(usuariosController.unfollow));
router.get('/:username', asyncHandler(usuariosController.getByUsername));
router.get('/:username/publicaciones', asyncHandler(usuariosController.getPublicaciones));
router.get('/:username/comunidades', asyncHandler(usuariosController.getComunidades));

export default router;
