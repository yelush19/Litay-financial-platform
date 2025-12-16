import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Users, FileText } from 'lucide-react';
import { Card, CardHeader, Button, Table, Modal, Input } from '@/shared/components/ui';
import { getAllTenants, createTenant, deleteTenant, getTenantStats } from '@/lib/supabase/queries/tenants';
import type { Tenant, TenantCreateInput, TenantStats } from '@/shared/types';

export function TenantList() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [stats, setStats] = useState<TenantStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTenant, setNewTenant] = useState<TenantCreateInput>({
    name: '',
    slug: '',
    email: '',
  });

  const loadData = async () => {
    setIsLoading(true);
    const [tenantsData, statsData] = await Promise.all([
      getAllTenants(),
      getTenantStats(),
    ]);
    setTenants(tenantsData);
    setStats(statsData);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const getStatsForTenant = (tenantId: string) => {
    return stats.find((s) => s.tenantId === tenantId);
  };

  const handleCreate = async () => {
    if (!newTenant.name || !newTenant.slug) return;

    setIsCreating(true);
    const created = await createTenant(newTenant);
    if (created) {
      setTenants([...tenants, created]);
      setShowCreateModal(false);
      setNewTenant({ name: '', slug: '', email: '' });
    }
    setIsCreating(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('האם למחוק את הלקוח? פעולה זו לא ניתנת לביטול.')) return;

    const success = await deleteTenant(id);
    if (success) {
      setTenants(tenants.filter((t) => t.id !== id));
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'שם לקוח',
      render: (tenant: Tenant) => (
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: tenant.primaryColor }}
          >
            {tenant.name.charAt(0)}
          </div>
          <div>
            <p className="font-medium">{tenant.name}</p>
            <p className="text-xs text-gray-500">{tenant.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'subscription',
      header: 'מנוי',
      render: (tenant: Tenant) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            tenant.subscriptionTier === 'enterprise'
              ? 'bg-purple-100 text-purple-800'
              : tenant.subscriptionTier === 'premium'
              ? 'bg-blue-100 text-blue-800'
              : tenant.subscriptionTier === 'standard'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {tenant.subscriptionTier}
        </span>
      ),
    },
    {
      key: 'stats',
      header: 'סטטיסטיקה',
      render: (tenant: Tenant) => {
        const tenantStats = getStatsForTenant(tenant.id);
        return (
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Users size={14} />
              {tenantStats?.activeUsers || 0}
            </span>
            <span className="flex items-center gap-1">
              <FileText size={14} />
              {tenantStats?.totalTransactions?.toLocaleString() || 0}
            </span>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'סטטוס',
      render: (tenant: Tenant) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            tenant.isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {tenant.isActive ? 'פעיל' : 'מושהה'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (tenant: Tenant) => (
        <div className="flex items-center gap-2">
          <button className="p-1.5 hover:bg-gray-100 rounded-lg transition">
            <Edit size={16} className="text-gray-600" />
          </button>
          <button
            onClick={() => handleDelete(tenant.id)}
            className="p-1.5 hover:bg-red-50 rounded-lg transition"
          >
            <Trash2 size={16} className="text-red-600" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="ניהול לקוחות"
          subtitle={`${tenants.length} לקוחות במערכת`}
          action={
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus size={18} />
              לקוח חדש
            </Button>
          }
        />

        <Table
          data={tenants}
          columns={columns}
          keyExtractor={(tenant) => tenant.id}
          isLoading={isLoading}
          emptyMessage="אין לקוחות במערכת"
        />
      </Card>

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="יצירת לקוח חדש"
      >
        <div className="space-y-4">
          <Input
            label="שם לקוח"
            value={newTenant.name}
            onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
            placeholder="שם החברה"
          />
          <Input
            label="Slug (לכתובת URL)"
            value={newTenant.slug}
            onChange={(e) =>
              setNewTenant({
                ...newTenant,
                slug: e.target.value.toLowerCase().replace(/\s+/g, '-'),
              })
            }
            placeholder="company-name"
            helperText="ישמש בכתובת: platform.com/company-name"
          />
          <Input
            label="אימייל"
            type="email"
            value={newTenant.email || ''}
            onChange={(e) => setNewTenant({ ...newTenant, email: e.target.value })}
            placeholder="contact@company.com"
          />

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              ביטול
            </Button>
            <Button onClick={handleCreate} isLoading={isCreating}>
              צור לקוח
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
