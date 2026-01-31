import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import featureConfig from './config/features.json';
import './App.css';

type FeatureConfig = Record<string, boolean>;
const features = featureConfig as FeatureConfig;

const getDefaultRootPath = (): string => {
  if (features.transactions !== false) return '/dashboard/transactions';
  if (features.repairs !== false) return '/dashboard/repairs';
  if (features.suppliers !== false) return '/dashboard/suppliers';
  if (features.users !== false) return '/dashboard/users';
  return '/dashboard/transactions';
};

function App() {
  const defaultRootPath = React.useMemo(() => getDefaultRootPath(), []);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard/*"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to={defaultRootPath} replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

