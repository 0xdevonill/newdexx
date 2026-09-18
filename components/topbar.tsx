"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Coins, Flame, Moon, Search, Sun, Trophy } from "lucide-react";
import { Logo } from "@/components/logo";
import { TokenIcon } from "@/components/token-icon";
import { WalletButton } from "@/components/wallet-button";
import { useAppState } from "@/lib/app-state";
import { formatUsd, shortAddr } from "@/lib/format";
import { PROTOCOL } from "@/lib/protocol";
import { useBoard } from "@/lib/use-board";

export function Topbar() {
  const { theme, setTheme } = useAppState();
  const { tokens, totals } = useBoard("trending");
  const [q, setQ] = useState("");
  const router = useRouter();
  const hits = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return [];
    return tokens
      .filter(
        (t) =>
          t.symbol.toLowerCase().includes(query) ||
          t.name.toLowerCase().includes(query) ||
          t.address.toLowerCase().includes(query)
      )
      .slice(0, 8);
  }, [q, tokens]);

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link className="brand" href="/" aria-label="Helix.fun home">
          <Logo />
          <span className="brand-word">helix.fun</span>
        </Link>
        <div className="g-search">
          <Search size={14} />
          <input
            placeholder="SEARCH TICKER, NAME, CA"
            aria-label="Search tokens"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && hits[0]) {
                router.push(`/token/${hits[0].id}`);
                setQ("");
              }
              if (e.key === "Escape") setQ("");
            }}
          />
          {q.trim() ? (
            <div className="tok-search-drop">
              {hits.length === 0 ? (
                <div className="tok-search-note">No tokens match “{q.trim()}”.</div>
              ) : (
                hits.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className="tok-search-hit"
                    onClick={() => {
                      router.push(`/token/${t.id}`);
                      setQ("");
                    }}
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
        <div className="topbar-actions">
          <div className="rh-chip" title="Robinhood Chain mainnet">
            RH 4663
          </div>
          <div className="header-stats" aria-label="Launchpad totals">
            <span className="hstat">
              <Coins className="hstat-ico" size={13} strokeWidth={2.1} />
              <span className="hstat-body">
                <span className="hstat-label">Launched</span>
                <span className="hstat-value">{totals.launched}</span>
              </span>
            </span>
            <span className="hstat">
              <Flame className="hstat-ico" size={13} strokeWidth={2.1} />
              <span className="hstat-body">
                <span className="hstat-label">24h vol</span>
                <span className="hstat-value">{formatUsd(totals.volume24hUsd, 0)}</span>
              </span>
            </span>
            <span className="hstat hstat-wide">
              <Trophy className="hstat-ico" size={13} strokeWidth={2.1} />
              <span className="hstat-body">
                <span className="hstat-label">On curve</span>
                <span className="hstat-value">{totals.onCurve}</span>
              </span>
            </span>
            <span className="hstat hstat-wide">
              <span className="hstat-body">
                <span className="hstat-label">ETH</span>
                <span className="hstat-value">
                  ${PROTOCOL.ethUsd.toLocaleString("en-US")}
                </span>
              </span>
            </span>
          </div>
          <button
            type="button"
            className="theme-toggle"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <WalletButton />
        </div>
      </div>
    </header>
  );
}
