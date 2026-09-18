"use client";

import Link from "next/link";
import { Crown } from "lucide-react";
import { TokenIcon } from "@/components/token-icon";
import { CurveProgress } from "@/components/curve-progress";
import { formatPct, formatUsd } from "@/lib/format";
import type { TokenView } from "@/lib/types";

export function KingHill({ token }: { token: TokenView | null }) {
  if (!token) {
    return (
      <section className="king-card empty-king">
        <div className="king-k">
          <Crown size={14} /> King of the Hill
        </div>
        <p>No live curve yet. Launch a token and take the crown.</p>
      </section>
    );
  }
  const up = token.change24h >= 0;
  return (
    <Link href={`/token/${token.id}`} className="king-card">
      <div className="king-art">
        <TokenIcon symbol={token.symbol} logo={token.logo} size={132} />
      </div>
      <div className="king-body">
        <div className="king-k">
          <Crown size={14} /> King of the Hill
        </div>
        <h2>
          {token.name} <span>${token.symbol}</span>
        </h2>
        <p>{token.description}</p>
        <div className="king-stats">
          <div>
            <span className="k">Market cap</span>
            <span className="v">{formatUsd(token.marketCapUsd)}</span>
          </div>
          <div>
            <span className="k">24h</span>
            <span className={`v ${up ? "up" : "down"}`}>{formatPct(token.change24h)}</span>
          </div>
          <div>
            <span className="k">Holders</span>
            <span className="v">{token.holders}</span>
          </div>
        </div>
        <CurveProgress bps={token.progressBps} graduated={token.graduated} />
      </div>
    </Link>
  );
}
