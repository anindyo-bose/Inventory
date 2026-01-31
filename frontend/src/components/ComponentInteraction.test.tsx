import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Mock Login component
interface MockLoginFormProps {
  onSubmit: (data: { email: string; password: string }) => Promise<void>;
  isLoading: boolean;
}

const MockLoginForm = ({ onSubmit, isLoading }: MockLoginFormProps) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Email and password required');
      return;
    }
    try {
      await onSubmit({ email, password });
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setEmail(e.target.value);
          setError('');
        }}
        placeholder="Email"
        data-testid="email-input"
      />
      <input
        type="password"
        value={password}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setPassword(e.target.value);
          setError('');
        }}
        placeholder="Password"
        data-testid="password-input"
      />
      {error && <div data-testid="error-message">{error}</div>}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Login'}
      </button>
    </form>
  );
};

// Mock Header component with role-based visibility
interface User {
  username: string;
  role: string;
}

interface MockHeaderProps {
  user: User | null;
}

const MockHeader = ({ user }: MockHeaderProps) => {
  return (
    <header>
      <h1>Inventory System</h1>
      {user ? (
        <>
          <span data-testid="user-display">{user.username}</span>
          <span data-testid="role-display">{user.role}</span>
          {user.role === 'admin' && (
            <button data-testid="admin-button">Admin Panel</button>
          )}
        </>
      ) : (
        <span data-testid="guest-display">Guest</span>
      )}
    </header>
  );
};

// Mock list component
interface ListItem {
  id: number;
  name: string;
}

interface MockListProps {
  items: ListItem[];
  onDelete: (id: number) => void;
  onEdit: (item: ListItem) => void;
}

const MockList = ({ items, onDelete, onEdit }: MockListProps) => {
  return (
    <div>
      <div data-testid="item-count">{items.length}</div>
      {items.map((item) => (
        <div key={item.id} data-testid={`item-${item.id}`}>
          <span>{item.name}</span>
          <button onClick={() => onEdit(item)}>Edit</button>
          <button onClick={() => onDelete(item.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
};

describe('Frontend Component Interactions', () => {
  describe('Login Form Interactions', () => {
    describe('Positive Scenarios', () => {
      test('should enable submit button when form is filled', async () => {
        const mockSubmit = jest.fn();
        render(<MockLoginForm onSubmit={mockSubmit} isLoading={false} />);

        const emailInput = screen.getByTestId('email-input');
        const passwordInput = screen.getByTestId('password-input');
        const submitButton = screen.getByRole('button', { name: /login/i });

        await userEvent.type(emailInput, 'user@example.com');
        await userEvent.type(passwordInput, 'password123');

        expect(submitButton).not.toBeDisabled();
      });

      test('should call onSubmit with form data', async () => {
        const mockSubmit = jest.fn();
        render(<MockLoginForm onSubmit={mockSubmit} isLoading={false} />);

        await userEvent.type(screen.getByTestId('email-input'), 'user@example.com');
        await userEvent.type(screen.getByTestId('password-input'), 'password123');
        await userEvent.click(screen.getByRole('button', { name: /login/i }));

        expect(mockSubmit).toHaveBeenCalledWith({
          email: 'user@example.com',
          password: 'password123'
        });
      });

      test('should clear error when user starts typing', async () => {
        const mockSubmit = jest.fn(() => Promise.reject(new Error('Invalid')));
        render(<MockLoginForm onSubmit={mockSubmit} isLoading={false} />);

        // Trigger error
        await userEvent.click(screen.getByRole('button', { name: /login/i }));
        expect(screen.getByTestId('error-message')).toBeInTheDocument();

        // Clear error by typing
        await userEvent.type(screen.getByTestId('email-input'), 'test@example.com');
        expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
      });
    });

    describe('Negative Scenarios', () => {
      test('should show error when email is empty', async () => {
        const mockSubmit = jest.fn();
        render(<MockLoginForm onSubmit={mockSubmit} isLoading={false} />);

        await userEvent.type(screen.getByTestId('password-input'), 'password123');
        await userEvent.click(screen.getByRole('button', { name: /login/i }));

        expect(screen.getByTestId('error-message')).toHaveTextContent('Email and password required');
      });

      test('should show error when password is empty', async () => {
        const mockSubmit = jest.fn();
        render(<MockLoginForm onSubmit={mockSubmit} isLoading={false} />);

        await userEvent.type(screen.getByTestId('email-input'), 'user@example.com');
        await userEvent.click(screen.getByRole('button', { name: /login/i }));

        expect(screen.getByTestId('error-message')).toHaveTextContent('Email and password required');
      });

      test('should disable submit button when loading', () => {
        const mockSubmit = jest.fn();
        render(<MockLoginForm onSubmit={mockSubmit} isLoading={true} />);

        const submitButton = screen.getByRole('button');
        expect(submitButton).toBeDisabled();
      });

      test('should display loading text when loading', () => {
        const mockSubmit = jest.fn();
        render(<MockLoginForm onSubmit={mockSubmit} isLoading={true} />);

        expect(screen.getByRole('button')).toHaveTextContent('Loading...');
      });
    });
  });

  describe('Header Role-Based Visibility', () => {
    describe('Positive Scenarios', () => {
      test('should display user info when logged in', () => {
        const user = { username: 'testuser', role: 'user' };
        render(<MockHeader user={user} />);

        expect(screen.getByTestId('user-display')).toHaveTextContent('testuser');
        expect(screen.getByTestId('role-display')).toHaveTextContent('user');
      });

      test('should show admin button for admin users', () => {
        const user = { username: 'admin', role: 'admin' };
        render(<MockHeader user={user} />);

        expect(screen.getByTestId('admin-button')).toBeInTheDocument();
      });

      test('should display guest when not logged in', () => {
        render(<MockHeader user={null} />);

        expect(screen.getByTestId('guest-display')).toHaveTextContent('Guest');
      });
    });

    describe('Negative Scenarios', () => {
      test('should not show admin button for regular users', () => {
        const user = { username: 'user', role: 'user' };
        render(<MockHeader user={user} />);

        expect(screen.queryByTestId('admin-button')).not.toBeInTheDocument();
      });

      test('should not show user info when logged out', () => {
        render(<MockHeader user={null} />);

        expect(screen.queryByTestId('user-display')).not.toBeInTheDocument();
        expect(screen.queryByTestId('role-display')).not.toBeInTheDocument();
      });
    });
  });

  describe('List Component Interactions', () => {
    describe('Positive Scenarios', () => {
      test('should display all items', () => {
        const items = [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' },
          { id: 3, name: 'Item 3' }
        ];
        const mockDelete = jest.fn();
        const mockEdit = jest.fn();

        render(<MockList items={items} onDelete={mockDelete} onEdit={mockEdit} />);

        expect(screen.getByTestId('item-count')).toHaveTextContent('3');
        expect(screen.getByTestId('item-1')).toBeInTheDocument();
        expect(screen.getByTestId('item-2')).toBeInTheDocument();
        expect(screen.getByTestId('item-3')).toBeInTheDocument();
      });

      test('should call onEdit when edit button is clicked', async () => {
        const items = [{ id: 1, name: 'Item 1' }];
        const mockDelete = jest.fn();
        const mockEdit = jest.fn();

        render(<MockList items={items} onDelete={mockDelete} onEdit={mockEdit} />);

        const editButton = screen.getAllByRole('button')[0]; // Edit is first button
        await userEvent.click(editButton);

        expect(mockEdit).toHaveBeenCalledWith(items[0]);
      });

      test('should call onDelete when delete button is clicked', async () => {
        const items = [{ id: 1, name: 'Item 1' }];
        const mockDelete = jest.fn();
        const mockEdit = jest.fn();

        render(<MockList items={items} onDelete={mockDelete} onEdit={mockEdit} />);

        const deleteButton = screen.getAllByRole('button')[1]; // Delete is second button
        await userEvent.click(deleteButton);

        expect(mockDelete).toHaveBeenCalledWith(1);
      });
    });

    describe('Negative Scenarios', () => {
      test('should show zero count for empty list', () => {
        const mockDelete = jest.fn();
        const mockEdit = jest.fn();

        render(<MockList items={[]} onDelete={mockDelete} onEdit={mockEdit} />);

        expect(screen.getByTestId('item-count')).toHaveTextContent('0');
      });

      test('should not show items when list is empty', () => {
        const mockDelete = jest.fn();
        const mockEdit = jest.fn();

        render(<MockList items={[]} onDelete={mockDelete} onEdit={mockEdit} />);

        expect(screen.queryByTestId(/item-\d+/)).not.toBeInTheDocument();
      });

      test('should handle multiple deletes correctly', async () => {
        const items = [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' }
        ];
        const mockDelete = jest.fn();
        const mockEdit = jest.fn();

        const { rerender } = render(
          <MockList items={items} onDelete={mockDelete} onEdit={mockEdit} />
        );

        // Delete first item
        const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
        await userEvent.click(deleteButtons[0]);

        expect(mockDelete).toHaveBeenCalledWith(1);

        // Rerender with remaining items
        rerender(
          <MockList
            items={[{ id: 2, name: 'Item 2' }]}
            onDelete={mockDelete}
            onEdit={mockEdit}
          />
        );

        expect(screen.getByTestId('item-count')).toHaveTextContent('1');
      });
    });
  });

  describe('Form Submission Edge Cases', () => {
    test('should handle rapid form submissions', async () => {
      const mockSubmit = jest.fn();
      render(<MockLoginForm onSubmit={mockSubmit} isLoading={false} />);

      await userEvent.type(screen.getByTestId('email-input'), 'user@example.com');
      await userEvent.type(screen.getByTestId('password-input'), 'password123');

      const button = screen.getByRole('button');
      // Simulate rapid clicks by calling click twice
      await userEvent.click(button);
      await userEvent.click(button);

      // Both clicks result in calls since the form doesn't debounce
      expect(mockSubmit.mock.calls.length).toBeGreaterThanOrEqual(1);
    });

    test('should handle special characters in input', async () => {
      const mockSubmit = jest.fn();
      render(<MockLoginForm onSubmit={mockSubmit} isLoading={false} />);

      await userEvent.type(screen.getByTestId('email-input'), 'user+test@example.com');
      await userEvent.type(screen.getByTestId('password-input'), 'P@ssw0rd!#$');
      await userEvent.click(screen.getByRole('button', { name: /login/i }));

      expect(mockSubmit).toHaveBeenCalledWith({
        email: 'user+test@example.com',
        password: 'P@ssw0rd!#$'
      });
    });

    test('should handle very long input', async () => {
      const mockSubmit = jest.fn();
      render(<MockLoginForm onSubmit={mockSubmit} isLoading={false} />);

      const longEmail = 'a'.repeat(100) + '@example.com';
      const longPassword = 'p'.repeat(200);

      await userEvent.type(screen.getByTestId('email-input'), longEmail);
      await userEvent.type(screen.getByTestId('password-input'), longPassword);
      await userEvent.click(screen.getByRole('button', { name: /login/i }));

      expect(mockSubmit).toHaveBeenCalledWith({
        email: longEmail,
        password: longPassword
      });
    });
  });
});
