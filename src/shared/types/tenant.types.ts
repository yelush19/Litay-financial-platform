/**
 * Tenant (Organization/Client) Types
 * Multi-tenant platform type definitions
 */

// =====================================================
// TENANT TYPES
// =====================================================

export interface TenantColors {
  primary: string;
  secondary: string;
  dark: string;
  accent: string;
}

export interface TenantSettings {
  locale: string;
  currency: string;
  fiscalYearStart: number;
  showCancelledTransactions: boolean;
  defaultReportView: 'hierarchical' | 'monthly' | 'single-month' | 'biurim';
}

export type SubscriptionTier = 'basic' | 'standard' | 'premium' | 'enterprise';
export type SubscriptionStatus = 'active' | 'suspended' | 'cancelled' | 'trial';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  darkColor: string;
  accentColor: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  settings: TenantSettings;
  subscriptionTier: SubscriptionTier;
  subscriptionStatus: SubscriptionStatus;
  trialEndsAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TenantCreateInput {
  name: string;
  slug: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  darkColor?: string;
  accentColor?: string;
  email?: string;
  phone?: string;
  address?: string;
  settings?: Partial<TenantSettings>;
  subscriptionTier?: SubscriptionTier;
}

export interface TenantUpdateInput {
  name?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  darkColor?: string;
  accentColor?: string;
  email?: string;
  phone?: string;
  address?: string;
  settings?: Partial<TenantSettings>;
  subscriptionTier?: SubscriptionTier;
  subscriptionStatus?: SubscriptionStatus;
  isActive?: boolean;
}

export interface TenantConfig {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  colors: TenantColors;
  settings: TenantSettings;
}

// =====================================================
// USER & AUTH TYPES
// =====================================================

export type UserRole = 'platform_admin' | 'tenant_admin' | 'editor' | 'viewer';

export interface UserPermissions {
  canCreateTenant?: boolean;
  canDeleteTenant?: boolean;
  canViewAllTenants?: boolean;
  canManageAllUsers?: boolean;
  canAccessAdminPanel?: boolean;
  canInviteUsers?: boolean;
  canRemoveUsers?: boolean;
  canUploadData?: boolean;
  canEditSettings?: boolean;
  canEditInventory?: boolean;
  canAddBiurim?: boolean;
  canExportData?: boolean;
  canViewReports?: boolean;
}

export interface UserProfile {
  id: string;
  tenantId: string | null;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: UserRole;
  permissions: UserPermissions;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserWithTenant extends UserProfile {
  tenant: Tenant | null;
}

export interface UserCreateInput {
  email: string;
  fullName?: string;
  tenantId: string;
  role?: UserRole;
}

export interface UserUpdateInput {
  fullName?: string;
  avatarUrl?: string;
  role?: UserRole;
  permissions?: Partial<UserPermissions>;
  isActive?: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, UserPermissions> = {
  platform_admin: {
    canCreateTenant: true,
    canDeleteTenant: true,
    canViewAllTenants: true,
    canManageAllUsers: true,
    canAccessAdminPanel: true,
    canInviteUsers: true,
    canRemoveUsers: true,
    canUploadData: true,
    canEditSettings: true,
    canEditInventory: true,
    canAddBiurim: true,
    canExportData: true,
    canViewReports: true,
  },
  tenant_admin: {
    canInviteUsers: true,
    canRemoveUsers: true,
    canUploadData: true,
    canEditSettings: true,
    canEditInventory: true,
    canAddBiurim: true,
    canExportData: true,
    canViewReports: true,
  },
  editor: {
    canUploadData: true,
    canEditInventory: true,
    canAddBiurim: true,
    canExportData: true,
    canViewReports: true,
  },
  viewer: {
    canExportData: true,
    canViewReports: true,
  },
};

// =====================================================
// SUBSCRIPTION LIMITS
// =====================================================

export interface SubscriptionLimits {
  maxUsers: number;
  maxTransactions: number;
  maxStorageGB: number;
  features: string[];
}

export const SUBSCRIPTION_LIMITS: Record<SubscriptionTier, SubscriptionLimits> = {
  basic: {
    maxUsers: 1,
    maxTransactions: 10000,
    maxStorageGB: 1,
    features: ['basic_reports', 'csv_export'],
  },
  standard: {
    maxUsers: 3,
    maxTransactions: 50000,
    maxStorageGB: 5,
    features: ['basic_reports', 'advanced_reports', 'csv_export', 'excel_export', 'biurim'],
  },
  premium: {
    maxUsers: 10,
    maxTransactions: 200000,
    maxStorageGB: 20,
    features: ['basic_reports', 'advanced_reports', 'csv_export', 'excel_export', 'biurim', 'api_access'],
  },
  enterprise: {
    maxUsers: -1,
    maxTransactions: -1,
    maxStorageGB: -1,
    features: ['all'],
  },
};

export interface TenantStats {
  tenantId: string;
  tenantName: string;
  activeUsers: number;
  totalTransactions: number;
  lastTransactionDate: string | null;
  successfulUploads: number;
}
