import React from 'react';
import TransactionManagement from './TransactionManagement';

jest.mock('axios');

describe('TransactionManagement Component', () => {
  test('TransactionManagement component exists and is valid', () => {
    expect(TransactionManagement).toBeDefined();
  });
});
