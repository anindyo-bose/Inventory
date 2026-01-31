import React from 'react';
import { Transaction } from './TransactionManagement';
import TransactionCard from './TransactionCard';
import './TransactionList.css';

interface TransactionListProps {
  transactions: Transaction[];
  loading: boolean;
  onEdit?: (transaction: Transaction) => void;
  onStatusUpdate?: (id: number, sellingDone?: boolean, paymentDone?: boolean) => void;
  onDelete?: (id: number) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  loading,
  onEdit,
  onStatusUpdate,
  onDelete,
}) => {
  if (loading) {
    return (
      <div className="transaction-list-loading">
        <div className="loading-spinner">Loading transactions...</div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="transaction-list-empty">
        <p>No transactions found. Create your first transaction to get started.</p>
      </div>
    );
  }

  return (
    <div className="transaction-list">
      <div className="transaction-list-header">
        <h2>Transactions</h2>
        <span className="transaction-count">{transactions.length} total</span>
      </div>
      <div className="transaction-grid">
        {transactions.map((transaction) => (
          <TransactionCard
            key={transaction.id}
            transaction={transaction}
            onEdit={onEdit}
            onStatusUpdate={onStatusUpdate}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default TransactionList;



