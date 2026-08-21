"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export type RoleType = "USER" | "MONITOR" | "ADMIN";

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  role: RoleType;
  avatar?: string | null;
  monitorId?: string | null;
  status?: string;
  age?: number;
  gender?: string;
  heightCm?: number;
  weightKg?: number;
  goal?: string;
  bloodType?: string;
  phone?: string;
  specialization?: string;
  experienceYears?: number;
}

interface AuthContextType {
  user: CurrentUser | null;
  role: RoleType | null;
  loading: boolean;
  login: (email: string, password: string, expectedRole?: RoleType) => Promise<{ success: boolean; redirectUrl?: string; error?: string }>;
  registerUser: (data: any) => Promise<{ success: boolean; redirectUrl?: string; error?: string }>;
  registerMonitor: (data: any) => Promise<{ success: boolean; redirectUrl?: string; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data?.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      }
    } catch (err) {
      console.warn("Failed to check auth session", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string, expectedRole?: RoleType) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, expectedRole }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Login failed" };
      }

      setUser(data.user);
      return { success: true, redirectUrl: data.redirectUrl || "/" };
    } catch (err: any) {
      return { success: false, error: err.message || "Network error" };
    }
  };

  const registerUser = async (formData: any) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Registration failed" };
      }

      setUser(data.user);
      return { success: true, redirectUrl: "/" };
    } catch (err: any) {
      return { success: false, error: err.message || "Network error" };
    }
  };

  const registerMonitor = async (formData: any) => {
    try {
      const res = await fetch("/api/auth/monitor/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Monitor registration failed" };
      }

      setUser(data.user);
      return { success: true, redirectUrl: "/monitor/users" };
    } catch (err: any) {
      return { success: false, error: err.message || "Network error" };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/auth/login");
    } catch (e) {
      setUser(null);
      router.push("/auth/login");
    }
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        loading,
        login,
        registerUser,
        registerMonitor,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
