import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Users, FileText, Eye } from 'lucide-react';
import { Card, CardHeader, Button, Table } from '@/shared/components/ui';
import { getAllTenants, createTenant, deleteTenant, getTenantStats } from '@/lib/supabase/queries/tenants';
import type { Tenant, TenantStats } from '@/shared/types';
import { CreateTenantWizard } from './CreateTenantWizard';

export function TenantList() {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [stats, setStats] = useState<TenantStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);

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

  const handleWizardComplete = async (data: {
    name: string;
    slug: string;
    email: string;
  }) => {
    const created = await createTenant({
      name: data.name,
      slug: data.slug,
      email: data.email,
    });

    if (created) {
      setTenants([...tenants, created]);
      navigate('/admin/tenants/' + created.id);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('האם למחוק את הלקוח? פעולה זו לא ניתנת לביטול.')) return;

    const success = await deleteTenant(id);
    if (success) {
      setTenants(tenants.filter((t) => t.id !== id));
    }
  };

  const goToTenant = (tenantId: string) => {
    navigate('/admin/tenants/' + tenantId);
  };

  const columns = [
    {
      key: 'name',
      header: 'שם לקוח',
      render: (tenant: Tenant) => (
        <div
          className="flex items-center gap-3 cursor-pointer hover:opacity-80"
          onClick={() => goToTenant(tenant.id)}
        >
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
      render: (tenant: Tenant) => {
        const tierClass =
          tenant.subscriptionTier === 'enterprise'
            ? 'bg-purple-100 text-purple-800'
            : tenant.subscriptionTier === 'premium'
            ? 'bg-blue-100 text-blue-800'
            : tenant.subscriptionTier === 'standard'
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800';
        return (
          <span className={'px-2 py-1 rounded-full text-xs font-medium ' + tierClass}>
            {tenant.subscriptionTier}
          </span>
        );
      },
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
      render: (tenant: Tenant) => {
        const statusClass = tenant.isActive
          ? 'bg-green-100 text-green-800'
          : 'bg-red-100 text-red-800';
        return (
          <span className={'px-2 py-1 rounded-full text-xs font-medium ' + statusClass}>
            {tenant.isActive ? 'פעיל' : 'מושהה'}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: '',
      render: (tenant: Tenant) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => goToTenant(tenant.id)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition"
            title="צפה בפרטים"
          >
            <Eye size={16} className="text-gray-600" />
          </button>
          <button
            className="p-1.5 hover:bg-gray-100 rounded-lg transition"
            title="ערוך"
          >
            <Edit size={16} className="text-gray-600" />
          </button>
          <button
            onClick={() => handleDelete(tenant.id)}
            className="p-1.5 hover:bg-red-50 rounded-lg transition"
            title="מחק"
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
          subtitle={tenants.length + ' לקוחות במערכת'}
          action={
            <Button onClick={() => setShowWizard(true)}>
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

      <CreateTenantWizard
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        onComplete={handleWizardComplete}
      />
    </div>
  );
}
