import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TransactionCard from './TransactionCard';
import { Transaction } from './TransactionManagement';
import { AuthProvider } from '../../context/AuthContext';

jest.mock('axios');

jest.mock('../../utils/currency', () => ({
  formatCurrency: (amount: number) => `$${amount}`,
  getCurrencySymbol: () => '$',
  getCurrencyCode: () => 'USD',
}));

const mockTransaction: Transaction = {
  id: 1,
  transactionId: 'TRX001',
  customerName: 'John Doe',
  items: [
    { name: 'Item 1', quantity: 2, price: 100 },
    { name: 'Item 2', quantity: 1, price: 50 },
  ],
  totalAmount: 250,
  sellingDone: false,
  paymentDone: false,
  date: '2024-01-15',
  createdBy: 'admin',
};

const mockTransactionCompleted: Transaction = {
  ...mockTransaction,
  id: 2,
  transactionId: 'TRX002',
  sellingDone: true,
  paymentDone: true,
};

const mockTransactionPartial: Transaction = {
  ...mockTransaction,
  id: 3,
  transactionId: 'TRX003',
  sellingDone: true,
  paymentDone: false,
};

describe('TransactionCard Component', () => {
  const mockOnEdit = jest.fn();
  const mockOnStatusUpdate = jest.fn();
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

  // Existence and Type Tests
  test('TransactionCard component exists and is valid', () => {
    expect(TransactionCard).toBeDefined();
  });

  test('TransactionCard is a React component', () => {
    expect(typeof TransactionCard).toBe('function');
  });

  // Props Validation Tests
  test('should accept transaction prop', () => {
    const component = (
      <TransactionCard
        transaction={mockTransaction}
        onEdit={mockOnEdit}
        onStatusUpdate={mockOnStatusUpdate}
        onDelete={mockOnDelete}
      />
    );
    expect(component.props.transaction).toEqual(mockTransaction);
  });

  test('should accept onEdit callback prop', () => {
    const component = (
      <TransactionCard
        transaction={mockTransaction}
        onEdit={mockOnEdit}
        onStatusUpdate={mockOnStatusUpdate}
        onDelete={mockOnDelete}
      />
    );
    expect(typeof component.props.onEdit).toBe('function');
  });

  test('should accept onStatusUpdate callback prop', () => {
    const component = (
      <TransactionCard
        transaction={mockTransaction}
        onEdit={mockOnEdit}
        onStatusUpdate={mockOnStatusUpdate}
        onDelete={mockOnDelete}
      />
    );
    expect(typeof component.props.onStatusUpdate).toBe('function');
  });

  test('should accept onDelete callback prop', () => {
    const component = (
      <TransactionCard
        transaction={mockTransaction}
        onEdit={mockOnEdit}
        onStatusUpdate={mockOnStatusUpdate}
        onDelete={mockOnDelete}
      />
    );
    expect(typeof component.props.onDelete).toBe('function');
  });

  test('should render without crashing', () => {
    renderWithAuth(
      <TransactionCard
        transaction={mockTransaction}
        onEdit={mockOnEdit}
        onStatusUpdate={mockOnStatusUpdate}
        onDelete={mockOnDelete}
      />
    );
    expect(document.body).toBeInTheDocument();
  });

  // Rendering Tests
  test('should render transaction ID', () => {
    renderWithAuth(
      <TransactionCard
        transaction={mockTransaction}
        onEdit={mockOnEdit}
        onStatusUpdate={mockOnStatusUpdate}
        onDelete={mockOnDelete}
      />
    );
    expect(screen.getByText(mockTransaction.transactionId)).toBeInTheDocument();
  });

  test('should render customer name', () => {
    renderWithAuth(
      <TransactionCard
        transaction={mockTransaction}
        onEdit={mockOnEdit}
        onStatusUpdate={mockOnStatusUpdate}
        onDelete={mockOnDelete}
      />
    );
    expect(screen.getByText(mockTransaction.customerName)).toBeInTheDocument();
  });

  test('should render all transaction items', () => {
    renderWithAuth(
      <TransactionCard
        transaction={mockTransaction}
        onEdit={mockOnEdit}
        onStatusUpdate={mockOnStatusUpdate}
        onDelete={mockOnDelete}
      />
    );
    mockTransaction.items.forEach((item) => {
      expect(screen.getByText(item.name)).toBeInTheDocument();
    });
  });

  test('should render item quantities', () => {
    renderWithAuth(
      <TransactionCard
        transaction={mockTransaction}
        onEdit={mockOnEdit}
        onStatusUpdate={mockOnStatusUpdate}
        onDelete={mockOnDelete}
      />
    );
    mockTransaction.items.forEach((item) => {
      expect(screen.getByText(new RegExp(`${item.quantity}\\s*×`))).toBeInTheDocument();
    });
  });

  test('should render item prices', () => {
    renderWithAuth(
      <TransactionCard
        transaction={mockTransaction}
        onEdit={mockOnEdit}
        onStatusUpdate={mockOnStatusUpdate}
        onDelete={mockOnDelete}
      />
    );
    mockTransaction.items.forEach((item) => {
      expect(screen.getByText(new RegExp(`\\$${item.price.toFixed(2)}`))).toBeInTheDocument();
    });
  });

  test('should render total amount with currency', () => {
    renderWithAuth(
      <TransactionCard
        transaction={mockTransaction}
        onEdit={mockOnEdit}
        onStatusUpdate={mockOnStatusUpdate}
        onDelete={mockOnDelete}
      />
    );
    expect(screen.getByText(`$${mockTransaction.totalAmount}`)).toBeInTheDocument();
  });

  test('should render date formatted correctly', () => {
    renderWithAuth(
      <TransactionCard
        transaction={mockTransaction}
        onEdit={mockOnEdit}
        onStatusUpdate={mockOnStatusUpdate}
        onDelete={mockOnDelete}
      />
    );
    // Date is formatted as locale string with time
    const dateElement = screen.getByText(/Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/);
    expect(dateElement).toBeInTheDocument();
  });

  // Status Update Tests
  test('should render sellingDone checkbox as unchecked initially', () => {
    renderWithAuth(
      <TransactionCard
        transaction={mockTransaction}
        onEdit={mockOnEdit}
        onStatusUpdate={mockOnStatusUpdate}
        onDelete={mockOnDelete}
      />
    );
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[0].checked).toBe(false);
  });

  test('should render paymentDone checkbox as unchecked initially', () => {
    renderWithAuth(
      <TransactionCard
        transaction={mockTransaction}
        onEdit={mockOnEdit}
        onStatusUpdate={mockOnStatusUpdate}
        onDelete={mockOnDelete}
      />
    );
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[1].checked).toBe(false);
  });

  test('should render sellingDone checkbox as checked when true', () => {
    renderWithAuth(
      <TransactionCard
        transaction={mockTransactionPartial}
        onEdit={mockOnEdit}
        onStatusUpdate={mockOnStatusUpdate}
        onDelete={mockOnDelete}
      />
    );
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[0].checked).toBe(true);
  });

  test('should render paymentDone checkbox as checked when true', () => {
    renderWithAuth(
      <TransactionCard
        transaction={mockTransactionCompleted}
        onEdit={mockOnEdit}
        onStatusUpdate={mockOnStatusUpdate}
        onDelete={mockOnDelete}
      />
    );
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[1].checked).toBe(true);
  });

  test('should call onStatusUpdate when sellingDone checkbox is clicked', () => {
    renderWithAuth(
      <TransactionCard
        transaction={mockTransaction}
        onEdit={mockOnEdit}
        onStatusUpdate={mockOnStatusUpdate}
        onDelete={mockOnDelete}
      />
    );
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    expect(mockOnStatusUpdate).toHaveBeenCalledWith(
      mockTransaction.id,
      true,
      undefined
    );
  });

  test('should call onStatusUpdate when paymentDone checkbox is clicked', () => {
    renderWithAuth(
      <TransactionCard
        transaction={mockTransaction}
        onEdit={mockOnEdit}
        onStatusUpdate={mockOnStatusUpdate}
        onDelete={mockOnDelete}
      />
    );
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]);
    expect(mockOnStatusUpdate).toHaveBeenCalledWith(
      mockTransaction.id,
      undefined,
      true
    );
  });

  // Action Button Tests
  test('should render edit button', () => {
    renderWithAuth(
      <TransactionCard
        transaction={mockTransaction}
        onEdit={mockOnEdit}
        onStatusUpdate={mockOnStatusUpdate}
        onDelete={mockOnDelete}
      />
    );
    const editButton = screen.getByTitle('Edit');
    expect(editButton).toBeInTheDocument();
  });

  test('should render delete button', () => {
    renderWithAuth(
      <TransactionCard
        transaction={mockTransaction}
        onEdit={mockOnEdit}
        onStatusUpdate={mockOnStatusUpdate}
        onDelete={mockOnDelete}
      />
    );
    const deleteButton = screen.getByTitle('Delete');
    expect(deleteButton).toBeInTheDocument();
  });

  test('should call onEdit when edit button is clicked', () => {
    renderWithAuth(
      <TransactionCard
        transaction={mockTransaction}
        onEdit={mockOnEdit}
        onStatusUpdate={mockOnStatusUpdate}
        onDelete={mockOnDelete}
      />
    );
    const editButton = screen.getByTitle('Edit');
    fireEvent.click(editButton);
    expect(mockOnEdit).toHaveBeenCalledWith(mockTransaction);
  });

  test('should call onDelete when delete button is clicked', () => {
    renderWithAuth(
      <TransactionCard
        transaction={mockTransaction}
        onEdit={mockOnEdit}
        onStatusUpdate={mockOnStatusUpdate}
        onDelete={mockOnDelete}
      />
    );
    const deleteButton = screen.getByTitle('Delete');
    fireEvent.click(deleteButton);
    expect(mockOnDelete).toHaveBeenCalledWith(mockTransaction.id);
  });

  // Optional Callbacks Tests
  test('should render without onEdit callback', () => {
    renderWithAuth(
      <TransactionCard
        transaction={mockTransaction}
        onStatusUpdate={mockOnStatusUpdate}
        onDelete={mockOnDelete}
      />
    );
    expect(document.body).toBeInTheDocument();
  });

  test('should render without onStatusUpdate callback', () => {
    renderWithAuth(
      <TransactionCard
        transaction={mockTransaction}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    expect(document.body).toBeInTheDocument();
  });

  test('should render without onDelete callback', () => {
    renderWithAuth(
      <TransactionCard
        transaction={mockTransaction}
        onEdit={mockOnEdit}
        onStatusUpdate={mockOnStatusUpdate}
      />
    );
    expect(document.body).toBeInTheDocument();
  });

  // Edge Cases
  test('should handle transaction with single item', () => {
    const singleItemTransaction: Transaction = {
      ...mockTransaction,
      items: [{ name: 'Single Item', quantity: 1, price: 100 }],
      totalAmount: 100,
    };
    renderWithAuth(
      <TransactionCard
        transaction={singleItemTransaction}
        onEdit={mockOnEdit}
        onStatusUpdate={mockOnStatusUpdate}
        onDelete={mockOnDelete}
      />
    );
    expect(screen.getByText('Single Item')).toBeInTheDocument();
  });

  test('should handle transaction with many items', () => {
    const manyItemsTransaction: Transaction = {
      ...mockTransaction,
      items: Array.from({ length: 10 }, (_, i) => ({
        name: `Item ${i + 1}`,
        quantity: i + 1,
        price: (i + 1) * 10,
      })),
      totalAmount: 550,
    };
    renderWithAuth(
      <TransactionCard
        transaction={manyItemsTransaction}
        onEdit={mockOnEdit}
        onStatusUpdate={mockOnStatusUpdate}
        onDelete={mockOnDelete}
      />
    );
    expect(screen.getByText('Item 5')).toBeInTheDocument();
  });

  test('should handle zero total amount', () => {
    const zeroTransaction: Transaction = {
      ...mockTransaction,
      totalAmount: 0,
      items: [],
    };
    renderWithAuth(
      <TransactionCard
        transaction={zeroTransaction}
        onEdit={mockOnEdit}
        onStatusUpdate={mockOnStatusUpdate}
        onDelete={mockOnDelete}
      />
    );
    expect(screen.getByText('$0')).toBeInTheDocument();
  });

  test('should handle large amounts', () => {
    const largeTransaction: Transaction = {
      ...mockTransaction,
      totalAmount: 999999.99,
    };
    renderWithAuth(
      <TransactionCard
        transaction={largeTransaction}
        onEdit={mockOnEdit}
        onStatusUpdate={mockOnStatusUpdate}
        onDelete={mockOnDelete}
      />
    );
    expect(screen.getByText('$999999.99')).toBeInTheDocument();
  });
});
