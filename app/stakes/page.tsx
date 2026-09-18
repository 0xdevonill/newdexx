"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkline } from "@/components/sparkline";
import { TokenIcon } from "@/components/token-icon";
import { useAppState } from "@/lib/app-state";
import { formatQuote, formatUsd } from "@/lib/format";
import { quoteUnit } from "@/lib/tokens";
import { useCatalog } from "@/lib/catalog";

export default function StakesPage() {
  const { chain, wallet, addStakeDeposit, pushToast } = useAppState();
  const { stakesFor, tokenById } = useCatalog();
  const stakes = stakesFor(chain);
  const quote = quoteUnit(chain);
  const total = stakes.reduce((s, x) => s + x.tvlQuote, 0);
  const [selected, setSelected] = useState(stakes[0]?.id ?? "");
  const [amount, setAmount] = useState("0.25");
  const [tokenQuery, setTokenQuery] = useState("");

  const current = stakes.find((s) => s.id === selected) ?? stakes[0];
  const activeToken = current ? tokenById(current.tokenId) : undefined;

  const q = tokenQuery.trim().toLowerCase();
  const createHits = q
    ? stakes
        .map((s) => tokenById(s.tokenId))
        .filter((t) => t && (t.symbol.toLowerCase().includes(q) || t.name.toLowerCase().includes(q)))
        .slice(0, 6)
    : [];

  return (
    <div className="app-page">
      <div className="page-lead">
        <h1>Stakes</h1>
        <p>
          Put your tokens into a stake and a share of those fees is yours. Deposit coins and
          Fomo Ping builds the staked pool position for you.
        </p>
      </div>
      <div className="stake-kpis">
        <div className="kpi">
          <div className="k">Total staked</div>
          <div className="v">{formatQuote(total, quote)}</div>
        </div>
        <div className="kpi">
          <div className="k">Stakes</div>
          <div className="v">{stakes.length}</div>
        </div>
      </div>
      <div className="action-panel">
        <div className="ap-head">
          <div className="ap-title">
            <h3>Live stakes</h3>
          </div>
        </div>
        <div className="table-wrap">
          <table className="ftable">
            <thead>
              <tr>
                <th>Pool</th>
                <th>TVL</th>
                <th className="col-tab">7d rate</th>
                <th className="col-desk">24h fees</th>
                <th className="col-desk">Trend</th>
                <th> </th>
              </tr>
            </thead>
            <tbody>
              {stakes.map((s) => {
                const tok = tokenById(s.tokenId);
                if (!tok) return null;
                const up = (s.rate7d ?? 0) >= 0;
                const on = selected === s.id;
                return (
                  <tr
                    key={s.id}
                    onClick={() => setSelected(s.id)}
                    className={on ? "is-selected" : undefined}
                  >
                    <td>
                      <span className="tok-link">
                        <TokenIcon symbol={tok.symbol} logo={tok.logo} size={28} />
                        <span className="tok-text">
                          <span className="tok-sym">
                            {quote} / {tok.symbol}
                          </span>
                          <span className="tok-name">fee share → {quote}</span>
                        </span>
                      </span>
                    </td>
                    <td>{formatQuote(s.tvlQuote, quote)}</td>
                    <td className="col-tab">
                      {s.rate7d === null ? (
                        <span style={{ color: "var(--text-3)" }}>no fees yet</span>
                      ) : (
                        <span className={`chg ${up ? "up" : "down"}`}>
                          {s.rate7d.toFixed(2)}%
                        </span>
                      )}
                    </td>
                    <td className="col-desk">{formatQuote(s.fees24h, quote)}</td>
                    <td className="col-desk">
                      {s.fees24h > 0 ? (
                        <Sparkline seed={s.id} up={up} />
                      ) : (
                        <span style={{ color: "var(--text-3)" }}>—</span>
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelected(s.id);
                          document.getElementById("stake-deposit")?.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                          });
                        }}
                      >
                        Deposit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div className="token-page" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div className="action-panel panel-pad" id="stake-deposit">
          <div className="ap-title">
            <h3>Deposit into {activeToken?.symbol ?? "stake"}</h3>
          </div>
          <p style={{ margin: 0, color: "var(--text-2)", fontSize: 13.5, lineHeight: 1.55 }}>
            Pick one coin or {quote} & token at the current pool ratio. Fomo Ping never hands you
            LP tokens. Leftover is refunded. Rewards stream over 7 days, paid in {quote}.
          </p>
          <div className="field">
            <label>Amount ({quote})</label>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="decimal"
            />
          </div>
          <button
            type="button"
            className="btn"
            onClick={() => {
              if (!wallet) {
                pushToast("Connect a wallet first");
                return;
              }
              if (!current) return;
              const n = Number(amount);
              if (!n) {
                pushToast("Enter an amount");
                return;
              }
              addStakeDeposit(current.id, n);
            }}
          >
            {wallet ? "Deposit" : "Connect to deposit"}
          </button>
        </div>
        <div className="action-panel">
          <div className="ap-head">
            <div className="ap-title">
              <h3>Create a stake</h3>
            </div>
          </div>
          <div className="create-box">
            <p style={{ margin: 0, color: "var(--text-2)", fontSize: 14, maxWidth: "52ch" }}>
              Attach a stake to your token&apos;s {quote} pool so holders can deposit and earn a
              share of trading fees, paid in {chain === "sol" ? "SOL" : "ETH"}. The pool must
              already exist. One stake per pool.
            </p>
          </div>
          <div className="panel-pad" style={{ paddingTop: 0 }}>
            <div className="field">
              <label>Find a token</label>
              <input
                value={tokenQuery}
                onChange={(e) => setTokenQuery(e.target.value)}
                placeholder="SEARCH A TOKEN WITH A LIVE POOL"
              />
            </div>
            {createHits.map((t) =>
              t ? (
                <Link key={t.id} href={`/pools/${t.id}`} className="tok-search-hit" style={{ position: "relative" }}>
                  <TokenIcon symbol={t.symbol} logo={t.logo} size={18} />
                  <span className="tok-sym">{t.symbol}</span>
                  <span className="tok-name">{t.name}</span>
                  <span className="tok-addr">{formatUsd(t.mc)}</span>
                </Link>
              ) : null
            )}
            <p style={{ margin: 0, color: "var(--text-3)", fontSize: 12 }}>
              Rewards stream over 7-day periods. One-token deposits and compounding work
              immediately in this demo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
