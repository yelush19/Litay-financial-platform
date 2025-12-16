import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { DiscrepancyByCode } from './types';

interface DiscrepancyPieChartProps {
  data: DiscrepancyByCode[];
  formatCurrency: (amount: number) => string;
  height?: number;
  title?: string;
}

const COLORS = [
  '#ef4444', // Red
  '#f97316', // Orange
  '#f59e0b', // Amber
  '#eab308', // Yellow
  '#84cc16', // Lime
  '#22c55e', // Green
  '#14b8a6', // Teal
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#a855f7', // Purple
  '#ec4899', // Pink
];

const DiscrepancyPieChart: React.FC<DiscrepancyPieChartProps> = ({
  data,
  formatCurrency,
  height = 400,
  title = 'התפלגות הפרשים לפי קוד מיון',
}) => {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  // Sort by discrepancy amount and take top items
  const sortedData = [...data]
    .sort((a, b) => Math.abs(b.discrepancyAmount) - Math.abs(a.discrepancyAmount))
    .slice(0, 10)
    .map((item, index) => ({
      ...item,
      color: COLORS[index % COLORS.length],
    }));

  const totalDiscrepancy = sortedData.reduce((sum, item) => sum + Math.abs(item.discrepancyAmount), 0);

  const CustomTooltip = ({ active, payload }: {
    active?: boolean;
    payload?: Array<{ payload: DiscrepancyByCode & { color: string } }>;
  }) => {
    if (!active || !payload || !payload.length) return null;

    const item = payload[0].payload;

    return (
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '12px',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        direction: 'rtl',
      }}>
        <div style={{
          fontWeight: 'bold',
          marginBottom: '8px',
          color: '#374151',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '3px',
            backgroundColor: item.color,
          }} />
          {item.code} - {item.name}
        </div>
        <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
            <span style={{ color: '#6b7280' }}>סכום הפרש:</span>
            <span style={{ fontWeight: '600', color: '#dc2626' }}>
              {formatCurrency(item.discrepancyAmount)}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
            <span style={{ color: '#6b7280' }}>מספר חשבונות:</span>
            <span style={{ fontWeight: '600' }}>{item.discrepancyCount}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
            <span style={{ color: '#6b7280' }}>אחוז מסה"כ:</span>
            <span style={{ fontWeight: '600' }}>{item.percentage.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    );
  };

  const renderLegend = () => {
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '8px',
        padding: '0 16px',
        marginTop: '16px',
        direction: 'rtl',
      }}>
        {sortedData.map((item, index) => (
          <div
            key={item.code}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 10px',
              backgroundColor: activeIndex === index ? '#f3f4f6' : 'transparent',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(undefined)}
          >
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '3px',
              backgroundColor: item.color,
              flexShrink: 0,
            }} />
            <span style={{
              fontSize: '12px',
              color: '#374151',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {item.code} - {item.name}
            </span>
            <span style={{
              fontSize: '11px',
              color: '#dc2626',
              fontWeight: '600',
              marginRight: 'auto',
            }}>
              {item.percentage.toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    );
  };

  if (sortedData.length === 0) {
    return (
      <div style={{
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        color: '#10b981',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>✓</div>
        <div style={{ fontSize: '18px', fontWeight: '600' }}>אין הפרשים!</div>
        <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>
          כל הנתונים תואמים בין הביאורים למאזן בוחן
        </div>
      </div>
    );
  }

  return (
    <div style={{ direction: 'rtl' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
      }}>
        <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
          {title}
        </div>
        <div style={{
          fontSize: '14px',
          color: '#dc2626',
          fontWeight: '600',
          backgroundColor: '#fef2f2',
          padding: '4px 12px',
          borderRadius: '16px',
        }}>
          סה"כ: {formatCurrency(totalDiscrepancy)}
        </div>
      </div>

      {/* Chart */}
      <div style={{ direction: 'ltr' }}>
        <ResponsiveContainer width="100%" height={height - 100}>
          <PieChart>
            <Pie
              data={sortedData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={2}
              dataKey="discrepancyAmount"
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(undefined)}
            >
              {sortedData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke="white"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Custom Legend */}
      {renderLegend()}
    </div>
  );
};

export default DiscrepancyPieChart;
