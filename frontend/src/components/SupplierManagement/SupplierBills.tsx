import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Supplier, Bill } from './SupplierManagement';
import { formatCurrency, getCurrencySymbol } from '../../utils/currency';
import './SupplierBills.css';

interface SupplierBillsProps {
  supplier: Supplier;
}

const SupplierBills: React.FC<SupplierBillsProps> = ({ supplier }) => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);

  useEffect(() => {
    fetchBills();
  }, [supplier.id]);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/suppliers/${supplier.id}/bills`);
      setBills(response.data.bills);
      setError('');
    } catch (err: any) {
      setError('Failed to fetch bills');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBill = () => {
    setEditingBill(null);
    setShowForm(true);
  };

  const handleEditBill = (bill: Bill) => {
    setEditingBill(bill);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingBill(null);
  };

  const handleFormSuccess = () => {
    fetchBills();
    handleFormClose();
  };

  const handleDeleteBill = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this bill?')) {
      try {
        await axios.delete(`/api/suppliers/${supplier.id}/bills/${id}`);
        fetchBills();
      } catch (err: any) {
        setError('Failed to delete bill');
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Convert to base64 for demo (in production, upload to cloud storage)
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Store in form data (will be handled in form component)
        return base64String;
      };
      reader.readAsDataURL(file);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };


  return (
    <div className="supplier-bills">
      <div className="bills-header">
        <h2>Bills & Dues - {supplier.name}</h2>
        <button onClick={handleCreateBill} className="create-button">
          + New Bill
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="loading">Loading bills...</div>
      ) : bills.length === 0 ? (
        <div className="empty-state">No bills found. Create your first bill.</div>
      ) : (
        <div className="bills-grid">
          {bills.map((bill) => (
            <div key={bill.id} className="bill-card">
              <div className="bill-header">
                <div>
                  <h3 className="bill-number">{bill.billNumber}</h3>
                  <p className="bill-amount">{formatCurrency(bill.amount)}</p>
                </div>
                <div className="bill-actions">
                  <button
                    onClick={() => handleEditBill(bill)}
                    className="action-button"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeleteBill(bill.id)}
                    className="action-button"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="bill-details">
                <div className="detail-row">
                  <span>Bill Date:</span>
                  <span>{formatDate(bill.billDate)}</span>
                </div>
                <div className="detail-row">
                  <span>Due Date:</span>
                  <span>{formatDate(bill.dueDate)}</span>
                </div>
              </div>

              {bill.billImage && (
                <div className="bill-image">
                  <img src={bill.billImage} alt="Bill" />
                </div>
              )}

              <div className="bill-footer">
                {bill.description && (
                  <p className="bill-description">{bill.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <BillForm
          supplier={supplier}
          bill={editingBill}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
};

// Bill Form Component
interface BillFormProps {
  supplier: Supplier;
  bill: Bill | null;
  onClose: () => void;
  onSuccess: () => void;
}

const BillForm: React.FC<BillFormProps> = ({ supplier, bill, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    billNumber: '',
    amount: '',
    billDate: new Date().toISOString().split('T')[0],
    dueDate: new Date().toISOString().split('T')[0],
    description: '',
    billImage: null as string | null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (bill) {
      setFormData({
        billNumber: bill.billNumber,
        amount: bill.amount.toString(),
        billDate: bill.billDate.split('T')[0],
        dueDate: bill.dueDate.split('T')[0],
        description: bill.description,
        billImage: bill.billImage,
      });
    }
  }, [bill]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          billImage: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
      };

      if (bill) {
        await axios.put(`/api/suppliers/${supplier.id}/bills/${bill.id}`, payload);
      } else {
        await axios.post(`/api/suppliers/${supplier.id}/bills`, payload);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save bill');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-overlay" onClick={onClose}>
      <div className="form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="form-header">
          <h2>{bill ? 'Edit Bill' : 'New Bill'}</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>

        <form onSubmit={handleSubmit} className="bill-form">
          {error && <div className="form-error">{error}</div>}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="billNumber">Bill Number *</label>
              <input
                type="text"
                id="billNumber"
                name="billNumber"
                value={formData.billNumber}
                onChange={handleChange}
                required
                placeholder="BILL-001"
              />
            </div>
            <div className="form-group">
              <label htmlFor="amount">Amount ({getCurrencySymbol()}) *</label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="billDate">Bill Date *</label>
              <input
                type="date"
                id="billDate"
                name="billDate"
                value={formData.billDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="dueDate">Due Date *</label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Bill description"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="billImage">Bill Image</label>
            <input
              type="file"
              id="billImage"
              accept="image/*"
              onChange={handleImageChange}
            />
            {formData.billImage && (
              <div className="image-preview">
                <img src={formData.billImage} alt="Bill preview" />
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-button" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Saving...' : bill ? 'Update Bill' : 'Create Bill'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplierBills;

