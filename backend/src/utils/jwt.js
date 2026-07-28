// utils/jwt.js - Generación y verificación de tokens JWT
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'rubato_secret_key_2026_super_secure';

// Generar token JWT excluyendo la contraseña por seguridad
function generateToken(payload) {
  const safePayload = {
    id: payload.id,
    role: payload.role,
    nombre: payload.nombre,
    usuario: payload.usuario
  };
  return jwt.sign(safePayload, JWT_SECRET, { expiresIn: '24h' });
}

// Verificar token JWT
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

module.exports = {
  generateToken,
  verifyToken,
  JWT_SECRET
};
