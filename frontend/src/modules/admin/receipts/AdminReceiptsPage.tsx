import React, { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import {
  Receipt,
  Search,
  ExternalLink,
  ChevronDown,
  ShieldCheck,
  XCircle,
  Loader2,
  User,
  Hash,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { adminReceiptApi } from "@/services/adminApi";
import {
  Card,
  CardHeader,
  CardTitle,
  Badge,
  Input,
  Skeleton,
} from "@/components/ui";
import {
  formatXAF,
  formatDateTime,
  shortHash,
  polygonscanTx,
  cn,
} from "@/utils";
import type { Receipt as ReceiptType } from "@/types";

type Filter = "all" | "minted" | "pending" | "failed";

export function AdminReceiptsPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-receipts"],
    queryFn: () => adminReceiptApi.getAllReceipts().then((r) => r.data.data),
  });

  const receipts: ReceiptType[] = data ?? [];

  const filtered = receipts.filter((r) => {
    const matchFilter =
      filter === "all"
        ? true
        : filter === "minted"
          ? r.sbt?.mintStatus === "minted"
          : filter === "pending"
            ? r.sbt?.mintStatus === "pending" || !r.sbt
            : r.sbt?.mintStatus === "failed";

    const matchSearch =
      search.trim() === ""
        ? true
        : r.studentId.toLowerCase().includes(search.toLowerCase()) ||
          r.referenceNumber.toLowerCase().includes(search.toLowerCase());

    return matchFilter && matchSearch;
  });

  const counts = {
    all: receipts.length,
    minted: receipts.filter((r) => r.sbt?.mintStatus === "minted").length,
    pending: receipts.filter((r) => r.sbt?.mintStatus === "pending" || !r.sbt)
      .length,
    failed: receipts.filter((r) => r.sbt?.mintStatus === "failed").length,
  };

  useEffect(() => {
    if (!listRef.current || isLoading) return;
    const rows = listRef.current.querySelectorAll(".receipt-row");
    gsap.fromTo(
      rows,
      { x: -8, opacity: 0 },
      { x: 0, opacity: 1, stagger: 0.04, duration: 0.3, ease: "power2.out" },
    );
  }, [filter, search, isLoading]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">All Receipts</h1>
          <p className="text-sm text-[#8b8fa8] mt-0.5">
            {receipts.length} total receipt{receipts.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Search */}
      <Input
        placeholder="Search by student ID or reference number…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        icon={<Search className="w-4 h-4" />}
      />

      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "minted", "pending", "failed"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-[12.5px] font-medium transition-all border capitalize",
              filter === f
                ? "bg-[rgba(79,156,249,0.1)] text-[#4f9cf9] border-[rgba(79,156,249,0.25)]"
                : "text-[#8b8fa8] border-[rgba(255,255,255,0.07)] hover:border-[rgba(255,255,255,0.14)] hover:text-[#e8eaf0]",
            )}
          >
            {f === "all"
              ? `All (${counts.all})`
              : f === "minted"
                ? `Verified (${counts.minted})`
                : f === "pending"
                  ? `Processing (${counts.pending})`
                  : `Failed (${counts.failed})`}
          </button>
        ))}
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        {/* Header row */}
        <div className="hidden md:grid grid-cols-[1fr_1fr_auto_auto_auto] gap-4 px-5 py-3 border-b border-[rgba(255,255,255,0.06)]">
          {["Student ID", "Reference", "Amount", "Token ID", "Status"].map(
            (h) => (
              <p
                key={h}
                className="text-[10px] font-mono uppercase tracking-wide text-[#3e4155]"
              >
                {h}
              </p>
            ),
          )}
        </div>

        {isLoading ? (
          <div className="p-5 flex flex-col gap-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-14" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <Receipt className="w-8 h-8 text-[#3e4155]" />
            <p className="text-[13px] text-[#3e4155]">No receipts found</p>
          </div>
        ) : (
          <div
            ref={listRef}
            className="max-h-[420px] overflow-y-auto divide-y divide-[rgba(255,255,255,0.04)]"
          >
            {filtered.map((receipt) => (
              <AdminReceiptRow
                key={receipt._id}
                receipt={receipt}
                isExpanded={expanded === receipt._id}
                onToggle={() =>
                  setExpanded((prev) =>
                    prev === receipt._id ? null : receipt._id,
                  )
                }
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── Admin receipt row ────────────────────────────────────────────────────────
function AdminReceiptRow({
  receipt,
  isExpanded,
  onToggle,
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
      gsap.fromTo(
        detailRef.current,
        { height: 0, opacity: 0 },
        { height: "auto", opacity: 1, duration: 0.3, ease: "power2.out" },
      );
    } else {
      gsap.to(detailRef.current, {
        height: 0,
        opacity: 0,
        duration: 0.2,
        ease: "power2.in",
      });
    }
  }, [isExpanded]);

  const statusIcon =
    mintStatus === "minted" ? (
      <ShieldCheck className="w-4 h-4 text-[#00e5a0]" />
    ) : mintStatus === "failed" ? (
      <XCircle className="w-4 h-4 text-[#ff5757]" />
    ) : (
      <Loader2 className="w-4 h-4 text-[#f5a623] animate-spin" />
    );

  const statusBadge =
    mintStatus === "minted" ? (
      <Badge variant="success" dot>
        Verified
      </Badge>
    ) : mintStatus === "failed" ? (
      <Badge variant="failed" dot>
        Failed
      </Badge>
    ) : (
      <Badge variant="pending" dot>
        Processing
      </Badge>
    );

  return (
    <div className="receipt-row">
      <button
        onClick={onToggle}
        className="w-full grid grid-cols-1 md:grid-cols-[1fr_1fr_auto_auto_auto] gap-2 md:gap-4 px-5 py-4 hover:bg-[rgba(255,255,255,0.02)] transition-colors text-left items-center"
      >
        {/* Student ID */}
        <div className="flex items-center gap-2">
          <User className="w-3.5 h-3.5 text-[#3e4155] hidden md:block" />
          <span className="text-[13px] font-mono">{receipt.studentId}</span>
        </div>
        {/* Reference */}
        <span className="text-[12px] font-mono text-[#8b8fa8]">
          {receipt.referenceNumber}
        </span>
        {/* Amount */}
        <span className="text-[13px] font-mono font-bold text-[#00e5a0]">
          {formatXAF(receipt.amount)} CFA
        </span>
        {/* Token ID */}
        <span className="text-[12px] font-mono text-[#4f9cf9]">
          {receipt.sbt?.tokenId ? `#${receipt.sbt.tokenId}` : "—"}
        </span>
        {/* Status + expand */}
        <div className="flex items-center gap-2">
          {statusBadge}
          <ChevronDown
            className={cn(
              "w-3.5 h-3.5 text-[#3e4155] transition-transform duration-200",
              isExpanded && "rotate-180",
            )}
          />
        </div>
      </button>

      {/* Expanded detail */}
      <div
        ref={detailRef}
        style={{ height: 0, overflow: "hidden", opacity: 0 }}
      >
        <div className="px-5 pb-5">
          <div className="bg-[#0f1420] rounded-xl p-4 border border-[rgba(255,255,255,0.06)]">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
              {[
                ["Reference", receipt.referenceNumber],
                ["Student ID", receipt.studentId],
                ["Amount", `${formatXAF(receipt.amount)} CFA`],
                ["Fee Type", receipt.paymentType],
                ["Academic Year", receipt.academicYear],
                ["Level", receipt.level],
                ["Date", formatDateTime(receipt.createdAt)],
                ["Receipt ID", receipt.receiptId.slice(0, 16) + "…"],
              ].map(([k, v]) => (
                <div key={k}>
                  <p className="text-[9.5px] font-mono uppercase tracking-wide text-[#3e4155]">
                    {k}
                  </p>
                  <p className="text-[12px] font-medium text-[#e8eaf0] mt-0.5 capitalize truncate">
                    {v}
                  </p>
                </div>
              ))}
            </div>

            {/* Blockchain details — admin sees full technical info */}
            {mintStatus === "minted" && receipt.sbt && (
              <div className="pt-3 border-t border-[rgba(255,255,255,0.06)] flex flex-col gap-2">
                <p className="text-[10px] font-mono uppercase tracking-wide text-[#3e4155]">
                  On-Chain Details
                </p>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10.5px] font-mono text-[#8b8fa8]">
                        Token ID:
                      </span>
                      <span className="text-[11px] font-mono text-[#4f9cf9]">
                        #{receipt.sbt.tokenId}
                      </span>
                    </div>
                    {receipt.sbt.transactionHash && (
                      <div className="flex items-center gap-2">
                        <span className="text-[10.5px] font-mono text-[#8b8fa8]">
                          Tx Hash:
                        </span>
                        <span className="text-[11px] font-mono text-[#e8eaf0]">
                          {shortHash(receipt.sbt.transactionHash, 8)}
                        </span>
                      </div>
                    )}
                  </div>
                  {receipt.sbt.transactionHash && (
                    <a
                      href={polygonscanTx(receipt.sbt.transactionHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1.5 text-[11.5px] font-mono text-[#4f9cf9] hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" /> View on Polygonscan
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
