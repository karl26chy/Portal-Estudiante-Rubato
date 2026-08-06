// repositories/academicRepository.js - Capa de acceso a datos para asistencia y notas
const { pool } = require('../config/db');

async function findAttendanceByClass(classId) {
  const [rows] = await pool.query(
    'SELECT * FROM attendance WHERE class_id = ? ORDER BY fecha ASC, student_name ASC',
    [classId]
  );
  return rows;
}

async function findAttendanceByStudent(estudianteId) {
  const [rows] = await pool.query(
    'SELECT * FROM attendance WHERE estudiante_id = ? ORDER BY fecha ASC, class_id ASC',
    [estudianteId]
  );
  return rows;
}

async function findAttendanceByClassAndStudent(classId, estudianteId) {
  const [rows] = await pool.query(
    'SELECT * FROM attendance WHERE class_id = ? AND estudiante_id = ? ORDER BY fecha ASC',
    [classId, estudianteId]
  );
  return rows;
}

async function upsertAttendance(classId, estudianteId, studentName, fecha, asistencia) {
  await pool.query(
    `INSERT INTO attendance (class_id, estudiante_id, student_name, fecha, asistencia)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE asistencia = VALUES(asistencia), student_name = VALUES(student_name)`,
    [classId, estudianteId, studentName, fecha, asistencia]
  );
}

async function findGradesByClass(classId) {
  const [rows] = await pool.query(
    'SELECT * FROM grades WHERE class_id = ? ORDER BY student_name ASC',
    [classId]
  );
  return rows;
}

async function findGradesByStudent(estudianteId) {
  const [rows] = await pool.query(
    'SELECT * FROM grades WHERE estudiante_id = ? ORDER BY class_id ASC',
    [estudianteId]
  );
  return rows;
}

async function findGradesByClassAndStudent(classId, estudianteId) {
  const [rows] = await pool.query(
    'SELECT * FROM grades WHERE class_id = ? AND estudiante_id = ?',
    [classId, estudianteId]
  );
  return rows;
}

async function upsertGrade(classId, estudianteId, studentName, corte1, corte2, notaFinal) {
  await pool.query(
    `INSERT INTO grades (class_id, estudiante_id, student_name, corte1, corte2, nota_final)
     VALUES (?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE corte1 = VALUES(corte1), corte2 = VALUES(corte2), nota_final = VALUES(nota_final), student_name = VALUES(student_name)`,
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
