"use client";

import { GRADUATION_ETH, VIRTUAL_ETH } from "@/lib/protocol";
import { weiToEth } from "@/lib/curve";

export function CurveProgress({
  bps,
  graduated,
}: {
  bps: number;
  graduated?: boolean;
}) {
  const pct = Math.min(100, bps / 100);
  return (
    <div className="curve-wrap">
      <div className="curve-top">
        <span>{graduated ? "Graduated to AMM" : "Bonding curve"}</span>
        <span>{graduated ? "100%" : `${pct.toFixed(1)}% to DEX`}</span>
      </div>
      <div className="curve-bar lg">
        <span style={{ width: `${pct}%` }} />
      </div>
      <div className="curve-hint">
        Virtual {weiToEth(VIRTUAL_ETH)} ETH · graduates at {weiToEth(GRADUATION_ETH)} ETH real
        reserve · leftover tokens + ETH seed a Uniswap-style pool
      </div>
    </div>
  );
}
