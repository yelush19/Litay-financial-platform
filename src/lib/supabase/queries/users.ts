import { supabase } from '../client';
import type { UserProfile, UserWithTenant, UserUpdateInput } from '@/shared/types';

function mapUserFromDb(row: Record<string, unknown>): UserProfile {
  return {
    id: row.id as string,
    tenantId: row.tenant_id as string | null,
    email: row.email as string,
    fullName: row.full_name as string | null,
    avatarUrl: row.avatar_url as string | null,
    role: row.role as UserProfile['role'],
    permissions: (row.permissions as UserProfile['permissions']) || {},
    isActive: row.is_active as boolean,
    lastLoginAt: row.last_login_at as string | null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error || !data) return null;
  return mapUserFromDb(data);
}

export async function getUserWithTenant(): Promise<UserWithTenant | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('user_profiles')
    .select(`
      *,
      tenant:tenants(*)
    `)
    .eq('id', user.id)
    .single();

  if (error || !data) return null;

  const profile = mapUserFromDb(data);
  return {
    ...profile,
    tenant: data.tenant ? {
      id: data.tenant.id,
      name: data.tenant.name,
      slug: data.tenant.slug,
      logoUrl: data.tenant.logo_url,
      primaryColor: data.tenant.primary_color,
      secondaryColor: data.tenant.secondary_color,
      darkColor: data.tenant.dark_color,
      accentColor: data.tenant.accent_color,
      email: data.tenant.email,
      phone: data.tenant.phone,
      address: data.tenant.address,
      settings: data.tenant.settings,
      subscriptionTier: data.tenant.subscription_tier,
      subscriptionStatus: data.tenant.subscription_status,
      trialEndsAt: data.tenant.trial_ends_at,
      isActive: data.tenant.is_active,
      createdAt: data.tenant.created_at,
      updatedAt: data.tenant.updated_at,
    } : null,
  };
}

export async function getUsersByTenant(tenantId: string): Promise<UserProfile[]> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('full_name');

  if (error || !data) return [];
  return data.map(mapUserFromDb);
}

export async function getAllUsers(): Promise<UserProfile[]> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .order('email');

  if (error || !data) return [];
  return data.map(mapUserFromDb);
}

export async function updateUserProfile(id: string, input: UserUpdateInput): Promise<UserProfile | null> {
  const updateData: Record<string, unknown> = {};

  if (input.fullName !== undefined) updateData.full_name = input.fullName;
  if (input.avatarUrl !== undefined) updateData.avatar_url = input.avatarUrl;
  if (input.role !== undefined) updateData.role = input.role;
  if (input.permissions !== undefined) updateData.permissions = input.permissions;
  if (input.isActive !== undefined) updateData.is_active = input.isActive;

  const { data, error } = await supabase
    .from('user_profiles')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error || !data) return null;
  return mapUserFromDb(data);
}

export async function assignUserToTenant(userId: string, tenantId: string, role: UserProfile['role'] = 'viewer'): Promise<boolean> {
  const { error } = await supabase
    .from('user_profiles')
    .update({ tenant_id: tenantId, role })
    .eq('id', userId);

  return !error;
}

export async function removeUserFromTenant(userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('user_profiles')
    .update({ tenant_id: null, role: 'viewer' })
    .eq('id', userId);

  return !error;
}

export async function updateLastLogin(userId: string): Promise<void> {
  await supabase
    .from('user_profiles')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', userId);
}
