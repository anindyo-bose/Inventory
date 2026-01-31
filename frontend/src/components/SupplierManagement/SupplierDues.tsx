import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatCurrency } from '../../utils/currency';
import './SupplierDues.css';

interface DueSummary {
  supplierId: number;
  supplierName: string;
  totalDues: number;
  totalBills: number;
  totalBillsAmount: number;
  totalPaymentsAmount: number;
  bills: Array<{
    id: number;
    billNumber: string;
    amount: number;
    billDate: string;
    dueDate: string;
  }>;
}

const SupplierDues: React.FC = () => {
  const [dues, setDues] = useState<DueSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDues();
  }, []);

  const fetchDues = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/suppliers/dues/all');
      setDues(response.data.dues);
      setError('');
    } catch (err: any) {
      setError('Failed to fetch dues');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };


  const totalDues = dues.reduce((sum, d) => sum + d.totalDues, 0);

  if (loading) {
    return <div className="loading">Loading dues...</div>;
  }

  if (error) {
    return <div className="error-banner">{error}</div>;
  }

  return (
    <div className="supplier-dues">
      <div className="dues-header">
        <h2>All Supplier Dues</h2>
        <div className="total-dues">
          <span className="total-label">Total Outstanding:</span>
          <span className="total-amount">{formatCurrency(totalDues)}</span>
        </div>
      </div>

      {dues.length === 0 ? (
        <div className="empty-state">No dues found.</div>
      ) : (
        <div className="dues-list">
          {dues
            .filter(d => d.totalDues > 0)
            .map((due) => (
              <div key={due.supplierId} className="due-card">
                <div className="due-card-header">
                  <div>
                    <h3 className="supplier-name">{due.supplierName}</h3>
                    <p className="supplier-stats">
                      {due.totalBills} bill{due.totalBills !== 1 ? 's' : ''} • Total Bills: {formatCurrency(due.totalBillsAmount)} • Total Payments: {formatCurrency(due.totalPaymentsAmount)}
                    </p>
                  </div>
                  <div className="due-amount">
                    <span className="amount-label">Total Due:</span>
                    <span className="amount-value">{formatCurrency(due.totalDues)}</span>
                  </div>
                </div>

                {due.bills.length > 0 && (
                  <div className="bills-list">
                    <h4 className="bills-title">All Bills:</h4>
                    {due.bills.map((bill) => (
                      <div key={bill.id} className="bill-item">
                        <div className="bill-info">
                          <span className="bill-number">{bill.billNumber}</span>
                          <span className="bill-date">{formatDate(bill.billDate)}</span>
                        </div>
                        <div className="bill-amounts">
                          <span className="bill-total">{formatCurrency(bill.amount)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default SupplierDues;

