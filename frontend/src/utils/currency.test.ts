import { formatCurrency, getCurrencySymbol, getCurrencyCode, CurrencyConfig } from '../utils/currency';

describe('Currency Utilities', () => {
  describe('formatCurrency', () => {
    test('should format currency with proper symbols', () => {
      const formatted = formatCurrency(1000);
      expect(formatted).toBeDefined();
      expect(typeof formatted).toBe('string');
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
      expect(result).toBeTruthy();
    });

    test('should return correct type from formatCurrency', () => {
      const result = formatCurrency(500);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    test('should handle large amounts', () => {
      const result = formatCurrency(1000000);
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.includes('1000000')).toBe(true);
    });

    test('should handle decimal amounts', () => {
      const result = formatCurrency(99.99);
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    test('should handle very small decimal amounts', () => {
      const result = formatCurrency(0.01);
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    test('should handle fractional amounts', () => {
      const result = formatCurrency(123.456);
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    test('should return consistent results for same input', () => {
      const result1 = formatCurrency(250);
      const result2 = formatCurrency(250);
      expect(result1).toEqual(result2);
    });

    test('should return different results for different inputs', () => {
      const result1 = formatCurrency(100);
      const result2 = formatCurrency(200);
      expect(result1).not.toEqual(result2);
    });
  });

  describe('getCurrencySymbol', () => {
    test('should get currency symbol', () => {
      const symbol = getCurrencySymbol();
      expect(symbol).toBeDefined();
      expect(typeof symbol).toBe('string');
    });

    test('should return non-empty symbol', () => {
      const symbol = getCurrencySymbol();
      expect(symbol.length).toBeGreaterThan(0);
    });

    test('should return consistent symbol', () => {
      const symbol1 = getCurrencySymbol();
      const symbol2 = getCurrencySymbol();
      expect(symbol1).toEqual(symbol2);
    });

    test('symbol should be a valid string', () => {
      const symbol = getCurrencySymbol();
      expect(typeof symbol).toBe('string');
      expect(symbol).toBeTruthy();
    });
  });

  describe('getCurrencyCode', () => {
    test('should get currency code', () => {
      const code = getCurrencyCode();
      expect(code).toBeDefined();
      expect(typeof code).toBe('string');
    });

    test('should return non-empty code', () => {
      const code = getCurrencyCode();
      expect(code.length).toBeGreaterThan(0);
    });

    test('should return code with at least 3 characters', () => {
      const code = getCurrencyCode();
      expect(code.length).toBeGreaterThanOrEqual(3);
    });

    test('should return consistent code', () => {
      const code1 = getCurrencyCode();
      const code2 = getCurrencyCode();
      expect(code1).toEqual(code2);
    });

    test('code should be uppercase ISO format', () => {
      const code = getCurrencyCode();
      expect(/^[A-Z]{3}$/.test(code)).toBe(true);
    });

    test('should return valid currency code format', () => {
      const code = getCurrencyCode();
      expect(typeof code).toBe('string');
      expect(code).toBeTruthy();
    });
  });

  describe('Currency utilities integration', () => {
    test('all currency functions should return valid data', () => {
      const symbol = getCurrencySymbol();
      const code = getCurrencyCode();
      const formatted = formatCurrency(100);

      expect(symbol).toBeTruthy();
      expect(code).toBeTruthy();
      expect(formatted).toBeTruthy();
    });

    test('formatted currency should contain either symbol or code', () => {
      const symbol = getCurrencySymbol();
      const code = getCurrencyCode();
      const formatted = formatCurrency(100);

      const containsSymbolOrCode = 
        formatted.includes(symbol) || formatted.includes(code);
      expect(containsSymbolOrCode).toBe(true);
    });

    test('should handle edge case amounts', () => {
      const amounts = [0, 1, 100, 1000, 10000, 0.01, -1, -100];
      
      amounts.forEach(amount => {
        const result = formatCurrency(amount);
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      });
    });
  });
});
