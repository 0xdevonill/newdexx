import { RELAY_API } from "@/lib/env";

export async function GET(request: Request) {
  const requestId = new URL(request.url).searchParams.get("requestId") || "";
  if (!/^0x[a-fA-F0-9]{8,128}$/.test(requestId)) {
    return Response.json({ message: "Bad requestId" }, { status: 400 });
  }
  const res = await fetch(`${RELAY_API}/intents/status/v3?requestId=${requestId}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({ status: "unknown" }));
  return Response.json(data, { status: res.status });
}
