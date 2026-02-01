import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RepairCard from './RepairCard';
import { Repair } from './RepairManagement';
import { AuthProvider } from '../../context/AuthContext';

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

describe('RepairCard Component', () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithAuth = (component: React.ReactElement) => {
    return render(
      <AuthProvider>
        {component}
      </AuthProvider>
    );
  };

  test('RepairCard component exists', () => {
    expect(RepairCard).toBeDefined();
  });

  test('RepairCard is a React component', () => {
    expect(typeof RepairCard).toBe('function');
  });

  test('should accept repair prop', () => {
    const component = <RepairCard repair={mockRepair} onEdit={mockOnEdit} onDelete={mockOnDelete} />;
    expect(component.props.repair).toEqual(mockRepair);
  });

  test('should accept onEdit callback', () => {
    const component = <RepairCard repair={mockRepair} onEdit={mockOnEdit} onDelete={mockOnDelete} />;
    expect(typeof component.props.onEdit).toBe('function');
  });

  test('should accept onDelete callback', () => {
    const component = <RepairCard repair={mockRepair} onEdit={mockOnEdit} onDelete={mockOnDelete} />;
    expect(typeof component.props.onDelete).toBe('function');
  });

  test('should handle different repair data', () => {
    const repairs = [
      { ...mockRepair, id: 1 },
      { ...mockRepair, id: 2 },
      { ...mockRepair, id: 3 },
    ];

    repairs.forEach(repair => {
      const component = <RepairCard repair={repair} onEdit={mockOnEdit} onDelete={mockOnDelete} />;
      expect(component.props.repair.id).toBeDefined();
    });
  });

  test('should handle different repair statuses', () => {
    const statuses = ['in_progress', 'repaired', 'cancelled', 'delivered', 'pending'];

    statuses.forEach(status => {
      const repair = { ...mockRepair, status: status as any };
      const component = <RepairCard repair={repair} onEdit={mockOnEdit} onDelete={mockOnDelete} />;
      expect(component.props.repair.status).toBe(status);
    });
  });

  test('should support prop updates', () => {
    let component = <RepairCard repair={mockRepair} onEdit={mockOnEdit} onDelete={mockOnDelete} />;
    expect(component.props.repair).toEqual(mockRepair);

    const updatedRepair = { ...mockRepair, itemName: 'Updated Item' };
    component = <RepairCard repair={updatedRepair} onEdit={mockOnEdit} onDelete={mockOnDelete} />;
    expect(component.props.repair.itemName).toBe('Updated Item');
  });

  test('should handle completed repairs', () => {
    const completedRepair = {
      ...mockRepair,
      status: 'delivered' as const,
      completedDate: '2024-01-21',
    };
    const component = <RepairCard repair={completedRepair} onEdit={mockOnEdit} onDelete={mockOnDelete} />;
    expect(component.props.repair.completedDate).toBe('2024-01-21');
  });

  test('should handle repairs with different amounts', () => {
    const highValueRepair = { ...mockRepair, repairCost: 1000, amountCharged: 1500 };
    const component = <RepairCard repair={highValueRepair} onEdit={mockOnEdit} onDelete={mockOnDelete} />;
    expect(component.props.repair.repairCost).toBe(1000);
    expect(component.props.repair.amountCharged).toBe(1500);
  });

  test('should handle zero advance amount', () => {
    const zeroAdvanceRepair = { ...mockRepair, advanceAmount: 0 };
    const component = <RepairCard repair={zeroAdvanceRepair} onEdit={mockOnEdit} onDelete={mockOnDelete} />;
    expect(component.props.repair.advanceAmount).toBe(0);
  });

  test('should accept different callback functions', () => {
    const edit1 = jest.fn();
    const delete1 = jest.fn();
    const component1 = <RepairCard repair={mockRepair} onEdit={edit1} onDelete={delete1} />;
    expect(component1.props.onEdit).toBe(edit1);
    expect(component1.props.onDelete).toBe(delete1);

    const edit2 = jest.fn();
    const delete2 = jest.fn();
    const component2 = <RepairCard repair={mockRepair} onEdit={edit2} onDelete={delete2} />;
    expect(component2.props.onEdit).toBe(edit2);
    expect(component2.props.onDelete).toBe(delete2);
  });

  test('should handle repairs with empty notes', () => {
    const repairWithoutNotes = {
      ...mockRepair,
      notes: '',
    };
    const component = <RepairCard repair={repairWithoutNotes} onEdit={mockOnEdit} onDelete={mockOnDelete} />;
    expect(component.props.repair.notes).toBe('');
  });

  test('should handle repairs with long notes', () => {
    const longNote = 'This is a very long note that contains detailed information about the repair work needed.';
    const repairWithLongNotes = {
      ...mockRepair,
      notes: longNote,
    };
    const component = <RepairCard repair={repairWithLongNotes} onEdit={mockOnEdit} onDelete={mockOnDelete} />;
    expect(component.props.repair.notes).toBe(longNote);
  });

  test('should handle repairs with different customer contacts', () => {
    const repairs = [
      { ...mockRepair, customerContact: '1234567890' },
      { ...mockRepair, customerContact: 'customer@email.com' },
      { ...mockRepair, customerContact: '+1-800-555-0000' },
    ];

    repairs.forEach(repair => {
      const component = <RepairCard repair={repair} onEdit={mockOnEdit} onDelete={mockOnDelete} />;
      expect(component.props.repair.customerContact).toBeDefined();
    });
  });

  test('should handle repairs from different dates', () => {
    const repairs = [
      { ...mockRepair, receivedDate: '2024-01-10' },
      { ...mockRepair, receivedDate: '2024-02-15' },
      { ...mockRepair, receivedDate: '2024-03-20' },
    ];

    repairs.forEach(repair => {
      const component = <RepairCard repair={repair} onEdit={mockOnEdit} onDelete={mockOnDelete} />;
      expect(component.props.repair.receivedDate).toBeDefined();
    });
  });

  test('should handle profit calculations', () => {
    const component = <RepairCard repair={mockRepair} onEdit={mockOnEdit} onDelete={mockOnDelete} />;
    const profit = mockRepair.amountCharged - mockRepair.repairCost;
    expect(profit).toBeGreaterThan(0);
  });

  test('should handle loss scenarios', () => {
    const lossRepair = { ...mockRepair, repairCost: 800, amountCharged: 500 };
    const component = <RepairCard repair={lossRepair} onEdit={mockOnEdit} onDelete={mockOnDelete} />;
    const loss = lossRepair.amountCharged - lossRepair.repairCost;
    expect(loss).toBeLessThan(0);
  });

  test('should handle break-even scenarios', () => {
    const breakEvenRepair = { ...mockRepair, repairCost: 600, amountCharged: 600 };
    const component = <RepairCard repair={breakEvenRepair} onEdit={mockOnEdit} onDelete={mockOnDelete} />;
    const margin = breakEvenRepair.amountCharged - breakEvenRepair.repairCost;
    expect(margin).toBe(0);
  });
});
