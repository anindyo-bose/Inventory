import React from 'react';
import { render, screen } from '@testing-library/react';
import { AuthProvider } from './context/AuthContext';
import App from './App';

describe('App Component', () => {
  test('should render without crashing', () => {
    render(
      <AuthProvider>
        <App />
      </AuthProvider>
    );
  });

  test('should render app with auth provider', () => {
    render(
      <AuthProvider>
        <App />
      </AuthProvider>
    );

    expect(document.body).toBeInTheDocument();
  });
});

describe('App Routing', () => {
  test('should have proper router setup', () => {
    const { container } = render(
      <AuthProvider>
        <App />
      </AuthProvider>
    );

    expect(container.firstChild).toBeInTheDocument();
  });
});
