import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Building2, Wallet, ArrowUpDown } from 'lucide-react';
import WaterfallChart from './WaterfallChart';
import SankeyChart from './SankeyChart';
import BankTrendChart from './BankTrendChart';
import type { CashFlowData, CashFlowSummary, MonthlyBalance } from './types';

interface CashFlowReportProps {
  balances: MonthlyBalance[];
  activeMonths: number[];
  year: number;
  formatCurrency: (amount: number) => string;
}

const MONTH_NAMES = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];

// Account type classifications for cash flow
const ACCOUNT_CLASSIFICATIONS = {
  cash: [1000, 1100, 1200], // קופות ובנקים
  bank: [1300, 1400, 1500],
  customers: [1600, 1700], // לקוחות
  suppliers: [2000, 2100, 2200], // ספקים
  inventory: [1800, 1900],
  fixedAssets: [1001, 1002],
  loans: [2500, 2600],
};

const CashFlowReport: React.FC<CashFlowReportProps> = ({
  balances,
  activeMonths,
  year,
  formatCurrency,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<number>(
    activeMonths[activeMonths.length - 1] || 12
  );
  const [viewMode, setViewMode] = useState<'waterfall' | 'sankey' | 'trend'>('waterfall');

  // Calculate cash flow data for selected month
  const cashFlowData = useMemo((): CashFlowData => {
    const prevMonth = selectedMonth - 1;

    // Helper to get balance change
    const getBalanceChange = (accountTypes: number[]): number => {
      return balances
        .filter(b => b.month === selectedMonth && accountTypes.some(type =>
          b.accountKey.toString().startsWith(type.toString())
        ))
        .reduce((sum, b) => sum + b.change, 0);
    };

    const getOpeningBalance = (accountTypes: number[]): number => {
      return balances
        .filter(b => b.month === selectedMonth && accountTypes.some(type =>
          b.accountKey.toString().startsWith(type.toString())
        ))
        .reduce((sum, b) => sum + b.openingBalance, 0);
    };

    const getClosingBalance = (accountTypes: number[]): number => {
      return balances
        .filter(b => b.month === selectedMonth && accountTypes.some(type =>
          b.accountKey.toString().startsWith(type.toString())
        ))
        .reduce((sum, b) => sum + b.closingBalance, 0);
    };

    // Calculate components
    const customersChange = getBalanceChange(ACCOUNT_CLASSIFICATIONS.customers);
    const suppliersChange = getBalanceChange(ACCOUNT_CLASSIFICATIONS.suppliers);
    const inventoryChange = getBalanceChange(ACCOUNT_CLASSIFICATIONS.inventory);
    const cashChange = getBalanceChange([...ACCOUNT_CLASSIFICATIONS.cash, ...ACCOUNT_CLASSIFICATIONS.bank]);
    const fixedAssetsChange = getBalanceChange(ACCOUNT_CLASSIFICATIONS.fixedAssets);
    const loansChange = getBalanceChange(ACCOUNT_CLASSIFICATIONS.loans);

    // Estimate net income from P&L accounts (simplified)
    const netIncome = cashChange + customersChange - suppliersChange;

    // Operating cash flow (indirect method)
    const operatingCashFlow = netIncome - customersChange + suppliersChange - inventoryChange;

    // Investing (simplified - based on fixed assets)
    const investingCashFlow = -fixedAssetsChange;

    // Financing (simplified - based on loans)
    const financingCashFlow = loansChange;

    const openingCash = getOpeningBalance([...ACCOUNT_CLASSIFICATIONS.cash, ...ACCOUNT_CLASSIFICATIONS.bank]);
    const closingCash = getClosingBalance([...ACCOUNT_CLASSIFICATIONS.cash, ...ACCOUNT_CLASSIFICATIONS.bank]);

    return {
      netIncome,
      depreciation: 0, // Would come from fixed assets schedule
      accountsReceivableChange: customersChange,
      inventoryChange,
      accountsPayableChange: suppliersChange,
      otherOperating: 0,
      operatingCashFlow,

      propertyPurchase: fixedAssetsChange > 0 ? fixedAssetsChange : 0,
      propertySale: fixedAssetsChange < 0 ? -fixedAssetsChange : 0,
      investmentPurchase: 0,
      investmentSale: 0,
      investingCashFlow,

      loanProceeds: loansChange > 0 ? loansChange : 0,
      loanRepayments: loansChange < 0 ? -loansChange : 0,
      dividendsPaid: 0,
      equityIssued: 0,
      financingCashFlow,

      netCashChange: closingCash - openingCash,
      openingCash,
      closingCash,
    };
  }, [balances, selectedMonth]);

  // Calculate monthly summaries for trend
  const monthlySummaries = useMemo((): CashFlowSummary[] => {
    return activeMonths.map(month => {
      const monthBalances = balances.filter(b => b.month === month);

      const cashAccounts = [...ACCOUNT_CLASSIFICATIONS.cash, ...ACCOUNT_CLASSIFICATIONS.bank];
      const closingBalance = monthBalances
        .filter(b => cashAccounts.some(type => b.accountKey.toString().startsWith(type.toString())))
        .reduce((sum, b) => sum + b.closingBalance, 0);

      // Simplified calculations
      const customersChange = monthBalances
        .filter(b => ACCOUNT_CLASSIFICATIONS.customers.some(type => b.accountKey.toString().startsWith(type.toString())))
        .reduce((sum, b) => sum + b.change, 0);

      const suppliersChange = monthBalances
        .filter(b => ACCOUNT_CLASSIFICATIONS.suppliers.some(type => b.accountKey.toString().startsWith(type.toString())))
        .reduce((sum, b) => sum + b.change, 0);

      return {
        month,
        year,
        operating: suppliersChange - customersChange,
        investing: 0,
        financing: 0,
        netChange: monthBalances.reduce((sum, b) => sum + b.change, 0),
        closingBalance,
      };
    });
  }, [balances, activeMonths, year]);

  // Stats cards
  const stats = useMemo(() => {
    const currentCash = cashFlowData.closingCash;
    const prevMonthData = monthlySummaries.find(s => s.month === selectedMonth - 1);
    const cashChange = currentCash - (prevMonthData?.closingBalance || cashFlowData.openingCash);
    const changePercent = prevMonthData?.closingBalance
      ? ((cashChange / prevMonthData.closingBalance) * 100).toFixed(1)
      : '0';

    return [
      {
        title: 'יתרת מזומן',
        value: currentCash,
        icon: Wallet,
        color: '#06b6d4',
        bgColor: '#ecfeff',
      },
      {
        title: 'תזרים שוטף',
        value: cashFlowData.operatingCashFlow,
        icon: Building2,
        color: cashFlowData.operatingCashFlow >= 0 ? '#10b981' : '#ef4444',
        bgColor: cashFlowData.operatingCashFlow >= 0 ? '#ecfdf5' : '#fef2f2',
      },
      {
        title: 'שינוי חודשי',
        value: cashFlowData.netCashChange,
        subValue: `${changePercent}%`,
        icon: cashFlowData.netCashChange >= 0 ? TrendingUp : TrendingDown,
        color: cashFlowData.netCashChange >= 0 ? '#10b981' : '#ef4444',
        bgColor: cashFlowData.netCashChange >= 0 ? '#ecfdf5' : '#fef2f2',
      },
      {
        title: 'תזרים מימון',
        value: cashFlowData.financingCashFlow,
        icon: DollarSign,
        color: '#8b5cf6',
        bgColor: '#f5f3ff',
      },
    ];
  }, [cashFlowData, monthlySummaries, selectedMonth]);

  return (
    <div style={{ direction: 'rtl', padding: '1.5rem' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>
            דוח תזרים מזומנים
          </h1>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>
            ניתוח תזרימי מזומנים לשנת {year}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {/* Month selector */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              fontSize: '14px',
              backgroundColor: 'white',
              cursor: 'pointer',
            }}
          >
            {activeMonths.map(month => (
              <option key={month} value={month}>
                {MONTH_NAMES[month - 1]}
              </option>
            ))}
          </select>

          {/* View mode toggle */}
          <div style={{
            display: 'flex',
            backgroundColor: '#f3f4f6',
            borderRadius: '8px',
            padding: '4px',
          }}>
            {[
              { id: 'waterfall', label: 'Waterfall' },
              { id: 'sankey', label: 'זרימות' },
              { id: 'trend', label: 'מגמה' },
            ].map(mode => (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id as typeof viewMode)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  backgroundColor: viewMode === mode.id ? 'white' : 'transparent',
                  color: viewMode === mode.id ? '#111827' : '#6b7280',
                  boxShadow: viewMode === mode.id ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1rem',
        marginBottom: '1.5rem',
      }}>
        {stats.map((stat, index) => (
          <div
            key={index}
            style={{
              padding: '1.25rem',
              backgroundColor: stat.bgColor,
              borderRadius: '12px',
              border: `1px solid ${stat.color}20`,
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '0.75rem',
            }}>
              <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>
                {stat.title}
              </span>
              <stat.icon size={20} color={stat.color} />
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: stat.color }}>
              {formatCurrency(stat.value)}
            </div>
            {stat.subValue && (
              <div style={{ fontSize: '12px', color: stat.color, marginTop: '4px' }}>
                {stat.value >= 0 ? '+' : ''}{stat.subValue}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Chart Area */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        padding: '1.5rem',
      }}>
        <div style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#111827',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <ArrowUpDown size={18} />
          {viewMode === 'waterfall' && `תזרים מזומנים - ${MONTH_NAMES[selectedMonth - 1]} ${year}`}
          {viewMode === 'sankey' && `זרימות מזומנים - ${MONTH_NAMES[selectedMonth - 1]} ${year}`}
          {viewMode === 'trend' && `מגמת יתרות מזומן - ${year}`}
        </div>

        {viewMode === 'waterfall' && (
          <WaterfallChart
            data={cashFlowData}
            formatCurrency={formatCurrency}
            height={450}
          />
        )}

        {viewMode === 'sankey' && (
          <SankeyChart
            data={cashFlowData}
            formatCurrency={formatCurrency}
            height={400}
          />
        )}

        {viewMode === 'trend' && (
          <BankTrendChart
            data={monthlySummaries}
            formatCurrency={formatCurrency}
            height={400}
            showComponents={true}
          />
        )}
      </div>

      {/* Detailed Breakdown Table */}
      <div style={{
        marginTop: '1.5rem',
        backgroundColor: 'white',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '1rem 1.5rem',
          backgroundColor: '#f9fafb',
          borderBottom: '1px solid #e5e7eb',
          fontWeight: '600',
          fontSize: '15px',
        }}>
          פירוט תזרים - {MONTH_NAMES[selectedMonth - 1]} {year}
        </div>

        <table style={{ width: '100%', fontSize: '14px' }}>
          <tbody>
            {/* Operating Section */}
            <tr style={{ backgroundColor: '#ecfdf5' }}>
              <td colSpan={2} style={{ padding: '12px 16px', fontWeight: '600', color: '#059669' }}>
                פעילות שוטפת
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
              <td style={{ padding: '10px 24px' }}>רווח נקי</td>
              <td style={{ padding: '10px 16px', textAlign: 'left', fontWeight: '500' }}>
                {formatCurrency(cashFlowData.netIncome)}
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
              <td style={{ padding: '10px 24px' }}>שינוי בלקוחות</td>
              <td style={{ padding: '10px 16px', textAlign: 'left', fontWeight: '500', color: cashFlowData.accountsReceivableChange <= 0 ? '#059669' : '#dc2626' }}>
                {formatCurrency(-cashFlowData.accountsReceivableChange)}
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
              <td style={{ padding: '10px 24px' }}>שינוי בספקים</td>
              <td style={{ padding: '10px 16px', textAlign: 'left', fontWeight: '500', color: cashFlowData.accountsPayableChange >= 0 ? '#059669' : '#dc2626' }}>
                {formatCurrency(cashFlowData.accountsPayableChange)}
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
              <td style={{ padding: '10px 24px' }}>שינוי במלאי</td>
              <td style={{ padding: '10px 16px', textAlign: 'left', fontWeight: '500', color: cashFlowData.inventoryChange <= 0 ? '#059669' : '#dc2626' }}>
                {formatCurrency(-cashFlowData.inventoryChange)}
              </td>
            </tr>
            <tr style={{ backgroundColor: '#d1fae5', fontWeight: '600' }}>
              <td style={{ padding: '12px 16px' }}>סה"כ פעילות שוטפת</td>
              <td style={{ padding: '12px 16px', textAlign: 'left', color: cashFlowData.operatingCashFlow >= 0 ? '#047857' : '#b91c1c' }}>
                {formatCurrency(cashFlowData.operatingCashFlow)}
              </td>
            </tr>

            {/* Investing Section */}
            <tr style={{ backgroundColor: '#fef3c7' }}>
              <td colSpan={2} style={{ padding: '12px 16px', fontWeight: '600', color: '#d97706' }}>
                פעילות השקעה
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
              <td style={{ padding: '10px 24px' }}>רכישת נכסים</td>
              <td style={{ padding: '10px 16px', textAlign: 'left', fontWeight: '500', color: '#dc2626' }}>
                {formatCurrency(-cashFlowData.propertyPurchase)}
              </td>
            </tr>
            <tr style={{ backgroundColor: '#fde68a', fontWeight: '600' }}>
              <td style={{ padding: '12px 16px' }}>סה"כ פעילות השקעה</td>
              <td style={{ padding: '12px 16px', textAlign: 'left', color: cashFlowData.investingCashFlow >= 0 ? '#047857' : '#b91c1c' }}>
                {formatCurrency(cashFlowData.investingCashFlow)}
              </td>
            </tr>

            {/* Financing Section */}
            <tr style={{ backgroundColor: '#ede9fe' }}>
              <td colSpan={2} style={{ padding: '12px 16px', fontWeight: '600', color: '#7c3aed' }}>
                פעילות מימון
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
              <td style={{ padding: '10px 24px' }}>קבלת הלוואות</td>
              <td style={{ padding: '10px 16px', textAlign: 'left', fontWeight: '500', color: '#059669' }}>
                {formatCurrency(cashFlowData.loanProceeds)}
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
              <td style={{ padding: '10px 24px' }}>פירעון הלוואות</td>
              <td style={{ padding: '10px 16px', textAlign: 'left', fontWeight: '500', color: '#dc2626' }}>
                {formatCurrency(-cashFlowData.loanRepayments)}
              </td>
            </tr>
            <tr style={{ backgroundColor: '#ddd6fe', fontWeight: '600' }}>
              <td style={{ padding: '12px 16px' }}>סה"כ פעילות מימון</td>
              <td style={{ padding: '12px 16px', textAlign: 'left', color: cashFlowData.financingCashFlow >= 0 ? '#047857' : '#b91c1c' }}>
                {formatCurrency(cashFlowData.financingCashFlow)}
              </td>
            </tr>

            {/* Summary */}
            <tr style={{ backgroundColor: '#0891b2', color: 'white', fontWeight: '600' }}>
              <td style={{ padding: '14px 16px', fontSize: '15px' }}>שינוי נטו במזומנים</td>
              <td style={{ padding: '14px 16px', textAlign: 'left', fontSize: '18px' }}>
                {formatCurrency(cashFlowData.netCashChange)}
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
              <td style={{ padding: '10px 16px', color: '#6b7280' }}>יתרת פתיחה</td>
              <td style={{ padding: '10px 16px', textAlign: 'left' }}>
                {formatCurrency(cashFlowData.openingCash)}
              </td>
            </tr>
            <tr style={{ backgroundColor: '#f0fdfa', fontWeight: '600' }}>
              <td style={{ padding: '14px 16px', fontSize: '15px', color: '#0f766e' }}>יתרת סגירה</td>
              <td style={{ padding: '14px 16px', textAlign: 'left', fontSize: '18px', color: '#0f766e' }}>
                {formatCurrency(cashFlowData.closingCash)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CashFlowReport;
