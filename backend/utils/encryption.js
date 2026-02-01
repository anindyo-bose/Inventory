const crypto = require('crypto');

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';
const SALT_LENGTH = 16;
const TAG_LENGTH = 16;
const IV_LENGTH = 12;

class EncryptionWrapper {
  constructor(masterKey = process.env.ENCRYPTION_KEY || 'your-master-key-change-in-production') {
    // Derive a 32-byte key from the master key
    this.masterKey = crypto
      .createHash('sha256')
      .update(masterKey)
      .digest();
  }

  /**
   * Encrypts data using AES-256-GCM
   * @param {string|object} data - Data to encrypt
   * @returns {string} Base64 encoded encrypted data with IV and auth tag
   */
  encrypt(data) {
    try {
      const plaintext = typeof data === 'string' ? data : JSON.stringify(data);
      
      // Generate random IV (12 bytes for GCM)
      const iv = crypto.randomBytes(IV_LENGTH);
      
      // Create cipher
      const cipher = crypto.createCipheriv(ALGORITHM, this.masterKey, iv);
      
      // Encrypt data
      const encrypted = Buffer.concat([
        cipher.update(plaintext, 'utf8'),
        cipher.final()
      ]);
      
      // Get authentication tag
      const authTag = cipher.getAuthTag();
      
      // Combine IV, auth tag, and encrypted data
      // Format: base64(iv + authTag + encrypted)
      const combined = Buffer.concat([iv, authTag, encrypted]);
      
      return combined.toString('base64');
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Encryption failed');
    }
  }

  /**
   * Decrypts data encrypted by encrypt()
   * @param {string} encryptedData - Base64 encoded encrypted data
   * @returns {object|string} Decrypted data
   */
  decrypt(encryptedData) {
    try {
      // Decode from base64
      const combined = Buffer.from(encryptedData, 'base64');
      
      // Extract components
      const iv = combined.slice(0, IV_LENGTH);
      const authTag = combined.slice(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
      const encrypted = combined.slice(IV_LENGTH + TAG_LENGTH);
      
      // Create decipher
      const decipher = crypto.createDecipheriv(ALGORITHM, this.masterKey, iv);
      decipher.setAuthTag(authTag);
      
      // Decrypt data
      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final()
      ]).toString('utf8');
      
      // Try to parse as JSON, otherwise return as string
      try {
        return JSON.parse(decrypted);
      } catch {
        return decrypted;
      }
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Decryption failed - data may be corrupted or key is incorrect');
    }
  }

  /**
   * Hash sensitive data (one-way)
   * @param {string} data - Data to hash
   * @returns {string} SHA256 hash
   */
  hash(data) {
    return crypto
      .createHash('sha256')
      .update(data)
      .digest('hex');
  }

  /**
   * Verify hashed data
   * @param {string} data - Original data
   * @param {string} hash - Hash to verify against
   * @returns {boolean} True if hash matches
   */
  verifyHash(data, hash) {
    return this.hash(data) === hash;
  }
}

module.exports = new EncryptionWrapper();
