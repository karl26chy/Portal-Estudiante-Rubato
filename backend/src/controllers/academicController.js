// controllers/academicController.js - Asistencia y notas de los docentes
const academicService = require('../services/academicService');
const { pool } = require('../config/db');

async function verifyDocenteOwnsClass(classId, userId) {
  if (!classId || !userId) return false;
  const [rows] = await pool.query(
    'SELECT id FROM classes WHERE id = ? AND docente_id = ? LIMIT 1',
    [classId, userId]
  );
  return rows.length > 0;
}

async function getAttendance(req, res) {
  try {
    const estudianteId = req.user.role === 'ESTUDIANTE' ? req.user.id : (req.query.estudianteId || undefined);
    const studentName = req.user.role === 'ESTUDIANTE' ? `${req.user.nombre} ${req.user.apellido || ''}`.trim() : req.query.studentName;
    const attendance = await academicService.getAttendance({
      classId: req.query.classId,
      studentName,
      estudianteId
    });
    return res.json({ attendance });
  } catch (error) {
    console.error('Error al obtener asistencia:', error);
    return res.status(500).json({ error: 'Error interno al obtener la asistencia.' });
  }
}

async function saveAttendance(req, res) {
  try {
    const { classId } = req.body;
    if (req.user.role === 'DOCENTE' && classId) {
      const owns = await verifyDocenteOwnsClass(classId, req.user.id);
      if (!owns) {
        return res.status(403).json({ error: 'No tienes permiso para modificar la asistencia de esta clase.' });
      }
    }
    const result = await academicService.saveAttendance(req.body);
    return res.json(result);
  } catch (error) {
    console.error('Error al guardar asistencia:', error);
    return res.status(400).json({ error: error.message || 'Error al guardar la asistencia.' });
  }
}

async function getGrades(req, res) {
  try {
    const estudianteId = req.user.role === 'ESTUDIANTE' ? req.user.id : (req.query.estudianteId || undefined);
    const studentName = req.user.role === 'ESTUDIANTE' ? `${req.user.nombre} ${req.user.apellido || ''}`.trim() : req.query.studentName;
    const grades = await academicService.getGrades({
      classId: req.query.classId,
      studentName,
      estudianteId
    });
    return res.json({ grades });
  } catch (error) {
    console.error('Error al obtener notas:', error);
    return res.status(500).json({ error: 'Error interno al obtener las notas.' });
  }
}

async function saveGrades(req, res) {
  try {
    const { classId } = req.body;
    if (req.user.role === 'DOCENTE' && classId) {
      const owns = await verifyDocenteOwnsClass(classId, req.user.id);
      if (!owns) {
        return res.status(403).json({ error: 'No tienes permiso para modificar las notas de esta clase.' });
      }
    }
    const result = await academicService.saveGrades(req.body);
    return res.json(result);
  } catch (error) {
    console.error('Error al guardar notas:', error);
    return res.status(400).json({ error: error.message || 'Error al guardar las notas.' });
  }
}

module.exports = {
  getAttendance,
  saveAttendance,
  getGrades,
  saveGrades
};
