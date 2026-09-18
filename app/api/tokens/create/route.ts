import { createToken } from "@/lib/actions";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      name?: string;
      symbol?: string;
      description?: string;
      logo?: string;
      twitter?: string;
      telegram?: string;
      website?: string;
      creator?: string;
      supply?: string;
      initialBuyEth?: string;
    };
    const token = await createToken({
      name: body.name || "",
      symbol: body.symbol || "",
      description: body.description || "",
      logo: body.logo || "",
      twitter: body.twitter || "",
      telegram: body.telegram || "",
      website: body.website || "",
      creator: body.creator || "",
      supply: body.supply,
      initialBuyEth: body.initialBuyEth,
    });
    return Response.json({ token });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not create token.";
    return Response.json({ error: message }, { status: 400 });
  }
}
