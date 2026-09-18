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
import type { ChainId, LiveToken, Position, ShapeId, StakeDeposit, Token } from "@/lib/types";
import { fakeEvm, fakeSol } from "@/lib/format";
import { wallet as walletEnv } from "@/lib/site";

type Theme = "dark" | "light";

type Toast = { id: string; title: string; body?: string };

type AppState = {
  ready: boolean;
  theme: Theme;
  setTheme: (t: Theme) => void;
  chain: ChainId;
  setChain: (c: ChainId) => void;
  wallet: string | null;
  connect: (kind: string) => void;
  disconnect: () => void;
  setWallet: (addr: string | null) => void;
  live: LiveToken | null;
  foundTokens: Token[];
  rememberToken: (token: Token) => void;
  positions: Position[];
  stakeDeposits: StakeDeposit[];
  addPosition: (input: {
    tokenId: string;
    shape: ShapeId;
    depositedUsd: number;
    rangeMin: number;
    rangeMax: number;
  }) => void;
  addStakeDeposit: (stakeId: string, amountQuote: number) => void;
  claimFees: (positionId: string) => void;
  withdrawPosition: (positionId: string) => void;
  toasts: Toast[];
  pushToast: (title: string, body?: string) => void;
};

const Ctx = createContext<AppState | null>(null);

const POS_KEY = "helix.positions";
const STAKE_KEY = "helix.stakes";
const THEME_KEY = "helix.theme";
const CHAIN_KEY = "helix.chain";
const WALLET_KEY = "helix.wallet";
const FOUND_KEY = "helix.found";

function loadJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function loadSession<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function AppStateProvider({
  children,
  initialLive = null,
}: {
  children: ReactNode;
  initialLive?: LiveToken | null;
}) {
  const [ready, setReady] = useState(false);
  const [theme, setThemeState] = useState<Theme>("dark");
  const [chain, setChainState] = useState<ChainId>("robinhood");
  const [wallet, setWallet] = useState<string | null>(null);
  const [live, setLive] = useState<LiveToken | null>(initialLive);
  const [foundTokens, setFoundTokens] = useState<Token[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [stakeDeposits, setStakeDeposits] = useState<StakeDeposit[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    // Restore client-only persisted UI after hydration.
    /* eslint-disable react-hooks/set-state-in-effect -- localStorage bootstrap */
    const t = loadJson<Theme>(THEME_KEY, "dark");
    const c = loadJson<ChainId>(CHAIN_KEY, "robinhood");
    const w = loadJson<string | null>(WALLET_KEY, null);
    setThemeState(t === "light" ? "light" : "dark");
    setChainState(c === "sol" ? "sol" : "robinhood");
    if (!walletEnv.live) setWallet(w);
    setPositions(loadJson(POS_KEY, []));
    setStakeDeposits(loadJson(STAKE_KEY, []));
    setFoundTokens(loadSession(FOUND_KEY, []));
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.classList.toggle("light", theme === "light");
    localStorage.setItem(THEME_KEY, theme);
  }, [theme, ready]);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(CHAIN_KEY, chain);
  }, [chain, ready]);

  useEffect(() => {
    if (!ready || walletEnv.live) return;
    if (wallet) localStorage.setItem(WALLET_KEY, JSON.stringify(wallet));
    else localStorage.removeItem(WALLET_KEY);
  }, [wallet, ready]);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(POS_KEY, JSON.stringify(positions));
  }, [positions, ready]);

  useEffect(() => {
    if (!ready) return;
    sessionStorage.setItem(FOUND_KEY, JSON.stringify(foundTokens.slice(0, 40)));
  }, [foundTokens, ready]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/token", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { live: LiveToken | null };
        if (!cancelled && data.live) setLive(data.live);
      } catch {
        /* keep SSR snapshot */
      }
    };
    void load();
    const id = window.setInterval(load, 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  const setTheme = useCallback((t: Theme) => {
    document.documentElement.classList.add("theme-anim");
    setThemeState(t);
    window.setTimeout(() => document.documentElement.classList.remove("theme-anim"), 400);
  }, []);

  const setChain = useCallback((c: ChainId) => {
    document.documentElement.dataset.chainSwitching = "1";
    setChainState(c);
    window.setTimeout(() => {
      delete document.documentElement.dataset.chainSwitching;
    }, 220);
  }, []);

  const connect = useCallback((kind: string) => {
    const addr = chain === "sol" ? fakeSol(`wallet-${kind}`) : fakeEvm(`wallet-${kind}`);
    setWallet(addr);
  }, [chain]);

  const rememberToken = useCallback((token: Token) => {
    setFoundTokens((list) => {
      const key = `${token.chain}:${token.address.toLowerCase()}`;
      const next = [
        token,
        ...list.filter((t) => `${t.chain}:${t.address.toLowerCase()}` !== key),
      ];
      return next.slice(0, 40);
    });
  }, []);

  const disconnect = useCallback(() => setWallet(null), []);

  const setWalletAddress = useCallback((addr: string | null) => {
    setWallet(addr);
  }, []);

  const pushToast = useCallback((title: string, body?: string) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((t) => [...t, { id, title, body }]);
    window.setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3200);
  }, []);

  const addPosition = useCallback<AppState["addPosition"]>(
    (input) => {
      const pos: Position = {
        id: `pos-${Date.now()}`,
        chain,
        tokenId: input.tokenId,
        shape: input.shape,
        depositedUsd: input.depositedUsd,
        valueUsd: input.depositedUsd * 1.004,
        feesUsd: 0,
        rangeMin: input.rangeMin,
        rangeMax: input.rangeMax,
        createdAt: Date.now(),
      };
      setPositions((p) => [pos, ...p]);
      pushToast("Position minted", "Held in your Ping contract. Only your wallet can move it.");
    },
    [chain, pushToast]
  );

  const addStakeDeposit = useCallback(
    (stakeId: string, amountQuote: number) => {
      const d: StakeDeposit = {
        id: `sd-${Date.now()}`,
        chain,
        stakeId,
        amountQuote,
        createdAt: Date.now(),
      };
      setStakeDeposits((s) => [d, ...s]);
      pushToast("Stake deposited", "Rewards stream in the quote asset over 7 days.");
    },
    [chain, pushToast]
  );

  const claimFees = useCallback(
    (positionId: string) => {
      setPositions((p) =>
        p.map((x) => (x.id === positionId ? { ...x, feesUsd: 0 } : x))
      );
      pushToast("Fees claimed", "7.5% protocol cut already applied. Nothing further.");
    },
    [pushToast]
  );

  const withdrawPosition = useCallback(
    (positionId: string) => {
      setPositions((p) => p.filter((x) => x.id !== positionId));
      pushToast("Position withdrawn", "No lockup. No exit penalty. Coins returned to your wallet.");
    },
    [pushToast]
  );

  const value = useMemo<AppState>(
    () => ({
      ready,
      theme,
      setTheme,
      chain,
      setChain,
      wallet,
      connect,
      disconnect,
      setWallet: setWalletAddress,
      live,
      foundTokens,
      rememberToken,
      positions,
      stakeDeposits,
      addPosition,
      addStakeDeposit,
      claimFees,
      withdrawPosition,
      toasts,
      pushToast,
    }),
    [
      ready,
      theme,
      setTheme,
      chain,
      setChain,
      wallet,
      connect,
      disconnect,
      setWalletAddress,
      live,
      foundTokens,
      rememberToken,
      positions,
      stakeDeposits,
      addPosition,
      addStakeDeposit,
      claimFees,
      withdrawPosition,
      toasts,
      pushToast,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppState() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAppState must be used inside AppStateProvider");
  return ctx;
}
