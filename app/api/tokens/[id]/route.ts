import { getTokenBundle } from "@/lib/actions";
import { candlesFromTrades, rankedHolders } from "@/lib/views";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const bundle = await getTokenBundle(id);
  if (!bundle) return Response.json({ error: "Not found" }, { status: 404 });
  const holders = rankedHolders(bundle.balances, bundle.token.totalSupply);
  const candles = candlesFromTrades([...bundle.trades].reverse());
  return Response.json({
    token: bundle.token,
    trades: bundle.trades.slice(0, 80),
    comments: bundle.comments.slice(0, 80),
    holders: holders.slice(0, 40),
    candles,
  });
}
