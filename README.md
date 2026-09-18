# Quay

A cross-chain **crossing desk**: connect a live wallet, pick a departure dock and an arrival dock, and move tokens in one signed fare. The homepage includes a five-step boarding tutorial next to the ticket.

Quay is not Relay, not a launchpad, and not an exchange frontend clone. Visual language is a cream paper ticket with copper type. Quotes and fills use the public [Relay](https://docs.relay.link) solver API.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev -- --port 4317 --hostname 127.0.0.1
```

Open [http://127.0.0.1:4317](http://127.0.0.1:4317).

Set `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` (or `NEXT_PUBLIC_WALLET_API`) to a Reown Cloud project ID if you want WalletConnect QR. Browser wallets work without it.

## What you can do

- Connect MetaMask, Rabby, Coinbase Wallet, or WalletConnect
- Bridge or swap across 50+ EVM lanes (Ethereum, Base, Arbitrum, Optimism, Polygon, BNB, Avalanche, Robinhood Chain, and more)
- Search verified tokens per chain
- Read a live fare: output amount, USD, ETA, and fees
- Sign the origin transaction in the connected wallet
- Track recent crossings in the in-browser log

## Stack

Next.js 16, TypeScript, Tailwind CSS, viem/wagmi, Relay `quote/v2`.
