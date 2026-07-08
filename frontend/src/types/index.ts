// ─── User & Auth ──────────────────────────────────────────────────────────────
export interface User {
  _id: string;
  fullName: string;
  email: string;
  role: "student" | "admin";
  studentId?: string;
  programme?: string;
  level?: string;
  walletAddress?: string;
}

// ─── Payment ──────────────────────────────────────────────────────────────────
export type PaymentStatus = "pending" | "success" | "failed";
export type PaymentType =
  | "tuition"
  | "registration"
  | "hostel"
  | "library"
  | "other";
export type MoMoProvider = "MTN" | "Orange";

export interface Payment {
  _id: string;
  studentId: string;
  amount: number;
  paymentType: PaymentType;
  academicYear: string;
  level: string;
  momoProvider: MoMoProvider;
  momoNumber: string;
  status: PaymentStatus;
  transactionReference: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentPayload {
  amount: number;
  paymentType: PaymentType;
  academicYear: string;
  level: string;
  momoProvider: MoMoProvider;
  momoNumber: string;
}

export interface PaymentResponse {
  referenceNumber: string;
  amount: number;
  paymentType: PaymentType;
  academicYear: string;
  qrCode: string;
  createdAt: string;
  sbt: {
    tokenId?: string;
    transactionHash?: string;
    mintStatus: "pending" | "minted" | "failed";
  } | null;
}

// ─── Receipt ──────────────────────────────────────────────────────────────────
export interface Receipt {
  _id: string;
  payment: string | Payment;
  studentId: string;
  receiptId: string;
  referenceNumber: string;
  qrCodeData: string;
  ipfsCID?: string;
  amount: number;
  paymentType: PaymentType;
  academicYear: string;
  level: string;
  isVerified: boolean;
  verificationStatus?: "pending" | "validated" | "rejected";
  verifiedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  sbt?: {
    tokenId?: string;
    transactionHash?: string;
    mintStatus: "pending" | "minted" | "failed";
  };
}

// ─── On-chain receipt ─────────────────────────────────────────────────────────
export interface OnChainReceipt {
  tokenId: string;
  transactionHash: string;
  contractAddress: string;
  polygonscanUrl: string;
  metadata: {
    receiptId: string;
    referenceNumber: string;
    studentId: string;
    amount: number;
    paymentType: string;
    academicYear: string;
    level: string;
    issuedAt: string;
    issuer: string;
    network: string;
  };
}

// ─── Installment ──────────────────────────────────────────────────────────────
export interface InstallmentStatus {
  paymentType: PaymentType;
  requiredAmount: number;
  totalPaid: number;
  remaining: number;
  progress: number;
  cleared: boolean;
  academicYear: string;
  level: string;
}

// ─── Fee catalog ──────────────────────────────────────────────────────────────
export type FeeCategory =
  | "tuition_sem1"
  | "tuition_sem2"
  | "registration"
  | "library"
  | "medical"
  | "sport"
  | "exam";

export interface FeeItem {
  id: FeeCategory;
  label: string;
  amount: number;
  description: string;
  semester?: number;
  mandatory: boolean;
  paymentType: PaymentType;
}

// ─── Mint steps (UI only) ─────────────────────────────────────────────────────
export type MintStepStatus = "queued" | "active" | "done" | "error";

export interface MintStep {
  id: string;
  label: string;
  description: string;
  status: MintStepStatus;
  detail?: string;
}

// ─── Notifications ────────────────────────────────────────────────────────────
export interface AppNotification {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

// ─── API wrapper ──────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  message?: string;
}
