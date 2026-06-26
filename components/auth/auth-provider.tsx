"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { type User } from "@/lib/api";
import { clearToken, getMe, getToken, logout, setToken } from "@/lib/auth";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  user: User | null;
  status: AuthStatus;
  /** Store the token and mark the session authenticated. */
  signIn: (token: string, user: User) => void;
  /** Revoke the token (best-effort) and return to /login. */
  signOut: () => Promise<void>;
  /** Re-validate the stored token against /auth/me. */
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  const refresh = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setStatus("unauthenticated");
      return;
    }
    try {
      setUser(await getMe(token));
      setStatus("authenticated");
    } catch {
      // Token missing/expired/revoked — drop it.
      clearToken();
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  useEffect(() => {
    // One-time client-only hydration: the token cookie can't be read during
    // SSR, so the session is resolved here on mount. The synchronous setState
    // in the no-token branch is intentional (matches CountdownTimer's pattern).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  const signIn = useCallback((token: string, nextUser: User) => {
    setToken(token);
    setUser(nextUser);
    setStatus("authenticated");
  }, []);

  const signOut = useCallback(async () => {
    const token = getToken();
    if (token) {
      try {
        await logout(token);
      } catch {
        // Best-effort: clear locally even if the server call fails.
      }
    }
    clearToken();
    setUser(null);
    setStatus("unauthenticated");
    router.replace("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, status, signIn, signOut, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an <AuthProvider>.");
  }
  return context;
}
