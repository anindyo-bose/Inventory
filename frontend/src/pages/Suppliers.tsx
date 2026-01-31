import React from 'react';
import SupplierManagement from '../components/SupplierManagement/SupplierManagement';
import './Suppliers.css';

const Suppliers: React.FC = () => {
  return (
    <div className="suppliers-page">
      <div className="page-header">
        <h1>Supplier Management</h1>
        <p className="welcome-text">Manage suppliers, bills, and payments</p>
      </div>
      <SupplierManagement />
    </div>
  );
};

export default Suppliers;




