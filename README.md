# Fomo Ping ($PING)

FOMO-style community token site for **Robinhood Chain**, with concentrated pools and fee-sharing stakes. English UI, Bengali plan summary on [Docs](/docs).

The site mark is the neon radar ping (`public/logo.png`). After you create the token with that artwork, set `NEXT_PUBLIC_TOKEN_CONTRACT` to the new address and Redeploy. Name, ticker, on-chain logo, USD price, and market stats then load from DexScreener and GeckoTerminal. Until that address is replaced, the featured book stays Fomo Ping-branded with this logo.

Fomo Ping is not an official Robinhood product. Robinhood Chain has no native token. ETH pays gas.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev -- --port 4317 --hostname 127.0.0.1
```

Open [http://127.0.0.1:4317](http://127.0.0.1:4317).

## Vercel environment variables

Add these in Vercel → Project → Settings → Environment Variables, then **Redeploy**. `NEXT_PUBLIC_` values are baked in at build time.

| Variable | What it does |
| --- | --- |
| `NEXT_PUBLIC_TOKEN_CONTRACT` | Robinhood Chain contract. **Replace this after you create the token.** Logo and live USD price load from it. |
| `NEXT_PUBLIC_TOKEN_CONTRACT_SOL` | Optional Solana mint address |
| `NEXT_PUBLIC_TOKEN_SYMBOL` | Optional ticker override. Empty = use the contract’s ticker (demo = PING) |
| `NEXT_PUBLIC_TOKEN_NAME` | Optional name override. Empty = use the contract’s name (demo = Fomo Ping) |
| `NEXT_PUBLIC_TOKEN_LOGO` | Optional HTTPS or `/logo.png` override. Empty = GeckoTerminal / DexScreener image |
| `NEXT_PUBLIC_X_URL` | X / Twitter profile |
| `NEXT_PUBLIC_DISCORD_URL` | Discord invite |
| `NEXT_PUBLIC_PONS_URL` | Pons listing — turns the Buy button on |
| `NEXT_PUBLIC_PONS_ID` | Optional Pons id shown next to the link |
| `NEXT_PUBLIC_LAUNCH_AT` | Optional ISO timestamp for an honest launch countdown |
| `NEXT_PUBLIC_TOKEN_INFO` | One-line description on the token page |
| `NEXT_PUBLIC_WALLET_API` | Reown / WalletConnect Project ID, or an `https` RPC URL. Defaults to the wired Project ID so Connect uses a real wallet on Robinhood Chain mainnet (4663). |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | Optional alias for the WalletConnect Project ID |
| `NEXT_PUBLIC_RH_RPC` | Optional Robinhood RPC override. Default is `https://rpc.mainnet.chain.robinhood.com` |
| `NEXT_PUBLIC_ALCHEMY_API_KEY` | Optional Alchemy key. Builds `https://robinhood-mainnet.g.alchemy.com/v2/{key}` |

Copy `.env.example` as a starting point.

## What you can do

- Share the FOMO landing at `/` (name, lore, utility loop, written plan)
- Switch **Robinhood / SOL** from the top bar
- Search tokens, sort trending and established books, change 1h / 24h / 7d
- Open a pool, pick a shape, mint a position (LP flow is stored in this browser)
- Deposit into a stake or attach a new one
- Toggle dark / light
- Read Docs (full work plan) and Academy in English

Set `NEXT_PUBLIC_WALLET_API` to a WalletConnect Project ID to connect MetaMask, Rabby, or WalletConnect to **Robinhood Chain mainnet**. A Project ID is already wired as the default. Fomo Ping never asks for a seed phrase. Mint / deposit in this UI still do not send mainnet LP transactions.

## Stack

Next.js, TypeScript, Tailwind CSS, shadcn/ui.
