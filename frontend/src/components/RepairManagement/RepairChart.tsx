import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Repair } from './RepairManagement';
import { formatCurrency } from '../../utils/currency';
import './RepairChart.css';

interface RepairChartProps {
  repairs: Repair[];
}

type ViewType = 'weekly' | 'monthly' | 'yearly';

const RepairChart: React.FC<RepairChartProps> = ({ repairs }) => {
  const [viewType, setViewType] = useState<ViewType>('monthly');

  const chartData = useMemo(() => {
    const dataMap = new Map<string, { totalCharged: number; profit: number; totalDue: number }>();

    repairs.forEach((repair) => {
      const date = new Date(repair.receivedDate);
      let key = '';

      if (viewType === 'weekly') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = `Week ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      } else if (viewType === 'monthly') {
        key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      } else {
        key = date.getFullYear().toString();
      }

      if (!dataMap.has(key)) {
        dataMap.set(key, { totalCharged: 0, profit: 0, totalDue: 0 });
      }

      const data = dataMap.get(key)!;
      data.totalCharged += repair.amountCharged;
      data.profit += repair.amountCharged - repair.repairCost;

      // Total due: Total Charged - Advance Amount (for repairs that are not delivered or cancelled)
      if (repair.status !== 'delivered' && repair.status !== 'cancelled') {
        const advance = repair.advanceAmount || 0;
        data.totalDue += repair.amountCharged - advance;
      }
    });

    // Convert to array and sort by date
    const sortedData = Array.from(dataMap.entries())
      .map(([period, values]) => ({
        period,
        totalCharged: values.totalCharged,
        profit: values.profit,
        totalDue: values.totalDue,
      }))
      .sort((a, b) => {
        // Simple string comparison for sorting
        return a.period.localeCompare(b.period);
      });

    return sortedData;
  }, [repairs, viewType]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="tooltip-label">{payload[0].payload.period}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="repair-chart">
      <div className="chart-header">
        <h3>Financial Overview</h3>
        <div className="chart-controls">
          <button
            className={viewType === 'weekly' ? 'active' : ''}
            onClick={() => setViewType('weekly')}
          >
            Weekly
          </button>
          <button
            className={viewType === 'monthly' ? 'active' : ''}
            onClick={() => setViewType('monthly')}
          >
            Monthly
          </button>
          <button
            className={viewType === 'yearly' ? 'active' : ''}
            onClick={() => setViewType('yearly')}
          >
            Yearly
          </button>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="chart-empty">
          <p>No data available for the selected period</p>
        </div>
      ) : (
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="totalCharged"
                stroke="#3182ce"
                strokeWidth={2}
                name="Total Charged"
              />
              <Line
                type="monotone"
                dataKey="profit"
                stroke="#38a169"
                strokeWidth={2}
                name="Profit"
              />
              <Line
                type="monotone"
                dataKey="totalDue"
                stroke="#d69e2e"
                strokeWidth={2}
                name="Total Due"
              />
            </LineChart>
          </ResponsiveContainer>

          <div className="chart-summary">
            <div className="summary-item">
              <span className="summary-label">Total Charged:</span>
              <span className="summary-value">
                {formatCurrency(chartData.reduce((sum, d) => sum + d.totalCharged, 0))}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Total Profit:</span>
              <span className="summary-value profit">
                {formatCurrency(chartData.reduce((sum, d) => sum + d.profit, 0))}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Total Due:</span>
              <span className="summary-value due">
                {formatCurrency(chartData.reduce((sum, d) => sum + d.totalDue, 0))}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RepairChart;

