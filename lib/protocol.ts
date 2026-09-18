import { env } from "@/lib/env";

export const WAD = 10n ** 18n;

/** Virtual ETH reserve that seeds the constant-product curve. */
export const VIRTUAL_ETH = (125n * WAD) / 100n; // 1.25 ETH
/** Real ETH that must land in the curve before Uniswap-style graduation. */
export const GRADUATION_ETH = 5n * WAD;
export const FEE_BPS = 100n; // 1%
export const BPS = 10_000n;
export const CREATION_FEE = (2n * WAD) / 1000n; // 0.002 ETH
export const DEFAULT_SUPPLY = 1_000_000_000n * WAD;

export const ROBINHOOD_CHAIN_ID = 4663;
export const ROBINHOOD_RPC =
  env("NEXT_PUBLIC_RH_RPC") || "https://rpc.mainnet.chain.robinhood.com";
export const ROBINHOOD_EXPLORER = "https://robinhoodchain.blockscout.com";
export const ROBINHOOD_TESTNET_CHAIN_ID = 46630;

export const ETH_USD = Number(env("NEXT_PUBLIC_ETH_USD", "2440")) || 2440;

export const FACTORY_ADDRESS = env("NEXT_PUBLIC_FACTORY_ADDRESS");

export const PROTOCOL = {
  name: "Helix.fun",
  token: "HELIX",
  tagline:
    "Launch a meme coin on Robinhood Chain. Bonding curve first, then automatic liquidity on a Uniswap-style AMM at 5 ETH.",
  chainId: ROBINHOOD_CHAIN_ID,
  rpc: ROBINHOOD_RPC,
  explorer: ROBINHOOD_EXPLORER,
  feeBps: Number(FEE_BPS),
  creationFeeEth: 0.002,
  graduationEth: 5,
  virtualEth: 1.25,
  x: env("NEXT_PUBLIC_X_URL", "https://x.com/helixliquidity"),
  discord: env("NEXT_PUBLIC_DISCORD_URL", "https://discord.gg/helixliquidity"),
  ethUsd: ETH_USD,
};

export function explorerTx(hash: string): string {
  return `${ROBINHOOD_EXPLORER}/tx/${hash}`;
}

export function explorerAddress(addr: string): string {
  return `${ROBINHOOD_EXPLORER}/address/${addr}`;
}
