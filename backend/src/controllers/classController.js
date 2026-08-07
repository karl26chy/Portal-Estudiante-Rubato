// controllers/classController.js - Gestión de clases, horarios y calificaciones
const classService = require('../services/classService');

async function getClasses(req, res) {
  try {
    const activeOnly = req.query.activeOnly === 'true';
    const classes = await classService.getAllClasses(req.user, { activeOnly });
    return res.json({
      role: req.user.role,
      usuario: req.user.nombre,
      classes
    });
  } catch (error) {
    console.error('Error al obtener clases:', error);
    return res.status(500).json({ error: 'Error interno al obtener las clases.' });
  }
}

async function createClass(req, res) {
  try {
    const newClass = await classService.createClass(req.body, req.user);
    return res.status(201).json({ message: 'Clase creada correctamente', newClass });
  } catch (error) {
    if (error.status === 409) {
      return res.status(409).json({
        error: error.message,
        conflict: error.conflictClass
      });
    }
    console.error('Error al crear clase:', error);
    return res.status(500).json({ error: 'Error interno al crear la clase.' });
  }
}

async function updateClass(req, res) {
  try {
    const updated = await classService.updateClass(req.params.id, req.body, req.user);
    return res.json({ message: 'Clase actualizada correctamente', updatedClass: updated });
  } catch (error) {
    console.error('Error al actualizar clase:', error);
    const status = error.status || 500;
    return res.status(status).json({ error: error.message });
  }
}

async function deleteClass(req, res) {
  try {
    const result = await classService.deleteClass(req.params.id, req.user);
    return res.json({ message: 'Clase eliminada correctamente', data: result });
  } catch (error) {
    console.error('Error al eliminar clase:', error);
    const status = error.status || 500;
    return res.status(status).json({ error: error.message });
  }
}

async function getClassStudents(req, res) {
  try {
    const students = await classService.getClassStudents(req.params.claseId, req.user);
    return res.json({ students });
  } catch (error) {
    console.error('Error al obtener estudiantes de la clase:', error);
    const status = error.status || 500;
    return res.status(status).json({ error: error.message });
  }
}

async function removeStudentFromClass(req, res) {
  try {
    const result = await classService.removeStudentFromClass(req.params.claseId, req.params.estudianteId, req.user);
    return res.json({
      message: 'Estudiante desvinculado de la clase correctamente',
      data: result
    });
  } catch (error) {
    console.error('Error al desvincular estudiante de la clase:', error);
    const status = error.status || 500;
    return res.status(status).json({ error: error.message });
  }
}

module.exports = {
  getClasses,
  createClass,
  updateClass,
  deleteClass,
  getClassStudents,
  removeStudentFromClass
};
