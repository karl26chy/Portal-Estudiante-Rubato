// middlewares/authMiddleware.js
const { verifyToken } = require('../utils/jwt');

function authenticateJWT(req, res, next) {
  // Extraer token de las cookies o del header Authorization
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. Se requiere un token de autenticación.' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Token inválido o expirado.' });
  }

  // Adjuntar el usuario decodificado al request
  req.user = decoded;
  next();
}

module.exports = {
  authenticateJWT
};
