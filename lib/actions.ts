import { fakeEvm } from "@/lib/format";
import {
  curveFromStored,
  curveToStored,
  emptyCurve,
  ethToWei,
  marketCapUsd,
  quoteBuy,
  quoteSell,
  spotPriceWei,
  weiToEth,
} from "@/lib/curve";
import { CREATION_FEE, DEFAULT_SUPPLY, ETH_USD } from "@/lib/protocol";
import { withStore } from "@/lib/store";
import { holderCount, kingId, viewToken } from "@/lib/views";
import type { StoredComment, StoredToken, TokenView } from "@/lib/types";

function idFromSymbol(symbol: string) {
  return symbol.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 12) || "token";
}

export async function listViews(): Promise<TokenView[]> {
  return withStore((store) => {
    const king = kingId(store.tokens);
    return store.tokens.map((t) =>
      viewToken(
        t,
        store.trades.filter((x) => x.tokenId === t.id),
        store.comments.filter((c) => c.tokenId === t.id).length,
        holderCount(store.balances[t.id]),
        king
      )
    );
  });
}

export async function getTokenBundle(id: string) {
  return withStore((store) => {
    const token = store.tokens.find(
      (t) => t.id === id || t.address.toLowerCase() === id.toLowerCase() || t.symbol.toLowerCase() === id.toLowerCase()
    );
    if (!token) return null;
    const king = kingId(store.tokens);
    const trades = store.trades.filter((x) => x.tokenId === token.id).sort((a, b) => b.ts - a.ts);
    const comments = store.comments.filter((c) => c.tokenId === token.id).sort((a, b) => b.createdAt - a.createdAt);
    const view = viewToken(token, trades, comments.length, holderCount(store.balances[token.id]), king);
    return { token: view, trades, comments, balances: store.balances[token.id] || {} };
  });
}

export async function createToken(input: {
  name: string;
  symbol: string;
  description: string;
  logo: string;
  twitter: string;
  telegram: string;
  website: string;
  creator: string;
  supply?: string;
  initialBuyEth?: string;
}) {
  const name = input.name.trim().slice(0, 32);
  const symbol = input.symbol.trim().toUpperCase().slice(0, 10);
  if (!name || !symbol) throw new Error("Name and ticker are required.");
  if (!/^[$A-Z0-9]+$/.test(symbol)) throw new Error("Ticker must be letters and numbers.");
  const creator = input.creator || fakeEvm(`anon-${Date.now()}`);
  const supply = input.supply ? ethToWei(input.supply) : DEFAULT_SUPPLY;
  if (supply < ethToWei(1_000_000)) throw new Error("Supply must be at least 1,000,000.");

  return withStore((store) => {
    let id = idFromSymbol(symbol);
    if (store.tokens.some((t) => t.id === id)) id = `${id}${Date.now().toString(36).slice(-4)}`;
    let state = emptyCurve(supply);
    const balances: Record<string, string> = {};
    let volume = 0n;
    let txCount = 0;
    const now = Date.now();
    const trades = [];

    const initial = input.initialBuyEth ? ethToWei(input.initialBuyEth) : 0n;
    if (initial > 0n) {
      const q = quoteBuy(state, initial);
      state = q.newState;
      balances[creator] = q.tokensOut.toString();
      volume += q.net;
      txCount = 1;
      trades.push({
        id: `${id}-genesis`,
        tokenId: id,
        trader: creator,
        isBuy: true,
        ethAmount: initial.toString(),
        tokenAmount: q.tokensOut.toString(),
        fee: q.fee.toString(),
        priceUsd: weiToEth(spotPriceWei(state)) * ETH_USD,
        marketCapUsd: marketCapUsd(state),
        ts: now,
      });
    }

    const token: StoredToken = {
      id,
      address: fakeEvm(`token-${id}-${now}`),
      curveAddress: fakeEvm(`curve-${id}-${now}`),
      name,
      symbol,
      description: input.description.trim().slice(0, 500),
      logo: input.logo.slice(0, 400_000),
      twitter: input.twitter.trim().slice(0, 120),
      telegram: input.telegram.trim().slice(0, 120),
      website: input.website.trim().slice(0, 120),
      creator,
      createdAt: now,
      ...curveToStored(state),
      graduatedAt: state.graduated ? now : undefined,
      volumeEth: volume.toString(),
      txCount,
      lastTradeAt: now,
    };
    store.tokens.unshift(token);
    store.balances[id] = balances;
    store.trades.push(...trades);
    return token;
  });
}

export async function executeTrade(input: {
  id: string;
  trader: string;
  side: "buy" | "sell";
  eth?: string;
  tokens?: string;
}) {
  const trader = input.trader;
  if (!trader) throw new Error("Connect a wallet first.");
  return withStore((store) => {
    const token = store.tokens.find((t) => t.id === input.id);
    if (!token) throw new Error("Token not found.");
    let state = curveFromStored(token);
    const balMap = store.balances[token.id] || (store.balances[token.id] = {});
    const now = Date.now();

    if (input.side === "buy") {
      const ethIn = ethToWei(input.eth || "0");
      if (ethIn <= 0n) throw new Error("Enter an ETH amount.");
      const q = quoteBuy(state, ethIn);
      if (q.tokensOut <= 0n) throw new Error("Trade too small.");
      state = q.newState;
      const prev = BigInt(balMap[trader] || "0");
      balMap[trader] = (prev + q.tokensOut).toString();
      token.volumeEth = (BigInt(token.volumeEth) + q.net).toString();
      const trade = {
        id: `${token.id}-${now}`,
        tokenId: token.id,
        trader,
        isBuy: true,
        ethAmount: ethIn.toString(),
        tokenAmount: q.tokensOut.toString(),
        fee: q.fee.toString(),
        priceUsd: weiToEth(spotPriceWei(state)) * ETH_USD,
        marketCapUsd: marketCapUsd(state),
        ts: now,
      };
      store.trades.push(trade);
      Object.assign(token, curveToStored(state));
      if (state.graduated && !token.graduatedAt) token.graduatedAt = now;
      token.txCount += 1;
      token.lastTradeAt = now;
      return { token, trade, creationFeeHint: CREATION_FEE.toString() };
    }

    const tokenIn = ethToWei(input.tokens || "0");
    if (tokenIn <= 0n) throw new Error("Enter a token amount.");
    const have = BigInt(balMap[trader] || "0");
    if (have < tokenIn) throw new Error("Not enough tokens.");
    const q = quoteSell(state, tokenIn);
    if (q.ethOut <= 0n) throw new Error("Trade too small.");
    state = q.newState;
    const next = have - tokenIn;
    if (next === 0n) delete balMap[trader];
    else balMap[trader] = next.toString();
    token.volumeEth = (BigInt(token.volumeEth) + q.gross).toString();
    const trade = {
      id: `${token.id}-${now}`,
      tokenId: token.id,
      trader,
      isBuy: false,
      ethAmount: q.gross.toString(),
      tokenAmount: tokenIn.toString(),
      fee: q.fee.toString(),
      priceUsd: weiToEth(spotPriceWei(state)) * ETH_USD,
      marketCapUsd: marketCapUsd(state),
      ts: now,
    };
    store.trades.push(trade);
    Object.assign(token, curveToStored(state));
    token.txCount += 1;
    token.lastTradeAt = now;
    return { token, trade, creationFeeHint: CREATION_FEE.toString() };
  });
}

export async function addComment(input: { id: string; user: string; text: string }) {
  const text = input.text.trim().slice(0, 280);
  if (!text) throw new Error("Write something first.");
  if (!input.user) throw new Error("Connect a wallet to chat.");
  return withStore((store) => {
    const token = store.tokens.find((t) => t.id === input.id);
    if (!token) throw new Error("Token not found.");
    const row: StoredComment = {
      id: `${input.id}-c-${Date.now()}`,
      tokenId: input.id,
      user: input.user,
      text,
      createdAt: Date.now(),
    };
    store.comments.push(row);
    return row;
  });
}

export async function profileFor(address: string) {
  const addr = address.toLowerCase();
  const views = await listViews();
  return withStore((store) => {
    const created = views.filter((t) => t.creator.toLowerCase() === addr);
    const held = views
      .map((token) => {
        const balance = store.balances[token.id]?.[address] || store.balances[token.id]?.[addr] || "0";
        // balances keyed by original casing
        const match = Object.entries(store.balances[token.id] || {}).find(
          ([k]) => k.toLowerCase() === addr
        );
        const bal = match ? match[1] : balance;
        return { token, balance: bal, valueUsd: weiToEth(BigInt(bal)) * token.priceUsd };
      })
      .filter((h) => BigInt(h.balance) > 0n)
      .sort((a, b) => b.valueUsd - a.valueUsd);
    return { address, created, held };
  });
}
