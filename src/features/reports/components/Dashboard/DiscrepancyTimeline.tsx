import React, { useState } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import { AlertCircle, CheckCircle } from 'lucide-react';
import type { MonthlyDiscrepancy } from './types';

interface DiscrepancyTimelineProps {
  data: MonthlyDiscrepancy[];
  formatCurrency: (amount: number) => string;
  height?: number;
  onMonthClick?: (month: number) => void;
}

const MONTH_NAMES = ['ינו׳', 'פבר׳', 'מרץ', 'אפר׳', 'מאי', 'יוני', 'יולי', 'אוג׳', 'ספט׳', 'אוק׳', 'נוב׳', 'דצמ׳'];

const DiscrepancyTimeline: React.FC<DiscrepancyTimelineProps> = ({
  data,
  formatCurrency,
  height = 350,
  onMonthClick,
}) => {
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);

  // Prepare chart data
  const chartData = data.map(item => ({
    ...item,
    displayMonth: MONTH_NAMES[item.month - 1] || `חודש ${item.month}`,
    absDiscrepancy: Math.abs(item.totalDiscrepancy),
  }));

  // Calculate stats
  const totalDiscrepancy = chartData.reduce((sum, item) => sum + item.absDiscrepancy, 0);
  const avgMatchRate = chartData.reduce((sum, item) => sum + item.matchRate, 0) / chartData.length;
  const worstMonth = chartData.reduce((worst, item) =>
    item.absDiscrepancy > (worst?.absDiscrepancy || 0) ? item : worst, chartData[0]);
  const bestMonth = chartData.reduce((best, item) =>
    item.matchRate > (best?.matchRate || 0) ? item : best, chartData[0]);

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{
      value: number;
      dataKey: string;
      color: string;
      payload: MonthlyDiscrepancy & { displayMonth: string; absDiscrepancy: number };
    }>;
    label?: string;
  }) => {
    if (!active || !payload || !payload.length) return null;

    const monthData = payload[0].payload;

    return (
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '12px',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        direction: 'rtl',
        minWidth: '180px',
      }}>
        <div style={{
          fontWeight: 'bold',
          marginBottom: '10px',
          color: '#374151',
          fontSize: '14px',
          paddingBottom: '8px',
          borderBottom: '1px solid #e5e7eb',
        }}>
          {label}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#6b7280' }}>סכום הפרשים:</span>
            <span style={{ fontWeight: '600', color: '#dc2626' }}>
              {formatCurrency(monthData.totalDiscrepancy)}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#6b7280' }}>חשבונות עם הפרש:</span>
            <span style={{ fontWeight: '600' }}>{monthData.accountsWithDiscrepancy}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#6b7280' }}>אחוז התאמה:</span>
            <span style={{
              fontWeight: '600',
              color: monthData.matchRate >= 95 ? '#10b981' : monthData.matchRate >= 80 ? '#f59e0b' : '#dc2626',
            }}>
              {monthData.matchRate.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ direction: 'rtl' }}>
      {/* Header with Stats */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
      }}>
        <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
          מגמת הפרשים לאורך השנה
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '0.75rem',
        marginBottom: '1rem',
      }}>
        <div style={{
          padding: '0.75rem',
          backgroundColor: '#fef2f2',
          borderRadius: '8px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '11px', color: '#dc2626' }}>סה"כ הפרשים</div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#b91c1c' }}>
            {formatCurrency(totalDiscrepancy)}
          </div>
        </div>
        <div style={{
          padding: '0.75rem',
          backgroundColor: avgMatchRate >= 90 ? '#ecfdf5' : '#fef3c7',
          borderRadius: '8px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '11px', color: '#6b7280' }}>ממוצע התאמה</div>
          <div style={{
            fontSize: '14px',
            fontWeight: 'bold',
            color: avgMatchRate >= 90 ? '#047857' : '#d97706',
          }}>
            {avgMatchRate.toFixed(1)}%
          </div>
        </div>
        <div style={{
          padding: '0.75rem',
          backgroundColor: '#fef2f2',
          borderRadius: '8px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '11px', color: '#6b7280' }}>חודש בעייתי</div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#b91c1c' }}>
            {worstMonth?.displayMonth}
          </div>
        </div>
        <div style={{
          padding: '0.75rem',
          backgroundColor: '#ecfdf5',
          borderRadius: '8px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '11px', color: '#6b7280' }}>חודש טוב ביותר</div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#047857' }}>
            {bestMonth?.displayMonth}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ direction: 'ltr' }}>
        <ResponsiveContainer width="100%" height={height}>
          <ComposedChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="displayMonth"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis
              yAxisId="left"
              tickFormatter={(value) => {
                if (Math.abs(value) >= 1000) {
                  return `${(value / 1000).toFixed(0)}K`;
                }
                return value.toString();
              }}
              tick={{ fontSize: 11, fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
              label={{
                value: 'סכום הפרש',
                angle: -90,
                position: 'insideLeft',
                style: { fontSize: 11, fill: '#6b7280' },
              }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
              tick={{ fontSize: 11, fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
              label={{
                value: 'אחוז התאמה',
                angle: 90,
                position: 'insideRight',
                style: { fontSize: 11, fill: '#6b7280' },
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              height={36}
              formatter={(value: string) => {
                const labels: Record<string, string> = {
                  absDiscrepancy: 'סכום הפרשים',
                  matchRate: 'אחוז התאמה',
                };
                return labels[value] || value;
              }}
            />

            {/* Reference line for 90% match rate target */}
            <ReferenceLine
              yAxisId="right"
              y={90}
              stroke="#10b981"
              strokeDasharray="5 5"
              label={{
                value: 'יעד 90%',
                position: 'right',
                fill: '#10b981',
                fontSize: 10,
              }}
            />

            {/* Discrepancy bars */}
            <Bar
              yAxisId="left"
              dataKey="absDiscrepancy"
              fill="#fca5a5"
              radius={[4, 4, 0, 0]}
              onMouseEnter={(_, index) => setHoveredMonth(chartData[index].month)}
              onMouseLeave={() => setHoveredMonth(null)}
            >
              {chartData.map((entry, index) => (
                <rect
                  key={`bar-${index}`}
                  fill={
                    entry.matchRate >= 95 ? '#bbf7d0' :
                    entry.matchRate >= 80 ? '#fef08a' :
                    '#fecaca'
                  }
                />
              ))}
            </Bar>

            {/* Match rate line */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="matchRate"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{
                fill: '#3b82f6',
                strokeWidth: 2,
                r: 5,
              }}
              activeDot={{
                r: 7,
                stroke: '#3b82f6',
                strokeWidth: 2,
                fill: 'white',
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Status Indicators */}
      <div style={{
        display: 'flex',
        gap: '8px',
        justifyContent: 'center',
        marginTop: '1rem',
        flexWrap: 'wrap',
      }}>
        {chartData.map((month) => (
          <div
            key={month.month}
            onClick={() => onMonthClick?.(month.month)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              borderRadius: '16px',
              backgroundColor: month.matchRate >= 95 ? '#ecfdf5' :
                              month.matchRate >= 80 ? '#fef3c7' : '#fef2f2',
              border: hoveredMonth === month.month ? '2px solid #3b82f6' : '1px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {month.matchRate >= 95 ? (
              <CheckCircle size={12} color="#10b981" />
            ) : (
              <AlertCircle size={12} color={month.matchRate >= 80 ? '#f59e0b' : '#ef4444'} />
            )}
            <span style={{ fontSize: '11px', fontWeight: '500' }}>
              {month.displayMonth}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiscrepancyTimeline;
