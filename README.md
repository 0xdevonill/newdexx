# Helix.fun

Meme token launchpad for **Robinhood Chain** (EVM, chain id **4663**), in the same family as pump.fun: bonding-curve launch, live board, token page with chart / chat / holders, then automatic Uniswap-style graduation.

Helix.fun is not an official Robinhood product.

## Network

| | |
| --- | --- |
| Name | Robinhood Chain |
| Chain ID | 4663 |
| RPC | `https://rpc.mainnet.chain.robinhood.com` |
| Explorer | https://robinhoodchain.blockscout.com |
| Gas token | ETH |

Testnet is chain id `46630` / `https://rpc.testnet.chain.robinhood.com`.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev -- --port 4317 --hostname 127.0.0.1
```

Open [http://127.0.0.1:4317](http://127.0.0.1:4317).

## What you can do

- Connect MetaMask, Rabby, or WalletConnect (auto-switch to chain 4663)
- Browse trending / new / market cap / almost-DEX / graduated
- King of the Hill = highest market-cap token still on the curve
- Create a token (name, ticker, logo, bio, socials, supply, initial buy)
- Buy and sell against the constant-product curve (1% fee)
- Watch the token graduate onto the AMM at 5 ETH real reserve
- Chat, holders, and trade history on each token page
- Profile of created tokens and bags

Until `NEXT_PUBLIC_FACTORY_ADDRESS` is set, create/trade run through the local indexer using the same math as the Solidity contracts. Set `NEXT_PUBLIC_WALLET_API` to a WalletConnect project ID for a live wallet connection.

## Contracts

See [`contracts/README.md`](contracts/README.md). Factory + ERC-20 + bonding curve + SimpleAMM.

```bash
node --experimental-strip-types scripts/check-curve.ts
```

## Stack

Next.js 16, TypeScript, Tailwind CSS, viem/wagmi, lightweight-charts, custom event indexer.
