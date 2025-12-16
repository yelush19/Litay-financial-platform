/**
 * Hashavshevet Index Types
 * Types for index data imported from Hashavshevet
 */

// =====================================================
// SORT CODES (קודי מיון)
// =====================================================

export type ReportType = 'income' | 'cogs' | 'operating' | 'financial' | 'other';

export interface SortCode {
  id: string;
  tenantId: string;
  code: number;
  name: string;
  parentCode: number | null;
  reportType: ReportType | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SortCodeInput {
  code: number;
  name: string;
  parentCode?: number;
  reportType?: ReportType;
  sortOrder?: number;
}

// =====================================================
// ACCOUNTS INDEX (כרטיסי חשבון)
// =====================================================

export type AccountType =
  | 'customer'    // לקוח
  | 'supplier'    // ספק
  | 'bank'        // בנק
  | 'cash'        // קופה
  | 'expense'     // הוצאה
  | 'income'      // הכנסה
  | 'asset'       // נכס
  | 'liability'   // התחייבות
  | 'equity'      // הון
  | 'other';

export interface AccountIndex {
  id: string;
  tenantId: string;
  accountKey: number;
  accountName: string;
  sortCode: number | null;
  accountType: AccountType | null;
  idNumber: string | null;      // ח.פ / ת.ז
  address: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  currentBalance: number;
  balanceDate: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AccountIndexInput {
  accountKey: number;
  accountName: string;
  sortCode?: number;
  accountType?: AccountType;
  idNumber?: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  currentBalance?: number;
  balanceDate?: string;
}

// =====================================================
// DOCUMENT TYPES (סוגי מסמכים)
// =====================================================

export type DocCategory = 'invoice' | 'receipt' | 'credit' | 'debit' | 'journal' | 'other';

export interface DocumentType {
  id: string;
  tenantId: string;
  code: number;
  name: string;
  shortName: string | null;
  docCategory: DocCategory | null;
  affectsBalance: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface DocumentTypeInput {
  code: number;
  name: string;
  shortName?: string;
  docCategory?: DocCategory;
  affectsBalance?: boolean;
}

// =====================================================
// CURRENCIES (מטבעות)
// =====================================================

export interface Currency {
  id: string;
  tenantId: string;
  code: string;           // ILS, USD, EUR
  name: string;
  symbol: string | null;  // ₪, $, €
  exchangeRate: number;
  rateDate: string | null;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
}

// =====================================================
// BRANCHES (סניפים/מחלקות)
// =====================================================

export interface Branch {
  id: string;
  tenantId: string;
  code: number;
  name: string;
  isActive: boolean;
  createdAt: string;
}

// =====================================================
// SYNC HISTORY
// =====================================================

export type IndexType = 'sort_codes' | 'accounts' | 'document_types' | 'currencies' | 'branches';
export type SyncSource = 'hashavshevet_export' | 'manual' | 'api';
export type SyncStatus = 'success' | 'partial' | 'failed';

export interface IndexSyncHistory {
  id: string;
  tenantId: string;
  indexType: IndexType;
  syncSource: SyncSource | null;
  recordsTotal: number | null;
  recordsAdded: number | null;
  recordsUpdated: number | null;
  recordsDeleted: number | null;
  status: SyncStatus;
  errorMessage: string | null;
  syncedBy: string | null;
  syncedAt: string;
}

// =====================================================
// CSV IMPORT MAPPINGS (for Hashavshevet exports)
// =====================================================

export interface HashavshevetExportMapping {
  sortCodes: {
    code: string;        // Column name in CSV
    name: string;
    parentCode?: string;
  };
  accounts: {
    accountKey: string;
    accountName: string;
    sortCode?: string;
    accountType?: string;
    idNumber?: string;
    address?: string;
    phone?: string;
    email?: string;
    balance?: string;
  };
}

// Default column mappings for common Hashavshevet exports
export const DEFAULT_HASHAVSHEVET_MAPPINGS: HashavshevetExportMapping = {
  sortCodes: {
    code: 'קוד מיון',
    name: 'שם קוד מיון',
    parentCode: 'קוד אב',
  },
  accounts: {
    accountKey: 'מפתח',
    accountName: 'שם',
    sortCode: 'קוד מיון',
    accountType: 'סוג',
    idNumber: 'מספר זהות',
    address: 'כתובת',
    phone: 'טלפון',
    email: 'דואר אלקטרוני',
    balance: 'יתרה',
  },
};

// =====================================================
// P&L STRUCTURE
// =====================================================

export interface PLStructureItem {
  code: number;
  name: string;
  parentCode: number | null;
  reportType: ReportType;
  sortOrder: number;
  accountsCount: number;
  children?: PLStructureItem[];
}

export interface PLStructure {
  income: PLStructureItem[];
  cogs: PLStructureItem[];
  operating: PLStructureItem[];
  financial: PLStructureItem[];
}
