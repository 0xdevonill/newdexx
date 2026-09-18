"use client";

import { useCallback, useEffect, useState } from "react";
import type { TokenView } from "@/lib/types";

type Board = {
  tokens: TokenView[];
  king: TokenView | null;
  totals: { launched: number; volume24hUsd: number; onCurve: number; graduated: number };
};

const empty: Board = {
  tokens: [],
  king: null,
  totals: { launched: 0, volume24hUsd: 0, onCurve: 0, graduated: 0 },
};

export function useBoard(sort = "trending", q = "") {
  const [board, setBoard] = useState<Board>(empty);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const params = new URLSearchParams();
    if (sort) params.set("sort", sort);
    if (q) params.set("q", q);
    const res = await fetch(`/api/tokens?${params.toString()}`, { cache: "no-store" });
    if (!res.ok) return;
    const data = (await res.json()) as Board;
    setBoard(data);
    setLoading(false);
  }, [sort, q]);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- poll the indexer */
    void refresh();
    const id = window.setInterval(() => void refresh(), 8000);
    return () => window.clearInterval(id);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [refresh]);

  return { ...board, loading, refresh };
}
