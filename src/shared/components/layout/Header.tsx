import { LogOut, Settings, User } from 'lucide-react';
import { useAuth } from '@/features/auth';
import { useTenantConfig } from '@/features/tenant';

export function Header() {
  const { profile, signOut } = useAuth();
  const config = useTenantConfig();

  return (
    <header className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Company Name */}
          <div className="flex items-center gap-3">
            {config?.logoUrl ? (
              <img src={config.logoUrl} alt={config.name} className="h-10 w-auto" />
            ) : (
              <div className="h-10 w-10 bg-[var(--color-primary)] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {config?.name?.charAt(0) || 'F'}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                {config?.name || 'Financial Platform'}
              </h1>
              <p className="text-xs text-gray-500">דשבורד פיננסי</p>
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">
                {profile?.fullName || profile?.email}
              </p>
              <p className="text-xs text-gray-500">
                {profile?.role === 'platform_admin' && 'מנהל פלטפורמה'}
                {profile?.role === 'tenant_admin' && 'מנהל ארגון'}
                {profile?.role === 'editor' && 'עורך'}
                {profile?.role === 'viewer' && 'צופה'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="p-2 hover:bg-gray-100 rounded-lg transition"
                title="הגדרות"
              >
                <Settings size={20} className="text-gray-600" />
              </button>
              <button
                className="p-2 hover:bg-gray-100 rounded-lg transition"
                title="פרופיל"
              >
                <User size={20} className="text-gray-600" />
              </button>
              <button
                onClick={() => signOut()}
                className="p-2 hover:bg-red-50 rounded-lg transition"
                title="התנתק"
              >
                <LogOut size={20} className="text-red-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
