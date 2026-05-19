import pool from '../config/db.js';

function memberSelect(userId) {
  return userId
    ? 'EXISTS(SELECT 1 FROM miembros_comunidad mc WHERE mc.comunidad_id = c.id AND mc.usuario_id = ?) AS es_miembro'
    : '0 AS es_miembro';
}

export const CommunityModel = {
  async findAll(userId) {
    const [rows] = await pool.query(
      `SELECT c.*, ${memberSelect(userId)}
       FROM comunidades c
       ORDER BY c.numero_miembros DESC`,
      userId ? [userId] : []
    );
    return rows;
  },

  async findById(id, userId = null) {
    const [rows] = await pool.query(
      `SELECT c.*, ${memberSelect(userId)}
       FROM comunidades c
       WHERE c.id = ?`,
      userId ? [userId, id] : [id]
    );
    return rows[0] || null;
  },

  async create({ nombre, descripcion, categoria, creadorId }) {
    const [result] = await pool.query(
      'INSERT INTO comunidades (nombre, descripcion, categoria, creador_id) VALUES (?, ?, ?, ?)',
      [nombre, descripcion, categoria, creadorId]
    );
    return result.insertId;
  },

  async addMember(comunidadId, userId) {
    await pool.query(
      'INSERT INTO miembros_comunidad (usuario_id, comunidad_id) VALUES (?, ?)',
      [userId, comunidadId]
    );
  },

  async isMember(comunidadId, userId) {
    const [rows] = await pool.query(
      'SELECT 1 FROM miembros_comunidad WHERE comunidad_id = ? AND usuario_id = ? LIMIT 1',
      [comunidadId, userId]
    );
    return rows.length > 0;
  },

  async removeMember(comunidadId, userId) {
    const [result] = await pool.query(
      'DELETE FROM miembros_comunidad WHERE usuario_id = ? AND comunidad_id = ?',
      [userId, comunidadId]
    );
    return result.affectedRows;
  },

  async incrementMembers(comunidadId) {
    await pool.query('UPDATE comunidades SET numero_miembros = numero_miembros + 1 WHERE id = ?', [comunidadId]);
  },

  async decrementMembers(comunidadId) {
    await pool.query(
      'UPDATE comunidades SET numero_miembros = GREATEST(numero_miembros - 1, 0) WHERE id = ?',
      [comunidadId]
    );
  },

  async incrementPosts(comunidadId) {
    await pool.query('UPDATE comunidades SET numero_posts = numero_posts + 1 WHERE id = ?', [comunidadId]);
  },

  async decrementPosts(comunidadId) {
    await pool.query(
      'UPDATE comunidades SET numero_posts = GREATEST(numero_posts - 1, 0) WHERE id = ?',
      [comunidadId]
    );
  },

  async findByUserId(userId) {
    const [rows] = await pool.query(
      `SELECT c.* FROM comunidades c
       INNER JOIN miembros_comunidad mc ON mc.comunidad_id = c.id
       WHERE mc.usuario_id = ?
       ORDER BY mc.fecha_union DESC`,
      [userId]
    );
    return rows;
  },
};
