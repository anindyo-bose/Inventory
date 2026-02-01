import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import TransactionManagement from './TransactionManagement';
import { AuthProvider } from '../../context/AuthContext';
import { Transaction } from './TransactionManagement';

jest.mock('axios');
import axios from 'axios';

// Initialize default mock implementations
const mockedAxios = axios as jest.Mocked<typeof axios>;
mockedAxios.get = jest.fn();
mockedAxios.post = jest.fn();
mockedAxios.put = jest.fn();
mockedAxios.patch = jest.fn();
mockedAxios.delete = jest.fn();

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
    paymentDone: true,
    date: '2024-01-16',
    createdBy: 'admin',
  },
];

// Mock user context
const mockAdminUser = { id: 1, username: 'admin', role: 'admin' };
const mockViewerUser = { id: 2, username: 'viewer', role: 'viewer' };

describe('TransactionManagement Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.get.mockResolvedValue({ data: { transactions: mockTransactions } });
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <AuthProvider>
        {component}
      </AuthProvider>
    );
  };

  // Existence and Type Tests
  test('TransactionManagement component exists and is valid', () => {
    expect(TransactionManagement).toBeDefined();
  });

  test('should render without crashing', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { transactions: mockTransactions },
    });

    renderWithProviders(<TransactionManagement />);

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/transactions');
    });
  });

  // Initial Load Tests
  test('should fetch transactions on mount', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { transactions: mockTransactions },
    });

    renderWithProviders(<TransactionManagement />);

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/transactions');
    });
  });

  test('should display transactions after loading', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { transactions: mockTransactions },
    });

    renderWithProviders(<TransactionManagement />);

    await waitFor(() => {
      expect(screen.getByText(mockTransactions[0].customerName)).toBeInTheDocument();
    });
  });

  test('should handle API error on initial load', async () => {
    const errorMessage = 'Failed to fetch transactions';
    mockedAxios.get.mockRejectedValueOnce({
      response: { data: { message: errorMessage } },
    });

    renderWithProviders(<TransactionManagement />);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  test('should display generic error message when API error has no message', async () => {
    mockedAxios.get.mockRejectedValueOnce({
      response: { data: {} },
    });

    renderWithProviders(<TransactionManagement />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch transactions')).toBeInTheDocument();
    });
  });

  // Create Transaction Tests
  test('should display New Transaction button for admin users', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { transactions: [] },
    });

    renderWithProviders(<TransactionManagement />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /\+ New Transaction/i })).toBeInTheDocument();
    });
  });

  test('should show form when New Transaction button is clicked', async () => {
    const user = userEvent.setup();
    mockedAxios.get.mockResolvedValueOnce({
      data: { transactions: [] },
    });

    renderWithProviders(<TransactionManagement />);

    const newButton = await screen.findByRole('button', { name: /\+ New Transaction/i });
    await user.click(newButton);

    await waitFor(() => {
      expect(screen.getByText('New Transaction')).toBeInTheDocument();
    });
  });

  // Edit Transaction Tests
  test('should open form with transaction data when edit is called', async () => {
    const user = userEvent.setup();
    mockedAxios.get.mockResolvedValueOnce({
      data: { transactions: mockTransactions },
    });

    renderWithProviders(<TransactionManagement />);

    await waitFor(() => {
      const editButtons = screen.getAllByTitle('Edit');
      expect(editButtons.length).toBeGreaterThan(0);
    });

    const editButtons = screen.getAllByTitle('Edit');
    await user.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Edit Transaction')).toBeInTheDocument();
    });
  });

  // Delete Transaction Tests
  test('should delete transaction when delete button is clicked', async () => {
    const user = userEvent.setup();
    mockedAxios.get
      .mockResolvedValueOnce({ data: { transactions: mockTransactions } })
      .mockResolvedValueOnce({ data: { transactions: mockTransactions.slice(1) } });
    mockedAxios.delete.mockResolvedValueOnce({ data: { success: true } });

    renderWithProviders(<TransactionManagement />);

    await waitFor(() => {
      const deleteButtons = screen.getAllByTitle('Delete');
      expect(deleteButtons.length).toBeGreaterThan(0);
    });

    const deleteButtons = screen.getAllByTitle('Delete');
    window.confirm = jest.fn(() => true);
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockedAxios.delete).toHaveBeenCalledWith(`/api/transactions/${mockTransactions[0].id}`);
    });
  });

  test('should not delete transaction if user cancels confirmation', async () => {
    const user = userEvent.setup();
    mockedAxios.get.mockResolvedValueOnce({
      data: { transactions: mockTransactions },
    });

    renderWithProviders(<TransactionManagement />);

    await waitFor(() => {
      const deleteButtons = screen.getAllByTitle('Delete');
      expect(deleteButtons.length).toBeGreaterThan(0);
    });

    const deleteButtons = screen.getAllByTitle('Delete');
    window.confirm = jest.fn(() => false);
    await user.click(deleteButtons[0]);

    expect(mockedAxios.delete).not.toHaveBeenCalled();
  });

  test('should display error when delete fails', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Failed to delete transaction';
    mockedAxios.get.mockResolvedValueOnce({
      data: { transactions: mockTransactions },
    });
    mockedAxios.delete.mockRejectedValueOnce({
      response: { data: { message: errorMessage } },
    });

    renderWithProviders(<TransactionManagement />);

    await waitFor(() => {
      const deleteButtons = screen.getAllByTitle('Delete');
      expect(deleteButtons.length).toBeGreaterThan(0);
    });

    window.confirm = jest.fn(() => true);
    const deleteButtons = screen.getAllByTitle('Delete');
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  // Status Update Tests
  test('should update transaction status when checkbox is toggled', async () => {
    const user = userEvent.setup();
    mockedAxios.get.mockResolvedValueOnce({
      data: { transactions: mockTransactions },
    });
    mockedAxios.patch.mockResolvedValueOnce({ data: { success: true } });
    mockedAxios.get.mockResolvedValueOnce({
      data: { transactions: mockTransactions },
    });

    renderWithProviders(<TransactionManagement />);

    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
    });

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]);

    await waitFor(() => {
      expect(mockedAxios.patch).toHaveBeenCalled();
    });
  });

  test('should call correct API endpoint for status update', async () => {
    const user = userEvent.setup();
    mockedAxios.get.mockResolvedValueOnce({
      data: { transactions: mockTransactions },
    });
    mockedAxios.patch.mockResolvedValueOnce({ data: { success: true } });
    mockedAxios.get.mockResolvedValueOnce({
      data: { transactions: mockTransactions },
    });

    renderWithProviders(<TransactionManagement />);

    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
    });

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]);

    await waitFor(() => {
      expect(mockedAxios.patch).toHaveBeenCalledWith(
        `/api/transactions/${mockTransactions[0].id}/status`,
        expect.any(Object)
      );
    });
  });

  test('should display error when status update fails', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Failed to update transaction status';
    mockedAxios.get.mockResolvedValueOnce({
      data: { transactions: mockTransactions },
    });
    mockedAxios.patch.mockRejectedValueOnce({
      response: { data: { message: errorMessage } },
    });

    renderWithProviders(<TransactionManagement />);

    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
    });

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  // Form Lifecycle Tests
  test('should close form after successful creation', async () => {
    const user = userEvent.setup();
    mockedAxios.get
      .mockResolvedValueOnce({ data: { transactions: [] } })
      .mockResolvedValueOnce({ data: { transactions: mockTransactions } });
    mockedAxios.post.mockResolvedValueOnce({ data: { transaction: mockTransactions[0] } });

    renderWithProviders(<TransactionManagement />);

    const newButton = await screen.findByRole('button', { name: /\+ New Transaction/i });
    await user.click(newButton);

    await waitFor(() => {
      expect(screen.getByText('New Transaction')).toBeInTheDocument();
    });

    const customerInput = screen.getByPlaceholderText('Enter customer name');
    const itemNameInput = screen.getByPlaceholderText('Item name');
    const quantityInput = screen.getByPlaceholderText('Qty');
    const priceInput = screen.getByPlaceholderText('Price');
    const submitButton = screen.getByRole('button', { name: /Create Transaction/i });

    await user.type(customerInput, 'Test Customer');
    await user.type(itemNameInput, 'Test Item');
    await user.type(quantityInput, '1');
    await user.type(priceInput, '100');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.queryByText('New Transaction')).not.toBeInTheDocument();
    });
  });

  test('should refresh transaction list after creation', async () => {
    const user = userEvent.setup();
    mockedAxios.get
      .mockResolvedValueOnce({ data: { transactions: [] } })
      .mockResolvedValueOnce({ data: { transactions: mockTransactions } });
    mockedAxios.post.mockResolvedValueOnce({ data: { transaction: mockTransactions[0] } });

    renderWithProviders(<TransactionManagement />);

    const newButton = await screen.findByRole('button', { name: /\+ New Transaction/i });
    await user.click(newButton);

    const customerInput = await screen.findByPlaceholderText('Enter customer name');
    const itemNameInput = screen.getByPlaceholderText('Item name');
    const quantityInput = screen.getByPlaceholderText('Qty');
    const priceInput = screen.getByPlaceholderText('Price');
    const submitButton = screen.getByRole('button', { name: /Create Transaction/i });

    await user.type(customerInput, 'Test Customer');
    await user.type(itemNameInput, 'Test Item');
    await user.type(quantityInput, '1');
    await user.type(priceInput, '100');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    });
  });

  // Component Structure Tests
  test('should render TransactionStats component', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { transactions: mockTransactions },
    });

    const { container } = renderWithProviders(<TransactionManagement />);

    await waitFor(() => {
      const stats = container.querySelector('.stats-container');
      expect(stats).toBeInTheDocument();
    });
  });

  test('should render TransactionList component', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { transactions: mockTransactions },
    });

    const { container } = renderWithProviders(<TransactionManagement />);

    await waitFor(() => {
      const list = container.querySelector('.transaction-list');
      expect(list).toBeInTheDocument();
    });
  });

  test('should render transaction management container', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { transactions: mockTransactions },
    });

    const { container } = renderWithProviders(<TransactionManagement />);

    await waitFor(() => {
      const management = container.querySelector('.transaction-management');
      expect(management).toBeInTheDocument();
    });
  });

  // Error Banner Tests
  test('should display error banner when error occurs', async () => {
    mockedAxios.get.mockRejectedValueOnce({
      response: { data: { message: 'Test error' } },
    });

    const { container } = renderWithProviders(<TransactionManagement />);

    await waitFor(() => {
      const errorBanner = container.querySelector('.error-banner');
      expect(errorBanner).toBeInTheDocument();
    });
  });

  test('should clear error when transactions are successfully fetched', async () => {
    mockedAxios.get
      .mockRejectedValueOnce({
        response: { data: { message: 'Test error' } },
      })
      .mockResolvedValueOnce({
        data: { transactions: mockTransactions },
      });

    const { container, rerender } = renderWithProviders(<TransactionManagement />);

    await waitFor(() => {
      expect(screen.getByText('Test error')).toBeInTheDocument();
    });

    // Simulate refetch
    rerender(<TransactionManagement />);

    await waitFor(() => {
      expect(screen.queryByText('Test error')).not.toBeInTheDocument();
    });
  });

  // Empty State Tests
  test('should display empty state message when no transactions', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { transactions: [] },
    });

    renderWithProviders(<TransactionManagement />);

    await waitFor(() => {
      expect(screen.getByText(/No transactions found/i)).toBeInTheDocument();
    });
  });

  // Stats Display Tests
  test('should pass transactions to TransactionStats', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { transactions: mockTransactions },
    });

    const { container } = renderWithProviders(<TransactionManagement />);

    await waitFor(() => {
      const stats = container.querySelector('.stats-container');
      expect(stats).toBeInTheDocument();
    });
  });

  // Loading State Tests
  test('should show loading state initially', () => {
    mockedAxios.get.mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(() => resolve({ data: { transactions: mockTransactions } }), 100))
    );

    renderWithProviders(<TransactionManagement />);

    expect(screen.getByText('Loading transactions...')).toBeInTheDocument();
  });

  // Refetch Tests
  test('should refetch transactions after status update', async () => {
    const user = userEvent.setup();
    mockedAxios.get
      .mockResolvedValueOnce({ data: { transactions: mockTransactions } })
      .mockResolvedValueOnce({ data: { transactions: mockTransactions } });
    mockedAxios.patch.mockResolvedValueOnce({ data: { success: true } });

    renderWithProviders(<TransactionManagement />);

    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
    });

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]);

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    });
  });

  test('should refetch transactions after deletion', async () => {
    const user = userEvent.setup();
    mockedAxios.get
      .mockResolvedValueOnce({ data: { transactions: mockTransactions } })
      .mockResolvedValueOnce({ data: { transactions: mockTransactions.slice(1) } });
    mockedAxios.delete.mockResolvedValueOnce({ data: { success: true } });

    renderWithProviders(<TransactionManagement />);

    await waitFor(() => {
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      expect(deleteButtons.length).toBeGreaterThan(0);
    });

    window.confirm = jest.fn(() => true);
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    });
  });

  // Edge Cases
  test('should handle very large transaction lists', async () => {
    const manyTransactions = Array.from({ length: 50 }, (_, i) => ({
      ...mockTransactions[0],
      id: i,
      transactionId: `TRX${String(i).padStart(3, '0')}`,
    }));
    mockedAxios.get.mockResolvedValueOnce({
      data: { transactions: manyTransactions },
    });

    renderWithProviders(<TransactionManagement />);

    await waitFor(() => {
      expect(screen.getByText(manyTransactions[0].customerName)).toBeInTheDocument();
    });
  });

  test('should handle rapid API responses', async () => {
    mockedAxios.get
      .mockResolvedValueOnce({ data: { transactions: mockTransactions.slice(0, 1) } })
      .mockResolvedValueOnce({ data: { transactions: mockTransactions } });

    const { rerender } = renderWithProviders(<TransactionManagement />);

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalled();
    });

    rerender(<TransactionManagement />);

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    });
  });
});
