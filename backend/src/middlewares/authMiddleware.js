// middlewares/authMiddleware.js - Middleware de autenticación y roles
const { verifyToken } = require('../utils/jwt');

// Verificar si existe token válido en cookies HttpOnly o Header Authorization
function authenticateToken(req, res, next) {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Acceso no autorizado. Token no proporcionado.' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ error: 'Token inválido o expirado.' });
  }

  req.user = decoded;
  next();
}

// Middleware para restringir por roles
function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Acceso denegado. Se requiere uno de los siguientes roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
}

module.exports = {
  authenticateToken,
  requireRole
};
