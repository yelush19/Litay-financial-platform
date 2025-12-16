import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
} from 'lucide-react';
import { Card, CardHeader } from '@/shared/components/ui';

// Demo data generator
const generateMonthlyData = () => {
  const months = ['ינו׳', 'פבר׳', 'מרץ', 'אפר׳', 'מאי', 'יוני', 'יולי', 'אוג׳', 'ספט׳', 'אוק׳', 'נוב׳', 'דצמ׳'];
  return months.map((month, index) => {
    const baseIncome = 100000 + Math.random() * 50000;
    const baseExpenses = 60000 + Math.random() * 30000;
    const lastYearIncome = baseIncome * (0.85 + Math.random() * 0.2);
    const lastYearExpenses = baseExpenses * (0.9 + Math.random() * 0.15);

    return {
      month,
      income: Math.round(baseIncome),
      expenses: Math.round(baseExpenses),
      profit: Math.round(baseIncome - baseExpenses),
      lastYearIncome: Math.round(lastYearIncome),
      lastYearExpenses: Math.round(lastYearExpenses),
      lastYearProfit: Math.round(lastYearIncome - lastYearExpenses),
      cashFlow: Math.round((baseIncome - baseExpenses) * (0.8 + Math.random() * 0.4)),
    };
  });
};

const generateCategoryData = () => [
  { name: 'שכר והטבות', amount: 45000, percentage: 35, trend: 5 },
  { name: 'שכירות ואחזקה', amount: 25000, percentage: 20, trend: -2 },
  { name: 'שיווק ופרסום', amount: 18000, percentage: 14, trend: 12 },
  { name: 'ספקים וחומרי גלם', amount: 22000, percentage: 17, trend: 8 },
  { name: 'הוצאות משרד', amount: 8000, percentage: 6, trend: -5 },
  { name: 'הוצאות מימון', amount: 5000, percentage: 4, trend: 3 },
  { name: 'אחר', amount: 5000, percentage: 4, trend: 0 },
];

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

type ViewMode = 'monthly' | 'quarterly' | 'yearly';
type CompareMode = 'none' | 'lastYear' | 'budget';

export function AnalyticsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('monthly');
  const [compareMode, setCompareMode] = useState<CompareMode>('lastYear');
  const [selectedYear, setSelectedYear] = useState(2024);

  const monthlyData = useMemo(() => generateMonthlyData(), []);
  const categoryData = useMemo(() => generateCategoryData(), []);

  // Calculate summary stats
  const totalIncome = monthlyData.reduce((sum, m) => sum + m.income, 0);
  const totalExpenses = monthlyData.reduce((sum, m) => sum + m.expenses, 0);
  const totalProfit = totalIncome - totalExpenses;
  const avgMonthlyProfit = totalProfit / 12;

  const lastYearTotalIncome = monthlyData.reduce((sum, m) => sum + m.lastYearIncome, 0);
  const incomeGrowth = ((totalIncome - lastYearTotalIncome) / lastYearTotalIncome) * 100;

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ value: number; dataKey: string; color: string; name: string }>;
    label?: string;
  }) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '12px',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        direction: 'rtl',
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#374151' }}>
          {label}
        </div>
        {payload.map((entry, index) => (
          <div key={index} style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '1rem',
            fontSize: '13px',
            marginBottom: '4px',
          }}>
            <span style={{ color: entry.color }}>{entry.name}:</span>
            <span style={{ fontWeight: '600' }}>{formatCurrency(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">אנליטיקס</h1>
          <p className="text-gray-600">ניתוח מגמות וביצועים פיננסיים</p>
        </div>

        <div className="flex gap-3">
          {/* Year Selector */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value={2024}>2024</option>
            <option value={2023}>2023</option>
            <option value={2022}>2022</option>
          </select>

          {/* View Mode */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            {(['monthly', 'quarterly', 'yearly'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-2 text-sm ${
                  viewMode === mode
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {mode === 'monthly' ? 'חודשי' : mode === 'quarterly' ? 'רבעוני' : 'שנתי'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700">סה״כ הכנסות</p>
              <p className="text-2xl font-bold text-green-800">{formatCurrency(totalIncome)}</p>
              <div className="flex items-center gap-1 mt-1">
                <ArrowUpRight size={14} className="text-green-600" />
                <span className="text-sm text-green-600">+{incomeGrowth.toFixed(1)}% מאשתקד</span>
              </div>
            </div>
            <TrendingUp className="text-green-500" size={32} />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700">סה״כ הוצאות</p>
              <p className="text-2xl font-bold text-red-800">{formatCurrency(totalExpenses)}</p>
              <div className="flex items-center gap-1 mt-1">
                <ArrowDownRight size={14} className="text-red-600" />
                <span className="text-sm text-red-600">{((totalExpenses / totalIncome) * 100).toFixed(0)}% מההכנסות</span>
              </div>
            </div>
            <TrendingDown className="text-red-500" size={32} />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700">רווח נקי</p>
              <p className="text-2xl font-bold text-blue-800">{formatCurrency(totalProfit)}</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-sm text-blue-600">מרווח: {((totalProfit / totalIncome) * 100).toFixed(1)}%</span>
              </div>
            </div>
            <Calendar className="text-blue-500" size={32} />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700">ממוצע חודשי</p>
              <p className="text-2xl font-bold text-purple-800">{formatCurrency(avgMonthlyProfit)}</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-sm text-purple-600">רווח לחודש</span>
              </div>
            </div>
            <Filter className="text-purple-500" size={32} />
          </div>
        </Card>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expenses Trend */}
        <Card>
          <CardHeader
            title="הכנסות מול הוצאות"
            subtitle="השוואה חודשית"
          />
          <div style={{ direction: 'ltr' }}>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="income" name="הכנסות" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="הוצאות" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Line
                  type="monotone"
                  dataKey="profit"
                  name="רווח"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Year over Year Comparison */}
        <Card>
          <CardHeader
            title="השוואה לשנה קודמת"
            subtitle="הכנסות - השוואה שנתית"
          />
          <div style={{ direction: 'ltr' }}>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="lastYearIncome"
                  name="אשתקד"
                  fill="#e5e7eb"
                  stroke="#9ca3af"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  name="השנה"
                  fill="#bbf7d0"
                  stroke="#22c55e"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Profit Trend */}
      <Card>
        <CardHeader
          title="מגמת רווחיות"
          subtitle="רווח חודשי לעומת שנה קודמת"
        />
        <div style={{ direction: 'ltr' }}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                tick={{ fontSize: 11 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="profit"
                name="רווח השנה"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7 }}
              />
              <Line
                type="monotone"
                dataKey="lastYearProfit"
                name="רווח אשתקד"
                stroke="#9ca3af"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#9ca3af', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Expense Breakdown */}
      <Card>
        <CardHeader
          title="פירוט הוצאות לפי קטגוריה"
          subtitle="התפלגות ומגמות"
        />
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-right py-3 px-4 font-semibold text-gray-700">קטגוריה</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">סכום</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">אחוז</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">מגמה</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">התפלגות</th>
              </tr>
            </thead>
            <tbody>
              {categoryData.map((category, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{category.name}</td>
                  <td className="py-3 px-4">{formatCurrency(category.amount)}</td>
                  <td className="py-3 px-4">{category.percentage}%</td>
                  <td className="py-3 px-4">
                    <span className={`flex items-center gap-1 ${
                      category.trend > 0 ? 'text-red-600' : category.trend < 0 ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {category.trend > 0 ? <ArrowUpRight size={14} /> : category.trend < 0 ? <ArrowDownRight size={14} /> : null}
                      {category.trend > 0 ? '+' : ''}{category.trend}%
                    </span>
                  </td>
                  <td className="py-3 px-4 w-48">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${category.percentage}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Cash Flow */}
      <Card>
        <CardHeader
          title="תזרים מזומנים"
          subtitle="תנועות מזומנים חודשיות"
        />
        <div style={{ direction: 'ltr' }}>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                tick={{ fontSize: 11 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="cashFlow"
                name="תזרים מזומנים"
                radius={[4, 4, 0, 0]}
              >
                {monthlyData.map((entry, index) => (
                  <rect
                    key={`bar-${index}`}
                    fill={entry.cashFlow >= 0 ? '#22c55e' : '#ef4444'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
