export type CatalogToken = {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logo?: string;
};

export type CatalogChain = {
  id: number;
  name: string;
  displayName: string;
  rpc: string;
  explorerUrl: string;
  explorerName: string;
  iconUrl: string;
  native: CatalogToken;
  tokens: CatalogToken[];
  depositEnabled: boolean;
};

export type SelectedAsset = {
  chainId: number;
  token: CatalogToken;
};

export type QuoteFee = {
  amountUsd?: string;
  amountFormatted?: string;
  currency?: { symbol?: string };
};

export type QuoteStepItem = {
  status?: string;
  data?: {
    from?: string;
    to?: string;
    data?: string;
    value?: string | Record<string, unknown>;
    chainId?: number;
    gas?: string;
    signatureKind?: string;
    domain?: Record<string, unknown>;
    types?: Record<string, unknown>;
    message?: string;
    primaryType?: string;
  };
  check?: { endpoint?: string; method?: string };
};

export type QuoteStep = {
  id?: string;
  action?: string;
  description?: string;
  kind?: string;
  requestId?: string;
  items?: QuoteStepItem[];
};

export type RelayQuote = {
  requestId?: string;
  steps?: QuoteStep[];
  fees?: Record<string, QuoteFee>;
  details?: {
    timeEstimate?: number;
    rate?: string;
    operation?: string;
    sender?: string;
    recipient?: string;
    currencyIn?: {
      amountFormatted?: string;
      amountUsd?: string;
      amount?: string;
      currency?: { symbol?: string; decimals?: number };
    };
    currencyOut?: {
      amountFormatted?: string;
      amountUsd?: string;
      amount?: string;
      minimumAmount?: string;
      currency?: { symbol?: string; decimals?: number };
    };
    totalImpact?: { usd?: string; percent?: string };
    userBalance?: string;
  };
  message?: string;
  error?: string;
};

export type CrossingLog = {
  id: string;
  requestId?: string;
  fromChainId: number;
  toChainId: number;
  fromSymbol: string;
  toSymbol: string;
  amountIn: string;
  amountOut: string;
  hash?: string;
  explorerUrl?: string;
  status: "pending" | "success" | "failed";
  ts: number;
};
