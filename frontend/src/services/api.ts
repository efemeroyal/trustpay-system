import axios from "axios";
import type {
  PaymentPayload,
  ApiResponse,
  Payment,
  Receipt,
  PaymentResponse,
  OnChainReceipt,
  InstallmentStatus,
  User,
} from "@/types";

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

export const authApi = {
  login: (email: string, password: string) =>
    api.post<ApiResponse<User & { token: string }>>("/auth/login", { email, password }),
  register: (payload: {
    fullName: string; email: string; password: string;
    studentId: string; programme: string; level: string;
  }) => api.post<ApiResponse<User & { token: string }>>("/auth/register/student", payload),
  getProfile: () => api.get<ApiResponse<User>>("/auth/profile"),
};

export const paymentApi = {
  initiate: (payload: PaymentPayload) =>
    api.post<ApiResponse<PaymentResponse>>("/payments/initiate", payload),
  getMyPayments: () => api.get<ApiResponse<Payment[]>>("/payments/my-payments"),
};

export const receiptApi = {
  getMyReceipts: () => api.get<ApiResponse<Receipt[]>>("/receipts/my-receipts"),
  getOnChainReceipt: (tokenId: string) =>
    api.get<ApiResponse<OnChainReceipt>>(`/receipts/on-chain/${tokenId}`),
};

export const historyApi = {
  getInstallmentStatus: (academicYear?: string) =>
    api.get<ApiResponse<InstallmentStatus[]>>("/history/installments", {
      params: academicYear ? { academicYear } : {},
    }),
};

export default api;
