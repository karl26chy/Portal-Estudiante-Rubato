// utils/passwordGenerator.js
const crypto = require('crypto');

/**
 * Genera un username base usando el primer nombre.
 * Ej: 'Carlos' -> 'carlos.rubato'
 */
function generateBaseUsername(nombre) {
  const sanitize = (str) =>
    str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
      .replace(/[^a-z0-9]/g, ''); // Quitar caracteres especiales y espacios

  const firstName = sanitize(nombre.split(' ')[0]);
  return `${firstName}.rubato`;
}

/**
 * Genera una contraseña con el patrón unificado Rubato + 6 dígitos + !
 * Ej: 'Rubato233242!'
 */
function generateSecurePassword() {
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  return `Rubato${randomDigits}!`;
}

module.exports = {
  generateBaseUsername,
  generateSecurePassword
};
