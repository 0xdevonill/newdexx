"use client";

import { useState } from "react";
import { ArrowDownUp, ChevronDown } from "lucide-react";
import { erc20Abi, type Address, type Hex } from "viem";
import {
  useAccount,
  useBalance,
  useReadContract,
  useSendTransaction,
  useSignMessage,
  useSignTypedData,
  useSwitchChain,
} from "wagmi";
import { AssetIcon, ChainPicker, TokenPicker } from "@/components/pickers";
import { MiniWalletButton, useWalletUi } from "@/components/wallet-button";
import { useBridge } from "@/components/bridge-context";
import { patchActivity, pushActivity } from "@/lib/activity";
import { useAppState } from "@/lib/app-state";
import { isNative } from "@/lib/catalog";
import {
  explorerTx,
  formatEta,
  formatToken,
  formatUsd,
  toTokenInput,
} from "@/lib/format";
import { pollIntent, requestQuote } from "@/lib/relay";
import type { CatalogToken } from "@/lib/types";

function useAssetBalance(chainId: number, token: CatalogToken) {
  const { address } = useAccount();
  const native = useBalance({
    address,
    chainId,
    query: { enabled: Boolean(address) && isNative(token.address) },
  });
  const erc20 = useReadContract({
    abi: erc20Abi,
    address: token.address as Address,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId,
    query: { enabled: Boolean(address) && !isNative(token.address) },
  });
  const raw = isNative(token.address) ? native.data?.value : (erc20.data as bigint | undefined);
  return {
    raw,
    formatted: raw === undefined ? null : toTokenInput(raw, token.decimals),
    loading: native.isLoading || erc20.isLoading,
  };
}

export function BridgeWidget() {
  const {
    fromChain,
    toChain,
    fromToken,
    toToken,
    amount,
    setAmount,
    recipient,
    setRecipient,
    customRecipient,
    setCustomRecipient,
    quote,
    quoteError,
    quoting,
    lesson,
    setLesson,
    setFrom,
    setTo,
    flip,
    parsedAmount,
    fare,
  } = useBridge();
  const { address, isConnected, chainId } = useAccount();
  const { openConnect } = useWalletUi();
  const { pushToast } = useAppState();
  const { sendTransactionAsync } = useSendTransaction();
  const { switchChainAsync } = useSwitchChain();
  const { signMessageAsync } = useSignMessage();
  const { signTypedDataAsync } = useSignTypedData();
  const bal = useAssetBalance(fromChain.id, fromToken);
  const [fromChainOpen, setFromChainOpen] = useState(false);
  const [toChainOpen, setToChainOpen] = useState(false);
  const [fromTokenOpen, setFromTokenOpen] = useState(false);
  const [toTokenOpen, setToTokenOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const outAmount = quote?.details?.currencyOut?.amountFormatted;
  const outUsd = quote?.details?.currencyOut?.amountUsd;
  const inUsd = quote?.details?.currencyIn?.amountUsd;
  const eta = quote?.details?.timeEstimate;
  const impact = quote?.details?.totalImpact?.percent;
  const sameChain = fromChain.id === toChain.id;
  const actionLabel = sameChain ? "Swap" : fromToken.symbol === toToken.symbol ? "Bridge" : "Bridge & swap";

  const cta = (() => {
    if (busy) return status || "Working…";
    if (!isConnected) return "Connect wallet to dock";
    if (!parsedAmount || parsedAmount <= 0n) return "Enter cargo";
    if (quoting) return "Pricing the fare…";
    if (quoteError) return "No fare — try another lane";
    if (!quote) return "Review crossing";
    return `Confirm ${actionLabel.toLowerCase()}`;
  })();

  const onMax = () => {
    if (bal.formatted) setAmount(bal.formatted);
  };

  const execute = async () => {
    if (!isConnected || !address) {
      openConnect();
      return;
    }
    if (!parsedAmount || parsedAmount <= 0n) {
      setLesson("amount");
      return;
    }
    setBusy(true);
    setStatus("Checking fare…");
    const logId = `${Date.now()}`;
    try {
      let q = quote;
      const needFresh =
        !q ||
        (q.details?.sender && q.details.sender.toLowerCase() !== address.toLowerCase());
      if (needFresh) {
        q = await requestQuote({
          user: address,
          recipient: customRecipient && recipient ? recipient : address,
          originChainId: fromChain.id,
          destinationChainId: toChain.id,
          originToken: fromToken,
          destinationToken: toToken,
          amount: parsedAmount.toString(),
        });
      }
      if (!q?.steps?.length) throw new Error("This fare has no executable steps.");

      pushActivity({
        id: logId,
        requestId: q.requestId,
        fromChainId: fromChain.id,
        toChainId: toChain.id,
        fromSymbol: fromToken.symbol,
        toSymbol: toToken.symbol,
        amountIn: amount,
        amountOut: q.details?.currencyOut?.amountFormatted || "—",
        status: "pending",
        ts: Date.now(),
      });

      let lastHash: string | undefined;
      let requestId = q.requestId;
      for (const step of q.steps) {
        const item = step.items?.[0];
        if (!item?.data) continue;
        if (step.kind === "signature") {
          setStatus(step.action || "Sign in wallet…");
          const kind = (item.data.signatureKind || "").toLowerCase();
          if (kind.includes("712") || item.data.domain) {
            await signTypedDataAsync({
              domain: item.data.domain,
              types: item.data.types,
              primaryType: item.data.primaryType || "Permit",
              message:
                typeof item.data.value === "object" && item.data.value
                  ? item.data.value
                  : {},
            } as never);
          } else {
            const message =
              (typeof item.data.message === "string" && item.data.message) ||
              (typeof item.data.value === "string" ? item.data.value : "") ||
              "";
            if (!message) throw new Error("This route needs a signature format Quay cannot sign yet.");
            await signMessageAsync({ message });
          }
          continue;
        }
        if (step.kind && step.kind !== "transaction") continue;
        const txChain = Number(item.data.chainId || fromChain.id);
        if (chainId !== txChain) {
          setStatus(`Switch to ${fromChain.displayName}…`);
          await switchChainAsync({ chainId: txChain });
        }
        setStatus(step.action || "Confirm in wallet…");
        const valueRaw = typeof item.data.value === "string" ? item.data.value : "0";
        lastHash = await sendTransactionAsync({
          to: item.data.to as Address,
          data: (item.data.data as Hex | undefined) || undefined,
          value: BigInt(valueRaw || "0"),
        });
        requestId =
          step.requestId ||
          q.requestId ||
          item.check?.endpoint?.match(/requestId=(0x[a-fA-F0-9]+)/i)?.[1] ||
          requestId;
        if (item.check?.endpoint && requestId) {
          setStatus("Waiting for the other dock to fill…");
          const filled = await pollIntent(requestId);
          if (filled === "pending") {
            pushToast("Origin tx sent", "The destination fill is still in flight. Check the log.");
          }
        }
      }

      patchActivity(logId, {
        status: "success",
        hash: lastHash,
        requestId,
        explorerUrl: lastHash ? explorerTx(fromChain.explorerUrl, lastHash) : undefined,
      });
      pushToast("Crossing sent", lastHash ? `Origin tx ${lastHash.slice(0, 10)}…` : "Fare submitted.");
      setAmount("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Wallet rejected the crossing.";
      patchActivity(logId, { status: "failed" });
      pushToast("Could not cross", message);
    } finally {
      setBusy(false);
      setStatus(null);
    }
  };

  return (
    <section className="boarding" aria-label="Crossing ticket">
      <div className="boarding-head">
        <strong>Boarding pass</strong>
        <span>{actionLabel}</span>
      </div>

      <div
        className={`dock ${lesson === "from" || lesson === "amount" || lesson === "wallet" ? "focus" : ""}`}
        onClick={() => setLesson("from")}
      >
        <div className="dock-row">
          <span className="dock-label">Departure</span>
          <MiniWalletButton label="Dock wallet" />
        </div>
        <div className="dock-row" style={{ marginTop: 10 }}>
          <button type="button" className="pick" onClick={() => setFromChainOpen(true)}>
            <AssetIcon src={fromChain.iconUrl} label={fromChain.displayName} />
            {fromChain.displayName}
            <ChevronDown size={14} />
          </button>
          <button type="button" className="pick" onClick={() => setFromTokenOpen(true)}>
            <AssetIcon src={fromToken.logo || fromChain.iconUrl} label={fromToken.symbol} />
            {fromToken.symbol}
            <ChevronDown size={14} />
          </button>
        </div>
        <input
          className="amount-input"
          inputMode="decimal"
          placeholder="0"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            setLesson("amount");
          }}
          onFocus={() => setLesson("amount")}
        />
        <div className="dock-meta">
          <span>{inUsd ? formatUsd(inUsd) : "You send"}</span>
          <span>
            {bal.formatted ? `Balance ${formatToken(bal.formatted)}` : "Balance —"}
            {bal.formatted ? (
              <>
                {" · "}
                <button type="button" className="linkish" onClick={onMax}>
                  Max
                </button>
              </>
            ) : null}
          </span>
        </div>
      </div>

      <div className="gangway">
        <button type="button" onClick={flip} aria-label="Flip direction">
          <ArrowDownUp size={16} />
        </button>
      </div>

      <div className={`dock ${lesson === "to" || lesson === "review" ? "focus" : ""}`} onClick={() => setLesson("to")}>
        <div className="dock-row">
          <span className="dock-label">Arrival</span>
          <button
            type="button"
            className="linkish"
            onClick={() => setCustomRecipient(!customRecipient)}
          >
            {customRecipient ? "Use connected wallet" : "Different recipient"}
          </button>
        </div>
        <div className="dock-row" style={{ marginTop: 10 }}>
          <button type="button" className="pick" onClick={() => setToChainOpen(true)}>
            <AssetIcon src={toChain.iconUrl} label={toChain.displayName} />
            {toChain.displayName}
            <ChevronDown size={14} />
          </button>
          <button type="button" className="pick" onClick={() => setToTokenOpen(true)}>
            <AssetIcon src={toToken.logo || toChain.iconUrl} label={toToken.symbol} />
            {toToken.symbol}
            <ChevronDown size={14} />
          </button>
        </div>
        <input
          className="amount-input"
          readOnly
          placeholder="0"
          value={outAmount ? formatToken(outAmount) : quoting ? "…" : ""}
        />
        <div className="dock-meta">
          <span>{outUsd ? formatUsd(outUsd) : "You receive"}</span>
          <span>
            {customRecipient && recipient ? "Custom address" : "Same wallet on arrival"}
          </span>
        </div>
        {customRecipient ? (
          <div className="recipient">
            <input
              placeholder="0x recipient on the arrival chain"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value.trim())}
            />
          </div>
        ) : null}
      </div>

      <div className="ticket">
        <div className="ticket-main">
          <dl>
            <div>
              <dt>Fare</dt>
              <dd>{quoting ? "…" : fare ? formatUsd(fare) : "—"}</dd>
            </div>
            <div>
              <dt>Rate</dt>
              <dd>{quote?.details?.rate ? formatToken(quote.details.rate) : "—"}</dd>
            </div>
            <div>
              <dt>Impact</dt>
              <dd>{impact ? `${impact}%` : "—"}</dd>
            </div>
            <div>
              <dt>Route</dt>
              <dd>{quote?.details?.operation || (sameChain ? "swap" : "bridge")}</dd>
            </div>
          </dl>
        </div>
        <div className="ticket-stub">
          <span className="dock-label">ETA</span>
          <b>{quoting ? "…" : formatEta(eta)}</b>
        </div>
      </div>

      {quoteError ? <p className="err">{quoteError}</p> : null}

      <button
        type="button"
        className="cta cta-xl"
        disabled={busy || (!!parsedAmount && quoting)}
        onClick={() => void execute()}
      >
        {cta}
      </button>

      <ChainPicker
        open={fromChainOpen}
        onOpenChange={setFromChainOpen}
        selectedId={fromChain.id}
        onPick={(c) => setFrom(c)}
      />
      <ChainPicker
        open={toChainOpen}
        onOpenChange={setToChainOpen}
        selectedId={toChain.id}
        onPick={(c) => setTo(c)}
      />
      <TokenPicker
        open={fromTokenOpen}
        onOpenChange={setFromTokenOpen}
        chain={fromChain}
        selected={fromToken}
        onPick={(t) => setFrom(fromChain, t)}
      />
      <TokenPicker
        open={toTokenOpen}
        onOpenChange={setToTokenOpen}
        chain={toChain}
        selected={toToken}
        onPick={(t) => setTo(toChain, t)}
      />
    </section>
  );
}
