import React from 'react';
import { useAuth } from '../context/AuthContext';
import RepairManagement from '../components/RepairManagement/RepairManagement';
import './Repairs.css';

const Repairs: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="repairs-page">
      <div className="page-header">
        <h1>Repair Management</h1>
        <p className="welcome-text">Track repair items, costs, and charges</p>
      </div>
      <RepairManagement />
    </div>
  );
};

export default Repairs;




