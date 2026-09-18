"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Radio, Layers, Zap, ShieldAlert, Bell, Waves } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { PROTOCOL } from "@/lib/tokens";

const TAPE = [
  `$${PROTOCOL.token}`,
  "YOU HEARD IT",
  "ROBINHOOD CHAIN",
  "NOT OFFICIAL",
  "FAIR LAUNCH ON PONS",
  "REAL LP FEES",
  "THE PING IS THE ENTRY",
  `$${PROTOCOL.token}`,
];

function pad(n: number) {
  return String(Math.max(0, n)).padStart(2, "0");
}

function Countdown({ at }: { at: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const target = Date.parse(at);
  if (!Number.isFinite(target)) return null;
  const left = target - now;
  if (left <= 0) {
    return (
      <div className="ping-count ping-count--live" role="status">
        <span className="ping-dot" /> LIVE ON PONS
      </div>
    );
  }
  const s = Math.floor(left / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return (
    <div className="ping-count" aria-label="Time until launch">
      <span>
        <b>{pad(d)}</b>
        <i>days</i>
      </span>
      <span>
        <b>{pad(h)}</b>
        <i>hrs</i>
      </span>
      <span>
        <b>{pad(m)}</b>
        <i>min</i>
      </span>
      <span>
        <b>{pad(sec)}</b>
        <i>sec</i>
      </span>
    </div>
  );
}

export function Landing() {
  const buyHref = PROTOCOL.ponsUrl || "/pools";
  const buyExternal = Boolean(PROTOCOL.ponsUrl);
  const buyLabel = PROTOCOL.ponsUrl
    ? `Buy $${PROTOCOL.token} on Pons`
    : `Open the $${PROTOCOL.token} pool`;

  return (
    <div className="landing">
      <div className="ping-tape" aria-hidden>
        <div className="ping-tape-track">
          {[...TAPE, ...TAPE, ...TAPE].map((t, i) => (
            <span key={`${t}-${i}`}>
              {t}
              <em>·</em>
            </span>
          ))}
        </div>
      </div>

      <section className="ping-hero">
        <div className="ping-radar" aria-hidden>
          <span className="ring r1" />
          <span className="ring r2" />
          <span className="ring r3" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="ping-core" src="/logo.png" alt="" width={160} height={160} />
        </div>
        <p className="ping-kicker">
          <Bell size={13} /> Robinhood Chain · community meme
        </p>
        <h1 className="ping-word">
          FOMO
          <span>PING</span>
        </h1>
        <p className="ping-ticker">${PROTOCOL.token}</p>
        <p className="ping-tag">{PROTOCOL.tagline}</p>
        {PROTOCOL.launchAt ? <Countdown at={PROTOCOL.launchAt} /> : null}
        <div className="ping-cta">
          {buyExternal ? (
            <a className="btn btn-ping" href={buyHref} target="_blank" rel="noopener noreferrer">
              {buyLabel}
            </a>
          ) : (
            <Link className="btn btn-ping" href={buyHref}>
              {buyLabel}
            </Link>
          )}
          <Link className="btn btn-ghost" href="/docs">
            Full work plan
          </Link>
        </div>
        <p className="ping-note">{BRAND.disclaimer}</p>
      </section>

      <section className="ping-grid">
        <article className="ping-card">
          <Radio className="ping-ico" size={18} />
          <h2>The unique idea</h2>
          <p>
            Robinhood Chain has no official network token. Every viral bag on this
            chain starts the same way: a notification, a group chat, a ping. $
            {PROTOCOL.token} is that sound — the FOMO alert, not a fake “official”
            coin.
          </p>
        </article>
        <article className="ping-card">
          <Layers className="ping-ico" size={18} />
          <h2>Real utility</h2>
          <p>
            Most Pons launches are a picture. This one pays the people who sit in
            the pool. When someone FOMO-buys, the swap fee streams to stakers and
            LPs. 92.5% to you. 7.5% protocol cut on claimed fees only.
          </p>
        </article>
        <article className="ping-card">
          <Zap className="ping-ico" size={18} />
          <h2>Presentation</h2>
          <p>
            One ticker. One color. One motion: the ping. Site first, then Pons.
            Contract address pasted in, live price from DexScreener. No seed
            phrases. No “we are getting listed” theater.
          </p>
        </article>
      </section>

      <section className="ping-loop">
        <h2>How FOMO pays the pool</h2>
        <ol>
          <li>
            <b>01 · Someone hears it</b>
            <span>A trader market-buys ${PROTOCOL.token} on Robinhood Chain.</span>
          </li>
          <li>
            <b>02 · The pool pings</b>
            <span>The swap takes a fee. Volume is the product, not a promise.</span>
          </li>
          <li>
            <b>03 · You get paid</b>
            <span>
              Stakers split 92.5% of that fee over 7 days. No lockup. No minting
              rewards out of thin air.
            </span>
          </li>
        </ol>
        <div className="ping-cta">
          <Link className="btn btn-soft" href="/stakes">
            Open stakes
          </Link>
          <Link className="btn btn-ghost" href="/pools">
            Browse pools
          </Link>
        </div>
      </section>

      <section className="ping-map">
        <h2>Work map</h2>
        <div className="ping-phases">
          <div>
            <span>00</span>
            <h3>Brand live</h3>
            <p>Name, mark, palette, this site.</p>
          </div>
          <div>
            <span>01</span>
            <h3>Fair launch</h3>
            <p>Create on Pons with this artwork. Paste the contract. Redeploy.</p>
          </div>
          <div>
            <span>02</span>
            <h3>Liquidity</h3>
            <p>Seed the ${PROTOCOL.token} pool. Point stakers at fee share.</p>
          </div>
          <div>
            <span>03</span>
            <h3>Stay loud, stay honest</h3>
            <p>Memes + utility clips. Never fake a Robinhood listing.</p>
          </div>
        </div>
        <Link className="btn btn-ghost" href="/docs">
          Read the written plan
        </Link>
      </section>

      <section className="ping-warn">
        <ShieldAlert size={18} />
        <div>
          <h2>What this is not</h2>
          <p>
            Not a Robinhood airdrop. Not HOOD stock. Not a guaranteed listing in
            the Robinhood app. ETH pays gas on chain id 4663. If anyone DMs you
            a seed phrase box, it is not us.
          </p>
        </div>
        <Waves size={18} className="ping-warn-end" />
      </section>
    </div>
  );
}
