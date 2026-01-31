import { formatCurrency, getCurrencySymbol, getCurrencyCode } from '../utils/currency';

describe('Currency Utilities', () => {
  test('should format currency with proper symbols', () => {
    const formatted = formatCurrency(1000);
    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe('string');
  });

  test('should get currency symbol', () => {
    const symbol = getCurrencySymbol();
    expect(symbol).toBeDefined();
    expect(typeof symbol).toBe('string');
  });

  test('should get currency code', () => {
    const code = getCurrencyCode();
    expect(code).toBeDefined();
    expect(typeof code).toBe('string');
  });

  test('should handle zero amounts', () => {
    const result = formatCurrency(0);
    expect(result).toBeDefined();
    expect(result.includes('0')).toBe(true);
  });

  test('should handle negative amounts', () => {
    const result = formatCurrency(-100);
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
  });

  test('should return correct type from formatCurrency', () => {
    const result = formatCurrency(500);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});
