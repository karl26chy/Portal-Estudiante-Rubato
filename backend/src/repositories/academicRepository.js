const { pool } = require('../config/db');

async function findAttendanceByClass(classId) {
  const result = await pool.query(
    'SELECT * FROM attendance WHERE class_id = $1 ORDER BY fecha ASC, student_name ASC',
    [classId]
  );
  return result.rows;
}

async function findAttendanceByStudent(estudianteId) {
  const result = await pool.query(
    'SELECT * FROM attendance WHERE estudiante_id = $1 ORDER BY fecha ASC, class_id ASC',
    [estudianteId]
  );
  return result.rows;
}

async function findAttendanceByClassAndStudent(classId, estudianteId) {
  const result = await pool.query(
    'SELECT * FROM attendance WHERE class_id = $1 AND estudiante_id = $2 ORDER BY fecha ASC',
    [classId, estudianteId]
  );
  return result.rows;
}

async function upsertAttendance(classId, estudianteId, studentName, fecha, asistencia) {
  await pool.query(
    `INSERT INTO attendance (class_id, estudiante_id, student_name, fecha, asistencia)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (class_id, estudiante_id, fecha)
     DO UPDATE SET asistencia = EXCLUDED.asistencia, student_name = EXCLUDED.student_name`,
    [classId, estudianteId, studentName, fecha, asistencia]
  );
}

async function findGradesByClass(classId) {
  const result = await pool.query(
    'SELECT * FROM grades WHERE class_id = $1 ORDER BY student_name ASC',
    [classId]
  );
  return result.rows;
}

async function findGradesByStudent(estudianteId) {
  const result = await pool.query(
    'SELECT * FROM grades WHERE estudiante_id = $1 ORDER BY class_id ASC',
    [estudianteId]
  );
  return result.rows;
}

async function findGradesByClassAndStudent(classId, estudianteId) {
  const result = await pool.query(
    'SELECT * FROM grades WHERE class_id = $1 AND estudiante_id = $2',
    [classId, estudianteId]
  );
  return result.rows;
}

async function upsertGrade(classId, estudianteId, studentName, corte1, corte2, notaFinal) {
  await pool.query(
    `INSERT INTO grades (class_id, estudiante_id, student_name, corte1, corte2, nota_final)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (class_id, estudiante_id)
     DO UPDATE SET corte1 = EXCLUDED.corte1, corte2 = EXCLUDED.corte2, nota_final = EXCLUDED.nota_final, student_name = EXCLUDED.student_name`,
    [classId, estudianteId, studentName, corte1, corte2, notaFinal]
  );
}

module.exports = {
  findAttendanceByClass,
  findAttendanceByStudent,
  findAttendanceByClassAndStudent,
  upsertAttendance,
  findGradesByClass,
  findGradesByStudent,
  findGradesByClassAndStudent,
  upsertGrade
};
