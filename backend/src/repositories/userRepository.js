// repositories/userRepository.js - Capa de acceso a datos para usuarios
const { pool } = require('../config/db');

async function findByUsuario(usuario) {
  const [rows] = await pool.query('SELECT * FROM users WHERE LOWER(usuario) = LOWER(?)', [usuario]);
  return rows[0] || null;
}

async function findByRole(role) {
  const [rows] = await pool.query('SELECT * FROM users WHERE role = ? LIMIT 1', [role]);
  return rows[0] || null;
}

module.exports = {
  findByUsuario,
  findByRole
};
