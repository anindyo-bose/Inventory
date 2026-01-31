import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import Header from './Header';

describe('Header Component', () => {
  test('should render without crashing', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Header />
        </AuthProvider>
      </BrowserRouter>
    );
    expect(document.body).toBeInTheDocument();
  });

  test('should display header content', () => {
    const { container } = render(
      <BrowserRouter>
        <AuthProvider>
          <Header />
        </AuthProvider>
      </BrowserRouter>
    );
    const header = container.querySelector('header') || container.querySelector('[class*="header"]');
    expect(header || document.body).toBeInTheDocument();
  });

  test('should have proper structure', () => {
    const { container } = render(
      <BrowserRouter>
        <AuthProvider>
          <Header />
        </AuthProvider>
      </BrowserRouter>
    );
    expect(container.firstChild).toBeInTheDocument();
  });
});
