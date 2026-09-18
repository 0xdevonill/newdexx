import { addComment, getTokenBundle } from "@/lib/actions";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const bundle = await getTokenBundle(id);
  if (!bundle) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ comments: bundle.comments });
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  try {
    const body = (await req.json()) as { user?: string; text?: string };
    const comment = await addComment({ id, user: body.user || "", text: body.text || "" });
    return Response.json({ comment });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not post.";
    return Response.json({ error: message }, { status: 400 });
  }
}
