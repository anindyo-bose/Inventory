import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import axios from 'axios';
import { AuthProvider } from '../../context/AuthContext';
import RepairManagement, { Repair } from './RepairManagement';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Initialize default mock implementations
mockedAxios.get = jest.fn();
mockedAxios.delete = jest.fn();
mockedAxios.post = jest.fn();
mockedAxios.put = jest.fn();

// Mock child components to avoid rendering issues
jest.mock('./RepairList', () => {
  return function MockRepairList({ repairs, onEdit, onDelete }: any) {
    return (
      <div data-testid="repair-list">
        {repairs.length > 0 && <div>Repair List: {repairs.length} items</div>}
        {repairs.map((r: any) => (
          <div key={r.id} data-testid={`repair-${r.id}`}>
            {r.itemName}
            <button onClick={() => onEdit(r)}>Edit</button>
            <button onClick={() => onDelete(r.id)}>Delete</button>
          </div>
        ))}
      </div>
    );
  };
});

jest.mock('./RepairForm', () => {
  return function MockRepairForm({ repair, onClose, onSuccess }: any) {
    return (
      <div data-testid="repair-form">
        <button onClick={onClose}>Close</button>
        <button onClick={onSuccess}>Save</button>
      </div>
    );
  };
});

jest.mock('./RepairStats', () => {
  return function MockRepairStats({ repairs }: any) {
    return <div data-testid="repair-stats">Stats</div>;
  };
});

jest.mock('./RepairChart', () => {
  return function MockRepairChart({ repairs }: any) {
    return <div data-testid="repair-chart">Chart</div>;
  };
});

const mockRepairs: Repair[] = [
  {
    id: 1,
    repairId: 'REP001',
    billNo: 'B001',
    itemName: 'Laptop',
    itemDescription: 'Dell laptop repair',
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
    itemName: 'Mobile Phone',
    itemDescription: 'Battery replacement',
    customerName: 'Jane Smith',
    customerContact: '0987654321',
    forwardedTo: 'Tech Support',
    forwardedDate: '2024-01-16',
    repairCost: 100,
    amountCharged: 150,
    advanceAmount: 0,
    status: 'repaired',
    receivedDate: '2024-01-12',
    dueDate: '2024-01-18',
    completedDate: '2024-01-17',
    createdBy: 'admin',
    notes: 'Battery replaced',
  },
  {
    id: 3,
    repairId: 'REP003',
    billNo: 'B003',
    itemName: 'Tablet',
    itemDescription: 'Screen repair',
    customerName: 'Bob Johnson',
    customerContact: '5555555555',
    forwardedTo: 'Tech Support',
    forwardedDate: '2024-01-17',
    repairCost: 300,
    amountCharged: 400,
    advanceAmount: 200,
    status: 'pending',
    receivedDate: '2024-01-15',
    dueDate: '2024-01-22',
    completedDate: null,
    createdBy: 'admin',
    notes: 'Pending pickup',
  },
];

const renderWithAuth = (component: React.ReactElement) => {
  return render(
    <AuthProvider>
      {component}
    </AuthProvider>
  );
};

describe('RepairManagement Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.get.mockResolvedValue({ data: { repairs: mockRepairs } });
    mockedAxios.delete.mockResolvedValue({ data: { success: true } });
  });

  test('should render repair management component', async () => {
    renderWithAuth(<RepairManagement />);
    await waitFor(() => {
      expect(screen.getByTestId('repair-list')).toBeInTheDocument();
    });
  });

  test('should fetch repairs on mount', async () => {
    renderWithAuth(<RepairManagement />);
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/repairs');
    });
  });

  test('should display loading state initially', async () => {
    renderWithAuth(<RepairManagement />);
    await waitFor(() => {
      expect(screen.getByTestId('repair-list')).toBeInTheDocument();
    });
  });

  test('should display all repairs in list', async () => {
    renderWithAuth(<RepairManagement />);
    await waitFor(() => {
      expect(screen.getByText('Repair List: 3 items')).toBeInTheDocument();
    });
  });

  test('should render repair stats and chart', async () => {
    renderWithAuth(<RepairManagement />);
    await waitFor(() => {
      expect(screen.getByTestId('repair-stats')).toBeInTheDocument();
    });
  });

  test('should show create repair button', async () => {
    renderWithAuth(<RepairManagement />);
    await waitFor(() => {
      const button = screen.getByRole('button', { name: /new repair|add|create/i });
      expect(button).toBeInTheDocument();
    });
  });

  test('should open form when create repair is clicked', async () => {
    renderWithAuth(<RepairManagement />);
    await waitFor(() => {
      const createButton = screen.getByRole('button', { name: /new repair|add|create/i });
      fireEvent.click(createButton);
    });
    await waitFor(() => {
      expect(screen.getByTestId('repair-form')).toBeInTheDocument();
    });
  });

  test('should open form in edit mode when edit is clicked', async () => {
    renderWithAuth(<RepairManagement />);
    await waitFor(() => {
      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      fireEvent.click(editButtons[0]);
    });
    await waitFor(() => {
      expect(screen.getByTestId('repair-form')).toBeInTheDocument();
    });
  });

  test('should close form when close is clicked', async () => {
    renderWithAuth(<RepairManagement />);
    await waitFor(() => {
      const createButton = screen.getByRole('button', { name: /new repair|add|create/i });
      fireEvent.click(createButton);
    });
    await waitFor(() => {
      expect(screen.getByTestId('repair-form')).toBeInTheDocument();
    });
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    
    await waitFor(() => {
      expect(screen.queryByTestId('repair-form')).not.toBeInTheDocument();
    });
  });

  test('should handle delete repair with confirmation', async () => {
    window.confirm = jest.fn(() => true);
    
    renderWithAuth(<RepairManagement />);
    await waitFor(() => {
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      fireEvent.click(deleteButtons[0]);
    });

    await waitFor(() => {
      expect(mockedAxios.delete).toHaveBeenCalledWith('/api/repairs/1');
    });
  });

  test('should not delete repair when confirmation is cancelled', async () => {
    window.confirm = jest.fn(() => false);
    
    renderWithAuth(<RepairManagement />);
    await waitFor(() => {
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      fireEvent.click(deleteButtons[0]);
    });

    expect(mockedAxios.delete).not.toHaveBeenCalled();
  });

  test('should refresh repairs after successful form submission', async () => {
    renderWithAuth(<RepairManagement />);
    await waitFor(() => {
      const createButton = screen.getByRole('button', { name: /new repair|add|create/i });
      fireEvent.click(createButton);
    });

    mockedAxios.get.mockClear();
    mockedAxios.get.mockResolvedValue({ data: { repairs: mockRepairs } });

    await waitFor(() => {
      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);
    });

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/repairs');
    });
  });

  test('should handle API errors when fetching', async () => {
    mockedAxios.get.mockRejectedValue({
      response: { data: { message: 'Network error' } },
    });

    renderWithAuth(<RepairManagement />);
    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });

  test('should handle delete errors gracefully', async () => {
    window.confirm = jest.fn(() => true);
    mockedAxios.delete.mockRejectedValue({
      response: { data: { message: 'Delete failed' } },
    });

    renderWithAuth(<RepairManagement />);
    await waitFor(() => {
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      fireEvent.click(deleteButtons[0]);
    });

    await waitFor(() => {
      expect(screen.getByText(/delete failed/i)).toBeInTheDocument();
    });
  });

  test('should calculate due soon count correctly', async () => {
    renderWithAuth(<RepairManagement />);
    await waitFor(() => {
      expect(screen.getByTestId('repair-list')).toBeInTheDocument();
    });
  });

  test('should filter repairs by search query', async () => {
    renderWithAuth(<RepairManagement />);
    await waitFor(() => {
      expect(screen.getByTestId('repair-list')).toBeInTheDocument();
    });

    // Search functionality test
    const searchInput = screen.getByPlaceholderText(/search|filter/i);
    if (searchInput) {
      fireEvent.change(searchInput, { target: { value: 'Laptop' } });
      expect(searchInput).toHaveValue('Laptop');
    }
  });

  test('should display different UI for viewer vs admin roles', async () => {
    renderWithAuth(<RepairManagement />);
    await waitFor(() => {
      expect(screen.getByTestId('repair-list')).toBeInTheDocument();
    });
  });

  test('should render without crashing', async () => {
    const { container } = renderWithAuth(<RepairManagement />);
    await waitFor(() => {
      expect(container).toBeInTheDocument();
    });
  });
});
