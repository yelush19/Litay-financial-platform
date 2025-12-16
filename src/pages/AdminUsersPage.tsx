import { UserManagement } from '@/features/admin';

export function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ניהול משתמשים</h1>
        <p className="text-gray-600">צפייה וניהול כל המשתמשים בפלטפורמה</p>
      </div>

      <UserManagement />
    </div>
  );
}
