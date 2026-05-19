import { notificacionesService } from '../services/notificaciones.service.js';
import { idParamDto } from '../dtos/common.dto.js';

export const notificacionesController = {

  async getAll(req, res) {
    const data = await notificacionesService.getAll(req.user.id);
    res.json(data);
  },

  async countUnread(req, res) {
    const data = await notificacionesService.countUnread(req.user.id);
    res.json(data);
  },

  async markAsRead(req, res) {
    const { id } = idParamDto(req.params);
    await notificacionesService.markAsRead(id, req.user.id);
    res.json({ mensaje: 'Notificación marcada como leída' });
  },

  async markAllRead(req, res) {
    await notificacionesService.markAllRead(req.user.id);
    res.json({ mensaje: 'Todas las notificaciones marcadas como leídas' });
  },

  async remove(req, res) {
    const { id } = idParamDto(req.params);
    await notificacionesService.remove(id, req.user.id);
    res.json({ mensaje: 'Notificación eliminada' });
  },
};
