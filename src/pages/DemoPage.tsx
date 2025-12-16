import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Phone,
  Mail,
  MapPin,
  Shield,
  Zap,
  Award,
  Calendar,
  Users,
  Building2,
  CheckCircle,
  ChevronDown,
} from 'lucide-react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart as RechartsPie,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';

// פלטת צבעים רשמית של ליתאי
const LITAY = {
  primaryDark: '#2d5f3f',
  primary: '#528163',
  primaryLight: '#8dd1bb',
  darkGreen: '#17320b',
  neutralDark: '#2d3436',
  neutralMedium: '#636e72',
  neutralLight: '#b2bec3',
  neutralBg: '#f5f6fa',
  white: '#ffffff',
  success: '#27ae60',
  warning: '#f39c12',
  error: '#e74c3c',
  info: '#3498db'
};

// Demo data
const monthlyData = [
  { month: 'ינו׳', income: 285000, expenses: 195000, profit: 90000 },
  { month: 'פבר׳', income: 312000, expenses: 208000, profit: 104000 },
  { month: 'מרץ', income: 298000, expenses: 187000, profit: 111000 },
  { month: 'אפר׳', income: 345000, expenses: 225000, profit: 120000 },
  { month: 'מאי', income: 378000, expenses: 245000, profit: 133000 },
  { month: 'יוני', income: 356000, expenses: 232000, profit: 124000 },
  { month: 'יולי', income: 389000, expenses: 248000, profit: 141000 },
  { month: 'אוג׳', income: 412000, expenses: 265000, profit: 147000 },
  { month: 'ספט׳', income: 398000, expenses: 258000, profit: 140000 },
  { month: 'אוק׳', income: 425000, expenses: 275000, profit: 150000 },
  { month: 'נוב׳', income: 445000, expenses: 285000, profit: 160000 },
  { month: 'דצמ׳', income: 468000, expenses: 298000, profit: 170000 },
];

const expenseCategories = [
  { name: 'שכר והטבות', value: 45, color: '#528163' },
  { name: 'שכירות ואחזקה', value: 18, color: '#8dd1bb' },
  { name: 'שיווק ופרסום', value: 12, color: '#2d5f3f' },
  { name: 'ספקים', value: 15, color: '#17320b' },
  { name: 'הוצאות משרד', value: 5, color: '#636e72' },
  { name: 'אחר', value: 5, color: '#b2bec3' },
];

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const tabs = [
  { id: 'dashboard', label: 'סקירה כללית', icon: BarChart3 },
  { id: 'reports', label: 'דוחות', icon: FileText },
  { id: 'analytics', label: 'ניתוחים', icon: PieChart },
];

export function DemoPage() {
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [selectedYear] = useState(2024);

  const totalIncome = monthlyData.reduce((sum, m) => sum + m.income, 0);
  const totalExpenses = monthlyData.reduce((sum, m) => sum + m.expenses, 0);
  const totalProfit = totalIncome - totalExpenses;
  const profitMargin = ((totalProfit / totalIncome) * 100).toFixed(1);

  return (
    <div
      className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100"
      dir="rtl"
      style={{ fontFamily: 'Assistant, Heebo, Arial Hebrew, sans-serif' }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-50 w-full"
        style={{
          background: `linear-gradient(135deg, ${LITAY.primary} 0%, ${LITAY.primaryDark} 100%)`,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
        }}
      >
        <div className="max-w-[1920px] mx-auto px-8">
          <div className="flex items-center justify-between py-4">
            {/* Logo & Title */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white p-2 shadow-lg hover:shadow-xl transition-all hover:scale-105">
                <img src="/LITAYLOGO.png" alt="Litay Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white drop-shadow-md">InsightFlow</h1>
                <p className="text-sm text-white/90 italic font-medium">by Litay</p>
              </div>
            </div>

            {/* Demo Badge */}
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-lg border border-white/30">
                <span className="text-white font-medium">גרסת הדגמה</span>
              </div>
              <a
                href="/login"
                className="px-6 py-2 bg-white text-primary font-bold rounded-lg hover:bg-white/90 transition-all shadow-lg"
                style={{ color: LITAY.primaryDark }}
              >
                התחבר למערכת
              </a>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 pb-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = selectedTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className="flex items-center gap-2 px-6 py-3 rounded-t-xl transition-all font-semibold relative overflow-hidden group"
                  style={{
                    backgroundColor: isActive ? LITAY.white : 'transparent',
                    color: isActive ? LITAY.primaryDark : LITAY.white,
                    boxShadow: isActive ? '0 -4px 10px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  {!isActive && (
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[1920px] mx-auto px-8 py-6">
        {/* Company Info Banner */}
        <div
          className="mb-6 p-4 rounded-xl flex items-center justify-between"
          style={{
            background: `linear-gradient(90deg, ${LITAY.primaryLight}30 0%, ${LITAY.white} 100%)`,
            border: `1px solid ${LITAY.primaryLight}`
          }}
        >
          <div className="flex items-center gap-4">
            <Building2 size={24} style={{ color: LITAY.primary }} />
            <div>
              <h2 className="font-bold text-lg" style={{ color: LITAY.primaryDark }}>
                חברת הדגמה בע"מ
              </h2>
              <p className="text-sm" style={{ color: LITAY.neutralMedium }}>
                שנת כספים: {selectedYear} | עדכון אחרון: היום, 14:30
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm" style={{ color: LITAY.success }}>
            <CheckCircle size={16} />
            <span>נתונים מעודכנים</span>
          </div>
        </div>

        {/* Content Area */}
        <div
          className="bg-white rounded-xl shadow-lg border border-gray-200"
          style={{ borderRight: `4px solid ${LITAY.primary}` }}
        >
          <div className="p-6">
            {selectedTab === 'dashboard' && (
              <div className="space-y-6">
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-5 rounded-xl" style={{ background: `linear-gradient(135deg, ${LITAY.primaryLight}40 0%, ${LITAY.white} 100%)`, border: `1px solid ${LITAY.primaryLight}` }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium" style={{ color: LITAY.neutralMedium }}>סה"כ הכנסות</p>
                        <p className="text-2xl font-bold mt-1" style={{ color: LITAY.primaryDark }}>{formatCurrency(totalIncome)}</p>
                        <div className="flex items-center gap-1 mt-2 text-sm" style={{ color: LITAY.success }}>
                          <ArrowUpRight size={14} />
                          <span>+18.5% מאשתקד</span>
                        </div>
                      </div>
                      <div className="p-3 rounded-lg" style={{ backgroundColor: `${LITAY.primary}20` }}>
                        <DollarSign size={24} style={{ color: LITAY.primary }} />
                      </div>
                    </div>
                  </div>

                  <div className="p-5 rounded-xl" style={{ background: `linear-gradient(135deg, #fee2e240 0%, ${LITAY.white} 100%)`, border: '1px solid #fecaca' }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium" style={{ color: LITAY.neutralMedium }}>סה"כ הוצאות</p>
                        <p className="text-2xl font-bold mt-1" style={{ color: LITAY.error }}>{formatCurrency(totalExpenses)}</p>
                        <div className="flex items-center gap-1 mt-2 text-sm" style={{ color: LITAY.error }}>
                          <ArrowUpRight size={14} />
                          <span>+12.3% מאשתקד</span>
                        </div>
                      </div>
                      <div className="p-3 rounded-lg" style={{ backgroundColor: '#fee2e2' }}>
                        <TrendingDown size={24} style={{ color: LITAY.error }} />
                      </div>
                    </div>
                  </div>

                  <div className="p-5 rounded-xl" style={{ background: `linear-gradient(135deg, #dbeafe40 0%, ${LITAY.white} 100%)`, border: '1px solid #bfdbfe' }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium" style={{ color: LITAY.neutralMedium }}>רווח נקי</p>
                        <p className="text-2xl font-bold mt-1" style={{ color: LITAY.info }}>{formatCurrency(totalProfit)}</p>
                        <div className="flex items-center gap-1 mt-2 text-sm" style={{ color: LITAY.success }}>
                          <ArrowUpRight size={14} />
                          <span>+24.7% מאשתקד</span>
                        </div>
                      </div>
                      <div className="p-3 rounded-lg" style={{ backgroundColor: '#dbeafe' }}>
                        <TrendingUp size={24} style={{ color: LITAY.info }} />
                      </div>
                    </div>
                  </div>

                  <div className="p-5 rounded-xl" style={{ background: `linear-gradient(135deg, #f3e8ff40 0%, ${LITAY.white} 100%)`, border: '1px solid #e9d5ff' }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium" style={{ color: LITAY.neutralMedium }}>מרווח רווח</p>
                        <p className="text-2xl font-bold mt-1" style={{ color: '#7c3aed' }}>{profitMargin}%</p>
                        <div className="flex items-center gap-1 mt-2 text-sm" style={{ color: LITAY.success }}>
                          <ArrowUpRight size={14} />
                          <span>+5.2% מאשתקד</span>
                        </div>
                      </div>
                      <div className="p-3 rounded-lg" style={{ backgroundColor: '#f3e8ff' }}>
                        <PieChart size={24} style={{ color: '#7c3aed' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Main Chart */}
                  <div className="lg:col-span-2 p-6 rounded-xl border border-gray-200" style={{ backgroundColor: LITAY.neutralBg }}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-lg" style={{ color: LITAY.primaryDark }}>הכנסות מול הוצאות</h3>
                      <select className="px-3 py-1 border border-gray-300 rounded-lg text-sm">
                        <option>2024</option>
                        <option>2023</option>
                      </select>
                    </div>
                    <div style={{ direction: 'ltr' }}>
                      <ResponsiveContainer width="100%" height={300}>
                        <ComposedChart data={monthlyData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                          <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 11 }} />
                          <Tooltip
                            formatter={(value) => formatCurrency(value as number)}
                            contentStyle={{ direction: 'rtl', textAlign: 'right' }}
                          />
                          <Legend />
                          <Bar dataKey="income" name="הכנסות" fill={LITAY.primary} radius={[4, 4, 0, 0]} />
                          <Bar dataKey="expenses" name="הוצאות" fill={LITAY.error} radius={[4, 4, 0, 0]} />
                          <Line type="monotone" dataKey="profit" name="רווח" stroke={LITAY.info} strokeWidth={3} dot={{ fill: LITAY.info, r: 4 }} />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Pie Chart */}
                  <div className="p-6 rounded-xl border border-gray-200" style={{ backgroundColor: LITAY.neutralBg }}>
                    <h3 className="font-bold text-lg mb-4" style={{ color: LITAY.primaryDark }}>התפלגות הוצאות</h3>
                    <div style={{ direction: 'ltr' }}>
                      <ResponsiveContainer width="100%" height={200}>
                        <RechartsPie>
                          <Pie
                            data={expenseCategories}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            dataKey="value"
                          >
                            {expenseCategories.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `${value}%`} />
                        </RechartsPie>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 space-y-2">
                      {expenseCategories.slice(0, 4).map((cat, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                            <span style={{ color: LITAY.neutralDark }}>{cat.name}</span>
                          </div>
                          <span className="font-medium">{cat.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Profit Trend */}
                <div className="p-6 rounded-xl border border-gray-200" style={{ backgroundColor: LITAY.neutralBg }}>
                  <h3 className="font-bold text-lg mb-4" style={{ color: LITAY.primaryDark }}>מגמת רווחיות</h3>
                  <div style={{ direction: 'ltr' }}>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(value) => formatCurrency(value as number)} />
                        <Area type="monotone" dataKey="profit" stroke={LITAY.primary} fill={`${LITAY.primaryLight}60`} strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'reports' && (
              <div className="space-y-6">
                <h3 className="font-bold text-xl" style={{ color: LITAY.primaryDark }}>דוחות זמינים</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { title: 'דוח רווח והפסד', desc: 'דוח היררכי מפורט', icon: FileText },
                    { title: 'מאזן בוחן', desc: 'יתרות חשבונות', icon: BarChart3 },
                    { title: 'תזרים מזומנים', desc: 'תנועות מזומנים', icon: TrendingUp },
                    { title: 'דוח השוואתי', desc: 'השוואה בין תקופות', icon: Calendar },
                    { title: 'דוח לקוחות', desc: 'ניתוח לקוחות', icon: Users },
                    { title: 'דוח ספקים', desc: 'ניתוח ספקים', icon: Building2 },
                  ].map((report, i) => (
                    <div
                      key={i}
                      className="p-5 rounded-xl border border-gray-200 hover:shadow-lg transition-all cursor-pointer group"
                      style={{ backgroundColor: LITAY.white }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="p-3 rounded-lg group-hover:scale-110 transition-transform" style={{ backgroundColor: `${LITAY.primary}15` }}>
                          <report.icon size={24} style={{ color: LITAY.primary }} />
                        </div>
                        <ChevronDown size={20} style={{ color: LITAY.neutralLight }} className="rotate-[-90deg]" />
                      </div>
                      <h4 className="font-bold mt-4" style={{ color: LITAY.primaryDark }}>{report.title}</h4>
                      <p className="text-sm mt-1" style={{ color: LITAY.neutralMedium }}>{report.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedTab === 'analytics' && (
              <div className="text-center py-12">
                <PieChart size={64} className="mx-auto mb-4" style={{ color: LITAY.primaryLight }} />
                <h3 className="font-bold text-xl mb-2" style={{ color: LITAY.primaryDark }}>מודול ניתוחים מתקדמים</h3>
                <p style={{ color: LITAY.neutralMedium }}>התחבר למערכת כדי לגשת לניתוחים מתקדמים</p>
                <a
                  href="/login"
                  className="inline-block mt-6 px-8 py-3 rounded-lg font-bold text-white transition-all hover:scale-105"
                  style={{ backgroundColor: LITAY.primary }}
                >
                  התחבר עכשיו
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 relative overflow-hidden">
        <div className="absolute inset-0" style={{
          background: `linear-gradient(135deg, ${LITAY.primaryDark} 0%, ${LITAY.primary} 50%, ${LITAY.primaryLight} 100%)`,
          opacity: 0.95
        }} />

        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }} />

        <div className="relative max-w-[1920px] mx-auto px-8">
          <div className="grid grid-cols-12 gap-8 py-12">
            {/* Company Info */}
            <div className="col-span-4 space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white p-3 shadow-2xl">
                  <img src="/LITAYLOGO.png" alt="Litay Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">ליתאי</h3>
                  <p className="text-lg text-white/90 font-medium">ניהול שירותים בע"מ</p>
                  <p className="text-sm text-white/80 italic mt-1">Innovation in Balance</p>
                </div>
              </div>
              <p className="text-white/90 text-sm leading-relaxed">
                InsightFlow - פלטפורמת דוחות פיננסיים מתקדמת. ניתוח נתונים חכם, דוחות אינטראקטיביים, ותובנות עסקיות בזמן אמת.
              </p>
              <div className="flex gap-3">
                {[Shield, Zap, Award].map((Icon, i) => (
                  <div key={i} className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-all cursor-pointer hover:scale-110 border border-white/30">
                    <Icon size={20} className="text-white" />
                  </div>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="col-span-3">
              <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-white rounded-full" />
                יכולות המערכת
              </h4>
              <ul className="space-y-3">
                {[
                  "דוחות רווח והפסד",
                  "ניתוח מגמות",
                  "השוואה בין תקופות",
                  "ייצוא לאקסל",
                  "התראות חכמות"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-white/90 text-sm">
                    <CheckCircle size={14} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="col-span-3">
              <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-white rounded-full" />
                יצירת קשר
              </h4>
              <div className="space-y-4">
                {[
                  { icon: MapPin, text: "ישראל" },
                  { icon: Phone, text: "שירותי מזכירות" },
                  { icon: Mail, text: "info@litay.co.il" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-white/90 hover:text-white transition-colors group cursor-pointer">
                    <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-white/30 transition-all border border-white/30">
                      <item.icon size={18} />
                    </div>
                    <span className="text-sm font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="col-span-2">
              <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-white rounded-full" />
                מעוניינים?
              </h4>
              <div className="space-y-3">
                <a
                  href="/login"
                  className="block w-full py-3 rounded-lg bg-white text-center font-bold hover:bg-white/90 transition-all hover:scale-105 shadow-lg"
                  style={{ color: LITAY.primaryDark }}
                >
                  התחל עכשיו
                </a>
                <p className="text-white/80 text-xs text-center">
                  ללא התחייבות · התקנה מהירה
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/20 py-6">
            <div className="flex items-center justify-between text-white/90">
              <div className="flex items-center gap-2 text-sm">
                <span>© 2025</span>
                <span className="font-bold">ליתאי ניהול שירותים בע"מ</span>
                <span>·</span>
                <span>כל הזכויות שמורות</span>
              </div>
              <div className="text-xs">
                <span className="font-semibold">InsightFlow</span> · גרסה 1.0.0
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
