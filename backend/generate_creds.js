const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const password = 'Rubato.2026*';
const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(password, salt);
console.log('Bcrypt hash:', hash);

const AES_SECRET_KEY = crypto.randomBytes(32).toString('hex');
const AES_IV = crypto.randomBytes(16).toString('hex');
console.log('AES_SECRET_KEY:', AES_SECRET_KEY);
console.log('AES_IV:', AES_IV);

const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(AES_SECRET_KEY, 'hex'), Buffer.from(AES_IV, 'hex'));
let encrypted = cipher.update(password, 'utf8', 'hex');
encrypted += cipher.final('hex');
console.log('Encrypted password:', encrypted);
