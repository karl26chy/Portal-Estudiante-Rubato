// helpers/cryptoHelper.js
const crypto = require('crypto');

// Las claves deben definirse exclusivamente por variables de entorno (en hexadecimal)
const AES_SECRET_KEY = process.env.AES_SECRET_KEY;
const AES_IV = process.env.AES_IV;

if (!AES_SECRET_KEY) {
  throw new Error('Falta la variable de entorno AES_SECRET_KEY. Defínela en el archivo .env');
}

const key = Buffer.from(AES_SECRET_KEY, 'hex');

function encrypt(text) {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Error encrypting text:', error);
    throw new Error('Error al cifrar los datos');
  }
}

function decrypt(encryptedData) {
  try {
    let iv;
    let encryptedText;
    if (encryptedData && encryptedData.includes(':')) {
      const parts = encryptedData.split(':');
      iv = Buffer.from(parts[0], 'hex');
      encryptedText = parts[1];
    } else {
      // Fallback para datos legados cifrados con el AES_IV estático de entorno
      if (!AES_IV) {
        throw new Error('Falta la variable de entorno AES_IV para descifrar datos antiguos.');
      }
      iv = Buffer.from(AES_IV, 'hex');
      encryptedText = encryptedData;
    }
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

