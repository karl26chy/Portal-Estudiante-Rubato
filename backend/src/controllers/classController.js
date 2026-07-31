// controllers/classController.js - Gestión de clases, horarios y calificaciones
const classService = require('../services/classService');

async function getClasses(req, res) {
  try {
    const classes = await classService.getAllClasses();
    
    return res.json({
      role: req.user.role,
      usuario: req.user.nombre,
      classes: classes
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
    console.error('Error al crear clase:', error);
    return res.status(500).json({ error: 'Error interno al crear la clase.' });
  }
}

module.exports = {
  getClasses,
  createClass
};
