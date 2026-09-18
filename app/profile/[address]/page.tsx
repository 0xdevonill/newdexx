"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { TokenCard } from "@/components/token-card";
import { formatUsd, shortAddr } from "@/lib/format";
import { weiToTokens } from "@/lib/curve";
import { explorerAddress } from "@/lib/protocol";
import type { ProfileView } from "@/lib/types";

export default function ProfilePage() {
  const params = useParams<{ address: string }>();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileView | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetch(`/api/profile/${params.address}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data: ProfileView) => {
        if (!cancelled) setProfile(data);
      });
    return () => {
      cancelled = true;
    };
  }, [params.address]);

  if (!profile) return <p className="wallet-note">Loading profile…</p>;

  return (
    <div className="app-page">
      <div className="page-lead">
        <h1>{shortAddr(profile.address)}</h1>
        <p>
          <a href={explorerAddress(profile.address)} target="_blank" rel="noreferrer">
            Robinhood explorer
          </a>
          {" · "}
          {profile.created.length} launched · {profile.held.length} held
        </p>
      </div>
      <section>
        <h3 className="section-k">Holdings</h3>
        {profile.held.length === 0 ? (
          <p className="wallet-note">No bags yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="ftable">
              <thead>
                <tr>
                  <th>Token</th>
                  <th>Balance</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {profile.held.map((h) => (
                  <tr key={h.token.id} onClick={() => router.push(`/token/${h.token.id}`)}>
                    <td>
                      {h.token.symbol} · {h.token.name}
                    </td>
                    <td>{weiToTokens(BigInt(h.balance)).toLocaleString("en-US", { maximumFractionDigits: 2 })}</td>
                    <td>{formatUsd(h.valueUsd)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <section>
        <h3 className="section-k">Created</h3>
        {profile.created.length === 0 ? (
          <p className="wallet-note">This wallet has not launched a token.</p>
        ) : (
          <div className="token-grid">
            {profile.created.map((t) => (
              <TokenCard key={t.id} token={t} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
