"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { wallet as walletEnv } from "@/lib/site";

type Theme = "dark" | "light";
type Toast = { id: string; title: string; body?: string };

type AppState = {
  ready: boolean;
  theme: Theme;
  setTheme: (t: Theme) => void;
  wallet: string | null;
  connect: (kind: string) => void;
  disconnect: () => void;
  setWallet: (addr: string | null) => void;
  toasts: Toast[];
  pushToast: (title: string, body?: string) => void;
};

const Ctx = createContext<AppState | null>(null);
const THEME_KEY = "helix.fun.theme";
const WALLET_KEY = "helix.fun.wallet";

function loadJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [theme, setThemeState] = useState<Theme>("dark");
  const [wallet, setWallet] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    // Restore client-only persisted UI after hydration.
    /* eslint-disable react-hooks/set-state-in-effect -- localStorage bootstrap */
    const t = loadJson<Theme>(THEME_KEY, "dark");
    const w = loadJson<string | null>(WALLET_KEY, null);
    setThemeState(t === "light" ? "light" : "dark");
    if (!walletEnv.live) setWallet(w);
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.classList.toggle("light", theme === "light");
    localStorage.setItem(THEME_KEY, JSON.stringify(theme));
  }, [theme, ready]);

  useEffect(() => {
    if (!ready || walletEnv.live) return;
    if (wallet) localStorage.setItem(WALLET_KEY, JSON.stringify(wallet));
    else localStorage.removeItem(WALLET_KEY);
  }, [wallet, ready]);

  const setTheme = useCallback((t: Theme) => {
    document.documentElement.classList.add("theme-anim");
    setThemeState(t);
    window.setTimeout(() => document.documentElement.classList.remove("theme-anim"), 400);
  }, []);

  const connect = useCallback((kind: string) => {
    const hex = Array.from(kind)
      .map((c) => c.charCodeAt(0).toString(16).padStart(2, "0"))
      .join("")
      .padEnd(40, "a");
    setWallet(`0x${hex.slice(0, 40)}`);
  }, []);

  const disconnect = useCallback(() => setWallet(null), []);
  const setWalletAddress = useCallback((addr: string | null) => setWallet(addr), []);

  const pushToast = useCallback((title: string, body?: string) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((t) => [...t, { id, title, body }]);
    window.setTimeout(() => setToasts((x) => x.filter((y) => y.id !== id)), 3200);
  }, []);

  const value = useMemo<AppState>(
    () => ({
      ready,
      theme,
      setTheme,
      wallet,
      connect,
      disconnect,
      setWallet: setWalletAddress,
      toasts,
      pushToast,
    }),
    [ready, theme, setTheme, wallet, connect, disconnect, setWalletAddress, toasts, pushToast]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppState() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAppState must be used inside AppStateProvider");
  return ctx;
}
