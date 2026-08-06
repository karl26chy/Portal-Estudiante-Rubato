// routes/academicRoutes.js - Rutas protegidas de asistencia y notas (Docente y Admin)
const express = require('express');
const router = express.Router();
const { getAttendance, saveAttendance, getGrades, saveGrades } = require('../controllers/academicController');
const { authenticateJWT } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');

// Todas las rutas académicas requieren autenticación
router.use(authenticateJWT);

// Lectura: accesible para estudiantes (solo sus propios datos), docentes y admin
router.get('/attendance', getAttendance);
router.get('/grades', getGrades);

// Escritura: restringida a DOCENTE o ADMIN
router.post('/attendance', requireRole(['DOCENTE', 'ADMIN']), saveAttendance);
router.post('/grades', requireRole(['DOCENTE', 'ADMIN']), saveGrades);

module.exports = router;
