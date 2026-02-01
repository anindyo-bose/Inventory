import React from 'react';
import SupplierList from './SupplierList';

jest.mock('axios');

describe('SupplierList Component', () => {
  test('SupplierList component exists', () => {
    expect(SupplierList).toBeDefined();
  });

  test('SupplierList is a React component', () => {
    expect(typeof SupplierList).toBe('function');
  });
});
