import React, { useMemo } from 'react';
import type { CashFlowData } from './types';

interface SankeyChartProps {
  data: CashFlowData;
  formatCurrency: (amount: number) => string;
  height?: number;
}

interface FlowItem {
  source: string;
  target: string;
  value: number;
  color: string;
}

const COLORS = {
  income: '#10b981',
  expense: '#ef4444',
  operating: '#3b82f6',
  investing: '#f59e0b',
  financing: '#8b5cf6',
  cash: '#06b6d4',
};

const SankeyChart: React.FC<SankeyChartProps> = ({
  data,
  formatCurrency,
  height = 400,
}) => {
  const flows = useMemo((): FlowItem[] => {
    const items: FlowItem[] = [];

    // Inflows to Operating
    if (data.netIncome > 0) {
      items.push({
        source: 'רווח נקי',
        target: 'פעילות שוטפת',
        value: data.netIncome,
        color: COLORS.income,
      });
    }

    if (data.depreciation > 0) {
      items.push({
        source: 'פחת (לא מזומן)',
        target: 'פעילות שוטפת',
        value: data.depreciation,
        color: COLORS.operating,
      });
    }

    if (data.accountsPayableChange > 0) {
      items.push({
        source: 'עלייה בספקים',
        target: 'פעילות שוטפת',
        value: data.accountsPayableChange,
        color: COLORS.operating,
      });
    }

    // Outflows from Operating
    if (data.accountsReceivableChange > 0) {
      items.push({
        source: 'פעילות שוטפת',
        target: 'עלייה בלקוחות',
        value: data.accountsReceivableChange,
        color: COLORS.expense,
      });
    }

    if (data.inventoryChange > 0) {
      items.push({
        source: 'פעילות שוטפת',
        target: 'עלייה במלאי',
        value: data.inventoryChange,
        color: COLORS.expense,
      });
    }

    // Operating to Cash
    if (data.operatingCashFlow > 0) {
      items.push({
        source: 'פעילות שוטפת',
        target: 'יתרת מזומן',
        value: data.operatingCashFlow,
        color: COLORS.cash,
      });
    } else if (data.operatingCashFlow < 0) {
      items.push({
        source: 'יתרת מזומן',
        target: 'פעילות שוטפת',
        value: Math.abs(data.operatingCashFlow),
        color: COLORS.expense,
      });
    }

    // Investing flows
    if (data.investingCashFlow < 0) {
      items.push({
        source: 'יתרת מזומן',
        target: 'השקעות',
        value: Math.abs(data.investingCashFlow),
        color: COLORS.investing,
      });
    } else if (data.investingCashFlow > 0) {
      items.push({
        source: 'מכירת נכסים',
        target: 'יתרת מזומן',
        value: data.investingCashFlow,
        color: COLORS.investing,
      });
    }

    // Financing flows
    if (data.loanProceeds > 0) {
      items.push({
        source: 'קבלת הלוואות',
        target: 'יתרת מזומן',
        value: data.loanProceeds,
        color: COLORS.financing,
      });
    }

    if (data.loanRepayments > 0) {
      items.push({
        source: 'יתרת מזומן',
        target: 'פירעון הלוואות',
        value: data.loanRepayments,
        color: COLORS.financing,
      });
    }

    return items.filter(item => item.value > 0);
  }, [data]);

  // Calculate positions for simple flow visualization
  const totalInflow = flows
    .filter(f => f.target === 'יתרת מזומן' || f.target === 'פעילות שוטפת')
    .reduce((sum, f) => sum + f.value, 0);

  const totalOutflow = flows
    .filter(f => f.source === 'יתרת מזומן' || f.source === 'פעילות שוטפת')
    .reduce((sum, f) => sum + f.value, 0);

  return (
    <div style={{ direction: 'rtl' }}>
      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1rem',
        marginBottom: '1.5rem',
      }}>
        <div style={{
          padding: '1rem',
          backgroundColor: '#ecfdf5',
          borderRadius: '8px',
          border: '1px solid #10b981',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '12px', color: '#059669', marginBottom: '4px' }}>
            כניסות
          </div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#047857' }}>
            {formatCurrency(totalInflow)}
          </div>
        </div>

        <div style={{
          padding: '1rem',
          backgroundColor: '#fef2f2',
          borderRadius: '8px',
          border: '1px solid #ef4444',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '12px', color: '#dc2626', marginBottom: '4px' }}>
            יציאות
          </div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#b91c1c' }}>
            {formatCurrency(totalOutflow)}
          </div>
        </div>

        <div style={{
          padding: '1rem',
          backgroundColor: data.netCashChange >= 0 ? '#ecfdf5' : '#fef2f2',
          borderRadius: '8px',
          border: `1px solid ${data.netCashChange >= 0 ? '#10b981' : '#ef4444'}`,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
            שינוי נטו
          </div>
          <div style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: data.netCashChange >= 0 ? '#047857' : '#b91c1c',
          }}>
            {formatCurrency(data.netCashChange)}
          </div>
        </div>
      </div>

      {/* Flow Visualization */}
      <div style={{
        backgroundColor: '#f9fafb',
        borderRadius: '12px',
        padding: '1.5rem',
        minHeight: height,
      }}>
        <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>
          תזרים מזומנים - זרימות עיקריות
        </div>

        {/* Inflows Section */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            fontSize: '13px',
            fontWeight: '600',
            color: '#059669',
            marginBottom: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <span style={{ fontSize: '16px' }}>↓</span>
            כניסות למזומן
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {flows
              .filter(f => f.target === 'יתרת מזומן' || f.target === 'פעילות שוטפת')
              .map((flow, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{
                    width: `${Math.min(Math.max((flow.value / totalInflow) * 100, 10), 80)}%`,
                    height: '28px',
                    backgroundColor: flow.color,
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 12px',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: '500',
                    minWidth: '150px',
                  }}>
                    <span>{flow.source}</span>
                    <span>{formatCurrency(flow.value)}</span>
                  </div>
                  <span style={{ fontSize: '16px', color: '#10b981' }}>→</span>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>{flow.target}</span>
                </div>
              ))}
          </div>
        </div>

        {/* Outflows Section */}
        <div>
          <div style={{
            fontSize: '13px',
            fontWeight: '600',
            color: '#dc2626',
            marginBottom: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <span style={{ fontSize: '16px' }}>↑</span>
            יציאות מהמזומן
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {flows
              .filter(f => f.source === 'יתרת מזומן' || f.source === 'פעילות שוטפת')
              .map((flow, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}
                >
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>{flow.source}</span>
                  <span style={{ fontSize: '16px', color: '#ef4444' }}>→</span>
                  <div style={{
                    width: `${Math.min(Math.max((flow.value / (totalOutflow || 1)) * 100, 10), 80)}%`,
                    height: '28px',
                    backgroundColor: flow.color,
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 12px',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: '500',
                    minWidth: '150px',
                  }}>
                    <span>{flow.target}</span>
                    <span>{formatCurrency(flow.value)}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Cash Balance */}
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: '#06b6d4',
          borderRadius: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: 'white',
        }}>
          <div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>יתרת מזומן</div>
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '4px' }}>
              <div>
                <span style={{ fontSize: '11px', opacity: 0.8 }}>פתיחה: </span>
                <span style={{ fontWeight: '600' }}>{formatCurrency(data.openingCash)}</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', opacity: 0.8 }}>סגירה: </span>
                <span style={{ fontWeight: '600' }}>{formatCurrency(data.closingCash)}</span>
              </div>
            </div>
          </div>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
          }}>
            {data.netCashChange >= 0 ? '+' : ''}{formatCurrency(data.netCashChange)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SankeyChart;
