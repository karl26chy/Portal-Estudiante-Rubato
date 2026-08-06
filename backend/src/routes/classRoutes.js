// routes/classRoutes.js - Rutas protegidas para gestión de clases
const express = require('express');
const router = express.Router();
const { getClasses, createClass, updateClass, deleteClass, getClassStudents, removeStudentFromClass } = require('../controllers/classController');
const { authenticateJWT } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');

// Todas las rutas de clases requieren estar autenticado
router.use(authenticateJWT);

// Obtener clases (accesible para todos los roles autenticados)
router.get('/', getClasses);

// Crear clase (solo ADMIN)
router.post('/', requireRole('ADMIN'), createClass);

// Actualizar clase (ADMIN o DOCENTE dueño — verificado en el service)
router.put('/:id', requireRole(['DOCENTE', 'ADMIN']), updateClass);

// Eliminar clase (ADMIN o DOCENTE dueño — verificado en el service)
router.delete('/:id', requireRole(['DOCENTE', 'ADMIN']), deleteClass);

// Obtener estudiantes matriculados en una clase
router.get('/:claseId/students', getClassStudents);

// Desvincular un estudiante de una clase (ADMIN o DOCENTE dueño)
router.delete('/:claseId/students/:estudianteId', requireRole(['DOCENTE', 'ADMIN']), removeStudentFromClass);

module.exports = router;
