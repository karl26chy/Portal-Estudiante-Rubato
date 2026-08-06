// repositories/classRepository.js - Capa de acceso a datos para clases
const { pool } = require('../config/db');

async function attachStudentsToClasses(classes) {
  if (!Array.isArray(classes) || classes.length === 0) return classes;

  const classIds = classes.map(c => c.id);
  const [rows] = await pool.query(
    `SELECT ce.clase_id, u.id AS estudiante_id, u.nombre, u.apellido
     FROM clase_estudiantes ce
     INNER JOIN users u ON u.id = ce.estudiante_id
     WHERE ce.clase_id IN (?)
     ORDER BY u.apellido ASC, u.nombre ASC`,
    [classIds]
  );

  const mapByClass = {};
  rows.forEach(r => {
    if (!mapByClass[r.clase_id]) {
      mapByClass[r.clase_id] = { studentIds: [], studentNames: [] };
    }
    mapByClass[r.clase_id].studentIds.push(r.estudiante_id);
    mapByClass[r.clase_id].studentNames.push(`${r.nombre} ${r.apellido}`.trim());
  });

  return classes.map(c => ({
    ...c,
    studentIds: mapByClass[c.id] ? mapByClass[c.id].studentIds : [],
    studentNames: mapByClass[c.id] ? mapByClass[c.id].studentNames : []
  }));
}

async function findAll() {
  const [rows] = await pool.query('SELECT * FROM classes ORDER BY id ASC');
  return attachStudentsToClasses(rows);
}

async function findByDocenteId(docenteId) {
  const [rows] = await pool.query(
    'SELECT * FROM classes WHERE docente_id = ? ORDER BY asignatura ASC',
    [docenteId]
  );
  return attachStudentsToClasses(rows);
}

async function findByEstudianteId(estudianteId) {
  const [rows] = await pool.query(
    `SELECT c.* FROM classes c
     INNER JOIN clase_estudiantes ce ON ce.clase_id = c.id
     WHERE ce.estudiante_id = ?
     ORDER BY c.asignatura ASC`,
    [estudianteId]
  );
  return attachStudentsToClasses(rows);
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
  if (!rows[0]) return null;
  const [withStudents] = await attachStudentsToClasses([rows[0]]);
  return withStudents;
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

async function setClassStudents(claseId, estudianteIds) {
  await pool.query('DELETE FROM clase_estudiantes WHERE clase_id = ?', [claseId]);
  if (Array.isArray(estudianteIds) && estudianteIds.length > 0) {
    const values = estudianteIds.map(id => [claseId, id]);
    await pool.query(
      'INSERT IGNORE INTO clase_estudiantes (clase_id, estudiante_id) VALUES ?',
      [values]
    );
  }
}

async function updateById(id, classData) {
  const { asignatura, modulo, semestre, profesor_nombre, dia_semana, horario, hora_inicio, hora_fin, aula, docente_id } = classData;
  const fields = ['asignatura=?', 'modulo=?', 'semestre=?', 'profesor_nombre=?', 'dia_semana=?', 'horario=?', 'hora_inicio=?', 'hora_fin=?', 'aula=?'];
  const values = [asignatura, modulo, semestre, profesor_nombre, dia_semana, horario, hora_inicio, hora_fin, aula];

  if (docente_id !== undefined && docente_id !== null) {
    fields.push('docente_id=?');
    values.push(docente_id);
  }

  values.push(id);
  const [result] = await pool.query(
    `UPDATE classes SET ${fields.join(', ')} WHERE id=?`,
    values
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
  setClassStudents,
  removeStudentFromClass,
  updateById,
  deleteById
};
