import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  Users,
  Upload,
  FileText,
  Settings,
  BarChart3,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Trash2,
  Plus,
  Download,
  Eye,
} from 'lucide-react';
import { Card, CardHeader, Button, Table } from '@/shared/components/ui';

// Mock data - will be replaced with Supabase queries
const mockTenant = {
  id: '1',
  name: 'חברה לדוגמה בע"מ',
  slug: 'company-example',
  companyId: '514567890',
  email: 'contact@example.com',
  phone: '03-1234567',
  address: 'רחוב הרצל 1, תל אביב',
  primaryColor: '#528163',
  subscriptionTier: 'premium' as const,
  isActive: true,
  createdAt: '2024-01-15',
};

const mockUsers = [
  { id: '1', fullName: 'ישראל ישראלי', email: 'israel@example.com', role: 'admin', lastLogin: '2024-12-15' },
  { id: '2', fullName: 'שרה כהן', email: 'sara@example.com', role: 'viewer', lastLogin: '2024-12-14' },
  { id: '3', fullName: 'דוד לוי', email: 'david@example.com', role: 'viewer', lastLogin: '2024-12-10' },
];

const mockUploads = [
  { id: '1', fileName: 'דוח_רווח_והפסד_2024.xlsx', uploadDate: '2024-12-01', recordCount: 1250, status: 'processed' },
  { id: '2', fileName: 'מאזן_Q3_2024.xlsx', uploadDate: '2024-11-15', recordCount: 890, status: 'processed' },
  { id: '3', fileName: 'תזרים_מזומנים.xlsx', uploadDate: '2024-10-20', recordCount: 560, status: 'processed' },
];

type TabType = 'overview' | 'users' | 'uploads' | 'reports';

export function TenantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [tenant] = useState(mockTenant);
  const [users] = useState(mockUsers);
  const [uploads] = useState(mockUploads);

  const tabs = [
    { id: 'overview' as TabType, label: 'סקירה כללית', icon: Building2 },
    { id: 'users' as TabType, label: 'משתמשים', icon: Users },
    { id: 'uploads' as TabType, label: 'העלאות', icon: Upload },
    { id: 'reports' as TabType, label: 'דוחות', icon: FileText },
  ];

  const userColumns = [
    {
      key: 'name',
      header: 'שם',
      render: (user: typeof mockUsers[0]) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">
            {user.fullName.charAt(0)}
          </div>
          <div>
            <p className="font-medium">{user.fullName}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'הרשאה',
      render: (user: typeof mockUsers[0]) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            user.role === 'admin'
              ? 'bg-purple-100 text-purple-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {user.role === 'admin' ? 'מנהל' : 'צופה'}
        </span>
      ),
    },
    {
      key: 'lastLogin',
      header: 'כניסה אחרונה',
      render: (user: typeof mockUsers[0]) => (
        <span className="text-gray-600">{user.lastLogin}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: () => (
        <div className="flex items-center gap-2">
          <button className="p-1.5 hover:bg-gray-100 rounded-lg transition">
            <Edit size={16} className="text-gray-600" />
          </button>
          <button className="p-1.5 hover:bg-red-50 rounded-lg transition">
            <Trash2 size={16} className="text-red-600" />
          </button>
        </div>
      ),
    },
  ];

  const uploadColumns = [
    {
      key: 'fileName',
      header: 'שם קובץ',
      render: (upload: typeof mockUploads[0]) => (
        <div className="flex items-center gap-3">
          <FileText size={20} className="text-green-600" />
          <span className="font-medium">{upload.fileName}</span>
        </div>
      ),
    },
    {
      key: 'uploadDate',
      header: 'תאריך העלאה',
      render: (upload: typeof mockUploads[0]) => (
        <span className="text-gray-600">{upload.uploadDate}</span>
      ),
    },
    {
      key: 'recordCount',
      header: 'רשומות',
      render: (upload: typeof mockUploads[0]) => (
        <span className="text-gray-600">{upload.recordCount.toLocaleString()}</span>
      ),
    },
    {
      key: 'status',
      header: 'סטטוס',
      render: (upload: typeof mockUploads[0]) => (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          עובד
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: () => (
        <div className="flex items-center gap-2">
          <button className="p-1.5 hover:bg-gray-100 rounded-lg transition">
            <Eye size={16} className="text-gray-600" />
          </button>
          <button className="p-1.5 hover:bg-gray-100 rounded-lg transition">
            <Download size={16} className="text-gray-600" />
          </button>
          <button className="p-1.5 hover:bg-red-50 rounded-lg transition">
            <Trash2 size={16} className="text-red-600" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/tenants')}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowRight size={20} />
        </button>
        <div className="flex items-center gap-4 flex-1">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl"
            style={{ backgroundColor: tenant.primaryColor }}
          >
            {tenant.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{tenant.name}</h1>
            <p className="text-gray-500">{tenant.slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Settings size={18} />
            הגדרות
          </Button>
          <Button>
            <BarChart3 size={18} />
            צפה בדשבורד
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-3 border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-3 gap-6">
          {/* Company Info */}
          <Card className="col-span-2">
            <CardHeader title="פרטי חברה" />
            <div className="p-6 grid grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <Building2 className="text-gray-400" size={20} />
                <div>
                  <p className="text-sm text-gray-500">ח.פ.</p>
                  <p className="font-medium">{tenant.companyId || 'לא צוין'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="text-gray-400" size={20} />
                <div>
                  <p className="text-sm text-gray-500">אימייל</p>
                  <p className="font-medium">{tenant.email || 'לא צוין'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="text-gray-400" size={20} />
                <div>
                  <p className="text-sm text-gray-500">טלפון</p>
                  <p className="font-medium">{tenant.phone || 'לא צוין'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="text-gray-400" size={20} />
                <div>
                  <p className="text-sm text-gray-500">כתובת</p>
                  <p className="font-medium">{tenant.address || 'לא צוין'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="text-gray-400" size={20} />
                <div>
                  <p className="text-sm text-gray-500">תאריך הצטרפות</p>
                  <p className="font-medium">{tenant.createdAt}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Stats */}
          <div className="space-y-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{users.length}</p>
                  <p className="text-sm text-gray-500">משתמשים</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Upload size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{uploads.length}</p>
                  <p className="text-sm text-gray-500">העלאות</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FileText size={20} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {uploads.reduce((acc, u) => acc + u.recordCount, 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">רשומות</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="col-span-3">
            <CardHeader title="פעילות אחרונה" />
            <div className="p-6">
              <div className="space-y-4">
                {uploads.slice(0, 3).map((upload) => (
                  <div
                    key={upload.id}
                    className="flex items-center justify-between py-3 border-b last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <Upload size={16} className="text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">הועלה קובץ: {upload.fileName}</p>
                        <p className="text-sm text-gray-500">{upload.recordCount} רשומות</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">{upload.uploadDate}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'users' && (
        <Card>
          <CardHeader
            title="משתמשים"
            subtitle={`${users.length} משתמשים פעילים`}
            action={
              <Button>
                <Plus size={18} />
                הוסף משתמש
              </Button>
            }
          />
          <Table
            data={users}
            columns={userColumns}
            keyExtractor={(user) => user.id}
          />
        </Card>
      )}

      {activeTab === 'uploads' && (
        <Card>
          <CardHeader
            title="היסטוריית העלאות"
            subtitle={`${uploads.length} קבצים הועלו`}
            action={
              <Button>
                <Upload size={18} />
                העלה קובץ
              </Button>
            }
          />
          <Table
            data={uploads}
            columns={uploadColumns}
            keyExtractor={(upload) => upload.id}
          />
        </Card>
      )}

      {activeTab === 'reports' && (
        <Card>
          <CardHeader title="דוחות" subtitle="דוחות שהופקו עבור הלקוח" />
          <div className="p-12 text-center text-gray-500">
            <FileText size={48} className="mx-auto mb-4 text-gray-300" />
            <p>אין דוחות עדיין</p>
            <p className="text-sm">דוחות יופיעו כאן לאחר העלאת נתונים</p>
          </div>
        </Card>
      )}
    </div>
  );
}
