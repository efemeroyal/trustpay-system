import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import {
  TrendingUp,
  ShieldCheck,
  Clock,
  Zap,
  History,
  Activity,
  LayoutGrid,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/store/AuthContext";
import { usePayment } from "@/store/PaymentContext";
import { shortHash, formatXAF, timeAgo, formatDate } from "@/utils";
import { cn } from "@/utils";
import type { Transaction, SBTReceipt } from "@/types";

export function DashboardPage() {
  const { student } = useAuth();
  const { transactions, receipts, dashboardStats, mintSteps, mintStatus } =
    usePayment();

  const greetingRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  const pendingTx = transactions.find((t) => t.status === "pending");
  const isMinting = mintStatus !== "idle" && mintStatus !== "minted";

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(
      greetingRef.current,
      { y: -12, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" },
    );
    tl.fromTo(
      chartRef.current,
      { scaleX: 0, transformOrigin: "left center" },
      { scaleX: 1, duration: 0.7, ease: "power2.out" },
      0.6,
    );
  }, []);

  const maxBar = Math.max(...dashboardStats.weeklyData, 1);
  const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <div className="flex flex-col gap-5">
      {/* Greeting */}
      <div
        ref={greetingRef}
        className="flex flex-col sm:flex-row sm:items-start justify-between gap-3"
      >
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {greeting}, {student?.name?.split(" ")[0]}
          </h1>
          <p className="text-sm text-[#8b8fa8] mt-0.5">
            {student?.university} · {student?.faculty}
          </p>
        </div>
        {student?.walletAddress ? (
          <div className="flex items-center gap-2.5 bg-[rgba(0,229,160,0.06)] border border-[rgba(0,229,160,0.15)] rounded-xl px-4 py-2.5 self-start">
            <span className="w-2 h-2 rounded-full bg-[#00e5a0] pulse-dot flex-shrink-0" />
            <div>
              <p className="text-[9.5px] font-mono uppercase tracking-wide text-[#8b8fa8]">
                Wallet Connected
              </p>
              <p className="text-[12px] font-mono text-[#00e5a0]">
                {shortHash(student.walletAddress, 6)}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 bg-[rgba(245,166,35,0.06)] border border-[rgba(245,166,35,0.2)] rounded-xl px-4 py-2.5 self-start">
            <span className="w-2 h-2 rounded-full bg-[#f5a623] flex-shrink-0" />
            <p className="text-[12px] font-mono text-[#f5a623]">
              Connect wallet to receive SBTs
            </p>
          </div>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total Paid"
          value={`${formatXAF(dashboardStats.totalPaid)} CFA`}
          subtext="This academic session"
          accent="green"
          icon={<TrendingUp className="w-4 h-4" />}
          delay={0.05}
        />
        <StatCard
          label="SBT Receipts"
          value={dashboardStats.sbtCount.toString()}
          subtext="On Polygon network"
          accent="blue"
          icon={<ShieldCheck className="w-4 h-4" />}
          delay={0.1}
        />
        <StatCard
          label="Pending"
          value={dashboardStats.pendingCount.toString()}
          subtext={
            dashboardStats.pendingCount > 0
              ? "Awaiting confirmation"
              : "All clear"
          }
          accent="amber"
          icon={<Clock className="w-4 h-4" />}
          delay={0.15}
        />
        <StatCard
          label="Gas Cost"
          value="0.00 CFA"
          subtext="Near-zero fees"
          accent="green"
          icon={<Zap className="w-4 h-4" />}
          delay={0.2}
        />
      </div>

      {/* Main two-col grid */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4">
        {/* LEFT: transactions + chart */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle icon={<History className="w-4 h-4" />}>
                Recent Transactions
              </CardTitle>
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#00e5a0]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00e5a0] pulse-dot" />
                Live
              </div>
            </CardHeader>

            {/* Filter tabs */}
            <div className="flex border-b border-[rgba(255,255,255,0.06)]">
              {["All", "Minted", "Pending", "Failed"].map((tab, i) => (
                <button
                  key={tab}
                  className={cn(
                    "px-4 py-2.5 text-[12.5px] font-medium border-b-2 transition-all duration-150",
                    i === 0
                      ? "border-[#00e5a0] text-[#00e5a0]"
                      : "border-transparent text-[#8b8fa8] hover:text-[#e8eaf0]",
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="divide-y divide-[rgba(255,255,255,0.04)]">
              {transactions.map((tx) => (
                <TxRow key={tx.id} tx={tx} />
              ))}
            </div>

            {/* Mini bar chart */}
            <div className="px-5 pb-5 pt-4 border-t border-[rgba(255,255,255,0.06)]">
              <p className="text-[10px] font-mono uppercase tracking-wide text-[#8b8fa8] mb-3">
                Payments · Last 7 days
              </p>
              <div ref={chartRef} className="flex items-end gap-2 h-[72px]">
                {dashboardStats.weeklyData.map((val, i) => (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end"
                  >
                    <div
                      className={cn(
                        "w-full rounded-t-sm transition-all duration-500",
                        i === 6
                          ? "bg-[#00e5a0]"
                          : "bg-[rgba(0,229,160,0.18)] border-t border-[rgba(0,229,160,0.4)]",
                      )}
                      style={{
                        height: `${(val / maxBar) * 100}%`,
                        minHeight: "4px",
                      }}
                    />
                    <span
                      className={cn(
                        "text-[9.5px] font-mono",
                        i === 6 ? "text-[#00e5a0]" : "text-[#3e4155]",
                      )}
                    >
                      {DAYS[i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT column */}
        <div className="flex flex-col gap-4">
          {/* Minting status */}
          {pendingTx && (
            <Card>
              <CardHeader>
                <CardTitle icon={<Activity className="w-4 h-4" />}>
                  Minting Status
                </CardTitle>
                <Badge variant="pending" dot>
                  In Progress
                </Badge>
              </CardHeader>
              <CardBody className="flex flex-col gap-0">
                <p className="text-[11.5px] font-mono text-[#8b8fa8] mb-3">
                  {pendingTx.feeLabel} · {formatXAF(pendingTx.amount)} CFA
                </p>
                {mintSteps.map((step, i) => (
                  <div key={step.id} className="flex items-start gap-2.5">
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div
                        className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300",
                          step.status === "done"
                            ? "bg-[rgba(0,229,160,0.12)] text-[#00e5a0]"
                            : step.status === "active"
                              ? "bg-[rgba(245,166,35,0.12)] text-[#f5a623]"
                              : "bg-[rgba(255,255,255,0.04)] text-[#3e4155]",
                        )}
                      >
                        {step.status === "done" ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : step.status === "active" ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <span className="w-1 h-1 rounded-full bg-current" />
                        )}
                      </div>
                      {i < mintSteps.length - 1 && (
                        <div className="w-px h-4 bg-[rgba(255,255,255,0.06)] mt-0.5" />
                      )}
                    </div>
                    <div className="pt-0.5 pb-3 min-w-0">
                      <p
                        className={cn(
                          "text-[12px] font-medium leading-snug",
                          step.status === "queued"
                            ? "text-[#3e4155]"
                            : "text-[#e8eaf0]",
                        )}
                      >
                        {step.label}
                      </p>
                      {step.status !== "queued" && (
                        <p className="text-[10.5px] font-mono text-[#8b8fa8] mt-0.5 truncate">
                          {step.detail || step.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </CardBody>
            </Card>
          )}

          {/* Latest SBT receipt */}
          {receipts[0] && (
            <Card>
              <CardHeader>
                <CardTitle icon={<ShieldCheck className="w-4 h-4" />}>
                  Latest Receipt
                </CardTitle>
                <Badge variant="success" dot>
                  Soulbound
                </Badge>
              </CardHeader>
              <CardBody className="p-3">
                <SBTMiniCard receipt={receipts[0]} />
              </CardBody>
            </Card>
          )}

          {/* Chain events */}
          <Card>
            <CardHeader>
              <CardTitle icon={<LayoutGrid className="w-4 h-4" />}>
                Chain Activity
              </CardTitle>
              <span className="text-[10.5px] font-mono text-[#8b8fa8]">
                Amoy Testnet
              </span>
            </CardHeader>
            <div className="divide-y divide-[rgba(255,255,255,0.04)]">
              {[
                {
                  type: "MINT",
                  hash: "0x7da3fc28d91e45a8b312c4f09",
                  block: 58204119,
                },
                {
                  type: "VERIFY",
                  hash: "0x22cd9f47ae3b19fa0cde7bcf",
                  block: 58204071,
                },
                {
                  type: "MINT",
                  hash: "0x9fc4aab31c2017e38decd1bf",
                  block: 58203988,
                },
                {
                  type: "FAIL",
                  hash: "0xae01be445f7743ffdc3e18c8",
                  block: 58203901,
                },
              ].map((e, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-2.5">
                  <span
                    className={cn(
                      "text-[10px] font-mono px-1.5 py-0.5 rounded flex-shrink-0",
                      e.type === "MINT"
                        ? "bg-[rgba(0,229,160,0.10)] text-[#00e5a0]"
                        : e.type === "VERIFY"
                          ? "bg-[rgba(79,156,249,0.10)] text-[#4f9cf9]"
                          : "bg-[rgba(255,87,87,0.10)] text-[#ff5757]",
                    )}
                  >
                    {e.type}
                  </span>
                  <span className="text-[10.5px] font-mono text-[#8b8fa8] flex-1 truncate">
                    {shortHash(e.hash as `0x${string}`, 6)}
                  </span>
                  <span className="text-[10px] font-mono text-[#3e4155] flex-shrink-0">
                    #{e.block.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function TxRow({ tx }: { tx: Transaction }) {
  const statusIcon = {
    success: <CheckCircle2 className="w-4 h-4 text-[#00e5a0]" />,
    pending: <Loader2 className="w-4 h-4 text-[#f5a623] animate-spin" />,
    failed: <XCircle className="w-4 h-4 text-[#ff5757]" />,
  }[tx.status];

  const iconBg = {
    success: "bg-[rgba(0,229,160,0.08)]",
    pending: "bg-[rgba(245,166,35,0.08)]",
    failed: "bg-[rgba(255,87,87,0.08)]",
  }[tx.status];

  const amountColor = {
    success: "text-[#00e5a0]",
    pending: "text-[#f5a623]",
    failed: "text-[#ff5757]",
  }[tx.status];

  return (
    <div className="flex items-center gap-3 px-5 py-3 hover:bg-[rgba(255,255,255,0.02)] transition-colors">
      <div
        className={cn(
          "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
          iconBg,
        )}
      >
        {statusIcon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium truncate">{tx.feeLabel}</p>
        <p className="text-[10.5px] font-mono text-[#8b8fa8] truncate">
          {tx.txHash
            ? `${shortHash(tx.txHash, 5)} · SBT #${tx.sbtTokenId}`
            : tx.status === "pending"
              ? "Processing on Polygon…"
              : "Transaction failed"}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className={cn("text-[13px] font-mono font-bold", amountColor)}>
          {formatXAF(tx.amount)} CFA
        </p>
        <p className="text-[10.5px] text-[#3e4155] mt-0.5">
          {timeAgo(tx.timestamp)}
        </p>
      </div>
    </div>
  );
}

function SBTMiniCard({ receipt }: { receipt: SBTReceipt }) {
  return (
    <div
      className="rounded-xl p-4 relative overflow-hidden border border-[rgba(0,229,160,0.12)]"
      style={{
        background:
          "linear-gradient(135deg, #0d1a14 0%, #0a1220 50%, #120e1a 100%)",
      }}
    >
      <div className="absolute inset-0 sbt-grid-bg opacity-50 pointer-events-none" />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-[9px] font-mono font-bold uppercase tracking-[1.2px] text-[#00e5a0]">
              {receipt.university}
            </p>
            <p className="text-[13px] font-semibold mt-0.5 leading-tight">
              {receipt.feeLabel}
            </p>
          </div>
          <Badge variant="success" dot>
            Locked
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 mb-3">
          {(
            [
              ["Student", receipt.studentId],
              ["Amount", `${formatXAF(receipt.amount)} CFA`],
              ["Token", `#${receipt.tokenId}`],
              ["Minted", formatDate(receipt.mintedAt)],
            ] as [string, string][]
          ).map(([k, v]) => (
            <div key={k}>
              <p className="text-[9px] font-mono uppercase tracking-wide text-[#8b8fa8]">
                {k}
              </p>
              <p
                className="text-[11.5px] font-mono font-medium mt-0.5 truncate"
                style={k === "Amount" ? { color: "#00e5a0" } : {}}
              >
                {v}
              </p>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between pt-2.5 border-t border-[rgba(255,255,255,0.06)]">
          <div className="flex items-center gap-1 text-[10.5px] font-mono text-[#00e5a0]">
            <ShieldCheck className="w-3 h-3" /> ERC-5192
          </div>
          <a
            href="#"
            className="flex items-center gap-1 text-[10.5px] font-mono text-[#4f9cf9] hover:underline"
          >
            View on chain <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
