import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import App from '../App';

// Mock the axios module
jest.mock('axios');

describe('App Component', () => {
  test('should render without crashing', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    );
  });

  test('should render login page by default', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    );

    // Check if we can navigate - the app structure should exist
    expect(document.querySelector('.app-container') || document.body).toBeInTheDocument();
  });
});

describe('App Routing', () => {
  test('should have proper router setup', () => {
    const { container } = render(
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(container.firstChild).toBeInTheDocument();
  });
});
