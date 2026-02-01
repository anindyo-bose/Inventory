import * as currencyConfig from '../config/currency.json';
import * as navigationConfig from '../config/navigation.json';
import * as featuresConfig from '../config/features.json';

describe('Config Files', () => {
  test('currency config should exist and have symbol', () => {
    expect(currencyConfig).toBeDefined();
    expect(currencyConfig.symbol).toBeDefined();
  });

  test('currency config should have code', () => {
    expect(currencyConfig.code).toBeDefined();
  });

  test('navigation config should exist', () => {
    expect(navigationConfig).toBeDefined();
  });

  test('features config should exist', () => {
    expect(featuresConfig).toBeDefined();
  });

  test('currency config should be valid object', () => {
    expect(typeof currencyConfig).toBe('object');
    expect(Object.keys(currencyConfig).length).toBeGreaterThan(0);
  });

  test('navigation config should be valid object', () => {
    expect(typeof navigationConfig).toBe('object');
  });

  test('features config should be valid object', () => {
    expect(typeof featuresConfig).toBe('object');
  });
});
