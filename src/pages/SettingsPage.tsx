import React, { useState } from 'react';
import {
  Settings,
  User,
  Building2,
  Palette,
  Bell,
  Shield,
  Database,
  Globe,
  Save,
  Check,
} from 'lucide-react';
import { Card, CardHeader } from '@/shared/components/ui';
import { useTenantConfig } from '@/features/tenant';
import { useAuth } from '@/features/auth';

type SettingsTab = 'profile' | 'organization' | 'appearance' | 'notifications' | 'security' | 'data';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const config = useTenantConfig();
  const { user } = useAuth();

  const tabs = [
    { id: 'profile' as const, label: 'פרופיל', icon: User },
    { id: 'organization' as const, label: 'ארגון', icon: Building2 },
    { id: 'appearance' as const, label: 'מראה', icon: Palette },
    { id: 'notifications' as const, label: 'התראות', icon: Bell },
    { id: 'security' as const, label: 'אבטחה', icon: Shield },
    { id: 'data' as const, label: 'נתונים', icon: Database },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">הגדרות</h1>
          <p className="text-gray-600">ניהול הגדרות המערכת והחשבון</p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {saved ? (
            <>
              <Check size={18} />
              נשמר!
            </>
          ) : isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              שומר...
            </>
          ) : (
            <>
              <Save size={18} />
              שמור שינויים
            </>
          )}
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Navigation */}
        <div className="w-56 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-right transition ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <tab.icon size={20} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <Card>
              <CardHeader title="פרופיל משתמש" subtitle="עדכון פרטים אישיים" />
              <div className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                    שנה תמונה
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">שם מלא</label>
                    <input
                      type="text"
                      defaultValue=""
                      placeholder="הזן שם מלא"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">אימייל</label>
                    <input
                      type="email"
                      defaultValue={user?.email || ''}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">טלפון</label>
                    <input
                      type="tel"
                      placeholder="050-0000000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">תפקיד</label>
                    <input
                      type="text"
                      placeholder="מנהל/ת חשבונות"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'organization' && (
            <Card>
              <CardHeader title="הגדרות ארגון" subtitle="פרטי הארגון והחברה" />
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">שם הארגון</label>
                    <input
                      type="text"
                      defaultValue={config?.name || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ח.פ / עוסק מורשה</label>
                    <input
                      type="text"
                      placeholder="123456789"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">אימייל ארגוני</label>
                    <input
                      type="email"
                      placeholder="info@company.co.il"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">טלפון</label>
                    <input
                      type="tel"
                      placeholder="03-0000000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">כתובת</label>
                    <input
                      type="text"
                      placeholder="רחוב, עיר"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">תחילת שנת כספים</label>
                  <select className="w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="1">ינואר</option>
                    <option value="4">אפריל</option>
                    <option value="7">יולי</option>
                    <option value="10">אוקטובר</option>
                  </select>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'appearance' && (
            <Card>
              <CardHeader title="מראה" subtitle="התאמה אישית של הממשק" />
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">צבע ראשי</label>
                  <div className="flex gap-3">
                    {['#528163', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'].map((color) => (
                      <button
                        key={color}
                        className="w-10 h-10 rounded-lg border-2 border-white shadow-md hover:scale-110 transition"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                    <input
                      type="color"
                      defaultValue={config?.colors.primary || '#528163'}
                      className="w-10 h-10 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">שפת ממשק</label>
                  <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 border-2 border-blue-500 bg-blue-50 text-blue-700 rounded-lg">
                      <Globe size={18} />
                      עברית
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                      <Globe size={18} />
                      English
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">פורמט מספרים</label>
                  <select className="w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="he-IL">עברית (1,234.56)</option>
                    <option value="en-US">אנגלית (1,234.56)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">לוגו</label>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400">
                      לוגו
                    </div>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                      העלה לוגו
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader title="התראות" subtitle="הגדרת העדפות התראות" />
              <div className="space-y-4">
                {[
                  { id: 'email_reports', label: 'שליחת דוחות במייל', description: 'קבלת דוחות תקופתיים' },
                  { id: 'email_alerts', label: 'התראות על חריגות', description: 'כשיש חריגה מהתקציב' },
                  { id: 'email_uploads', label: 'אישור העלאת נתונים', description: 'אישור בסיום העלאה' },
                  { id: 'browser', label: 'התראות דפדפן', description: 'התראות בזמן אמת' },
                ].map((setting) => (
                  <div key={setting.id} className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-gray-900">{setting.label}</p>
                      <p className="text-sm text-gray-500">{setting.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <CardHeader title="אבטחה" subtitle="הגדרות אבטחה וסיסמה" />
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">שינוי סיסמה</h3>
                  <div className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">סיסמה נוכחית</label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">סיסמה חדשה</label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">אימות סיסמה חדשה</label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      עדכן סיסמה
                    </button>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">אימות דו-שלבי</h3>
                  <p className="text-gray-600 mb-4">הוסף שכבת אבטחה נוספת לחשבון שלך</p>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    הפעל אימות דו-שלבי
                  </button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'data' && (
            <Card>
              <CardHeader title="ניהול נתונים" subtitle="ייצוא וגיבוי נתונים" />
              <div className="space-y-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">ייצוא נתונים</h3>
                  <p className="text-sm text-blue-700 mb-3">הורד את כל הנתונים שלך בפורמט Excel או CSV</p>
                  <div className="flex gap-3">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      ייצוא ל-Excel
                    </button>
                    <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50">
                      ייצוא ל-CSV
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-medium text-green-900 mb-2">גיבוי אוטומטי</h3>
                  <p className="text-sm text-green-700 mb-3">הנתונים שלך מגובים אוטומטית מדי יום</p>
                  <p className="text-sm text-green-600">גיבוי אחרון: היום, 03:00</p>
                </div>

                <div className="p-4 bg-red-50 rounded-lg">
                  <h3 className="font-medium text-red-900 mb-2">מחיקת נתונים</h3>
                  <p className="text-sm text-red-700 mb-3">מחיקת כל הנתונים היא פעולה בלתי הפיכה</p>
                  <button className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50">
                    מחק את כל הנתונים
                  </button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
