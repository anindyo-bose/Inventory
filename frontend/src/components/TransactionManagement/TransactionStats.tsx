import React from 'react';
import { Transaction } from './TransactionManagement';
import { formatCurrency } from '../../utils/currency';
import './TransactionStats.css';

interface TransactionStatsProps {
  transactions: Transaction[];
}

const TransactionStats: React.FC<TransactionStatsProps> = ({ transactions }) => {
  const totalTransactions = transactions.length;
  const completedTransactions = transactions.filter(
    (t) => t.sellingDone && t.paymentDone
  ).length;
  const pendingSelling = transactions.filter(
    (t) => !t.sellingDone
  ).length;
  const pendingPayment = transactions.filter(
    (t) => t.sellingDone && !t.paymentDone
  ).length;
  const totalRevenue = transactions
    .filter((t) => t.paymentDone)
    .reduce((sum, t) => sum + t.totalAmount, 0);

  const stats = [
    {
      label: 'Total Transactions',
      value: totalTransactions,
      color: '#3182ce',
    },
    {
      label: 'Completed',
      value: completedTransactions,
      color: '#38a169',
    },
    {
      label: 'Pending Selling',
      value: pendingSelling,
      color: '#d69e2e',
    },
    {
      label: 'Pending Payment',
      value: pendingPayment,
      color: '#e53e3e',
    },
    {
      label: 'Total Revenue',
      value: formatCurrency(totalRevenue),
      color: '#805ad5',
    },
  ];

  return (
    <div className="transaction-stats">
      {stats.map((stat, index) => (
        <div key={index} className="stat-card">
          <div className="stat-value" style={{ color: stat.color }}>
            {stat.value}
          </div>
          <div className="stat-label">{stat.label}</div>
        </div>
      ))}
    </div>
  );
};

export default TransactionStats;

