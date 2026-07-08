import React, { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { Receipt, Download, ExternalLink, ChevronDown, ShieldCheck, XCircle, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { receiptApi } from "@/services/api";
import { Card, CardHeader, CardTitle, Badge, Skeleton } from "@/components/ui";
import { formatXAF, formatDateTime, formatDate, polygonscanTx, cn } from "@/utils";
import type { Receipt as ReceiptType } from "@/types";

type Filter = "all" | "verified" | "pending" | "failed";

export function ReceiptsPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["my-receipts"],
    queryFn: () => receiptApi.getMyReceipts().then(r => r.data.data),
  });

  const receipts: ReceiptType[] = data ?? [];

  const filtered = receipts.filter(r => {
    if (filter === "all") return true;
    if (filter === "verified") return r.sbt?.mintStatus === "minted";
    if (filter === "pending") return r.sbt?.mintStatus === "pending" || !r.sbt;
    if (filter === "failed") return r.sbt?.mintStatus === "failed";
    return true;
  });

  const counts = {
    all: receipts.length,
    verified: receipts.filter(r => r.sbt?.mintStatus === "minted").length,
    pending: receipts.filter(r => r.sbt?.mintStatus === "pending" || !r.sbt).length,
    failed: receipts.filter(r => r.sbt?.mintStatus === "failed").length,
  };

  useEffect(() => {
    if (!listRef.current || isLoading) return;
    const rows = listRef.current.querySelectorAll(".receipt-row");
    gsap.fromTo(rows,
      { x: -10, opacity: 0 },
      { x: 0, opacity: 1, stagger: 0.05, duration: 0.35, ease: "power2.out" }
    );
  }, [filter, isLoading]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">My Receipts</h1>
          <p className="text-sm text-[#8b8fa8] mt-0.5">{receipts.length} total payment{receipts.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "verified", "pending", "failed"] as Filter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-[12.5px] font-medium transition-all duration-150 capitalize border",
              filter === f
                ? "bg-[rgba(0,229,160,0.10)] text-[#00e5a0] border-[rgba(0,229,160,0.25)]"
                : "text-[#8b8fa8] border-[rgba(255,255,255,0.07)] hover:border-[rgba(255,255,255,0.14)] hover:text-[#e8eaf0]"
            )}
          >
            {f === "all" ? `All (${counts.all})`
              : f === "verified" ? `Confirmed (${counts.verified})`
              : f === "pending" ? `Processing (${counts.pending})`
              : `Failed (${counts.failed})`}
          </button>
        ))}
      </div>

      {/* List */}
      <Card>
        {isLoading ? (
          <div className="p-5 flex flex-col gap-3">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[rgba(255,255,255,0.04)] flex items-center justify-center">
              <Receipt className="w-5 h-5 text-[#3e4155]" />
            </div>
            <p className="text-[13px] text-[#3e4155]">No receipts found</p>
          </div>
        ) : (
          <div ref={listRef} className="divide-y divide-[rgba(255,255,255,0.04)]">
            {filtered.map(receipt => (
              <ReceiptRow
                key={receipt._id}
                receipt={receipt}
                isExpanded={expanded === receipt._id}
                onToggle={() => setExpanded(prev => prev === receipt._id ? null : receipt._id)}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── Receipt row ──────────────────────────────────────────────────────────────
function ReceiptRow({
  receipt, isExpanded, onToggle,
}: {
  receipt: ReceiptType;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const detailRef = useRef<HTMLDivElement>(null);
  const mintStatus = receipt.sbt?.mintStatus;

  useEffect(() => {
    if (!detailRef.current) return;
    if (isExpanded) {
      gsap.fromTo(detailRef.current,
        { height: 0, opacity: 0 },
        { height: "auto", opacity: 1, duration: 0.3, ease: "power2.out" }
      );
    } else {
      gsap.to(detailRef.current, { height: 0, opacity: 0, duration: 0.2, ease: "power2.in" });
    }
  }, [isExpanded]);

  const statusBadge = () => {
    if (mintStatus === "minted") return <Badge variant="success" dot>Confirmed</Badge>;
    if (mintStatus === "failed") return <Badge variant="failed" dot>Check required</Badge>;
    return <Badge variant="pending" dot>Processing</Badge>;
  };

  const statusIcon = () => {
    if (mintStatus === "minted") return <ShieldCheck className="w-4 h-4 text-[#00e5a0]" />;
    if (mintStatus === "failed") return <XCircle className="w-4 h-4 text-[#ff5757]" />;
    return <Loader2 className="w-4 h-4 text-[#f5a623] animate-spin" />;
  };

  const iconBg = mintStatus === "minted"
    ? "bg-[rgba(0,229,160,0.08)]"
    : mintStatus === "failed"
    ? "bg-[rgba(255,87,87,0.08)]"
    : "bg-[rgba(245,166,35,0.08)]";

  const label = receipt.paymentType.charAt(0).toUpperCase() + receipt.paymentType.slice(1);

  return (
    <div className="receipt-row">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-[rgba(255,255,255,0.02)] transition-colors text-left"
      >
        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0", iconBg)}>
          {statusIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium capitalize">{label} Fee</p>
          <p className="text-[10.5px] text-[#8b8fa8] mt-0.5 font-mono">{receipt.referenceNumber}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-[13px] font-mono font-bold text-[#00e5a0]">{formatXAF(receipt.amount)} CFA</p>
            <p className="text-[10.5px] text-[#3e4155]">{formatDate(receipt.createdAt)}</p>
          </div>
          {statusBadge()}
          <ChevronDown className={cn("w-4 h-4 text-[#3e4155] transition-transform duration-200", isExpanded && "rotate-180")} />
        </div>
      </button>

      {/* Expanded detail */}
      <div ref={detailRef} style={{ height: 0, overflow: "hidden", opacity: 0 }}>
        <div className="px-5 pb-5">
          <div className="bg-[#0f1420] rounded-xl p-4 border border-[rgba(255,255,255,0.06)]">
            {/* QR + details grid */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* QR code */}
              {receipt.qrCodeData && (
                <div className="flex-shrink-0 flex flex-col items-center gap-2">
                  <img
                    src={receipt.qrCodeData}
                    alt="Receipt QR"
                    className="w-24 h-24 rounded-lg"
                  />
                  <p className="text-[9.5px] font-mono text-[#3e4155] text-center">Scan to verify</p>
                </div>
              )}

              {/* Details */}
              <div className="flex-1 grid grid-cols-2 gap-3">
                {[
                  ["Reference", receipt.referenceNumber],
                  ["Amount", `${formatXAF(receipt.amount)} CFA`],
                  ["Fee Type", receipt.paymentType],
                  ["Academic Year", receipt.academicYear],
                  ["Level", receipt.level],
                  ["Date", formatDateTime(receipt.createdAt)],
                ].map(([k, v]) => (
                  <div key={k}>
                    <p className="text-[9.5px] font-mono uppercase tracking-wide text-[#3e4155]">{k}</p>
                    <p className="text-[12px] font-medium text-[#e8eaf0] mt-0.5 capitalize">{v}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* SBT section — shown only when minted */}
            {mintStatus === "minted" && receipt.sbt?.transactionHash && (
              <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.06)]">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#00e5a0]" />
                    <span className="text-[12px] text-[#00e5a0] font-medium">Receipt ID: #{receipt.sbt.tokenId}</span>
                  </div>
                  <a
                    href={polygonscanTx(receipt.sbt.transactionHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[11.5px] text-[#4f9cf9] hover:underline font-mono"
                    onClick={e => e.stopPropagation()}
                  >
                    <ExternalLink className="w-3 h-3" /> View proof
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
