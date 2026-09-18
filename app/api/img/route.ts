import { NextRequest } from "next/server";

const ALLOW = new Set([
  "coin-images.coingecko.com",
  "assets.coingecko.com",
  "assets.geckoterminal.com",
  "cdn.dexscreener.com",
  "dd.dexscreener.com",
  "ipfs.io",
  "cloudflare-ipfs.com",
  "raw.githubusercontent.com",
  "tokens.jup.ag",
  "wsrv.nl",
]);

function extraHosts(): Set<string> {
  const hosts = new Set<string>();
  for (const key of ["NEXT_PUBLIC_TOKEN_LOGO", "NEXT_PUBLIC_PONS_URL"] as const) {
    const v = process.env[key];
    if (!v) continue;
    try {
      hosts.add(new URL(v).hostname);
    } catch {
      /* ignore */
    }
  }
  return hosts;
}

function isPrivateHost(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname.endsWith(".local") ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0" ||
    hostname === "::1" ||
    hostname.startsWith("10.") ||
    hostname.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
  );
}

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("u");
  if (!raw) return new Response("missing u", { status: 400 });
  let target: URL;
  try {
    target = new URL(raw);
  } catch {
    return new Response("bad url", { status: 400 });
  }
  if (target.protocol !== "https:") return new Response("https only", { status: 400 });
  if (isPrivateHost(target.hostname)) return new Response("blocked", { status: 400 });
  if (!ALLOW.has(target.hostname) && !extraHosts().has(target.hostname)) {
    return new Response("host not allowed", { status: 400 });
  }

  const upstream = await fetch(target.toString(), {
    headers: {
      Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      "User-Agent": "Mozilla/5.0 FomoPing/1.0",
      Referer: `${target.origin}/`,
    },
    next: { revalidate: 86400 },
  });
  if (!upstream.ok || !upstream.body) {
    return new Response("upstream", { status: 502 });
  }
  const type = upstream.headers.get("content-type") || "image/png";
  if (!type.startsWith("image/") && type !== "application/octet-stream") {
    return new Response("not an image", { status: 502 });
  }
  return new Response(upstream.body, {
    headers: {
      "Content-Type": type.startsWith("image/") ? type : "image/png",
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}
