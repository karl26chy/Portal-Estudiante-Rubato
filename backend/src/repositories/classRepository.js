// repositories/classRepository.js - Capa de acceso a datos para clases
const { pool } = require('../config/db');

async function findAll() {
  const [rows] = await pool.query('SELECT * FROM classes');
  return rows;
}

async function findByDocenteId(docenteId) {
  const [rows] = await pool.query(
    'SELECT * FROM classes WHERE docente_id = ? ORDER BY asignatura ASC',
    [docenteId]
  );
  return rows;
}

async function findByEstudianteId(estudianteId) {
  const [rows] = await pool.query(
    `SELECT c.* FROM classes c
     INNER JOIN clase_estudiantes ce ON ce.clase_id = c.id
     WHERE ce.estudiante_id = ?
     ORDER BY c.asignatura ASC`,
    [estudianteId]
  );
  return rows;
}

async function create(classData) {
  const { asignatura, modulo, semestre, profesor_nombre, profesor_titulo, dia_semana, horario, hora_inicio, hora_fin, aula, nota, asistencia, docente_id } = classData;
  const [result] = await pool.query(
    `INSERT INTO classes (asignatura, modulo, semestre, profesor_nombre, profesor_titulo, dia_semana, horario, hora_inicio, hora_fin, aula, nota, asistencia, docente_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [asignatura, modulo, semestre, profesor_nombre, profesor_titulo, dia_semana, horario, hora_inicio, hora_fin, aula, nota, asistencia, docente_id]
  );

  const [rows] = await pool.query('SELECT * FROM classes WHERE id = ?', [result.insertId]);
  return rows[0];
}

async function findConflictsByTeacher({ docente_id, dia_semana, hora_inicio, hora_fin, excludeId }) {
  let query = `SELECT * FROM classes
     WHERE docente_id = ?
       AND dia_semana = ?
       AND hora_inicio IS NOT NULL
       AND hora_fin IS NOT NULL
       AND (? < hora_fin)
       AND (? > hora_inicio)`;
  const params = [docente_id, dia_semana, hora_inicio, hora_fin];

  if (excludeId) {
    query += ' AND id != ?';
    params.push(excludeId);
  }

  const [rows] = await pool.query(query, params);
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM classes WHERE id = ?', [id]);
  return rows[0] || null;
}

async function findStudentsByClassId(claseId) {
  const [rows] = await pool.query(
    `SELECT u.id, u.nombre, u.apellido, u.email, u.username, u.role
     FROM clase_estudiantes ce
     INNER JOIN users u ON u.id = ce.estudiante_id
     WHERE ce.clase_id = ?
     ORDER BY u.apellido ASC, u.nombre ASC`,
    [claseId]
  );
  return rows;
}

async function addStudentToClass(claseId, estudianteId) {
  const [result] = await pool.query(
    'INSERT IGNORE INTO clase_estudiantes (clase_id, estudiante_id) VALUES (?, ?)',
    [claseId, estudianteId]
  );
  return result.affectedRows > 0;
}

async function addStudentsToClass(claseId, estudianteIds) {
  if (!Array.isArray(estudianteIds) || estudianteIds.length === 0) return 0;
  const values = estudianteIds.map(id => [claseId, id]);
  const [result] = await pool.query(
    'INSERT IGNORE INTO clase_estudiantes (clase_id, estudiante_id) VALUES ?',
    [values]
  );
  return result.affectedRows;
}

async function removeStudentFromClass(claseId, estudianteId) {
  const [result] = await pool.query(
    'DELETE FROM clase_estudiantes WHERE clase_id = ? AND estudiante_id = ?',
    [claseId, estudianteId]
  );
  return result.affectedRows > 0;
}

async function updateById(id, classData) {
  const { asignatura, modulo, semestre, profesor_nombre, dia_semana, horario, hora_inicio, hora_fin, aula } = classData;
  const [result] = await pool.query(
    `UPDATE classes SET asignatura=?, modulo=?, semestre=?, profesor_nombre=?, dia_semana=?, horario=?, hora_inicio=?, hora_fin=?, aula=? WHERE id=?`,
    [asignatura, modulo, semestre, profesor_nombre, dia_semana, horario, hora_inicio, hora_fin, aula, id]
  );
  if (result.affectedRows === 0) return null;
  return findById(id);
}

async function deleteById(id) {
  const [result] = await pool.query('DELETE FROM classes WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = {
  findAll,
  findByDocenteId,
  findByEstudianteId,
  create,
  findConflictsByTeacher,
  findById,
  findStudentsByClassId,
  addStudentToClass,
  addStudentsToClass,
  removeStudentFromClass,
  updateById,
  deleteById
};
