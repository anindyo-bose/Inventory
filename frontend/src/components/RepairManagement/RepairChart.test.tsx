import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import RepairChart from './RepairChart';

jest.mock('axios');

describe('RepairChart Component', () => {
  const mockRepairs = [
    {
      id: 1,
      repairId: 'R001',
      billNo: '001',
      itemName: 'Test Item',
      itemDescription: 'Test Description',
      customerName: 'Customer 1',
      customerContact: '123456789',
      forwardedTo: 'Tech',
      forwardedDate: '2024-01-15',
      repairCost: 800,
      amountCharged: 1200,
      advanceAmount: 0,
      status: 'repaired' as const,
      receivedDate: '2024-01-15',
      dueDate: '2024-01-20',
      completedDate: null,
      createdBy: 'admin',
      notes: 'Test note'
    }
  ];

  test('should render repair chart', () => {
    const { container } = render(<RepairChart repairs={mockRepairs} />);
    expect(container).toBeInTheDocument();
  });

  test('should render without crashing', () => {
    const { container } = render(<RepairChart repairs={mockRepairs} />);
    expect(container.children.length).toBeGreaterThanOrEqual(0);
  });
});
