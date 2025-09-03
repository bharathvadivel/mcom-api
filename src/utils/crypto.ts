import * as crypto from 'crypto';

export function hash(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex');
}

// Encryption/Decryption for sensitive data (backwards compatibility)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ALGORITHM = 'aes-256-cbc';

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const key = Buffer.from(ENCRYPTION_KEY, 'hex');
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Combine iv + encrypted data
  return iv.toString('hex') + ':' + encrypted;
}

export function decrypt(encryptedText: string): string {
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted text format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const key = Buffer.from(ENCRYPTION_KEY, 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    throw new Error('Failed to decrypt data');
  }
}

// New AES-256-GCM encryption for sensitive fields
const FIELD_ENC_KEY = process.env.FIELD_ENC_KEY;
const GCM_ALGORITHM = 'aes-256-gcm';

if (!FIELD_ENC_KEY) {
  throw new Error('FIELD_ENC_KEY environment variable is required for field encryption');
}

/**
 * Encrypt a field value using AES-256-GCM
 * Returns Base64(iv + tag + ciphertext)
 */
export function encryptField(value: string): string {
  try {
    if (!value) return '';
    
    const iv = crypto.randomBytes(12); // 96-bit IV for GCM
    const key = Buffer.from(FIELD_ENC_KEY!, 'hex');
    
    if (key.length !== 32) {
      throw new Error('FIELD_ENC_KEY must be 64 hex characters (32 bytes)');
    }
    
    const cipher = crypto.createCipheriv(GCM_ALGORITHM, key, iv);
    
    let encrypted = cipher.update(value, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    const tag = cipher.getAuthTag();
    
    // Combine iv + tag + encrypted data and encode as base64
    const combined = Buffer.concat([iv, tag, encrypted]);
    return combined.toString('base64');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Field encryption failed:', errorMessage);
    throw new Error('Failed to encrypt field data');
  }
}

/**
 * Decrypt a field value using AES-256-GCM
 * Expects Base64(iv + tag + ciphertext)
 */
export function decryptField(ciphertext: string): string {
  try {
    if (!ciphertext) return '';
    
    const combined = Buffer.from(ciphertext, 'base64');
    const key = Buffer.from(FIELD_ENC_KEY!, 'hex');
    
    if (key.length !== 32) {
      throw new Error('FIELD_ENC_KEY must be 64 hex characters (32 bytes)');
    }
    
    if (combined.length < 28) { // 12 (iv) + 16 (tag) = 28 minimum
      throw new Error('Invalid ciphertext format');
    }
    
    const iv = combined.subarray(0, 12);
    const tag = combined.subarray(12, 28);
    const encrypted = combined.subarray(28);
    
    const decipher = crypto.createDecipheriv(GCM_ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted, undefined, 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Field decryption failed:', errorMessage);
    throw new Error('Failed to decrypt field data');
  }
}
