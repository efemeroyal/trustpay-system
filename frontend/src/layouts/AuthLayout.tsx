import React from "react";
import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-[#070a0f] flex flex-col items-center justify-center p-4">
      {/* Subtle grid background */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,229,160,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,229,160,0.5) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="w-10 h-10 rounded-xl bg-[#00e5a0] flex items-center justify-center">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M11 2L20 7V15L11 20L2 15V7L11 2Z" fill="#050708" />
            <path d="M11 6L16 9V13L11 16L6 13V9L11 6Z" fill="#00e5a0" opacity="0.6" />
          </svg>
        </div>
        <span className="text-[16px] font-semibold tracking-tight">TrustPay</span>
        <span className="text-[11px] text-[#3e4155] font-mono uppercase tracking-wider">Secure Fee Payment</span>
      </div>

      <div className="w-full max-w-[440px]">
        <Outlet />
      </div>

      <p className="mt-8 text-[11px] text-[#3e4155] text-center">
        © {new Date().getFullYear()} TrustPay · Landmark Metropolitan University Institute
      </p>
    </div>
  );
}
