import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/store/AuthContext";

export function AdminRoute() {
  const { isAuthenticated, user, isReady } = useAuth();
  const location = useLocation();

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-[#8b8fa8]">
        Loading…
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
