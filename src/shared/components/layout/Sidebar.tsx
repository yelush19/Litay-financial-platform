import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Upload,
  Settings,
  Users,
  Building2,
  BarChart3,
} from 'lucide-react';
import { useIsPlatformAdmin, useCanEdit } from '@/features/auth';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  requiredPermission?: 'admin' | 'edit' | 'view';
}

export function Sidebar() {
  const isPlatformAdmin = useIsPlatformAdmin();
  const canEdit = useCanEdit();

  const navItems: NavItem[] = [
    { to: '/', label: 'דשבורד', icon: <LayoutDashboard size={20} /> },
    { to: '/reports', label: 'דוחות', icon: <FileText size={20} /> },
    { to: '/analytics', label: 'אנליטיקס', icon: <BarChart3 size={20} /> },
    { to: '/upload', label: 'העלאת נתונים', icon: <Upload size={20} />, requiredPermission: 'edit' },
    { to: '/settings', label: 'הגדרות', icon: <Settings size={20} />, requiredPermission: 'edit' },
  ];

  const adminItems: NavItem[] = [
    { to: '/admin/tenants', label: 'ניהול לקוחות', icon: <Building2 size={20} /> },
    { to: '/admin/users', label: 'ניהול משתמשים', icon: <Users size={20} /> },
  ];

  const filterByPermission = (item: NavItem) => {
    if (!item.requiredPermission) return true;
    if (item.requiredPermission === 'edit') return canEdit;
    if (item.requiredPermission === 'admin') return isPlatformAdmin;
    return true;
  };

  return (
    <aside className="w-64 bg-white border-l border-gray-100 min-h-[calc(100vh-4rem)]">
      <nav className="p-4">
        <ul className="space-y-1">
          {navItems.filter(filterByPermission).map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-lg transition ${
                    isActive
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        {isPlatformAdmin && (
          <>
            <div className="my-4 border-t border-gray-200" />
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase mb-2">
              ניהול פלטפורמה
            </p>
            <ul className="space-y-1">
              {adminItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-2.5 rounded-lg transition ${
                        isActive
                          ? 'bg-[var(--color-primary)] text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`
                    }
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </>
        )}
      </nav>
    </aside>
  );
}
