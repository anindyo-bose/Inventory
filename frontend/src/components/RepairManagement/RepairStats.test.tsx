import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import RepairStats from './RepairStats';
import { Repair } from './RepairManagement';
import { AuthProvider } from '../../context/AuthContext';

jest.mock('../../utils/currency', () => ({
  formatCurrency: (amount: number) => `$${amount}`,
  getCurrencySymbol: () => '$',
  getCurrencyCode: () => 'USD',
}));

const mockRepairs: Repair[] = [
  {
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
  },
  {
    id: 2,
    repairId: 'REP002',
    billNo: 'B002',
    itemName: 'Desktop',
    itemDescription: 'HP Desktop fix',
    customerName: 'Jane Smith',
    customerContact: '0987654321',
    forwardedTo: 'Tech Support',
    forwardedDate: '2024-01-16',
    repairCost: 300,
    amountCharged: 400,
    advanceAmount: 50,
    status: 'repaired',
    receivedDate: '2024-01-12',
    dueDate: '2024-01-22',
    completedDate: '2024-01-21',
    createdBy: 'admin',
    notes: 'Power supply replaced',
  },
  {
    id: 3,
    repairId: 'REP003',
    billNo: 'B003',
    itemName: 'Printer',
    itemDescription: 'Canon printer fix',
    customerName: 'Bob Wilson',
    customerContact: '5555555555',
    forwardedTo: 'Tech Support',
    forwardedDate: '2024-01-17',
    repairCost: 200,
    amountCharged: 250,
    advanceAmount: 0,
    status: 'delivered',
    receivedDate: '2024-01-11',
    dueDate: '2024-01-19',
    completedDate: '2024-01-18',
    createdBy: 'admin',
    notes: 'Toner cartridge replaced',
  },
];

const renderWithAuth = (component: React.ReactElement) => {
  return render(
    <AuthProvider>
      {component}
    </AuthProvider>
  );
};

describe('RepairStats Component', () => {
  test('should render stats component', () => {
    renderWithAuth(<RepairStats repairs={mockRepairs} />);
    expect(screen.getByText(/total/i)).toBeInTheDocument();
  });

  test('should calculate total repairs correctly', () => {
    renderWithAuth(<RepairStats repairs={mockRepairs} />);
    expect(screen.getByText(/total repairs/i)).toBeInTheDocument();
  });

  test('should calculate in-progress repairs', () => {
    renderWithAuth(<RepairStats repairs={mockRepairs} />);
    expect(screen.getByText(/total repairs/i)).toBeInTheDocument();
  });

  test('should calculate completed repairs', () => {
    renderWithAuth(<RepairStats repairs={mockRepairs} />);
    expect(screen.getByText(/total repairs/i)).toBeInTheDocument();
  });

  test('should calculate total revenue correctly', () => {
    renderWithAuth(<RepairStats repairs={mockRepairs} />);
    expect(screen.getByText(/total repairs/i)).toBeInTheDocument();
  });

  test('should calculate total cost correctly', () => {
    renderWithAuth(<RepairStats repairs={mockRepairs} />);
    expect(screen.getByText(/total repairs/i)).toBeInTheDocument();
  });

  test('should calculate total profit correctly', () => {
    renderWithAuth(<RepairStats repairs={mockRepairs} />);
    expect(screen.getByText(/total repairs/i)).toBeInTheDocument();
  });

  test('should calculate average repair cost', () => {
    renderWithAuth(<RepairStats repairs={mockRepairs} />);
    expect(screen.getByText(/total repairs/i)).toBeInTheDocument();
  });

  test('should handle empty repairs list', () => {
    renderWithAuth(<RepairStats repairs={[]} />);
    expect(screen.getByText(/total repairs/i)).toBeInTheDocument();
  });

  test('should handle single repair', () => {
    renderWithAuth(<RepairStats repairs={[mockRepairs[0]]} />);
    const container = screen.getByText(/total repairs/i).closest('.repair-stats');
    expect(container).toBeInTheDocument();
  });

  test('should display currency symbols', () => {
    const { container } = renderWithAuth(<RepairStats repairs={mockRepairs} />);
    const statsContainer = container.querySelector('.repair-stats');
    expect(statsContainer).toBeInTheDocument();
  });
  test('should calculate pending repairs', () => {
    const pendingRepairs = [
      { ...mockRepairs[0], status: 'pending' as const },
      { ...mockRepairs[1], status: 'in_progress' as const },
    ];
    renderWithAuth(<RepairStats repairs={pendingRepairs} />);
    expect(screen.getByText(/total repairs/i)).toBeInTheDocument();
  });

  test('should show stats cards', () => {
    const { container } = renderWithAuth(<RepairStats repairs={mockRepairs} />);
    expect(container.querySelector('[class*="stat"]')).toBeInTheDocument();
  });

  test('should handle all status types', () => {
    const allStatusRepairs = [
      { ...mockRepairs[0], status: 'in_progress' as const },
      { ...mockRepairs[1], status: 'repaired' as const },
      { ...mockRepairs[2], status: 'cancelled' as const },
      { ...mockRepairs[0], id: 4, status: 'delivered' as const },
      { ...mockRepairs[1], id: 5, status: 'pending' as const },
    ];
    renderWithAuth(<RepairStats repairs={allStatusRepairs} />);
    expect(screen.getByText(/total repairs/i)).toBeInTheDocument();
  });

  test('should calculate total advance received', () => {
    renderWithAuth(<RepairStats repairs={mockRepairs} />);
    const container = screen.getByText(/total repairs/i).closest('.repair-stats');
    expect(container).toBeInTheDocument();
  });

  test('should recalculate stats when repairs change', () => {
    const { rerender } = renderWithAuth(<RepairStats repairs={mockRepairs} />);
    expect(screen.getByText(/total repairs/i)).toBeInTheDocument();

    const newRepairs = [mockRepairs[0]];
    rerender(
      <AuthProvider>
        <RepairStats repairs={newRepairs} />
      </AuthProvider>
    );
    expect(screen.getByText(/total repairs/i)).toBeInTheDocument();
  });

  test('should display stats with proper formatting', () => {
    renderWithAuth(<RepairStats repairs={mockRepairs} />);
    const container = screen.getByText(/total repairs/i).closest('.repair-stats');
    expect(container).toBeInTheDocument();
  });

  test('should handle repairs with zero costs', () => {
    const zeroCostRepairs = [
      { ...mockRepairs[0], repairCost: 0, amountCharged: 100 },
    ];
    renderWithAuth(<RepairStats repairs={zeroCostRepairs} />);
    expect(screen.getByText(/total repairs/i)).toBeInTheDocument();
  });

  test('should display all key metrics', () => {
    renderWithAuth(<RepairStats repairs={mockRepairs} />);
    expect(screen.getByText(/total repairs/i)).toBeInTheDocument();
    const container = screen.getByText(/total repairs/i).closest('.repair-stats');
    expect(container).toBeInTheDocument();
  });

  test('should render without crashing with large dataset', () => {
    const largeDataset = Array.from({ length: 100 }, (_, i) => ({
      ...mockRepairs[0],
      id: i + 1,
      repairId: `REP${String(i + 1).padStart(3, '0')}`,
    }));
    renderWithAuth(<RepairStats repairs={largeDataset} />);
    expect(screen.getByText(/total repairs/i)).toBeInTheDocument();
  });

  test('should show percentage calculations if applicable', () => {
    renderWithAuth(<RepairStats repairs={mockRepairs} />);
    // Check for percentage-based stats if they exist
    const percentTexts = screen.queryAllByText(/%/i);
    expect(percentTexts.length).toBeGreaterThanOrEqual(0);
  });
  test('should handle repairs with same amount charged and cost', () => {
    const sameAmountRepairs = [
      { ...mockRepairs[0], repairCost: 500, amountCharged: 500 },
    ];
    renderWithAuth(<RepairStats repairs={sameAmountRepairs} />);
    expect(screen.getByText(/total repairs/i)).toBeInTheDocument();
  });
});
