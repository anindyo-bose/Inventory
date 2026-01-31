import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import TransactionList from './TransactionList';
import TransactionForm from './TransactionForm';
import TransactionStats from './TransactionStats';
import './TransactionManagement.css';

export interface TransactionItem {
  name: string;
  quantity: number;
  price: number;
}

export interface Transaction {
  id: number;
  transactionId: string;
  customerName: string;
  items: TransactionItem[];
  totalAmount: number;
  sellingDone: boolean;
  paymentDone: boolean;
  date: string;
  createdBy: string;
}

const TransactionManagement: React.FC = () => {
  const { user } = useAuth();
  const isViewer = user?.role === 'viewer';
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/transactions');
      setTransactions(response.data.transactions);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTransaction = () => {
    setEditingTransaction(null);
    setShowForm(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingTransaction(null);
  };

  const handleFormSuccess = () => {
    fetchTransactions();
    handleFormClose();
  };

  const handleStatusUpdate = async (id: number, sellingDone?: boolean, paymentDone?: boolean) => {
    try {
      await axios.patch(`/api/transactions/${id}/status`, {
        sellingDone,
        paymentDone,
      });
      fetchTransactions();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update transaction status');
    }
  };

  const handleDeleteTransaction = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await axios.delete(`/api/transactions/${id}`);
        fetchTransactions();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete transaction');
      }
    }
  };

  return (
    <div className="transaction-management">
      {error && <div className="error-banner">{error}</div>}
      
      <TransactionStats transactions={transactions} />
      
      {!isViewer && (
        <div className="transaction-actions">
          <button onClick={handleCreateTransaction} className="create-button">
            + New Transaction
          </button>
        </div>
      )}

      {showForm && (
        <TransactionForm
          transaction={editingTransaction}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}

      <TransactionList
        transactions={transactions}
        loading={loading}
        onEdit={isViewer ? undefined : handleEditTransaction}
        onStatusUpdate={isViewer ? undefined : handleStatusUpdate}
        onDelete={isViewer ? undefined : handleDeleteTransaction}
      />
    </div>
  );
};

export default TransactionManagement;



