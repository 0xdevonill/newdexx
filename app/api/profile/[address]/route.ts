import { profileFor } from "@/lib/actions";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ address: string }> }
) {
  const { address } = await ctx.params;
  const profile = await profileFor(address);
  return Response.json(profile);
}
