import { fakeEvm, hashSeed } from "@/lib/format";
import {
  curveToStored,
  emptyCurve,
  ethToWei,
  marketCapUsd,
  quoteBuy,
  quoteSell,
  spotPriceWei,
  weiToEth,
  type CurveState,
} from "@/lib/curve";
import { DEFAULT_SUPPLY, ETH_USD } from "@/lib/protocol";
import { rawLogoFor } from "@/lib/logos";
import type { LaunchpadStore, StoredComment, StoredToken, StoredTrade } from "@/lib/types";

type Draft = {
  symbol: string;
  name: string;
  description: string;
  twitter?: string;
  telegram?: string;
  website?: string;
  hoursAgo: number;
  featured?: boolean;
  /** ETH spent on buys (before fee), chronological. Sells as negative. */
  flow: number[];
  comments: string[];
};

const DRAFTS: Draft[] = [
  {
    symbol: "HOODCAT",
    name: "Hood Cat",
    description: "The cat that hopped the chain. Currently sitting on the hill.",
    twitter: "https://x.com/hoodcat",
    telegram: "https://t.me/hoodcat",
    hoursAgo: 18,
    flow: [0.4, 0.8, 0.55, 0.9, 0.7, 0.45, 0.6, 0.2],
    comments: ["king behaviour", "don't fade the cat", "chart looking filthy"],
  },
  {
    symbol: "PIPEDOG",
    name: "pipedog",
    description: "A dog in a pipe. That's the whole thesis.",
    twitter: "https://x.com/pipedog",
    hoursAgo: 30,
    flow: [0.2, 0.5, 0.4, 0.8, 0.35, 0.6],
    comments: ["dev is based", "pipe szn"],
  },
  {
    symbol: "TRENCHIES",
    name: "Trenchies",
    description: "Born in the trenches. Dies in the trenches. Maybe not.",
    hoursAgo: 6,
    flow: [0.15, 0.4, 0.55, 0.7, 0.3],
    comments: ["we are so back", "trenches forever"],
  },
  {
    symbol: "Zerocoin",
    name: "Zerocoin",
    description: "Started at zero. Still mostly zero. That's the joke.",
    hoursAgo: 4,
    flow: [0.08, 0.22, 0.4, 0.55, 0.18],
    comments: ["zero to hero", "I'm in"],
  },
  {
    symbol: "musebook",
    name: "musebook",
    description: "A tiny book of on-chain lore. Read it after you ape.",
    hoursAgo: 22,
    flow: [0.1, 0.25, 0.3, 0.2, 0.18],
    comments: ["lore is fire"],
  },
  {
    symbol: "INU",
    name: "iNu",
    description: "Not that inu. This inu. Robinhood inu.",
    hoursAgo: 40,
    flow: [0.12, 0.2, 0.15, 0.28],
    comments: ["inu szn never ended"],
  },
  {
    symbol: "HOOKR",
    name: "Hookr.fun",
    description: "Got hooked. Staying hooked.",
    hoursAgo: 14,
    flow: [0.05, 0.12, 0.2, 0.18, 0.1],
    comments: ["name is a vibe"],
  },
  {
    symbol: "MEME",
    name: "A Meme Coin",
    description: "Honest branding. It is a meme coin.",
    hoursAgo: 9,
    flow: [0.04, 0.11, 0.09, 0.16],
    comments: ["at least they're honest"],
  },
  {
    symbol: "ZZZ",
    name: "ZZZ",
    description: "Sleep on it and you miss it.",
    hoursAgo: 11,
    flow: [0.06, 0.1, 0.08, -0.03, 0.14],
    comments: ["zzz", "waking up now"],
  },
  {
    symbol: "MOO",
    name: "Memory cow Moo",
    description: "The cow remembers every candle.",
    hoursAgo: 28,
    flow: [0.07, 0.09, 0.11],
    comments: ["moo"],
  },
  {
    symbol: "HMM",
    name: "Thinking Cat",
    description: "Hmm. Hmm. Hmm.",
    hoursAgo: 7,
    flow: [0.03, 0.08, 0.05],
    comments: ["hmm indeed"],
  },
  {
    symbol: "DOGO",
    name: "DogBull",
    description: "Dog on the way up, bull on the way up-er.",
    hoursAgo: 16,
    flow: [0.02, 0.06, 0.05, 0.04],
    comments: ["dogo"],
  },
  {
    symbol: "CHUMP",
    name: "Chump Coin",
    description: "For the chumps. That's us.",
    hoursAgo: 36,
    flow: [0.05, -0.02, 0.08, 0.03],
    comments: ["chump and dump? nah"],
  },
  {
    symbol: "WALLET",
    name: "Robinhood Wallet",
    description: "Not affiliated. Very affiliated in spirit.",
    hoursAgo: 2,
    flow: [0.01, 0.02, 0.03],
    comments: ["fresh launch", "sending it"],
  },
  {
    symbol: "IF",
    name: "What If",
    description: "What if this is the one.",
    hoursAgo: 1.2,
    flow: [0.008, 0.012],
    comments: ["what if we just bought"],
  },
  {
    symbol: "NET",
    name: "NetNet",
    description: "Net of fees, still pumping.",
    hoursAgo: 0.6,
    flow: [0.006],
    comments: ["just launched!!!"],
  },
  {
    symbol: "HELIX",
    name: "Helix",
    description: "The house coin. Graduated off the curve — now trading on the Helix AMM.",
    twitter: "https://x.com/helixliquidity",
    website: "https://newdexx.vercel.app",
    hoursAgo: 90,
    featured: true,
    flow: [1.2, 1.5, 1.1, 1.4, 0.9, 0.6, 0.8, 0.7],
    comments: ["graduated already", "AMM liquidity looks clean", "HELIX to the moon but like, structurally"],
  },
  {
    symbol: "CASHCAT",
    name: "Cash Cat",
    description: "Cashed out of the curve. Still a cat.",
    hoursAgo: 70,
    flow: [1.0, 1.2, 0.9, 1.1, 0.8, 0.5],
    comments: ["this cat has a job"],
  },
  {
    symbol: "UP",
    name: "up",
    description: "Only one direction. Allegedly.",
    hoursAgo: 55,
    flow: [0.9, 1.1, 0.85, 1.0, 0.7, 0.65],
    comments: ["up only until it isn't"],
  },
];

function rng(seed: string) {
  let h = hashSeed(seed) || 1;
  return () => {
    h = (Math.imul(h, 1664525) + 1013904223) >>> 0;
    return h / 4294967296;
  };
}

function credit(
  balances: Record<string, string>,
  addr: string,
  delta: bigint
) {
  const cur = BigInt(balances[addr] || "0");
  const next = cur + delta;
  if (next <= 0n) delete balances[addr];
  else balances[addr] = next.toString();
}

export function buildSeed(): LaunchpadStore {
  const now = Date.now();
  const tokens: StoredToken[] = [];
  const trades: StoredTrade[] = [];
  const comments: StoredComment[] = [];
  const balances: LaunchpadStore["balances"] = {};

  for (const d of DRAFTS) {
    const id = d.symbol.toLowerCase();
    const createdAt = now - d.hoursAgo * 3600_000;
    const creator = fakeEvm(`creator-${id}`);
    const rand = rng(id);
    let state: CurveState = emptyCurve(DEFAULT_SUPPLY);
    const tokenBalances: Record<string, string> = {};
    let volume = 0n;
    let txCount = 0;
    let lastTradeAt = createdAt;
    const n = Math.max(1, d.flow.length);

    d.flow.forEach((eth, i) => {
      const t = createdAt + Math.floor(((i + 1) / (n + 1)) * (now - createdAt));
      const trader = fakeEvm(`trader-${id}-${i}-${Math.floor(rand() * 8)}`);
      if (eth >= 0) {
        const q = quoteBuy(state, ethToWei(eth));
        state = q.newState;
        credit(tokenBalances, trader, q.tokensOut);
        volume += q.net;
        txCount += 1;
        lastTradeAt = t;
        trades.push({
          id: `${id}-tx-${i}`,
          tokenId: id,
          trader,
          isBuy: true,
          ethAmount: ethToWei(eth).toString(),
          tokenAmount: q.tokensOut.toString(),
          fee: q.fee.toString(),
          priceUsd: weiToEth(spotPriceWei(state)) * ETH_USD,
          marketCapUsd: marketCapUsd(state),
          ts: t,
        });
      } else {
        const sellFrac = Math.min(0.45, Math.abs(eth) / 0.2);
        const bal = BigInt(tokenBalances[trader] || "0");
        const tokenIn =
          bal > 0n ? (bal * BigInt(Math.floor(sellFrac * 1000))) / 1000n : 0n;
        if (tokenIn <= 0n) return;
        const q = quoteSell(state, tokenIn);
        if (q.ethOut <= 0n) return;
        state = q.newState;
        credit(tokenBalances, trader, -tokenIn);
        volume += q.gross;
        txCount += 1;
        lastTradeAt = t;
        trades.push({
          id: `${id}-tx-${i}`,
          tokenId: id,
          trader,
          isBuy: false,
          ethAmount: q.gross.toString(),
          tokenAmount: tokenIn.toString(),
          fee: q.fee.toString(),
          priceUsd: weiToEth(spotPriceWei(state)) * ETH_USD,
          marketCapUsd: marketCapUsd(state),
          ts: t,
        });
      }
    });

    // A few extra micro-buys so charts have more points.
    const extra = 4 + Math.floor(rand() * 6);
    for (let i = 0; i < extra; i++) {
      const eth = 0.004 + rand() * 0.03;
      const t = createdAt + Math.floor(rand() * (now - createdAt));
      const trader = fakeEvm(`micro-${id}-${i}`);
      const q = quoteBuy(state, ethToWei(eth));
      state = q.newState;
      credit(tokenBalances, trader, q.tokensOut);
      volume += q.net;
      txCount += 1;
      if (t > lastTradeAt) lastTradeAt = t;
      trades.push({
        id: `${id}-micro-${i}`,
        tokenId: id,
        trader,
        isBuy: true,
        ethAmount: ethToWei(eth).toString(),
        tokenAmount: q.tokensOut.toString(),
        fee: q.fee.toString(),
        priceUsd: weiToEth(spotPriceWei(state)) * ETH_USD,
        marketCapUsd: marketCapUsd(state),
        ts: t,
      });
    }

    const stored = curveToStored(state);
    const token: StoredToken = {
      id,
      address: fakeEvm(`token-${id}`),
      curveAddress: fakeEvm(`curve-${id}`),
      pairAddress: state.graduated ? fakeEvm(`pair-${id}`) : undefined,
      name: d.name,
      symbol: d.symbol,
      description: d.description,
      logo: rawLogoFor(d.symbol) || "",
      twitter: d.twitter || "",
      telegram: d.telegram || "",
      website: d.website || "",
      creator,
      createdAt,
      ...stored,
      graduatedAt: state.graduated ? lastTradeAt : undefined,
      volumeEth: volume.toString(),
      txCount,
      lastTradeAt,
      featured: d.featured,
    };
    tokens.push(token);
    balances[id] = tokenBalances;
    d.comments.forEach((text, i) => {
      comments.push({
        id: `${id}-c-${i}`,
        tokenId: id,
        user: fakeEvm(`chat-${id}-${i}`),
        text,
        createdAt: createdAt + (i + 1) * 12 * 60_000,
      });
    });
  }

  trades.sort((a, b) => a.ts - b.ts);
  return { tokens, trades, comments, balances };
}
