import type { CatalogToken, RelayQuote } from "@/lib/types";

export async function requestQuote(input: {
  user: string;
  recipient?: string;
  originChainId: number;
  destinationChainId: number;
  originToken: CatalogToken;
  destinationToken: CatalogToken;
  amount: string;
}): Promise<RelayQuote> {
  const res = await fetch("/api/relay/quote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user: input.user,
      recipient: input.recipient || input.user,
      originChainId: input.originChainId,
      destinationChainId: input.destinationChainId,
      originCurrency: input.originToken.address,
      destinationCurrency: input.destinationToken.address,
      amount: input.amount,
      tradeType: "EXACT_INPUT",
    }),
  });
  const data = (await res.json()) as RelayQuote;
  if (!res.ok) {
    throw new Error(data.message || data.error || "No fare available for this lane.");
  }
  if (data.message && !data.steps) {
    throw new Error(data.message);
  }
  return data;
}

export async function searchCurrencies(chainId: number, term: string) {
  const res = await fetch("/api/relay/currencies", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chainIds: [chainId], term, limit: 24, verified: true }),
  });
  if (!res.ok) return [];
  const data = (await res.json()) as Array<{
    chainId: number;
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    metadata?: { logoURI?: string };
  }>;
  if (!Array.isArray(data)) return [];
  return data.map((t) => ({
    symbol: t.symbol,
    name: t.name,
    address: (t.address || "").toLowerCase(),
    decimals: t.decimals,
    logo: t.metadata?.logoURI || "",
  })) satisfies CatalogToken[];
}

export async function pollIntent(requestId: string): Promise<string> {
  const started = Date.now();
  while (Date.now() - started < 180_000) {
    const res = await fetch(`/api/relay/status?requestId=${encodeURIComponent(requestId)}`);
    const data = (await res.json()) as { status?: string; message?: string };
    const status = (data.status || "").toLowerCase();
    if (status === "success" || status === "complete" || status === "completed") return "success";
    if (status === "failure" || status === "failed" || status === "refund") {
      throw new Error(data.message || "Crossing failed on the destination dock.");
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
  return "pending";
}

export function fareUsd(quote?: RelayQuote | null): number {
  if (!quote?.fees) return 0;
  const keys = ["relayer", "gas", "app"] as const;
  return keys.reduce((sum, key) => {
    const n = Number(quote.fees?.[key]?.amountUsd || 0);
    return sum + (Number.isFinite(n) ? n : 0);
  }, 0);
}
