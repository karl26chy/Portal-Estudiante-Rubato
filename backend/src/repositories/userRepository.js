// repositories/userRepository.js - Capa de acceso a datos para usuarios
const { pool } = require('../config/db');

// Mock user store in case database is down and MOCK_MODE is enabled
const MOCK_USERS = [
  {
    id: 1,
    nombre: 'Admin',
    apellido: 'Rubato',
    email: 'admin@rubato.org',
    username: 'admin.rubato01',
    role: 'ADMIN',
    password_hash: '$2a$10$rMTViB5aFPvqITr.pz0UMuil4gv4L.ekhSW5E69R6OuU7z3/goUDu',
    password_encrypted: 'e45c86ac088742c022e930d26b6114c2'
  },
  {
    id: 2,
    nombre: 'SuperAdmin',
    apellido: 'Sistema',
    email: 'superadmin@rubato.org',
    username: 'superadmin.sistema01',
    role: 'ADMIN',
    password_hash: '$2a$10$rMTViB5aFPvqITr.pz0UMuil4gv4L.ekhSW5E69R6OuU7z3/goUDu',
    password_encrypted: 'e45c86ac088742c022e930d26b6114c2'
  },
  {
    id: 3,
    nombre: 'Carlos',
    apellido: 'Silva',
    email: 'carlos.silva@rubato.org',
    username: 'carlos.silva01',
    role: 'DOCENTE',
    password_hash: '$2a$10$rMTViB5aFPvqITr.pz0UMuil4gv4L.ekhSW5E69R6OuU7z3/goUDu',
    password_encrypted: 'e45c86ac088742c022e930d26b6114c2'
  },
  {
    id: 4,
    nombre: 'María',
    apellido: 'Fernández',
    email: 'maria.fernandez@rubato.org',
    username: 'maria.fernandez01',
    role: 'DOCENTE',
    password_hash: '$2a$10$rMTViB5aFPvqITr.pz0UMuil4gv4L.ekhSW5E69R6OuU7z3/goUDu',
    password_encrypted: 'e45c86ac088742c022e930d26b6114c2'
  },
  {
    id: 5,
    nombre: 'Ana María',
    apellido: 'Gómez',
    email: 'ana.gomez@rubato.org',
    username: 'ana.gomez01',
    role: 'ESTUDIANTE',
    password_hash: '$2a$10$rMTViB5aFPvqITr.pz0UMuil4gv4L.ekhSW5E69R6OuU7z3/goUDu',
    password_encrypted: 'e45c86ac088742c022e930d26b6114c2'
  },
  {
    id: 6,
    nombre: 'Luis',
    apellido: 'Pérez',
    email: 'luis.perez@rubato.org',
    username: 'luis.perez01',
    role: 'ESTUDIANTE',
    password_hash: '$2a$10$rMTViB5aFPvqITr.pz0UMuil4gv4L.ekhSW5E69R6OuU7z3/goUDu',
    password_encrypted: 'e45c86ac088742c022e930d26b6114c2'
  }
];

async function findByUsernameOrEmail(identifier) {
  if (process.env.MOCK_MODE === 'true') {
    const lowerIdentifier = identifier.toLowerCase();
    return MOCK_USERS.find(
      u => u.username.toLowerCase() === lowerIdentifier || u.email.toLowerCase() === lowerIdentifier
    ) || null;
  }

  const [rows] = await pool.query(
    'SELECT * FROM users WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?) LIMIT 1',
    [identifier, identifier]
  );
  return rows[0] || null;
}

async function createUser(userData) {
  if (process.env.MOCK_MODE === 'true') {
    const { nombre, apellido, email, username, role, password_hash, password_encrypted } = userData;
    const newId = MOCK_USERS.length + 1;
    const newUser = {
      id: newId,
      nombre,
      apellido,
      email,
      username,
      role,
      password_hash,
      password_encrypted
    };
    MOCK_USERS.push(newUser);
    return newId;
  }

  const { nombre, apellido, email, username, role, password_hash, password_encrypted } = userData;
  const [result] = await pool.query(
    'INSERT INTO users (nombre, apellido, email, username, role, password_hash, password_encrypted) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [nombre, apellido, email, username, role, password_hash, password_encrypted]
  );
  return result.insertId;
}

async function getEncryptedPasswordById(id) {
  if (process.env.MOCK_MODE === 'true') {
    const user = MOCK_USERS.find(u => u.id === parseInt(id, 10));
    return user ? user.password_encrypted : null;
  }

  const [rows] = await pool.query(
    'SELECT password_encrypted FROM users WHERE id = ? LIMIT 1',
    [id]
  );
  return rows[0] ? rows[0].password_encrypted : null;
}

module.exports = {
  findByUsernameOrEmail,
  createUser,
  getEncryptedPasswordById
};
