"use client";

import Link from "next/link";
import { formatUsd, relativeTime, shortAddr } from "@/lib/format";
import { weiToEth, weiToTokens } from "@/lib/curve";
import type { StoredTrade } from "@/lib/types";

export function TxHistory({ trades }: { trades: StoredTrade[] }) {
  if (!trades.length) {
    return (
      <div className="empty">
        <h3>No trades yet</h3>
        <p>Be the first buy on this curve.</p>
      </div>
    );
  }
  return (
    <div className="table-wrap">
      <table className="ftable">
        <thead>
          <tr>
            <th>Side</th>
            <th>Account</th>
            <th>ETH</th>
            <th>Tokens</th>
            <th className="col-desk">MC</th>
            <th>Age</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((t) => (
            <tr key={t.id}>
              <td>
                <span className={`chg ${t.isBuy ? "up" : "down"}`}>{t.isBuy ? "Buy" : "Sell"}</span>
              </td>
              <td>
                <Link href={`/profile/${t.trader}`}>{shortAddr(t.trader)}</Link>
              </td>
              <td>{weiToEth(BigInt(t.ethAmount)).toFixed(4)}</td>
              <td>{weiToTokens(BigInt(t.tokenAmount)).toLocaleString("en-US", { maximumFractionDigits: 1 })}</td>
              <td className="col-desk">{formatUsd(t.marketCapUsd)}</td>
              <td>{relativeTime(t.ts)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
