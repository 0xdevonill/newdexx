import { defineChain, type Chain } from "viem";
import { catalog } from "@/lib/catalog";

export const appChains = catalog.map((c) =>
  defineChain({
    id: c.id,
    name: c.displayName,
    nativeCurrency: {
      name: c.native.name,
      symbol: c.native.symbol,
      decimals: c.native.decimals,
    },
    rpcUrls: {
      default: { http: [c.rpc] },
    },
    blockExplorers: c.explorerUrl
      ? { default: { name: c.explorerName || "Explorer", url: c.explorerUrl } }
      : undefined,
  })
) as unknown as [Chain, ...Chain[]];

export const appChainMap = new Map(appChains.map((c) => [c.id, c]));
