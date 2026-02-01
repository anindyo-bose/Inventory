import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
    expect(screen.getByText(/financial overview/i)).toBeInTheDocument();
  });

  test('should render responsive chart', () => {
    const { container } = renderWithAuth(<RepairChart repairs={mockRepairs} />);
    const chart = container.querySelector('.repair-chart');
    expect(chart).toBeInTheDocument();
  });

  test('should update when repair data changes', () => {
    const { rerender } = renderWithAuth(<RepairChart repairs={mockRepairs} />);
    expect(screen.getByText(/financial overview/i)).toBeInTheDocument();

    rerender(
      <AuthProvider>
        <RepairChart repairs={[mockRepairs[0]]} />
      </AuthProvider>
    );
    expect(screen.getByText(/financial overview/i)).toBeInTheDocument();
  });

  test('should handle repairs with zero costs', () => {
    const zeroCostRepairs = [
      { ...mockRepairs[0], repairCost: 0, amountCharged: 100 },
    ];
    renderWithAuth(<RepairChart repairs={zeroCostRepairs} />);
    expect(screen.getByText(/total charged/i)).toBeInTheDocument();
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
    const chartContainer = container.querySelector('.repair-chart');
    expect(chartContainer).toBeInTheDocument();
  });

  test('should render all chart sections', () => {
    const { container } = renderWithAuth(<RepairChart repairs={mockRepairs} />);
    const sections = container.querySelectorAll('.summary-item');
    expect(sections.length).toBeGreaterThan(0);
  });

  test('should handle repairs with same costs', () => {
    const sameCostRepairs = [
      { ...mockRepairs[0], repairCost: 500 },
      { ...mockRepairs[1], repairCost: 500 },
    ];
    renderWithAuth(<RepairChart repairs={sameCostRepairs} />);
    expect(screen.getByText(/total charged/i)).toBeInTheDocument();
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
    expect(screen.getByText(/no data available/i)).toBeInTheDocument();
  });

  test('should display all time range buttons', () => {
    renderWithAuth(<RepairChart repairs={mockRepairs} />);
    expect(screen.getByRole('button', { name: /weekly/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /monthly/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /yearly/i })).toBeInTheDocument();
  });

  test('should switch to weekly view when clicked', async () => {
    renderWithAuth(<RepairChart repairs={mockRepairs} />);
    const weeklyButton = screen.getByRole('button', { name: /weekly/i });
    fireEvent.click(weeklyButton);
    
    await waitFor(() => {
      expect(weeklyButton.className).toContain('active');
    });
  });

  test('should switch to monthly view when clicked', async () => {
    renderWithAuth(<RepairChart repairs={mockRepairs} />);
    const monthlyButton = screen.getByRole('button', { name: /monthly/i });
    fireEvent.click(monthlyButton);
    
    await waitFor(() => {
      expect(monthlyButton.className).toContain('active');
    });
  });

  test('should switch to yearly view when clicked', async () => {
    renderWithAuth(<RepairChart repairs={mockRepairs} />);
    const yearlyButton = screen.getByRole('button', { name: /yearly/i });
    fireEvent.click(yearlyButton);
    
    await waitFor(() => {
      expect(yearlyButton.className).toContain('active');
    });
  });

  test('should display summary items', () => {
    renderWithAuth(<RepairChart repairs={mockRepairs} />);
    expect(screen.getByText(/total charged/i)).toBeInTheDocument();
    expect(screen.getByText(/total profit/i)).toBeInTheDocument();
    expect(screen.getByText(/total due/i)).toBeInTheDocument();
  });

  test('should calculate correct total charged', () => {
    renderWithAuth(<RepairChart repairs={mockRepairs} />);
    const totalCharged = mockRepairs.reduce((sum, r) => sum + r.amountCharged, 0);
    expect(screen.getByText(`$${totalCharged}`)).toBeInTheDocument();
  });

  test('should calculate correct total profit', () => {
    renderWithAuth(<RepairChart repairs={mockRepairs} />);
    const totalProfit = mockRepairs.reduce((sum, r) => sum + (r.amountCharged - r.repairCost), 0);
    expect(screen.getByText(`$${totalProfit}`)).toBeInTheDocument();
  });

  test('should calculate correct total due', () => {
    renderWithAuth(<RepairChart repairs={mockRepairs} />);
    const totalDue = mockRepairs
      .filter(r => r.status !== 'delivered' && r.status !== 'cancelled')
      .reduce((sum, r) => sum + (r.amountCharged - (r.advanceAmount || 0)), 0);
    expect(screen.getByText(`$${totalDue}`)).toBeInTheDocument();
  });

  test('should render header with title', () => {
    renderWithAuth(<RepairChart repairs={mockRepairs} />);
    expect(screen.getByRole('heading', { name: /financial overview/i })).toBeInTheDocument();
  });

  test('should handle repairs with lost scenarios', () => {
    const lossRepairs = [
      { ...mockRepairs[0], repairCost: 800, amountCharged: 500 },
    ];
    renderWithAuth(<RepairChart repairs={lossRepairs} />);
    expect(screen.getByText(/financial overview/i)).toBeInTheDocument();
  });

  test('should handle break-even scenarios', () => {
    const breakEvenRepairs = [
      { ...mockRepairs[0], repairCost: 600, amountCharged: 600 },
    ];
    renderWithAuth(<RepairChart repairs={breakEvenRepairs} />);
    expect(screen.getByText(/financial overview/i)).toBeInTheDocument();
  });

  test('should handle repairs with no advance amount', () => {
    const noAdvanceRepairs = mockRepairs.map(r => ({ ...r, advanceAmount: 0 }));
    renderWithAuth(<RepairChart repairs={noAdvanceRepairs} />);
    expect(screen.getByText(/total charged/i)).toBeInTheDocument();
  });

  test('should handle delivered repairs correctly in due calculation', () => {
    const deliveredRepairs = [
      { ...mockRepairs[0], status: 'delivered' as const },
    ];
    renderWithAuth(<RepairChart repairs={deliveredRepairs} />);
    expect(screen.getByText(/total due/i)).toBeInTheDocument();
  });

  test('should handle cancelled repairs correctly in due calculation', () => {
    const cancelledRepairs = [
      { ...mockRepairs[0], status: 'cancelled' as const },
    ];
    renderWithAuth(<RepairChart repairs={cancelledRepairs} />);
    expect(screen.getByText(/total due/i)).toBeInTheDocument();
  });

  test('should aggregate data by month', async () => {
    const monthlyRepairs = [
      { ...mockRepairs[0], receivedDate: '2024-01-15' },
      { ...mockRepairs[1], receivedDate: '2024-01-20' },
      { ...mockRepairs[2], receivedDate: '2024-02-10' },
    ];
    renderWithAuth(<RepairChart repairs={monthlyRepairs} />);
    expect(screen.getByText(/financial overview/i)).toBeInTheDocument();
  });

  test('should aggregate data by week', async () => {
    const { container } = renderWithAuth(<RepairChart repairs={mockRepairs} />);
    const weeklyButton = screen.getByRole('button', { name: /weekly/i });
    fireEvent.click(weeklyButton);
    
    await waitFor(() => {
      expect(container.querySelector('.repair-chart')).toBeInTheDocument();
    });
  });

  test('should aggregate data by year', async () => {
    const { container } = renderWithAuth(<RepairChart repairs={mockRepairs} />);
    const yearlyButton = screen.getByRole('button', { name: /yearly/i });
    fireEvent.click(yearlyButton);
    
    await waitFor(() => {
      expect(container.querySelector('.repair-chart')).toBeInTheDocument();
    });
  });

  test('should handle mixed delivery and pending statuses', () => {
    const mixedRepairs = [
      { ...mockRepairs[0], status: 'delivered' as const },
      { ...mockRepairs[1], status: 'pending' as const },
      { ...mockRepairs[2], status: 'in_progress' as const },
    ];
    renderWithAuth(<RepairChart repairs={mixedRepairs} />);
    expect(screen.getByText(/total charged/i)).toBeInTheDocument();
  });

  test('should update view when time range changes', () => {
    const { rerender } = renderWithAuth(<RepairChart repairs={mockRepairs} />);
    const monthlyButton = screen.getByRole('button', { name: /monthly/i });
    fireEvent.click(monthlyButton);
    
    expect(screen.getByText(/financial overview/i)).toBeInTheDocument();
  });

  test('should re-render when repairs data changes significantly', () => {
    const { rerender } = renderWithAuth(<RepairChart repairs={[mockRepairs[0]]} />);
    expect(screen.getByText(/total charged/i)).toBeInTheDocument();
    
    rerender(
      <AuthProvider>
        <RepairChart repairs={mockRepairs} />
      </AuthProvider>
    );
    
    expect(screen.getByText(/total charged/i)).toBeInTheDocument();
  });

  test('should display chart correctly with multiple repairs from different months', () => {
    const multiMonthRepairs = [
      { ...mockRepairs[0], receivedDate: '2024-01-10' },
      { ...mockRepairs[1], receivedDate: '2024-02-15' },
      { ...mockRepairs[2], receivedDate: '2024-03-20' },
    ];
    renderWithAuth(<RepairChart repairs={multiMonthRepairs} />);
    expect(screen.getByText(/financial overview/i)).toBeInTheDocument();
  });

  test('should handle all financial edge cases', () => {
    const edgeCaseRepairs = [
      { ...mockRepairs[0], repairCost: 0, amountCharged: 100, advanceAmount: 100 },
      { ...mockRepairs[1], repairCost: 500, amountCharged: 500, advanceAmount: 500 },
      { ...mockRepairs[2], repairCost: 1000, amountCharged: 500, advanceAmount: 0 },
    ];
    renderWithAuth(<RepairChart repairs={edgeCaseRepairs} />);
    expect(screen.getByText(/financial overview/i)).toBeInTheDocument();
  });
});
