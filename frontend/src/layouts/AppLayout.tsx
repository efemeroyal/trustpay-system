import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CreditCard,
  Receipt,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
} from "lucide-react";
import { useAuth } from "@/store/AuthContext";
import { useNotifications } from "@/store/NotificationContext";
import { useRealtimeUpdates } from "@/services/realtime";
import { cn } from "@/utils";

const NAV = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/pay", icon: CreditCard, label: "Pay Fees" },
  { to: "/receipts", icon: Receipt, label: "My Receipts" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useRealtimeUpdates();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "TK";

  return (
    <div className="min-h-screen bg-[#070a0f] flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-60 flex flex-col bg-[#0b0f17] border-r border-[rgba(255,255,255,0.07)]",
          "transition-transform duration-200 ease-out",
          "lg:translate-x-0 lg:static lg:z-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-[rgba(255,255,255,0.06)]">
          <div className="w-8 h-8 rounded-lg bg-[#00e5a0] flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
              <path d="M11 2L20 7V15L11 20L2 15V7L11 2Z" fill="#050708" />
              <path
                d="M11 6L16 9V13L11 16L6 13V9L11 6Z"
                fill="#00e5a0"
                opacity="0.6"
              />
            </svg>
          </div>
          <div>
            <p className="text-[14px] font-semibold leading-none">TrustPay</p>
            <p className="text-[10px] text-[#3e4155] mt-0.5 font-mono">
              LMUI Portal
            </p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto text-[#3e4155] hover:text-[#8b8fa8] lg:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Student info */}
        <div className="px-4 py-3 mx-3 mt-3 rounded-xl bg-[rgba(0,229,160,0.04)] border border-[rgba(0,229,160,0.1)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#00e5a0] flex items-center justify-center flex-shrink-0">
              <span className="text-[11px] font-bold text-[#050708]">
                {initials}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-[12.5px] font-semibold truncate">
                {user?.fullName ?? "Student"}
              </p>
              <p className="text-[10.5px] font-mono text-[#8b8fa8] truncate">
                {user?.studentId ?? "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150",
                  isActive
                    ? "bg-[rgba(0,229,160,0.1)] text-[#00e5a0]"
                    : "text-[#8b8fa8] hover:text-[#e8eaf0] hover:bg-[rgba(255,255,255,0.04)]",
                )
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-5 border-t border-[rgba(255,255,255,0.06)] pt-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-medium text-[#8b8fa8] hover:text-[#ff5757] hover:bg-[rgba(255,87,87,0.06)] transition-all duration-150"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3.5 glass border-b border-[rgba(255,255,255,0.06)]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-[#8b8fa8] hover:text-[#e8eaf0] p-1"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden lg:flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00e5a0] pulse-dot" />
            <span className="text-[11px] font-mono text-[#8b8fa8]">
              {user?.level} · {user?.programme}
            </span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button className="relative p-2 rounded-lg text-[#8b8fa8] hover:text-[#e8eaf0] hover:bg-[rgba(255,255,255,0.04)] transition-colors">
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#00e5a0]" />
              )}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 max-w-[1200px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
