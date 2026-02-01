import React from 'react';
import '@testing-library/jest-dom';
import RepairForm from './RepairForm';

jest.mock('axios');

describe('RepairForm Component', () => {
  test('RepairForm component exists', () => {
    expect(RepairForm).toBeDefined();
  });

  test('RepairForm is a React component', () => {
    expect(typeof RepairForm).toBe('function');
  });
});
