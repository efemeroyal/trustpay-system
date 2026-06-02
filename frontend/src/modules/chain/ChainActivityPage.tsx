import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { Activity, ExternalLink, RefreshCw } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { shortHash, formatXAF } from "@/utils";
import { cn } from "@/utils";

interface ChainEvent {
  type: "MINT" | "VERIFY" | "FAIL";
  hash: string;
  blockNumber: number;
  from: string;
  to: string;
  tokenId?: number;
  amount?: number;
  age: string;
}

const MOCK_EVENTS: ChainEvent[] = [
  {
    type: "MINT",
    hash: "0x7da3fc28d91e45a8b312c4f09e7b12c440f99",
    blockNumber: 58204119,
    from: "0x0000…0000",
    to: "0x3f9a…c7d2",
    tokenId: 7,
    amount: 75000,
    age: "2m ago",
  },
  {
    type: "VERIFY",
    hash: "0x22cd9f47ae3b19fa0cde7bcfe8bfa30100afc",
    blockNumber: 58204071,
    from: "0x9b2e…f1a4",
    to: "0x0000…0000",
    tokenId: 6,
    amount: 0,
    age: "14m ago",
  },
  {
    type: "MINT",
    hash: "0x9fc4aab31c2017e38decd1bfc94c10cde880",
    blockNumber: 58203988,
    from: "0x0000…0000",
    to: "0x7c1d…a3b5",
    tokenId: 12,
    amount: 12000,
    age: "1h ago",
  },
  {
    type: "FAIL",
    hash: "0xae01be445f7743ffdc3e18c84a0b2e9127a4",
    blockNumber: 58203901,
    from: "0x4f2e…dd01",
    to: "0x0000…0000",
    tokenId: undefined,
    amount: 5000,
    age: "2h ago",
  },
  {
    type: "MINT",
    hash: "0x1bc8d3a27cf4e590f1ea733d94b0c2017e38",
    blockNumber: 58203744,
    from: "0x0000…0000",
    to: "0xab3c…9fe2",
    tokenId: 11,
    amount: 35000,
    age: "3h ago",
  },
  {
    type: "MINT",
    hash: "0xd4f19e3c87b20a51cf4d8e027b3a91e00f42",
    blockNumber: 58203521,
    from: "0x0000…0000",
    to: "0x2d7e…c4a1",
    tokenId: 10,
    amount: 75000,
    age: "5h ago",
  },
];

export function ChainActivityPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const rowsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rowsRef.current) return;
    const rows = rowsRef.current.querySelectorAll(".chain-row");
    gsap.fromTo(
      rows,
      { x: -8, opacity: 0 },
      { x: 0, opacity: 1, stagger: 0.06, duration: 0.35, ease: "power2.out" },
    );
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((r) => setTimeout(r, 900));
    setIsRefreshing(false);
  };

  const typeBadge = (type: ChainEvent["type"]) => {
    const map = {
      MINT: { variant: "success" as const, label: "MINT" },
      VERIFY: { variant: "info" as const, label: "VERIFY" },
      FAIL: { variant: "failed" as const, label: "FAIL" },
    };
    const { variant, label } = map[type];
    return <Badge variant={variant}>{label}</Badge>;
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Chain Activity
          </h1>
          <p className="text-sm text-[#8b8fa8] mt-0.5">
            Live events from TrustPay contract · Polygon Amoy Testnet
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          icon={
            <RefreshCw
              className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin")}
            />
          }
          onClick={handleRefresh}
        >
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Latest Block", value: "#58,204,119", color: "#00e5a0" },
          {
            label: "Total Events",
            value: MOCK_EVENTS.length.toString(),
            color: "#4f9cf9",
          },
          { label: "Avg Gas", value: "~0.00001 MATIC", color: "#f5a623" },
          { label: "Network", value: "Amoy Testnet", color: "#8b8fa8" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-[#0f1117] border border-[rgba(255,255,255,0.07)] rounded-xl p-4"
          >
            <p className="text-[10px] font-mono uppercase tracking-wide text-[#8b8fa8] mb-1">
              {s.label}
            </p>
            <p
              className="font-semibold text-sm font-mono"
              style={{ color: s.color }}
            >
              {s.value}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 p-4 bg-[#0f1117] border border-[rgba(255,255,255,0.07)] rounded-xl">
        <div className="flex-1">
          <p className="text-[10px] font-mono uppercase tracking-wide text-[#8b8fa8] mb-1">
            Contract Address
          </p>
          <p className="font-mono text-[12.5px] text-[#4f9cf9] break-all">
            0x742d35Cc6634C0532925a3b8D4C9D8B1F3E7A21
          </p>
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-mono uppercase tracking-wide text-[#8b8fa8] mb-1">
            Standard
          </p>
          <p className="font-mono text-[12.5px]">
            ERC-5192 · Minimal Soulbound Token
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          icon={<ExternalLink className="w-3.5 h-3.5" />}
          className="self-start sm:self-center"
        >
          Polygonscan
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle icon={<Activity className="w-4 h-4" />}>
            Recent Events
          </CardTitle>
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#00e5a0]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00e5a0] pulse-dot" />
            Streaming
          </div>
        </CardHeader>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.06)]">
                {[
                  "Event",
                  "Tx Hash",
                  "Block",
                  "From",
                  "To",
                  "Token",
                  "Amount",
                  "Age",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-2.5 text-[10px] font-mono uppercase tracking-wide text-[#3e4155] font-normal"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_EVENTS.map((e, i) => (
                <tr
                  key={i}
                  className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                >
                  <td className="px-5 py-3">{typeBadge(e.type)}</td>
                  <td className="px-5 py-3 font-mono text-[#4f9cf9] text-[11px]">
                    {shortHash(e.hash, 5)}
                  </td>
                  <td className="px-5 py-3 font-mono text-[#8b8fa8]">
                    #{e.blockNumber.toLocaleString()}
                  </td>
                  <td className="px-5 py-3 font-mono text-[#8b8fa8] text-[11px]">
                    {e.from}
                  </td>
                  <td className="px-5 py-3 font-mono text-[#8b8fa8] text-[11px]">
                    {e.to}
                  </td>
                  <td className="px-5 py-3 font-mono">
                    {e.tokenId ? "#" + e.tokenId : "—"}
                  </td>
                  <td className="px-5 py-3 font-mono text-[#00e5a0]">
                    {e.amount ? "CFA " + formatXAF(e.amount) : "—"}
                  </td>
                  <td className="px-5 py-3 font-mono text-[#3e4155] text-[11px]">
                    {e.age}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div
          ref={rowsRef}
          className="md:hidden divide-y divide-[rgba(255,255,255,0.04)]"
        >
          {MOCK_EVENTS.map((e, i) => (
            <div key={i} className="chain-row px-4 py-3 flex items-start gap-3">
              <div className="flex-shrink-0 pt-0.5">{typeBadge(e.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="font-mono text-[11px] text-[#4f9cf9] truncate">
                  {shortHash(e.hash, 7)}
                </p>
                <p className="font-mono text-[10.5px] text-[#8b8fa8] mt-0.5">
                  Block #{e.blockNumber.toLocaleString()} · {e.age}
                </p>
                {e.tokenId && (
                  <p className="font-mono text-[10.5px] mt-0.5">
                    Token #{e.tokenId}
                  </p>
                )}
              </div>
              {e.amount ? (
                <p className="font-mono font-bold text-[12px] text-[#00e5a0] flex-shrink-0">
                  {formatXAF(e.amount)} CFA
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
