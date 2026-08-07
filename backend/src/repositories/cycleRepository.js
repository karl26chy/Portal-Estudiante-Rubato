// repositories/cycleRepository.js - Capa de acceso a datos para ciclos académicos
const { pool } = require('../config/db');

async function findAll() {
  const [rows] = await pool.query(
    'SELECT *, (estado = \'ABIERTO\' AND fecha_fin >= CURDATE()) AS is_open FROM ciclos ORDER BY fecha_inicio DESC, id DESC'
  );
  return rows.map(r => ({
    ...r,
    is_open: Boolean(r.is_open)
  }));
}

async function findById(id) {
  const [rows] = await pool.query(
    'SELECT *, (estado = \'ABIERTO\' AND fecha_fin >= CURDATE()) AS is_open FROM ciclos WHERE id = ? LIMIT 1',
    [id]
  );
  if (!rows[0]) return null;
  return {
    ...rows[0],
    is_open: Boolean(rows[0].is_open)
  };
}

async function create({ nombre, semestre, anio, fecha_inicio, fecha_fin }) {
  const [result] = await pool.query(
    'INSERT INTO ciclos (nombre, semestre, anio, fecha_inicio, fecha_fin, estado) VALUES (?, ?, ?, ?, ?, \'ABIERTO\')',
    [nombre, semestre || null, anio || null, fecha_inicio, fecha_fin]
  );
  return findById(result.insertId);
}

async function findBySemestreAndAnio(semestre, anio) {
  if (!semestre || !anio) return null;
  const [rows] = await pool.query(
    'SELECT * FROM ciclos WHERE semestre = ? AND anio = ? LIMIT 1',
    [String(semestre), Number(anio)]
  );
  return rows[0] || null;
}

async function updateById(id, { nombre, semestre, anio, fecha_inicio, fecha_fin }) {
  const fields = [];
  const values = [];

  if (nombre !== undefined) { fields.push('nombre = ?'); values.push(nombre); }
  if (semestre !== undefined) { fields.push('semestre = ?'); values.push(semestre || null); }
  if (anio !== undefined) { fields.push('anio = ?'); values.push(anio || null); }
  if (fecha_inicio !== undefined) { fields.push('fecha_inicio = ?'); values.push(fecha_inicio); }
  if (fecha_fin !== undefined) { fields.push('fecha_fin = ?'); values.push(fecha_fin); }

  if (fields.length === 0) return findById(id);

  values.push(id);
  await pool.query(
    `UPDATE ciclos SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
  return findById(id);
}

async function close(id, adminId) {
  const [result] = await pool.query(
    `UPDATE ciclos 
     SET estado = 'CERRADO', cerrado_en = NOW(), cerrado_por = ? 
     WHERE id = ? AND estado = 'ABIERTO'`,
    [adminId, id]
  );
  if (result.affectedRows === 0) return null;
  return findById(id);
}

async function isOpen(cicloId) {
  if (!cicloId) return false;
  const [rows] = await pool.query(
    'SELECT (estado = \'ABIERTO\' AND fecha_fin >= CURDATE()) AS is_open FROM ciclos WHERE id = ? LIMIT 1',
    [cicloId]
  );
  if (!rows[0]) return false;
  return Boolean(rows[0].is_open);
}

async function deleteById(id) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query(
      'DELETE FROM attendance WHERE class_id IN (SELECT id FROM classes WHERE ciclo_id = ?)',
      [id]
    );

    await connection.query(
      'DELETE FROM grades WHERE class_id IN (SELECT id FROM classes WHERE ciclo_id = ?)',
      [id]
    );

    await connection.query(
      'DELETE FROM clase_estudiantes WHERE clase_id IN (SELECT id FROM classes WHERE ciclo_id = ?)',
      [id]
    );

    await connection.query('DELETE FROM classes WHERE ciclo_id = ?', [id]);

    const [result] = await connection.query('DELETE FROM ciclos WHERE id = ?', [id]);

    await connection.commit();
    return result.affectedRows > 0;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

module.exports = {
  findAll,
  findById,
  findBySemestreAndAnio,
  create,
  updateById,
  close,
  deleteById,
  isOpen
};
