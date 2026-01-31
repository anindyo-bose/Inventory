const bcrypt = require('bcryptjs');

describe('Password Security', () => {
  test('should hash password with bcrypt', async () => {
    const password = 'myPassword123';
    const hashedPassword = await bcrypt.hash(password, 10);

    expect(hashedPassword).not.toBe(password);
    expect(hashedPassword.length).toBeGreaterThan(password.length);
  });

  test('should verify correct password', async () => {
    const password = 'testPassword123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const isMatch = await bcrypt.compare(password, hashedPassword);
    expect(isMatch).toBe(true);
  });

  test('should reject incorrect password', async () => {
    const password = 'correctPassword';
    const wrongPassword = 'wrongPassword';
    const hashedPassword = await bcrypt.hash(password, 10);

    const isMatch = await bcrypt.compare(wrongPassword, hashedPassword);
    expect(isMatch).toBe(false);
  });

  test('should reject empty password', async () => {
    const hashedPassword = await bcrypt.hash('validPassword', 10);
    const isMatch = await bcrypt.compare('', hashedPassword);

    expect(isMatch).toBe(false);
  });

  test('should handle very long passwords', async () => {
    const longPassword = 'a'.repeat(100);
    const hashedPassword = await bcrypt.hash(longPassword, 10);

    const isMatch = await bcrypt.compare(longPassword, hashedPassword);
    expect(isMatch).toBe(true);
  });

  test('should generate different hashes for same password', async () => {
    const password = 'samePassword123';
    const hash1 = await bcrypt.hash(password, 10);
    const hash2 = await bcrypt.hash(password, 10);

    expect(hash1).not.toBe(hash2);
    expect(await bcrypt.compare(password, hash1)).toBe(true);
    expect(await bcrypt.compare(password, hash2)).toBe(true);
  });
});
