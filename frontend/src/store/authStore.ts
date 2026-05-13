import { createContext, useContext } from 'react';
import type { Student } from '@/types';
import type { Address } from 'viem';

export interface AuthState {
  student: Student | null;
  walletAddress: Address | null;
  isConnected: boolean;
  isAuthenticated: boolean;
}

export interface AuthActions {
  setStudent: (s: Student | null) => void;
  setWalletAddress: (addr: Address | null) => void;
  logout: () => void;
}

export type AuthContextType = AuthState & AuthActions;

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
