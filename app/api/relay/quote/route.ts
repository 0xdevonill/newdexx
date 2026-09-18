import { RELAY_API } from "@/lib/env";

const ALLOWED = new Set([
  "user",
  "recipient",
  "originChainId",
  "destinationChainId",
  "originCurrency",
  "destinationCurrency",
  "amount",
  "tradeType",
  "referrer",
  "useExternalLiquidity",
]);

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ message: "Invalid JSON" }, { status: 400 });
  }

  const payload: Record<string, unknown> = {};
  for (const key of ALLOWED) {
    if (body[key] !== undefined) payload[key] = body[key];
  }

  if (
    typeof payload.user !== "string" ||
    typeof payload.originChainId !== "number" ||
    typeof payload.destinationChainId !== "number" ||
    typeof payload.originCurrency !== "string" ||
    typeof payload.destinationCurrency !== "string" ||
    typeof payload.amount !== "string"
  ) {
    return Response.json({ message: "Missing quote fields" }, { status: 400 });
  }

  if (!/^\d+$/.test(payload.amount)) {
    return Response.json({ message: "Amount must be in base units" }, { status: 400 });
  }

  const res = await fetch(`${RELAY_API}/quote/v2`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ ...payload, tradeType: payload.tradeType || "EXACT_INPUT" }),
  });
  const data = await res.json().catch(() => ({ message: "Relay quote failed" }));
  return Response.json(data, { status: res.status });
}
