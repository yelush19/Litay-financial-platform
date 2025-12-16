import { Card, CardHeader } from '@/shared/components/ui';
import { useTenantConfig } from '@/features/tenant';
import { BarChart3, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

export function DashboardPage() {
  const config = useTenantConfig();

  const stats = [
    {
      label: 'הכנסות החודש',
      value: '₪125,000',
      change: '+12%',
      trend: 'up',
      icon: DollarSign,
    },
    {
      label: 'הוצאות החודש',
      value: '₪87,500',
      change: '+5%',
      trend: 'up',
      icon: TrendingUp,
    },
    {
      label: 'רווח גולמי',
      value: '₪37,500',
      change: '+18%',
      trend: 'up',
      icon: BarChart3,
    },
    {
      label: 'יתרת מזומן',
      value: '₪245,000',
      change: '-3%',
      trend: 'down',
      icon: TrendingDown,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          שלום, ברוכים הבאים ל{config?.name || 'פלטפורמה'}
        </h1>
        <p className="text-gray-600">סקירה כללית של המצב הפיננסי</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold mt-1 number">{stat.value}</p>
                <p
                  className={`text-sm mt-1 ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {stat.change} מהחודש הקודם
                </p>
              </div>
              <div
                className="p-3 rounded-lg"
                style={{ backgroundColor: `${config?.colors.primary}20` }}
              >
                <stat.icon
                  size={24}
                  style={{ color: config?.colors.primary }}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="הכנסות והוצאות" subtitle="12 חודשים אחרונים" />
          <div className="h-64 flex items-center justify-center text-gray-400">
            גרף יוצג כאן
          </div>
        </Card>

        <Card>
          <CardHeader title="התפלגות הוצאות" subtitle="לפי קטגוריה" />
          <div className="h-64 flex items-center justify-center text-gray-400">
            גרף עוגה יוצג כאן
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="פעילות אחרונה" />
        <div className="text-center py-8 text-gray-400">
          אין פעילות אחרונה להצגה
        </div>
      </Card>
    </div>
  );
}
