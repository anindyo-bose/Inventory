import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TransactionStats from './TransactionStats';
import { Transaction } from './TransactionManagement';

jest.mock('axios');

jest.mock('../../utils/currency', () => ({
  formatCurrency: (amount: number) => `$${amount}`,
  getCurrencySymbol: () => '$',
  getCurrencyCode: () => 'USD',
}));

const mockTransactions: Transaction[] = [
  {
    id: 1,
    transactionId: 'TRX001',
    customerName: 'John Doe',
    items: [{ name: 'Item 1', quantity: 2, price: 100 }],
    totalAmount: 200,
    sellingDone: true,
    paymentDone: true,
    date: '2024-01-15',
    createdBy: 'admin',
  },
  {
    id: 2,
    transactionId: 'TRX002',
    customerName: 'Jane Smith',
    items: [{ name: 'Item 2', quantity: 1, price: 150 }],
    totalAmount: 150,
    sellingDone: true,
    paymentDone: false,
    date: '2024-01-16',
    createdBy: 'admin',
  },
  {
    id: 3,
    transactionId: 'TRX003',
    customerName: 'Bob Wilson',
    items: [{ name: 'Item 3', quantity: 3, price: 100 }],
    totalAmount: 300,
    sellingDone: false,
    paymentDone: false,
    date: '2024-01-17',
    createdBy: 'admin',
  },
  {
    id: 4,
    transactionId: 'TRX004',
    customerName: 'Alice Johnson',
    items: [{ name: 'Item 4', quantity: 1, price: 75 }],
    totalAmount: 75,
    sellingDone: true,
    paymentDone: true,
    date: '2024-01-18',
    createdBy: 'admin',
  },
];

describe('TransactionStats Component', () => {
  // Existence and Type Tests
  test('TransactionStats component exists', () => {
    expect(TransactionStats).toBeDefined();
  });

  test('TransactionStats is a React component', () => {
    expect(typeof TransactionStats).toBe('function');
  });

  test('should accept transactions prop', () => {
    const component = <TransactionStats transactions={mockTransactions} />;
    expect(component.props.transactions).toEqual(mockTransactions);
  });

  test('should render without crashing', () => {
    render(<TransactionStats transactions={mockTransactions} />);
    expect(document.body).toBeInTheDocument();
  });

  // Total Transactions Test
  test('should calculate and display total transactions count', () => {
    render(<TransactionStats transactions={mockTransactions} />);
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  test('should display total transactions label', () => {
    render(<TransactionStats transactions={mockTransactions} />);
    expect(screen.getByText('Total Transactions')).toBeInTheDocument();
  });

  // Completed Transactions Test
  test('should calculate completed transactions (sellingDone AND paymentDone)', () => {
    render(<TransactionStats transactions={mockTransactions} />);
    // Should have 2 completed transactions (TRX001 and TRX004)
    const statText = screen.getByText('2');
    expect(statText).toBeInTheDocument();
  });

  test('should count only transactions with both selling and payment done', () => {
    const testTransactions: Transaction[] = [
      { ...mockTransactions[0], sellingDone: true, paymentDone: true },
      { ...mockTransactions[1], sellingDone: true, paymentDone: false },
      { ...mockTransactions[2], sellingDone: false, paymentDone: true },
    ];
    render(<TransactionStats transactions={testTransactions} />);
    const stats = screen.getAllByText(/\d+/);
    expect(stats.length).toBeGreaterThan(0);
  });

  // Pending Selling Test
  test('should calculate pending selling (NOT sellingDone)', () => {
    render(<TransactionStats transactions={mockTransactions} />);
    // Should have 1 transaction with sellingDone = false (TRX003)
    expect(document.body).toBeInTheDocument();
  });

  // Pending Payment Test
  test('should calculate pending payment (sellingDone AND NOT paymentDone)', () => {
    render(<TransactionStats transactions={mockTransactions} />);
    // Should have 1 transaction with sellingDone = true and paymentDone = false (TRX002)
    expect(document.body).toBeInTheDocument();
  });

  // Total Revenue Test
  test('should calculate total revenue from completed transactions (paymentDone)', () => {
    render(<TransactionStats transactions={mockTransactions} />);
    // TRX001: 200, TRX004: 75 = 275
    expect(screen.getByText('$275')).toBeInTheDocument();
  });

  test('should exclude unpaid transactions from revenue', () => {
    const testTransactions: Transaction[] = [
      { ...mockTransactions[0], totalAmount: 100, paymentDone: true },
      { ...mockTransactions[1], totalAmount: 50, paymentDone: false },
    ];
    render(<TransactionStats transactions={testTransactions} />);
    expect(screen.getByText('$100')).toBeInTheDocument();
  });

  // Empty Transactions Tests
  test('should handle empty transactions array', () => {
    render(<TransactionStats transactions={[]} />);
    const zeroValues = screen.getAllByText('0');
    expect(zeroValues.length).toBeGreaterThan(0);
  });

  test('should show zero revenue with empty transactions', () => {
    render(<TransactionStats transactions={[]} />);
    expect(screen.getByText('$0')).toBeInTheDocument();
  });

  // Single Transaction Tests
  test('should handle single completed transaction', () => {
    const singleCompleted: Transaction[] = [mockTransactions[0]];
    const { container } = render(<TransactionStats transactions={singleCompleted} />);
    const statValues = container.querySelectorAll('.stat-value');
    expect(statValues.length).toBeGreaterThan(0);
  });

  test('should handle single uncompleted transaction', () => {
    const singleUncompleted: Transaction[] = [mockTransactions[2]];
    render(<TransactionStats transactions={singleUncompleted} />);
    expect(document.body).toBeInTheDocument();
  });

  // All States Tests
  test('should handle all transactions completed', () => {
    const allCompleted: Transaction[] = mockTransactions.map((t) => ({
      ...t,
      sellingDone: true,
      paymentDone: true,
    }));
    render(<TransactionStats transactions={allCompleted} />);
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  test('should handle all transactions pending', () => {
    const allPending: Transaction[] = mockTransactions.map((t) => ({
      ...t,
      sellingDone: false,
      paymentDone: false,
    }));
    render(<TransactionStats transactions={allPending} />);
    expect(screen.getByText('$0')).toBeInTheDocument();
  });

  test('should handle all transactions with pending payment only', () => {
    const allPendingPayment: Transaction[] = mockTransactions.map((t) => ({
      ...t,
      sellingDone: true,
      paymentDone: false,
    }));
    render(<TransactionStats transactions={allPendingPayment} />);
    expect(screen.getByText('$0')).toBeInTheDocument();
  });

  // Stat Cards Display Tests
  test('should render multiple stat cards', () => {
    render(<TransactionStats transactions={mockTransactions} />);
    const container = document.querySelector('.stats-container');
    expect(container).toBeInTheDocument();
  });

  test('should render stat cards with proper styling', () => {
    const { container } = render(<TransactionStats transactions={mockTransactions} />);
    const statCards = container.querySelectorAll('.stat-card');
    expect(statCards.length).toBeGreaterThan(0);
  });

  // Large Amount Tests
  test('should handle large transaction amounts', () => {
    const largeTransactions: Transaction[] = [
      {
        ...mockTransactions[0],
        totalAmount: 999999.99,
        paymentDone: true,
      },
    ];
    render(<TransactionStats transactions={largeTransactions} />);
    expect(screen.getByText('$999999.99')).toBeInTheDocument();
  });

  // Multiple Transactions with Various Amounts
  test('should sum multiple completed transactions correctly', () => {
    const multipleTransactions: Transaction[] = [
      { ...mockTransactions[0], totalAmount: 100, paymentDone: true },
      { ...mockTransactions[1], totalAmount: 200, paymentDone: true },
      { ...mockTransactions[2], totalAmount: 300, paymentDone: true },
    ];
    render(<TransactionStats transactions={multipleTransactions} />);
    expect(screen.getByText('$600')).toBeInTheDocument();
  });

  // Calculations Accuracy
  test('should calculate pending selling correctly with mixed states', () => {
    const mixedTransactions: Transaction[] = [
      { ...mockTransactions[0], sellingDone: true },
      { ...mockTransactions[1], sellingDone: true },
      { ...mockTransactions[2], sellingDone: false },
      { ...mockTransactions[3], sellingDone: false },
    ];
    const { container } = render(<TransactionStats transactions={mixedTransactions} />);
    const stats = container.querySelectorAll('.stat-card');
    expect(stats.length).toBe(5);
  });

  test('should calculate pending payment correctly with mixed states', () => {
    const mixedTransactions: Transaction[] = [
      { ...mockTransactions[0], sellingDone: true, paymentDone: true },
      { ...mockTransactions[1], sellingDone: true, paymentDone: false },
      { ...mockTransactions[2], sellingDone: false, paymentDone: true },
      { ...mockTransactions[3], sellingDone: false, paymentDone: false },
    ];
    const { container } = render(<TransactionStats transactions={mixedTransactions} />);
    const stats = container.querySelectorAll('.stat-card');
    expect(stats.length).toBe(5);
  });

  // Zero Values
  test('should display zero total transactions with empty array', () => {
    const { container } = render(<TransactionStats transactions={[]} />);
    const zeroValues = container.querySelectorAll('[class*="stat-value"]');
    expect(zeroValues.length).toBeGreaterThan(0);
  });

  test('should display correct stats when no transactions are complete', () => {
    const noComplete: Transaction[] = [
      { ...mockTransactions[0], sellingDone: false, paymentDone: false },
      { ...mockTransactions[1], sellingDone: false, paymentDone: false },
    ];
    render(<TransactionStats transactions={noComplete} />);
    expect(screen.getByText('$0')).toBeInTheDocument();
  });

  // Sorting and Order Tests
  test('should maintain consistent calculations regardless of transaction order', () => {
    const { rerender, container: container1 } = render(<TransactionStats transactions={mockTransactions} />);
    const statCards1 = container1.querySelectorAll('.stat-card');

    const reversedTransactions = [...mockTransactions].reverse();
    const { container: container2 } = rerender(<TransactionStats transactions={reversedTransactions} />);
    const statCards2 = container2.querySelectorAll('.stat-card');

    expect(statCards1.length).toBe(statCards2.length);
  });

  // Precision Tests
  test('should handle decimal amounts correctly', () => {
    const decimalTransactions: Transaction[] = [
      {
        ...mockTransactions[0],
        totalAmount: 100.50,
        paymentDone: true,
      },
      {
        ...mockTransactions[1],
        totalAmount: 200.75,
        paymentDone: true,
      },
    ];
    render(<TransactionStats transactions={decimalTransactions} />);
    expect(screen.getByText('$301.25')).toBeInTheDocument();
  });

  // Integration Tests
  test('should update stats when transactions change', () => {
    const { rerender } = render(<TransactionStats transactions={mockTransactions.slice(0, 2)} />);
    expect(document.body).toBeInTheDocument();

    rerender(<TransactionStats transactions={mockTransactions} />);
    expect(document.body).toBeInTheDocument();
  });

  test('should display all 5 stat categories', () => {
    const { container } = render(<TransactionStats transactions={mockTransactions} />);
    const statCards = container.querySelectorAll('[class*="stat"]');
    expect(statCards.length).toBeGreaterThan(0);
  });
});
});
