import pool from '../config/db.js';

export const MediaModel = {
  async create(asset) {
    const [result] = await pool.query(
      `INSERT INTO media_assets
       (public_id, secure_url, resource_type, format, bytes, width, height, duration)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        asset.public_id,
        asset.secure_url,
        asset.resource_type,
        asset.format || null,
        asset.bytes || null,
        asset.width || null,
        asset.height || null,
        asset.duration || null,
      ]
    );
    return result.insertId;
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM media_assets WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async findByPublicId(publicId) {
    const [rows] = await pool.query('SELECT * FROM media_assets WHERE public_id = ?', [publicId]);
    return rows[0] || null;
  },
};
