"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthContextType {
  isLoggedIn: boolean;
  isPremium: boolean;
  userId: number | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    fetch("http://localhost:5000/session", { credentials: "include" })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.user_id) {
          setIsLoggedIn(true);
          setIsPremium(!!data.is_premium);
          setUserId(data.user_id);
        }
      });
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    setIsLoggedIn(true);
    setIsPremium(!!data.is_premium);
    setUserId(data.user_id);
  };

  const logout = () => {
    fetch("http://localhost:5000/logout", { method: "POST", credentials: "include" });
    setIsLoggedIn(false);
    setIsPremium(false);
    setUserId(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, isPremium, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
