import { supabase } from '../client';
import type {
  Transaction,
  TransactionInsertInput,
  TransactionFilters,
  PaginatedResult
} from '@/shared/types';

function mapTransactionFromDb(row: Record<string, unknown>): Transaction {
  return {
    id: row.id as string,
    tenantId: row.tenant_id as string,
    koteret: row.koteret as number | null,
    sortCode: row.sort_code as number | null,
    sortCodeName: row.sort_code_name as string | null,
    accountKey: row.account_key as number | null,
    accountName: row.account_name as string | null,
    amount: Number(row.amount),
    details: row.details as string | null,
    transactionDate: row.transaction_date as string,
    counterAccountName: row.counter_account_name as string | null,
    counterAccountNumber: row.counter_account_number as number | null,
    month: row.month as number,
    year: row.year as number,
    importBatchId: row.import_batch_id as string | null,
    createdAt: row.created_at as string,
  };
}

export async function getTransactions(
  filters: TransactionFilters,
  page = 1,
  pageSize = 100
): Promise<PaginatedResult<Transaction>> {
  let query = supabase
    .from('transactions')
    .select('*', { count: 'exact' })
    .eq('tenant_id', filters.tenantId);

  if (filters.year) query = query.eq('year', filters.year);
  if (filters.month) query = query.eq('month', filters.month);
  if (filters.sortCodes?.length) query = query.in('sort_code', filters.sortCodes);
  if (filters.accountKeys?.length) query = query.in('account_key', filters.accountKeys);
  if (filters.minAmount !== undefined) query = query.gte('amount', filters.minAmount);
  if (filters.maxAmount !== undefined) query = query.lte('amount', filters.maxAmount);
  if (filters.dateFrom) query = query.gte('transaction_date', filters.dateFrom);
  if (filters.dateTo) query = query.lte('transaction_date', filters.dateTo);
  if (filters.searchText) {
    query = query.or(`details.ilike.%${filters.searchText}%,account_name.ilike.%${filters.searchText}%`);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await query
    .order('transaction_date', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Error fetching transactions:', error);
    return { data: [], total: 0, page, pageSize, totalPages: 0 };
  }

  const total = count || 0;
  return {
    data: (data || []).map(mapTransactionFromDb),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getTransactionsByPeriod(
  tenantId: string,
  year: number,
  month?: number
): Promise<Transaction[]> {
  let query = supabase
    .from('transactions')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('year', year);

  if (month) query = query.eq('month', month);

  const { data, error } = await query.order('transaction_date');

  if (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }

  return (data || []).map(mapTransactionFromDb);
}

export async function insertTransactions(
  transactions: TransactionInsertInput[]
): Promise<{ inserted: number; errors: string[] }> {
  const errors: string[] = [];
  let inserted = 0;

  // Insert in batches of 1000
  const batchSize = 1000;
  for (let i = 0; i < transactions.length; i += batchSize) {
    const batch = transactions.slice(i, i + batchSize).map((t) => ({
      tenant_id: t.tenantId,
      koteret: t.koteret,
      sort_code: t.sortCode,
      sort_code_name: t.sortCodeName,
      account_key: t.accountKey,
      account_name: t.accountName,
      amount: t.amount,
      details: t.details,
      transaction_date: t.transactionDate,
      counter_account_name: t.counterAccountName,
      counter_account_number: t.counterAccountNumber,
      import_batch_id: t.importBatchId,
    }));

    const { error, data } = await supabase
      .from('transactions')
      .insert(batch)
      .select('id');

    if (error) {
      errors.push(`Batch ${i / batchSize + 1}: ${error.message}`);
    } else {
      inserted += data?.length || 0;
    }
  }

  return { inserted, errors };
}

export async function deleteTransactionsByBatch(batchId: string): Promise<boolean> {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('import_batch_id', batchId);

  return !error;
}

export async function deleteTransactionsByPeriod(
  tenantId: string,
  year: number,
  month?: number
): Promise<boolean> {
  let query = supabase
    .from('transactions')
    .delete()
    .eq('tenant_id', tenantId)
    .eq('year', year);

  if (month) query = query.eq('month', month);

  const { error } = await query;
  return !error;
}

export async function getTransactionSummary(
  tenantId: string,
  year: number
): Promise<{ month: number; income: number; expenses: number; count: number }[]> {
  const { data, error } = await supabase
    .from('v_monthly_pl_summary')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('year', year);

  if (error || !data) return [];

  // Group by month
  const monthlyData = new Map<number, { income: number; expenses: number; count: number }>();

  for (const row of data) {
    const month = row.month as number;
    if (!monthlyData.has(month)) {
      monthlyData.set(month, { income: 0, expenses: 0, count: 0 });
    }
    const entry = monthlyData.get(month)!;
    entry.count += row.transaction_count as number;

    if (row.category_type === 'income') {
      entry.income += Number(row.total_amount);
    } else {
      entry.expenses += Number(row.total_amount);
    }
  }

  return Array.from(monthlyData.entries())
    .map(([month, data]) => ({ month, ...data }))
    .sort((a, b) => a.month - b.month);
}
