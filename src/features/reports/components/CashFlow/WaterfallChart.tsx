import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import type { CashFlowData, WaterfallDataPoint } from './types';

interface WaterfallChartProps {
  data: CashFlowData;
  formatCurrency: (amount: number) => string;
  height?: number;
}

const COLORS = {
  positive: '#10b981',      // Green
  negative: '#ef4444',      // Red
  subtotal: '#3b82f6',      // Blue
  total: '#8b5cf6',         // Purple
  neutral: '#6b7280',       // Gray
};

const WaterfallChart: React.FC<WaterfallChartProps> = ({
  data,
  formatCurrency,
  height = 500,
}) => {
  const chartData = useMemo((): WaterfallDataPoint[] => {
    let cumulative = data.netIncome;

    const points: WaterfallDataPoint[] = [
      {
        name: 'Net Income',
        nameHe: 'רווח נקי',
        value: data.netIncome,
        fill: data.netIncome >= 0 ? COLORS.positive : COLORS.negative,
        cumulative: data.netIncome,
      },
    ];

    // Operating adjustments
    if (Math.abs(data.depreciation) > 0) {
      cumulative += data.depreciation;
      points.push({
        name: 'Depreciation',
        nameHe: 'פחת',
        value: data.depreciation,
        fill: COLORS.positive,
        cumulative,
      });
    }

    if (Math.abs(data.accountsReceivableChange) > 0) {
      cumulative -= data.accountsReceivableChange; // Increase in AR is negative for cash
      points.push({
        name: 'AR Change',
        nameHe: 'שינוי בלקוחות',
        value: -data.accountsReceivableChange,
        fill: data.accountsReceivableChange <= 0 ? COLORS.positive : COLORS.negative,
        cumulative,
      });
    }

    if (Math.abs(data.inventoryChange) > 0) {
      cumulative -= data.inventoryChange;
      points.push({
        name: 'Inventory',
        nameHe: 'שינוי במלאי',
        value: -data.inventoryChange,
        fill: data.inventoryChange <= 0 ? COLORS.positive : COLORS.negative,
        cumulative,
      });
    }

    if (Math.abs(data.accountsPayableChange) > 0) {
      cumulative += data.accountsPayableChange;
      points.push({
        name: 'AP Change',
        nameHe: 'שינוי בספקים',
        value: data.accountsPayableChange,
        fill: data.accountsPayableChange >= 0 ? COLORS.positive : COLORS.negative,
        cumulative,
      });
    }

    if (Math.abs(data.otherOperating) > 0) {
      cumulative += data.otherOperating;
      points.push({
        name: 'Other Operating',
        nameHe: 'שוטף אחר',
        value: data.otherOperating,
        fill: data.otherOperating >= 0 ? COLORS.positive : COLORS.negative,
        cumulative,
      });
    }

    // Operating subtotal
    points.push({
      name: 'Operating CF',
      nameHe: 'תזרים שוטף',
      value: data.operatingCashFlow,
      fill: COLORS.subtotal,
      isSubtotal: true,
      cumulative: data.operatingCashFlow,
    });

    // Investing
    if (Math.abs(data.investingCashFlow) > 0) {
      cumulative = data.operatingCashFlow + data.investingCashFlow;
      points.push({
        name: 'Investing CF',
        nameHe: 'תזרים השקעות',
        value: data.investingCashFlow,
        fill: data.investingCashFlow >= 0 ? COLORS.positive : COLORS.negative,
        cumulative,
      });
    }

    // Financing
    if (Math.abs(data.financingCashFlow) > 0) {
      cumulative += data.financingCashFlow;
      points.push({
        name: 'Financing CF',
        nameHe: 'תזרים מימון',
        value: data.financingCashFlow,
        fill: data.financingCashFlow >= 0 ? COLORS.positive : COLORS.negative,
        cumulative,
      });
    }

    // Net change total
    points.push({
      name: 'Net Change',
      nameHe: 'שינוי נטו',
      value: data.netCashChange,
      fill: COLORS.total,
      isTotal: true,
      cumulative: data.netCashChange,
    });

    return points;
  }, [data]);

  // Calculate waterfall positions (start and end for each bar)
  const waterfallData = useMemo(() => {
    let runningTotal = 0;

    return chartData.map((item, index) => {
      if (item.isSubtotal || item.isTotal || index === 0) {
        // Reset for subtotals/totals or first item
        const result = {
          ...item,
          start: 0,
          end: item.value,
          displayValue: item.value,
        };
        if (!item.isTotal && !item.isSubtotal) {
          runningTotal = item.value;
        } else if (item.isSubtotal) {
          runningTotal = item.value;
        }
        return result;
      }

      const start = runningTotal;
      const end = runningTotal + item.value;
      runningTotal = end;

      return {
        ...item,
        start: Math.min(start, end),
        end: Math.max(start, end),
        displayValue: item.value,
      };
    });
  }, [chartData]);

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: WaterfallDataPoint & { displayValue: number } }> }) => {
    if (!active || !payload || !payload.length) return null;

    const item = payload[0].payload;

    return (
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '12px',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#374151' }}>
          {item.nameHe}
        </div>
        <div style={{
          color: item.displayValue >= 0 ? COLORS.positive : COLORS.negative,
          fontSize: '16px',
          fontWeight: '600',
        }}>
          {formatCurrency(item.displayValue)}
        </div>
        {item.cumulative !== undefined && !item.isTotal && !item.isSubtotal && (
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
            מצטבר: {formatCurrency(item.cumulative)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ direction: 'ltr' }}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={waterfallData}
          margin={{ top: 30, right: 30, left: 60, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="nameHe"
            tick={{ fontSize: 12, fill: '#374151' }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            tickFormatter={(value) => formatCurrency(value)}
            tick={{ fontSize: 11, fill: '#6b7280' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0} stroke="#9ca3af" strokeWidth={1} />

          {/* Invisible bar for spacing */}
          <Bar dataKey="start" stackId="waterfall" fill="transparent" />

          {/* Actual value bar */}
          <Bar dataKey="displayValue" stackId="waterfall" radius={[4, 4, 0, 0]}>
            {waterfallData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WaterfallChart;
