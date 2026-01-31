import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import SupplierList from './SupplierList';
import SupplierForm from './SupplierForm';
import SupplierBills from './SupplierBills';
import SupplierPayments from './SupplierPayments';
import SupplierDues from './SupplierDues';
import './SupplierManagement.css';

export interface Supplier {
  id: number;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
  createdBy: string;
}

export interface Bill {
  id: number;
  supplierId: number;
  billNumber: string;
  amount: number;
  billDate: string;
  dueDate: string;
  billImage: string | null;
  description: string;
  createdAt: string;
  createdBy: string;
}

export interface Payment {
  id: number;
  supplierId: number;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  referenceNumber: string;
  notes: string;
  createdAt: string;
  createdBy: string;
}

const SupplierManagement: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [activeTab, setActiveTab] = useState<'suppliers' | 'bills' | 'payments' | 'dues'>('suppliers');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/suppliers');
      setSuppliers(response.data.suppliers || []);
      setError('');
    } catch (err: any) {
      console.error('Error fetching suppliers:', err);
      setError('Failed to fetch suppliers');
      setSuppliers([]); // Ensure suppliers is always an array
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSupplier = () => {
    setEditingSupplier(null);
    setShowSupplierForm(true);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setShowSupplierForm(true);
  };

  const handleFormClose = () => {
    setShowSupplierForm(false);
    setEditingSupplier(null);
  };

  const handleFormSuccess = () => {
    fetchSuppliers();
    handleFormClose();
  };

  const handleSelectSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    if (activeTab === 'suppliers') {
      setActiveTab('bills');
    }
  };

  return (
    <div className="supplier-management">
      {error && <div className="error-banner">{error}</div>}

      <div className="supplier-tabs">
        <button
          className={`tab-button ${activeTab === 'suppliers' ? 'active' : ''}`}
          onClick={() => setActiveTab('suppliers')}
        >
          Suppliers
        </button>
        {selectedSupplier && (
          <>
            <button
              className={`tab-button ${activeTab === 'bills' ? 'active' : ''}`}
              onClick={() => setActiveTab('bills')}
            >
              Bills & Dues
            </button>
            <button
              className={`tab-button ${activeTab === 'payments' ? 'active' : ''}`}
              onClick={() => setActiveTab('payments')}
            >
              Payments
            </button>
          </>
        )}
        {isAdmin && (
          <button
            className={`tab-button ${activeTab === 'dues' ? 'active' : ''}`}
            onClick={() => setActiveTab('dues')}
          >
            All Dues (Admin)
          </button>
        )}
      </div>

      {activeTab === 'suppliers' && (
        <div>
          {isAdmin && (
            <div className="supplier-actions">
              <button onClick={handleCreateSupplier} className="create-button">
                + New Supplier
              </button>
            </div>
          )}
          <SupplierList
            suppliers={suppliers}
            loading={loading}
            onSelect={handleSelectSupplier}
            onEdit={isAdmin ? handleEditSupplier : undefined}
            onDelete={isAdmin ? async (id) => {
              if (window.confirm('Are you sure you want to delete this supplier?')) {
                try {
                  await axios.delete(`/api/suppliers/${id}`);
                  fetchSuppliers();
                  if (selectedSupplier?.id === id) {
                    setSelectedSupplier(null);
                  }
                } catch (err) {
                  setError('Failed to delete supplier');
                }
              }
            } : undefined}
          />
        </div>
      )}

      {activeTab === 'bills' && selectedSupplier && (
        <SupplierBills supplier={selectedSupplier} />
      )}

      {activeTab === 'payments' && selectedSupplier && (
        <SupplierPayments supplier={selectedSupplier} />
      )}

      {activeTab === 'dues' && isAdmin && (
        <SupplierDues />
      )}

      {showSupplierForm && (
        <SupplierForm
          supplier={editingSupplier}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
};

export default SupplierManagement;

