"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Check, Copy } from "lucide-react";
import { PriceChart } from "@/components/price-chart";
import { TokenIcon } from "@/components/token-icon";
import { useAppState } from "@/lib/app-state";
import { parseTokenRouteId } from "@/lib/dex";
import { formatAge, formatInt, formatPct, formatPrice, formatUsd, shortAddr } from "@/lib/format";
import { PROTOCOL, quoteUnit } from "@/lib/tokens";
import { useCatalog } from "@/lib/catalog";
import type { ShapeId, Token } from "@/lib/types";

const SHAPES: { id: ShapeId; label: string; hint: string }[] = [
  { id: "concentrated", label: "Concentrated", hint: "Tight band. Higher fee density while price stays inside." },
  { id: "uniform", label: "Uniform", hint: "Even spread across the range. Less babysitting." },
  { id: "wide", label: "Wide", hint: "Stays in range longer. Lower fee per dollar." },
];

export default function PoolDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { wallet, addPosition, chain, setChain, pushToast, rememberToken } = useAppState();
  const { tokenById } = useCatalog();
  const catalogToken = tokenById(params.id);
  const [remote, setRemote] = useState<{ id: string; token: Token | null } | null>(null);
  const [shape, setShape] = useState<ShapeId>("concentrated");
  const [amount, setAmount] = useState("250");
  const [copied, setCopied] = useState(false);
  const parsed = parseTokenRouteId(params.id);

  useEffect(() => {
    if (catalogToken) return;
    if (!parsed?.address) return;
    const id = params.id;
    let cancelled = false;
    void fetch(
      `/api/token?chain=${parsed.chain}&address=${encodeURIComponent(parsed.address)}`,
      { cache: "no-store" }
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { token?: Token | null } | null) => {
        if (cancelled) return;
        if (data?.token) rememberToken(data.token);
        setRemote({ id, token: data?.token ?? null });
      })
      .catch(() => {
        if (!cancelled) setRemote({ id, token: null });
      });
    return () => {
      cancelled = true;
    };
  }, [catalogToken, params.id, parsed?.address, parsed?.chain, rememberToken]);

  const token = catalogToken || (remote?.id === params.id ? remote.token : null);
  const loadingToken = !catalogToken && Boolean(parsed?.address) && remote?.id !== params.id;

  useEffect(() => {
    if (token && token.chain !== chain) setChain(token.chain);
  }, [token, chain, setChain]);

  const price = useMemo(() => {
    if (!token) return 0;
    return token.priceUsd && token.priceUsd > 0 ? token.priceUsd : token.mc / 1_000_000_000;
  }, [token]);

  if (!token) {
    return (
      <div className="empty">
        <h3>{loadingToken ? "Loading pool" : "Pool not found"}</h3>
        <p>
          {loadingToken
            ? "Looking up this contract on the selected chain."
            : "This token is not listed on the selected chain."}
        </p>
        <button type="button" className="btn btn-ghost" onClick={() => router.push("/pools")}>
          Back to pools
        </button>
      </div>
    );
  }

  const up = token.change24h >= 0;
  const quote = quoteUnit(token.chain);
  const rangeMin = price * (shape === "wide" ? 0.72 : shape === "uniform" ? 0.86 : 0.94);
  const rangeMax = price * (shape === "wide" ? 1.34 : shape === "uniform" ? 1.16 : 1.07);
  const usd = Number(amount) || 0;

  return (
    <div className="token-page">
      <div>
        <div className="tok-hero">
          <TokenIcon symbol={token.symbol} logo={token.logo} size={46} />
          <div className="tok-hero-id">
            <h1>{token.symbol}</h1>
            <div className="sub">{token.name}</div>
            <div className="tok-hero-addr">
              {shortAddr(token.address)}
              <button
                type="button"
                className="tok-copy"
                aria-label="Copy address"
                onClick={async () => {
                  await navigator.clipboard.writeText(token.address);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1400);
                }}
              >
                {copied ? <Check size={12} className="ok" /> : <Copy size={12} />}
              </button>
            </div>
            {token.featured ? (
              <div className="tok-links">
                {PROTOCOL.x ? (
                  <a href={PROTOCOL.x} target="_blank" rel="noopener noreferrer">
                    X
                  </a>
                ) : null}
                {PROTOCOL.ponsUrl ? (
                  <a href={PROTOCOL.ponsUrl} target="_blank" rel="noopener noreferrer">
                    Pons{PROTOCOL.ponsId ? ` ${PROTOCOL.ponsId}` : ""}
                  </a>
                ) : null}
                {PROTOCOL.discord ? (
                  <a href={PROTOCOL.discord} target="_blank" rel="noopener noreferrer">
                    Discord
                  </a>
                ) : null}
              </div>
            ) : null}
            {token.featured && PROTOCOL.tokenInfo ? (
              <p className="sub" style={{ marginTop: 6 }}>{PROTOCOL.tokenInfo}</p>
            ) : null}
          </div>
        </div>
        <div className="stat-strip">
          <div className="stat">
            <div className="k">Price</div>
            <div className="v">{formatPrice(token.priceUsd ?? price)}</div>
          </div>
          <div className="stat">
            <div className="k">Market cap</div>
            <div className="v">{formatUsd(token.mc)}</div>
          </div>
          <div className="stat">
            <div className="k">24h</div>
            <div className={`v ${up ? "chg up" : "chg down"}`}>{formatPct(token.change24h)}</div>
          </div>
          <div className="stat">
            <div className="k">Vol 24h</div>
            <div className="v">{formatUsd(token.vol24h)}</div>
          </div>
        </div>
        <div className="chart-card">
          <PriceChart seed={token.id} up={up} />
        </div>
        <div className="action-panel panel-pad" style={{ marginTop: 14 }}>
          <div className="ap-head" style={{ border: 0, padding: 0, background: "none" }}>
            <div className="ap-title">
              <h3>Pool</h3>
            </div>
          </div>
          <p style={{ margin: 0, color: "var(--text-2)", fontSize: 14, lineHeight: 1.6 }}>
            {token.symbol}/{quote} · {token.quote} quote · age {formatAge(token.ageHours)} ·{" "}
            {formatInt(token.trades24h)} trades in 24h. Fomo Ping finds every fee tier and defaults
            to the deepest book. A 7.5% cut is taken only when you claim fees, never from principal.
          </p>
        </div>
      </div>
      <div className="action-panel panel-pad">
        <div className="ap-title">
          <h3>Provide liquidity</h3>
        </div>
        <p style={{ margin: 0, color: "var(--text-2)", fontSize: 13.5, lineHeight: 1.55 }}>
          Build a shaped position from a single coin. Fomo Ping mints the position NFT into a
          contract only your wallet controls.
        </p>
        <div className="field">
          <label>Deposit amount (USD)</label>
          <input
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div className="field">
          <label>Shape</label>
          <div className="shape-row">
            {SHAPES.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`shape-btn ${shape === s.id ? "on" : ""}`}
                onClick={() => setShape(s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>
          <p style={{ margin: 0, color: "var(--text-3)", fontSize: 12 }}>
            {SHAPES.find((s) => s.id === shape)?.hint}
          </p>
        </div>
        <div className="stat-strip" style={{ gridTemplateColumns: "1fr 1fr", margin: 0 }}>
          <div className="stat">
            <div className="k">Min</div>
            <div className="v">${rangeMin.toFixed(4)}</div>
          </div>
          <div className="stat">
            <div className="k">Max</div>
            <div className="v">${rangeMax.toFixed(4)}</div>
          </div>
        </div>
        <button
          type="button"
          className="btn"
          disabled={!usd}
          onClick={() => {
            if (!wallet) {
              pushToast("Connect a wallet first");
              return;
            }
            addPosition({
              tokenId: token.id,
              shape,
              depositedUsd: usd,
              rangeMin,
              rangeMax,
            });
          }}
        >
          {wallet ? "Mint position" : "Connect to mint"}
        </button>
        <p style={{ margin: 0, color: "var(--text-3)", fontSize: 12, lineHeight: 1.5 }}>
          Protocol take: {(PROTOCOL.claimFee * 100).toFixed(1)}% of claimed fees. Deposit,
          withdraw, and creating a stake are free aside from network gas.
        </p>
      </div>
    </div>
  );
}
