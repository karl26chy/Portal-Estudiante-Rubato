// services/academicService.js - Lógica de negocio para asistencia y notas
const academicRepository = require('../repositories/academicRepository');
const { pool } = require('../config/db');

const calcNotaFinal = (corte1, corte2) => {
  if (corte1 === null || corte1 === undefined || corte2 === null || corte2 === undefined) return null;
  return Math.round((corte1 * 0.5 + corte2 * 0.5) * 10) / 10;
};

async function resolveEstudianteId(studentName) {
  if (!studentName) return null;
  const [rows] = await pool.query(
    `SELECT id FROM users
     WHERE role = 'ESTUDIANTE'
       AND LOWER(CONCAT(nombre, ' ', apellido)) = LOWER(?)
     LIMIT 1`,
    [studentName.trim()]
  );
  return rows[0] ? rows[0].id : null;
}

async function getAttendance({ classId, studentName, estudianteId }) {
  const eid = estudianteId || (studentName ? await resolveEstudianteId(studentName) : null);

  if (classId && eid) {
    return academicRepository.findAttendanceByClassAndStudent(classId, eid);
  }
  if (classId) {
    return academicRepository.findAttendanceByClass(classId);
  }
  if (eid) {
    return academicRepository.findAttendanceByStudent(eid);
  }
  return [];
}

async function saveAttendance({ classId, fecha, records }) {
  if (!classId || !fecha || !Array.isArray(records)) {
    throw new Error('Faltan datos obligatorios para guardar asistencia.');
  }

  for (const record of records) {
    const { studentName, estudianteId, present } = record;
    const eid = estudianteId || (studentName ? await resolveEstudianteId(studentName) : null);
    if (!eid) continue;

    const name = studentName || '';
    const asistencia = present ? 'P' : 'A';
    await academicRepository.upsertAttendance(classId, eid, name, fecha, asistencia);
  }

  return { message: 'Asistencia guardada correctamente', saved: records.length };
}

async function getGrades({ classId, studentName, estudianteId }) {
  const eid = estudianteId || (studentName ? await resolveEstudianteId(studentName) : null);

  if (classId && eid) {
    return academicRepository.findGradesByClassAndStudent(classId, eid);
  }
  if (classId) {
    return academicRepository.findGradesByClass(classId);
  }
  if (eid) {
    return academicRepository.findGradesByStudent(eid);
  }
  return [];
}

async function saveGrades({ classId, records }) {
  if (!classId || !Array.isArray(records)) {
    throw new Error('Faltan datos obligatorios para guardar notas.');
  }

  for (const record of records) {
    const { studentName, estudianteId, corte1, corte2 } = record;
    const eid = estudianteId || (studentName ? await resolveEstudianteId(studentName) : null);
    if (!eid) continue;

    const c1 = corte1 === null || corte1 === undefined || corte1 === '' ? null : Number(corte1);
    const c2 = corte2 === null || corte2 === undefined || corte2 === '' ? null : Number(corte2);
    const notaFinal = calcNotaFinal(c1, c2);
    const name = studentName || '';

    await academicRepository.upsertGrade(classId, eid, name, c1, c2, notaFinal);
  }

  return { message: 'Notas guardadas correctamente', saved: records.length };
}

module.exports = {
  getAttendance,
  saveAttendance,
  getGrades,
  saveGrades
};
