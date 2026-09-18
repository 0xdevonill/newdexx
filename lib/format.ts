import { formatUnits, parseUnits } from "viem";

export function shortAddr(addr: string): string {
  if (!addr) return "";
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function trimNum(n: number, digits = 4): string {
  if (!Number.isFinite(n)) return "—";
  if (n === 0) return "0";
  const abs = Math.abs(n);
  const d = abs >= 1000 ? 2 : abs >= 1 ? Math.min(digits, 4) : abs >= 0.0001 ? 6 : 8;
  const s = abs.toFixed(d).replace(/\.0+$/, "").replace(/(\.\d*[1-9])0+$/, "$1");
  return n < 0 ? `-${s}` : s;
}

export function formatUsd(n: number | string | null | undefined, digits = 2): string {
  if (n === null || n === undefined || n === "") return "—";
  const v = typeof n === "string" ? Number(n) : n;
  if (!Number.isFinite(v)) return "—";
  const abs = Math.abs(v);
  const sign = v < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}$${trimNum(abs / 1_000_000, 2)}M`;
  if (abs >= 1_000) return `${sign}$${trimNum(abs / 1_000, 2)}K`;
  if (abs >= 1) return `${sign}$${abs.toFixed(digits)}`;
  if (abs === 0) return "$0.00";
  return `${sign}$${abs.toFixed(Math.min(4, digits + 2))}`;
}

export function formatToken(raw: string | undefined, fallback = "0"): string {
  if (!raw) return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n)) return raw;
  return trimNum(n, 6);
}

export function formatEta(seconds?: number): string {
  if (seconds === undefined || seconds === null || Number.isNaN(seconds)) return "—";
  if (seconds < 1.5) return "~1s";
  if (seconds < 60) return `~${Math.round(seconds)}s`;
  const m = Math.round(seconds / 60);
  return m <= 1 ? "~1 min" : `~${m} min`;
}

export function parseTokenAmount(input: string, decimals: number): bigint | null {
  const cleaned = input.trim().replace(/,/g, "");
  if (!cleaned || cleaned === ".") return null;
  if (!/^\d+(\.\d+)?$/.test(cleaned)) return null;
  const frac = cleaned.split(".")[1] ?? "";
  if (frac.length > decimals) return null;
  try {
    return parseUnits(cleaned, decimals);
  } catch {
    return null;
  }
}

export function toTokenInput(value: bigint, decimals: number): string {
  const s = formatUnits(value, decimals);
  if (s.includes(".")) {
    return s.replace(/(\.\d*?[1-9])0+$/, "$1").replace(/\.0+$/, "");
  }
  return s;
}

export function relativeTime(ts: number): string {
  const s = Math.max(1, Math.round((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 48) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

export function explorerTx(base: string, hash: string): string {
  const root = base.replace(/\/$/, "");
  if (!root) return "";
  return `${root}/tx/${hash}`;
}
