import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { authApi } from "@/services/api";
import { wsManager } from "@/services/websocket";
import type { User } from "@/types";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    fullName: string;
    email: string;
    password: string;
    studentId: string;
    programme: string;
    level: string;
  }) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  getProfile: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const s = localStorage.getItem("trustpay_user");
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("trustpay_token"),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getProfile = useCallback(async () => {
    if (!token) return null;

    try {
      const res = await authApi.getProfile();
      setUser(res.data.data);
      localStorage.setItem("trustpay_user", JSON.stringify(res.data.data));
      return res.data.data;
    } catch (err) {
      setUser(null);
      setToken(null);
      localStorage.removeItem("trustpay_user");
      localStorage.removeItem("trustpay_token");
      return null;
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      localStorage.setItem("trustpay_token", token);
      if (!user) {
        getProfile();
      }
      wsManager.connect();
    } else {
      wsManager.disconnect();
    }
  }, [token, user, getProfile]);

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await authApi.login(email, password);
        const { token: newToken } = res.data.data;
        setToken(newToken);
        localStorage.setItem("trustpay_token", newToken);
        const profile = await getProfile();
        if (!profile) {
          throw new Error("Failed to load user profile");
        }
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ?? "Invalid email or password";
        setError(msg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [getProfile],
  );

  const register = useCallback(
    async (payload: {
      fullName: string;
      email: string;
      password: string;
      studentId: string;
      programme: string;
      level: string;
    }) => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await authApi.register(payload);
        const { token: newToken } = res.data.data;
        setToken(newToken);
        localStorage.setItem("trustpay_token", newToken);
        const profile = await getProfile();
        if (!profile) {
          throw new Error("Failed to load user profile");
        }
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ?? "Registration failed.";
        setError(msg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [getProfile],
  );

  const logout = useCallback(() => {
    localStorage.removeItem("trustpay_token");
    localStorage.removeItem("trustpay_user");
    setUser(null);
    setToken(null);
    setError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        error,
        login,
        register,
        logout,
        clearError: () => setError(null),
        getProfile,
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
