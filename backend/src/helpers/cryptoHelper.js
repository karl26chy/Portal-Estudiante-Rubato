// helpers/cryptoHelper.js
const crypto = require('crypto');

// Las claves deben definirse exclusivamente por variables de entorno (en hexadecimal)
const AES_SECRET_KEY = process.env.AES_SECRET_KEY;
const AES_IV = process.env.AES_IV;

if (!AES_SECRET_KEY || !AES_IV) {
  throw new Error('Faltan las variables de entorno AES_SECRET_KEY y/o AES_IV. Defínelas en el archivo .env');
}

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
