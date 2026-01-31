import React from 'react';
import { Supplier } from './SupplierManagement';
import './SupplierList.css';

interface SupplierListProps {
  suppliers: Supplier[];
  loading: boolean;
  onSelect: (supplier: Supplier) => void;
  onEdit?: (supplier: Supplier) => void;
  onDelete?: (id: number) => void;
}

const SupplierList: React.FC<SupplierListProps> = ({
  suppliers,
  loading,
  onSelect,
  onEdit,
  onDelete,
}) => {
  if (loading) {
    return (
      <div className="supplier-list-loading">
        <div className="loading-spinner">Loading suppliers...</div>
      </div>
    );
  }

  if (!suppliers || suppliers.length === 0) {
    return (
      <div className="supplier-list-empty">
        <p>No supplier found</p>
      </div>
    );
  }

  return (
    <div className="supplier-list">
      <div className="supplier-grid">
        {suppliers.map((supplier) => (
          <div key={supplier.id} className="supplier-card" onClick={() => onSelect(supplier)}>
            <div className="supplier-card-header">
              <h3 className="supplier-name">{supplier.name}</h3>
              {(onEdit || onDelete) && (
                <div className="supplier-actions" onClick={(e) => e.stopPropagation()}>
                  {onEdit && (
                    <button
                      onClick={() => onEdit(supplier)}
                      className="action-button edit-button"
                      title="Edit"
                    >
                      ✏️
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(supplier.id)}
                      className="action-button delete-button"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="supplier-details">
              <div className="detail-row">
                <span className="detail-label">Contact:</span>
                <span className="detail-value">{supplier.contactPerson}</span>
              </div>
              {supplier.email && (
                <div className="detail-row">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{supplier.email}</span>
                </div>
              )}
              {supplier.phone && (
                <div className="detail-row">
                  <span className="detail-label">Phone:</span>
                  <span className="detail-value">{supplier.phone}</span>
                </div>
              )}
              {supplier.address && (
                <div className="detail-row">
                  <span className="detail-label">Address:</span>
                  <span className="detail-value">{supplier.address}</span>
                </div>
              )}
            </div>
            <div className="supplier-footer">
              <span className="click-hint">Click to view bills & payments</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SupplierList;

