// repositories/userRepository.js - Capa de acceso a datos para usuarios
const { pool } = require('../config/db');

async function findByUsernameOrEmail(identifier) {
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?) LIMIT 1',
    [identifier, identifier]
  );
  return rows[0] || null;
}

async function createUser(userData) {
  const { nombre, apellido, email, username, role, password_hash, password_encrypted } = userData;
  const [result] = await pool.query(
    'INSERT INTO users (nombre, apellido, email, username, role, password_hash, password_encrypted) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [nombre, apellido, email, username, role, password_hash, password_encrypted]
  );
  return result.insertId;
}

async function getEncryptedPasswordById(id) {
  const [rows] = await pool.query(
    'SELECT password_encrypted FROM users WHERE id = ? LIMIT 1',
    [id]
  );
  return rows[0] ? rows[0].password_encrypted : null;
}

module.exports = {
  findByUsernameOrEmail,
  createUser,
  getEncryptedPasswordById
};
