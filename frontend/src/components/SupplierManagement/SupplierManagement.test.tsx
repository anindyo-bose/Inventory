import React from 'react';
import SupplierManagement from './SupplierManagement';

jest.mock('axios');

describe('SupplierManagement Component', () => {
  test('SupplierManagement component exists and is valid', () => {
    expect(SupplierManagement).toBeDefined();
  });
});
