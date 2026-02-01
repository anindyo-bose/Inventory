import React from 'react';
import SupplierBills from './SupplierBills';

jest.mock('axios');

describe('SupplierBills Component', () => {
  test('SupplierBills component exists and is valid', () => {
    expect(SupplierBills).toBeDefined();
  });
});
