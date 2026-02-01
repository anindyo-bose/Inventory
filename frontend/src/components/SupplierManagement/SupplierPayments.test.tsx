import React from 'react';
import SupplierPayments from './SupplierPayments';

jest.mock('axios');

describe('SupplierPayments Component', () => {
  test('SupplierPayments component exists and is valid', () => {
    expect(SupplierPayments).toBeDefined();
  });
});
