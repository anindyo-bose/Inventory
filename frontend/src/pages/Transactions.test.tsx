import React from 'react';
import Transactions from './Transactions';

jest.mock('axios');

describe('Transactions Page', () => {
  test('Transactions component is defined', () => {
    expect(Transactions).toBeDefined();
  });

  test('Transactions is a React component', () => {
    expect(typeof Transactions).toBe('function');
  });
});
