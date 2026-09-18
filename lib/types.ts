export type StoredToken = {
  id: string;
  address: string;
  curveAddress: string;
  pairAddress?: string;
  name: string;
  symbol: string;
  description: string;
  logo: string;
  twitter: string;
  telegram: string;
  website: string;
  creator: string;
  createdAt: number;
  realEth: string;
  tokenReserve: string;
  totalSupply: string;
  graduated: boolean;
  graduatedAt?: number;
  ammEth: string;
  ammToken: string;
  volumeEth: string;
  txCount: number;
  lastTradeAt: number;
  featured?: boolean;
};

export type StoredTrade = {
  id: string;
  tokenId: string;
  trader: string;
  isBuy: boolean;
  ethAmount: string;
  tokenAmount: string;
  fee: string;
  priceUsd: number;
  marketCapUsd: number;
  ts: number;
  txHash?: string;
};

export type StoredComment = {
  id: string;
  tokenId: string;
  user: string;
  text: string;
  createdAt: number;
};

export type StoredHolder = {
  address: string;
  balance: string;
};

export type LaunchpadStore = {
  tokens: StoredToken[];
  trades: StoredTrade[];
  comments: StoredComment[];
  /** tokenId -> trader -> token wei */
  balances: Record<string, Record<string, string>>;
  lastBlock?: number;
};

export type TokenView = StoredToken & {
  marketCapUsd: number;
  priceUsd: number;
  progressBps: number;
  change24h: number;
  volume24hUsd: number;
  replies: number;
  holders: number;
  ageHours: number;
  king?: boolean;
};

export type ProfileView = {
  address: string;
  created: TokenView[];
  held: { token: TokenView; balance: string; valueUsd: number }[];
};
