import type { FeeCategory, FeeItem } from "@/types";

// ─── Address Formatting ────────────────────────────────────────────────────────

export function shortAddress(addr: string, chars = 4): string {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, chars + 2)}…${addr.slice(-chars)}`;
}

export function shortHash(hash: string, chars = 6): string {
  if (!hash || hash.length < 14) return hash;
  return `${hash.slice(0, chars + 2)}…${hash.slice(-chars)}`;
}

// ─── Currency ──────────────────────────────────────────────────────────────────

export function formatXAF(amount: number): string {
  return new Intl.NumberFormat("fr-CM", {
    style: "decimal",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatMATIC(wei: bigint): string {
  const matic = Number(wei) / 1e18;
  return matic.toFixed(6);
}

// ─── Date ──────────────────────────────────────────────────────────────────────

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days >= 1) return `${days}${days === 1 ? "day" : "days"} ago`;
  return formatDate(date);
}

// ─── Fee Catalog ───────────────────────────────────────────────────────────────

export const FEE_CATALOG: FeeItem[] = [
  {
    id: "tuition_sem1",
    label: "Tuition Fee – Semester 1",
    amount: 75000,
    description: "Academic tuition for first semester",
    semester: 1,
    mandatory: true,
  },
  {
    id: "tuition_sem2",
    label: "Tuition Fee – Semester 2",
    amount: 75000,
    description: "Academic tuition for second semester",
    semester: 2,
    mandatory: true,
  },
  {
    id: "registration",
    label: "Registration Fee",
    amount: 35000,
    description: "Annual university registration",
    mandatory: true,
  },
  {
    id: "library",
    label: "Library Clearance Fee",
    amount: 2500,
    description: "Library access and clearance",
    mandatory: false,
  },
  {
    id: "medical",
    label: "Medical Insurance",
    amount: 12000,
    description: "Student health coverage",
    mandatory: true,
  },
  {
    id: "sport",
    label: "Sport Development Fee",
    amount: 5000,
    description: "Sports facilities and activities",
    mandatory: false,
  },
  {
    id: "exam",
    label: "Examination Fee",
    amount: 15000,
    description: "End of semester examinations",
    mandatory: true,
  },
];

export function getFeeById(id: FeeCategory): FeeItem | undefined {
  return FEE_CATALOG.find((f) => f.id === id);
}

// ─── Misc ──────────────────────────────────────────────────────────────────────

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export const POLYGONSCAN_BASE = "https://amoy.polygonscan.com";

export function polygonscanTx(hash: string): string {
  return `${POLYGONSCAN_BASE}/tx/${hash}`;
}

export function polygonscanToken(
  contractAddr: string,
  tokenId: number,
): string {
  return `${POLYGONSCAN_BASE}/token/${contractAddr}?a=${tokenId}`;
}
