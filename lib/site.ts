import { PROTOCOL } from "@/lib/protocol";

function env(name: string, fallback = ""): string {
  const v = (process.env[name] ?? "").trim();
  return v || fallback;
}

export const DEMO_TOKEN_CONTRACT =
  "0x1Ad69dDD9D98dD71b6211339A1801fD128A3925D";

export const BRAND_LOGO = "/icon.svg";

export const site = {
  tokenSymbol: env("NEXT_PUBLIC_TOKEN_SYMBOL", PROTOCOL.token),
  tokenName: env("NEXT_PUBLIC_TOKEN_NAME", PROTOCOL.name),
  tokenContract: env("NEXT_PUBLIC_TOKEN_CONTRACT", DEMO_TOKEN_CONTRACT),
  tokenContractSol: env("NEXT_PUBLIC_TOKEN_CONTRACT_SOL"),
  tokenLogo: env("NEXT_PUBLIC_TOKEN_LOGO"),
  tokenInfo: env("NEXT_PUBLIC_TOKEN_INFO", PROTOCOL.tagline),
  xUrl: env("NEXT_PUBLIC_X_URL", PROTOCOL.x),
  discordUrl: env("NEXT_PUBLIC_DISCORD_URL", PROTOCOL.discord),
  ponsUrl: env("NEXT_PUBLIC_PONS_URL"),
  ponsId: env("NEXT_PUBLIC_PONS_ID"),
};

const RH_RPC_DEFAULT = "https://rpc.mainnet.chain.robinhood.com";

function walletFromEnv() {
  const raw =
    env("NEXT_PUBLIC_WALLET_API") ||
    env("NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID") ||
    env("NEXT_PUBLIC_WALLETCONNECT_ID");
  const rpcOverride = env("NEXT_PUBLIC_RH_RPC") || env("NEXT_PUBLIC_RPC_URL");
  const alchemy = env("NEXT_PUBLIC_ALCHEMY_API_KEY") || env("NEXT_PUBLIC_ALCHEMY_KEY");
  let projectId = "";
  let rpc = rpcOverride;
  if (/^https?:\/\//i.test(raw)) rpc = rpc || raw;
  else if (raw) projectId = raw;
  if (!rpc && alchemy) {
    rpc = `https://robinhood-mainnet.g.alchemy.com/v2/${alchemy}`;
  }
  return {
    projectId,
    rpc: rpc || RH_RPC_DEFAULT,
    live: Boolean(raw || rpcOverride || alchemy),
  };
}

export const wallet = walletFromEnv();

export function isDemoContract(address: string): boolean {
  return address.trim().toLowerCase() === DEMO_TOKEN_CONTRACT.toLowerCase();
}

export function isSiteToken(symbol: string): boolean {
  const s = symbol.toUpperCase();
  if (s === "HELIX") return true;
  if (site.tokenSymbol && s === site.tokenSymbol.toUpperCase()) return true;
  return false;
}

export function contractFor(chain: "robinhood" | "sol"): string {
  return chain === "sol" ? site.tokenContractSol : site.tokenContract;
}
