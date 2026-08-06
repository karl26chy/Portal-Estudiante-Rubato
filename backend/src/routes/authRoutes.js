// routes/authRoutes.js - Rutas de autenticación
const express = require('express');
const router = express.Router();
const { login, logout, getMe, register, getCredentials, updateUser, deleteUser, getUsersByRole } = require('../controllers/authController');
const { authenticateJWT } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');

// Rutas Públicas
router.post('/login', login);
router.post('/logout', logout);

// Rutas Protegidas (Requieren JWT)
router.get('/me', authenticateJWT, getMe);

// Rutas de Administración (Requieren JWT y Rol ADMIN)
router.post('/register', authenticateJWT, requireRole('ADMIN'), register);
router.put('/user/:id', authenticateJWT, requireRole('ADMIN'), updateUser);
router.delete('/user/:id', authenticateJWT, requireRole('ADMIN'), deleteUser);
router.get('/credentials/:id', authenticateJWT, requireRole('ADMIN'), getCredentials);
router.get('/users', authenticateJWT, requireRole('ADMIN'), getUsersByRole);

module.exports = router;
