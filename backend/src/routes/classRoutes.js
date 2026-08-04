// routes/classRoutes.js - Rutas protegidas para gestión de clases
const express = require('express');
const router = express.Router();
const { getClasses, createClass } = require('../controllers/classController');
const { authenticateJWT } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');

// Todas las rutas de clases requieren estar autenticado
router.use(authenticateJWT);

// Obtener clases (accesible para estudiantes, profesores y admin)
router.get('/', getClasses);

// Crear clase (restringido exclusivamente a rol ADMIN)
router.post('/', requireRole('ADMIN'), createClass);

module.exports = router;
