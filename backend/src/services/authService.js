// services/authService.js - Capa de lógica de negocio para autenticación
const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');
const cryptoHelper = require('../helpers/cryptoHelper');
const { generateBaseUsername, generateSecurePassword } = require('../utils/passwordGenerator');

async function authenticateUser(identifier, password, roleRequested) {
  // Para autenticación siempre necesitamos las credenciales en producción
  if (!identifier) {
    throw new Error('Debe proporcionar un usuario o correo.');
  }

  const user = await userRepository.findByUsernameOrEmail(identifier);

  // Mensaje genérico para no permitir enumeración de usuarios
  if (!user) {
    throw new Error('Credenciales inválidas');
  }

  // Verificar si se solicitó un rol específico (opcional, pero útil si hay múltiples portales)
  if (roleRequested && user.role.toUpperCase() !== roleRequested.toUpperCase()) {
    throw new Error('El usuario no tiene el rol solicitado.');
  }

  if (!password) {
    throw new Error('Contraseña requerida');
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new Error('Credenciales inválidas');
  }

  // Devolver el usuario limpio
  return {
    id: user.id,
    usuario: user.username,
    nombre: user.nombre,
    apellido: user.apellido,
    email: user.email,
    role: user.role
  };
}

/**
 * Registra un nuevo usuario con generación automática de credenciales.
 */
async function registerUser(userData) {
  const { nombre, apellido, email, role } = userData;

  if (!nombre || !apellido || !email || !role) {
    throw new Error('Faltan campos obligatorios para el registro.');
  }

  const VALID_ROLES = ['ADMIN', 'DOCENTE', 'ESTUDIANTE'];
  const normalizedRole = role.toUpperCase();
  if (!VALID_ROLES.includes(normalizedRole)) {
    throw new Error('Rol inválido. Debe ser ADMIN, DOCENTE o ESTUDIANTE.');
  }

  // Verificar que el email no exista
  const existingUserByEmail = await userRepository.findByUsernameOrEmail(email);
  if (existingUserByEmail) {
    throw new Error('El correo electrónico ya está en uso.');
  }

  // Generar username único
  let baseUsername = generateBaseUsername(nombre, apellido);
  let username = baseUsername;
  let suffix = 1;
  while (await userRepository.findByUsernameOrEmail(username)) {
    username = `${baseUsername}${String(suffix).padStart(2, '0')}`;
    suffix++;
  }

  // Generar contraseña y cifrar
  const password = generateSecurePassword();
  
  // Hash para login (Bcrypt)
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);
  
  // Cifrado reversible para visualización de Admin (AES-256)
  const password_encrypted = cryptoHelper.encrypt(password);

  const newUser = {
    nombre,
    apellido,
    email,
    username,
    role: normalizedRole,
    password_hash,
    password_encrypted
  };

  const insertId = await userRepository.createUser(newUser);

  // Retornar la información junto con las credenciales en texto plano (solo por esta vez)
  return {
    id: insertId,
    nombre,
    apellido,
    email,
    role: newUser.role,
    credentials: {
      username,
      password // En texto plano para mostrar al admin creador
    }
  };
}

/**
 * Obtiene la contraseña descifrada de un usuario (Solo Admin).
 */
async function getDecryptedCredentials(targetUserId) {
  const encryptedPassword = await userRepository.getEncryptedPasswordById(targetUserId);
  if (!encryptedPassword) {
    throw new Error('No se encontraron credenciales para este usuario.');
  }

  const decryptedPassword = cryptoHelper.decrypt(encryptedPassword);
  return decryptedPassword;
}

module.exports = {
  authenticateUser,
  registerUser,
  getDecryptedCredentials
};
