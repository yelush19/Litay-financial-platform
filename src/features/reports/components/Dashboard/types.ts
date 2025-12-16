/**
 * Dashboard Types
 */

export interface KPIData {
  id: string;
  title: string;
  value: number;
  previousValue?: number;
  format: 'currency' | 'percent' | 'days' | 'number';
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
  color: string;
  bgColor: string;
  icon?: string;
}

export interface DiscrepancySummary {
  totalAccounts: number;
  matchedAccounts: number;
  discrepancyAccounts: number;
  matchRate: number;
  totalDiscrepancyAmount: number;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
}

export interface DiscrepancyByCode {
  code: number;
  name: string;
  discrepancyAmount: number;
  discrepancyCount: number;
  percentage: number;
  color: string;
}

export interface MonthlyDiscrepancy {
  month: number;
  monthName: string;
  totalDiscrepancy: number;
  accountsWithDiscrepancy: number;
  matchRate: number;
}

export interface AlertItem {
  id: string;
  type: 'critical' | 'warning' | 'info';
  category: 'discrepancy' | 'cash' | 'trend' | 'threshold';
  title: string;
  message: string;
  value: number;
  threshold?: number;
  accountKey?: number;
  accountName?: string;
  month?: number;
  timestamp: Date;
  dismissed?: boolean;
}

export interface ComparisonData {
  accountKey: number;
  accountName: string;
  sortCode: number;
  sortCodeName: string;
  biurimTotal: number;
  balanceTotal: number;
  difference: number;
  matchRate: number;
  monthlyData: {
    month: number;
    biurim: number;
    balance: number;
    diff: number;
  }[];
}

export interface DashboardFilters {
  year: number;
  months: number[];
  sortCodes?: number[];
  showOnlyDiscrepancies: boolean;
  minDiscrepancyAmount: number;
}

export interface ExportConfig {
  format: 'excel' | 'csv' | 'pdf';
  sections: ('summary' | 'discrepancies' | 'cashflow' | 'alerts')[];
  includeCharts: boolean;
}
