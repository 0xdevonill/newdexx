import { createPublicClient, http, parseAbiItem } from "viem";
import { FACTORY_ADDRESS, ROBINHOOD_RPC, DEFAULT_SUPPLY } from "@/lib/protocol";
import { robinhoodChain } from "@/lib/robinhood-chain";
import { withStore } from "@/lib/store";
import { curveToStored, emptyCurve, ethToWei } from "@/lib/curve";

const createdEvent = parseAbiItem(
  "event TokenCreated(address indexed token, address indexed curve, address indexed creator, string name, string symbol, string image, uint256 supply)"
);
const graduatedEvent = parseAbiItem(
  "event Graduated(address indexed token, address indexed curve, uint256 ethLiq, uint256 tokenLiq)"
);

/**
 * Lazy log indexer. When NEXT_PUBLIC_FACTORY_ADDRESS is set, API reads pull
 * TokenCreated / Graduated logs from Robinhood Chain and merge them into the
 * local store. Trades continue to stream from BondingCurve events once wired.
 */
export async function syncFactoryLogs() {
  if (!FACTORY_ADDRESS) return;
  try {
    const client = createPublicClient({
      chain: robinhoodChain,
      transport: http(ROBINHOOD_RPC),
    });
    const latest = await client.getBlockNumber();
    await withStore(async (store) => {
      const from = BigInt(store.lastBlock ?? 0) || latest - 50_000n;
      const fromBlock = from < 0n ? 0n : from;
      const logs = await client.getLogs({
        address: FACTORY_ADDRESS as `0x${string}`,
        events: [createdEvent, graduatedEvent],
        fromBlock,
        toBlock: latest,
      });
      for (const log of logs) {
        if (log.eventName === "TokenCreated") {
          const { token, curve, creator, name, symbol, image, supply } = log.args;
          if (!token || store.tokens.some((t) => t.address.toLowerCase() === token.toLowerCase())) {
            continue;
          }
          const id = token.toLowerCase();
          const curveState = emptyCurve(supply ?? DEFAULT_SUPPLY);
          store.tokens.unshift({
            id,
            address: token,
            curveAddress: curve ?? token,
            name: name || "Token",
            symbol: symbol || "TKN",
            description: "",
            logo: image || "",
            twitter: "",
            telegram: "",
            website: "",
            creator: creator ?? "0x0000000000000000000000000000000000000000",
            createdAt: Date.now(),
            ...curveToStored(curveState),
            volumeEth: "0",
            txCount: 0,
            lastTradeAt: Date.now(),
          });
          store.balances[id] = {};
        }
        if (log.eventName === "Graduated") {
          const { token, ethLiq, tokenLiq } = log.args;
          if (!token) continue;
          const row = store.tokens.find((t) => t.address.toLowerCase() === token.toLowerCase());
          if (!row) continue;
          row.graduated = true;
          row.graduatedAt = Date.now();
          row.ammEth = (ethLiq ?? 0n).toString();
          row.ammToken = (tokenLiq ?? 0n).toString();
          row.realEth = (ethLiq ?? ethToWei(5)).toString();
          row.tokenReserve = "0";
        }
      }
      store.lastBlock = Number(latest);
    });
  } catch {
    /* RPC optional — demo store still serves */
  }
}
