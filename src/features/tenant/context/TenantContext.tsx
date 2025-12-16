import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { useAuth } from '@/features/auth';
import { getTenantById } from '@/lib/supabase/queries/tenants';
import type { Tenant, TenantConfig, TenantColors, TenantSettings } from '@/shared/types';

interface TenantContextValue {
  tenant: Tenant | null;
  config: TenantConfig | null;
  isLoading: boolean;
  error: string | null;
  refreshTenant: () => Promise<void>;
  applyTheme: (colors: TenantColors) => void;
}

const TenantContext = createContext<TenantContextValue | null>(null);

const DEFAULT_SETTINGS: TenantSettings = {
  locale: 'he-IL',
  currency: 'ILS',
  fiscalYearStart: 1,
  showCancelledTransactions: false,
  defaultReportView: 'monthly',
};

export function TenantProvider({ children }: { children: ReactNode }) {
  const { profile, isAuthenticated } = useAuth();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const applyTheme = useCallback((colors: TenantColors) => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-primary-light', colors.secondary);
    root.style.setProperty('--color-primary-dark', colors.dark);
    root.style.setProperty('--color-accent', colors.accent);
  }, []);

  const loadTenant = useCallback(async () => {
    if (!profile?.tenantId) {
      setTenant(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const tenantData = await getTenantById(profile.tenantId);
      if (tenantData) {
        setTenant(tenantData);
        applyTheme({
          primary: tenantData.primaryColor,
          secondary: tenantData.secondaryColor,
          dark: tenantData.darkColor,
          accent: tenantData.accentColor,
        });
      } else {
        setError('לא נמצא ארגון');
      }
    } catch (err) {
      setError('שגיאה בטעינת פרטי הארגון');
      console.error('Error loading tenant:', err);
    } finally {
      setIsLoading(false);
    }
  }, [profile?.tenantId, applyTheme]);

  const refreshTenant = useCallback(async () => {
    await loadTenant();
  }, [loadTenant]);

  useEffect(() => {
    if (isAuthenticated && profile) {
      loadTenant();
    } else {
      setTenant(null);
      setIsLoading(false);
    }
  }, [isAuthenticated, profile, loadTenant]);

  const config: TenantConfig | null = tenant
    ? {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        logoUrl: tenant.logoUrl,
        colors: {
          primary: tenant.primaryColor,
          secondary: tenant.secondaryColor,
          dark: tenant.darkColor,
          accent: tenant.accentColor,
        },
        settings: { ...DEFAULT_SETTINGS, ...tenant.settings },
      }
    : null;

  const value: TenantContextValue = {
    tenant,
    config,
    isLoading,
    error,
    refreshTenant,
    applyTheme,
  };

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}

export function useTenantConfig() {
  const { config } = useTenant();
  return config;
}

export function useTenantId() {
  const { tenant } = useTenant();
  return tenant?.id ?? null;
}
