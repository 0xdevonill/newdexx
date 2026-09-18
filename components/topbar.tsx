"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CircleDollarSign,
  Coins,
  Droplet,
  Layers,
  Moon,
  Search,
  Sun,
} from "lucide-react";
import { RhLogo, SolLogo } from "@/components/chain-logos";
import { Logo } from "@/components/logo";
import { TokenIcon } from "@/components/token-icon";
import { WalletButton } from "@/components/wallet-button";
import { useAppState } from "@/lib/app-state";
import { mergeSearchHits } from "@/lib/dex";
import { formatUsd, shortAddr } from "@/lib/format";
import { PROTOCOL } from "@/lib/tokens";
import { useCatalog } from "@/lib/catalog";
import type { Token } from "@/lib/types";

export function Topbar() {
  const { theme, setTheme, chain, setChain, rememberToken } = useAppState();
  const { tokensFor } = useCatalog();
  const totals = PROTOCOL.totals[chain];
  const [q, setQ] = useState("");
  const [remote, setRemote] = useState<Token[]>([]);
  const [searching, setSearching] = useState(false);
  const router = useRouter();
  const path = usePathname();
  const landing = path === "/";
  const buyHref = PROTOCOL.ponsUrl || "/pools";
  const buyExternal = Boolean(PROTOCOL.ponsUrl);

  const localHits = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return [];
    return tokensFor(chain).filter(
      (t) =>
        t.symbol.toLowerCase().includes(query) ||
        t.name.toLowerCase().includes(query) ||
        t.address.toLowerCase().includes(query)
    );
  }, [q, chain, tokensFor]);

  useEffect(() => {
    const query = q.trim();
    if (query.length < 2) return;
    const ctrl = new AbortController();
    const timer = window.setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `/api/search?chain=${chain}&q=${encodeURIComponent(query)}`,
          { signal: ctrl.signal, cache: "no-store" }
        );
        if (!res.ok) throw new Error("search failed");
        const data = (await res.json()) as { tokens?: Token[] };
        if (!ctrl.signal.aborted) setRemote(data.tokens ?? []);
      } catch {
        if (!ctrl.signal.aborted) setRemote([]);
      } finally {
        if (!ctrl.signal.aborted) setSearching(false);
      }
    }, 280);
    return () => {
      window.clearTimeout(timer);
      ctrl.abort();
    };
  }, [q, chain]);

  const hits =
    q.trim().length >= 2 ? mergeSearchHits(localHits, remote) : localHits.slice(0, 8);

  const openToken = (t: Token) => {
    rememberToken(t);
    if (t.chain !== chain) setChain(t.chain);
    router.push(`/pools/${t.id}`);
    setQ("");
  };

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link className="brand" href="/" aria-label={`${PROTOCOL.name} home`}>
          <Logo />
        </Link>
        {landing ? null : (
          <div className="g-search">
            <Search size={14} />
            <input
              placeholder={
                chain === "sol"
                  ? "SEARCH SOLANA NAME OR MINT"
                  : "SEARCH ROBINHOOD NAME OR CONTRACT"
              }
              aria-label="Search tokens by name or contract"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && hits[0]) openToken(hits[0]);
                if (e.key === "Escape") setQ("");
              }}
            />
            {q.trim() ? (
              <div className="tok-search-drop">
                {searching && hits.length === 0 ? (
                  <div className="tok-search-note">
                    Searching {chain === "sol" ? "Solana" : "Robinhood Chain"}…
                  </div>
                ) : hits.length === 0 ? (
                  <div className="tok-search-note">
                    No {chain === "sol" ? "Solana" : "Robinhood"} tokens match “{q.trim()}”.
                  </div>
                ) : (
                  hits.map((t) => (
                    <button
                      key={`${t.chain}-${t.address}`}
                      type="button"
                      className="tok-search-hit"
                      onClick={() => openToken(t)}
                    >
                      <TokenIcon symbol={t.symbol} logo={t.logo} size={18} />
                      <span className="tok-sym">{t.symbol}</span>
                      <span className="tok-name">{t.name}</span>
                      <span className="tok-addr">{shortAddr(t.address)}</span>
                    </button>
                  ))
                )}
              </div>
            ) : null}
          </div>
        )}
        <div className="topbar-actions">
          {landing ? null : (
            <>
              <nav className="chain-switch" aria-label="Chain">
                <button
                  type="button"
                  className={`chain-switch-btn rh ${chain === "robinhood" ? "on" : ""}`}
                  title="Robinhood Chain"
                  aria-label="Show Robinhood Chain pools"
                  aria-pressed={chain === "robinhood"}
                  onClick={() => setChain("robinhood")}
                >
                  <RhLogo size={20} />
                  <span className="chain-lab">RH</span>
                </button>
                <button
                  type="button"
                  className={`chain-switch-btn sol ${chain === "sol" ? "on" : ""}`}
                  title="Solana"
                  aria-label="Show Solana pools"
                  aria-pressed={chain === "sol"}
                  onClick={() => setChain("sol")}
                >
                  <SolLogo size={20} />
                  <span className="chain-lab">SOL</span>
                </button>
              </nav>
              <div className="header-stats" aria-label={`${PROTOCOL.name} pool totals`}>
                <span className="hstat">
                  <Layers className="hstat-ico" size={13} strokeWidth={2.1} />
                  <span className="hstat-body">
                    <span className="hstat-label">Total Positions</span>
                    <span className="hstat-value">{totals.positions.toLocaleString("en-US")}</span>
                  </span>
                </span>
                <span className="hstat">
                  <Coins className="hstat-ico" size={13} strokeWidth={2.1} />
                  <span className="hstat-body">
                    <span className="hstat-label">Total Fees</span>
                    <span className="hstat-value">{formatUsd(totals.fees, 0)}</span>
                  </span>
                </span>
                <span className="hstat hstat-wide">
                  <Droplet className="hstat-ico" size={13} strokeWidth={2.1} />
                  <span className="hstat-body">
                    <span className="hstat-label">TVL</span>
                    <span className="hstat-value">{formatUsd(totals.tvl, 0)}</span>
                  </span>
                </span>
                <span className="hstat hstat-wide">
                  <CircleDollarSign className="hstat-ico" size={13} strokeWidth={2.1} />
                  <span className="hstat-body">
                    <span className="hstat-label">{totals.nativeLabel}</span>
                    <span className="hstat-value">
                      ${totals.nativePrice.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                    </span>
                  </span>
                </span>
              </div>
            </>
          )}
          <button
            type="button"
            className="theme-toggle"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          {buyExternal ? (
            <a className="btn btn-ping btn-sm" href={buyHref} target="_blank" rel="noopener noreferrer">
              <span className="btn-full">Buy ${PROTOCOL.token}</span>
              <span className="btn-short">Buy</span>
            </a>
          ) : (
            <Link className="btn btn-ping btn-sm" href={landing ? "/pools" : "/"}>
              <span className="btn-full">{landing ? "Enter app" : `$${PROTOCOL.token}`}</span>
              <span className="btn-short">{landing ? "App" : `$${PROTOCOL.token}`}</span>
            </Link>
          )}
          <WalletButton />
        </div>
      </div>
    </header>
  );
}
