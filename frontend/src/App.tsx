import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/store/AuthContext";
import { NotificationProvider } from "@/store/NotificationContext";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { AdminRoute } from "@/routes/AdminRoute";
import { AuthLayout } from "@/layouts/AuthLayout";
import { AppLayout } from "@/layouts/AppLayout";
import { AdminLayout } from "@/layouts/AdminLayout";
import { LoginPage } from "@/modules/auth/LoginPage";
import { RegisterPage } from "@/modules/auth/RegisterPage";
import { DashboardPage } from "@/modules/dashboard/DashboardPage";
import { PaymentPage } from "@/modules/payment/PaymentPage";
import { ReceiptsPage } from "@/modules/receipts/ReceiptsPage";
import { SettingsPage } from "@/modules/settings/SettingsPage";
import { VerifyPage } from "@/modules/admin/verify/VerifyPage";
import { AdminReceiptsPage } from "@/modules/admin/receipts/AdminReceiptsPage";
import { AnalyticsPage } from "@/modules/admin/analytics/AnalyticsPage";
import { AdminSettingsPage } from "@/modules/admin/settings/AdminSettingsPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

function RootRedirect() {
  const { isAuthenticated, user, isReady } = useAuth();

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-[#8b8fa8]">
        Loading…
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === "admin") return <Navigate to="/admin/verify" replace />;
  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<RootRedirect />} />

              {/* Public */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
              </Route>

              {/* Student routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/pay" element={<PaymentPage />} />
                  <Route path="/receipts" element={<ReceiptsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>
              </Route>

              {/* Admin routes */}
              <Route element={<AdminRoute />}>
                <Route element={<AdminLayout />}>
                  <Route path="/admin/verify" element={<VerifyPage />} />
                  <Route
                    path="/admin/receipts"
                    element={<AdminReceiptsPage />}
                  />
                  <Route path="/admin/analytics" element={<AnalyticsPage />} />
                  <Route
                    path="/admin/settings"
                    element={<AdminSettingsPage />}
                  />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
