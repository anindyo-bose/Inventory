import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Transaction, TransactionItem } from './TransactionManagement';
import { formatCurrency } from '../../utils/currency';
import './TransactionForm.css';

interface TransactionFormProps {
  transaction: Transaction | null;
  onClose: () => void;
  onSuccess: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  transaction,
  onClose,
  onSuccess,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [items, setItems] = useState<TransactionItem[]>([
    { name: '', quantity: 1, price: 0 },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (transaction) {
      setCustomerName(transaction.customerName);
      setItems(transaction.items);
    }
  }, [transaction]);

  const handleItemChange = (index: number, field: keyof TransactionItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleAddItem = () => {
    setItems([...items, { name: '', quantity: 1, price: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate
    if (!customerName.trim()) {
      setError('Customer name is required');
      setLoading(false);
      return;
    }

    const validItems = items.filter(
      (item) => item.name.trim() && item.quantity > 0 && item.price >= 0
    );

    if (validItems.length === 0) {
      setError('At least one valid item is required');
      setLoading(false);
      return;
    }

    try {
      if (transaction) {
        // Update existing transaction
        await axios.put(`/api/transactions/${transaction.id}`, {
          customerName,
          items: validItems,
        });
      } else {
        // Create new transaction
        await axios.post('/api/transactions', {
          customerName,
          items: validItems,
        });
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  return (
    <div className="form-overlay" onClick={onClose}>
      <div className="form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="form-header">
          <h2>{transaction ? 'Edit Transaction' : 'New Transaction'}</h2>
          <button onClick={onClose} className="close-button">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="transaction-form">
          {error && <div className="form-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="customerName">Customer Name *</label>
            <input
              type="text"
              id="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
              placeholder="Enter customer name"
            />
          </div>

          <div className="form-group">
            <div className="items-header">
              <label>Items *</label>
              <button
                type="button"
                onClick={handleAddItem}
                className="add-item-button"
              >
                + Add Item
              </button>
            </div>

            <div className="items-list">
              {items.map((item, index) => (
                <div key={index} className="item-row">
                  <input
                    type="text"
                    placeholder="Item name"
                    value={item.name}
                    onChange={(e) =>
                      handleItemChange(index, 'name', e.target.value)
                    }
                    className="item-name-input"
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity || ''}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        'quantity',
                        parseInt(e.target.value) || 0
                      )
                    }
                    min="1"
                    className="item-quantity-input"
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    value={item.price || ''}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        'price',
                        parseFloat(e.target.value) || 0
                      )
                    }
                    min="0"
                    step="0.01"
                    className="item-price-input"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="remove-item-button"
                    disabled={items.length === 1}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="form-total">
            <span>Total Amount:</span>
            <span className="total-value">{formatCurrency(totalAmount)}</span>
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
                : transaction
                ? 'Update Transaction'
                : 'Create Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;

