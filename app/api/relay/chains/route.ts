import { RELAY_API } from "@/lib/env";

export const revalidate = 300;

export async function GET() {
  const res = await fetch(`${RELAY_API}/chains`, {
    headers: { Accept: "application/json" },
    next: { revalidate: 300 },
  });
  const data = await res.json().catch(() => ({ chains: [] }));
  return Response.json(data, { status: res.status });
}
