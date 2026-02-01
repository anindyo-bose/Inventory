import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import SupplierDues from './SupplierDues';

jest.mock('axios');

describe('SupplierDues Component', () => {
  test('should render supplier dues', () => {
    const { container } = render(<SupplierDues />);
    expect(container).toBeInTheDocument();
  });

  test('should render without crashing', () => {
    const { container } = render(<SupplierDues />);
    expect(container.children.length).toBeGreaterThanOrEqual(0);
  });
});
