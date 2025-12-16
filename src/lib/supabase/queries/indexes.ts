import { supabase } from '../client';
import type {
  SortCode,
  SortCodeInput,
  AccountIndex,
  AccountIndexInput,
  IndexSyncHistory,
  IndexType,
  SyncSource,
  PLStructure,
  PLStructureItem,
  ReportType,
} from '@/shared/types';

// =====================================================
// SORT CODES
// =====================================================

function mapSortCodeFromDb(row: Record<string, unknown>): SortCode {
  return {
    id: row.id as string,
    tenantId: row.tenant_id as string,
    code: row.code as number,
    name: row.name as string,
    parentCode: row.parent_code as number | null,
    reportType: row.report_type as ReportType | null,
    sortOrder: row.sort_order as number,
    isActive: row.is_active as boolean,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function getSortCodes(tenantId: string): Promise<SortCode[]> {
  const { data, error } = await supabase
    .from('sort_codes')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('is_active', true)
    .order('sort_order');

  if (error || !data) return [];
  return data.map(mapSortCodeFromDb);
}

export async function upsertSortCodes(
  tenantId: string,
  sortCodes: SortCodeInput[]
): Promise<{ added: number; updated: number; errors: string[] }> {
  const errors: string[] = [];
  let added = 0;
  let updated = 0;

  for (const sc of sortCodes) {
    const { data: existing } = await supabase
      .from('sort_codes')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('code', sc.code)
      .single();

    if (existing) {
      const { error } = await supabase
        .from('sort_codes')
        .update({
          name: sc.name,
          parent_code: sc.parentCode,
          report_type: sc.reportType,
          sort_order: sc.sortOrder,
        })
        .eq('id', existing.id);

      if (error) errors.push(`קוד ${sc.code}: ${error.message}`);
      else updated++;
    } else {
      const { error } = await supabase.from('sort_codes').insert({
        tenant_id: tenantId,
        code: sc.code,
        name: sc.name,
        parent_code: sc.parentCode,
        report_type: sc.reportType,
        sort_order: sc.sortOrder || sc.code,
      });

      if (error) errors.push(`קוד ${sc.code}: ${error.message}`);
      else added++;
    }
  }

  return { added, updated, errors };
}

// =====================================================
// ACCOUNTS INDEX
// =====================================================

function mapAccountFromDb(row: Record<string, unknown>): AccountIndex {
  return {
    id: row.id as string,
    tenantId: row.tenant_id as string,
    accountKey: row.account_key as number,
    accountName: row.account_name as string,
    sortCode: row.sort_code as number | null,
    accountType: row.account_type as AccountIndex['accountType'],
    idNumber: row.id_number as string | null,
    address: row.address as string | null,
    city: row.city as string | null,
    phone: row.phone as string | null,
    email: row.email as string | null,
    currentBalance: Number(row.current_balance) || 0,
    balanceDate: row.balance_date as string | null,
    isActive: row.is_active as boolean,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function getAccounts(
  tenantId: string,
  filters?: {
    accountType?: string;
    sortCode?: number;
    searchText?: string;
  }
): Promise<AccountIndex[]> {
  let query = supabase
    .from('accounts_index')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('is_active', true);

  if (filters?.accountType) {
    query = query.eq('account_type', filters.accountType);
  }
  if (filters?.sortCode) {
    query = query.eq('sort_code', filters.sortCode);
  }
  if (filters?.searchText) {
    query = query.or(
      `account_name.ilike.%${filters.searchText}%,id_number.ilike.%${filters.searchText}%`
    );
  }

  const { data, error } = await query.order('account_name');

  if (error || !data) return [];
  return data.map(mapAccountFromDb);
}

export async function getCustomers(tenantId: string): Promise<AccountIndex[]> {
  return getAccounts(tenantId, { accountType: 'customer' });
}

export async function getSuppliers(tenantId: string): Promise<AccountIndex[]> {
  return getAccounts(tenantId, { accountType: 'supplier' });
}

export async function upsertAccounts(
  tenantId: string,
  accounts: AccountIndexInput[]
): Promise<{ added: number; updated: number; errors: string[] }> {
  const errors: string[] = [];
  let added = 0;
  let updated = 0;

  // Process in batches
  const batchSize = 100;
  for (let i = 0; i < accounts.length; i += batchSize) {
    const batch = accounts.slice(i, i + batchSize);

    for (const acc of batch) {
      const { data: existing } = await supabase
        .from('accounts_index')
        .select('id')
        .eq('tenant_id', tenantId)
        .eq('account_key', acc.accountKey)
        .single();

      if (existing) {
        const { error } = await supabase
          .from('accounts_index')
          .update({
            account_name: acc.accountName,
            sort_code: acc.sortCode,
            account_type: acc.accountType,
            id_number: acc.idNumber,
            address: acc.address,
            phone: acc.phone,
            email: acc.email,
            current_balance: acc.currentBalance,
            balance_date: acc.balanceDate,
          })
          .eq('id', existing.id);

        if (error) errors.push(`חשבון ${acc.accountKey}: ${error.message}`);
        else updated++;
      } else {
        const { error } = await supabase.from('accounts_index').insert({
          tenant_id: tenantId,
          account_key: acc.accountKey,
          account_name: acc.accountName,
          sort_code: acc.sortCode,
          account_type: acc.accountType,
          id_number: acc.idNumber,
          address: acc.address,
          phone: acc.phone,
          email: acc.email,
          current_balance: acc.currentBalance || 0,
          balance_date: acc.balanceDate,
        });

        if (error) errors.push(`חשבון ${acc.accountKey}: ${error.message}`);
        else added++;
      }
    }
  }

  return { added, updated, errors };
}

// =====================================================
// P&L STRUCTURE
// =====================================================

export async function getPLStructure(tenantId: string): Promise<PLStructure> {
  const sortCodes = await getSortCodes(tenantId);

  const buildTree = (type: ReportType): PLStructureItem[] => {
    const items = sortCodes
      .filter((sc) => sc.reportType === type && !sc.parentCode)
      .map((sc) => ({
        code: sc.code,
        name: sc.name,
        parentCode: sc.parentCode,
        reportType: sc.reportType!,
        sortOrder: sc.sortOrder,
        accountsCount: 0, // TODO: fetch from accounts_index
        children: sortCodes
          .filter((child) => child.parentCode === sc.code)
          .map((child) => ({
            code: child.code,
            name: child.name,
            parentCode: child.parentCode,
            reportType: child.reportType!,
            sortOrder: child.sortOrder,
            accountsCount: 0,
          })),
      }));

    return items.sort((a, b) => a.sortOrder - b.sortOrder);
  };

  return {
    income: buildTree('income'),
    cogs: buildTree('cogs'),
    operating: buildTree('operating'),
    financial: buildTree('financial'),
  };
}

// =====================================================
// SYNC HISTORY
// =====================================================

export async function logIndexSync(
  tenantId: string,
  indexType: IndexType,
  source: SyncSource,
  result: {
    total: number;
    added: number;
    updated: number;
    deleted?: number;
    status: 'success' | 'partial' | 'failed';
    errorMessage?: string;
  },
  userId?: string
): Promise<void> {
  await supabase.from('index_sync_history').insert({
    tenant_id: tenantId,
    index_type: indexType,
    sync_source: source,
    records_total: result.total,
    records_added: result.added,
    records_updated: result.updated,
    records_deleted: result.deleted || 0,
    status: result.status,
    error_message: result.errorMessage,
    synced_by: userId,
  });
}

export async function getLastSync(
  tenantId: string,
  indexType: IndexType
): Promise<IndexSyncHistory | null> {
  const { data, error } = await supabase
    .from('index_sync_history')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('index_type', indexType)
    .order('synced_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    tenantId: data.tenant_id,
    indexType: data.index_type,
    syncSource: data.sync_source,
    recordsTotal: data.records_total,
    recordsAdded: data.records_added,
    recordsUpdated: data.records_updated,
    recordsDeleted: data.records_deleted,
    status: data.status,
    errorMessage: data.error_message,
    syncedBy: data.synced_by,
    syncedAt: data.synced_at,
  };
}
