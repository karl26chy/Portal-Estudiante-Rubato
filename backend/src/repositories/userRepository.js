const { pool } = require('../config/db');

async function findByUsernameOrEmail(identifier) {
  const result = await pool.query(
    'SELECT * FROM users WHERE LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($1) LIMIT 1',
    [identifier]
  );
  return result.rows[0] || null;
}

async function createUser(userData) {
  const { nombre, apellido, email, username, role, password_hash, password_encrypted, especialidad, birthdate, age, instrument, module, semester, phone } = userData;
  const result = await pool.query(
    `INSERT INTO users (nombre, apellido, email, username, role, especialidad, birthdate, age, instrument, module, semester, phone, password_hash, password_encrypted)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
     RETURNING id`,
    [nombre, apellido, email, username, role, especialidad || null, birthdate || null, age !== undefined && age !== null && age !== '' ? age : null, instrument || null, module || null, semester || null, phone || null, password_hash, password_encrypted]
  );
  return result.rows[0].id;
}

async function getEncryptedPasswordById(id) {
  const result = await pool.query(
    'SELECT password_encrypted FROM users WHERE id = $1 LIMIT 1',
    [id]
  );
  return result.rows[0] ? result.rows[0].password_encrypted : null;
}

async function findAllByRole(role) {
  const result = await pool.query(
    'SELECT id, nombre, apellido, email, username, role, especialidad, birthdate, age, instrument, module, semester, phone FROM users WHERE role = $1 ORDER BY apellido ASC, nombre ASC',
    [role]
  );
  return result.rows;
}

async function updateUser(id, userData) {
  const fields = [];
  const values = [];
  let paramIndex = 1;

  if (userData.nombre !== undefined) { fields.push(`nombre = $${paramIndex++}`); values.push(userData.nombre); }
  if (userData.apellido !== undefined) { fields.push(`apellido = $${paramIndex++}`); values.push(userData.apellido); }
  if (userData.email !== undefined) { fields.push(`email = $${paramIndex++}`); values.push(userData.email); }
  if (userData.username !== undefined) { fields.push(`username = $${paramIndex++}`); values.push(userData.username); }
  if (userData.role !== undefined) { fields.push(`role = $${paramIndex++}`); values.push(userData.role); }
  if (userData.especialidad !== undefined && userData.especialidad !== '') { fields.push(`especialidad = $${paramIndex++}`); values.push(userData.especialidad); }
  if (userData.birthdate !== undefined) { fields.push(`birthdate = $${paramIndex++}`); values.push(userData.birthdate || null); }
  if (userData.age !== undefined) { fields.push(`age = $${paramIndex++}`); values.push(userData.age !== null && userData.age !== '' ? userData.age : null); }
  if (userData.instrument !== undefined) { fields.push(`instrument = $${paramIndex++}`); values.push(userData.instrument || null); }
  if (userData.module !== undefined) { fields.push(`module = $${paramIndex++}`); values.push(userData.module || null); }
  if (userData.semester !== undefined) { fields.push(`semester = $${paramIndex++}`); values.push(userData.semester || null); }
  if (userData.phone !== undefined) { fields.push(`phone = $${paramIndex++}`); values.push(userData.phone || null); }

  if (fields.length === 0) return false;

  values.push(id);
  const result = await pool.query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex}`,
    values
  );
  return result.rowCount > 0;
}

async function deleteUser(id) {
  const result = await pool.query('DELETE FROM users WHERE id = $1', [id]);
  return result.rowCount > 0;
}

module.exports = {
  findByUsernameOrEmail,
  createUser,
  getEncryptedPasswordById,
  findAllByRole,
  updateUser,
  deleteUser
};
