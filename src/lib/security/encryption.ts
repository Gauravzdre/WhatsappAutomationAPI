import crypto from 'crypto';

// Use environment variable for encryption key, fallback to a default for development
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-character-secret-key-here!';
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

export interface EncryptedData {
  encrypted: string;
  iv: string;
  tag: string;
}

/**
 * Encrypt sensitive data like API keys and tokens
 * @param text - The text to encrypt
 * @returns EncryptedData object with encrypted text, IV, and authentication tag
 */
export function encrypt(text: string): EncryptedData {
  try {
    // Generate a random initialization vector
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Create cipher
    const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY);
    cipher.setAAD(Buffer.from('additional-auth-data'));
    
    // Encrypt the text
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Get the authentication tag
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
  } catch (error) {
    console.error('❌ Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt sensitive data
 * @param encryptedData - The encrypted data object
 * @returns Decrypted text
 */
export function decrypt(encryptedData: EncryptedData): string {
  try {
    const { encrypted, iv, tag } = encryptedData;
    
    // Create decipher
    const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY);
    decipher.setAAD(Buffer.from('additional-auth-data'));
    decipher.setAuthTag(Buffer.from(tag, 'hex'));
    
    // Decrypt the text
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('❌ Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Hash sensitive data for comparison (one-way)
 * @param text - The text to hash
 * @returns Hashed string
 */
export function hash(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex');
}

/**
 * Generate a secure random token
 * @param length - Length of the token (default: 32)
 * @returns Random token string
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Validate if a string is a valid encrypted data format
 * @param data - The data to validate
 * @returns boolean
 */
export function isValidEncryptedData(data: any): data is EncryptedData {
  return (
    typeof data === 'object' &&
    typeof data.encrypted === 'string' &&
    typeof data.iv === 'string' &&
    typeof data.tag === 'string'
  );
}

/**
 * Securely compare two strings to prevent timing attacks
 * @param a - First string
 * @param b - Second string
 * @returns boolean
 */
export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
} 