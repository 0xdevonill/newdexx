"use client";

import { useCallback } from "react";
import { useAppState } from "@/lib/app-state";
import {
  featuredToken as featuredTokenRaw,
  highestVolume as highestVolumeRaw,
  mostTraded as mostTradedRaw,
  overlayLive,
  stakesFor,
  tokenById as tokenByIdRaw,
  tokensFor as tokensForRaw,
} from "@/lib/tokens";
import type { ChainId, Token } from "@/lib/types";

export function useCatalog() {
  const { live, foundTokens } = useAppState();

  const tokensFor = useCallback(
    (chain: ChainId): Token[] => tokensForRaw(chain).map((t) => overlayLive(t, live)),
    [live]
  );

  const tokenById = useCallback(
    (id: string): Token | undefined => {
      const t = tokenByIdRaw(id);
      if (t) return overlayLive(t, live);
      const lower = id.toLowerCase();
      return foundTokens.find(
        (x) =>
          x.id === id ||
          x.address.toLowerCase() === lower ||
          `${x.chain}-${x.address}`.toLowerCase() === lower
      );
    },
    [live, foundTokens]
  );

  const featuredToken = useCallback(
    (chain: ChainId): Token => overlayLive(featuredTokenRaw(chain), live),
    [live]
  );

  const mostTraded = useCallback(
    (chain: ChainId): Token => overlayLive(mostTradedRaw(chain), live),
    [live]
  );

  const highestVolume = useCallback(
    (chain: ChainId): Token => overlayLive(highestVolumeRaw(chain), live),
    [live]
  );

  return {
    live,
    tokensFor,
    tokenById,
    featuredToken,
    mostTraded,
    highestVolume,
    stakesFor,
  };
}
