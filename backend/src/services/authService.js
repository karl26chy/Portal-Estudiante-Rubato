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
  const { nombre, apellido, email, role, username: providedUsername, password: providedPassword } = userData;

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

  // Usar el username proporcionado o generar uno único
  let username = providedUsername;
  if (username) {
    if (await userRepository.findByUsernameOrEmail(username)) {
      throw new Error('El nombre de usuario ya está en uso.');
    }
  } else {
    let baseUsername = generateBaseUsername(nombre);
    let randomNum = Math.floor(10 + Math.random() * 90);
    username = `${baseUsername}${randomNum}`;
    while (await userRepository.findByUsernameOrEmail(username)) {
      randomNum = Math.floor(10 + Math.random() * 90);
      username = `${baseUsername}${randomNum}`;
    }
  }

  // Usar la contraseña proporcionada o generar una segura
  const password = providedPassword || generateSecurePassword();

  // Hash para login (Bcrypt)
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);
  
  // Cifrado reversible para visualización de Admin (AES-256)
  const password_encrypted = cryptoHelper.encrypt(password);

  const isStudent = normalizedRole === 'ESTUDIANTE';

  const newUser = {
    nombre,
    apellido,
    email,
    username,
    role: normalizedRole,
    especialidad: userData.especialidad || userData.specialty || null,
    birthdate: isStudent ? (userData.birthdate || null) : null,
    age: isStudent ? (userData.age !== undefined && userData.age !== null && userData.age !== '' ? userData.age : null) : null,
    instrument: isStudent ? (userData.instrument || null) : null,
    module: isStudent ? (userData.module || null) : null,
    semester: isStudent ? (userData.semester || null) : null,
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

/**
 * Actualiza los datos de un usuario existente.
 */
async function updateUser(id, userData) {
  const { nombre, apellido, email, role } = userData;

  if (!id) {
    throw new Error('ID de usuario requerido para la actualización.');
  }

  if (email) {
    const existingUser = await userRepository.findByUsernameOrEmail(email);
    if (existingUser && existingUser.id !== Number(id)) {
      throw new Error('El correo electrónico ya está en uso por otro usuario.');
    }
  }

  if (role) {
    const VALID_ROLES = ['ADMIN', 'DOCENTE', 'ESTUDIANTE'];
    const normalizedRole = role.toUpperCase();
    if (!VALID_ROLES.includes(normalizedRole)) {
      throw new Error('Rol inválido. Debe ser ADMIN, DOCENTE o ESTUDIANTE.');
    }
    userData.role = normalizedRole;
  }

  const updated = await userRepository.updateUser(id, userData);
  if (!updated) {
    throw new Error('Usuario no encontrado.');
  }

  return { id, ...userData };
}

/**
 * Elimina un usuario de la base de datos.
 */
async function deleteUser(id) {
  if (!id) {
    throw new Error('ID de usuario requerido para la eliminación.');
  }

  const deleted = await userRepository.deleteUser(id);
  if (!deleted) {
    throw new Error('Usuario no encontrado.');
  }

  return { id, deleted: true };
}

async function getUsersByRole(role) {
  const VALID_ROLES = ['ADMIN', 'DOCENTE', 'ESTUDIANTE'];
  const normalizedRole = String(role).toUpperCase();
  if (!VALID_ROLES.includes(normalizedRole)) {
    throw new Error('Rol inválido. Debe ser ADMIN, DOCENTE o ESTUDIANTE.');
  }
  return userRepository.findAllByRole(normalizedRole);
}

module.exports = {
  authenticateUser,
  registerUser,
  getDecryptedCredentials,
  updateUser,
  deleteUser,
  getUsersByRole
};
