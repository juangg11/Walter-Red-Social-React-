import pool from '../config/db.js';

export const NotificationModel = {
  async findAllByUser(userId) {
    const [rows] = await pool.query(
      `SELECT n.*, p.titulo AS publicacion_titulo
       FROM notificaciones n
       LEFT JOIN publicaciones p ON p.id = n.publicacion_id
       WHERE n.usuario_id = ?
       ORDER BY n.fecha_creacion DESC
       LIMIT 50`,
      [userId]
    );
    return rows;
  },

  async countUnread(userId) {
    const [rows] = await pool.query(
      'SELECT COUNT(*) AS total FROM notificaciones WHERE usuario_id = ? AND leida = FALSE',
      [userId]
    );
    return rows[0].total;
  },

  async create({ usuario_id, titulo, mensaje, publicacion_id, comentario_id }) {
    await pool.query(
      `INSERT INTO notificaciones (usuario_id, titulo, mensaje, publicacion_id, comentario_id)
       VALUES (?, ?, ?, ?, ?)`,
      [usuario_id, titulo, mensaje, publicacion_id, comentario_id]
    );
  },

  async markAsRead(id, userId) {
    const [result] = await pool.query(
      'UPDATE notificaciones SET leida = TRUE WHERE id = ? AND usuario_id = ?',
      [id, userId]
    );
    return result.affectedRows;
  },

  async markAllRead(userId) {
    await pool.query('UPDATE notificaciones SET leida = TRUE WHERE usuario_id = ?', [userId]);
  },

  async delete(id, userId) {
    const [result] = await pool.query(
      'DELETE FROM notificaciones WHERE id = ? AND usuario_id = ?',
      [id, userId]
    );
    return result.affectedRows;
  },
};
