import { executeTrade } from "@/lib/actions";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  try {
    const body = (await req.json()) as {
      trader?: string;
      side?: "buy" | "sell";
      eth?: string;
      tokens?: string;
    };
    const result = await executeTrade({
      id,
      trader: body.trader || "",
      side: body.side === "sell" ? "sell" : "buy",
      eth: body.eth,
      tokens: body.tokens,
    });
    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Trade failed.";
    return Response.json({ error: message }, { status: 400 });
  }
}
