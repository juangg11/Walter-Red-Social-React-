import pool from '../src/config/db.js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sql = fs.readFileSync(join(__dirname, '../schema.sql'), 'utf8');

const statements = sql.split(';').filter(s => s.trim());

for (const statement of statements) {
  if (statement.trim()) {
    await pool.query(statement);
    console.log('Hecho', statement.trim().split('\n')[0]);
  }
}

console.log('Migración hecha.');
process.exit(0);