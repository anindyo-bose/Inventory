import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Supplier, Payment } from './SupplierManagement';
import { formatCurrency, getCurrencySymbol } from '../../utils/currency';
import './SupplierPayments.css';

interface SupplierPaymentsProps {
  supplier: Supplier;
}

const SupplierPayments: React.FC<SupplierPaymentsProps> = ({ supplier }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);

  useEffect(() => {
    fetchPayments();
  }, [supplier.id]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/suppliers/${supplier.id}/payments`);
      setPayments(response.data.payments);
      setError('');
    } catch (err: any) {
      setError('Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePayment = () => {
    setEditingPayment(null);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingPayment(null);
  };

  const handleFormSuccess = () => {
    fetchPayments();
    handleFormClose();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };


  const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="supplier-payments">
      <div className="payments-header">
        <div>
          <h2>Payments - {supplier.name}</h2>
          <p className="total-payments">Total Paid: ${totalPayments.toFixed(2)}</p>
        </div>
        <button onClick={handleCreatePayment} className="create-button">
          + New Payment
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="loading">Loading payments...</div>
      ) : payments.length === 0 ? (
        <div className="empty-state">No payments found. Create your first payment.</div>
      ) : (
        <div className="payments-list">
          {payments.map((payment) => (
            <div key={payment.id} className="payment-card">
              <div className="payment-header">
                <div>
                  <h3 className="payment-amount">{formatCurrency(payment.amount)}</h3>
                  <p className="payment-date">{formatDate(payment.paymentDate)}</p>
                </div>
                <div className="payment-method">
                  {payment.paymentMethod}
                </div>
              </div>

              <div className="payment-details">
                {payment.referenceNumber && (
                  <div className="detail-row">
                    <span>Reference:</span>
                    <span>{payment.referenceNumber}</span>
                  </div>
                )}
                {payment.notes && (
                  <div className="detail-row">
                    <span>Notes:</span>
                    <span>{payment.notes}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <PaymentForm
          supplier={supplier}
          payment={editingPayment}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
};

// Payment Form Component
interface PaymentFormProps {
  supplier: Supplier;
  payment: Payment | null;
  onClose: () => void;
  onSuccess: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ supplier, payment, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash',
    referenceNumber: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (payment) {
      setFormData({
        amount: payment.amount.toString(),
        paymentDate: payment.paymentDate.split('T')[0],
        paymentMethod: payment.paymentMethod,
        referenceNumber: payment.referenceNumber,
        notes: payment.notes,
      });
    }
  }, [payment]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

      await axios.post(`/api/suppliers/${supplier.id}/payments`, payload);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-overlay" onClick={onClose}>
      <div className="form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="form-header">
          <h2>New Payment</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>

        <form onSubmit={handleSubmit} className="payment-form">
          {error && <div className="form-error">{error}</div>}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="amount">Amount ({getCurrencySymbol()}) *</label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                min="0.01"
                step="0.01"
                placeholder="0.00"
              />
            </div>
            <div className="form-group">
              <label htmlFor="paymentDate">Payment Date *</label>
              <input
                type="date"
                id="paymentDate"
                name="paymentDate"
                value={formData.paymentDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="paymentMethod">Payment Method *</label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                required
              >
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="referenceNumber">Reference Number</label>
              <input
                type="text"
                id="referenceNumber"
                name="referenceNumber"
                value={formData.referenceNumber}
                onChange={handleChange}
                placeholder="Transaction/Cheque number"
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
              placeholder="Additional notes"
              rows={3}
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-button" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Saving...' : 'Create Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplierPayments;

