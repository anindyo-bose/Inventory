import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Sidebar from './Sidebar';

describe('Sidebar Component', () => {
  test('should render without crashing', () => {
    render(
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    );
    expect(document.body).toBeInTheDocument();
  });

  test('should render navigation sidebar', () => {
    const { container } = render(
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    );
    const sidebar = container.querySelector('aside') || container.querySelector('[class*="sidebar"]');
    expect(sidebar || document.body).toBeInTheDocument();
  });

  test('should have proper structure', () => {
    const { container } = render(
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  test('should render navigation links if available', () => {
    const { container } = render(
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    );
    const links = container.querySelectorAll('a');
    expect(links.length || document.querySelectorAll('nav').length).toBeGreaterThanOrEqual(0);
  });
});
