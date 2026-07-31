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
  // Ya viene req.user gracias a authenticateJWT
  if (!req.user) {
    return res.status(401).json({ authenticated: false, user: null });
  }

  return res.json({ authenticated: true, user: req.user });
}

// POST /api/auth/register (Solo ADMIN)
async function register(req, res) {
  try {
    const userData = req.body;
    const result = await authService.registerUser(userData);
    
    return res.status(201).json({
      message: 'Usuario registrado exitosamente',
      data: result
    });
  } catch (error) {
    console.error('Error en register:', error);
    if (error.message === 'El correo electrónico ya está en uso.' || error.message === 'Faltan campos obligatorios para el registro.') {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Error interno en el servidor durante el registro.' });
  }
}

// GET /api/auth/credentials/:id (Solo ADMIN)
async function getCredentials(req, res) {
  try {
    const targetUserId = req.params.id;
    const decryptedPassword = await authService.getDecryptedCredentials(targetUserId);
    
    return res.json({
      message: 'Credenciales obtenidas',
      password: decryptedPassword
    });
  } catch (error) {
    console.error('Error en getCredentials:', error);
    if (error.message === 'No se encontraron credenciales para este usuario.') {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Error al obtener credenciales.' });
  }
}

module.exports = {
  login,
  logout,
  getMe,
  register,
  getCredentials
};
