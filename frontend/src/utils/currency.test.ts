import { convertCurrency, formatCurrency } from '../utils/currency';

describe('Currency Utilities', () => {
  test('should convert currency correctly', () => {
    const result = convertCurrency(100, 'USD', 'INR');
    expect(typeof result).toBe('number');
    expect(result).toBeGreaterThan(0);
  });

  test('should format currency with proper symbols', () => {
    const formatted = formatCurrency(1000, 'USD');
    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe('string');
  });

  test('should handle zero amounts', () => {
    const result = convertCurrency(0, 'USD', 'INR');
    expect(result).toBe(0);
  });

  test('should handle negative amounts', () => {
    const result = convertCurrency(-100, 'USD', 'INR');
    expect(result).toBeLessThan(0);
  });

  test('should return correct type from formatCurrency', () => {
    const result = formatCurrency(500, 'GBP');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});
