import React from 'react';
import { Transaction } from './TransactionManagement';
import { formatCurrency } from '../../utils/currency';
import './TransactionCard.css';

interface TransactionCardProps {
  transaction: Transaction;
  onEdit?: (transaction: Transaction) => void;
  onStatusUpdate?: (id: number, sellingDone?: boolean, paymentDone?: boolean) => void;
  onDelete?: (id: number) => void;
}

const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  onEdit,
  onStatusUpdate,
  onDelete,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="transaction-card">
      <div className="transaction-card-header">
        <div>
          <h3 className="transaction-id">{transaction.transactionId}</h3>
          <p className="transaction-customer">{transaction.customerName}</p>
        </div>
        {(onEdit || onDelete) && (
          <div className="transaction-actions">
            {onEdit && (
              <button
                onClick={() => onEdit(transaction)}
                className="action-button edit-button"
                title="Edit"
              >
                ✏️
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(transaction.id)}
                className="action-button delete-button"
                title="Delete"
              >
                🗑️
              </button>
            )}
          </div>
        )}
      </div>

      <div className="transaction-items">
        <h4>Items:</h4>
        <ul>
          {transaction.items.map((item, index) => (
            <li key={index}>
              <span className="item-name">{item.name}</span>
              <span className="item-details">
                {item.quantity} × ${item.price.toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="transaction-footer">
        <div className="transaction-total">
          <span>Total:</span>
          <span className="total-amount">{formatCurrency(transaction.totalAmount)}</span>
        </div>
        <div className="transaction-status">
          <label className="status-checkbox">
            <input
              type="checkbox"
              checked={transaction.sellingDone}
              onChange={(e) =>
                onStatusUpdate && onStatusUpdate(transaction.id, e.target.checked, undefined)
              }
              disabled={!onStatusUpdate}
            />
            <span>Selling Done</span>
          </label>
          <label className="status-checkbox">
            <input
              type="checkbox"
              checked={transaction.paymentDone}
              onChange={(e) =>
                onStatusUpdate && onStatusUpdate(transaction.id, undefined, e.target.checked)
              }
              disabled={!onStatusUpdate}
            />
            <span>Payment Done</span>
          </label>
        </div>
        <div className="transaction-date">
          {formatDate(transaction.date)}
        </div>
      </div>
    </div>
  );
};

export default TransactionCard;

