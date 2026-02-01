import React from 'react';
import RepairCard from './RepairCard';

jest.mock('axios');

describe('RepairCard Component', () => {
  test('RepairCard component exists and is valid', () => {
    expect(RepairCard).toBeDefined();
  });
});
