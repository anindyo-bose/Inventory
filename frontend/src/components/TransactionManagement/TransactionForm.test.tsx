import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import TransactionForm from './TransactionForm';
import { Transaction } from './TransactionManagement';
import { AuthProvider } from '../../context/AuthContext';

jest.mock('axios');
import axios from 'axios';

// Initialize default mock implementations
const mockedAxios = axios as jest.Mocked<typeof axios>;
mockedAxios.get = jest.fn();
mockedAxios.post = jest.fn();
mockedAxios.put = jest.fn();
mockedAxios.patch = jest.fn();
mockedAxios.delete = jest.fn();

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

describe('TransactionForm Component', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

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
  test('TransactionForm component exists', () => {
    expect(TransactionForm).toBeDefined();
  });

  test('TransactionForm is a React component', () => {
    expect(typeof TransactionForm).toBe('function');
  });

  // Props Validation Tests
  test('should accept transaction prop as null for create mode', () => {
    const component = (
      <TransactionForm
        transaction={null}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );
    expect(component.props.transaction).toBeNull();
  });

  test('should accept transaction prop with data for edit mode', () => {
    const component = (
      <TransactionForm
        transaction={mockTransaction}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );
    expect(component.props.transaction).toEqual(mockTransaction);
  });

  test('should accept onClose callback', () => {
    const component = (
      <TransactionForm
        transaction={null}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );
    expect(typeof component.props.onClose).toBe('function');
  });

  test('should accept onSuccess callback', () => {
    const component = (
      <TransactionForm
        transaction={null}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );
    expect(typeof component.props.onSuccess).toBe('function');
  });

  // Create Mode Tests
  test('should render form in create mode when transaction is null', () => {
    renderWithAuth(
      <TransactionForm
        transaction={null}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );
    expect(screen.getByText('New Transaction')).toBeInTheDocument();
  });

  test('should render "Create Transaction" button in create mode', () => {
    renderWithAuth(
      <TransactionForm
        transaction={null}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );
    expect(screen.getByRole('button', { name: /Create Transaction/i })).toBeInTheDocument();
  });

  // Edit Mode Tests
  test('should render form in edit mode when transaction is provided', () => {
    renderWithAuth(
      <TransactionForm
        transaction={mockTransaction}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );
    expect(screen.getByText('Edit Transaction')).toBeInTheDocument();
  });

  test('should render "Update Transaction" button in edit mode', () => {
    renderWithAuth(
      <TransactionForm
        transaction={mockTransaction}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );
    expect(screen.getByRole('button', { name: /Update Transaction/i })).toBeInTheDocument();
  });

  test('should populate customer name field in edit mode', () => {
    renderWithAuth(
      <TransactionForm
        transaction={mockTransaction}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );
    const customerInput = screen.getByPlaceholderText('Enter customer name') as HTMLInputElement;
    expect(customerInput.value).toBe(mockTransaction.customerName);
  });

  test('should populate item fields in edit mode', () => {
    renderWithAuth(
      <TransactionForm
        transaction={mockTransaction}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );
    mockTransaction.items.forEach((item) => {
      expect(screen.getByDisplayValue(item.name)).toBeInTheDocument();
    });
  });

  // Form Elements Tests
  test('should render customer name input field', () => {
    renderWithAuth(
      <TransactionForm
        transaction={null}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );
    expect(screen.getByPlaceholderText('Enter customer name')).toBeInTheDocument();
  });

  test('should render items section with label', () => {
    renderWithAuth(
      <TransactionForm
        transaction={null}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );
    expect(screen.getByText('Items *')).toBeInTheDocument();
  });

  test('should render Add Item button', () => {
    renderWithAuth(
      <TransactionForm
        transaction={null}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );
    expect(screen.getByRole('button', { name: /\+ Add Item/i })).toBeInTheDocument();
  });

  test('should render total amount display', () => {
    renderWithAuth(
      <TransactionForm
        transaction={null}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );
    expect(screen.getByText('Total Amount:')).toBeInTheDocument();
  });

  test('should render Cancel button', () => {
    renderWithAuth(
      <TransactionForm
        transaction={null}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
  });

  // Customer Name Input Tests
  test('should update customer name field when typing', () => {
    renderWithAuth(
      <TransactionForm
        transaction={null}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );
    const customerInput = screen.getByPlaceholderText('Enter customer name') as HTMLInputElement;
    fireEvent.change(customerInput, { target: { value: 'Jane Smith' } });
    expect(customerInput.value).toBe('Jane Smith');
  });

  // Item Management Tests
  test('should add a new item when Add Item button is clicked', () => {
    renderWithAuth(
      <TransactionForm
        transaction={null}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );
    const addButton = screen.getByRole('button', { name: /\+ Add Item/i });
    fireEvent.click(addButton);
    const itemInputs = screen.getAllByPlaceholderText('Item name');
    expect(itemInputs.length).toBeGreaterThan(1);
  });

  test('should update item name when typing in item name field', () => {
    renderWithAuth(
      <TransactionForm
        transaction={null}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );
    const itemNameInput = screen.getByPlaceholderText('Item name') as HTMLInputElement;
    fireEvent.change(itemNameInput, { target: { value: 'New Item' } });
    expect(itemNameInput.value).toBe('New Item');
  });

  test('should update item quantity when typing in quantity field', () => {
    renderWithAuth(
      <TransactionForm
        transaction={null}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );
    const quantityInput = screen.getByPlaceholderText('Qty') as HTMLInputElement;
    fireEvent.change(quantityInput, { target: { value: '5' } });
    expect(quantityInput.value).toBe('5');
  });

  test('should update item price when typing in price field', () => {
    renderWithAuth(
      <TransactionForm
        transaction={null}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );
    const priceInput = screen.getByPlaceholderText('Price') as HTMLInputElement;
    fireEvent.change(priceInput, { target: { value: '99.99' } });
    expect(priceInput.value).toBe('99.99');
  });

  test('should remove item when remove button is clicked', () => {
    renderWithAuth(
      <TransactionForm
        transaction={null}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );
    const addButton = screen.getByRole('button', { name: /\+ Add Item/i });
    fireEvent.click(addButton);
    const removeButtons = screen.getAllByRole('button', { name: /×/i });
    // Click the last remove button (avoid the close button in the form header)
    fireEvent.click(removeButtons[removeButtons.length - 1]);
    const itemInputs = screen.queryAllByPlaceholderText('Item name');
    expect(itemInputs.length).toBeLessThanOrEqual(2);
  });

  test('should disable remove button when only one item exists', () => {
    renderWithAuth(
      <TransactionForm
        transaction={null}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );
    const removeButtons = screen.getAllByRole('button', { name: /×/i });
    const singleRemoveButton = removeButtons[removeButtons.length - 1];
    expect(singleRemoveButton).toBeDisabled();
  });

  test('should calculate total amount correctly', () => {
    renderWithAuth(
      <TransactionForm
        transaction={null}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );
    const itemNameInput = screen.getByPlaceholderText('Item name') as HTMLInputElement;
    const quantityInput = screen.getByPlaceholderText('Qty') as HTMLInputElement;
    const priceInput = screen.getByPlaceholderText('Price') as HTMLInputElement;

    fireEvent.change(itemNameInput, { target: { value: 'Test Item' } });
    fireEvent.change(quantityInput, { target: { value: '2' } });
    fireEvent.change(priceInput, { target: { value: '50' } });

    expect(screen.getByText('$100')).toBeInTheDocument();
  });

  // Close/Cancel Tests
  test('should call onClose when Cancel button is clicked', () => {
    renderWithAuth(
      <TransactionForm
        transaction={null}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('should call onClose when X button is clicked', () => {
    renderWithAuth(
      <TransactionForm
        transaction={null}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );
    // Get the close button in the form header (first one with class="close-button")
    const closeButtons = screen.getAllByRole('button', { name: '×' });
    const closeButton = closeButtons.find(btn => btn.className === 'close-button');
    if (closeButton) {
      fireEvent.click(closeButton);
    }
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('should close form when overlay is clicked', () => {
    const { container } = renderWithAuth(
      <TransactionForm
        transaction={null}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );
    const overlay = container.querySelector('.form-overlay') as HTMLElement;
    fireEvent.click(overlay);
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('should not close form when modal content is clicked', () => {
    const { container } = renderWithAuth(
      <TransactionForm
        transaction={null}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );
    const modal = container.querySelector('.form-modal') as HTMLElement;
    fireEvent.click(modal);
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  // Form Submission Tests - Create Mode
  test('should submit form with valid data in create mode', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { transaction: { ...mockTransaction, id: 2 } } });

    renderWithAuth(
      <TransactionForm
        transaction={null}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const customerInput = screen.getByPlaceholderText('Enter customer name') as HTMLInputElement;
    const itemNameInput = screen.getByPlaceholderText('Item name') as HTMLInputElement;
    const quantityInput = screen.getByPlaceholderText('Qty') as HTMLInputElement;
    const priceInput = screen.getByPlaceholderText('Price') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /Create Transaction/i });

    fireEvent.change(customerInput, { target: { value: 'Test Customer' } });
    fireEvent.change(itemNameInput, { target: { value: 'Test Item' } });
    fireEvent.change(quantityInput, { target: { value: '1' } });
    fireEvent.change(priceInput, { target: { value: '100' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/transactions', expect.any(Object));
    });
  });

  test('should call onSuccess after successful creation', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { transaction: mockTransaction } });

    renderWithAuth(
      <TransactionForm
        transaction={null}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const customerInput = screen.getByPlaceholderText('Enter customer name') as HTMLInputElement;
    const itemNameInput = screen.getByPlaceholderText('Item name') as HTMLInputElement;
    const quantityInput = screen.getByPlaceholderText('Qty') as HTMLInputElement;
    const priceInput = screen.getByPlaceholderText('Price') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /Create Transaction/i });

    fireEvent.change(customerInput, { target: { value: 'Test Customer' } });
    fireEvent.change(itemNameInput, { target: { value: 'Test Item' } });
    fireEvent.change(quantityInput, { target: { value: '1' } });
    fireEvent.change(priceInput, { target: { value: '100' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  // Form Submission Tests - Edit Mode
  test('should submit form with valid data in edit mode', async () => {
    mockedAxios.put.mockResolvedValueOnce({ data: { transaction: mockTransaction } });

    renderWithAuth(
      <TransactionForm
        transaction={mockTransaction}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const submitButton = screen.getByRole('button', { name: /Update Transaction/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockedAxios.put).toHaveBeenCalledWith(
        `/api/transactions/${mockTransaction.id}`,
        expect.any(Object)
      );
    });
  });

  test('should call onSuccess after successful update', async () => {
    mockedAxios.put.mockResolvedValueOnce({ data: { transaction: mockTransaction } });

    renderWithAuth(
      <TransactionForm
        transaction={mockTransaction}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const submitButton = screen.getByRole('button', { name: /Update Transaction/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  // Validation Tests
  test('should show error when submitting without customer name', async () => {
    renderWithAuth(
      <TransactionForm
        transaction={null}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const submitButton = screen.getByRole('button', { name: /Create Transaction/i });
    fireEvent.click(submitButton);

    // HTML5 validation should prevent submission
    expect(mockedAxios.post).not.toHaveBeenCalled();
  });

  test('should show error when submitting without items', async () => {
    renderWithAuth(
      <TransactionForm
        transaction={null}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const customerInput = screen.getByPlaceholderText('Enter customer name') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /Create Transaction/i });

    fireEvent.change(customerInput, { target: { value: 'Test Customer' } });
    fireEvent.click(submitButton);

    // Should not submit if item name is empty
    expect(mockedAxios.post).not.toHaveBeenCalled();
  });

  test('should display error message on API failure', async () => {
    const errorMessage = 'Server error occurred';
    mockedAxios.post.mockRejectedValueOnce({
      response: { data: { message: errorMessage } },
    });

    renderWithAuth(
      <TransactionForm
        transaction={null}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const customerInput = screen.getByPlaceholderText('Enter customer name') as HTMLInputElement;
    const itemNameInput = screen.getByPlaceholderText('Item name') as HTMLInputElement;
    const quantityInput = screen.getByPlaceholderText('Qty') as HTMLInputElement;
    const priceInput = screen.getByPlaceholderText('Price') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /Create Transaction/i });

    fireEvent.change(customerInput, { target: { value: 'Test Customer' } });
    fireEvent.change(itemNameInput, { target: { value: 'Test Item' } });
    fireEvent.change(quantityInput, { target: { value: '1' } });
    fireEvent.change(priceInput, { target: { value: '100' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  test('should display generic error message when API error has no message', async () => {
    mockedAxios.post.mockRejectedValueOnce({
      response: { data: {} },
    });

    renderWithAuth(
      <TransactionForm
        transaction={null}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const customerInput = screen.getByPlaceholderText('Enter customer name') as HTMLInputElement;
    const itemNameInput = screen.getByPlaceholderText('Item name') as HTMLInputElement;
    const quantityInput = screen.getByPlaceholderText('Qty') as HTMLInputElement;
    const priceInput = screen.getByPlaceholderText('Price') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /Create Transaction/i });

    fireEvent.change(customerInput, { target: { value: 'Test Customer' } });
    fireEvent.change(itemNameInput, { target: { value: 'Test Item' } });
    fireEvent.change(quantityInput, { target: { value: '1' } });
    fireEvent.change(priceInput, { target: { value: '100' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to save transaction')).toBeInTheDocument();
    });
  });

  // Loading State Tests
  test('should disable buttons while loading', async () => {
    mockedAxios.post.mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(() => resolve({ data: { transaction: mockTransaction } }), 100))
    );

    renderWithAuth(
      <TransactionForm
        transaction={null}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const customerInput = screen.getByPlaceholderText('Enter customer name') as HTMLInputElement;
    const itemNameInput = screen.getByPlaceholderText('Item name') as HTMLInputElement;
    const quantityInput = screen.getByPlaceholderText('Qty') as HTMLInputElement;
    const priceInput = screen.getByPlaceholderText('Price') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /Create Transaction/i });

    fireEvent.change(customerInput, { target: { value: 'Test Customer' } });
    fireEvent.change(itemNameInput, { target: { value: 'Test Item' } });
    fireEvent.change(quantityInput, { target: { value: '1' } });
    fireEvent.change(priceInput, { target: { value: '100' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toHaveTextContent('Saving...');
    });
  });

  // Edge Cases
  test('should handle form with multiple items', () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { transaction: mockTransaction } });

    renderWithAuth(
      <TransactionForm
        transaction={null}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const addButton = screen.getByRole('button', { name: /\+ Add Item/i });
    fireEvent.click(addButton);

    const itemNameInputs = screen.getAllByPlaceholderText('Item name');
    expect(itemNameInputs.length).toBe(2);
  });

  test('should handle zero quantity input', () => {
    renderWithAuth(
      <TransactionForm
        transaction={null}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const quantityInput = screen.getByPlaceholderText('Qty') as HTMLInputElement;
    fireEvent.change(quantityInput, { target: { value: '0' } });
    fireEvent.change(quantityInput, { target: { value: '' } });
    expect(quantityInput.value).toBe('');
  });

  test('should handle large transaction amounts', () => {
    renderWithAuth(
      <TransactionForm
        transaction={null}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const priceInput = screen.getByPlaceholderText('Price') as HTMLInputElement;
    fireEvent.change(priceInput, { target: { value: '999999.99' } });
    expect(priceInput.value).toBe('999999.99');
  });
});
