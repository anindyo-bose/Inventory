import React from 'react';
import { render } from '@testing-library/react';
import Repairs from './Repairs';

jest.mock('axios');

describe('Repairs Page', () => {
  test('Repairs component exists and is valid', () => {
    expect(Repairs).toBeDefined();
  });
});
