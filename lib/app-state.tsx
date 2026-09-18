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

type Theme = "dark" | "light";
type Toast = { id: string; title: string; body?: string };

type AppState = {
  ready: boolean;
  theme: Theme;
  setTheme: (t: Theme) => void;
  toasts: Toast[];
  pushToast: (title: string, body?: string) => void;
};

const Ctx = createContext<AppState | null>(null);
const THEME_KEY = "quay.theme";

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [theme, setThemeState] = useState<Theme>("light");
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- localStorage bootstrap */
    try {
      const raw = localStorage.getItem(THEME_KEY);
      const t = raw ? (JSON.parse(raw) as Theme) : "light";
      setThemeState(t === "dark" ? "dark" : "light");
    } catch {
      setThemeState("light");
    }
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

  const setTheme = useCallback((t: Theme) => {
    document.documentElement.classList.add("theme-anim");
    setThemeState(t);
    window.setTimeout(() => document.documentElement.classList.remove("theme-anim"), 400);
  }, []);

  const pushToast = useCallback((title: string, body?: string) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((prev) => [...prev.slice(-4), { id, title, body }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  const value = useMemo(
    () => ({ ready, theme, setTheme, toasts, pushToast }),
    [ready, theme, setTheme, toasts, pushToast]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppState() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
