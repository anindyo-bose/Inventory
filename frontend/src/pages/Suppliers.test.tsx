import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import Suppliers from './Suppliers';

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

describe('Suppliers Page', () => {
  test('should render suppliers page', () => {
    renderWithProviders(<Suppliers />);
    expect(screen.getByText('Suppliers')).toBeInTheDocument();
  });

  test('should display page heading', () => {
    renderWithProviders(<Suppliers />);
    const headings = screen.getAllByRole('heading');
    expect(headings.length).toBeGreaterThan(0);
  });

  test('should render without crashing', () => {
    const { container } = renderWithProviders(<Suppliers />);
    expect(container).toBeInTheDocument();
  });

  test('should have main content area', () => {
    const { container } = renderWithProviders(<Suppliers />);
    const mainElement = container.querySelector('main') || container.firstChild;
    expect(mainElement).toBeInTheDocument();
  });

  test('should render supplier management component', () => {
    const { container } = renderWithProviders(<Suppliers />);
    expect(container.children.length).toBeGreaterThan(0);
  });
});
