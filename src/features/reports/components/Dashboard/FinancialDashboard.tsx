import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  BarChart3,
  AlertTriangle,
  RefreshCw,
  Calendar,
  Filter,
} from 'lucide-react';
import KPICards from './KPICards';
import DiscrepancyPieChart from './DiscrepancyPieChart';
import DiscrepancyTimeline from './DiscrepancyTimeline';
import AlertsPanel from './AlertsPanel';
import ExportButton from './ExportButton';
import { CashFlowReport } from '../CashFlow';
import type {
  KPIData,
  DiscrepancySummary,
  DiscrepancyByCode,
  MonthlyDiscrepancy,
  AlertItem,
  ComparisonData,
} from './types';
import type { MonthlyBalance } from '../CashFlow/types';

interface Transaction {
  accountKey: number;
  accountName: string;
  sortCode: number;
  sortCodeName: string;
  amount: number;
  month: number;
}

interface TrialBalanceRecord {
  accountKey: number;
  accountName: string;
  sortCode: number;
  sortCodeName: string;
  months: { [month: number]: number };
}

interface FinancialDashboardProps {
  transactions: Transaction[];
  trialBalance: TrialBalanceRecord[];
  balances: MonthlyBalance[];
  activeMonths: number[];
  year: number;
  formatCurrency: (amount: number) => string;
}

type TabId = 'overview' | 'cashflow' | 'discrepancies' | 'alerts';

const MONTH_NAMES = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];

const FinancialDashboard: React.FC<FinancialDashboardProps> = ({
  transactions,
  trialBalance,
  balances,
  activeMonths,
  year,
  formatCurrency,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [showOnlyDiscrepancies, setShowOnlyDiscrepancies] = useState(true);

  // Calculate comparison data
  const comparisonData = useMemo((): ComparisonData[] => {
    const transactionsByAccount = new Map<number, {
      accountName: string;
      sortCode: number;
      sortCodeName: string;
      monthlyData: { [month: number]: number };
      total: number;
    }>();

    // Aggregate transactions by account and month
    transactions.forEach(tx => {
      if (!transactionsByAccount.has(tx.accountKey)) {
        transactionsByAccount.set(tx.accountKey, {
          accountName: tx.accountName,
          sortCode: tx.sortCode,
          sortCodeName: tx.sortCodeName,
          monthlyData: {},
          total: 0,
        });
      }

      const account = transactionsByAccount.get(tx.accountKey)!;
      account.monthlyData[tx.month] = (account.monthlyData[tx.month] || 0) + tx.amount;
      account.total += tx.amount;
    });

    // Combine with trial balance
    const allAccountKeys = new Set([
      ...transactionsByAccount.keys(),
      ...trialBalance.map(tb => tb.accountKey),
    ]);

    return Array.from(allAccountKeys).map(accountKey => {
      const txData = transactionsByAccount.get(accountKey);
      const tbData = trialBalance.find(tb => tb.accountKey === accountKey);

      const biurimTotal = txData?.total || 0;
      const balanceTotal = tbData
        ? activeMonths.reduce((sum, month) => sum + (tbData.months[month] || 0), 0)
        : 0;

      const monthlyData = activeMonths.map(month => ({
        month,
        biurim: txData?.monthlyData[month] || 0,
        balance: tbData?.months[month] || 0,
        diff: (txData?.monthlyData[month] || 0) - (tbData?.months[month] || 0),
      }));

      return {
        accountKey,
        accountName: txData?.accountName || tbData?.accountName || '',
        sortCode: txData?.sortCode || tbData?.sortCode || 0,
        sortCodeName: txData?.sortCodeName || tbData?.sortCodeName || '',
        biurimTotal,
        balanceTotal,
        difference: biurimTotal - balanceTotal,
        matchRate: balanceTotal !== 0
          ? Math.max(0, 100 - (Math.abs(biurimTotal - balanceTotal) / Math.abs(balanceTotal)) * 100)
          : biurimTotal === 0 ? 100 : 0,
        monthlyData,
      };
    });
  }, [transactions, trialBalance, activeMonths]);

  // Calculate discrepancy summary
  const discrepancySummary = useMemo((): DiscrepancySummary => {
    const discrepancyAccounts = comparisonData.filter(item => Math.abs(item.difference) > 0.01);

    return {
      totalAccounts: comparisonData.length,
      matchedAccounts: comparisonData.length - discrepancyAccounts.length,
      discrepancyAccounts: discrepancyAccounts.length,
      matchRate: comparisonData.length > 0
        ? ((comparisonData.length - discrepancyAccounts.length) / comparisonData.length) * 100
        : 100,
      totalDiscrepancyAmount: discrepancyAccounts.reduce(
        (sum, item) => sum + Math.abs(item.difference), 0
      ),
      criticalCount: discrepancyAccounts.filter(item => Math.abs(item.difference) > 10000).length,
      warningCount: discrepancyAccounts.filter(
        item => Math.abs(item.difference) > 1000 && Math.abs(item.difference) <= 10000
      ).length,
      infoCount: discrepancyAccounts.filter(item => Math.abs(item.difference) <= 1000).length,
    };
  }, [comparisonData]);

  // Discrepancies by sort code
  const discrepanciesByCode = useMemo((): DiscrepancyByCode[] => {
    const byCode = new Map<number, {
      name: string;
      amount: number;
      count: number;
    }>();

    comparisonData
      .filter(item => Math.abs(item.difference) > 0.01)
      .forEach(item => {
        if (!byCode.has(item.sortCode)) {
          byCode.set(item.sortCode, {
            name: item.sortCodeName,
            amount: 0,
            count: 0,
          });
        }

        const code = byCode.get(item.sortCode)!;
        code.amount += Math.abs(item.difference);
        code.count += 1;
      });

    const total = Array.from(byCode.values()).reduce((sum, c) => sum + c.amount, 0);

    return Array.from(byCode.entries())
      .map(([code, data]) => ({
        code,
        name: data.name,
        discrepancyAmount: data.amount,
        discrepancyCount: data.count,
        percentage: total > 0 ? (data.amount / total) * 100 : 0,
        color: '',
      }))
      .sort((a, b) => b.discrepancyAmount - a.discrepancyAmount);
  }, [comparisonData]);

  // Monthly discrepancies
  const monthlyDiscrepancies = useMemo((): MonthlyDiscrepancy[] => {
    return activeMonths.map(month => {
      const monthData = comparisonData.map(item => {
        const md = item.monthlyData.find(m => m.month === month);
        return md ? Math.abs(md.diff) : 0;
      });

      const totalDiscrepancy = monthData.reduce((sum, d) => sum + d, 0);
      const accountsWithDiscrepancy = monthData.filter(d => d > 0.01).length;

      return {
        month,
        monthName: MONTH_NAMES[month - 1],
        totalDiscrepancy,
        accountsWithDiscrepancy,
        matchRate: comparisonData.length > 0
          ? ((comparisonData.length - accountsWithDiscrepancy) / comparisonData.length) * 100
          : 100,
      };
    });
  }, [comparisonData, activeMonths]);

  // Generate alerts
  const alerts = useMemo((): AlertItem[] => {
    const alertList: AlertItem[] = [];

    // Critical discrepancies
    comparisonData
      .filter(item => Math.abs(item.difference) > 10000)
      .forEach(item => {
        alertList.push({
          id: `disc-critical-${item.accountKey}`,
          type: 'critical',
          category: 'discrepancy',
          title: 'הפרש משמעותי',
          message: `נמצא הפרש של ${formatCurrency(Math.abs(item.difference))} בחשבון ${item.accountName}`,
          value: item.difference,
          threshold: 10000,
          accountKey: item.accountKey,
          accountName: item.accountName,
          timestamp: new Date(),
        });
      });

    // Warning discrepancies
    comparisonData
      .filter(item => Math.abs(item.difference) > 1000 && Math.abs(item.difference) <= 10000)
      .slice(0, 5) // Limit to 5
      .forEach(item => {
        alertList.push({
          id: `disc-warning-${item.accountKey}`,
          type: 'warning',
          category: 'discrepancy',
          title: 'הפרש בינוני',
          message: `הפרש של ${formatCurrency(Math.abs(item.difference))} בחשבון ${item.accountName}`,
          value: item.difference,
          threshold: 1000,
          accountKey: item.accountKey,
          accountName: item.accountName,
          timestamp: new Date(),
        });
      });

    // Low match rate months
    monthlyDiscrepancies
      .filter(m => m.matchRate < 80)
      .forEach(m => {
        alertList.push({
          id: `match-${m.month}`,
          type: 'warning',
          category: 'trend',
          title: 'אחוז התאמה נמוך',
          message: `בחודש ${m.monthName} אחוז ההתאמה הוא ${m.matchRate.toFixed(1)}% בלבד`,
          value: m.matchRate,
          threshold: 80,
          month: m.month,
          timestamp: new Date(),
        });
      });

    return alertList.sort((a, b) => {
      const typeOrder = { critical: 0, warning: 1, info: 2 };
      return typeOrder[a.type] - typeOrder[b.type];
    });
  }, [comparisonData, monthlyDiscrepancies, formatCurrency]);

  // KPIs
  const kpis = useMemo((): KPIData[] => {
    const cashBalance = balances
      .filter(b => b.month === activeMonths[activeMonths.length - 1])
      .filter(b => b.accountKey.toString().startsWith('1'))
      .reduce((sum, b) => sum + b.closingBalance, 0);

    const prevMonthCash = balances
      .filter(b => b.month === activeMonths[activeMonths.length - 2])
      .filter(b => b.accountKey.toString().startsWith('1'))
      .reduce((sum, b) => sum + b.closingBalance, 0);

    const cashChange = prevMonthCash !== 0
      ? ((cashBalance - prevMonthCash) / prevMonthCash) * 100
      : 0;

    // Calculate customer days (simplified)
    const customerBalance = balances
      .filter(b => b.month === activeMonths[activeMonths.length - 1])
      .filter(b => b.accountKey.toString().startsWith('16') || b.accountKey.toString().startsWith('17'))
      .reduce((sum, b) => sum + b.closingBalance, 0);

    const revenue = transactions
      .filter(tx => tx.sortCode >= 600 && tx.sortCode < 700)
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

    const customerDays = revenue > 0 ? (customerBalance / (revenue / 365)) : 0;

    // Calculate supplier days (simplified)
    const supplierBalance = balances
      .filter(b => b.month === activeMonths[activeMonths.length - 1])
      .filter(b => b.accountKey.toString().startsWith('20') || b.accountKey.toString().startsWith('21'))
      .reduce((sum, b) => sum + Math.abs(b.closingBalance), 0);

    const cogs = transactions
      .filter(tx => tx.sortCode >= 800 && tx.sortCode < 900)
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

    const supplierDays = cogs > 0 ? (supplierBalance / (cogs / 365)) : 0;

    return [
      {
        id: 'cash',
        title: 'יתרת מזומן',
        value: cashBalance,
        previousValue: prevMonthCash,
        format: 'currency',
        trend: cashChange > 0 ? 'up' : cashChange < 0 ? 'down' : 'stable',
        trendValue: cashChange,
        color: '#06b6d4',
        bgColor: '#ecfeff',
        icon: 'wallet',
      },
      {
        id: 'match-rate',
        title: 'אחוז התאמה',
        value: discrepancySummary.matchRate,
        format: 'percent',
        trend: discrepancySummary.matchRate >= 90 ? 'up' : 'down',
        color: discrepancySummary.matchRate >= 90 ? '#10b981' : '#ef4444',
        bgColor: discrepancySummary.matchRate >= 90 ? '#ecfdf5' : '#fef2f2',
        icon: 'check',
      },
      {
        id: 'discrepancy',
        title: 'סה"כ הפרשים',
        value: discrepancySummary.totalDiscrepancyAmount,
        format: 'currency',
        color: '#ef4444',
        bgColor: '#fef2f2',
        icon: 'alert',
      },
      {
        id: 'customer-days',
        title: 'ימי לקוחות',
        value: customerDays,
        format: 'days',
        trend: customerDays <= 60 ? 'up' : 'down',
        color: '#8b5cf6',
        bgColor: '#f5f3ff',
        icon: 'users',
      },
      {
        id: 'supplier-days',
        title: 'ימי ספקים',
        value: supplierDays,
        format: 'days',
        trend: supplierDays >= 45 ? 'up' : 'down',
        color: '#f59e0b',
        bgColor: '#fffbeb',
        icon: 'truck',
      },
      {
        id: 'alerts-count',
        title: 'התראות פעילות',
        value: alerts.length,
        format: 'number',
        color: alerts.length > 5 ? '#ef4444' : alerts.length > 0 ? '#f59e0b' : '#10b981',
        bgColor: alerts.length > 5 ? '#fef2f2' : alerts.length > 0 ? '#fffbeb' : '#ecfdf5',
        icon: 'alert',
      },
    ];
  }, [balances, transactions, activeMonths, discrepancySummary, alerts]);

  const tabs: { id: TabId; label: string; icon: React.FC<{ size?: number }> }[] = [
    { id: 'overview', label: 'סקירה כללית', icon: LayoutDashboard },
    { id: 'cashflow', label: 'תזרים מזומנים', icon: TrendingUp },
    { id: 'discrepancies', label: 'ניתוח הפרשים', icon: BarChart3 },
    { id: 'alerts', label: 'התראות', icon: AlertTriangle },
  ];

  return (
    <div style={{ direction: 'rtl', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '1rem 1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>
              דשבורד פיננסי
            </h1>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>
              ניתוח תזרים והשוואת ביאורים למאזן בוחן - {year}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {/* Month Filter */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              backgroundColor: '#f3f4f6',
              borderRadius: '8px',
            }}>
              <Calendar size={16} color="#6b7280" />
              <select
                value={selectedMonth || ''}
                onChange={(e) => setSelectedMonth(e.target.value ? Number(e.target.value) : null)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontSize: '14px',
                  color: '#374151',
                  cursor: 'pointer',
                }}
              >
                <option value="">כל החודשים</option>
                {activeMonths.map(month => (
                  <option key={month} value={month}>{MONTH_NAMES[month - 1]}</option>
                ))}
              </select>
            </div>

            {/* Export Button */}
            <ExportButton
              discrepancySummary={discrepancySummary}
              comparisonData={comparisonData}
              alerts={alerts}
              year={year}
              formatCurrency={formatCurrency}
            />
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '4px',
          marginTop: '1rem',
          borderBottom: '1px solid #e5e7eb',
          marginLeft: '-1.5rem',
          marginRight: '-1.5rem',
          paddingLeft: '1.5rem',
          paddingRight: '1.5rem',
        }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
                fontSize: '14px',
                fontWeight: activeTab === tab.id ? '600' : '500',
                color: activeTab === tab.id ? '#3b82f6' : '#6b7280',
                cursor: 'pointer',
                transition: 'all 0.2s',
                marginBottom: '-1px',
              }}
            >
              <tab.icon size={16} />
              {tab.label}
              {tab.id === 'alerts' && alerts.length > 0 && (
                <span style={{
                  padding: '2px 8px',
                  backgroundColor: '#fef2f2',
                  color: '#dc2626',
                  borderRadius: '10px',
                  fontSize: '11px',
                  fontWeight: '600',
                }}>
                  {alerts.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '1.5rem' }}>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            {/* KPIs */}
            <div style={{ marginBottom: '1.5rem' }}>
              <KPICards kpis={kpis} formatCurrency={formatCurrency} />
            </div>

            {/* Charts Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1.5rem',
              marginBottom: '1.5rem',
            }}>
              {/* Pie Chart */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                padding: '1.5rem',
              }}>
                <DiscrepancyPieChart
                  data={discrepanciesByCode}
                  formatCurrency={formatCurrency}
                  height={350}
                />
              </div>

              {/* Timeline */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                padding: '1.5rem',
              }}>
                <DiscrepancyTimeline
                  data={monthlyDiscrepancies}
                  formatCurrency={formatCurrency}
                  height={300}
                  onMonthClick={setSelectedMonth}
                />
              </div>
            </div>

            {/* Alerts */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              padding: '1.5rem',
            }}>
              <AlertsPanel
                alerts={alerts.slice(0, 5)}
                formatCurrency={formatCurrency}
                maxVisible={5}
              />
            </div>
          </div>
        )}

        {/* Cash Flow Tab */}
        {activeTab === 'cashflow' && (
          <CashFlowReport
            balances={balances}
            activeMonths={activeMonths}
            year={year}
            formatCurrency={formatCurrency}
          />
        )}

        {/* Discrepancies Tab */}
        {activeTab === 'discrepancies' && (
          <div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1.5rem',
              marginBottom: '1.5rem',
            }}>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                padding: '1.5rem',
              }}>
                <DiscrepancyPieChart
                  data={discrepanciesByCode}
                  formatCurrency={formatCurrency}
                  height={400}
                />
              </div>

              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                padding: '1.5rem',
              }}>
                <DiscrepancyTimeline
                  data={monthlyDiscrepancies}
                  formatCurrency={formatCurrency}
                  height={350}
                />
              </div>
            </div>

            {/* Detailed Table */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              overflow: 'hidden',
            }}>
              <div style={{
                padding: '1rem 1.5rem',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                  פירוט הפרשים
                </h3>
                <button
                  onClick={() => setShowOnlyDiscrepancies(!showOnlyDiscrepancies)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    backgroundColor: showOnlyDiscrepancies ? '#fef2f2' : '#f3f4f6',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    color: showOnlyDiscrepancies ? '#dc2626' : '#6b7280',
                    cursor: 'pointer',
                  }}
                >
                  <Filter size={14} />
                  {showOnlyDiscrepancies ? 'הפרשים בלבד' : 'הצג הכל'}
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600' }}>מפתח</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600' }}>שם חשבון</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600' }}>קוד מיון</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600' }}>ביאורים</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600' }}>מאזן בוחן</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600' }}>הפרש</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600' }}>סטטוס</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonData
                      .filter(item => !showOnlyDiscrepancies || Math.abs(item.difference) > 0.01)
                      .slice(0, 50)
                      .map((item, index) => (
                        <tr
                          key={item.accountKey}
                          style={{
                            borderBottom: '1px solid #f3f4f6',
                            backgroundColor: index % 2 === 0 ? 'white' : '#fafafa',
                          }}
                        >
                          <td style={{ padding: '10px 16px', fontWeight: '500' }}>
                            {item.accountKey}
                          </td>
                          <td style={{ padding: '10px 16px' }}>{item.accountName}</td>
                          <td style={{ padding: '10px 16px', color: '#6b7280' }}>
                            {item.sortCode} - {item.sortCodeName}
                          </td>
                          <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                            {formatCurrency(item.biurimTotal)}
                          </td>
                          <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                            {formatCurrency(item.balanceTotal)}
                          </td>
                          <td style={{
                            padding: '10px 16px',
                            textAlign: 'center',
                            fontWeight: '600',
                            color: Math.abs(item.difference) < 0.01 ? '#10b981' : '#dc2626',
                          }}>
                            {formatCurrency(item.difference)}
                          </td>
                          <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                            {Math.abs(item.difference) < 0.01 ? (
                              <span style={{ color: '#10b981' }}>✓</span>
                            ) : (
                              <span style={{ color: '#dc2626' }}>✗</span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            padding: '1.5rem',
          }}>
            <AlertsPanel
              alerts={alerts}
              formatCurrency={formatCurrency}
              maxVisible={20}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialDashboard;
