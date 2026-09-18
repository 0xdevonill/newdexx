function env(name: string, fallback = ""): string {
  const v = (process.env[name] ?? "").trim();
  return v || fallback;
}

export const DEMO_TOKEN_CONTRACT =
  "0x1Ad69dDD9D98dD71b6211339A1801fD128A3925D";

export const BRAND_LOGO = "/logo.png";

export const site = {
  tokenSymbol: env("NEXT_PUBLIC_TOKEN_SYMBOL"),
  tokenName: env("NEXT_PUBLIC_TOKEN_NAME"),
  tokenContract: env("NEXT_PUBLIC_TOKEN_CONTRACT", DEMO_TOKEN_CONTRACT),
  tokenContractSol: env("NEXT_PUBLIC_TOKEN_CONTRACT_SOL"),
  tokenLogo: env("NEXT_PUBLIC_TOKEN_LOGO"),
  tokenInfo: env("NEXT_PUBLIC_TOKEN_INFO"),
  xUrl: env("NEXT_PUBLIC_X_URL", "https://x.com/fomoping"),
  discordUrl: env("NEXT_PUBLIC_DISCORD_URL", "https://discord.gg/fomoping"),
  ponsUrl: env("NEXT_PUBLIC_PONS_URL"),
  ponsId: env("NEXT_PUBLIC_PONS_ID"),
  launchAt: env("NEXT_PUBLIC_LAUNCH_AT"),
};

const RH_RPC_DEFAULT = "https://rpc.mainnet.chain.robinhood.com";

const WC_PROJECT_ID = "c3a2a7e9d8f090369b0b8b2421807c9c";

function walletFromEnv() {
  const raw =
    env("NEXT_PUBLIC_WALLET_API") ||
    env("NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID") ||
    env("NEXT_PUBLIC_WALLETCONNECT_ID") ||
    WC_PROJECT_ID;
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
    live: Boolean(projectId || rpcOverride || alchemy),
  };
}

export const wallet = walletFromEnv();

export function isDemoContract(address: string): boolean {
  return address.trim().toLowerCase() === DEMO_TOKEN_CONTRACT.toLowerCase();
}

export function isSiteToken(symbol: string): boolean {
  const s = symbol.toUpperCase();
  if (s === "PING" || s === "HELIX") return true;
  if (site.tokenSymbol && s === site.tokenSymbol.toUpperCase()) return true;
  return false;
}

export function contractFor(chain: "robinhood" | "sol"): string {
  return chain === "sol" ? site.tokenContractSol : site.tokenContract;
}
