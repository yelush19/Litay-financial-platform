/**
 * Transaction & Financial Data Types
 */

// =====================================================
// TRANSACTION TYPES
// =====================================================

export interface Transaction {
  id: string;
  tenantId: string;
  koteret: number | null;
  sortCode: number | null;
  sortCodeName: string | null;
  accountKey: number | null;
  accountName: string | null;
  amount: number;
  details: string | null;
  transactionDate: string;
  counterAccountName: string | null;
  counterAccountNumber: number | null;
  month: number;
  year: number;
  importBatchId: string | null;
  createdAt: string;
}

export interface TransactionInsertInput {
  tenantId: string;
  koteret?: number;
  sortCode?: number;
  sortCodeName?: string;
  accountKey?: number;
  accountName?: string;
  amount: number;
  details?: string;
  transactionDate: string;
  counterAccountName?: string;
  counterAccountNumber?: number;
  importBatchId?: string;
}

export interface RawTransactionRow {
  [key: string]: string | number;
}

// =====================================================
// BALANCE TYPES
// =====================================================

export interface Balance {
  id: string;
  tenantId: string;
  accountKey: number;
  accountName: string | null;
  month: number;
  year: number;
  openingBalance: number;
  closingBalance: number;
  importBatchId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BalanceInsertInput {
  tenantId: string;
  accountKey: number;
  accountName?: string;
  month: number;
  year: number;
  openingBalance?: number;
  closingBalance?: number;
  importBatchId?: string;
}

// =====================================================
// CATEGORY TYPES
// =====================================================

export type CategoryType = 'income' | 'cogs' | 'operating' | 'financial' | 'other';

export interface Category {
  id: string;
  tenantId: string;
  code: number;
  name: string;
  type: CategoryType | null;
  parentCode: number | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface CategoryInsertInput {
  tenantId: string;
  code: number;
  name: string;
  type?: CategoryType;
  parentCode?: number;
  sortOrder?: number;
}

// =====================================================
// MAPPINGS TYPES
// =====================================================

export interface AccountMapping {
  id: string;
  tenantId: string;
  accountKey: number;
  accountName: string;
  categoryCode: number | null;
  isActive: boolean;
  createdAt: string;
}

export interface VendorMapping {
  id: string;
  tenantId: string;
  vendorKey: number;
  vendorName: string;
  category: string | null;
  isActive: boolean;
  createdAt: string;
}

// =====================================================
// INVENTORY & ADJUSTMENTS
// =====================================================

export type AdjustmentType = 'opening_inventory' | 'closing_inventory' | 'adjustment';

export interface InventoryAdjustment {
  id: string;
  tenantId: string;
  adjustmentType: AdjustmentType;
  categoryCode: number | null;
  month: number | null;
  year: number | null;
  amount: number;
  notes: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryAdjustmentInput {
  tenantId: string;
  adjustmentType: AdjustmentType;
  categoryCode?: number;
  month?: number;
  year?: number;
  amount: number;
  notes?: string;
}

// =====================================================
// BIURIM (NOTES)
// =====================================================

export type BiurType = 'general' | 'variance' | 'audit' | 'correction';

export interface Biur {
  id: string;
  tenantId: string;
  transactionId: string | null;
  categoryCode: number | null;
  accountKey: number | null;
  month: number | null;
  year: number | null;
  noteText: string;
  noteType: BiurType;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BiurInsertInput {
  tenantId: string;
  transactionId?: string;
  categoryCode?: number;
  accountKey?: number;
  month?: number;
  year?: number;
  noteText: string;
  noteType?: BiurType;
}

// =====================================================
// UPLOAD HISTORY
// =====================================================

export type UploadFileType = 'transactions' | 'balances' | 'categories' | 'vendors' | 'accounts';
export type UploadStatus = 'pending' | 'processing' | 'success' | 'partial' | 'failed';

export interface UploadError {
  row: number;
  field?: string;
  message: string;
  value?: unknown;
}

export interface UploadHistory {
  id: string;
  tenantId: string;
  fileName: string;
  fileType: UploadFileType;
  fileSize: number | null;
  rowsTotal: number | null;
  rowsImported: number | null;
  rowsSkipped: number;
  status: UploadStatus;
  errorLog: UploadError[];
  uploadedBy: string | null;
  startedAt: string;
  completedAt: string | null;
}

// =====================================================
// REPORT DATA TYPES
// =====================================================

export interface MonthlyData {
  [month: number]: number;
  total?: number;
}

export interface VendorData {
  key: number;
  name: string;
  data: MonthlyData;
  transactions?: Transaction[];
}

export interface AccountData {
  key: number;
  name: string;
  data: MonthlyData;
  vendors?: VendorData[];
  transactions?: Transaction[];
}

export interface CategoryReportData {
  code: number | string;
  name: string;
  type: CategoryType;
  data: MonthlyData;
  accounts?: AccountData[];
  vendors?: VendorData[];
}

export interface ProcessedReportData {
  months: number[];
  year: number;
  categories: CategoryReportData[];
  totals: {
    revenue: MonthlyData;
    cogs: MonthlyData;
    grossProfit: MonthlyData;
    operating: MonthlyData;
    operatingProfit: MonthlyData;
    financial: MonthlyData;
    netProfit: MonthlyData;
  };
}

// =====================================================
// FILTERS & QUERIES
// =====================================================

export interface TransactionFilters {
  tenantId: string;
  year?: number;
  month?: number;
  sortCodes?: number[];
  accountKeys?: number[];
  minAmount?: number;
  maxAmount?: number;
  dateFrom?: string;
  dateTo?: string;
  searchText?: string;
  excludeCancelled?: boolean;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
