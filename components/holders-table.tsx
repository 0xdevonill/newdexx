"use client";

import Link from "next/link";
import { shortAddr } from "@/lib/format";
import { weiToTokens } from "@/lib/curve";

export function HoldersTable({
  holders,
}: {
  holders: { address: string; balance: string; pct: number }[];
}) {
  if (!holders.length) {
    return (
      <div className="empty">
        <h3>No holders</h3>
        <p>Buy to show up here.</p>
      </div>
    );
  }
  return (
    <div className="table-wrap">
      <table className="ftable">
        <thead>
          <tr>
            <th>#</th>
            <th>Wallet</th>
            <th>Balance</th>
            <th>%</th>
          </tr>
        </thead>
        <tbody>
          {holders.map((h, i) => (
            <tr key={h.address}>
              <td>{i + 1}</td>
              <td>
                <Link href={`/profile/${h.address}`}>{shortAddr(h.address)}</Link>
              </td>
              <td>{weiToTokens(BigInt(h.balance)).toLocaleString("en-US", { maximumFractionDigits: 2 })}</td>
              <td>{h.pct.toFixed(2)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
