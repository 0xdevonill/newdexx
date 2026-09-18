export function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function sparkline(seed: string, n = 24): number[] {
  let h = hashSeed(seed) || 1;
  const pts: number[] = [];
  let v = 42 + (h % 18);
  for (let i = 0; i < n; i++) {
    h = (Math.imul(h, 16807) + 11) >>> 0;
    const step = ((h % 23) - 11) * 1.15;
    v = Math.max(6, Math.min(94, v + step));
    pts.push(v);
  }
  return pts;
}

export function tokenHue(symbol: string): number {
  if (symbol === "PING" || symbol === "HELIX") return 145;
  return hashSeed(symbol) % 360;
}

export function formatUsd(n: number | null, digits = 2): string {
  if (n === null || Number.isNaN(n)) return "—";
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000_000) return `${sign}$${(abs / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `${sign}$${trimNum(abs / 1_000_000)}M`;
  if (abs >= 1_000) return `${sign}$${trimNum(abs / 1_000)}K`;
  if (abs >= 100) return `${sign}$${abs.toFixed(0)}`;
  if (abs >= 1) return `${sign}$${abs.toFixed(digits)}`;
  if (abs === 0) return "$0";
  return `${sign}$${abs.toFixed(2)}`;
}

export function formatPrice(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n) || n <= 0) return "—";
  if (n >= 1) return formatUsd(n);
  if (n >= 0.01) return `$${n.toFixed(4)}`;
  if (n >= 0.0001) return `$${n.toFixed(6)}`;
  const fixed = n.toFixed(10).replace(/0+$/, "").replace(/\.$/, "");
  return `$${fixed}`;
}

function trimNum(n: number): string {
  const s = n >= 100 ? n.toFixed(0) : n >= 10 ? n.toFixed(1) : n.toFixed(2);
  return s.replace(/\.0+$/, "").replace(/(\.\d*[1-9])0+$/, "$1");
}

export function formatPct(n: number): string {
  const abs = Math.abs(n);
  const body =
    abs >= 1000
      ? `${(abs / 1000).toFixed(1)}K%`
      : abs >= 100
        ? `${abs.toFixed(0)}%`
        : `${abs.toFixed(1)}%`;
  return n >= 0 ? `+${body}` : `-${body}`;
}

export function formatInt(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

export function formatAge(hours: number): string {
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))}m`;
  if (hours < 24) return `${Math.max(1, Math.round(hours))}h`;
  return `${Math.round(hours / 24)}d`;
}

export function formatQuote(n: number, unit: string, digits = 4): string {
  if (n <= 0) return `0 ${unit}`;
  if (n < 0.0001) return `<0.0001 ${unit}`;
  if (n < 1) return `${n.toFixed(4)} ${unit}`;
  if (n < 10) return `${n.toFixed(4)} ${unit}`;
  if (n < 1000) return `${n.toFixed(digits === 4 ? 4 : 2)} ${unit}`;
  return `${n.toLocaleString("en-US", { maximumFractionDigits: 2 })} ${unit}`;
}

export function shortAddr(addr: string): string {
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function fakeEvm(seed: string): string {
  const h = hashSeed(seed).toString(16).padStart(8, "0");
  const h2 = hashSeed(seed + "b").toString(16).padStart(8, "0");
  const h3 = hashSeed(seed + "c").toString(16).padStart(8, "0");
  const h4 = hashSeed(seed + "d").toString(16).padStart(8, "0");
  const h5 = hashSeed(seed + "e").toString(16).padStart(8, "0");
  return `0x${h}${h2}${h3}${h4}${h5}`.slice(0, 42);
}

export function fakeSol(seed: string): string {
  const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let h = hashSeed(seed);
  let out = "";
  for (let i = 0; i < 44; i++) {
    h = (Math.imul(h, 1664525) + 1013904223) >>> 0;
    out += alphabet[h % alphabet.length];
  }
  return out;
}
