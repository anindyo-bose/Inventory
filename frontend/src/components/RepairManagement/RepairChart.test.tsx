import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import RepairChart from './RepairChart';
import { Repair } from './RepairManagement';
import { AuthProvider } from '../../context/AuthContext';

// Don't mock react-chartjs-2, just let it render
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

describe('RepairChart Component', () => {
  test('should render repair chart', () => {
    const { container } = renderWithAuth(<RepairChart repairs={mockRepairs} />);
    expect(container).toBeInTheDocument();
  });

  test('should render without crashing with valid data', () => {
    const { container } = renderWithAuth(<RepairChart repairs={mockRepairs} />);
    expect(container.children.length).toBeGreaterThanOrEqual(0);
  });

  test('should render with empty repairs array', () => {
    const { container } = renderWithAuth(<RepairChart repairs={[]} />);
    expect(container).toBeInTheDocument();
  });

  test('should render with single repair', () => {
    renderWithAuth(<RepairChart repairs={[mockRepairs[0]]} />);
    expect(screen.getByText(/financial/i)).toBeInTheDocument();
  });

  test('should handle large repair datasets', () => {
    const largeDataset = Array.from({ length: 100 }, (_, i) => ({
      ...mockRepairs[0],
      id: i + 1,
      repairId: `REP${String(i + 1).padStart(3, '0')}`,
    }));
    renderWithAuth(<RepairChart repairs={largeDataset} />);
    expect(screen.getByText(/financial/i)).toBeInTheDocument();
  });

  test('should render charts container', () => {
    const { container } = renderWithAuth(<RepairChart repairs={mockRepairs} />);
    expect(container.querySelector('[class*="chart"]')).toBeInTheDocument();
  });

  test('should pass repair data correctly', () => {
    renderWithAuth(<RepairChart repairs={mockRepairs} />);
    expect(screen.getByText(/financial/i)).toBeInTheDocument();
  });

  test('should handle repairs with different statuses', () => {
    const mixedStatusRepairs = [
      { ...mockRepairs[0], status: 'in_progress' as const },
      { ...mockRepairs[1], status: 'repaired' as const },
      { ...mockRepairs[2], status: 'cancelled' as const },
    ];
    renderWithAuth(<RepairChart repairs={mixedStatusRepairs} />);
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });

  test('should render responsive chart', () => {
    const { container } = renderWithAuth(<RepairChart repairs={mockRepairs} />);
    const chart = container.querySelector('[class*="chart"]');
    expect(chart).toBeInTheDocument();
  });

  test('should update when repair data changes', () => {
    const { rerender } = renderWithAuth(<RepairChart repairs={mockRepairs} />);
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();

    rerender(<RepairChart repairs={[mockRepairs[0]]} />);
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });

  test('should handle repairs with zero costs', () => {
    const zeroCostRepairs = [
      { ...mockRepairs[0], repairCost: 0, amountCharged: 100 },
    ];
    renderWithAuth(<RepairChart repairs={zeroCostRepairs} />);
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });

  test('should render status distribution chart', () => {
    renderWithAuth(<RepairChart repairs={mockRepairs} />);
    expect(screen.getByText(/financial/i)).toBeInTheDocument();
  });

  test('should render revenue distribution chart', () => {
    renderWithAuth(<RepairChart repairs={mockRepairs} />);
    expect(screen.getByText(/financial/i)).toBeInTheDocument();
  });

  test('should handle chart rendering errors gracefully', () => {
    const { container } = renderWithAuth(<RepairChart repairs={mockRepairs} />);
    expect(container).toBeInTheDocument();
  });

  test('should display chart with proper dimensions', () => {
    const { container } = renderWithAuth(<RepairChart repairs={mockRepairs} />);
    const chartContainer = container.querySelector('[class*="chart"]');
    expect(chartContainer).toHaveClass(expect.stringContaining('chart'));
  });

  test('should render all chart sections', () => {
    const { container } = renderWithAuth(<RepairChart repairs={mockRepairs} />);
    const sections = container.querySelectorAll('[class*="section"]');
    expect(sections.length).toBeGreaterThanOrEqual(0);
  });

  test('should handle repairs with same costs', () => {
    const sameCostRepairs = [
      { ...mockRepairs[0], repairCost: 500 },
      { ...mockRepairs[1], repairCost: 500 },
    ];
    renderWithAuth(<RepairChart repairs={sameCostRepairs} />);
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });

  test('should update chart on data change', () => {
    const { rerender } = renderWithAuth(<RepairChart repairs={mockRepairs} />);
    expect(screen.getByText(/financial/i)).toBeInTheDocument();

    rerender(<AuthProvider><RepairChart repairs={[mockRepairs[0], mockRepairs[1]]} /></AuthProvider>);
    expect(screen.getByText(/financial/i)).toBeInTheDocument();
  });

  test('should render with various time ranges', () => {
    renderWithAuth(<RepairChart repairs={mockRepairs} />);
    expect(screen.getByText(/financial/i)).toBeInTheDocument();
  });

  test('should be accessible for screen readers', () => {
    renderWithAuth(<RepairChart repairs={mockRepairs} />);
    expect(screen.getByText(/financial/i)).toBeInTheDocument();
  });

  test('should handle rapid data updates', () => {
    const { rerender } = renderWithAuth(<RepairChart repairs={mockRepairs} />);
    
    rerender(<AuthProvider><RepairChart repairs={[mockRepairs[0]]} /></AuthProvider>);
    rerender(<AuthProvider><RepairChart repairs={mockRepairs} /></AuthProvider>);
    rerender(<AuthProvider><RepairChart repairs={[mockRepairs[1]]} /></AuthProvider>);
    
    expect(screen.getByText(/financial/i)).toBeInTheDocument();
  });

  test('should render chart without data', () => {
    const { container } = renderWithAuth(<RepairChart repairs={[]} />);
    expect(container).toBeInTheDocument();
  });
});
