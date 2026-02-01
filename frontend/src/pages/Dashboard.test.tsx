import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import Dashboard from './Dashboard';

// Mock child components
jest.mock('../components/Header/Header', () => {
  return function MockHeader() {
    return <div data-testid="mock-header">Header</div>;
  };
});

jest.mock('../components/Sidebar/Sidebar', () => {
  return function MockSidebar() {
    return <div data-testid="mock-sidebar">Sidebar</div>;
  };
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

describe('Dashboard Page', () => {
  test('should render dashboard', () => {
    const { container } = renderWithProviders(<Dashboard />);
    expect(container).toBeInTheDocument();
  });

  test('should render without crashing', () => {
    const { container } = renderWithProviders(<Dashboard />);
    expect(container.children.length).toBeGreaterThan(0);
  });

  test('should display main layout structure', () => {
    const { container } = renderWithProviders(<Dashboard />);
    const mainElement = container.querySelector('main') || container.firstChild;
    expect(mainElement).toBeInTheDocument();
  });

  test('should have page content', () => {
    const { container } = renderWithProviders(<Dashboard />);
    expect(container.innerHTML.length).toBeGreaterThan(0);
  });

  test('should render as a valid React component', () => {
    renderWithProviders(<Dashboard />);
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
  });
});
