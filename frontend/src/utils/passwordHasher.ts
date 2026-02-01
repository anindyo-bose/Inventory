import CryptoJS from 'crypto-js';

/**
 * Password Hashing Utility for Client-Side Security
 * 
 * This provides an additional layer of security by hashing passwords before sending to server.
 * Combined with HTTPS and server-side hashing, this provides defense-in-depth.
 */

class PasswordHasher {
  private salt: string;

  constructor() {
    // Use a consistent salt based on the app (you could also generate per-user)
    this.salt = process.env.REACT_APP_PASSWORD_SALT || 'inventory-app-salt-2024';
  }

  /**
   * Hash password using SHA256
   * This provides an additional layer before sending to server
   * Server will still validate and hash further with bcrypt
   * 
   * @param password - Plain text password
   * @returns SHA256 hashed password
   */
  hashPassword(password: string): string {
    if (!password || typeof password !== 'string') {
      throw new Error('Password must be a non-empty string');
    }

    // Create a salted hash
    const saltedPassword = `${password}${this.salt}`;
    const hash = CryptoJS.SHA256(saltedPassword).toString();

    return hash;
  }

  /**
   * Generate a challenge for additional security
   * Can be used for challenge-response authentication
   */
  generateChallenge(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return CryptoJS.SHA256(`${timestamp}${random}`).toString();
  }

  /**
   * Create a response to a challenge
   */
  createChallengeResponse(challenge: string, password: string): string {
    const hashedPassword = this.hashPassword(password);
    const combined = `${challenge}${hashedPassword}`;
    return CryptoJS.SHA256(combined).toString();
  }

  /**
   * Clear password from memory (as much as possible in JavaScript)
   */
  clearPassword(password: string): void {
    // In JavaScript, this is limited, but we try to clear the reference
    if (password && (password as any).split) {
      (password as any).split('').forEach(() => {
        password = '';
      });
    }
  }
}

export default new PasswordHasher();
