import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, ProtectedRoute, LoginPage } from '@/features/auth';
import { TenantProvider } from '@/features/tenant';
import { MainLayout } from '@/shared/components/layout';
import {
  DashboardPage,
  ReportsPage,
  UploadPage,
  AdminTenantsPage,
  AdminUsersPage,
} from '@/pages';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TenantProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected routes */}
            <Route
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<DashboardPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/analytics" element={<ComingSoon title="אנליטיקס" />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/settings" element={<ComingSoon title="הגדרות" />} />

              {/* Admin routes */}
              <Route
                path="/admin/tenants"
                element={
                  <ProtectedRoute requiredRoles={['platform_admin']} requireTenant={false}>
                    <AdminTenantsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute requiredRoles={['platform_admin']} requireTenant={false}>
                    <AdminUsersPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Error pages */}
            <Route path="/unauthorized" element={<ErrorPage message="אין לך הרשאה לצפות בעמוד זה" />} />
            <Route path="/no-tenant" element={<ErrorPage message="המשתמש שלך לא משויך לארגון" />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </TenantProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
      <p className="text-gray-500">בקרוב...</p>
    </div>
  );
}

function ErrorPage({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">שגיאה</h1>
        <p className="text-gray-600 mb-6">{message}</p>
        <a href="/" className="text-[var(--color-primary)] hover:underline">
          חזור לדף הבית
        </a>
      </div>
    </div>
  );
}

export default App;
