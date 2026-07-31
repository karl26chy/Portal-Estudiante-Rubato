// utils/passwordGenerator.js
const crypto = require('crypto');

/**
 * Genera un username base usando nombre y apellido.
 * Convierte a minúsculas, remueve acentos y espacios.
 * Ej: 'Juan' y 'Pérez' -> 'juan.perez'
 */
function generateBaseUsername(nombre, apellido) {
  const sanitize = (str) =>
    str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
      .replace(/[^a-z0-9]/g, ''); // Quitar caracteres especiales y espacios

  const nom = sanitize(nombre);
  const ape = sanitize(apellido);
  return `${nom}.${ape}`;
}

/**
 * Genera una contraseña segura aleatoria.
 * Longitud por defecto: 12 caracteres.
 * Contiene al menos: 1 mayúscula, 1 minúscula, 1 número, 1 carácter especial.
 */
function generateSecurePassword(length = 12) {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  const allChars = upper + lower + numbers + special;

  let password = '';
  // Asegurar al menos uno de cada tipo
  password += upper[crypto.randomInt(0, upper.length)];
  password += lower[crypto.randomInt(0, lower.length)];
  password += numbers[crypto.randomInt(0, numbers.length)];
  password += special[crypto.randomInt(0, special.length)];

  // Rellenar el resto aleatoriamente
  for (let i = password.length; i < length; i++) {
    password += allChars[crypto.randomInt(0, allChars.length)];
  }

  // Mezclar la contraseña para que los 4 primeros no sigan un patrón fijo
  password = password.split('').sort(() => 0.5 - Math.random()).join('');

  return password;
}

module.exports = {
  generateBaseUsername,
  generateSecurePassword
};
