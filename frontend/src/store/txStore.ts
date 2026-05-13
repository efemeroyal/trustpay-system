import { createContext, useContext } from 'react';
import type { Transaction, ChainEvent } from '@/types';

export interface TxState {
  transactions: Transaction[];
  chainEvents: ChainEvent[];
  activeTransaction: Transaction | null;
}

export interface TxActions {
  addTransaction: (tx: Transaction) => void;
  updateTransaction: (id: string, patch: Partial<Transaction>) => void;
  setActiveTransaction: (tx: Transaction | null) => void;
  addChainEvent: (event: ChainEvent) => void;
}

export type TxContextType = TxState & TxActions;
export const TxContext = createContext<TxContextType | null>(null);

export function useTxStore(): TxContextType {
  const ctx = useContext(TxContext);
  if (!ctx) throw new Error('useTxStore must be inside TxProvider');
  return ctx;
}
