// routes/classRoutes.js - Rutas protegidas para gestión de clases
const express = require('express');
const router = express.Router();
const { getClasses, createClass } = require('../controllers/classController');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');

// Todas las rutas de clases requieren estar autenticado
router.use(authenticateToken);

// Obtener clases (accesible para estudiantes, profesores y admin)
router.get('/', getClasses);

// Crear clase (restringido a admin y profesores)
router.post('/', requireRole(['admin', 'professor']), createClass);

module.exports = router;
