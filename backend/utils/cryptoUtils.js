import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(process.env.SECRET_KEY_CRYPTO, 'hex');

if (KEY.length !== 32) {
  console.error(
    'SECRET_KEY_CRYPTO must be a 64-character hex string (32 bytes).'
  );
  process.exit(1);
}

export const encrypt = (text) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return {
    iv: iv.toString('hex'),
    encryptedData: encrypted,
    authTag: authTag,
  };
};

export const decrypt = (encryptedData, ivHex, authTagHex) => {
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};
