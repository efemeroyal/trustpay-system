import axios from "axios";
import type { ApiResponse, Receipt, User } from "@/types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:5000/api",
  timeout: 30_000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("trustpay_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("trustpay_token");
      localStorage.removeItem("trustpay_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ─── Verification ─────────────────────────────────────────────────────────────
export const verifyApi = {
  verifyReceipt: (referenceNumber: string, studentId: string) =>
    api.post<ApiResponse<{
      status: "VALID" | "INVALID" | "DUPLICATE";
      message: string;
      data?: {
        referenceNumber: string;
        studentName: string;
        studentId: string;
        amount: number;
        paymentType: string;
        academicYear: string;
        level: string;
        verifiedAt: string;
      };
    }>>("/verify/verify", { referenceNumber, studentId }),

  getVerificationHistory: () =>
    api.get<ApiResponse<Array<{
      _id: string;
      referenceNumber: string;
      studentId: string;
      amount: number;
      paymentType: string;
      verifiedAt: string;
      verifiedBy: { fullName: string };
    }>>>("/verify/history"),
};

// ─── Receipts (admin) ─────────────────────────────────────────────────────────
export const adminReceiptApi = {
  getAllReceipts: () =>
    api.get<ApiResponse<Receipt[]>>("/receipts/all"),

  getStudentHistory: (studentId: string, academicYear?: string) =>
    api.get<ApiResponse<Receipt[]>>(`/history/student/${studentId}`, {
      params: academicYear ? { academicYear } : {},
    }),
};

// ─── Analytics ────────────────────────────────────────────────────────────────
export const analyticsApi = {
  getDashboardStats: (academicYear?: string) =>
    api.get<ApiResponse<{
      totalPayments: number;
      totalRevenue: number;
      totalStudents: number;
      verifiedReceipts: number;
      pendingVerifications: number;
      failedPayments: number;
      revenueByType: Array<{ _id: string; total: number; count: number }>;
      paymentsByLevel: Array<{ _id: string; total: number; count: number }>;
    }>>("/analytics/dashboard", {
      params: academicYear ? { academicYear } : {},
    }),
};

// ─── Required fees ────────────────────────────────────────────────────────────
export const requiredFeeApi = {
  getAll: () =>
    api.get<ApiResponse<Array<{
      _id: string;
      paymentType: string;
      academicYear: string;
      level: string;
      requiredAmount: number;
    }>>>("/history/required-fees"),

  set: (payload: {
    paymentType: string;
    academicYear: string;
    level: string;
    requiredAmount: number;
  }) => api.post("/history/required-fees", payload),
};

export default api;
