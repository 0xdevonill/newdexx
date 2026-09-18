"use client";

import { useState } from "react";
import { Wallet } from "lucide-react";
import {
  useAccount,
  useAccountEffect,
  useConnect,
  useDisconnect,
  useSwitchChain,
} from "wagmi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppState } from "@/lib/app-state";
import { shortAddr } from "@/lib/format";
import { ROBINHOOD_CHAIN_ID } from "@/lib/robinhood-chain";
import { wallet as walletEnv } from "@/lib/site";
import { PROTOCOL } from "@/lib/tokens";

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

export function WalletButton() {
  const { wallet, connect, disconnect, setWallet, chain, pushToast } = useAppState();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const live = walletEnv.live && chain === "robinhood";
  const { address, isConnected, chainId } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { switchChainAsync } = useSwitchChain();

  useAccountEffect({
    onConnect({ address: addr }) {
      if (walletEnv.live) setWallet(addr);
    },
    onDisconnect() {
      if (walletEnv.live) setWallet(null);
    },
  });

  const shown = live && isConnected && address ? address : wallet;
  const wallets =
    chain === "sol"
      ? ["Phantom", "Solflare", "WalletConnect"]
      : ["MetaMask", "Rabby", "WalletConnect"];

  const pickConnector = (kind: string) => {
    const k = kind.toLowerCase();
    if (k === "walletconnect") {
      return connectors.find((c) => /walletconnect/i.test(`${c.id} ${c.name}`));
    }
    if (k === "metamask") {
      return (
        connectors.find((c) => /metamask/i.test(`${c.id} ${c.name}`)) ||
        connectors.find((c) => c.id === "injected")
      );
    }
    if (k === "rabby") {
      return (
        connectors.find((c) => /rabby/i.test(`${c.id} ${c.name}`)) ||
        connectors.find((c) => c.id === "injected")
      );
    }
    return connectors.find((c) => c.id === "injected") ?? connectors[0];
  };

  const onDisconnect = async () => {
    if (live) {
      try {
        await disconnectAsync();
      } catch {
        /* still clear local session */
      }
    }
    disconnect();
    pushToast("Wallet disconnected");
  };

  const onConnect = async (kind: string) => {
    if (!live) {
      connect(kind);
      setOpen(false);
      pushToast(
        "Wallet connected",
        `${kind} on ${chain === "sol" ? "Solana" : "Robinhood Chain"}`
      );
      return;
    }
    if (kind === "WalletConnect" && !walletEnv.projectId) {
      pushToast(
        "WalletConnect needs a Project ID",
        "Set NEXT_PUBLIC_WALLET_API to your Reown / WalletConnect Project ID and redeploy."
      );
      return;
    }
    const connector = pickConnector(kind);
    if (!connector) {
      pushToast("Wallet not available", "No matching connector is configured.");
      return;
    }
    setBusy(kind);
    try {
      const result = await connectAsync({
        connector,
        chainId: ROBINHOOD_CHAIN_ID,
      });
      const addr = result.accounts[0];
      if (addr) setWallet(addr);
      if (result.chainId !== ROBINHOOD_CHAIN_ID) {
        try {
          await switchChainAsync({ chainId: ROBINHOOD_CHAIN_ID });
        } catch {
          pushToast(
            "Switch to Robinhood Chain",
            "Approve Robinhood Chain (4663) in your wallet to continue."
          );
        }
      }
      setOpen(false);
      pushToast("Wallet connected", `${kind} on Robinhood Chain mainnet`);
    } catch (err) {
      pushToast("Could not connect", errorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  if (shown) {
    const wrongNetwork = live && isConnected && chainId !== ROBINHOOD_CHAIN_ID;
    return (
      <button
        type="button"
        className="btn btn-ghost btn-sm wallet-chip"
        onClick={() => {
          if (wrongNetwork) {
            void switchChainAsync({ chainId: ROBINHOOD_CHAIN_ID }).catch(() => {
              pushToast(
                "Switch to Robinhood Chain",
                "Approve network 4663 in your wallet."
              );
            });
            return;
          }
          void onDisconnect();
        }}
        title={wrongNetwork ? "Switch to Robinhood Chain" : "Disconnect"}
      >
        <Wallet size={12} />
        {wrongNetwork ? "Switch network" : shortAddr(shown)}
      </button>
    );
  }

  return (
    <>
      <button type="button" className="btn" onClick={() => setOpen(true)}>
        <span className="btn-full">Connect Wallet</span>
        <span className="btn-short">Connect</span>
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="wallet-modal">
          <DialogHeader>
            <DialogTitle>Connect a wallet</DialogTitle>
            <DialogDescription>
              {PROTOCOL.name} never asks for a seed phrase or private key. Approve the
              connection in your wallet, then you are in.
            </DialogDescription>
          </DialogHeader>
          <div className="wallet-list">
            {wallets.map((w) => (
              <button
                key={w}
                type="button"
                className="wallet-opt"
                disabled={Boolean(busy)}
                onClick={() => void onConnect(w)}
              >
                <span className="wallet-opt-mark">{w.slice(0, 1)}</span>
                {busy === w ? "Connecting…" : w}
              </button>
            ))}
          </div>
          <p className="wallet-note">
            {live
              ? "Live mode: connects to Robinhood Chain mainnet (chain id 4663). Positions and stakes in this demo stay in the browser."
              : chain === "sol"
                ? "Solana connect is a local demo. Switch to Robinhood for a live EVM wallet connection."
                : "Demo mode until a WalletConnect Project ID is set."}
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
