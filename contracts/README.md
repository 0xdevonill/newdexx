# Helix.fun smart contracts

Launchpad for Robinhood Chain (EVM, chain id **4663**).

| Network | Chain ID | RPC | Explorer |
| --- | --- | --- | --- |
| Robinhood Chain | 4663 | `https://rpc.mainnet.chain.robinhood.com` | https://robinhoodchain.blockscout.com |
| Robinhood Chain Testnet | 46630 | `https://rpc.testnet.chain.robinhood.com` | https://explorer.testnet.chain.robinhood.com |

## Layout

| Contract | Role |
| --- | --- |
| `MemeToken.sol` | Minimal ERC-20. Entire supply minted to the bonding curve. |
| `BondingCurve.sol` | Constant-product curve with 1.25 ETH virtual reserve. **1% fee** on every trade. Graduates at **5 ETH** real reserve. |
| `SimpleAMM.sol` | Uniswap-style `x * y = k` pool that receives leftover tokens + ETH at graduation. **1% swap fee**. |
| `TokenFactory.sol` | `createToken` deploys token + curve. Creation fee **0.002 ETH**. |

## Curve

```
virtualEth    = 1.25 ETH + realEth
k             = virtualEth * tokenReserve
tokensOut     = tokenReserve - k / (virtualEth + ethIn * 0.99)
graduation    = realEth >= 5 ETH
```

At 1B supply, 5 ETH of buys sells 800M tokens. The remaining 200M tokens plus the 5 ETH seed the AMM. Starting market cap is 1.25 ETH (~$3k at $2,440/ETH). Graduation market cap is 31.25 ETH (~$76k).

## Deploy (Foundry)

```bash
export PRIVATE_KEY=0x...
export RH_RPC_URL=https://rpc.testnet.chain.robinhood.com
export FEE_TO=0x...          # optional, defaults to deployer

forge script contracts/script/Deploy.s.sol:Deploy \
  --rpc-url $RH_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast

# then set NEXT_PUBLIC_FACTORY_ADDRESS in the frontend
```

Verify on Blockscout:

```bash
forge verify-contract <factory> contracts/TokenFactory.sol:TokenFactory \
  --chain-id 4663 \
  --rpc-url https://rpc.mainnet.chain.robinhood.com \
  --verifier blockscout \
  --verifier-url https://robinhoodchain.blockscout.com/api/
```

Run tests: `forge test`.
