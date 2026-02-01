import React from 'react';
import '@testing-library/jest-dom';
import TransactionForm from './TransactionForm';

jest.mock('axios');

describe('TransactionForm Component', () => {
  test('TransactionForm component exists', () => {
    expect(TransactionForm).toBeDefined();
  });

  test('TransactionForm is a React component', () => {
    expect(typeof TransactionForm).toBe('function');
  });
});
