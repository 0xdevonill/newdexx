"use client";

import Link from "next/link";
import { useState } from "react";
import { KingHill } from "@/components/king-hill";
import { TokenCard } from "@/components/token-card";
import { useBoard } from "@/lib/use-board";
import { sortTokens } from "@/lib/views";

const TABS = [
  { id: "trending", label: "Trending" },
  { id: "new", label: "New" },
  { id: "mc", label: "Market cap" },
  { id: "grad", label: "Almost DEX" },
  { id: "graduated", label: "Graduated" },
];

export default function HomePage() {
  const { tokens, king, loading } = useBoard("trending");
  const [tab, setTab] = useState("trending");
  const list = sortTokens(tokens, tab);

  return (
    <div className="launch-home">
      <section className="page-lead">
        <h1>Launch on Robinhood Chain.</h1>
        <p>
          Bonding-curve meme coins. 1% fee. At 5 ETH of real reserve the leftover supply plus ETH
          migrate to a Uniswap-style AMM automatically. Not an official Robinhood product.
        </p>
        <div className="lead-actions">
          <Link className="btn" href="/create">
            Create token
          </Link>
          <Link className="btn btn-ghost" href="/docs">
            How it works
          </Link>
        </div>
      </section>
      <KingHill token={king} />
      <div className="board-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`chip ${tab === t.id ? "on" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {loading && tokens.length === 0 ? (
        <p className="wallet-note">Loading the board…</p>
      ) : list.length === 0 ? (
        <div className="empty">
          <h3>Nothing here yet</h3>
          <p>Create a token or switch tabs.</p>
        </div>
      ) : (
        <div className="token-grid">
          {list.map((t) => (
            <TokenCard key={t.id} token={t} />
          ))}
        </div>
      )}
    </div>
  );
}
