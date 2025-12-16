import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
  Legend,
} from 'recharts';
import type { CashFlowSummary } from './types';

interface BankTrendChartProps {
  data: CashFlowSummary[];
  formatCurrency: (amount: number) => string;
  height?: number;
  showComponents?: boolean;
}

const MONTH_NAMES = ['ינו׳', 'פבר׳', 'מרץ', 'אפר׳', 'מאי', 'יוני', 'יולי', 'אוג׳', 'ספט׳', 'אוק׳', 'נוב׳', 'דצמ׳'];

const COLORS = {
  balance: '#06b6d4',
  operating: '#10b981',
  investing: '#f59e0b',
  financing: '#8b5cf6',
  netChange: '#3b82f6',
  warning: '#ef4444',
  grid: '#e5e7eb',
};

const BankTrendChart: React.FC<BankTrendChartProps> = ({
  data,
  formatCurrency,
  height = 350,
  showComponents = true,
}) => {
  // Calculate min/max for reference lines
  const balances = data.map(d => d.closingBalance);
  const minBalance = Math.min(...balances);
  const maxBalance = Math.max(...balances);
  const avgBalance = balances.reduce((a, b) => a + b, 0) / balances.length;

  // Prepare data with month names
  const chartData = data.map(item => ({
    ...item,
    monthName: MONTH_NAMES[item.month - 1] || `חודש ${item.month}`,
  }));

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{
      name: string;
      value: number;
      color: string;
      dataKey: string;
    }>;
    label?: string
  }) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '12px',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        direction: 'rtl',
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#374151' }}>
          {label}
        </div>
        {payload.map((entry, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '1rem',
              fontSize: '13px',
              marginBottom: '4px',
            }}
          >
            <span style={{ color: entry.color }}>
              {entry.dataKey === 'closingBalance' && 'יתרה:'}
              {entry.dataKey === 'operating' && 'שוטף:'}
              {entry.dataKey === 'investing' && 'השקעות:'}
              {entry.dataKey === 'financing' && 'מימון:'}
              {entry.dataKey === 'netChange' && 'שינוי:'}
            </span>
            <span style={{ fontWeight: '600', color: entry.value >= 0 ? '#059669' : '#dc2626' }}>
              {formatCurrency(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ direction: 'ltr' }}>
      {/* Stats Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '0.75rem',
        marginBottom: '1rem',
        direction: 'rtl',
      }}>
        <div style={{
          padding: '0.75rem',
          backgroundColor: '#f0fdfa',
          borderRadius: '8px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '11px', color: '#0d9488' }}>יתרה נוכחית</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f766e' }}>
            {formatCurrency(balances[balances.length - 1] || 0)}
          </div>
        </div>
        <div style={{
          padding: '0.75rem',
          backgroundColor: '#ecfdf5',
          borderRadius: '8px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '11px', color: '#059669' }}>שיא</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#047857' }}>
            {formatCurrency(maxBalance)}
          </div>
        </div>
        <div style={{
          padding: '0.75rem',
          backgroundColor: '#fef2f2',
          borderRadius: '8px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '11px', color: '#dc2626' }}>מינימום</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#b91c1c' }}>
            {formatCurrency(minBalance)}
          </div>
        </div>
        <div style={{
          padding: '0.75rem',
          backgroundColor: '#f3f4f6',
          borderRadius: '8px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '11px', color: '#6b7280' }}>ממוצע</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#374151' }}>
            {formatCurrency(avgBalance)}
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
          <defs>
            <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.balance} stopOpacity={0.3} />
              <stop offset="95%" stopColor={COLORS.balance} stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />

          <XAxis
            dataKey="monthName"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={{ stroke: COLORS.grid }}
          />

          <YAxis
            tickFormatter={(value) => {
              if (Math.abs(value) >= 1000000) {
                return `${(value / 1000000).toFixed(1)}M`;
              }
              if (Math.abs(value) >= 1000) {
                return `${(value / 1000).toFixed(0)}K`;
              }
              return value.toString();
            }}
            tick={{ fontSize: 11, fill: '#6b7280' }}
            axisLine={{ stroke: COLORS.grid }}
          />

          <Tooltip content={<CustomTooltip />} />

          {showComponents && (
            <Legend
              verticalAlign="top"
              height={36}
              formatter={(value: string) => {
                const labels: Record<string, string> = {
                  closingBalance: 'יתרה',
                  operating: 'שוטף',
                  investing: 'השקעות',
                  financing: 'מימון',
                };
                return labels[value] || value;
              }}
            />
          )}

          {/* Reference lines */}
          <ReferenceLine y={0} stroke="#9ca3af" strokeWidth={1} />
          <ReferenceLine
            y={avgBalance}
            stroke="#9ca3af"
            strokeDasharray="5 5"
            label={{ value: 'ממוצע', position: 'right', fontSize: 10, fill: '#9ca3af' }}
          />

          {/* Area under balance line */}
          <Area
            type="monotone"
            dataKey="closingBalance"
            stroke="none"
            fill="url(#balanceGradient)"
          />

          {/* Main balance line */}
          <Line
            type="monotone"
            dataKey="closingBalance"
            stroke={COLORS.balance}
            strokeWidth={3}
            dot={{ fill: COLORS.balance, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: COLORS.balance, strokeWidth: 2, fill: 'white' }}
          />

          {/* Component lines (optional) */}
          {showComponents && (
            <>
              <Line
                type="monotone"
                dataKey="operating"
                stroke={COLORS.operating}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: COLORS.operating, r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="investing"
                stroke={COLORS.investing}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: COLORS.investing, r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="financing"
                stroke={COLORS.financing}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: COLORS.financing, r: 3 }}
              />
            </>
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BankTrendChart;
