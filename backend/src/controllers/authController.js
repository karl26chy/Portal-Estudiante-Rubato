// controllers/authController.js - Lógica de inicio de sesión y gestión de credenciales
const { generateToken, verifyToken } = require('../utils/jwt');
const authService = require('../services/authService');

// POST /api/auth/login
async function login(req, res) {
  try {
    const { usuario, password, roleRequested } = req.body;

    const user = await authService.authenticateUser(usuario, password, roleRequested);

    // Firmar token JWT sin la contraseña
    const token = generateToken(user);

    // Enviar token en cookie HttpOnly con SameSite Strict
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 horas
    });

    return res.json({
      message: 'Inicio de sesión exitoso',
      user: {
        id: user.id,
        usuario: user.usuario,
        nombre: user.nombre,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    
    if (error.message === 'Usuario no encontrado' || error.message === 'Credenciales inválidas') {
      return res.status(401).json({ error: error.message });
    }
    
    return res.status(500).json({ error: 'Error interno en el servidor durante el inicio de sesión.' });
  }
}

// POST /api/auth/logout
function logout(req, res) {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  return res.json({ message: 'Sesión cerrada correctamente' });
}

// GET /api/auth/me
function getMe(req, res) {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ authenticated: false, user: null });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ authenticated: false, user: null });
  }

  return res.json({ authenticated: true, user: decoded });
}

module.exports = {
  login,
  logout,
  getMe
};
