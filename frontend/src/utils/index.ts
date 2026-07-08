import type { FeeItem } from "@/types";

// ─── Class names ──────────────────────────────────────────────────────────────
export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

// ─── Currency ─────────────────────────────────────────────────────────────────
export function formatXAF(amount: number): string {
  return new Intl.NumberFormat("fr-CM", {
    style: "decimal",
    minimumFractionDigits: 0,
  }).format(amount);
}

// ─── Date ─────────────────────────────────────────────────────────────────────
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function timeAgo(date: string | Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ─── Hash shortener ───────────────────────────────────────────────────────────
export function shortHash(hash: string, chars = 6): string {
  if (!hash || hash.length < 14) return hash;
  return `${hash.slice(0, chars + 2)}…${hash.slice(-chars)}`;
}

// ─── ID generator ─────────────────────────────────────────────────────────────
export function generateId(): string {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

// ─── Polygonscan ──────────────────────────────────────────────────────────────
export const POLYGONSCAN_BASE = "https://amoy.polygonscan.com";
export function polygonscanTx(hash: string): string {
  return `${POLYGONSCAN_BASE}/tx/${hash}`;
}

// ─── Fee Catalog ──────────────────────────────────────────────────────────────
export const FEE_CATALOG: FeeItem[] = [
  {
    id: "tuition_sem1",
    label: "Tuition — Semester 1",
    amount: 75000,
    description: "First semester academic fees",
    semester: 1,
    mandatory: true,
    paymentType: "tuition",
  },
  {
    id: "tuition_sem2",
    label: "Tuition — Semester 2",
    amount: 75000,
    description: "Second semester academic fees",
    semester: 2,
    mandatory: true,
    paymentType: "tuition",
  },
  {
    id: "registration",
    label: "Registration Fee",
    amount: 35000,
    description: "Annual university registration",
    mandatory: true,
    paymentType: "registration",
  },
  {
    id: "library",
    label: "Library Clearance",
    amount: 2500,
    description: "Library access and clearance",
    mandatory: false,
    paymentType: "library",
  },
  {
    id: "medical",
    label: "Medical Insurance",
    amount: 12000,
    description: "Student health coverage",
    mandatory: true,
    paymentType: "other",
  },
  {
    id: "sport",
    label: "Sport Development",
    amount: 5000,
    description: "Sports facilities and activities",
    mandatory: false,
    paymentType: "other",
  },
  {
    id: "exam",
    label: "Examination Fee",
    amount: 15000,
    description: "End of semester examinations",
    mandatory: true,
    paymentType: "other",
  },
];

export function getFeeById(id: string): FeeItem | undefined {
  return FEE_CATALOG.find((f) => f.id === id);
}

// ─── Academic year ────────────────────────────────────────────────────────────
export function currentAcademicYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  return month >= 9 ? `${year}/${year + 1}` : `${year - 1}/${year}`;
}
