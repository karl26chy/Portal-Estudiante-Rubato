const { pool } = require('../config/db');

const BASE_CLASS_SELECT = `
  SELECT c.*, 
         ci.nombre AS ciclo_nombre, 
         ci.semestre AS ciclo_semestre,
         ci.anio AS ciclo_anio,
         ci.estado AS ciclo_estado, 
         (ci.estado = 'ABIERTO' AND ci.fecha_fin >= CURRENT_DATE) AS ciclo_abierto
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
  const result = await pool.query(
    `SELECT ce.clase_id, u.id AS estudiante_id, u.nombre, u.apellido
     FROM clase_estudiantes ce
     INNER JOIN users u ON u.id = ce.estudiante_id
     WHERE ce.clase_id = ANY($1)
     ORDER BY u.apellido ASC, u.nombre ASC`,
    [classIds]
  );

  const mapByClass = {};
  result.rows.forEach(r => {
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
  const result = await pool.query(`${BASE_CLASS_SELECT} ORDER BY c.id ASC`);
  return attachStudentsToClasses(result.rows);
}

async function findByDocenteId(docenteId) {
  const result = await pool.query(
    `${BASE_CLASS_SELECT} WHERE c.docente_id = $1 ORDER BY c.asignatura ASC`,
    [docenteId]
  );
  return attachStudentsToClasses(result.rows);
}

async function findByEstudianteId(estudianteId) {
  const result = await pool.query(
    `${BASE_CLASS_SELECT}
     INNER JOIN clase_estudiantes ce ON ce.clase_id = c.id
     WHERE ce.estudiante_id = $1
     ORDER BY c.asignatura ASC`,
    [estudianteId]
  );
  return attachStudentsToClasses(result.rows);
}

async function create(classData) {
  const { asignatura, modulo, semestre, profesor_nombre, profesor_titulo, dia_semana, horario, hora_inicio, hora_fin, aula, nota, asistencia, docente_id, ciclo_id } = classData;
  const result = await pool.query(
    `INSERT INTO classes (asignatura, modulo, semestre, profesor_nombre, profesor_titulo, dia_semana, horario, hora_inicio, hora_fin, aula, nota, asistencia, docente_id, ciclo_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
     RETURNING id`,
    [asignatura, modulo, semestre, profesor_nombre, profesor_titulo, dia_semana, horario, hora_inicio, hora_fin, aula, nota, asistencia, docente_id, ciclo_id]
  );

  return findById(result.rows[0].id);
}

async function findConflictsByTeacher({ docente_id, ciclo_id, dia_semana, hora_inicio, hora_fin, excludeId }) {
  let query = `
    SELECT c.* 
    FROM classes c
    LEFT JOIN ciclos ci ON ci.id = c.ciclo_id
    WHERE c.docente_id = $1
      AND (ci.id IS NULL OR (ci.estado = 'ABIERTO' AND ci.fecha_fin >= CURRENT_DATE))
      AND c.dia_semana = $2
      AND c.hora_inicio IS NOT NULL
      AND c.hora_fin IS NOT NULL
      AND ($3 < c.hora_fin)
      AND ($4 > c.hora_inicio)
  `;
  const params = [docente_id, dia_semana, hora_inicio, hora_fin];
  let paramIndex = 5;

  if (ciclo_id) {
    query += ` AND c.ciclo_id = $${paramIndex++}`;
    params.push(ciclo_id);
  }

  if (excludeId) {
    query += ` AND c.id != $${paramIndex++}`;
    params.push(excludeId);
  }

  const result = await pool.query(query, params);
  return result.rows;
}

async function findById(id) {
  const result = await pool.query(`${BASE_CLASS_SELECT} WHERE c.id = $1`, [id]);
  if (!result.rows[0]) return null;
  const [withStudents] = await attachStudentsToClasses([result.rows[0]]);
  return withStudents;
}

async function findStudentsByClassId(claseId) {
  const result = await pool.query(
    `SELECT u.id, u.nombre, u.apellido, u.email, u.username, u.role
     FROM clase_estudiantes ce
     INNER JOIN users u ON u.id = ce.estudiante_id
     WHERE ce.clase_id = $1
     ORDER BY u.apellido ASC, u.nombre ASC`,
    [claseId]
  );
  return result.rows;
}

async function addStudentToClass(claseId, estudianteId) {
  const result = await pool.query(
    'INSERT INTO clase_estudiantes (clase_id, estudiante_id) VALUES ($1, $2) ON CONFLICT (clase_id, estudiante_id) DO NOTHING',
    [claseId, estudianteId]
  );
  return result.rowCount > 0;
}

async function addStudentsToClass(claseId, estudianteIds) {
  if (!Array.isArray(estudianteIds) || estudianteIds.length === 0) return 0;
  const values = estudianteIds.map(id => [claseId, id]);
  const flatValues = values.flat();
  const placeholders = values.map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`).join(', ');
  const result = await pool.query(
    `INSERT INTO clase_estudiantes (clase_id, estudiante_id) VALUES ${placeholders} ON CONFLICT (clase_id, estudiante_id) DO NOTHING`,
    flatValues
  );
  return result.rowCount;
}

async function removeStudentFromClass(claseId, estudianteId) {
  const result = await pool.query(
    'DELETE FROM clase_estudiantes WHERE clase_id = $1 AND estudiante_id = $2',
    [claseId, estudianteId]
  );
  return result.rowCount > 0;
}

async function setClassStudents(claseId, estudianteIds) {
  await pool.query('DELETE FROM clase_estudiantes WHERE clase_id = $1', [claseId]);
  if (Array.isArray(estudianteIds) && estudianteIds.length > 0) {
    const values = estudianteIds.map(id => [claseId, id]);
    const flatValues = values.flat();
    const placeholders = values.map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`).join(', ');
    await pool.query(
      `INSERT INTO clase_estudiantes (clase_id, estudiante_id) VALUES ${placeholders} ON CONFLICT (clase_id, estudiante_id) DO NOTHING`,
      flatValues
    );
  }
}

async function updateById(id, classData) {
  const { asignatura, modulo, semestre, profesor_nombre, dia_semana, horario, hora_inicio, hora_fin, aula, docente_id, ciclo_id } = classData;
  const fields = ['asignatura=$1', 'modulo=$2', 'semestre=$3', 'profesor_nombre=$4', 'dia_semana=$5', 'horario=$6', 'hora_inicio=$7', 'hora_fin=$8', 'aula=$9'];
  const values = [asignatura, modulo, semestre, profesor_nombre, dia_semana, horario, hora_inicio, hora_fin, aula];
  let paramIndex = 10;

  if (docente_id !== undefined && docente_id !== null) {
    fields.push(`docente_id=$${paramIndex++}`);
    values.push(docente_id);
  }

  if (ciclo_id !== undefined && ciclo_id !== null) {
    fields.push(`ciclo_id=$${paramIndex++}`);
    values.push(ciclo_id);
  }

  values.push(id);
  const result = await pool.query(
    `UPDATE classes SET ${fields.join(', ')} WHERE id=$${paramIndex}`,
    values
  );
  if (result.rowCount === 0) return null;
  return findById(id);
}

async function findByDocenteIdAndActiveCycle(docenteId) {
  const result = await pool.query(
    `${BASE_CLASS_SELECT}
     WHERE c.docente_id = $1
       AND ci.estado = 'ABIERTO'
       AND ci.fecha_fin >= CURRENT_DATE
     ORDER BY c.asignatura ASC`,
    [docenteId]
  );
  return attachStudentsToClasses(result.rows);
}

async function deleteById(id) {
  const result = await pool.query('DELETE FROM classes WHERE id = $1', [id]);
  return result.rowCount > 0;
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
