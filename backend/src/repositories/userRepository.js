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
  const { nombre, apellido, email, username, role, password_hash, password_encrypted, especialidad, birthdate, age, instrument, module, semester, phone } = userData;
  const [result] = await pool.query(
    'INSERT INTO users (nombre, apellido, email, username, role, especialidad, birthdate, age, instrument, module, semester, phone, password_hash, password_encrypted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [nombre, apellido, email, username, role, especialidad || null, birthdate || null, age !== undefined && age !== null && age !== '' ? age : null, instrument || null, module || null, semester || null, phone || null, password_hash, password_encrypted]
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

async function findAllByRole(role) {
  const [rows] = await pool.query(
    'SELECT id, nombre, apellido, email, username, role, especialidad, birthdate, age, instrument, module, semester, phone FROM users WHERE role = ? ORDER BY apellido ASC, nombre ASC',
    [role]
  );
  return rows;
}

async function updateUser(id, userData) {
  const fields = [];
  const values = [];

  if (userData.nombre !== undefined) { fields.push('nombre = ?'); values.push(userData.nombre); }
  if (userData.apellido !== undefined) { fields.push('apellido = ?'); values.push(userData.apellido); }
  if (userData.email !== undefined) { fields.push('email = ?'); values.push(userData.email); }
  if (userData.username !== undefined) { fields.push('username = ?'); values.push(userData.username); }
  if (userData.role !== undefined) { fields.push('role = ?'); values.push(userData.role); }
  if (userData.especialidad !== undefined && userData.especialidad !== '') { fields.push('especialidad = ?'); values.push(userData.especialidad); }
  if (userData.birthdate !== undefined) { fields.push('birthdate = ?'); values.push(userData.birthdate || null); }
  if (userData.age !== undefined) { fields.push('age = ?'); values.push(userData.age !== null && userData.age !== '' ? userData.age : null); }
  if (userData.instrument !== undefined) { fields.push('instrument = ?'); values.push(userData.instrument || null); }
  if (userData.module !== undefined) { fields.push('module = ?'); values.push(userData.module || null); }
  if (userData.semester !== undefined) { fields.push('semester = ?'); values.push(userData.semester || null); }
  if (userData.phone !== undefined) { fields.push('phone = ?'); values.push(userData.phone || null); }

  if (fields.length === 0) return false;

  values.push(id);
  const [result] = await pool.query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
  return result.affectedRows > 0;
}

async function deleteUser(id) {
  const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = {
  findByUsernameOrEmail,
  createUser,
  getEncryptedPasswordById,
  findAllByRole,
  updateUser,
  deleteUser
};
