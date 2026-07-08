import React from "react";
import { cn } from "@/utils";
import { Loader2 } from "lucide-react";

// ─── Button ───────────────────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  loading,
  icon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center gap-2 font-medium rounded-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00e5a0] disabled:opacity-40 disabled:cursor-not-allowed";
  const variants = {
    primary:
      "bg-[#00e5a0] text-[#050708] hover:bg-[#00cc8e] active:scale-[0.98]",
    outline:
      "border border-[rgba(255,255,255,0.12)] text-[#e8eaf0] hover:border-[rgba(255,255,255,0.22)] hover:bg-[rgba(255,255,255,0.04)]",
    ghost:
      "text-[#8b8fa8] hover:text-[#e8eaf0] hover:bg-[rgba(255,255,255,0.04)]",
    danger:
      "bg-[rgba(255,87,87,0.12)] text-[#ff5757] border border-[rgba(255,87,87,0.25)] hover:bg-[rgba(255,87,87,0.18)]",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-[12.5px]",
    md: "px-4 py-2.5 text-[13px]",
    lg: "px-6 py-3.5 text-[14px]",
  };
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({ label, error, icon, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[11.5px] font-mono uppercase tracking-wide text-[#8b8fa8]">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b8fa8]">
            {icon}
          </div>
        )}
        <input
          className={cn(
            "w-full bg-[#0f1420] border border-[rgba(255,255,255,0.08)] rounded-xl text-[13.5px] text-[#e8eaf0] placeholder:text-[#3e4155]",
            "focus:outline-none focus:border-[rgba(0,229,160,0.4)] focus:ring-1 focus:ring-[rgba(0,229,160,0.2)] transition-all",
            icon ? "pl-10 pr-4 py-3" : "px-4 py-3",
            error && "border-[rgba(255,87,87,0.4)]",
            className,
          )}
          {...props}
        />
      </div>
      {error && <p className="text-[11px] text-[#ff5757]">{error}</p>}
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
interface BadgeProps {
  variant?: "success" | "pending" | "failed" | "info" | "neutral";
  dot?: boolean;
  children: React.ReactNode;
}

export function Badge({ variant = "neutral", dot, children }: BadgeProps) {
  const styles = {
    success:
      "bg-[rgba(0,229,160,0.1)] text-[#00e5a0] border-[rgba(0,229,160,0.2)]",
    pending:
      "bg-[rgba(245,166,35,0.1)] text-[#f5a623] border-[rgba(245,166,35,0.2)]",
    failed:
      "bg-[rgba(255,87,87,0.1)] text-[#ff5757] border-[rgba(255,87,87,0.2)]",
    info: "bg-[rgba(79,156,249,0.1)] text-[#4f9cf9] border-[rgba(79,156,249,0.2)]",
    neutral:
      "bg-[rgba(255,255,255,0.06)] text-[#8b8fa8] border-[rgba(255,255,255,0.1)]",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border",
        styles[variant],
      )}
    >
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current pulse-dot" />
      )}
      {children}
    </span>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-[#0b0f17] border border-[rgba(255,255,255,0.07)] rounded-2xl overflow-hidden",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-5 py-4 border-b border-[rgba(255,255,255,0.06)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  icon,
  children,
}: {
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5">
      {icon && <span className="text-[#8b8fa8]">{icon}</span>}
      <span className="text-[13.5px] font-semibold">{children}</span>
    </div>
  );
}

export function CardBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("p-5", className)}>{children}</div>;
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string;
  subtext?: string;
  accent?: "green" | "blue" | "amber" | "red";
  icon?: React.ReactNode;
}

export function StatCard({
  label,
  value,
  subtext,
  accent = "green",
  icon,
}: StatCardProps) {
  const colors = {
    green: {
      bg: "bg-[rgba(0,229,160,0.08)]",
      text: "text-[#00e5a0]",
      border: "border-[rgba(0,229,160,0.15)]",
    },
    blue: {
      bg: "bg-[rgba(79,156,249,0.08)]",
      text: "text-[#4f9cf9]",
      border: "border-[rgba(79,156,249,0.15)]",
    },
    amber: {
      bg: "bg-[rgba(245,166,35,0.08)]",
      text: "text-[#f5a623]",
      border: "border-[rgba(245,166,35,0.15)]",
    },
    red: {
      bg: "bg-[rgba(255,87,87,0.08)]",
      text: "text-[#ff5757]",
      border: "border-[rgba(255,87,87,0.15)]",
    },
  };
  const c = colors[accent];
  return (
    <div className={cn("bg-[#0b0f17] border rounded-2xl p-4", c.border)}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-[11px] font-mono uppercase tracking-wide text-[#8b8fa8]">
          {label}
        </span>
        {icon && (
          <div
            className={cn(
              "w-7 h-7 rounded-lg flex items-center justify-center",
              c.bg,
              c.text,
            )}
          >
            {icon}
          </div>
        )}
      </div>
      <p className={cn("text-[22px] font-bold font-mono leading-none", c.text)}>
        {value}
      </p>
      {subtext && (
        <p className="text-[11px] text-[#3e4155] mt-1.5">{subtext}</p>
      )}
    </div>
  );
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("shimmer rounded-lg", className)} />;
}

// ─── Toast notification ───────────────────────────────────────────────────────
interface ToastProps {
  type: "success" | "error" | "info";
  title: string;
  message?: string;
  onDismiss: () => void;
}

export function Toast({ type, title, message, onDismiss }: ToastProps) {
  const styles = {
    success: "border-[rgba(0,229,160,0.25)] bg-[rgba(0,229,160,0.06)]",
    error: "border-[rgba(255,87,87,0.25)] bg-[rgba(255,87,87,0.06)]",
    info: "border-[rgba(79,156,249,0.25)] bg-[rgba(79,156,249,0.06)]",
  };
  const dot = {
    success: "bg-[#00e5a0]",
    error: "bg-[#ff5757]",
    info: "bg-[#4f9cf9]",
  };
  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3.5 rounded-xl border",
        styles[type],
      )}
    >
      <span
        className={cn("w-2 h-2 rounded-full mt-1 flex-shrink-0", dot[type])}
      />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[#e8eaf0]">{title}</p>
        {message && (
          <p className="text-[12px] text-[#8b8fa8] mt-0.5">{message}</p>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="text-[#3e4155] hover:text-[#8b8fa8] text-[16px] leading-none flex-shrink-0"
      >
        ×
      </button>
    </div>
  );
}
