import React, { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import {
  TrendingUp,
  ShieldCheck,
  Clock,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Loader2,
  History,
  ChevronRight,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/store/AuthContext";
import { paymentApi, receiptApi, historyApi } from "@/services/api";
import {
  StatCard,
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  Badge,
  Skeleton,
} from "@/components/ui";
import { formatXAF, timeAgo, formatDate, cn } from "@/utils";
import type { Payment, Receipt, InstallmentStatus } from "@/types";

export function DashboardPage() {
  const { user, getProfile } = useAuth();
  const greetingRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const { data: paymentsData, isLoading: loadingPayments } = useQuery({
    queryKey: ["my-payments"],
    queryFn: () => paymentApi.getMyPayments().then((r) => r.data.data),
  });

  const { data: receiptsData, isLoading: loadingReceipts } = useQuery({
    queryKey: ["my-receipts"],
    queryFn: () => receiptApi.getMyReceipts().then((r) => r.data.data),
  });

  const { data: installmentsData } = useQuery({
    queryKey: ["installments"],
    queryFn: () => historyApi.getInstallmentStatus().then((r) => r.data.data),
  });

  const payments: Payment[] = paymentsData ?? [];
  const receipts: Receipt[] = receiptsData ?? [];
  const installments: InstallmentStatus[] = installmentsData ?? [];

  const totalPaid = payments
    .filter((p) => p.status === "success")
    .reduce((s, p) => s + p.amount, 0);
  const verifiedCount = receipts.filter(
    (r) => r.sbt?.mintStatus === "minted",
  ).length;
  const pendingCount = payments.filter((p) => p.status === "pending").length;
  const recentPayments = payments.slice(0, 5);

  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(
      greetingRef.current,
      { y: -10, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.45, ease: "power3.out" },
    );
    tl.fromTo(
      statsRef.current?.children ?? [],
      { y: 14, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.07, duration: 0.4, ease: "power2.out" },
      0.2,
    );
  }, []);

  useEffect(() => {
    getProfile();
  }, [getProfile]);

  const isLoading = loadingPayments || loadingReceipts;

  return (
    <div className="flex flex-col gap-5">
      {/* Greeting */}
      <div
        ref={greetingRef}
        className="flex flex-col sm:flex-row sm:items-start justify-between gap-3"
      >
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {greeting}, {user?.fullName?.split(" ")[0]}
          </h1>
          <p className="text-sm text-[#8b8fa8] mt-0.5">
            {user?.programme} · {user?.level}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[rgba(0,229,160,0.06)] border border-[rgba(0,229,160,0.15)] rounded-xl px-4 py-2.5 self-start">
          <span className="w-2 h-2 rounded-full bg-[#00e5a0] pulse-dot flex-shrink-0" />
          <span className="text-[12px] text-[#00e5a0] font-mono">
            Account Active
          </span>
        </div>
      </div>

      {/* Stats */}
      <div ref={statsRef} className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {isLoading ? (
          <>
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24 hidden lg:block" />
          </>
        ) : (
          <>
            <StatCard
              label="Total Paid"
              value={`${formatXAF(totalPaid)} CFA`}
              subtext="This academic session"
              accent="green"
              icon={<TrendingUp className="w-4 h-4" />}
            />
            <StatCard
              label="Verified Receipts"
              value={verifiedCount.toString()}
              subtext="Secured and tamper-proof"
              accent="blue"
              icon={<ShieldCheck className="w-4 h-4" />}
            />
            <StatCard
              label="Pending"
              value={pendingCount.toString()}
              subtext={pendingCount > 0 ? "Being processed" : "All clear"}
              accent={pendingCount > 0 ? "amber" : "green"}
              icon={<Clock className="w-4 h-4" />}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-4">
        {/* Left: recent payments */}
        <Card>
          <CardHeader>
            <CardTitle icon={<History className="w-4 h-4" />}>
              Recent Payments
            </CardTitle>
            <Link
              to="/receipts"
              className="flex items-center gap-1 text-[12px] text-[#8b8fa8] hover:text-[#00e5a0] transition-colors"
            >
              View all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>

          {isLoading ? (
            <div className="p-5 flex flex-col gap-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-14" />
              ))}
            </div>
          ) : recentPayments.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[rgba(0,229,160,0.06)] flex items-center justify-center">
                <History className="w-5 h-5 text-[#3e4155]" />
              </div>
              <p className="text-[13px] text-[#3e4155]">No payments yet</p>
              <Link to="/pay">
                <span className="text-[12.5px] text-[#00e5a0] hover:underline flex items-center gap-1">
                  Make your first payment <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            </div>
          ) : (
            <div className="max-h-[320px] overflow-y-auto divide-y divide-[rgba(255,255,255,0.04)]">
              {recentPayments.map((p) => (
                <PaymentRow key={p._id} payment={p} />
              ))}
            </div>
          )}
        </Card>

        {/* Right: installment status */}
        <div className="flex flex-col gap-4">
          {installments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle icon={<ShieldCheck className="w-4 h-4" />}>
                  Fee Status
                </CardTitle>
              </CardHeader>
              <CardBody className="flex flex-col gap-4">
                {installments.map((inst) => (
                  <InstallmentBar key={inst.paymentType} inst={inst} />
                ))}
              </CardBody>
            </Card>
          )}

          {/* Quick pay */}
          <Card>
            <CardBody>
              <p className="text-[13px] font-semibold mb-1">Ready to pay?</p>
              <p className="text-[12px] text-[#8b8fa8] mb-4">
                Pay your fees securely and get your receipt instantly.
              </p>
              <Link to="/pay" className="w-full">
                <button className="w-full bg-[#00e5a0] text-[#050708] font-semibold text-[13px] py-3 rounded-xl hover:bg-[#00cc8e] transition-colors flex items-center justify-center gap-2">
                  Pay Fees <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Payment row ──────────────────────────────────────────────────────────────
function PaymentRow({ payment }: { payment: Payment }) {
  const statusIcon = {
    success: <CheckCircle2 className="w-4 h-4 text-[#00e5a0]" />,
    pending: <Loader2 className="w-4 h-4 text-[#f5a623] animate-spin" />,
    failed: <XCircle className="w-4 h-4 text-[#ff5757]" />,
  }[payment.status];

  const iconBg = {
    success: "bg-[rgba(0,229,160,0.08)]",
    pending: "bg-[rgba(245,166,35,0.08)]",
    failed: "bg-[rgba(255,87,87,0.08)]",
  }[payment.status];

  const amountColor = {
    success: "text-[#00e5a0]",
    pending: "text-[#f5a623]",
    failed: "text-[#ff5757]",
  }[payment.status];

  const label =
    payment.paymentType.charAt(0).toUpperCase() + payment.paymentType.slice(1);

  return (
    <div className="flex items-center gap-3 px-5 py-3.5 hover:bg-[rgba(255,255,255,0.02)] transition-colors">
      <div
        className={cn(
          "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
          iconBg,
        )}
      >
        {statusIcon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium capitalize truncate">
          {label} Fee
        </p>
        <p className="text-[10.5px] text-[#8b8fa8]">
          {timeAgo(payment.createdAt)}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className={cn("text-[13px] font-mono font-bold", amountColor)}>
          {formatXAF(payment.amount)} CFA
        </p>
        <p className="text-[10.5px] text-[#3e4155] capitalize mt-0.5">
          {payment.status}
        </p>
      </div>
    </div>
  );
}

// ─── Installment progress bar ─────────────────────────────────────────────────
function InstallmentBar({ inst }: { inst: InstallmentStatus }) {
  const label =
    inst.paymentType.charAt(0).toUpperCase() + inst.paymentType.slice(1);
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[12.5px] font-medium">{label}</span>
        <span
          className={cn(
            "text-[11px] font-mono",
            inst.cleared ? "text-[#00e5a0]" : "text-[#8b8fa8]",
          )}
        >
          {inst.cleared ? "Cleared ✓" : `${formatXAF(inst.remaining)} CFA left`}
        </span>
      </div>
      <div className="h-1.5 bg-[#141926] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${inst.progress}%`,
            background: inst.cleared
              ? "#00e5a0"
              : "linear-gradient(90deg, #4f9cf9, #00e5a0)",
          }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-[#3e4155]">
          {formatXAF(inst.totalPaid)} paid
        </span>
        <span className="text-[10px] text-[#3e4155]">
          {formatXAF(inst.requiredAmount)} total
        </span>
      </div>
    </div>
  );
}
