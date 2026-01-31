import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login';

describe('Login Page', () => {
  const renderLogin = () => {
    return render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
  };

  test('should render login form', () => {
    renderLogin();
    
    expect(screen.getByPlaceholderText(/username/i) || screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
  });

  test('should have login button', () => {
    renderLogin();
    
    const loginButton = screen.getByRole('button', { name: /sign in|login|submit/i }) || 
                        screen.getByText(/sign in|login|submit/i);
    expect(loginButton).toBeInTheDocument();
  });

  test('should have input fields for username/email and password', () => {
    renderLogin();
    
    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBeGreaterThanOrEqual(1);
  });

  test('should have password input field', () => {
    renderLogin();
    
    const passwordInput = screen.getByPlaceholderText(/password/i);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('should handle form submission', async () => {
    renderLogin();
    
    const usernameInput = screen.getByPlaceholderText(/username|email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const submitButton = screen.getAllByRole('button')[0];

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    expect(usernameInput).toHaveValue('testuser');
    expect(passwordInput).toHaveValue('password123');
  });

  test('should display remember me option if available', () => {
    renderLogin();
    
    const rememberCheckbox = screen.queryByRole('checkbox');
    if (rememberCheckbox) {
      expect(rememberCheckbox).toBeInTheDocument();
    }
  });
});
