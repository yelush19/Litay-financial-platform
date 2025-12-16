import { TenantList } from '@/features/admin';

export function AdminTenantsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ניהול לקוחות</h1>
        <p className="text-gray-600">צפייה וניהול כל הלקוחות בפלטפורמה</p>
      </div>

      <TenantList />
    </div>
  );
}
