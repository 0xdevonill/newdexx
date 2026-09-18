"use client";

import { useMemo, useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { BONDING_CURVE_ABI, ERC20_ABI, SIMPLE_AMM_ABI } from "@/lib/abi";
import {
  curveFromStored,
  quoteBuy,
  quoteSell,
  weiToEth,
  weiToTokens,
  ethToWei,
} from "@/lib/curve";
import { FACTORY_ADDRESS, FEE_BPS } from "@/lib/protocol";
import { useAppState } from "@/lib/app-state";
import { formatUsd, formatEth } from "@/lib/format";
import { wallet as walletEnv } from "@/lib/site";
import { ROBINHOOD_CHAIN_ID } from "@/lib/robinhood-chain";
import type { TokenView } from "@/lib/types";

const PRESETS = ["0.01", "0.05", "0.1", "0.5"];

export function BuySell({
  token,
  onTraded,
}: {
  token: TokenView;
  onTraded: () => void;
}) {
  const { wallet, pushToast } = useAppState();
  const { address, chainId } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("0.05");
  const [busy, setBusy] = useState(false);
  const trader = address || wallet;
  const liveOnchain = Boolean(walletEnv.live && FACTORY_ADDRESS && chainId === ROBINHOOD_CHAIN_ID);
  const state = useMemo(() => curveFromStored(token), [token]);
  const quote = useMemo(() => {
    try {
      if (side === "buy") return quoteBuy(state, ethToWei(amount || "0"));
      return quoteSell(state, ethToWei(amount || "0"));
    } catch {
      return null;
    }
  }, [state, amount, side]);

  const onTrade = async () => {
    if (!trader) {
      pushToast("Connect a wallet", "Buy and sell need an address.");
      return;
    }
    setBusy(true);
    try {
      if (liveOnchain) {
        if (side === "buy") {
          const target = token.graduated ? token.pairAddress : token.curveAddress;
          if (!target) throw new Error("Missing curve.");
          if (token.graduated) {
            await writeContractAsync({
              address: target as `0x${string}`,
              abi: SIMPLE_AMM_ABI,
              functionName: "buy",
              args: [token.address as `0x${string}`],
              value: ethToWei(amount),
            });
          } else {
            await writeContractAsync({
              address: token.curveAddress as `0x${string}`,
              abi: BONDING_CURVE_ABI,
              functionName: "buy",
              args: [trader as `0x${string}`],
              value: ethToWei(amount),
            });
          }
        } else {
          const spender = (token.graduated ? token.pairAddress : token.curveAddress) as `0x${string}`;
          await writeContractAsync({
            address: token.address as `0x${string}`,
            abi: ERC20_ABI,
            functionName: "approve",
            args: [spender, ethToWei(amount)],
          });
          if (token.graduated) {
            await writeContractAsync({
              address: spender,
              abi: SIMPLE_AMM_ABI,
              functionName: "sell",
              args: [token.address as `0x${string}`, ethToWei(amount)],
            });
          } else {
            await writeContractAsync({
              address: spender,
              abi: BONDING_CURVE_ABI,
              functionName: "sell",
              args: [ethToWei(amount), trader as `0x${string}`],
            });
          }
        }
        pushToast(side === "buy" ? "Buy sent" : "Sell sent", "Confirm in your wallet.");
      }
      const res = await fetch(`/api/tokens/${token.id}/trade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trader,
          side,
          eth: side === "buy" ? amount : undefined,
          tokens: side === "sell" ? amount : undefined,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Trade failed");
      pushToast(side === "buy" ? "Bought" : "Sold", `${Number(FEE_BPS) / 100}% protocol fee applied.`);
      onTraded();
    } catch (err) {
      pushToast("Trade failed", err instanceof Error ? err.message : "Try again.");
    } finally {
      setBusy(false);
    }
  };

  const receive =
    side === "buy"
      ? quote && "tokensOut" in quote
        ? `${weiToTokens(quote.tokensOut).toLocaleString("en-US", { maximumFractionDigits: 2 })} ${token.symbol}`
        : "—"
      : quote && "ethOut" in quote
        ? formatEth(weiToEth(quote.ethOut))
        : "—";

  return (
    <section className="action-panel trade-box">
      <div className="ap-head">
        <h3>{token.graduated ? "AMM swap" : "Bonding curve"}</h3>
        <div className="quote-switch">
          <button type="button" className={`qs-btn ${side === "buy" ? "on" : ""}`} onClick={() => setSide("buy")}>
            Buy
          </button>
          <button type="button" className={`qs-btn ${side === "sell" ? "on" : ""}`} onClick={() => setSide("sell")}>
            Sell
          </button>
        </div>
      </div>
      <div className="panel-pad">
        <label className="field">
          <span>{side === "buy" ? "Pay with ETH" : `Sell ${token.symbol}`}</span>
          <input
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={side === "buy" ? "0.05" : "1000000"}
          />
        </label>
        {side === "buy" ? (
          <div className="preset-row">
            {PRESETS.map((p) => (
              <button key={p} type="button" className="chip" onClick={() => setAmount(p)}>
                {p} ETH
              </button>
            ))}
          </div>
        ) : null}
        <div className="quote-line">
          <span>You receive</span>
          <strong>{receive}</strong>
        </div>
        <div className="quote-line">
          <span>Fee ({Number(FEE_BPS) / 100}%)</span>
          <strong>
            {quote ? formatEth(weiToEth("fee" in quote ? quote.fee : 0n)) : "—"}
          </strong>
        </div>
        <div className="quote-line">
          <span>Price</span>
          <strong>{formatUsd(token.priceUsd, 6)}</strong>
        </div>
        <button
          type="button"
          className={`btn ${side === "sell" ? "btn-ghost" : ""}`}
          disabled={busy}
          onClick={() => void onTrade()}
        >
          {busy ? "Sending…" : !trader ? "Connect to trade" : side === "buy" ? `Buy ${token.symbol}` : `Sell ${token.symbol}`}
        </button>
        <p className="wallet-note">
          {liveOnchain
            ? "Live: this trade hits the Robinhood Chain contract, then the indexer."
            : "Indexer mode: the curve math matches the Solidity contracts. Set NEXT_PUBLIC_FACTORY_ADDRESS after deploy to send mainnet txs."}
        </p>
      </div>
    </section>
  );
}
