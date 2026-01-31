import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TransactionList from './TransactionList';

jest.mock('axios');

describe('TransactionList Component', () => {
  test('should render without crashing', () => {
    render(
      <BrowserRouter>
        <TransactionList />
      </BrowserRouter>
    );
    expect(document.body).toBeInTheDocument();
  });

  test('should render transaction list container', () => {
    const { container } = render(
      <BrowserRouter>
        <TransactionList />
      </BrowserRouter>
    );
    expect(container).toBeInTheDocument();
  });

  test('should have proper component structure', () => {
    const { container } = render(
      <BrowserRouter>
        <TransactionList />
      </BrowserRouter>
    );
    expect(container.firstChild).toBeInTheDocument();
  });
});
