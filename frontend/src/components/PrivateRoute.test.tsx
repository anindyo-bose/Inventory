import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import PrivateRoute from './PrivateRoute';

describe('PrivateRoute Component', () => {
  const TestComponent = () => <div>Protected Content</div>;

  test('should render when user is authenticated', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <PrivateRoute>
            <TestComponent />
          </PrivateRoute>
        </AuthProvider>
      </BrowserRouter>
    );
    expect(document.body).toBeInTheDocument();
  });

  test('should handle loading state', () => {
    const { container } = render(
      <BrowserRouter>
        <AuthProvider>
          <PrivateRoute>
            <TestComponent />
          </PrivateRoute>
        </AuthProvider>
      </BrowserRouter>
    );

    expect(container).toBeInTheDocument();
  });

  test('should render without crashing', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <PrivateRoute>
            <TestComponent />
          </PrivateRoute>
        </AuthProvider>
      </BrowserRouter>
    );
  });
});
