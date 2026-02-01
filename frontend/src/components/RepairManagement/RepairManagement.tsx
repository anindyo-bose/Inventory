import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import RepairList from './RepairList';
import RepairForm from './RepairForm';
import RepairStats from './RepairStats';
import RepairChart from './RepairChart';
import './RepairManagement.css';

export interface Repair {
  id: number;
  repairId: string;
  billNo?: string;
  itemName: string;
  itemDescription: string;
  customerName: string;
  customerContact: string;
  forwardedTo: string;
  forwardedDate: string;
  repairCost: number;
  amountCharged: number;
  advanceAmount: number;
  status: 'in_progress' | 'repaired' | 'cancelled' | 'delivered' | 'pending';
  receivedDate: string;
  dueDate: string;
  completedDate: string | null;
  createdBy: string;
  notes: string;
}

const RepairManagement: React.FC = () => {
  const { user } = useAuth();
  const isViewer = user?.role === 'viewer';
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingRepair, setEditingRepair] = useState<Repair | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string | null>(() => {
    // Initialize from localStorage
    const saved = localStorage.getItem('repairFilter');
    return saved || null;
  });

  useEffect(() => {
    fetchRepairs();
  }, []);

  // Save filter to localStorage whenever it changes
  useEffect(() => {
    if (selectedFilter) {
      localStorage.setItem('repairFilter', selectedFilter);
    } else {
      localStorage.removeItem('repairFilter');
    }
  }, [selectedFilter]);

  const fetchRepairs = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/repairs');
      setRepairs(response.data.repairs);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch repairs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRepair = () => {
    setEditingRepair(null);
    setShowForm(true);
  };

  const handleEditRepair = (repair: Repair) => {
    setEditingRepair(repair);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingRepair(null);
  };

  const handleFormSuccess = () => {
    fetchRepairs();
    handleFormClose();
  };

  const handleDeleteRepair = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this repair record?')) {
      try {
        await axios.delete(`/api/repairs/${id}`);
        fetchRepairs();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete repair');
      }
    }
  };

  // Calculate repairs due within next 2 days
  const getDueSoonCount = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const twoDaysLater = new Date(today);
    twoDaysLater.setDate(today.getDate() + 2);
    
    return repairs.filter(repair => {
      if (repair.status === 'delivered' || repair.status === 'cancelled') return false;
      if (!repair.dueDate) return false;
      const dueDate = new Date(repair.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate >= today && dueDate <= twoDaysLater;
    }).length;
  };

  const dueSoonCount = getDueSoonCount();

  // Filter repairs based on search query and status filter
  const filteredRepairs = repairs.filter(repair => {
    // Apply status filter
    if (selectedFilter && selectedFilter !== 'all') {
      if (selectedFilter === 'pending' && repair.status !== 'pending') return false;
      if (selectedFilter === 'in_progress' && repair.status !== 'in_progress') return false;
      if (selectedFilter === 'repaired' && repair.status !== 'repaired') return false;
      if (selectedFilter === 'delivered' && repair.status !== 'delivered') return false;
      if (selectedFilter === 'cancelled' && repair.status !== 'cancelled') return false;
    }
    
    // Apply search filter
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    const billNoMatch = repair.billNo?.toLowerCase().includes(query);
    const customerNameMatch = repair.customerName.toLowerCase().includes(query);
    return billNoMatch || customerNameMatch;
  });

  return (
    <div className="repair-management">
      {error && <div className="error-banner">{error}</div>}
      
      {dueSoonCount > 0 && (
        <div className="due-soon-alert">
          <span className="alert-icon">⚠️</span>
          <span className="alert-text">
            {dueSoonCount} repair{dueSoonCount !== 1 ? 's' : ''} due within next 2 days
          </span>
        </div>
      )}
      
      <RepairStats 
        repairs={repairs} 
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
      />
      
      {isAdmin && <RepairChart repairs={repairs} />}
      
      <div className="repair-controls">
        <div className="repair-search">
          <input
            type="text"
            placeholder="Search by Bill No or Customer Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="clear-search-button"
              title="Clear search"
            >
              ×
            </button>
          )}
        </div>
        {!isViewer && (
          <div className="repair-actions">
            <button onClick={handleCreateRepair} className="create-button">
              + New Repair Record
            </button>
          </div>
        )}
      </div>

      {showForm && (
        <RepairForm
          repair={editingRepair}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}

      <RepairList
        repairs={filteredRepairs}
        loading={loading}
        searchQuery={searchQuery}
        totalCount={repairs.length}
        onEdit={isViewer ? undefined : handleEditRepair}
        onDelete={isViewer ? undefined : handleDeleteRepair}
      />
    </div>
  );
};

export default RepairManagement;

