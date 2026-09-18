import raw from "@/lib/chain-catalog.json";
import type { CatalogChain, CatalogToken } from "@/lib/types";

export const NATIVE = "0x0000000000000000000000000000000000000000";

export const catalog = raw as CatalogChain[];

const byId = new Map(catalog.map((c) => [c.id, c]));

export function chainById(id: number): CatalogChain | undefined {
  return byId.get(id);
}

export function isNative(address: string): boolean {
  return address.toLowerCase() === NATIVE;
}

export function defaultToken(chain: CatalogChain): CatalogToken {
  return (
    chain.tokens.find((t) => isNative(t.address)) ??
    chain.tokens[0] ?? {
      symbol: chain.native.symbol,
      name: chain.native.name,
      address: NATIVE,
      decimals: chain.native.decimals,
      logo: chain.iconUrl,
    }
  );
}

export function tokenOnChain(chain: CatalogChain, address: string): CatalogToken | undefined {
  const addr = address.toLowerCase();
  return chain.tokens.find((t) => t.address.toLowerCase() === addr);
}

export const FEATURED_CHAIN_IDS = [
  1, 8453, 42161, 10, 137, 56, 43114, 130, 59144, 534352, 4663, 81457, 7777777, 480,
];

export const POPULAR_LANES = [
  { from: 1, to: 8453, label: "Ethereum → Base" },
  { from: 8453, to: 42161, label: "Base → Arbitrum" },
  { from: 1, to: 42161, label: "Ethereum → Arbitrum" },
  { from: 8453, to: 10, label: "Base → Optimism" },
  { from: 1, to: 4663, label: "Ethereum → Robinhood" },
  { from: 42161, to: 1, label: "Arbitrum → Ethereum" },
] as const;
