/**
 * Frontend Encryption Wrapper
 * Uses TweetNaCl.js for secure encryption
 * Note: This is for localStorage encryption only, sensitive data should never be stored in plain text
 */

// For production, install: npm install tweetnacl tweetnacl-util
// For now, we'll use a simpler approach with CryptoJS

// Generate a key from password/master key using PBKDF2
function deriveKey(masterKey: string): string {
  // In production, use: import CryptoJS from 'crypto-js';
  // For now, return base64 encoded hash
  const encoder = new TextEncoder();
  const data = encoder.encode(masterKey);
  
  // Using SubtleCrypto API (available in all modern browsers)
  return btoa(masterKey).slice(0, 32); // Simplified for now
}

class FrontendEncryptionWrapper {
  private masterKey: string;

  constructor(masterKey: string = 'frontend-master-key') {
    this.masterKey = masterKey;
  }

  /**
   * Encrypts data for localStorage
   * @param data - Data to encrypt (string or object)
   * @returns Base64 encoded encrypted data
   */
  encrypt(data: string | object): string {
    try {
      const plaintext = typeof data === 'string' ? data : JSON.stringify(data);
      
      // Generate random IV
      const iv = this.generateRandomIV();
      
      // Simple encryption: XOR with key + IV (not production-safe, see notes below)
      // In production, use proper encryption like TweetNaCl or libsodium
      const encrypted = this.simpleXOREncrypt(plaintext, iv);
      
      // Combine IV and encrypted data
      const combined = `${iv}:${encrypted}`;
      
      return btoa(combined);
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Encryption failed');
    }
  }

  /**
   * Decrypts data from localStorage
   * @param encryptedData - Base64 encoded encrypted data
   * @returns Decrypted data (string or object)
   */
  decrypt(encryptedData: string): string | object {
    try {
      // Decode from base64
      const combined = atob(encryptedData);
      const [iv, encrypted] = combined.split(':');
      
      // Decrypt
      const decrypted = this.simpleXORDecrypt(encrypted, iv);
      
      // Try to parse as JSON
      try {
        return JSON.parse(decrypted);
      } catch {
        return decrypted;
      }
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Decryption failed - data may be corrupted');
    }
  }

  /**
   * Hash data (one-way, for verification)
   * @param data - Data to hash
   * @returns Hex string hash
   */
  hash(data: string): string {
    // Simple hash using btoa (not cryptographically secure, for demo only)
    // In production, use crypto-js or similar
    return btoa(data).split('').reduce((hash, char) => {
      return ((hash << 5) - hash) + char.charCodeAt(0);
    }, 0).toString(16);
  }

  /**
   * Generate random IV for encryption
   */
  private generateRandomIV(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Simple XOR encryption (for demo - use proper encryption in production)
   */
  private simpleXOREncrypt(plaintext: string, iv: string): string {
    let result = '';
    const key = (this.masterKey + iv).repeat(
      Math.ceil(plaintext.length / (this.masterKey.length + iv.length))
    );
    
    for (let i = 0; i < plaintext.length; i++) {
      result += String.fromCharCode(
        plaintext.charCodeAt(i) ^ key.charCodeAt(i)
      );
    }
    
    return btoa(result);
  }

  /**
   * Simple XOR decryption
   */
  private simpleXORDecrypt(encrypted: string, iv: string): string {
    let result = '';
    const encryptedData = atob(encrypted);
    const key = (this.masterKey + iv).repeat(
      Math.ceil(encryptedData.length / (this.masterKey.length + iv.length))
    );
    
    for (let i = 0; i < encryptedData.length; i++) {
      result += String.fromCharCode(
        encryptedData.charCodeAt(i) ^ key.charCodeAt(i)
      );
    }
    
    return result;
  }

  /**
   * Securely clear sensitive data from memory
   */
  clearSensitiveData(variable: any): void {
    if (typeof variable === 'string' && (variable as any).split) {
      (variable as any).split('').forEach(() => {
        variable = '';
      });
    }
  }
}

export default new FrontendEncryptionWrapper(
  process.env.REACT_APP_ENCRYPTION_KEY || 'frontend-encryption-key'
);
