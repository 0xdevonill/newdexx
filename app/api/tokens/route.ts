import { listViews } from "@/lib/actions";
import { syncFactoryLogs } from "@/lib/chain-sync";
import { sortTokens } from "@/lib/views";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  await syncFactoryLogs();
  const url = new URL(req.url);
  const sort = url.searchParams.get("sort") || "trending";
  const q = (url.searchParams.get("q") || "").trim().toLowerCase();
  let tokens = await listViews();
  if (q) {
    tokens = tokens.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.symbol.toLowerCase().includes(q) ||
        t.address.toLowerCase().includes(q)
    );
  }
  const king = tokens.find((t) => t.king) ?? null;
  return Response.json({
    tokens: sortTokens(tokens, sort),
    king,
    totals: {
      launched: tokens.length,
      volume24hUsd: tokens.reduce((s, t) => s + t.volume24hUsd, 0),
      onCurve: tokens.filter((t) => !t.graduated).length,
      graduated: tokens.filter((t) => t.graduated).length,
    },
  });
}
