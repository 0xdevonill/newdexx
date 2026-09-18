import Link from "next/link";
import { PROTOCOL } from "@/lib/tokens";

export const metadata = {
  title: `${PROTOCOL.name} Academy`,
  description: `Learn the ${PROTOCOL.token} ping, then provide liquidity on Robinhood Chain without the jargon wall.`,
};

const lessons = [
  {
    n: "01",
    title: `Why $${PROTOCOL.token}`,
    body: "The chain has no official token. The ping is the alert. Read the lore, then the disclaimer.",
    href: "/",
  },
  {
    n: "02",
    title: "Pools vs stakes",
    body: "A pool is a market. A stake is a share of that market’s fees. Start here if you only have five minutes.",
    href: "/docs",
  },
  {
    n: "03",
    title: "Shapes and ranges",
    body: "Concentrated, uniform, wide — why a tight band earns more until price walks out of it.",
    href: "/docs",
  },
  {
    n: "04",
    title: "Reading the tables",
    body: "Trending is heat. Established is size. Quote filters split ETH/USDG on Robinhood and SOL/USDC on Solana.",
    href: "/pools",
  },
  {
    n: "05",
    title: "Fees without surprises",
    body: "7.5% on claimed trading fees. Zero on deposit, withdraw, and stake creation. Gas is extra.",
    href: "/docs",
  },
  {
    n: "06",
    title: "Your first mint",
    body: `Connect, pick ${PROTOCOL.token}, choose a shape, mint. Then watch it on Positions. Nothing is locked.`,
    href: "/positions",
  },
];

export default function AcademyPage() {
  return (
    <div className="app-page">
      <div className="academy-hero">
        <p className="tok-name" style={{ letterSpacing: "0.16em", textTransform: "uppercase" }}>
          Academy
        </p>
        <h1
          style={{
            fontFamily: "var(--f-display)",
            fontSize: "clamp(28px,4vw,44px)",
            letterSpacing: "-0.03em",
            margin: "8px 0 12px",
          }}
        >
          Hear the ping, then sit in the pool.
        </h1>
        <p style={{ color: "var(--text-2)", maxWidth: "62ch", margin: 0, lineHeight: 1.65, fontSize: 16 }}>
          {PROTOCOL.name} Academy is the short path from the meme to a live position. Full
          English. No seed phrases. No lockups. Open a lesson, then do the action in the app.
        </p>
      </div>
      <div className="lesson-grid">
        {lessons.map((l) => (
          <Link key={l.n} href={l.href} className="lesson">
            <span className="n">Lesson {l.n}</span>
            <h3>{l.title}</h3>
            <p style={{ margin: 0, color: "var(--text-2)", fontSize: 14, lineHeight: 1.55 }}>
              {l.body}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
