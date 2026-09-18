import { NextRequest } from "next/server";
import { searchDexTokens } from "@/lib/dex";
import type { ChainId } from "@/lib/types";

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  const chainRaw = (req.nextUrl.searchParams.get("chain") ?? "robinhood").toLowerCase();
  const chain: ChainId = chainRaw === "sol" || chainRaw === "solana" ? "sol" : "robinhood";
  if (q.length < 2) return Response.json({ tokens: [] });
  const tokens = await searchDexTokens(chain, q);
  return Response.json({ tokens });
}
