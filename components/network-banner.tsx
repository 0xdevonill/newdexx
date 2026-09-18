"use client";

import { useAccount, useSwitchChain } from "wagmi";
import { ROBINHOOD_CHAIN_ID } from "@/lib/robinhood-chain";
import { wallet as walletEnv } from "@/lib/site";
import { useAppState } from "@/lib/app-state";

export function NetworkBanner() {
  const { isConnected, chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { pushToast } = useAppState();
  if (!walletEnv.live || !isConnected || chainId === ROBINHOOD_CHAIN_ID) return null;
  return (
    <div className="network-banner">
      <span>Wrong network. Helix.fun runs on Robinhood Chain (4663).</span>
      <button
        type="button"
        className="btn btn-sm"
        onClick={() => {
          void switchChainAsync({ chainId: ROBINHOOD_CHAIN_ID }).catch(() => {
            pushToast("Switch to Robinhood Chain", "Approve network 4663 in your wallet.");
          });
        }}
      >
        Switch
      </button>
    </div>
  );
}
