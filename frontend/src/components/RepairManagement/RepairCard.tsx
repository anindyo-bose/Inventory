import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Repair } from './RepairManagement';
import { formatCurrency } from '../../utils/currency';
import './RepairCard.css';

interface RepairCardProps {
  repair: Repair;
  onEdit?: (repair: Repair) => void;
  onDelete?: (id: number) => void;
}

const RepairCard: React.FC<RepairCardProps> = ({
  repair,
  onEdit,
  onDelete,
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isDueSoon = (dueDateString: string) => {
    if (!dueDateString) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const twoDaysLater = new Date(today);
    twoDaysLater.setDate(today.getDate() + 2);
    twoDaysLater.setHours(23, 59, 59, 999);
    const dueDate = new Date(dueDateString);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate >= today && dueDate <= twoDaysLater;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return '#38a169';
      case 'repaired':
        return '#3182ce';
      case 'in_progress':
        return '#d69e2e';
      case 'pending':
        return '#805ad5';
      case 'cancelled':
        return '#e53e3e';
      default:
        return '#718096';
    }
  };

  const profit = repair.amountCharged - repair.repairCost;

  return (
    <div className="repair-card">
      <div className="repair-card-header">
        <div>
          <h3 className="repair-id">{repair.repairId}</h3>
          <p className="repair-item">{repair.itemName}</p>
        </div>
        {repair.billNo && (
          <div className="repair-bill">
            <span className="bill-label">Bill:</span>
            <span className="bill-value">{repair.billNo}</span>
          </div>
        )}
        {onEdit || onDelete ? (
          <div className="repair-actions">
            {onEdit && (
              <button
                onClick={() => onEdit(repair)}
                className="action-button edit-button"
                title="Edit"
              >
                ✏️
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(repair.id)}
                className="action-button delete-button"
                title="Delete"
              >
                🗑️
              </button>
            )}
          </div>
        ) : null}
      </div>

      <div className="repair-details">
        <div className="detail-row">
          <span className="detail-label">Customer:</span>
          <span className="detail-value">{repair.customerName}</span>
        </div>
        {repair.customerContact && (
          <div className="detail-row">
            <span className="detail-label">Contact:</span>
            <span className="detail-value">
              {(repair.status === 'repaired' || repair.status === 'delivered') ? (
                <a href={`tel:${repair.customerContact}`} className="call-link">
                  {repair.customerContact} (Call)
                </a>
              ) : (
                repair.customerContact
              )}
            </span>
          </div>
        )}
        <div className="detail-row">
          <span className="detail-label">Forwarded To:</span>
          <span className="detail-value">{repair.forwardedTo}</span>
        </div>
        {repair.itemDescription && (
          <div className="detail-row">
            <span className="detail-label">Description:</span>
            <span className="detail-value">{repair.itemDescription}</span>
          </div>
        )}
      </div>

      {isAdmin && (
        <div className="repair-financials">
          <div className="financial-row">
            <span>Repair Cost:</span>
            <span className="repair-cost">{formatCurrency(repair.repairCost)}</span>
          </div>
          <div className="financial-row">
            <span>Amount Charged:</span>
            <span className="amount-charged">{formatCurrency(repair.amountCharged)}</span>
          </div>
          <div className="financial-row profit-row">
            <span>Profit:</span>
            <span className={`profit ${profit >= 0 ? 'positive' : 'negative'}`}>
              {formatCurrency(profit)}
            </span>
          </div>
        </div>
      )}

      <div className="repair-footer">
        <div className="repair-status">
          <span
            className="status-badge"
            style={{ backgroundColor: getStatusColor(repair.status) + '20', color: getStatusColor(repair.status) }}
          >
            {repair.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>
        <div className="repair-dates">
          <div className="date-info">
            <span className="date-label">Received:</span>
            <span>{formatDate(repair.receivedDate)}</span>
          </div>
          {repair.dueDate && (
            <div className="date-info">
              <span className="date-label">Due Date:</span>
              <span className={isDueSoon(repair.dueDate) ? 'due-date-soon' : ''}>
                {formatDate(repair.dueDate)}
              </span>
            </div>
          )}
          {repair.completedDate && (repair.status === 'repaired' || repair.status === 'delivered') && (
            <div className="date-info">
              <span className="date-label">
                {repair.status === 'delivered' ? 'Delivered' : 'Repaired'}:
              </span>
              <span>{formatDate(repair.completedDate)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RepairCard;

