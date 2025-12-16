# Financial Platform - פלטפורמת דשבורדים פיננסיים

פלטפורמה Multi-Tenant לניהול דשבורדים פיננסיים עבור משרדי הנהלת חשבונות ולקוחותיהם.

## תכונות עיקריות

- **Multi-Tenant Architecture** - הפרדה מלאה בין לקוחות
- **מערכת הרשאות** - Platform Admin, Tenant Admin, Editor, Viewer
- **העלאת נתונים** - ייבוא CSV עם מיפוי עמודות דינמי
- **דוחות P&L** - היררכי, חודשי, חודש בודד
- **מערכת ביאורים** - הערות והסברים לתנועות
- **ניהול מלאי והתאמות**
- **תמיכה מלאה בעברית** - RTL, פונטים עבריים

## טכנולוגיות

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Auth, Database, RLS)
- **Charts**: Recharts
- **Icons**: Lucide React

## התקנה

```bash
# Clone
git clone <repository-url>
cd financial-platform

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Supabase credentials

# Run development server
npm run dev
```

## הגדרת Supabase

1. צור פרויקט חדש ב-[Supabase](https://supabase.com)
2. הרץ את קובץ המיגרציה: `supabase/migrations/001_create_multi_tenant_schema.sql`
3. העתק את ה-URL וה-anon key לקובץ `.env`

## מבנה הפרויקט

```
src/
├── features/           # תכונות לפי Domain
│   ├── auth/          # אימות והרשאות
│   ├── tenant/        # ניהול Tenant
│   ├── data-management/ # העלאת נתונים
│   ├── reports/       # דוחות
│   └── admin/         # פאנל ניהול
├── shared/            # קוד משותף
│   ├── components/    # רכיבי UI
│   ├── types/         # TypeScript types
│   ├── hooks/         # Custom hooks
│   └── utils/         # פונקציות עזר
├── lib/               # ספריות חיצוניות
│   └── supabase/      # Supabase client & queries
└── pages/             # דפי האפליקציה
```

## סכמת Database

### טבלאות עיקריות
- `tenants` - ארגונים/לקוחות
- `user_profiles` - פרופילי משתמשים
- `transactions` - תנועות פיננסיות
- `balances` - יתרות חשבונות
- `categories` - קטגוריות (P&L structure)
- `biurim` - ביאורים והערות
- `upload_history` - היסטוריית העלאות

### Row Level Security
כל הטבלאות מוגנות ב-RLS policies שמבטיחות הפרדה מלאה בין tenants.

## רמות הרשאות

| Role | יכולות |
|------|--------|
| Platform Admin | ניהול כל הפלטפורמה, יצירת לקוחות |
| Tenant Admin | ניהול הארגון שלו, הזמנת משתמשים |
| Editor | העלאת נתונים, עריכת מלאי וביאורים |
| Viewer | צפייה בדוחות, ייצוא נתונים |

## פיתוח עתידי

- [ ] דוחות P&L מלאים (מהמערכת הקיימת)
- [ ] גרפים ואנליטיקס
- [ ] API integration עם תוכנות הנהלת חשבונות
- [ ] התראות ו-notifications
- [ ] דוחות מותאמים אישית
- [ ] PWA offline support

## רישיון

פרויקט פרטי - כל הזכויות שמורות
