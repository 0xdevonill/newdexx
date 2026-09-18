function read(name: string, fallback = ""): string {
  const v = (process.env[name] ?? "").trim();
  return v || fallback;
}

export function env(name: string, fallback = ""): string {
  return read(name, fallback);
}

export const walletConnectProjectId = (() => {
  const raw =
    env("NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID") ||
    env("NEXT_PUBLIC_WALLET_API") ||
    env("NEXT_PUBLIC_WALLETCONNECT_ID");
  if (!raw || /^https?:\/\//i.test(raw)) return "";
  return raw;
})();

export const RELAY_API = env("RELAY_API_URL", "https://api.relay.link");
