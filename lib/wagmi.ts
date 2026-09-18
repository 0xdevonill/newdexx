"use client";

import { createConfig, http, injected } from "wagmi";
import { coinbaseWallet, walletConnect } from "wagmi/connectors";
import { BRAND } from "@/lib/brand";
import { walletConnectProjectId } from "@/lib/env";
import { appChains } from "@/lib/viem-chains";

const metadata = {
  name: BRAND.name,
  description: BRAND.description,
  url: "https://localhost",
  icons: ["/icon.svg"],
};

const connectors = [
  injected({ shimDisconnect: true }),
  coinbaseWallet({ appName: BRAND.name }),
  ...(walletConnectProjectId && !/^https?:\/\//i.test(walletConnectProjectId)
    ? [
        walletConnect({
          projectId: walletConnectProjectId,
          showQrModal: true,
          metadata,
        }),
      ]
    : []),
];

const transports = Object.fromEntries(
  appChains.map((chain) => [chain.id, http(chain.rpcUrls.default.http[0])])
);

export const wagmiConfig = createConfig({
  chains: appChains,
  connectors,
  transports,
  ssr: true,
});
