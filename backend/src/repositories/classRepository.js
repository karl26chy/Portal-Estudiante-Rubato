// repositories/classRepository.js - Capa de acceso a datos para clases
const { pool } = require('../config/db');

const BASE_CLASS_SELECT = `
  SELECT c.*, 
         ci.nombre AS ciclo_nombre, 
         ci.semestre AS ciclo_semestre,
         ci.anio AS ciclo_anio,
         ci.estado AS ciclo_estado, 
         (ci.estado = 'ABIERTO' AND ci.fecha_fin >= CURDATE()) AS ciclo_abierto
  FROM classes c
  LEFT JOIN ciclos ci ON ci.id = c.ciclo_id
`;

const formatClassRow = (r) => ({
  ...r,
  ciclo_abierto: r.ciclo_abierto !== undefined && r.ciclo_abierto !== null ? Boolean(r.ciclo_abierto) : true
});

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

  return classes.map(c => formatClassRow({
    ...c,
    studentIds: mapByClass[c.id] ? mapByClass[c.id].studentIds : [],
    studentNames: mapByClass[c.id] ? mapByClass[c.id].studentNames : []
  }));
}

async function findAll() {
  const [rows] = await pool.query(`${BASE_CLASS_SELECT} ORDER BY c.id ASC`);
  return attachStudentsToClasses(rows);
}

async function findByDocenteId(docenteId) {
  const [rows] = await pool.query(
    `${BASE_CLASS_SELECT} WHERE c.docente_id = ? ORDER BY c.asignatura ASC`,
    [docenteId]
  );
  return attachStudentsToClasses(rows);
}

async function findByEstudianteId(estudianteId) {
  const [rows] = await pool.query(
    `${BASE_CLASS_SELECT}
     INNER JOIN clase_estudiantes ce ON ce.clase_id = c.id
     WHERE ce.estudiante_id = ?
     ORDER BY c.asignatura ASC`,
    [estudianteId]
  );
  return attachStudentsToClasses(rows);
}

async function create(classData) {
  const { asignatura, modulo, semestre, profesor_nombre, profesor_titulo, dia_semana, horario, hora_inicio, hora_fin, aula, nota, asistencia, docente_id, ciclo_id } = classData;
  const [result] = await pool.query(
    `INSERT INTO classes (asignatura, modulo, semestre, profesor_nombre, profesor_titulo, dia_semana, horario, hora_inicio, hora_fin, aula, nota, asistencia, docente_id, ciclo_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [asignatura, modulo, semestre, profesor_nombre, profesor_titulo, dia_semana, horario, hora_inicio, hora_fin, aula, nota, asistencia, docente_id, ciclo_id]
  );

  return findById(result.insertId);
}

async function findConflictsByTeacher({ docente_id, ciclo_id, dia_semana, hora_inicio, hora_fin, excludeId }) {
  let query = `
    SELECT c.* 
    FROM classes c
    LEFT JOIN ciclos ci ON ci.id = c.ciclo_id
    WHERE c.docente_id = ?
      AND (ci.id IS NULL OR (ci.estado = 'ABIERTO' AND ci.fecha_fin >= CURDATE()))
      AND c.dia_semana = ?
      AND c.hora_inicio IS NOT NULL
      AND c.hora_fin IS NOT NULL
      AND (? < c.hora_fin)
      AND (? > c.hora_inicio)
  `;
  const params = [docente_id, dia_semana, hora_inicio, hora_fin];

  if (ciclo_id) {
    query += ' AND c.ciclo_id = ?';
    params.push(ciclo_id);
  }

  if (excludeId) {
    query += ' AND c.id != ?';
    params.push(excludeId);
  }

  const [rows] = await pool.query(query, params);
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query(`${BASE_CLASS_SELECT} WHERE c.id = ?`, [id]);
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
  const { asignatura, modulo, semestre, profesor_nombre, dia_semana, horario, hora_inicio, hora_fin, aula, docente_id, ciclo_id } = classData;
  const fields = ['asignatura=?', 'modulo=?', 'semestre=?', 'profesor_nombre=?', 'dia_semana=?', 'horario=?', 'hora_inicio=?', 'hora_fin=?', 'aula=?'];
  const values = [asignatura, modulo, semestre, profesor_nombre, dia_semana, horario, hora_inicio, hora_fin, aula];

  if (docente_id !== undefined && docente_id !== null) {
    fields.push('docente_id=?');
    values.push(docente_id);
  }

  if (ciclo_id !== undefined && ciclo_id !== null) {
    fields.push('ciclo_id=?');
    values.push(ciclo_id);
  }

  values.push(id);
  const [result] = await pool.query(
    `UPDATE classes SET ${fields.join(', ')} WHERE id=?`,
    values
  );
  if (result.affectedRows === 0) return null;
  return findById(id);
}

async function findByDocenteIdAndActiveCycle(docenteId) {
  const [rows] = await pool.query(
    `${BASE_CLASS_SELECT}
     WHERE c.docente_id = ?
       AND ci.estado = 'ABIERTO'
       AND ci.fecha_fin >= CURDATE()
     ORDER BY c.asignatura ASC`,
    [docenteId]
  );
  return attachStudentsToClasses(rows);
}

async function deleteById(id) {
  const [result] = await pool.query('DELETE FROM classes WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = {
  findAll,
  findByDocenteId,
  findByDocenteIdAndActiveCycle,
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
