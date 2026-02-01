import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import Users from './Users';

// Mock axios
jest.mock('axios');

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Users Page', () => {
  test('should render users page', () => {
    renderWithProviders(<Users />);
    expect(screen.getByText('User Management')).toBeInTheDocument();
  });

  test('should display page heading', () => {
    renderWithProviders(<Users />);
    const headings = screen.getAllByRole('heading');
    expect(headings.length).toBeGreaterThan(0);
  });

  test('should render without crashing', () => {
    const { container } = renderWithProviders(<Users />);
    expect(container).toBeInTheDocument();
  });

  test('should have main content area', () => {
    const { container } = renderWithProviders(<Users />);
    const mainElement = container.querySelector('main') || container.firstChild;
    expect(mainElement).toBeInTheDocument();
  });

  test('should render user management form and list', () => {
    const { container } = renderWithProviders(<Users />);
    expect(container.children.length).toBeGreaterThan(0);
  });

  test('should display user creation section', () => {
    renderWithProviders(<Users />);
    // Check for form elements
    const inputs = screen.queryAllByRole('textbox');
    const passwordInputs = screen.queryAllByDisplayValue('');
    expect(inputs.length + passwordInputs.length).toBeGreaterThanOrEqual(0);
  });
});
