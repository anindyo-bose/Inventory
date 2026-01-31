import React from 'react';
import { Repair } from './RepairManagement';
import RepairCard from './RepairCard';
import './RepairList.css';

interface RepairListProps {
  repairs: Repair[];
  loading: boolean;
  searchQuery?: string;
  totalCount?: number;
  onEdit?: (repair: Repair) => void;
  onDelete?: (id: number) => void;
}

const RepairList: React.FC<RepairListProps> = ({
  repairs,
  loading,
  searchQuery,
  totalCount,
  onEdit,
  onDelete,
}) => {
  if (loading) {
    return (
      <div className="repair-list-loading">
        <div className="loading-spinner">Loading repairs...</div>
      </div>
    );
  }

  if (repairs.length === 0) {
    return (
      <div className="repair-list-empty">
        <p>
          {searchQuery
            ? `No repair records found matching "${searchQuery}".`
            : 'No repair records found. Create your first repair record to get started.'}
        </p>
      </div>
    );
  }

  return (
    <div className="repair-list">
      <div className="repair-list-header">
        <h2>Repair Records</h2>
        <span className="repair-count">
          {searchQuery && totalCount !== undefined
            ? `${repairs.length} of ${totalCount}`
            : `${repairs.length} total`}
        </span>
      </div>
      <div className="repair-grid">
        {repairs.map((repair) => (
          <RepairCard
            key={repair.id}
            repair={repair}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default RepairList;



