"use client";

import Link from "next/link";
import { Crown } from "lucide-react";
import { TokenIcon } from "@/components/token-icon";
import { formatPct, formatUsd, relativeTime } from "@/lib/format";
import { weiToEth } from "@/lib/curve";
import type { TokenView } from "@/lib/types";

export function TokenCard({ token }: { token: TokenView }) {
  const up = token.change24h >= 0;
  const pct = token.progressBps / 100;
  return (
    <Link href={`/token/${token.id}`} className="tcard">
      <div className="tcard-art">
        <TokenIcon symbol={token.symbol} logo={token.logo} size={160} />
        {token.king ? (
          <span className="tcard-king">
            <Crown size={12} /> King
          </span>
        ) : null}
        {token.graduated ? <span className="tcard-grad">DEX</span> : null}
      </div>
      <div className="tcard-body">
        <div className="tcard-row">
          <span className="tcard-sym">{token.symbol}</span>
          <span className={`chg ${up ? "up" : "down"}`}>{formatPct(token.change24h)}</span>
        </div>
        <div className="tcard-name">{token.name}</div>
        <p className="tcard-desc">{token.description || "No bio."}</p>
        <div className="tcard-meta">
          <span>MC {formatUsd(token.marketCapUsd)}</span>
          <span>{relativeTime(token.createdAt)}</span>
        </div>
        {!token.graduated ? (
          <div className="curve-bar" title={`${pct.toFixed(1)}% to DEX`}>
            <span style={{ width: `${Math.min(100, pct)}%` }} />
          </div>
        ) : (
          <div className="tcard-amm">
            AMM · {weiToEth(BigInt(token.ammEth || "0")).toFixed(2)} ETH LP
          </div>
        )}
        <div className="tcard-foot">
          <span>{token.replies} replies</span>
          <span>{token.txCount} tx</span>
        </div>
      </div>
    </Link>
  );
}
