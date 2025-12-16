import { useState, useEffect } from 'react';
import { UserPlus, Edit, Trash2, Shield } from 'lucide-react';
import { Card, CardHeader, Button, Table, Modal, Select } from '@/shared/components/ui';
import { getAllUsers, updateUserProfile, assignUserToTenant } from '@/lib/supabase/queries/users';
import { getAllTenants } from '@/lib/supabase/queries/tenants';
import type { UserProfile, Tenant, UserRole } from '@/shared/types';

const ROLE_OPTIONS = [
  { value: 'viewer', label: 'צופה' },
  { value: 'editor', label: 'עורך' },
  { value: 'tenant_admin', label: 'מנהל ארגון' },
  { value: 'platform_admin', label: 'מנהל פלטפורמה' },
];

const ROLE_LABELS: Record<UserRole, string> = {
  viewer: 'צופה',
  editor: 'עורך',
  tenant_admin: 'מנהל ארגון',
  platform_admin: 'מנהל פלטפורמה',
};

export function UserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [selectedTenant, setSelectedTenant] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('viewer');

  const loadData = async () => {
    setIsLoading(true);
    const [usersData, tenantsData] = await Promise.all([
      getAllUsers(),
      getAllTenants(),
    ]);
    setUsers(usersData);
    setTenants(tenantsData);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const getTenantName = (tenantId: string | null) => {
    if (!tenantId) return 'לא משויך';
    return tenants.find((t) => t.id === tenantId)?.name || 'לא ידוע';
  };

  const handleEdit = (user: UserProfile) => {
    setEditingUser(user);
    setSelectedTenant(user.tenantId || '');
    setSelectedRole(user.role);
    setShowEditModal(true);
  };

  const handleSave = async () => {
    if (!editingUser) return;

    // Update role
    await updateUserProfile(editingUser.id, { role: selectedRole });

    // Update tenant assignment if changed
    if (selectedTenant !== editingUser.tenantId) {
      await assignUserToTenant(editingUser.id, selectedTenant, selectedRole);
    }

    await loadData();
    setShowEditModal(false);
    setEditingUser(null);
  };

  const handleToggleActive = async (user: UserProfile) => {
    await updateUserProfile(user.id, { isActive: !user.isActive });
    await loadData();
  };

  const columns = [
    {
      key: 'user',
      header: 'משתמש',
      render: (user: UserProfile) => (
        <div>
          <p className="font-medium">{user.fullName || 'ללא שם'}</p>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
      ),
    },
    {
      key: 'tenant',
      header: 'ארגון',
      render: (user: UserProfile) => (
        <span className="text-gray-600">{getTenantName(user.tenantId)}</span>
      ),
    },
    {
      key: 'role',
      header: 'תפקיד',
      render: (user: UserProfile) => (
        <span className="flex items-center gap-1.5">
          {user.role === 'platform_admin' && (
            <Shield size={14} className="text-purple-600" />
          )}
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              user.role === 'platform_admin'
                ? 'bg-purple-100 text-purple-800'
                : user.role === 'tenant_admin'
                ? 'bg-blue-100 text-blue-800'
                : user.role === 'editor'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {ROLE_LABELS[user.role]}
          </span>
        </span>
      ),
    },
    {
      key: 'status',
      header: 'סטטוס',
      render: (user: UserProfile) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            user.isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {user.isActive ? 'פעיל' : 'מושהה'}
        </span>
      ),
    },
    {
      key: 'lastLogin',
      header: 'כניסה אחרונה',
      render: (user: UserProfile) => (
        <span className="text-sm text-gray-500">
          {user.lastLoginAt
            ? new Date(user.lastLoginAt).toLocaleDateString('he-IL')
            : 'מעולם'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (user: UserProfile) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEdit(user)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition"
          >
            <Edit size={16} className="text-gray-600" />
          </button>
          <button
            onClick={() => handleToggleActive(user)}
            className={`p-1.5 rounded-lg transition ${
              user.isActive ? 'hover:bg-red-50' : 'hover:bg-green-50'
            }`}
          >
            {user.isActive ? (
              <Trash2 size={16} className="text-red-600" />
            ) : (
              <UserPlus size={16} className="text-green-600" />
            )}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="ניהול משתמשים"
          subtitle={`${users.filter((u) => u.isActive).length} משתמשים פעילים מתוך ${users.length}`}
        />

        <Table
          data={users}
          columns={columns}
          keyExtractor={(user) => user.id}
          isLoading={isLoading}
          emptyMessage="אין משתמשים במערכת"
        />
      </Card>

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="עריכת משתמש"
      >
        {editingUser && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">משתמש</p>
              <p className="font-medium">{editingUser.email}</p>
            </div>

            <Select
              label="ארגון"
              options={[
                { value: '', label: 'לא משויך' },
                ...tenants.map((t) => ({ value: t.id, label: t.name })),
              ]}
              value={selectedTenant}
              onChange={(e) => setSelectedTenant(e.target.value)}
            />

            <Select
              label="תפקיד"
              options={ROLE_OPTIONS}
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
            />

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowEditModal(false)}>
                ביטול
              </Button>
              <Button onClick={handleSave}>שמור</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
