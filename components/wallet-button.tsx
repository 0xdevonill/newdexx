"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { Wallet } from "lucide-react";
import {
  useAccount,
  useConnect,
  useDisconnect,
} from "wagmi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppState } from "@/lib/app-state";
import { walletConnectProjectId } from "@/lib/env";
import { shortAddr } from "@/lib/format";

type WalletUi = {
  openConnect: () => void;
};

const WalletUiCtx = createContext<WalletUi | null>(null);

export function useWalletUi() {
  const ctx = useContext(WalletUiCtx);
  if (!ctx) throw new Error("useWalletUi must be used within WalletUiProvider");
  return ctx;
}

function errorMessage(err: unknown): string {
  if (!err || typeof err !== "object") return "Wallet request failed.";
  const e = err as { shortMessage?: string; message?: string; code?: number };
  const raw = (e.shortMessage || e.message || "").toLowerCase();
  if (e.code === 4001 || raw.includes("rejected") || raw.includes("denied")) {
    return "Request rejected in the wallet.";
  }
  if (raw.includes("provider not found") || raw.includes("connector not found")) {
    return "No browser wallet found. Install MetaMask or Rabby, or use WalletConnect.";
  }
  return e.shortMessage || e.message || "Wallet request failed.";
}

function detectedInjected(): string {
  if (typeof window === "undefined") return "Browser wallet";
  const eth = window.ethereum as
    | { isRabby?: boolean; isMetaMask?: boolean; isCoinbaseWallet?: boolean; isOkxWallet?: boolean; isBraveWallet?: boolean }
    | undefined;
  if (!eth) return "Browser wallet";
  if (eth.isRabby) return "Rabby";
  if (eth.isCoinbaseWallet) return "Coinbase Wallet";
  if (eth.isOkxWallet) return "OKX";
  if (eth.isBraveWallet) return "Brave";
  if (eth.isMetaMask) return "MetaMask";
  return "Browser wallet";
}

export function WalletUiProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const { pushToast } = useAppState();
  const { connectAsync, connectors, isPending } = useConnect();

  const openConnect = useCallback(() => setOpen(true), []);

  const pick = (kind: "injected" | "coinbase" | "walletconnect") => {
    if (kind === "walletconnect") {
      return connectors.find((c) => /walletconnect/i.test(`${c.id} ${c.name}`));
    }
    if (kind === "coinbase") {
      return connectors.find((c) => /coinbase/i.test(`${c.id} ${c.name}`));
    }
    return connectors.find((c) => c.id === "injected") ?? connectors[0];
  };

  const onConnect = async (kind: "injected" | "coinbase" | "walletconnect") => {
    if (kind === "walletconnect" && !walletConnectProjectId) {
      pushToast(
        "WalletConnect needs a Project ID",
        "Set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID from Reown Cloud and redeploy."
      );
      return;
    }
    const connector = pick(kind);
    if (!connector) {
      pushToast("Wallet not available", "That connector is not configured in this build.");
      return;
    }
    setBusy(kind);
    try {
      await connectAsync({ connector });
      setOpen(false);
      pushToast("Wallet docked", "You can set a fare and sign the crossing.");
    } catch (err) {
      pushToast("Could not connect", errorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const hasInjected = useSyncExternalStore(
    () => () => undefined,
    () => Boolean(window.ethereum),
    () => false
  );
  const injectedName = useSyncExternalStore(
    () => () => undefined,
    () => detectedInjected(),
    () => "Browser wallet"
  );

  const value = useMemo(() => ({ openConnect }), [openConnect]);
  return (
    <WalletUiCtx.Provider value={value}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Dock a live wallet</DialogTitle>
            <DialogDescription>
              Quay never asks for a seed phrase. Approve the connection in your wallet, then pick a
              departure chain.
            </DialogDescription>
          </DialogHeader>
          <div className="wallet-list">
            <button
              type="button"
              className="wallet-opt"
              disabled={Boolean(busy) || isPending || !hasInjected}
              onClick={() => void onConnect("injected")}
            >
              <Wallet size={18} />
              <span>
                <b>{hasInjected ? injectedName : "No browser wallet"}</b>
                <span>
                  {hasInjected
                    ? busy === "injected"
                      ? "Connecting…"
                      : "Injected · MetaMask, Rabby, Brave, OKX"
                    : "Install MetaMask or Rabby, or use WalletConnect"}
                </span>
              </span>
            </button>
            <button
              type="button"
              className="wallet-opt"
              disabled={Boolean(busy) || isPending}
              onClick={() => void onConnect("coinbase")}
            >
              <Wallet size={18} />
              <span>
                <b>Coinbase Wallet</b>
                <span>{busy === "coinbase" ? "Connecting…" : "Extension or smart wallet"}</span>
              </span>
            </button>
            <button
              type="button"
              className="wallet-opt"
              disabled={Boolean(busy) || isPending}
              onClick={() => void onConnect("walletconnect")}
            >
              <Wallet size={18} />
              <span>
                <b>WalletConnect</b>
                <span>
                  {walletConnectProjectId
                    ? busy === "walletconnect"
                      ? "Connecting…"
                      : "Scan a QR from Rainbow, Trust, or 300+ apps"
                    : "Add NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID to enable QR connect"}
                </span>
              </span>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </WalletUiCtx.Provider>
  );
}

export function WalletButton() {
  const { address, isConnected } = useAccount();
  const { disconnectAsync } = useDisconnect();
  const { openConnect } = useWalletUi();
  const { pushToast } = useAppState();

  if (isConnected && address) {
    return (
      <button
        type="button"
        className="wallet-btn ghost"
        onClick={() => {
          void disconnectAsync()
            .catch(() => undefined)
            .finally(() => pushToast("Wallet undocked"));
        }}
        title="Disconnect"
      >
        <Wallet size={14} />
        {shortAddr(address)}
      </button>
    );
  }

  return (
    <button type="button" className="wallet-btn" onClick={openConnect}>
      <Wallet size={14} />
      Connect wallet
    </button>
  );
}

export function MiniWalletButton({ label }: { label: string }) {
  const { address, isConnected } = useAccount();
  const { openConnect } = useWalletUi();
  if (isConnected && address) {
    return (
      <span className="pick" style={{ cursor: "default" }}>
        <Wallet size={14} />
        {shortAddr(address)}
      </span>
    );
  }
  return (
    <button type="button" className="pick" onClick={openConnect}>
      <Wallet size={14} />
      {label}
    </button>
  );
}
