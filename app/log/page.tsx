"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { readActivity } from "@/lib/activity";
import { chainById } from "@/lib/catalog";
import { formatToken, relativeTime } from "@/lib/format";

function emptyActivity() {
  return [] as ReturnType<typeof readActivity>;
}

function subscribeActivity() {
  return () => undefined;
}

export default function LogPage() {
  const rows = useSyncExternalStore(subscribeActivity, readActivity, emptyActivity);


  return (
    <div>
      <h1 className="page-title">Crossing log</h1>
      <p className="muted">
        Fares you signed in this browser. Origin hashes land here after confirm; destination fills
        are tracked against the Relay request id.
      </p>
      {rows.length === 0 ? (
        <div className="empty" style={{ marginTop: 20 }}>
          <h3>No crossings yet</h3>
          <p>
            <Link href="/">Board a fare</Link> to see it here.
          </p>
        </div>
      ) : (
        <div className="log-list">
          {rows.map((row) => {
            const from = chainById(row.fromChainId)?.displayName || row.fromChainId;
            const to = chainById(row.toChainId)?.displayName || row.toChainId;
            return (
              <article key={row.id} className="log-row">
                <div>
                  <strong>
                    {formatToken(row.amountIn)} {row.fromSymbol} → {formatToken(row.amountOut)}{" "}
                    {row.toSymbol}
                  </strong>
                  <div className="muted">
                    {from} → {to} · {relativeTime(row.ts)}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span className={`status-pill ${row.status}`}>{row.status}</span>
                  {row.explorerUrl ? (
                    <div>
                      <a href={row.explorerUrl} target="_blank" rel="noreferrer">
                        Origin tx
                      </a>
                    </div>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
