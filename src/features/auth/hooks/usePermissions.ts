import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { ROLE_PERMISSIONS, type UserPermissions } from '@/shared/types';

export function usePermissions(): UserPermissions {
  const { profile } = useAuth();

  return useMemo(() => {
    if (!profile) return {};

    // Merge role-based permissions with custom permissions
    const rolePermissions = ROLE_PERMISSIONS[profile.role] || {};
    return { ...rolePermissions, ...profile.permissions };
  }, [profile]);
}

export function useHasPermission(permission: keyof UserPermissions): boolean {
  const permissions = usePermissions();
  return permissions[permission] === true;
}

export function useIsPlatformAdmin(): boolean {
  const { profile } = useAuth();
  return profile?.role === 'platform_admin';
}

export function useIsTenantAdmin(): boolean {
  const { profile } = useAuth();
  return profile?.role === 'tenant_admin' || profile?.role === 'platform_admin';
}

export function useCanEdit(): boolean {
  const { profile } = useAuth();
  return ['editor', 'tenant_admin', 'platform_admin'].includes(profile?.role || '');
}
