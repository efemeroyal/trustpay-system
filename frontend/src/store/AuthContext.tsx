import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { Student } from "@/types";
import { connectWallet, switchToAmoy } from "@/services/contractService";

interface AuthState {
  student: Student | null;
  isAuthenticated: boolean;
  isConnecting: boolean;
  walletConnected: boolean;
  login: (studentId: string, password: string) => Promise<void>;
  logout: () => void;
  connectWalletAction: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthState | null>(null);

// Mock student data — replace with real API call
const MOCK_STUDENT: Student = {
  id: "UB22CS041",
  name: "Akosua Kwame",
  faculty: "Faculty of Engineering & Technology",
  level: "Level 300",
  university: "University of Buea",
  walletAddress: null,
  avatarInitials: "AK",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [student, setStudent] = useState<Student | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (studentId: string, _password: string) => {
    setIsConnecting(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise((r) => setTimeout(r, 1200));
      if (studentId === "UB22CS041" || studentId.length >= 6) {
        const s = { ...MOCK_STUDENT, id: studentId };
        setStudent(s);
        localStorage.setItem("tp_student", JSON.stringify(s));
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const logout = useCallback(() => {
    setStudent(null);
    localStorage.removeItem("tp_student");
    localStorage.removeItem("tp_token");
  }, []);

  const connectWalletAction = useCallback(async () => {
    if (!student) return;
    setIsConnecting(true);
    setError(null);
    try {
      await switchToAmoy();
      const address = await connectWallet();
      setStudent((prev) => (prev ? { ...prev, walletAddress: address } : prev));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsConnecting(false);
    }
  }, [student]);

  return (
    <AuthContext.Provider
      value={{
        student,
        isAuthenticated: !!student,
        isConnecting,
        walletConnected: !!student?.walletAddress,
        login,
        logout,
        connectWalletAction,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
