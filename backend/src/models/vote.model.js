import pool from '../config/db.js';

export const VoteModel = {
  async find(userId, postId) {
    const [rows] = await pool.query(
      'SELECT * FROM votos_usuarios WHERE usuario_id = ? AND publicacion_id = ?',
      [userId, postId]
    );
    return rows[0] || null;
  },

  async create(userId, postId, tipo_voto) {
    await pool.query(
      'INSERT INTO votos_usuarios (usuario_id, publicacion_id, tipo_voto) VALUES (?, ?, ?)',
      [userId, postId, tipo_voto]
    );
  },

  async update(userId, postId, tipo_voto) {
    await pool.query(
      'UPDATE votos_usuarios SET tipo_voto = ? WHERE usuario_id = ? AND publicacion_id = ?',
      [tipo_voto, userId, postId]
    );
  },

  async delete(userId, postId) {
    await pool.query(
      'DELETE FROM votos_usuarios WHERE usuario_id = ? AND publicacion_id = ?',
      [userId, postId]
    );
  },
};
