import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from '../components/Header/Header';
import Sidebar from '../components/Sidebar/Sidebar';
import Transactions from './Transactions';
import Repairs from './Repairs';
import Suppliers from './Suppliers';
import Users from './Users';
import featureConfig from '../config/features.json';
import './Dashboard.css';

type FeatureConfig = Record<string, boolean>;
const features = featureConfig as FeatureConfig;

const getDefaultDashboardPath = (): string => {
  if (features.transactions !== false) return '/dashboard/transactions';
  if (features.repairs !== false) return '/dashboard/repairs';
  if (features.suppliers !== false) return '/dashboard/suppliers';
  if (features.users !== false) return '/dashboard/users';
  // Fallback to transactions route even if disabled, to avoid broken navigation
  return '/dashboard/transactions';
};

const Dashboard: React.FC = () => {
  const defaultPath = React.useMemo(() => getDefaultDashboardPath(), []);

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="dashboard-wrapper">
        <Header />
        <main className="dashboard-main">
          <Routes>
            {features.transactions !== false && (
              <Route path="/transactions" element={<Transactions />} />
            )}
            {features.repairs !== false && (
              <Route path="/repairs" element={<Repairs />} />
            )}
            {features.suppliers !== false && (
              <Route path="/suppliers" element={<Suppliers />} />
            )}
            {features.users !== false && (
              <Route path="/users" element={<Users />} />
            )}
            <Route path="/" element={<Navigate to={defaultPath} replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

