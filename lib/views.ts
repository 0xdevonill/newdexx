import { ETH_USD, GRADUATION_ETH } from "@/lib/protocol";
import {
  curveFromStored,
  marketCapUsd,
  progressBps,
  spotPriceWei,
  weiToEth,
} from "@/lib/curve";
import type { StoredToken, StoredTrade, TokenView } from "@/lib/types";

const DAY = 24 * 3600_000;

export function viewToken(
  token: StoredToken,
  trades: StoredTrade[],
  commentsCount: number,
  holders: number,
  kingId?: string
): TokenView {
  const state = curveFromStored(token);
  const priceUsd = weiToEth(spotPriceWei(state)) * ETH_USD;
  const now = Date.now();
  const dayTrades = trades.filter((t) => t.tokenId === token.id && now - t.ts <= DAY);
  const first = dayTrades[0];
  const change24h = first && first.priceUsd > 0 ? ((priceUsd - first.priceUsd) / first.priceUsd) * 100 : 0;
  const volume24hUsd = dayTrades.reduce((s, t) => s + weiToEth(BigInt(t.ethAmount)) * ETH_USD, 0);
  return {
    ...token,
    marketCapUsd: marketCapUsd(state),
    priceUsd,
    progressBps: progressBps(state),
    change24h,
    volume24hUsd,
    replies: commentsCount,
    holders,
    ageHours: Math.max(0, (now - token.createdAt) / 3600_000),
    king: kingId === token.id,
  };
}

export function kingId(tokens: StoredToken[]): string | undefined {
  let best: StoredToken | undefined;
  let bestMc = -1;
  for (const t of tokens) {
    if (t.graduated) continue;
    const mc = marketCapUsd(curveFromStored(t));
    if (mc > bestMc) {
      bestMc = mc;
      best = t;
    }
  }
  return best?.id;
}

export function sortTokens(list: TokenView[], key: string): TokenView[] {
  const copy = [...list];
  switch (key) {
    case "new":
      return copy.sort((a, b) => b.createdAt - a.createdAt);
    case "mc":
      return copy.sort((a, b) => b.marketCapUsd - a.marketCapUsd);
    case "grad":
      return copy
        .filter((t) => !t.graduated)
        .sort((a, b) => b.progressBps - a.progressBps);
    case "graduated":
      return copy.filter((t) => t.graduated).sort((a, b) => b.marketCapUsd - a.marketCapUsd);
    default:
      return copy.sort((a, b) => b.volume24hUsd - a.volume24hUsd || b.lastTradeAt - a.lastTradeAt);
  }
}

export function graduationUsd(): number {
  return weiToEth(GRADUATION_ETH) * ETH_USD;
}

export function candlesFromTrades(trades: StoredTrade[], bucketMs = 5 * 60_000) {
  if (trades.length === 0) return [];
  const sorted = [...trades].sort((a, b) => a.ts - b.ts);
  const start = sorted[0].ts;
  const map = new Map<number, { time: number; value: number; volume: number }>();
  for (const t of sorted) {
    const bucket = start + Math.floor((t.ts - start) / bucketMs) * bucketMs;
    const cur = map.get(bucket);
    const vol = weiToEth(BigInt(t.ethAmount));
    if (!cur) map.set(bucket, { time: Math.floor(bucket / 1000), value: t.priceUsd, volume: vol });
    else {
      cur.value = t.priceUsd;
      cur.volume += vol;
    }
  }
  return [...map.values()];
}

export function holderCount(balances: Record<string, string> | undefined): number {
  if (!balances) return 0;
  return Object.values(balances).filter((b) => BigInt(b) > 0n).length;
}

export function rankedHolders(balances: Record<string, string> | undefined, supply: string) {
  if (!balances) return [];
  const total = BigInt(supply || "0");
  return Object.entries(balances)
    .map(([address, balance]) => ({
      address,
      balance,
      pct: total > 0n ? Number((BigInt(balance) * 10000n) / total) / 100 : 0,
    }))
    .filter((h) => BigInt(h.balance) > 0n)
    .sort((a, b) => (BigInt(b.balance) > BigInt(a.balance) ? 1 : -1));
}
