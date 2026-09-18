"use client";

import Link from "next/link";
import { Wallet } from "lucide-react";
import { TokenIcon } from "@/components/token-icon";
import { WalletButton } from "@/components/wallet-button";
import { useAppState } from "@/lib/app-state";
import { formatUsd } from "@/lib/format";
import { useCatalog } from "@/lib/catalog";
import { PROTOCOL } from "@/lib/tokens";

export default function PositionsPage() {
  const { wallet, chain, positions, stakeDeposits, claimFees, withdrawPosition } = useAppState();
  const { tokenById } = useCatalog();
  const mine = positions.filter((p) => p.chain === chain);
  const stakes = stakeDeposits.filter((s) => s.chain === chain);

  if (!wallet) {
    return (
      <div className="app-page">
        <div className="page-lead">
          <h1>Positions</h1>
          <p>Your shaped pools and stake deposits live here once a wallet is connected.</p>
        </div>
        <div className="action-panel panel-pad empty">
          <div className="e-icon">
            <Wallet size={18} />
          </div>
          <h3>Connect to see positions</h3>
          <p>
            {PROTOCOL.name} never asks for a seed phrase. Connect any standard wallet, mint a position
            from Pools, or deposit into a Stake. Only your wallet can move what you put in.
          </p>
          <WalletButton />
        </div>
      </div>
    );
  }

  return (
    <div className="app-page">
      <div className="page-lead">
        <h1>Positions</h1>
        <p>
          Once you mint, a card shows current value, holdings, unclaimed fees, and PnL.{" "}
          {PROTOCOL.name} takes 7.5% from fees you claim, never from principal.
        </p>
      </div>
      {mine.length === 0 && stakes.length === 0 ? (
        <div className="action-panel panel-pad empty">
          <div className="e-icon">
            <Wallet size={18} />
          </div>
          <h3>No positions yet</h3>
          <p>
            Open a pool, pick a shape, and mint — or deposit into an existing stake. Nothing
            is locked. Withdraw whenever you want.
          </p>
          <div className="pos-actions">
            <Link href="/pools" className="btn">
              Browse pools
            </Link>
            <Link href="/stakes" className="btn btn-ghost">
              View stakes
            </Link>
          </div>
        </div>
      ) : (
        <>
          {mine.map((p) => {
            const tok = tokenById(p.tokenId);
            if (!tok) return null;
            const pnl = p.valueUsd - p.depositedUsd;
            return (
              <div key={p.id} className="pos-card">
                <div className="pos-card-head">
                  <TokenIcon symbol={tok.symbol} logo={tok.logo} size={34} />
                  <div>
                    <div className="tok-sym">{tok.symbol}</div>
                    <div className="tok-name" style={{ whiteSpace: "normal" }}>
                      {p.shape} · {tok.quote} quote
                    </div>
                  </div>
                  <Link href={`/pools/${tok.id}`} className="btn btn-ghost btn-sm" style={{ marginLeft: "auto" }}>
                    Pool
                  </Link>
                </div>
                <div className="pos-meta">
                  <div className="stat">
                    <div className="k">Value</div>
                    <div className="v">{formatUsd(p.valueUsd)}</div>
                  </div>
                  <div className="stat">
                    <div className="k">Deposited</div>
                    <div className="v">{formatUsd(p.depositedUsd)}</div>
                  </div>
                  <div className="stat">
                    <div className="k">PnL</div>
                    <div className={`v ${pnl >= 0 ? "chg up" : "chg down"}`}>{formatUsd(pnl)}</div>
                  </div>
                  <div className="stat">
                    <div className="k">Unclaimed</div>
                    <div className="v">{formatUsd(Math.max(0.42, p.depositedUsd * 0.004))}</div>
                  </div>
                </div>
                <div className="pos-actions">
                  <button type="button" className="btn btn-soft" onClick={() => claimFees(p.id)}>
                    Claim fees
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => withdrawPosition(p.id)}>
                    Withdraw
                  </button>
                </div>
              </div>
            );
          })}
          {stakes.map((s) => (
            <div key={s.id} className="pos-card">
              <div className="pos-card-head">
                <div>
                  <div className="tok-sym">Stake deposit</div>
                  <div className="tok-name">{s.stakeId}</div>
                </div>
              </div>
              <div className="pos-meta">
                <div className="stat">
                  <div className="k">Amount</div>
                  <div className="v">{s.amountQuote}</div>
                </div>
                <div className="stat">
                  <div className="k">Lockup</div>
                  <div className="v">None</div>
                </div>
                <div className="stat">
                  <div className="k">Exit penalty</div>
                  <div className="v">None</div>
                </div>
                <div className="stat">
                  <div className="k">Stream</div>
                  <div className="v">7 days</div>
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
