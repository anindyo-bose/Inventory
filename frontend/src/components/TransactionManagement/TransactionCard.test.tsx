import React from 'react';
import TransactionCard from './TransactionCard';

jest.mock('axios');

describe('TransactionCard Component', () => {
  test('TransactionCard component exists and is valid', () => {
    expect(TransactionCard).toBeDefined();
  });
});
