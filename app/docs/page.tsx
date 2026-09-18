import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { PROTOCOL } from "@/lib/tokens";

export const metadata = {
  title: `${PROTOCOL.name} plan`,
  description: `Written brand, site, utility, and Pons launch plan for ${PROTOCOL.name} ($${PROTOCOL.token}) on Robinhood Chain.`,
};

export default function DocsPage() {
  const token = PROTOCOL.token;
  const name = PROTOCOL.name;

  return (
    <article className="docs-page">
      <p className="tok-name" style={{ letterSpacing: "0.16em", textTransform: "uppercase" }}>
        {name} · written plan
      </p>
      <h1>
        {name} (${token}) — FOMO-style token, site system, and full work plan for Robinhood
        Chain.
      </h1>
      <p>
        This page is the operating document. The landing is the pitch. Pools and Stakes are the
        product. Nothing here claims to be Robinhood, HOOD stock, or an official chain token.
      </p>

      <div className="bn-summary">
        <h2>বাংলায় সংক্ষেপ</h2>
        <p>
          <b>নাম:</b> {name} &nbsp;|&nbsp; <b>টিকার:</b> ${token} &nbsp;|&nbsp;{" "}
          <b>চেইন:</b> Robinhood Chain (4663) &nbsp;|&nbsp; <b>লঞ্চ:</b> Pons-এ ফেয়ার লঞ্চ।
        </p>
        <p>
          <b>ইউনিক আইডিয়া:</b> এই চেইনে অফিসিয়াল নেটওয়ার্ক টোকেন নেই। প্রতিটা ভাইরাল মুভ একটা
          নোটিফিকেশন দিয়ে শুরু হয় — একটা পিং। ${token} সেই সাউন্ড। FOMO নামেই আছে, কিন্তু দাবি
          অফিসিয়াল লিস্টিং নয়।
        </p>
        <p>
          <b>ইউটিলিটি:</b> পুলে লিকুইডিটি / স্টেক রাখলে অন্যরা FOMO-তে কিনলে সোয়াপ ফি আসে। ৯২.৫%
          LP/স্টেকারদের। ৭.৫% শুধু ক্লেইম করা ফি থেকে। লকআপ নেই। সিড ফ্রেজ কখনো চাইবে না।
        </p>
        <p>
          <b>কাজের ধাপ:</b> (০) সাইট ও ব্র্যান্ড লাইভ — এটাই এই ডিপ্লয়মেন্ট। (১) এই আর্টওয়ার্ক
          দিয়ে Pons-এ টোকেন তৈরি। (২) কন্ট্রাক্ট অ্যাড্রেস বসিয়ে Redeploy। (৩) পুল সিড + স্টেক।
          (৪) মিম + ইউটিলিটি ক্লিপ — কখনো নকল Robinhood নিউজ না।
        </p>
        <p>
          <b>যা করব না:</b> অফিসিয়াল রবিনহুড প্রোডাক্ট বলে চালিয়ে দেওয়া, ফেক ভলিউম, সিড ফ্রেজ
          চাওয়া, লিস্টিং গ্যারান্টি। ক্রিপ্টো রিস্কি। এটা ফাইন্যান্সিয়াল অ্যাডভাইস নয়।
        </p>
      </div>

      <h2>1. Token identity</h2>
      <table>
        <thead>
          <tr>
            <th>Field</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Name</td>
            <td>{name}</td>
          </tr>
          <tr>
            <td>Ticker</td>
            <td>${token}</td>
          </tr>
          <tr>
            <td>Tagline</td>
            <td>{BRAND.tagline}</td>
          </tr>
          <tr>
            <td>Network</td>
            <td>Robinhood Chain · chain id 4663 · gas in ETH</td>
          </tr>
          <tr>
            <td>Launch pad</td>
            <td>Pons (standard 1B supply fair launch)</td>
          </tr>
          <tr>
            <td>Mark</td>
            <td>Neon radar ping + notification spark on void black (`/logo.png`)</td>
          </tr>
          <tr>
            <td>Positioning</td>
            <td>Community meme with LP fee-share. Explicitly unofficial.</td>
          </tr>
        </tbody>
      </table>
      <p>
        Why this name can travel: four letters, a sound you already know, and a joke that
        fits the chain. Cash Cat won because it was an insider name. ${token} wins if it
        becomes the insider <i>sound</i> — the alert that means “look at the chart.” It is not
        $HOOD. It is not a claim that Robinhood issued a coin. Robinhood Chain has no native
        token; ETH pays gas. Say that out loud in every pin.
      </p>

      <h3>Lore, one paragraph</h3>
      <p>
        The market never sleeps on this L2. Stock tokens print 24/7. Pons spawns a new ticker
        every few seconds. Nobody can watch all of it, so everyone waits for a ping — a
        screenshot, a group chat, a candle that should not exist. {name} is that ping. If you
        heard it, you are not late. If you only heard about it, you already are. The honest
        version of FOMO: urgency in the brand, truth in the docs.
      </p>

      <h2>2. Visual system</h2>
      <p>
        Pons timelines are a blur of dogs and wordmarks. ${token} should be recognizable at
        32px and at full-bleed. One motion. One color. No feather logo, no Robinhood wordmark.
      </p>
      <div className="docs-grid">
        <div className="doc-card">
          <h4>Signal green</h4>
          <p>
            <code>#00FF87</code> on <code>#050806</code>. Close to “up only,” distinct from
            Robinhood’s <code>#00C805</code> feather. Never use their bird.
          </p>
        </div>
        <div className="doc-card">
          <h4>Alert gold</h4>
          <p>
            <code>#FFE14A</code> for the ticker, countdown, and marquee dots — the color of a
            notification badge, not a yield promise.
          </p>
        </div>
        <div className="doc-card">
          <h4>Type</h4>
          <p>
            Anton for the FOMO / PING poster. Space Grotesk for titles. Inter for reading.
            JetBrains Mono for tickers, stats, and buttons.
          </p>
        </div>
        <div className="doc-card">
          <h4>Motion</h4>
          <p>
            Expanding rings, a live marquee, occasional canvas pings. No fake buy tape. No
            invented holder count.
          </p>
        </div>
      </div>
      <p>
        Buttons that spend money or open Pons are lime on black with a green glow (
        <code>.btn-ping</code>). Secondary actions stay ghost. Light mode exists but the
        default is night — FOMO reads at 2am.
      </p>

      <h2>3. Website map</h2>
      <table>
        <thead>
          <tr>
            <th>Route</th>
            <th>Job</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <Link href="/">/</Link>
            </td>
            <td>FOMO landing. Idea, utility loop, work map, disclaimer. Share this URL.</td>
          </tr>
          <tr>
            <td>
              <Link href="/pools">/pools</Link>
            </td>
            <td>Token book on Robinhood Chain and Solana. Featured row is ${token}.</td>
          </tr>
          <tr>
            <td>/pools/[id]</td>
            <td>Chart, stats, shaped LP mint from a single coin.</td>
          </tr>
          <tr>
            <td>
              <Link href="/stakes">/stakes</Link>
            </td>
            <td>Fee-share deposits. This is the utility, not a sidebar.</td>
          </tr>
          <tr>
            <td>
              <Link href="/positions">/positions</Link>
            </td>
            <td>Your mints and stakes after connect. 7.5% only on claimed fees.</td>
          </tr>
          <tr>
            <td>
              <Link href="/academy">/academy</Link>
            </td>
            <td>Short lessons. Pitch then practice.</td>
          </tr>
          <tr>
            <td>
              <Link href="/docs">/docs</Link>
            </td>
            <td>This plan plus LP mechanics.</td>
          </tr>
        </tbody>
      </table>
      <p>
        After you create the token, set <code>NEXT_PUBLIC_TOKEN_CONTRACT</code> and{" "}
        <code>NEXT_PUBLIC_PONS_URL</code>, then Redeploy. Name, ticker, on-chain logo, and USD
        price load from DexScreener / GeckoTerminal. Optional{" "}
        <code>NEXT_PUBLIC_LAUNCH_AT</code> (ISO time) turns on an honest countdown. If it is
        unset, there is no fake clock.
      </p>

      <h2>4. Work plan</h2>
      <div className="steps">
        <div className="step">
          <div className="step-n">0</div>
          <div>
            <b>Brand and site (done in this deploy)</b>
            <p>
              Lock name, ticker, mark, palette, landing, docs, pools, stakes. Pin the
              disclaimer. Do not launch on Pons until this URL is shareable on mobile.
            </p>
          </div>
        </div>
        <div className="step">
          <div className="step-n">1</div>
          <div>
            <b>Social shells</b>
            <p>
              Claim X and Discord with the same mark. Bio: “Community meme on Robinhood Chain.
              Not official. Fair launch on Pons.” Pin this site. Never a seed-phrase form.
            </p>
          </div>
        </div>
        <div className="step">
          <div className="step-n">2</div>
          <div>
            <b>Fair launch on Pons</b>
            <p>
              Create ${token} with `/logo.png` (or the same art on IPFS). Standard Pons supply.
              No stealth “dev wallet” story. Copy the contract. Paste into Vercel env. Redeploy.
              The Buy button lights up from <code>NEXT_PUBLIC_PONS_URL</code>.
            </p>
          </div>
        </div>
        <div className="step">
          <div className="step-n">3</div>
          <div>
            <b>Liquidity that matches the lore</b>
            <p>
              Seed the ${token} book. Point the landing CTA at Pons and the secondary CTA at
              Stakes. Record one 15-second clip: buy happens → fee → staker share. That clip is
              the utility, not a whitepaper.
            </p>
          </div>
        </div>
        <div className="step">
          <div className="step-n">4</div>
          <div>
            <b>Content, still honest</b>
            <p>
              Memes: radar, notification badge, “did you hear that.” Reply-guys with the site,
              not a screenshot of a made-up MC. If volume is quiet, say the pool is quiet.
              Silence beats a fake tape.
            </p>
          </div>
        </div>
        <div className="step">
          <div className="step-n">5</div>
          <div>
            <b>Wallet connect, then real LP txs</b>
            <p>
              Set <code>NEXT_PUBLIC_WALLET_API</code> to a Reown / WalletConnect project id so
              Connect hits Robinhood Chain mainnet. Mint / deposit in this UI still do not send
              mainnet LP transactions until the vault contracts are wired. Do not pretend they
              do.
            </p>
          </div>
        </div>
        <div className="step">
          <div className="step-n">6</div>
          <div>
            <b>Optional Solana mirror</b>
            <p>
              Same ticker, same art, <code>NEXT_PUBLIC_TOKEN_CONTRACT_SOL</code>. Only if the
              Robinhood book already has a pulse. Two empty charts is worse than one.
            </p>
          </div>
        </div>
      </div>

      <h3>Pons-day checklist</h3>
      <table>
        <thead>
          <tr>
            <th>Before</th>
            <th>During</th>
            <th>After</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Site live on phone. Discord + X pinned. Art exported 1:1.</td>
            <td>Create token. Paste contract. Redeploy. First posts are the site + Pons link.</td>
            <td>Seed LP. Post the fee-share clip. Update docs with the live address.</td>
          </tr>
        </tbody>
      </table>

      <h3>What we will not do</h3>
      <p>
        No “official Robinhood Chain token.” No fake listing in the Robinhood app. No
        guaranteed returns. No wash volume. No impersonating Robinhood support. No asking for a
        seed phrase. If a tactic needs a lie to work, it is not this project.
      </p>

      <h2>5. Utility (how the pool pays you)</h2>
      <p>
        FOMO without a loop dies in a day. The loop here is old DeFi, said in ping language:
        traders pay a swap fee, LPs split it. {name} does not mint rewards. It streams a share
        of fees that already exist.
      </p>
      <div className="docs-grid">
        <div className="doc-card">
          <h4>Stakes</h4>
          <p>Deposit into a token pool and collect a proportional share of its swap fees.</p>
        </div>
        <div className="doc-card">
          <h4>Pools</h4>
          <p>Build a shaped concentrated position from a single coin and manage it on one page.</p>
        </div>
      </div>

      <h3>Connecting</h3>
      <p>
        Robinhood Chain is EVM, chain id <code>4663</code>. MetaMask, Rabby, or WalletConnect.
        Solana uses Phantom or Solflare. {name} never asks for a seed phrase. If something
        does, it is not this site.
      </p>
      <p>
        Gas is ETH on Robinhood Chain and SOL on Solana. Keep a little extra for failed
        retries. Robinhood has at times sponsored gas inside its own wallet; that is their
        program, not ours, and it is not a reason to call ${token} “official.”
      </p>

      <h3>Stakes flow</h3>
      <div className="steps">
        <div className="step">
          <div className="step-n">1</div>
          <div>
            <b>Pick a stake</b>
            <p>One coin, or quote & token at the current pool ratio.</p>
          </div>
        </div>
        <div className="step">
          <div className="step-n">2</div>
          <div>
            <b>The app builds it</b>
            <p>You never handle LP tokens. Wallet asks once per step. Leftover is refunded.</p>
          </div>
        </div>
        <div className="step">
          <div className="step-n">3</div>
          <div>
            <b>Staked automatically</b>
            <p>Minted and staked in the same flow. Time lock none. Exit penalty none.</p>
          </div>
        </div>
      </div>
      <p>
        Rewards accrue continuously in the quote asset — WETH on Robinhood Chain, SOL on Solana
        — streamed over 7 days so one fat fee event does not all land on whoever is staked that
        minute. Withdraw unstakes and returns coins in proportion. Nothing is sold for you.
      </p>

      <h3>Pools</h3>
      <p>
        Find the token, read the chart, choose a shape, mint. The position NFT sits in a
        contract only your wallet controls. <b>Trending</b> is heat. <b>Established</b> is size.
        A tight range earns more while price stays inside it. A wide range earns less per
        dollar and needs less babysitting.
      </p>

      <h3>Fees</h3>
      <p>{name} takes 7.5% of the fees you claim, never of principal.</p>
      <table>
        <thead>
          <tr>
            <th>Action</th>
            <th>Fee</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Claim fees collected</td>
            <td>7.5%</td>
            <td>Taken once, never from your deposit.</td>
          </tr>
          <tr>
            <td>Deposit / withdraw / create stake</td>
            <td>0</td>
            <td>Gas only. Pool swap fee still applies if one side is swapped.</td>
          </tr>
        </tbody>
      </table>

      <h2>6. Chains</h2>
      <p>
        {name} is built for <b>Robinhood Chain</b> first. Solana is a switch in the top bar,
        not the story. This is not an official Robinhood product.
      </p>
      <table>
        <thead>
          <tr>
            <th>Network</th>
            <th>Gas</th>
            <th>Quote</th>
            <th>Rewards</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Robinhood Chain</td>
            <td>ETH</td>
            <td>ETH / USDG</td>
            <td>WETH</td>
          </tr>
          <tr>
            <td>Solana</td>
            <td>SOL</td>
            <td>SOL / USDC</td>
            <td>SOL</td>
          </tr>
        </tbody>
      </table>

      <h2>7. Contracts and env</h2>
      <p>
        Live addresses are filled after Pons create + vault deploy. Until then the featured
        book uses demo data with {name} branding.
      </p>
      <table>
        <thead>
          <tr>
            <th>Piece</th>
            <th>Job</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Pons token</td>
            <td>${token} ERC-20 from the launchpad. Set NEXT_PUBLIC_TOKEN_CONTRACT.</td>
          </tr>
          <tr>
            <td>VaultFactory</td>
            <td>Creates stakes. One per pool.</td>
          </tr>
          <tr>
            <td>VaultFarmFactory</td>
            <td>Attaches the 7-day reward stream.</td>
          </tr>
          <tr>
            <td>PingZap</td>
            <td>Turns a single coin into a balanced stake deposit.</td>
          </tr>
          <tr>
            <td>PingLadderManager</td>
            <td>Holds ladders and takes the 7.5% claim fee.</td>
          </tr>
          <tr>
            <td>PingPositionBuilder</td>
            <td>Mints concentrated positions.</td>
          </tr>
        </tbody>
      </table>
      <p>
        Copy <code>.env.example</code>. Vercel bakes <code>NEXT_PUBLIC_</code> values at build
        time, so change then Redeploy. WalletConnect project id makes Connect real on 4663;
        empty keeps a local demo connect. Mint / deposit still do not broadcast mainnet LP txs
        from this UI.
      </p>

      <h2>8. Glossary</h2>
      <table>
        <thead>
          <tr>
            <th>Term</th>
            <th>Definition</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${token}</td>
            <td>Fomo Ping. The notification meme, not a Robinhood-issued asset.</td>
          </tr>
          <tr>
            <td>Ping</td>
            <td>The brand motion and the moment a swap hits the pool.</td>
          </tr>
          <tr>
            <td>Pons</td>
            <td>The Robinhood Chain launchpad. Fair launch lives there, not in a private mint.</td>
          </tr>
          <tr>
            <td>LP / stake</td>
            <td>Capital sitting in a pool so other people can trade. Fees split by share.</td>
          </tr>
          <tr>
            <td>Robinhood Chain</td>
            <td>Arbitrum Orbit L2, chain id 4663. ETH for gas. No official chain token.</td>
          </tr>
        </tbody>
      </table>

      <h2>9. FAQ</h2>
      <h3>Is this the official Robinhood token?</h3>
      <p>
        No. Robinhood Chain uses ETH for gas. HOOD is Nasdaq-listed equity. {name} is a
        community meme with an LP app wrapped around it.
      </p>
      <h3>Where do rewards come from?</h3>
      <p>
        Swap fees traders already pay. Nothing is inflated to bribe stakers. If nobody trades,
        nobody earns. That is the honest FOMO loop.
      </p>
      <h3>Do I need to claim to keep earning?</h3>
      <p>No. Rewards accrue either way. Claiming moves them to your wallet.</p>
      <h3>Can the team take my deposit?</h3>
      <p>
        No. Only your wallet can withdraw. The owner key can lower the fee and pause new
        deposits. It cannot raise the fee or move a staked position.
      </p>
      <h3>Will ${token} be listed in the Robinhood app?</h3>
      <p>
        We will not say yes, maybe, or “working on it.” Listings are Robinhood’s decision.
        Cash Cat got there because of their story, not because a landing page promised it.
      </p>

      <p style={{ marginTop: "2rem", color: "var(--text-3)", fontSize: 13 }}>
        {BRAND.disclaimer}
      </p>
    </article>
  );
}
