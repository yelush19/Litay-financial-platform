/**
 * Cash Flow Report Types
 */

export interface CashFlowTransaction {
  accountKey: number;
  accountName: string;
  accountType: 'bank' | 'cash' | 'customer' | 'supplier' | 'expense' | 'income' | 'asset' | 'liability' | 'equity' | 'other';
  amount: number;
  month: number;
  year: number;
  details?: string;
  date?: string;
}

export interface CashFlowCategory {
  id: string;
  name: string;
  nameHe: string;
  type: 'operating' | 'investing' | 'financing';
  accounts: number[]; // accountKeys
  color: string;
}

export interface MonthlyBalance {
  accountKey: number;
  accountName: string;
  accountType: string;
  month: number;
  year: number;
  openingBalance: number;
  closingBalance: number;
  change: number;
}

export interface CashFlowData {
  // Operating Activities (פעילות שוטפת)
  netIncome: number;
  depreciation: number;
  accountsReceivableChange: number;  // שינוי בלקוחות
  inventoryChange: number;           // שינוי במלאי
  accountsPayableChange: number;     // שינוי בספקים
  otherOperating: number;
  operatingCashFlow: number;

  // Investing Activities (פעילות השקעה)
  propertyPurchase: number;
  propertySale: number;
  investmentPurchase: number;
  investmentSale: number;
  investingCashFlow: number;

  // Financing Activities (פעילות מימון)
  loanProceeds: number;
  loanRepayments: number;
  dividendsPaid: number;
  equityIssued: number;
  financingCashFlow: number;

  // Summary
  netCashChange: number;
  openingCash: number;
  closingCash: number;
}

export interface WaterfallDataPoint {
  name: string;
  nameHe: string;
  value: number;
  fill: string;
  isTotal?: boolean;
  isSubtotal?: boolean;
  cumulative?: number;
}

export interface SankeyNode {
  name: string;
}

export interface SankeyLink {
  source: number;
  target: number;
  value: number;
}

export interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

export interface CashFlowSummary {
  month: number;
  year: number;
  operating: number;
  investing: number;
  financing: number;
  netChange: number;
  closingBalance: number;
}

export interface AlertConfig {
  id: string;
  type: 'discrepancy' | 'cash_low' | 'cash_high' | 'trend';
  threshold: number;
  severity: 'info' | 'warning' | 'critical';
  message: string;
}

export interface Alert {
  id: string;
  type: AlertConfig['type'];
  severity: AlertConfig['severity'];
  title: string;
  message: string;
  value: number;
  threshold: number;
  accountKey?: number;
  month?: number;
  timestamp: Date;
}
