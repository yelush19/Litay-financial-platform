import { supabase } from '../client';
import type { Tenant, TenantCreateInput, TenantUpdateInput, TenantStats } from '@/shared/types';

// Convert snake_case DB fields to camelCase
function mapTenantFromDb(row: Record<string, unknown>): Tenant {
  return {
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    logoUrl: row.logo_url as string | null,
    primaryColor: row.primary_color as string,
    secondaryColor: row.secondary_color as string,
    darkColor: row.dark_color as string,
    accentColor: row.accent_color as string,
    email: row.email as string | null,
    phone: row.phone as string | null,
    address: row.address as string | null,
    settings: row.settings as Tenant['settings'],
    subscriptionTier: row.subscription_tier as Tenant['subscriptionTier'],
    subscriptionStatus: row.subscription_status as Tenant['subscriptionStatus'],
    trialEndsAt: row.trial_ends_at as string | null,
    isActive: row.is_active as boolean,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function getTenantById(id: string): Promise<Tenant | null> {
  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return mapTenantFromDb(data);
}

export async function getTenantBySlug(slug: string): Promise<Tenant | null> {
  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;
  return mapTenantFromDb(data);
}

export async function getAllTenants(): Promise<Tenant[]> {
  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .order('name');

  if (error || !data) return [];
  return data.map(mapTenantFromDb);
}

export async function createTenant(input: TenantCreateInput): Promise<Tenant | null> {
  const { data, error } = await supabase
    .from('tenants')
    .insert({
      name: input.name,
      slug: input.slug,
      logo_url: input.logoUrl,
      primary_color: input.primaryColor,
      secondary_color: input.secondaryColor,
      dark_color: input.darkColor,
      accent_color: input.accentColor,
      email: input.email,
      phone: input.phone,
      address: input.address,
      settings: input.settings,
      subscription_tier: input.subscriptionTier,
    })
    .select()
    .single();

  if (error || !data) return null;

  // Copy default categories to new tenant
  await supabase.rpc('copy_default_categories_to_tenant', { p_tenant_id: data.id });

  return mapTenantFromDb(data);
}

export async function updateTenant(id: string, input: TenantUpdateInput): Promise<Tenant | null> {
  const updateData: Record<string, unknown> = {};

  if (input.name !== undefined) updateData.name = input.name;
  if (input.logoUrl !== undefined) updateData.logo_url = input.logoUrl;
  if (input.primaryColor !== undefined) updateData.primary_color = input.primaryColor;
  if (input.secondaryColor !== undefined) updateData.secondary_color = input.secondaryColor;
  if (input.darkColor !== undefined) updateData.dark_color = input.darkColor;
  if (input.accentColor !== undefined) updateData.accent_color = input.accentColor;
  if (input.email !== undefined) updateData.email = input.email;
  if (input.phone !== undefined) updateData.phone = input.phone;
  if (input.address !== undefined) updateData.address = input.address;
  if (input.settings !== undefined) updateData.settings = input.settings;
  if (input.subscriptionTier !== undefined) updateData.subscription_tier = input.subscriptionTier;
  if (input.subscriptionStatus !== undefined) updateData.subscription_status = input.subscriptionStatus;
  if (input.isActive !== undefined) updateData.is_active = input.isActive;

  const { data, error } = await supabase
    .from('tenants')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error || !data) return null;
  return mapTenantFromDb(data);
}

export async function deleteTenant(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('tenants')
    .delete()
    .eq('id', id);

  return !error;
}

export async function getTenantStats(): Promise<TenantStats[]> {
  const { data, error } = await supabase
    .from('v_tenant_stats')
    .select('*');

  if (error || !data) return [];

  return data.map((row) => ({
    tenantId: row.tenant_id,
    tenantName: row.tenant_name,
    activeUsers: row.active_users,
    totalTransactions: row.total_transactions,
    lastTransactionDate: row.last_transaction_date,
    successfulUploads: row.successful_uploads,
  }));
}
