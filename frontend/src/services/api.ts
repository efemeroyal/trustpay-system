import axios from "axios";
import type { MoMoProvider, FeeCategory } from "@/types";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

const api = axios.create({
  baseURL: BASE,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("tp_token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// ─── Auth ──────────────────────────────────────────────────────────────────────

export async function loginStudent(studentId: string, password: string) {
  const { data } = await api.post("/auth/login", { studentId, password });
  return data;
}

export async function linkWallet(walletAddress: string) {
  const { data } = await api.post("/auth/link-wallet", { walletAddress });
  return data;
}

// ─── Payment ──────────────────────────────────────────────────────────────────

export async function initiatePayment(params: {
  studentId: string;
  feeCategory: FeeCategory;
  amount: number;
  phoneNumber: string;
  provider: MoMoProvider;
}) {
  const { data } = await api.post("/payment/initiate", params);
  return data as { referenceId: string; status: string };
}

export async function checkPaymentStatus(referenceId: string) {
  const { data } = await api.get(`/payment/status/${referenceId}`);
  return data as {
    status: "pending" | "confirmed" | "failed";
    momoRef: string;
  };
}

// ─── Minting ──────────────────────────────────────────────────────────────────

export async function mintReceipt(params: {
  studentId: string;
  feeCategory: FeeCategory;
  amount: number;
  walletAddress: string;
  momoRef: string;
}) {
  const { data } = await api.post("/mint", params);
  return data as { txHash: string; tokenId: number; ipfsCid: string };
}

// ─── Receipts ─────────────────────────────────────────────────────────────────

export async function getStudentReceipts(studentId: string) {
  const { data } = await api.get(`/receipts/${studentId}`);
  return data;
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export async function verifyByWallet(walletAddress: string) {
  const { data } = await api.get(`/admin/verify/wallet/${walletAddress}`);
  return data;
}

export async function verifyByStudentId(studentId: string) {
  const { data } = await api.get(`/admin/verify/student/${studentId}`);
  return data;
}

export default api;
