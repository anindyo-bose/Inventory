import React from 'react';
import '@testing-library/jest-dom';
import SupplierForm from './SupplierForm';

jest.mock('axios');

describe('SupplierForm Component', () => {
  test('SupplierForm component exists', () => {
    expect(SupplierForm).toBeDefined();
  });

  test('SupplierForm is a React component', () => {
    expect(typeof SupplierForm).toBe('function');
  });
});
