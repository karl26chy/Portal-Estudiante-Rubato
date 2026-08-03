// utils/jwt.js - Generación y verificación de tokens JWT
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

if (!JWT_SECRET) {
  throw new Error('Falta la variable de entorno JWT_SECRET. Defínela en el archivo .env');
}

// Generar token JWT excluyendo la contraseña por seguridad
function generateToken(payload) {
  const safePayload = {
    id: payload.id,
    role: payload.role,
    nombre: payload.nombre,
    usuario: payload.usuario
  };
  return jwt.sign(safePayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
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
  verifyToken
};
