"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAccount } from "wagmi";
import {
  catalog,
  chainById,
  defaultToken,
  isNative,
  tokenOnChain,
} from "@/lib/catalog";
import { parseTokenAmount } from "@/lib/format";
import { fareUsd, requestQuote } from "@/lib/relay";
import type { CatalogChain, CatalogToken, RelayQuote } from "@/lib/types";

export type Lesson = "wallet" | "from" | "to" | "amount" | "review";

const PREVIEW_USER = "0x0000000000000000000000000000000000000001";

function ethereum(): CatalogChain {
  return chainById(1) ?? catalog[0];
}
function base(): CatalogChain {
  return chainById(8453) ?? catalog[1] ?? catalog[0];
}

type BridgeState = {
  fromChain: CatalogChain;
  toChain: CatalogChain;
  fromToken: CatalogToken;
  toToken: CatalogToken;
  amount: string;
  recipient: string;
  customRecipient: boolean;
  quote: RelayQuote | null;
  quoteError: string | null;
  quoting: boolean;
  lesson: Lesson;
  setLesson: (l: Lesson) => void;
  setAmount: (v: string) => void;
  setRecipient: (v: string) => void;
  setCustomRecipient: (v: boolean) => void;
  setFrom: (chain: CatalogChain, token?: CatalogToken) => void;
  setTo: (chain: CatalogChain, token?: CatalogToken) => void;
  flip: () => void;
  applyLane: (fromId: number, toId: number) => void;
  parsedAmount: bigint | null;
  fare: number;
};

const Ctx = createContext<BridgeState | null>(null);

export function BridgeProvider({ children }: { children: ReactNode }) {
  const { address } = useAccount();
  const [fromChain, setFromChain] = useState<CatalogChain>(ethereum);
  const [toChain, setToChain] = useState<CatalogChain>(base);
  const [fromToken, setFromToken] = useState<CatalogToken>(defaultToken(ethereum()));
  const [toToken, setToToken] = useState<CatalogToken>(defaultToken(base()));
  const [amount, setAmountState] = useState("");
  const [recipient, setRecipient] = useState("");
  const [customRecipient, setCustomRecipient] = useState(false);
  const [quote, setQuote] = useState<RelayQuote | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [lesson, setLesson] = useState<Lesson>("wallet");

  const setAmount = useCallback((v: string) => {
    if (v === "" || /^\d*[.,]?\d*$/.test(v)) setAmountState(v.replace(",", "."));
  }, []);

  const setFrom = useCallback((chain: CatalogChain, token?: CatalogToken) => {
    setFromChain(chain);
    setFromToken(token ?? tokenOnChain(chain, fromToken.address) ?? defaultToken(chain));
    setLesson("from");
  }, [fromToken.address]);

  const setTo = useCallback((chain: CatalogChain, token?: CatalogToken) => {
    setToChain(chain);
    setToToken(token ?? tokenOnChain(chain, toToken.address) ?? defaultToken(chain));
    setLesson("to");
  }, [toToken.address]);

  const flip = useCallback(() => {
    setFromChain(toChain);
    setToChain(fromChain);
    setFromToken(toToken);
    setToToken(fromToken);
  }, [fromChain, toChain, fromToken, toToken]);

  const applyLane = useCallback((fromId: number, toId: number) => {
    const from = chainById(fromId);
    const to = chainById(toId);
    if (!from || !to) return;
    setFromChain(from);
    setToChain(to);
    setFromToken(defaultToken(from));
    setToToken(defaultToken(to));
    setLesson("from");
  }, []);

  const parsedAmount = useMemo(
    () => parseTokenAmount(amount, fromToken.decimals),
    [amount, fromToken.decimals]
  );

  /* eslint-disable react-hooks/set-state-in-effect -- debounce a live Relay quote */
  useEffect(() => {
    if (!parsedAmount || parsedAmount <= 0n) {
      setQuote(null);
      setQuoteError(null);
      setQuoting(false);
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setQuoting(true);
      setQuoteError(null);
      void requestQuote({
        user: address || PREVIEW_USER,
        recipient: customRecipient && recipient ? recipient : address || PREVIEW_USER,
        originChainId: fromChain.id,
        destinationChainId: toChain.id,
        originToken: fromToken,
        destinationToken: toToken,
        amount: parsedAmount.toString(),
      })
        .then((q) => {
          if (controller.signal.aborted) return;
          setQuote(q);
          setLesson("review");
        })
        .catch((err: unknown) => {
          if (controller.signal.aborted) return;
          setQuote(null);
          setQuoteError(err instanceof Error ? err.message : "No fare for this lane.");
        })
        .finally(() => {
          if (!controller.signal.aborted) setQuoting(false);
        });
    }, 450);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [
    parsedAmount,
    address,
    customRecipient,
    recipient,
    fromChain.id,
    toChain.id,
    fromToken,
    toToken,
  ]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const fare = fareUsd(quote);

  const value = useMemo(
    () => ({
      fromChain,
      toChain,
      fromToken,
      toToken,
      amount,
      recipient,
      customRecipient,
      quote,
      quoteError,
      quoting,
      lesson,
      setLesson,
      setAmount,
      setRecipient,
      setCustomRecipient,
      setFrom,
      setTo,
      flip,
      applyLane,
      parsedAmount,
      fare,
    }),
    [
      fromChain,
      toChain,
      fromToken,
      toToken,
      amount,
      recipient,
      customRecipient,
      quote,
      quoteError,
      quoting,
      lesson,
      setAmount,
      setFrom,
      setTo,
      flip,
      applyLane,
      parsedAmount,
      fare,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useBridge() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useBridge must be used within BridgeProvider");
  return ctx;
}

export function sameAsset(a: CatalogToken, b: CatalogToken) {
  return isNative(a.address) === isNative(b.address) && a.symbol === b.symbol;
}
