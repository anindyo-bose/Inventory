import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Repair } from './RepairManagement';
import { formatCurrency, getCurrencySymbol } from '../../utils/currency';
import './RepairForm.css';

interface RepairFormProps {
  repair: Repair | null;
  onClose: () => void;
  onSuccess: () => void;
}

const RepairForm: React.FC<RepairFormProps> = ({
  repair,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    itemName: '',
    itemDescription: '',
    customerName: '',
    customerContact: '',
    forwardedTo: '',
    billNo: '',
    repairCost: '',
    amountCharged: '',
    advanceAmount: '',
    status: 'pending' as 'in_progress' | 'repaired' | 'cancelled' | 'delivered' | 'pending',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (repair) {
      setFormData({
        itemName: repair.itemName,
        itemDescription: repair.itemDescription,
        customerName: repair.customerName,
        customerContact: repair.customerContact,
        forwardedTo: repair.forwardedTo,
        billNo: repair.billNo || '',
        repairCost: repair.repairCost.toString(),
        amountCharged: repair.amountCharged.toString(),
        advanceAmount: (repair.advanceAmount || 0).toString(),
        status: repair.status,
        dueDate: repair.dueDate ? repair.dueDate.split('T')[0] : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: repair.notes,
      });
    }
  }, [repair]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate required fields: Customer Name, Customer Contact, and Bill No
    if (
      !formData.customerName.trim() ||
      !formData.customerContact.trim() ||
      !formData.billNo.trim()
    ) {
      setError('Please fill in Customer Name, Customer Contact, and Bill No');
      setLoading(false);
      return;
    }

    // Validate phone number format (should contain at least digits)
    const phoneRegex = /^[0-9+\-\s()]+$/;
    const digitsOnly = formData.customerContact.replace(/[^0-9]/g, '');
    if (!phoneRegex.test(formData.customerContact) || digitsOnly.length < 7) {
      setError('Please enter a valid phone number (at least 7 digits)');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        repairCost: parseFloat(formData.repairCost) || 0,
        amountCharged: parseFloat(formData.amountCharged) || 0,
        advanceAmount: parseFloat(formData.advanceAmount) || 0,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      if (repair) {
        await axios.put(`/api/repairs/${repair.id}`, payload);
      } else {
        await axios.post('/api/repairs', payload);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save repair record');
    } finally {
      setLoading(false);
    }
  };

  const profit = (parseFloat(formData.amountCharged) || 0) - (parseFloat(formData.repairCost) || 0);

  return (
    <div className="form-overlay" onClick={onClose}>
      <div className="form-modal repair-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="form-header">
          <h2>{repair ? 'Edit Repair Record' : 'New Repair Record'}</h2>
          <button onClick={onClose} className="close-button">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="repair-form">
          {error && <div className="form-error">{error}</div>}

          <div className="form-section">
            <h3 className="section-title">Item Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="itemName">Item Name</label>
                <input
                  type="text"
                  id="itemName"
                  name="itemName"
                  value={formData.itemName}
                  onChange={handleChange}
                  placeholder="e.g., Laptop, Smartphone"
                />
              </div>
              <div className="form-group">
                <label htmlFor="forwardedTo">Forwarded To</label>
                <input
                  type="text"
                  id="forwardedTo"
                  name="forwardedTo"
                  value={formData.forwardedTo}
                  onChange={handleChange}
                  placeholder="Repair service provider"
                />
              </div>
              <div className="form-group">
                <label htmlFor="billNo">Bill No. *</label>
                <input
                  type="text"
                  id="billNo"
                  name="billNo"
                  value={formData.billNo}
                  onChange={handleChange}
                  required
                  placeholder="Bill or invoice number"
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="itemDescription">Item Description</label>
              <textarea
                id="itemDescription"
                name="itemDescription"
                value={formData.itemDescription}
                onChange={handleChange}
                placeholder="Describe the item and repair needed"
                rows={3}
              />
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Customer Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="customerName">Customer Name *</label>
                <input
                  type="text"
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  required
                  placeholder="Customer name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="customerContact">Customer Contact (Phone Number) *</label>
                <input
                  type="tel"
                  id="customerContact"
                  name="customerContact"
                  value={formData.customerContact}
                  onChange={handleChange}
                  required
                  pattern="[0-9+\-\s()]+"
                  placeholder="e.g., +1234567890 or 123-456-7890"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Financial Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="repairCost">Repair Cost ({getCurrencySymbol()})</label>
                <input
                  type="number"
                  id="repairCost"
                  name="repairCost"
                  value={formData.repairCost}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
              <div className="form-group">
                <label htmlFor="amountCharged">Amount Charged ({getCurrencySymbol()})</label>
                <input
                  type="number"
                  id="amountCharged"
                  name="amountCharged"
                  value={formData.amountCharged}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="advanceAmount">Advance Amount ({getCurrencySymbol()})</label>
                <input
                  type="number"
                  id="advanceAmount"
                  name="advanceAmount"
                  value={formData.advanceAmount}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
              <div className="form-group">
                <label>Profit</label>
                <div className="profit-display">
                  <span className={`profit-value ${profit >= 0 ? 'positive' : 'negative'}`}>
                    {formatCurrency(profit)}
                  </span>
                </div>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Due Amount</label>
                <div className="profit-display">
                  <span className="profit-value">
                    {formatCurrency((parseFloat(formData.amountCharged) || 0) - (parseFloat(formData.advanceAmount) || 0))}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Status & Notes</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="repaired">Repaired</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="dueDate">Due Date</label>
                <input
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Additional notes or comments"
                rows={3}
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="cancel-button"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={loading}
            >
              {loading
                ? 'Saving...'
                : repair
                ? 'Update Repair'
                : 'Create Repair'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RepairForm;

