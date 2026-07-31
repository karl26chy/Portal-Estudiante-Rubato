// helpers/cryptoHelper.js
const crypto = require('crypto');

// Utilizar las claves desde las variables de entorno o usar valores por defecto en desarrollo (¡CUIDADO en producción!)
const AES_SECRET_KEY = process.env.AES_SECRET_KEY || '9156ab072d5fb40aa62a57fe36f2626177833a007ebe156b0fbac31b66861f88';
const AES_IV = process.env.AES_IV || 'ba7cf06fb8b68ef09f72d9f80cb5b6e5';

const key = Buffer.from(AES_SECRET_KEY, 'hex');
const iv = Buffer.from(AES_IV, 'hex');

function encrypt(text) {
  try {
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  } catch (error) {
    console.error('Error encrypting text:', error);
    throw new Error('Error al cifrar los datos');
  }
}

function decrypt(encryptedText) {
  try {
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Error decrypting text:', error);
    throw new Error('Error al descifrar los datos');
  }
}

module.exports = {
  encrypt,
  decrypt
};
