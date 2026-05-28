import pool from '../config/db.js';

export const CommentModel = {
  async findByPostId(publicacionId) {
    const [rows] = await pool.query(
      `SELECT c.*, u.username, u.avatar_url
       FROM comentarios c
       LEFT JOIN users u ON u.id = c.usuario_id
       WHERE c.publicacion_id = ?
       ORDER BY c.fecha_creacion ASC`,
      [publicacionId]
    );
    return rows;
  },

  async findByUserId(userId) {
    const [rows] = await pool.query(
      `SELECT c.*, u.username, u.avatar_url,
        p.titulo AS publicacion_titulo, p.id AS publicacion_ref_id,
        cp.contenido AS respuesta_a_contenido, cp.usuario_id AS respuesta_a_usuario_id
       FROM comentarios c
       LEFT JOIN users u ON u.id = c.usuario_id
       LEFT JOIN publicaciones p ON p.id = c.publicacion_id
       LEFT JOIN comentarios cp ON cp.id = c.comentario_padre_id
       WHERE c.usuario_id = ?
       ORDER BY c.fecha_creacion DESC`,
      [userId]
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM comentarios WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async create({ contenido, publicacion_id, userId, comentario_padre_id = null }) {
    const [result] = await pool.query(
      'INSERT INTO comentarios (contenido, usuario_id, publicacion_id, comentario_padre_id) VALUES (?, ?, ?, ?)',
      [contenido, userId, publicacion_id, comentario_padre_id]
    );
    return result.insertId;
  },

  async findWithUserById(id) {
    const [rows] = await pool.query(
      'SELECT c.*, u.username, u.avatar_url FROM comentarios c LEFT JOIN users u ON u.id = c.usuario_id WHERE c.id = ?',
      [id]
    );
    return rows[0] || null;
  },

  async delete(id) {
    await pool.query('DELETE FROM comentarios WHERE id = ?', [id]);
  },

  async incrementPostCommentCount(publicacionId) {
    await pool.query(
      'UPDATE publicaciones SET numero_comentarios = numero_comentarios + 1 WHERE id = ?',
      [publicacionId]
    );
  },

  async decrementPostCommentCount(publicacionId) {
    await pool.query(
      'UPDATE publicaciones SET numero_comentarios = GREATEST(numero_comentarios - 1, 0) WHERE id = ?',
      [publicacionId]
    );
  },

  async findAllWithUser() {
    const [rows] = await pool.query(
      `SELECT c.*, u.username, u.avatar_url
       FROM comentarios c
       LEFT JOIN users u ON u.id = c.usuario_id
       ORDER BY c.fecha_creacion DESC`
    );
    return rows;
  }
};
