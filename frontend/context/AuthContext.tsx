"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import api from "@/lib/api";

export interface User {
  _id: string;
  username: string;
  fullName: string;
  email: string;
  avatar: string;
  coverImage?: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
  isLoading: true,
  setUser: () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

const refreshUser = async () => {
  try {
    const res = await api.get("/users/me");
    setUser(res.data.data);
  } catch (err: any) {
    // Only clear user on real auth errors, not network errors etc.
    if (err.response?.status === 401 || err.response?.status === 403) {
      setUser(null);
    }
    // Don't rethrow — let it fail silently on public pages
  }
};

  useEffect(() => {
    refreshUser().finally(() => setIsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = async () => {
    try {
      await api.post("/users/logout");
    } catch {}
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoggedIn: !!user, isLoading, setUser, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
