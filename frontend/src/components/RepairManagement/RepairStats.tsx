import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Repair } from './RepairManagement';
import { formatCurrency } from '../../utils/currency';
import './RepairStats.css';

interface RepairStatsProps {
  repairs: Repair[];
}

const RepairStats: React.FC<RepairStatsProps> = ({ repairs }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const totalRepairs = repairs.length;
  const inProgress = repairs.filter((r) => r.status === 'in_progress').length;
  const repaired = repairs.filter((r) => r.status === 'repaired').length;
  const delivered = repairs.filter((r) => r.status === 'delivered').length;
  const pending = repairs.filter((r) => r.status === 'pending').length;
  const cancelled = repairs.filter((r) => r.status === 'cancelled').length;
  
  const totalCharged = repairs.reduce((sum, r) => sum + r.amountCharged, 0);
  const totalProfit = totalCharged - repairs.reduce((sum, r) => sum + r.repairCost, 0);

  const stats = [
    {
      label: 'Total Repairs',
      value: totalRepairs,
      color: '#3182ce',
      adminOnly: false,
    },
    {
      label: 'Pending',
      value: pending,
      color: '#d69e2e',
      adminOnly: false,
    },
    {
      label: 'In Progress',
      value: inProgress,
      color: '#d69e2e',
      adminOnly: false,
    },
    {
      label: 'Repaired',
      value: repaired,
      color: '#3182ce',
      adminOnly: false,
    },
    {
      label: 'Delivered',
      value: delivered,
      color: '#38a169',
      adminOnly: false,
    },
    {
      label: 'Cancelled',
      value: cancelled,
      color: '#e53e3e',
      adminOnly: false,
    },
    {
      label: 'Total Charged',
      value: formatCurrency(totalCharged),
      color: '#3182ce',
      adminOnly: true,
    },
    {
      label: 'Net Profit',
      value: formatCurrency(totalProfit),
      color: totalProfit >= 0 ? '#38a169' : '#e53e3e',
      adminOnly: true,
    },
  ];

  const visibleStats = stats.filter((stat) => !stat.adminOnly || isAdmin);

  return (
    <div className="repair-stats">
      {visibleStats.map((stat, index) => (
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

export default RepairStats;

