import { BRAND_LOGO, isDemoContract, site } from "@/lib/site";
import type { LiveToken } from "@/lib/types";

const DEMO_CONTRACT = "0x1Ad69dDD9D98dD71b6211339A1801fD128A3925D";

type DexPair = {
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
};

type GeckoToken = {
  data?: {
    attributes?: {
      address?: string;
      name?: string;
      symbol?: string;
      image_url?: string;
      price_usd?: string;
      fdv_usd?: string;
      volume_usd?: { h24?: string };
      launchpad_details?: { completed_at?: string };
    };
  };
};

function geckoNetwork(chainId: string): string {
  return chainId === "solana" || chainId === "sol" ? "solana" : "robinhood";
}

function num(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

async function getJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "FomoPing/1.0",
      },
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function pickPair(pairs: DexPair[], address: string): DexPair | null {
  const want = address.toLowerCase();
  const matched = pairs.filter(
    (p) => p.baseToken?.address?.toLowerCase() === want
  );
  const list = matched.length ? matched : pairs;
  if (!list.length) return null;
  return [...list].sort(
    (a, b) => (b.liquidity?.usd ?? b.fdv ?? 0) - (a.liquidity?.usd ?? a.fdv ?? 0)
  )[0];
}

export async function fetchLiveToken(): Promise<LiveToken | null> {
  const address = site.tokenContract || DEMO_CONTRACT;
  if (!address) return null;

  const geckoNet = geckoNetwork("robinhood");
  const [dex, gecko] = await Promise.all([
    getJson<{ pairs?: DexPair[] }>(
      `https://api.dexscreener.com/latest/dex/tokens/${address}`
    ),
    getJson<GeckoToken>(
      `https://api.geckoterminal.com/api/v2/networks/${geckoNet}/tokens/${address}`
    ),
  ]);

  const pair = pickPair(dex?.pairs ?? [], address);
  const g = gecko?.data?.attributes;
  const createdMs = pair?.pairCreatedAt
    ? pair.pairCreatedAt
    : g?.launchpad_details?.completed_at
      ? Date.parse(g.launchpad_details.completed_at)
      : 0;
  const ageHours = createdMs
    ? Math.max(0, (Date.now() - createdMs) / 3_600_000)
    : 24;
  const vol = pair?.volume?.h24 ?? num(g?.volume_usd?.h24);
  const buys = pair?.txns?.h24?.buys ?? 0;
  const sells = pair?.txns?.h24?.sells ?? 0;
  const chainLogo = g?.image_url || pair?.info?.imageUrl || "";
  const chainSymbol = pair?.baseToken?.symbol || g?.symbol || "PING";
  const chainName = pair?.baseToken?.name || g?.name || "Fomo Ping";
  const priceUsd = num(pair?.priceUsd) || num(g?.price_usd);
  const brandLogo = site.tokenLogo || BRAND_LOGO;
  // Demo contract keeps Fomo Ping branding + this logo. Swap the address after
  // you create the token and name, ticker, on-chain logo, and price load.
  const placeholder =
    isDemoContract(address) && !site.tokenName && !site.tokenSymbol && !site.tokenLogo;

  const symbol = site.tokenSymbol || (placeholder ? "PING" : chainSymbol);
  const name = site.tokenName || (placeholder ? "Fomo Ping" : chainName);
  const logo = site.tokenLogo || (placeholder ? brandLogo : chainLogo || brandLogo);

  if (!pair && !g) {
    return {
      symbol,
      name,
      address,
      logo: logo || brandLogo,
      mc: 0,
      change24h: 0,
      vol24h: 0,
      trades24h: 0,
      fees24h: null,
      ageHours,
      priceUsd: 0,
    };
  }

  return {
    symbol,
    name,
    address: pair?.baseToken?.address || g?.address || address,
    logo: logo || brandLogo,
    mc: pair?.marketCap || pair?.fdv || num(g?.fdv_usd),
    change24h: pair?.priceChange?.h24 ?? 0,
    vol24h: vol,
    trades24h: Math.max(0, buys + sells),
    fees24h: vol > 0 ? vol * 0.003 : null,
    ageHours,
    priceUsd,
  };
}
