import { NotificationModel } from '../models/notification.model.js';
import { AppError } from '../utils/AppError.js';

export const notificacionesService = {

  async getAll(userId) {
    return NotificationModel.findAllByUser(userId);
  },

  async countUnread(userId) {
    return { total: await NotificationModel.countUnread(userId) };
  },

  async markAsRead(id, userId) {
    const affectedRows = await NotificationModel.markAsRead(id, userId);
    if (affectedRows === 0) throw new AppError(404, 'Notificación no encontrada');
  },

  async markAllRead(userId) {
    await NotificationModel.markAllRead(userId);
  },

  async remove(id, userId) {
    const affectedRows = await NotificationModel.delete(id, userId);
    if (affectedRows === 0) throw new AppError(404, 'Notificación no encontrada');
  },
};
