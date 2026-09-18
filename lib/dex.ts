import type { ChainId, Quote, Token } from "@/lib/types";

export type DexPair = {
  chainId?: string;
  pairCreatedAt?: number;
  priceUsd?: string;
  priceChange?: { h24?: number };
  volume?: { h24?: number };
  txns?: { h24?: { buys?: number; sells?: number } };
  marketCap?: number;
  fdv?: number;
  liquidity?: { usd?: number };
  info?: { imageUrl?: string };
  baseToken?: { address?: string; name?: string; symbol?: string };
  quoteToken?: { address?: string; name?: string; symbol?: string };
};

export function dexChainId(chain: ChainId): "robinhood" | "solana" {
  return chain === "sol" ? "solana" : "robinhood";
}

export function isEvmAddress(q: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(q.trim());
}

export function isSolAddress(q: string): boolean {
  const s = q.trim();
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(s) && !s.startsWith("0x");
}

export function looksLikeAddress(q: string, chain: ChainId): boolean {
  return chain === "sol" ? isSolAddress(q) : isEvmAddress(q);
}

export function liveTokenId(chain: ChainId, address: string): string {
  return `${chain}-${address}`;
}

export function parseTokenRouteId(
  id: string
): { chain: ChainId; address?: string } | null {
  if (id.startsWith("robinhood-")) {
    const rest = id.slice("robinhood-".length);
    return {
      chain: "robinhood",
      address: isEvmAddress(rest) ? rest : undefined,
    };
  }
  if (id.startsWith("sol-")) {
    const rest = id.slice(4);
    return {
      chain: "sol",
      address: isSolAddress(rest) ? rest : undefined,
    };
  }
  return null;
}

function num(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function quoteFromPair(chain: ChainId, pair: DexPair): Quote {
  const q = (pair.quoteToken?.symbol || "").toUpperCase();
  if (chain === "sol") return q.includes("USDC") ? "USDC" : "SOL";
  if (q.includes("USDG")) return "USDG";
  return "ETH";
}

export function tokenFromPair(chain: ChainId, pair: DexPair): Token | null {
  const address = pair.baseToken?.address;
  const symbol = pair.baseToken?.symbol;
  if (!address || !symbol) return null;
  const vol = num(pair.volume?.h24);
  const buys = pair.txns?.h24?.buys ?? 0;
  const sells = pair.txns?.h24?.sells ?? 0;
  const created = pair.pairCreatedAt || 0;
  return {
    id: liveTokenId(chain, address),
    chain,
    symbol,
    name: pair.baseToken?.name || symbol,
    quote: quoteFromPair(chain, pair),
    mc: pair.marketCap || pair.fdv || 0,
    change24h: pair.priceChange?.h24 ?? 0,
    fees24h: vol > 0 ? vol * 0.003 : null,
    trades24h: Math.max(0, buys + sells),
    vol24h: vol,
    ageHours: created ? Math.max(0, (Date.now() - created) / 3_600_000) : 24,
    lists: ["trending"],
    address,
    logo: pair.info?.imageUrl || "",
    priceUsd: num(pair.priceUsd),
  };
}

export function pickPair(pairs: DexPair[], address?: string): DexPair | null {
  const want = address?.toLowerCase();
  const matched = want
    ? pairs.filter((p) => p.baseToken?.address?.toLowerCase() === want)
    : pairs;
  const list = matched.length ? matched : pairs;
  if (!list.length) return null;
  return [...list].sort(
    (a, b) => (b.liquidity?.usd ?? b.fdv ?? 0) - (a.liquidity?.usd ?? a.fdv ?? 0)
  )[0];
}

async function getJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "FomoPing/1.0",
      },
      next: { revalidate: 30 },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function uniqueTokens(tokens: Token[]): Token[] {
  const seen = new Set<string>();
  const out: Token[] = [];
  for (const t of tokens) {
    const key = `${t.chain}:${t.address.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
  }
  return out;
}

export async function searchDexTokens(
  chain: ChainId,
  query: string
): Promise<Token[]> {
  const q = query.trim();
  if (!q) return [];
  const want = dexChainId(chain);

  if (looksLikeAddress(q, chain)) {
    const found = await fetchDexToken(chain, q);
    return found ? [found] : [];
  }

  const data = await getJson<{ pairs?: DexPair[] }>(
    `https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(q)}`
  );
  const pairs = (data?.pairs ?? []).filter((p) => p.chainId === want);
  const tokens = uniqueTokens(
    pairs
      .map((p) => tokenFromPair(chain, p))
      .filter((t): t is Token => Boolean(t))
  );
  return tokens
    .sort((a, b) => b.vol24h - a.vol24h)
    .slice(0, 12);
}

export async function fetchDexToken(
  chain: ChainId,
  address: string
): Promise<Token | null> {
  const addr = address.trim();
  if (!addr) return null;
  const want = dexChainId(chain);
  const data = await getJson<{ pairs?: DexPair[] }>(
    `https://api.dexscreener.com/latest/dex/tokens/${encodeURIComponent(addr)}`
  );
  const pairs = (data?.pairs ?? []).filter((p) => p.chainId === want);
  const pair = pickPair(pairs, addr);
  if (!pair) return null;
  return tokenFromPair(chain, pair);
}

export function mergeSearchHits(local: Token[], remote: Token[]): Token[] {
  const byAddr = new Map(local.map((t) => [t.address.toLowerCase(), t]));
  const out: Token[] = [];
  const seen = new Set<string>();
  for (const t of [...local, ...remote]) {
    const catalog = byAddr.get(t.address.toLowerCase());
    const row = catalog ?? t;
    const key = `${row.chain}:${row.address.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(row);
  }
  return out.slice(0, 12);
}
