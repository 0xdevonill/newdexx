"use client";

/* Remote chain/token marks come from Relay/CoinGecko hosts. */
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { catalog, FEATURED_CHAIN_IDS } from "@/lib/catalog";
import { searchCurrencies } from "@/lib/relay";
import type { CatalogChain, CatalogToken } from "@/lib/types";

function Icon({ src, label }: { src?: string; label: string }) {
  if (!src) {
    return (
      <span className="token-ico" aria-hidden>
        {label.slice(0, 1)}
      </span>
    );
  }
  /* third-party chain/token marks; hosts are not in next/image config */
  return <img src={src} alt="" width={22} height={22} />;
}

export function ChainPicker({
  open,
  onOpenChange,
  selectedId,
  onPick,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  selectedId: number;
  onPick: (chain: CatalogChain) => void;
}) {
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    const featured = catalog.filter((c) => FEATURED_CHAIN_IDS.includes(c.id));
    const rest = catalog.filter((c) => !FEATURED_CHAIN_IDS.includes(c.id));
    const all = [...featured, ...rest];
    if (!query) return all;
    return all.filter(
      (c) =>
        c.displayName.toLowerCase().includes(query) ||
        c.name.toLowerCase().includes(query) ||
        String(c.id).includes(query)
    );
  }, [q]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Choose a dock</DialogTitle>
          <DialogDescription>Fifty-plus EVM lanes. Search by name or chain id.</DialogDescription>
        </DialogHeader>
        <input
          className="search-field"
          placeholder="Search Ethereum, Base, 42161…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          autoFocus
        />
        <div className="picker-grid">
          {list.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`picker-opt ${c.id === selectedId ? "on" : ""}`}
              onClick={() => {
                onPick(c);
                onOpenChange(false);
              }}
            >
              <Icon src={c.iconUrl} label={c.displayName} />
              <span>
                {c.displayName}
                <small>Chain {c.id}</small>
              </span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function TokenPicker({
  open,
  onOpenChange,
  chain,
  selected,
  onPick,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  chain: CatalogChain;
  selected: CatalogToken;
  onPick: (token: CatalogToken) => void;
}) {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<CatalogToken[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!open) return;
    const query = q.trim();
    if (query.length < 2) return;
    const t = window.setTimeout(() => {
      setSearching(true);
      void searchCurrencies(chain.id, query)
        .then(setHits)
        .finally(() => setSearching(false));
    }, 280);
    return () => window.clearTimeout(t);
  }, [q, chain.id, open]);

  const featured = chain.tokens;
  const extra =
    q.trim().length < 2
      ? []
      : hits.filter(
          (h) => !featured.some((f) => f.address.toLowerCase() === h.address.toLowerCase())
        );
  const filteredFeatured = q.trim()
    ? featured.filter(
        (t) =>
          t.symbol.toLowerCase().includes(q.toLowerCase()) ||
          t.name.toLowerCase().includes(q.toLowerCase()) ||
          t.address.toLowerCase().includes(q.toLowerCase())
      )
    : featured;
  const list = [...filteredFeatured, ...extra];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Cargo on {chain.displayName}</DialogTitle>
          <DialogDescription>
            Featured assets, or search any verified token on this chain.
          </DialogDescription>
        </DialogHeader>
        <input
          className="search-field"
          placeholder="Search USDC, WETH, or paste a contract"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          autoFocus
        />
        {searching ? <p className="muted">Searching lanes…</p> : null}
        <div className="picker-grid">
          {list.map((t) => (
            <button
              key={`${t.address}-${t.symbol}`}
              type="button"
              className={`picker-opt ${t.address === selected.address ? "on" : ""}`}
              onClick={() => {
                onPick(t);
                onOpenChange(false);
              }}
            >
              <Icon src={t.logo || chain.iconUrl} label={t.symbol} />
              <span>
                {t.symbol}
                <small>{t.name}</small>
              </span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function AssetIcon({ src, label }: { src?: string; label: string }) {
  return <Icon src={src} label={label} />;
}
