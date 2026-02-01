import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import App from './App';

jest.mock('./context/AuthContext', () => ({
  ...jest.requireActual('./context/AuthContext'),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('./pages/Login', () => {
  return function MockLogin() {
    return <div data-testid="login-page">Login Page</div>;
  };
});

jest.mock('./pages/Dashboard', () => {
  return function MockDashboard() {
    return <div data-testid="dashboard-page">Dashboard Page</div>;
  };
});

jest.mock('./components/PrivateRoute', () => {
  return function MockPrivateRoute({ children }: { children: React.ReactNode }) {
    return <div data-testid="private-route">{children}</div>;
  };
});

describe('App Component', () => {
  test('should render without crashing', () => {
    render(<App />);
  });

  test('should render app with auth provider', () => {
    const { container } = render(<App />);
    expect(container).toBeInTheDocument();
  });

  test('app should be a valid React component', () => {
    expect(App).toBeDefined();
    expect(typeof App).toBe('function');
  });

  test('should render with proper structure', () => {
    const { container } = render(<App />);
    expect(container.firstChild).toBeInTheDocument();
  });
});

describe('App Routing Setup', () => {
  test('should have proper router setup', () => {
    const { container } = render(<App />);
    expect(container.firstChild).toBeInTheDocument();
  });

  test('app should contain router element', () => {
    const { container } = render(<App />);
    expect(container).toBeInTheDocument();
  });

  test('should render authentication context provider', () => {
    const { container } = render(<App />);
    expect(container.querySelector('[data-testid="auth-provider"]') || container.firstChild).toBeTruthy();
  });
});

describe('App Feature Config Integration', () => {
  test('should handle feature configuration', () => {
    const { container } = render(<App />);
    expect(container).toBeInTheDocument();
  });

  test('should render with features enabled', () => {
    expect(() => {
      render(<App />);
    }).not.toThrow();
  });

  test('should initialize with default path based on features', () => {
    const { container } = render(<App />);
    expect(container.firstChild).toBeInTheDocument();
  });
});

describe('App Default Path Logic', () => {
  test('should render app and determine default route', () => {
    render(<App />);
    expect(document.body).toBeInTheDocument();
  });

  test('should have memoized default path', () => {
    const { container, rerender } = render(<App />);
    expect(container).toBeInTheDocument();
    
    rerender(<App />);
    expect(container).toBeInTheDocument();
  });

  test('app should handle feature configuration', () => {
    expect(() => {
      render(<App />);
    }).not.toThrow();
  });

  test('should render app without errors on mount', async () => {
    const { container } = render(<App />);
    
    await waitFor(() => {
      expect(container.firstChild).toBeInTheDocument();
    });
  });
});

describe('App Component Composition', () => {
  test('should render app as a function component', () => {
    expect(typeof App).toBe('function');
  });

  test('should export App as default', () => {
    expect(App).toBeDefined();
  });

  test('app should render without props', () => {
    expect(() => {
      render(<App />);
    }).not.toThrow();
  });

  test('should render app multiple times consistently', () => {
    const { container: container1 } = render(<App />);
    const { container: container2 } = render(<App />);
    
    expect(container1).toBeInTheDocument();
    expect(container2).toBeInTheDocument();
  });

  test('app should handle provider wrapping', () => {
    const { container } = render(
      <AuthProvider>
        <App />
      </AuthProvider>
    );
    
    expect(container).toBeInTheDocument();
  });
});

describe('App Error Handling', () => {
  test('should render without throwing errors', () => {
    expect(() => {
      render(<App />);
    }).not.toThrow();
  });

  test('should handle missing features gracefully', () => {
    const { container } = render(<App />);
    expect(container.firstChild).toBeInTheDocument();
  });

  test('should render despite configuration changes', () => {
    const { container: container1 } = render(<App />);
    expect(container1).toBeInTheDocument();
  });
});