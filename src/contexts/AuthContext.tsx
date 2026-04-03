import { createContext, useContext, useEffect, useState } from "react";
import { apiRequest, setCsrfToken } from "@/lib/api";
import type { AppUser } from "@/lib/types";

type RegisterInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
};

type LoginInput = {
  email: string;
  password: string;
};

type AuthContextValue = {
  user: AppUser | null;
  isLoading: boolean;
  refreshSession: () => Promise<void>;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = async () => {
    const data = await apiRequest<{ user: AppUser | null; csrfToken?: string }>("/auth/session");
    setCsrfToken(data.csrfToken);
    setUser(data.user);
  };

  useEffect(() => {
    refreshSession().finally(() => setIsLoading(false));
  }, []);

  const login = async (input: LoginInput) => {
    const data = await apiRequest<{ user: AppUser; csrfToken?: string }>("/auth/login", {
      method: "POST",
      body: input,
    });
    setCsrfToken(data.csrfToken);
    setUser(data.user);
  };

  const register = async (input: RegisterInput) => {
    const data = await apiRequest<{ user: AppUser; csrfToken?: string }>("/auth/register", {
      method: "POST",
      body: input,
    });
    setCsrfToken(data.csrfToken);
    setUser(data.user);
  };

  const logout = async () => {
    await apiRequest("/auth/logout", { method: "POST", body: {} });
    setCsrfToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, refreshSession, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
