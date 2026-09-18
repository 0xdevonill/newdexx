"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Check, Copy, ExternalLink } from "lucide-react";
import { BuySell } from "@/components/buy-sell";
import { CurveProgress } from "@/components/curve-progress";
import { HoldersTable } from "@/components/holders-table";
import { TokenChat } from "@/components/token-chat";
import { TokenChart, type Candle } from "@/components/token-chart";
import { TokenIcon } from "@/components/token-icon";
import { TxHistory } from "@/components/tx-history";
import { explorerAddress } from "@/lib/protocol";
import { formatPct, formatPrice, formatUsd, shortAddr } from "@/lib/format";
import type { StoredComment, StoredTrade, TokenView } from "@/lib/types";

type Bundle = {
  token: TokenView;
  trades: StoredTrade[];
  comments: StoredComment[];
  holders: { address: string; balance: string; pct: number }[];
  candles: Candle[];
};

export default function TokenPage() {
  const params = useParams<{ id: string }>();
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [tab, setTab] = useState<"tx" | "holders">("tx");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const res = await fetch(`/api/tokens/${params.id}`, { cache: "no-store" });
    if (!res.ok) {
      setError("Token not found");
      return;
    }
    setBundle((await res.json()) as Bundle);
    setError("");
  }, [params.id]);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- poll token bundle */
    void load();
    const id = window.setInterval(() => void load(), 4000);
    return () => window.clearInterval(id);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [load]);

  if (error) {
    return (
      <div className="empty">
        <h3>{error}</h3>
        <Link className="btn btn-ghost" href="/">
          Back home
        </Link>
      </div>
    );
  }
  if (!bundle) {
    return <p className="wallet-note">Loading token…</p>;
  }

  const { token, trades, comments, holders, candles } = bundle;
  const up = token.change24h >= 0;

  return (
    <div className="token-page">
      <div>
        <div className="tok-hero">
          <TokenIcon symbol={token.symbol} logo={token.logo} size={52} />
          <div className="tok-hero-id">
            <h1>
              {token.name} <span className="sym">${token.symbol}</span>
            </h1>
            <div className="sub">{token.description}</div>
            <div className="tok-hero-addr">
              {shortAddr(token.address)}
              <button
                type="button"
                className="tok-copy"
                aria-label="Copy address"
                onClick={async () => {
                  await navigator.clipboard.writeText(token.address);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1400);
                }}
              >
                {copied ? <Check size={12} className="ok" /> : <Copy size={12} />}
              </button>
              <a href={explorerAddress(token.address)} target="_blank" rel="noreferrer">
                <ExternalLink size={12} />
              </a>
            </div>
            <div className="tok-links">
              {token.twitter ? (
                <a href={token.twitter} target="_blank" rel="noreferrer">
                  X
                </a>
              ) : null}
              {token.telegram ? (
                <a href={token.telegram} target="_blank" rel="noreferrer">
                  Telegram
                </a>
              ) : null}
              {token.website ? (
                <a href={token.website} target="_blank" rel="noreferrer">
                  Web
                </a>
              ) : null}
              <Link href={`/profile/${token.creator}`}>Creator {shortAddr(token.creator)}</Link>
            </div>
          </div>
        </div>
        <div className="stat-strip">
          <div className="stat">
            <div className="k">Price</div>
            <div className="v">{formatPrice(token.priceUsd)}</div>
          </div>
          <div className="stat">
            <div className="k">Market cap</div>
            <div className="v">{formatUsd(token.marketCapUsd)}</div>
          </div>
          <div className="stat">
            <div className="k">24h</div>
            <div className={`v ${up ? "up" : "down"}`}>{formatPct(token.change24h)}</div>
          </div>
          <div className="stat">
            <div className="k">Volume 24h</div>
            <div className="v">{formatUsd(token.volume24hUsd)}</div>
          </div>
        </div>
        <div className="chart-card">
          <TokenChart candles={candles} up={up} />
        </div>
        <CurveProgress bps={token.progressBps} graduated={token.graduated} />
        <TokenChat tokenId={token.id} comments={comments} onPosted={() => void load()} />
        <section className="action-panel" style={{ marginTop: 14 }}>
          <div className="ap-head">
            <h3>{tab === "tx" ? "Trades" : "Holders"}</h3>
            <div className="quote-switch">
              <button type="button" className={`qs-btn ${tab === "tx" ? "on" : ""}`} onClick={() => setTab("tx")}>
                Trades
              </button>
              <button
                type="button"
                className={`qs-btn ${tab === "holders" ? "on" : ""}`}
                onClick={() => setTab("holders")}
              >
                Holders
              </button>
            </div>
          </div>
          {tab === "tx" ? <TxHistory trades={trades} /> : <HoldersTable holders={holders} />}
        </section>
      </div>
      <BuySell token={token} onTraded={() => void load()} />
    </div>
  );
}
