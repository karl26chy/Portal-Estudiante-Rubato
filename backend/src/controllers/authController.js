// controllers/authController.js - Lógica de inicio de sesión y gestión de credenciales
const { generateToken, verifyToken } = require('../utils/jwt');

// Usuarios de prueba predefinidos (Mock DB)
const MOCK_USERS = [
  { id: 1, usuario: 'admin@rubato.org', nombre: 'Admin Fundación Rubato', role: 'admin' },
  { id: 2, usuario: 'profesor@rubato.org', nombre: 'Maestro Carlos Silva', role: 'professor' },
  { id: 3, usuario: 'estudiante@rubato.org', nombre: 'Ana María Gómez', role: 'student' }
];

// POST /api/auth/login
async function login(req, res) {
  try {
    const { usuario, roleRequested } = req.body;

    // Buscar usuario por correo o por rol solicitado
    let user = MOCK_USERS.find(u => u.usuario.toLowerCase() === (usuario || '').toLowerCase());
    
    if (!user && roleRequested) {
      user = MOCK_USERS.find(u => u.role === roleRequested);
    }

    if (!user) {
      // Si se envía un correo personalizado, asignamos rol por defecto 'student'
      user = {
        id: Date.now(),
        usuario: usuario || 'estudiante@rubato.org',
        nombre: usuario ? usuario.split('@')[0] : 'Estudiante Rubato',
        role: roleRequested || 'student'
      };
    }

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
