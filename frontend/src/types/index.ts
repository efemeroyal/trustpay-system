// ─── Core Domain Types ────────────────────────────────────────────────────────

export type FeeCategory =
  | 'tuition_sem1'
  | 'tuition_sem2'
  | 'registration'
  | 'library'
  | 'medical'
  | 'sport'
  | 'exam';

export type PaymentStatus = 'idle' | 'initiating' | 'pending' | 'confirmed' | 'failed';
export type MintStatus = 'idle' | 'uploading_ipfs' | 'minting' | 'confirming' | 'minted' | 'failed';
export type TxStatus = 'success' | 'pending' | 'failed';
export type MoMoProvider = 'mtn' | 'orange';

// ─── Wallet / Auth ─────────────────────────────────────────────────────────────

export interface Student {
  id: string;          // e.g. "UB22CS041"
  name: string;
  faculty: string;
  level: string;
  university: string;
  walletAddress: `0x${string}` | null;
  avatarInitials: string;
}

// ─── Fee ───────────────────────────────────────────────────────────────────────

export interface FeeItem {
  id: FeeCategory;
  label: string;
  amount: number;       // in XAF
  description: string;
  semester?: 1 | 2;
  mandatory: boolean;
}

// ─── Transaction ───────────────────────────────────────────────────────────────

export interface Transaction {
  id: string;
  feeLabel: string;
  feeCategory: FeeCategory;
  amount: number;
  status: TxStatus;
  txHash?: `0x${string}`;
  sbtTokenId?: number;
  blockNumber?: bigint;
  timestamp: Date;
  ipfsCid?: string;
  momoRef?: string;
}

// ─── SBT Receipt ───────────────────────────────────────────────────────────────

export interface SBTReceipt {
  tokenId: number;
  studentId: string;
  studentName: string;
  university: string;
  feeLabel: string;
  feeCategory: FeeCategory;
  amount: number;
  txHash: `0x${string}`;
  blockNumber: bigint;
  mintedAt: Date;
  ipfsCid: string;
  contractAddress: `0x${string}`;
}

// ─── Minting Step ──────────────────────────────────────────────────────────────

export interface MintStep {
  id: string;
  label: string;
  description: string;
  status: 'done' | 'active' | 'queued' | 'error';
  detail?: string;
}

// ─── Notification ─────────────────────────────────────────────────────────────

export interface AppNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

// ─── Chain Activity ────────────────────────────────────────────────────────────

export interface ChainEvent {
  type: 'MINT' | 'VERIFY' | 'FAIL';
  hash: `0x${string}`;
  blockNumber: number;
  timestamp: Date;
}

// ─── Dashboard Stats ───────────────────────────────────────────────────────────

export interface DashboardStats {
  totalPaid: number;
  sbtCount: number;
  pendingCount: number;
  gasCost: number;
  weeklyData: number[];
}
