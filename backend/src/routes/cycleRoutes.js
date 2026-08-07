// routes/cycleRoutes.js - Rutas protegidas para gestión de ciclos académicos
const express = require('express');
const router = express.Router();
const { getCycles, createCycle, updateCycle, closeCycle, deleteCycle } = require('../controllers/cycleController');
const { authenticateJWT } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');

// Todas las rutas de ciclos requieren usuario autenticado
router.use(authenticateJWT);

// Lectura de ciclos: cualquier rol autenticado
router.get('/', getCycles);

// Operaciones de escritura: restringidas únicamente a ADMIN
router.post('/', requireRole(['ADMIN']), createCycle);
router.put('/:id', requireRole(['ADMIN']), updateCycle);
router.post('/:id/close', requireRole(['ADMIN']), closeCycle);
router.delete('/:id', requireRole(['ADMIN']), deleteCycle);

module.exports = router;
