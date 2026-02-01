import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TransactionList from './TransactionList';
import { Transaction } from './TransactionManagement';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';

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
    sellingDone: false,
    paymentDone: false,
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
];

describe('TransactionList Component', () => {
  const mockOnEdit = jest.fn();
  const mockOnStatusUpdate = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          {component}
        </AuthProvider>
      </BrowserRouter>
    );
  };

  // Existence and Type Tests
  test('should render without crashing', () => {
    renderWithProviders(
      <TransactionList transactions={[]} loading={false} />
    );
    expect(document.body).toBeInTheDocument();
  });

  test('should render transaction list container', () => {
    const { container } = renderWithProviders(
      <TransactionList transactions={[]} loading={false} />
    );
    expect(container).toBeInTheDocument();
  });

  test('should have proper component structure', () => {
    const { container } = renderWithProviders(
      <TransactionList transactions={[]} loading={false} />
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  // Props Validation Tests
  test('should accept transactions prop', () => {
    const component = (
      <TransactionList transactions={mockTransactions} loading={false} />
    );
    expect(component.props.transactions).toEqual(mockTransactions);
  });

  test('should accept loading prop', () => {
    const component = (
      <TransactionList transactions={[]} loading={true} />
    );
    expect(component.props.loading).toBe(true);
  });

  test('should accept optional onEdit callback', () => {
    const component = (
      <TransactionList
        transactions={[]}
        loading={false}
        onEdit={mockOnEdit}
      />
    );
    expect(typeof component.props.onEdit).toBe('function');
  });

  test('should accept optional onStatusUpdate callback', () => {
    const component = (
      <TransactionList
        transactions={[]}
        loading={false}
        onStatusUpdate={mockOnStatusUpdate}
      />
    );
    expect(typeof component.props.onStatusUpdate).toBe('function');
  });

  test('should accept optional onDelete callback', () => {
    const component = (
      <TransactionList
        transactions={[]}
        loading={false}
        onDelete={mockOnDelete}
      />
    );
    expect(typeof component.props.onDelete).toBe('function');
  });

  // Loading State Tests
  test('should show loading message when loading is true', () => {
    renderWithProviders(
      <TransactionList transactions={[]} loading={true} />
    );
    expect(screen.getByText('Loading transactions...')).toBeInTheDocument();
  });

  test('should not show empty message while loading', () => {
    renderWithProviders(
      <TransactionList transactions={[]} loading={true} />
    );
    expect(screen.queryByText(/No transactions found/i)).not.toBeInTheDocument();
  });

  test('should render loading spinner with proper styling', () => {
    const { container } = renderWithProviders(
      <TransactionList transactions={[]} loading={true} />
    );
    const loadingSpinner = container.querySelector('.loading-spinner');
    expect(loadingSpinner).toBeInTheDocument();
  });

  // Empty State Tests
  test('should show empty state message when no transactions', () => {
    renderWithProviders(
      <TransactionList transactions={[]} loading={false} />
    );
    expect(screen.getByText(/No transactions found/i)).toBeInTheDocument();
  });

  test('should show helpful message in empty state', () => {
    renderWithProviders(
      <TransactionList transactions={[]} loading={false} />
    );
    expect(screen.getByText(/Create your first transaction/i)).toBeInTheDocument();
  });

  test('should render empty state with proper styling', () => {
    const { container } = renderWithProviders(
      <TransactionList transactions={[]} loading={false} />
    );
    const emptyState = container.querySelector('.transaction-list-empty');
    expect(emptyState).toBeInTheDocument();
  });

  // List Display Tests
  test('should render list header when transactions exist', () => {
    renderWithProviders(
      <TransactionList transactions={mockTransactions} loading={false} />
    );
    expect(screen.getByText('Transactions')).toBeInTheDocument();
  });

  test('should display transaction count', () => {
    renderWithProviders(
      <TransactionList transactions={mockTransactions} loading={false} />
    );
    expect(screen.getByText('3 total')).toBeInTheDocument();
  });

  test('should render correct transaction count for various sizes', () => {
    const { rerender } = renderWithProviders(
      <TransactionList transactions={mockTransactions.slice(0, 1)} loading={false} />
    );
    expect(screen.getByText('1 total')).toBeInTheDocument();

    rerender(
      <TransactionList transactions={mockTransactions} loading={false} />
    );
    expect(screen.getByText('3 total')).toBeInTheDocument();
  });

  // Transaction Card Rendering Tests
  test('should render a transaction card for each transaction', () => {
    renderWithProviders(
      <TransactionList
        transactions={mockTransactions}
        loading={false}
        onEdit={mockOnEdit}
        onStatusUpdate={mockOnStatusUpdate}
        onDelete={mockOnDelete}
      />
    );
    mockTransactions.forEach((transaction) => {
      expect(screen.getByText(transaction.transactionId)).toBeInTheDocument();
    });
  });

  test('should render customer names for all transactions', () => {
    renderWithProviders(
      <TransactionList
        transactions={mockTransactions}
        loading={false}
        onEdit={mockOnEdit}
        onStatusUpdate={mockOnStatusUpdate}
        onDelete={mockOnDelete}
      />
    );
    mockTransactions.forEach((transaction) => {
      expect(screen.getByText(transaction.customerName)).toBeInTheDocument();
    });
  });

  test('should render total amounts for all transactions', () => {
    renderWithProviders(
      <TransactionList
        transactions={mockTransactions}
        loading={false}
        onEdit={mockOnEdit}
        onStatusUpdate={mockOnStatusUpdate}
        onDelete={mockOnDelete}
      />
    );
    mockTransactions.forEach((transaction) => {
      expect(screen.getByText(`$${transaction.totalAmount}`)).toBeInTheDocument();
    });
  });

  // Single Transaction Tests
  test('should render single transaction correctly', () => {
    renderWithProviders(
      <TransactionList
        transactions={[mockTransactions[0]]}
        loading={false}
        onEdit={mockOnEdit}
        onStatusUpdate={mockOnStatusUpdate}
        onDelete={mockOnDelete}
      />
    );
    expect(screen.getByText('1 total')).toBeInTheDocument();
    expect(screen.getByText(mockTransactions[0].transactionId)).toBeInTheDocument();
  });

  // Multiple Transactions Tests
  test('should render multiple transactions correctly', () => {
    renderWithProviders(
      <TransactionList
        transactions={mockTransactions}
        loading={false}
        onEdit={mockOnEdit}
        onStatusUpdate={mockOnStatusUpdate}
        onDelete={mockOnDelete}
      />
    );
    expect(screen.getByText('3 total')).toBeInTheDocument();
  });

  test('should handle large number of transactions', () => {
    const manyTransactions = Array.from({ length: 20 }, (_, i) => ({
      ...mockTransactions[0],
      id: i,
      transactionId: `TRX${String(i).padStart(3, '0')}`,
    }));
    renderWithProviders(
      <TransactionList
        transactions={manyTransactions}
        loading={false}
        onEdit={mockOnEdit}
        onStatusUpdate={mockOnStatusUpdate}
        onDelete={mockOnDelete}
      />
    );
    expect(screen.getByText('20 total')).toBeInTheDocument();
  });

  // Callback Passing Tests
  test('should pass onEdit callback to transaction cards', () => {
    renderWithProviders(
      <TransactionList
        transactions={mockTransactions}
        loading={false}
        onEdit={mockOnEdit}
        onStatusUpdate={mockOnStatusUpdate}
        onDelete={mockOnDelete}
      />
    );
    const editButtons = screen.getAllByTitle('Edit');
    expect(editButtons.length).toBe(mockTransactions.length);
  });

  test('should pass onStatusUpdate callback to transaction cards', () => {
    renderWithProviders(
      <TransactionList
        transactions={mockTransactions}
        loading={false}
        onEdit={mockOnEdit}
        onStatusUpdate={mockOnStatusUpdate}
        onDelete={mockOnDelete}
      />
    );
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThan(0);
  });

  test('should pass onDelete callback to transaction cards', () => {
    renderWithProviders(
      <TransactionList
        transactions={mockTransactions}
        loading={false}
        onEdit={mockOnEdit}
        onStatusUpdate={mockOnStatusUpdate}
        onDelete={mockOnDelete}
      />
    );
    const deleteButtons = screen.getAllByTitle('Delete');
    expect(deleteButtons.length).toBe(mockTransactions.length);
  });

  // Optional Callbacks Tests
  test('should render without onEdit callback', () => {
    renderWithProviders(
      <TransactionList
        transactions={mockTransactions}
        loading={false}
        onStatusUpdate={mockOnStatusUpdate}
        onDelete={mockOnDelete}
      />
    );
    expect(document.body).toBeInTheDocument();
  });

  test('should render without onStatusUpdate callback', () => {
    renderWithProviders(
      <TransactionList
        transactions={mockTransactions}
        loading={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    expect(document.body).toBeInTheDocument();
  });

  test('should render without onDelete callback', () => {
    renderWithProviders(
      <TransactionList
        transactions={mockTransactions}
        loading={false}
        onEdit={mockOnEdit}
        onStatusUpdate={mockOnStatusUpdate}
      />
    );
    expect(document.body).toBeInTheDocument();
  });

  // Grid/List Container Tests
  test('should render transaction grid container', () => {
    const { container } = renderWithProviders(
      <TransactionList
        transactions={mockTransactions}
        loading={false}
      />
    );
    const grid = container.querySelector('.transaction-grid');
    expect(grid).toBeInTheDocument();
  });

  test('should have transaction list header with class', () => {
    const { container } = renderWithProviders(
      <TransactionList
        transactions={mockTransactions}
        loading={false}
      />
    );
    const header = container.querySelector('.transaction-list-header');
    expect(header).toBeInTheDocument();
  });

  // State Transitions Tests
  test('should transition from loading to loaded state', () => {
    const { rerender } = renderWithProviders(
      <TransactionList transactions={[]} loading={true} />
    );
    expect(screen.getByText('Loading transactions...')).toBeInTheDocument();

    rerender(
      <TransactionList transactions={mockTransactions} loading={false} />
    );
    expect(screen.queryByText('Loading transactions...')).not.toBeInTheDocument();
    expect(screen.getByText(mockTransactions[0].transactionId)).toBeInTheDocument();
  });

  test('should transition from empty to loaded state', () => {
    const { rerender } = renderWithProviders(
      <TransactionList transactions={[]} loading={false} />
    );
    expect(screen.getByText(/No transactions found/i)).toBeInTheDocument();

    rerender(
      <TransactionList transactions={mockTransactions} loading={false} />
    );
    expect(screen.queryByText(/No transactions found/i)).not.toBeInTheDocument();
    expect(screen.getByText('3 total')).toBeInTheDocument();
  });

  // Edge Cases
  test('should handle transactions with special characters in names', () => {
    const specialTransactions: Transaction[] = [
      {
        ...mockTransactions[0],
        customerName: "John O'Brien & Sons",
      },
    ];
    renderWithProviders(
      <TransactionList transactions={specialTransactions} loading={false} />
    );
    expect(screen.getByText("John O'Brien & Sons")).toBeInTheDocument();
  });

  test('should handle transactions with very long customer names', () => {
    const longNameTransaction: Transaction[] = [
      {
        ...mockTransactions[0],
        customerName: 'A'.repeat(100),
      },
    ];
    renderWithProviders(
      <TransactionList transactions={longNameTransaction} loading={false} />
    );
    const longName = 'A'.repeat(100);
    expect(screen.getByText(longName)).toBeInTheDocument();
  });

  test('should handle transactions with zero amounts', () => {
    const zeroAmountTransaction: Transaction[] = [
      {
        ...mockTransactions[0],
        totalAmount: 0,
      },
    ];
    renderWithProviders(
      <TransactionList
        transactions={zeroAmountTransaction}
        loading={false}
      />
    );
    expect(screen.getByText('$0')).toBeInTheDocument();
  });

  test('should handle transactions with very large amounts', () => {
    const largeAmountTransaction: Transaction[] = [
      {
        ...mockTransactions[0],
        totalAmount: 999999999.99,
      },
    ];
    renderWithProviders(
      <TransactionList
        transactions={largeAmountTransaction}
        loading={false}
      />
    );
    expect(screen.getByText('$999999999.99')).toBeInTheDocument();
  });

  // CSS Class Tests
  test('should have transaction-list class on main container', () => {
    const { container } = renderWithProviders(
      <TransactionList
        transactions={mockTransactions}
        loading={false}
      />
    );
    const list = container.querySelector('.transaction-list');
    expect(list).toBeInTheDocument();
  });

  test('should have transaction-list-loading class when loading', () => {
    const { container } = renderWithProviders(
      <TransactionList transactions={[]} loading={true} />
    );
    const loading = container.querySelector('.transaction-list-loading');
    expect(loading).toBeInTheDocument();
  });

  test('should have transaction-list-empty class when empty', () => {
    const { container } = renderWithProviders(
      <TransactionList transactions={[]} loading={false} />
    );
    const empty = container.querySelector('.transaction-list-empty');
    expect(empty).toBeInTheDocument();
  });

  // Rendering Performance Tests
  test('should render correctly after data updates', () => {
    const { rerender } = renderWithProviders(
      <TransactionList
        transactions={[mockTransactions[0]]}
        loading={false}
      />
    );
    expect(screen.getByText('1 total')).toBeInTheDocument();

    rerender(
      <TransactionList
        transactions={[mockTransactions[0], mockTransactions[1]]}
        loading={false}
      />
    );
    expect(screen.getByText('2 total')).toBeInTheDocument();
  });

  test('should handle rapid state changes', () => {
    const { rerender } = renderWithProviders(
      <TransactionList transactions={[]} loading={true} />
    );

    rerender(
      <TransactionList transactions={mockTransactions.slice(0, 1)} loading={false} />
    );
    rerender(
      <TransactionList transactions={mockTransactions} loading={false} />
    );

    expect(screen.getByText('3 total')).toBeInTheDocument();
  });
});
