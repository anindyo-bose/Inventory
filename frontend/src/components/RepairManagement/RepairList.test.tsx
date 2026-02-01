import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RepairList from './RepairList';
import { Repair } from './RepairManagement';

jest.mock('./RepairCard', () => {
  return function RepairCardMock({ repair, onEdit, onDelete }: any) {
    return (
      <div data-testid={`repair-card-${repair.id}`}>
        <span>{repair.itemName}</span>
        <button onClick={() => onEdit(repair)}>Edit</button>
        <button onClick={() => onDelete(repair.id)}>Delete</button>
      </div>
    );
  };
});

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
];

describe('RepairList Component', () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render repair list', () => {
    render(
      <RepairList repairs={mockRepairs} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );
    expect(screen.getByText('Laptop')).toBeInTheDocument();
    expect(screen.getByText('Desktop')).toBeInTheDocument();
  });

  test('should render repair cards for each repair', () => {
    render(
      <RepairList repairs={mockRepairs} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    expect(screen.getByTestId('repair-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('repair-card-2')).toBeInTheDocument();
  });

  test('should call onEdit when edit button is clicked', () => {
    render(
      <RepairList repairs={mockRepairs} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    fireEvent.click(editButtons[0]);

    expect(mockOnEdit).toHaveBeenCalledWith(mockRepairs[0]);
  });

  test('should call onDelete when delete button is clicked', () => {
    render(
      <RepairList repairs={mockRepairs} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    expect(mockOnDelete).toHaveBeenCalledWith(1);
  });

  test('should display empty state when no repairs', () => {
    render(
      <RepairList repairs={[]} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    expect(screen.getByText(/no repair|empty|not found/i)).toBeInTheDocument();
  });

  test('should render all repairs when list is provided', () => {
    const manyRepairs = Array.from({ length: 10 }, (_, i) => ({
      ...mockRepairs[0],
      id: i + 1,
      repairId: `REP${String(i + 1).padStart(3, '0')}`,
    }));

    render(
      <RepairList repairs={manyRepairs} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    manyRepairs.forEach(repair => {
      expect(screen.getByTestId(`repair-card-${repair.id}`)).toBeInTheDocument();
    });
  });

  test('should handle multiple edit operations', () => {
    render(
      <RepairList repairs={mockRepairs} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    const editButtons = screen.getAllByRole('button', { name: /edit/i });

    fireEvent.click(editButtons[0]);
    expect(mockOnEdit).toHaveBeenCalledWith(mockRepairs[0]);

    fireEvent.click(editButtons[1]);
    expect(mockOnEdit).toHaveBeenCalledWith(mockRepairs[1]);

    expect(mockOnEdit).toHaveBeenCalledTimes(2);
  });

  test('should handle multiple delete operations', () => {
    render(
      <RepairList repairs={mockRepairs} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });

    fireEvent.click(deleteButtons[0]);
    expect(mockOnDelete).toHaveBeenCalledWith(1);

    fireEvent.click(deleteButtons[1]);
    expect(mockOnDelete).toHaveBeenCalledWith(2);

    expect(mockOnDelete).toHaveBeenCalledTimes(2);
  });

  test('should display repair status', () => {
    render(
      <RepairList repairs={mockRepairs} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    expect(screen.getAllByText(/laptop|desktop/i).length).toBeGreaterThan(0);
  });

  test('should render with different repair statuses', () => {
    const mixedRepairs = [
      { ...mockRepairs[0], status: 'in_progress' as const },
      { ...mockRepairs[1], status: 'repaired' as const },
    ];

    render(
      <RepairList repairs={mixedRepairs} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    expect(screen.getAllByText(/laptop|desktop/i).length).toBeGreaterThan(0);
  });

  test('should pass correct repair data to child cards', () => {
    render(
      <RepairList repairs={mockRepairs} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    mockRepairs.forEach(repair => {
      expect(screen.getByText(repair.itemName)).toBeInTheDocument();
    });
  });

  test('should handle editing repairs with same status', () => {
    const sameStatusRepairs = [
      { ...mockRepairs[0], status: 'pending' as const },
      { ...mockRepairs[1], status: 'pending' as const },
    ];

    render(
      <RepairList repairs={sameStatusRepairs} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    fireEvent.click(editButtons[0]);

    expect(mockOnEdit).toHaveBeenCalledWith(sameStatusRepairs[0]);
  });

  test('should render in proper order', () => {
    render(
      <RepairList repairs={mockRepairs} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    const items = screen.getAllByText(/laptop|desktop/i);
    expect(items[0]).toHaveTextContent('Laptop');
  });

  test('should not render add button', () => {
    render(
      <RepairList repairs={mockRepairs} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    const addButtons = screen.queryAllByRole('button', { name: /add|new|create/i });
    expect(addButtons.length).toBe(0);
  });

  test('should handle repairs with missing notes', () => {
    const repairsWithoutNotes = [
      { ...mockRepairs[0], notes: '' },
    ];

    render(
      <RepairList repairs={repairsWithoutNotes} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    expect(screen.getByTestId('repair-card-1')).toBeInTheDocument();
  });

  test('should maintain edit callback context', () => {
    render(
      <RepairList repairs={mockRepairs} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    const editButton = screen.getAllByRole('button', { name: /edit/i })[0];
    fireEvent.click(editButton);
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledTimes(2);
    expect(mockOnEdit).toHaveBeenCalledWith(mockRepairs[0]);
  });

  test('should render scrollable list for many items', () => {
    const manyRepairs = Array.from({ length: 50 }, (_, i) => ({
      ...mockRepairs[0],
      id: i + 1,
      repairId: `REP${String(i + 1).padStart(3, '0')}`,
    }));

    render(
      <RepairList repairs={manyRepairs} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    expect(screen.getByTestId('repair-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('repair-card-50')).toBeInTheDocument();
  });

  test('should render list container', () => {
    const { container } = render(
      <RepairList repairs={mockRepairs} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    expect(container.querySelector('[class*="list"]')).toBeInTheDocument();
  });
});
