import React from 'react';
import TransactionStats from './TransactionStats';

jest.mock('axios');

describe('TransactionStats Component', () => {
  test('TransactionStats component exists', () => {
    expect(TransactionStats).toBeDefined();
  });

  test('TransactionStats is a React component', () => {
    expect(typeof TransactionStats).toBe('function');
  });
});
