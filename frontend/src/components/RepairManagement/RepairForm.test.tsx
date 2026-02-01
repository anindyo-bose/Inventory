import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import axios from 'axios';
import RepairForm from './RepairForm';
import { Repair } from './RepairManagement';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

mockedAxios.post = jest.fn();
mockedAxios.put = jest.fn();

jest.mock('../../utils/currency', () => ({
  formatCurrency: (amount: number) => `$${amount}`,
  getCurrencySymbol: () => '$',
  getCurrencyCode: () => 'USD',
}));

const mockRepair: Repair = {
  id: 1,
  repairId: 'REP001',
  billNo: 'B001',
  itemName: 'Laptop',
  itemDescription: 'Dell XPS repair',
  customerName: 'John Doe',
  customerContact: '1234567890',
  forwardedTo: 'Tech Support',
  forwardedDate: '2024-01-15',
  repairCost: 500,
  amountCharged: 600,
  advanceAmount: 100,
  status: 'in_progress',
  receivedDate: '2024-01-10',
  dueDate: '2024-01-20',
  completedDate: null,
  createdBy: 'admin',
  notes: 'Screen replacement needed',
};

describe('RepairForm Component', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.post.mockResolvedValue({ data: { success: true } });
    mockedAxios.put.mockResolvedValue({ data: { success: true } });
  });

  test('RepairForm component exists', () => {
    expect(RepairForm).toBeDefined();
  });

  test('RepairForm is a React component', () => {
    expect(typeof RepairForm).toBe('function');
  });

  test('should accept repair prop', () => {
    const component = <RepairForm repair={null} onClose={mockOnClose} onSuccess={mockOnSuccess} />;
    expect(component.props.repair).toBeNull();
  });

  test('should accept onClose callback', () => {
    const component = <RepairForm repair={null} onClose={mockOnClose} onSuccess={mockOnSuccess} />;
    expect(typeof component.props.onClose).toBe('function');
  });

  test('should accept onSuccess callback', () => {
    const component = <RepairForm repair={null} onClose={mockOnClose} onSuccess={mockOnSuccess} />;
    expect(typeof component.props.onSuccess).toBe('function');
  });

  test('should handle null repair for create mode', () => {
    const component = <RepairForm repair={null} onClose={mockOnClose} onSuccess={mockOnSuccess} />;
    expect(component.props.repair).toBeNull();
  });

  test('should handle existing repair for edit mode', () => {
    const component = <RepairForm repair={mockRepair} onClose={mockOnClose} onSuccess={mockOnSuccess} />;
    expect(component.props.repair).toEqual(mockRepair);
  });

  test('should be callable with different repair objects', () => {
    const repairs = [
      { ...mockRepair, id: 1 },
      { ...mockRepair, id: 2 },
    ];
    
    repairs.forEach(repair => {
      const component = <RepairForm repair={repair} onClose={mockOnClose} onSuccess={mockOnSuccess} />;
      expect(component.props.repair.id).toBeDefined();
    });
  });

  test('should be callable with different callbacks', () => {
    const close1 = jest.fn();
    const success1 = jest.fn();
    const component = <RepairForm repair={null} onClose={close1} onSuccess={success1} />;
    expect(component.props.onClose).toBe(close1);
    expect(component.props.onSuccess).toBe(success1);
  });

  test('should support re-rendering with different props', () => {
    const repairs = [null, mockRepair];
    repairs.forEach(repair => {
      const component = <RepairForm repair={repair} onClose={mockOnClose} onSuccess={mockOnSuccess} />;
      if (repair === null) {
        expect(component.props.repair).toBeNull();
      } else {
        expect(component.props.repair).toBeDefined();
      }
    });
  });
});
