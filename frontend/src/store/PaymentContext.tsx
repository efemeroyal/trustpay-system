import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Transaction, PaymentStatus, MintStatus, MintStep, SBTReceipt, FeeCategory } from '@/types'
import { generateId } from '@/utils'

interface PaymentState {
  transactions: Transaction[]
  receipts: SBTReceipt[]
  paymentStatus: PaymentStatus
  mintStatus: MintStatus
  mintSteps: MintStep[]
  currentTx: Transaction | null
  dashboardStats: { totalPaid: number; sbtCount: number; pendingCount: number; weeklyData: number[] }
  addTransaction: (tx: Omit<Transaction, 'id' | 'timestamp'>) => string
  updateTransaction: (id: string, updates: Partial<Transaction>) => void
  setPaymentStatus: (s: PaymentStatus) => void
  setMintStatus: (s: MintStatus) => void
  updateMintStep: (id: string, updates: Partial<MintStep>) => void
  resetMintSteps: () => void
  addReceipt: (r: SBTReceipt) => void
  setCurrentTx: (tx: Transaction | null) => void
}

const PaymentContext = createContext<PaymentState | null>(null)

const DEFAULT_MINT_STEPS: MintStep[] = [
  { id: 'payment', label: 'MoMo payment confirmed', description: 'Waiting for MTN/Orange webhook', status: 'queued' },
  { id: 'verify', label: 'Amount verified', description: 'Checksum validation', status: 'queued' },
  { id: 'ipfs', label: 'Metadata uploaded to IPFS', description: 'Pinning receipt data', status: 'queued' },
  { id: 'mint', label: 'Minting SBT on Polygon', description: 'ERC-5192 smart contract', status: 'queued' },
  { id: 'notify', label: 'Receipt delivered', description: 'WebSocket push notification', status: 'queued' },
]

const MOCK_RECEIPTS: SBTReceipt[] = [
  {
    tokenId: 7,
    studentId: 'UB22CS041',
    studentName: 'Akosua Kwame',
    university: 'University of Buea',
    feeLabel: 'Tuition Fee – Semester 2',
    feeCategory: 'tuition_sem2',
    amount: 75000,
    txHash: '0x7da3fc28d91e45a8b312c4f09e7b12c440f991cd' as `0x${string}`,
    blockNumber: BigInt(58204119),
    mintedAt: new Date(),
    ipfsCid: 'bafybeig3xk9q',
    contractAddress: '0x0000000000000000000000000000000000000000' as `0x${string}`,
  },
  {
    tokenId: 6,
    studentId: 'UB22CS041',
    studentName: 'Akosua Kwame',
    university: 'University of Buea',
    feeLabel: 'Tuition Fee – Semester 1',
    feeCategory: 'tuition_sem1',
    amount: 75000,
    txHash: '0x22cd9f47ae3b19fa0cde7bcfe8bfa301' as `0x${string}`,
    blockNumber: BigInt(58203988),
    mintedAt: new Date(Date.now() - 86400000 * 30),
    ipfsCid: 'bafybeih7xm2p',
    contractAddress: '0x0000000000000000000000000000000000000000' as `0x${string}`,
  },
  {
    tokenId: 5,
    studentId: 'UB22CS041',
    studentName: 'Akosua Kwame',
    university: 'University of Buea',
    feeLabel: 'Medical Insurance',
    feeCategory: 'medical',
    amount: 12000,
    txHash: '0x9fc4aab31c2017e38de' as `0x${string}`,
    blockNumber: BigInt(58201055),
    mintedAt: new Date(Date.now() - 86400000 * 45),
    ipfsCid: 'bafybeia4nm1r',
    contractAddress: '0x0000000000000000000000000000000000000000' as `0x${string}`,
  },
]

const MOCK_TXS: Transaction[] = [
  { id: 'T1', feeLabel: 'Tuition Fee – Semester 2', feeCategory: 'tuition_sem2', amount: 75000, status: 'success', txHash: '0x7da3fc28d91e45a8b312c4f09e7b12c440f991cd' as `0x${string}`, sbtTokenId: 7, timestamp: new Date(), ipfsCid: 'bafybeig3xk9q' },
  { id: 'T2', feeLabel: 'Library Clearance Fee', feeCategory: 'library', amount: 2500, status: 'pending', timestamp: new Date(Date.now() - 600000) },
  { id: 'T3', feeLabel: 'Tuition Fee – Semester 1', feeCategory: 'tuition_sem1', amount: 75000, status: 'success', txHash: '0x22cd9f47ae3b19fa0cde7bcfe8bfa301' as `0x${string}`, sbtTokenId: 6, timestamp: new Date(Date.now() - 86400000 * 30) },
  { id: 'T4', feeLabel: 'Sport Development Fee', feeCategory: 'sport', amount: 5000, status: 'failed', timestamp: new Date(Date.now() - 86400000 * 32) },
  { id: 'T5', feeLabel: 'Medical Insurance', feeCategory: 'medical', amount: 12000, status: 'success', txHash: '0x9fc4aab31c2017e38de' as `0x${string}`, sbtTokenId: 5, timestamp: new Date(Date.now() - 86400000 * 45) },
]

export function PaymentProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TXS)
  const [receipts, setReceipts] = useState<SBTReceipt[]>(MOCK_RECEIPTS)
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle')
  const [mintStatus, setMintStatus] = useState<MintStatus>('idle')
  const [mintSteps, setMintSteps] = useState<MintStep[]>(DEFAULT_MINT_STEPS)
  const [currentTx, setCurrentTx] = useState<Transaction | null>(null)

  const addTransaction = useCallback((tx: Omit<Transaction, 'id' | 'timestamp'>) => {
    const id = generateId()
    setTransactions(prev => [{ ...tx, id, timestamp: new Date() }, ...prev])
    return id
  }, [])

  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
  }, [])

  const updateMintStep = useCallback((stepId: string, updates: Partial<MintStep>) => {
    setMintSteps(prev => prev.map(s => s.id === stepId ? { ...s, ...updates } : s))
  }, [])

  const resetMintSteps = useCallback(() => {
    setMintSteps(DEFAULT_MINT_STEPS.map(s => ({ ...s, status: 'queued' })))
  }, [])

  const addReceipt = useCallback((r: SBTReceipt) => {
    setReceipts(prev => [r, ...prev])
  }, [])

  const totalPaid = receipts.reduce((a, r) => a + r.amount, 0)
  const pendingCount = transactions.filter(t => t.status === 'pending').length

  return (
    <PaymentContext.Provider value={{
      transactions, receipts, paymentStatus, mintStatus, mintSteps, currentTx,
      dashboardStats: {
        totalPaid, sbtCount: receipts.length, pendingCount,
        weeklyData: [2, 0, 5, 3, 8, 1, 4],
      },
      addTransaction, updateTransaction, setPaymentStatus, setMintStatus,
      updateMintStep, resetMintSteps, addReceipt, setCurrentTx,
    }}>
      {children}
    </PaymentContext.Provider>
  )
}

export function usePayment() {
  const ctx = useContext(PaymentContext)
  if (!ctx) throw new Error('usePayment outside provider')
  return ctx
}
