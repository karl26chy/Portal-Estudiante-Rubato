// routes/authRoutes.js - Rutas de autenticación
const express = require('express');
const router = express.Router();
const { login, logout, getMe, register, getCredentials } = require('../controllers/authController');
const { authenticateJWT } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');

// Rutas Públicas
router.post('/login', login);
router.post('/logout', logout);

// Rutas Protegidas (Requieren JWT)
router.get('/me', authenticateJWT, getMe);

// Rutas de Administración (Requieren JWT y Rol ADMIN)
router.post('/register', authenticateJWT, requireRole('ADMIN'), register);
router.get('/credentials/:id', authenticateJWT, requireRole('ADMIN'), getCredentials);

module.exports = router;
