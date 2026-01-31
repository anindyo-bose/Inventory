import React from 'react';
import { useAuth } from '../context/AuthContext';
import TransactionManagement from '../components/TransactionManagement/TransactionManagement';
import './Transactions.css';

const Transactions: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="transactions-page">
      <div className="page-header">
        <h1>Transaction Management</h1>
        <p className="welcome-text">Welcome, {user?.name} ({user?.role?.replace('_', ' ')})</p>
      </div>
      <TransactionManagement />
    </div>
  );
};

export default Transactions;




