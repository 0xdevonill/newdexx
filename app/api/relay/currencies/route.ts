import { RELAY_API } from "@/lib/env";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json([], { status: 400 });
  }

  const payload = {
    chainIds: Array.isArray(body.chainIds) ? body.chainIds.slice(0, 8) : [],
    term: typeof body.term === "string" ? body.term.slice(0, 64) : "",
    limit: Math.min(Number(body.limit) || 20, 40),
    verified: body.verified !== false,
    useExternalSearch: Boolean(body.useExternalSearch),
  };

  const res = await fetch(`${RELAY_API}/currencies/v2`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => []);
  return Response.json(data, { status: res.status });
}
