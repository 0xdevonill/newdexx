import { fetchLiveToken } from "@/lib/live-token";
import { fetchDexToken } from "@/lib/dex";
import type { ChainId } from "@/lib/types";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const address = (url.searchParams.get("address") ?? "").trim();
  const chainRaw = (url.searchParams.get("chain") ?? "").toLowerCase();
  if (address) {
    const chain: ChainId = chainRaw === "sol" || chainRaw === "solana" ? "sol" : "robinhood";
    const token = await fetchDexToken(chain, address);
    return Response.json({ token });
  }
  const live = await fetchLiveToken();
  return Response.json({ live });
}
