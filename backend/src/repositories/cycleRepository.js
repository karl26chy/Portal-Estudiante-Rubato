const { pool } = require('../config/db');

async function findAll() {
  const result = await pool.query(
    'SELECT *, (estado = \'ABIERTO\' AND fecha_fin >= CURRENT_DATE) AS is_open FROM ciclos ORDER BY fecha_inicio DESC, id DESC'
  );
  return result.rows.map(r => ({
    ...r,
    is_open: Boolean(r.is_open)
  }));
}

async function findById(id) {
  const result = await pool.query(
    'SELECT *, (estado = \'ABIERTO\' AND fecha_fin >= CURRENT_DATE) AS is_open FROM ciclos WHERE id = $1 LIMIT 1',
    [id]
  );
  if (!result.rows[0]) return null;
  return {
    ...result.rows[0],
    is_open: Boolean(result.rows[0].is_open)
  };
}

async function create({ nombre, semestre, anio, fecha_inicio, fecha_fin }) {
  const result = await pool.query(
    'INSERT INTO ciclos (nombre, semestre, anio, fecha_inicio, fecha_fin, estado) VALUES ($1, $2, $3, $4, $5, \'ABIERTO\') RETURNING id',
    [nombre, semestre || null, anio || null, fecha_inicio, fecha_fin]
  );
  return findById(result.rows[0].id);
}

async function findBySemestreAndAnio(semestre, anio) {
  if (!semestre || !anio) return null;
  const result = await pool.query(
    'SELECT * FROM ciclos WHERE semestre = $1 AND anio = $2 LIMIT 1',
    [String(semestre), Number(anio)]
  );
  return result.rows[0] || null;
}

async function updateById(id, { nombre, semestre, anio, fecha_inicio, fecha_fin }) {
  const fields = [];
  const values = [];
  let paramIndex = 1;

  if (nombre !== undefined) { fields.push(`nombre = $${paramIndex++}`); values.push(nombre); }
  if (semestre !== undefined) { fields.push(`semestre = $${paramIndex++}`); values.push(semestre || null); }
  if (anio !== undefined) { fields.push(`anio = $${paramIndex++}`); values.push(anio || null); }
  if (fecha_inicio !== undefined) { fields.push(`fecha_inicio = $${paramIndex++}`); values.push(fecha_inicio); }
  if (fecha_fin !== undefined) { fields.push(`fecha_fin = $${paramIndex++}`); values.push(fecha_fin); }

  if (fields.length === 0) return findById(id);

  values.push(id);
  await pool.query(
    `UPDATE ciclos SET ${fields.join(', ')} WHERE id = $${paramIndex}`,
    values
  );
  return findById(id);
}

async function close(id, adminId) {
  const result = await pool.query(
    `UPDATE ciclos 
     SET estado = 'CERRADO', cerrado_en = CURRENT_TIMESTAMP, cerrado_por = $1 
     WHERE id = $2 AND estado = 'ABIERTO'`,
    [adminId, id]
  );
  if (result.rowCount === 0) return null;
  return findById(id);
}

async function isOpen(cicloId) {
  if (!cicloId) return false;
  const result = await pool.query(
    'SELECT (estado = \'ABIERTO\' AND fecha_fin >= CURRENT_DATE) AS is_open FROM ciclos WHERE id = $1 LIMIT 1',
    [cicloId]
  );
  if (!result.rows[0]) return false;
  return Boolean(result.rows[0].is_open);
}

async function deleteById(id) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(
      'DELETE FROM attendance WHERE class_id IN (SELECT id FROM classes WHERE ciclo_id = $1)',
      [id]
    );

    await client.query(
      'DELETE FROM grades WHERE class_id IN (SELECT id FROM classes WHERE ciclo_id = $1)',
      [id]
    );

    await client.query(
      'DELETE FROM clase_estudiantes WHERE clase_id IN (SELECT id FROM classes WHERE ciclo_id = $1)',
      [id]
    );

    await client.query('DELETE FROM classes WHERE ciclo_id = $1', [id]);

    const result = await client.query('DELETE FROM ciclos WHERE id = $1', [id]);

    await client.query('COMMIT');
    return result.rowCount > 0;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
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
