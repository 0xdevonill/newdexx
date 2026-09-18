import { fakeEvm, fakeSol } from "@/lib/format";
import { rawLogoFor } from "@/lib/logos";
import { contractFor, site } from "@/lib/site";
import type { ChainId, ListKind, LiveToken, Quote, Stake, Token } from "@/lib/types";

type Draft = {
  symbol: string;
  name: string;
  quote: Quote;
  mc: number;
  change24h: number;
  fees24h: number | null;
  trades24h: number;
  vol24h: number;
  ageHours: number;
  featured?: boolean;
  lists: ListKind[];
};

function branded(d: Draft): Draft {
  if (!d.featured) return d;
  return {
    ...d,
    symbol: site.tokenSymbol || d.symbol,
    name: site.tokenName || d.name,
  };
}

export function overlayLive(token: Token, live: LiveToken | null): Token {
  if (!live || !token.featured) return token;
  if (token.chain === "sol" && !site.tokenContractSol) return token;
  if (token.chain === "robinhood" && !site.tokenContract) return token;
  return {
    ...token,
    symbol: live.symbol || token.symbol,
    name: live.name || token.name,
    logo: live.logo || token.logo,
    address: live.address || token.address,
    mc: live.mc,
    change24h: live.change24h,
    vol24h: live.vol24h,
    trades24h: live.trades24h,
    fees24h: live.fees24h,
    ageHours: live.ageHours,
    priceUsd: live.priceUsd,
  };
}

function make(chain: ChainId, d: Draft): Token {
  const row = branded(d);
  const id = `${chain}-${row.symbol.toLowerCase()}`;
  const envAddr = row.featured ? contractFor(chain) : "";
  return {
    id,
    chain,
    ...row,
    address: envAddr || (chain === "sol" ? fakeSol(id) : fakeEvm(id)),
    logo: rawLogoFor(row.symbol),
  };
}

const rh: Draft[] = [
  { symbol: "SPCX", name: "Space Exploration Technologies Corp. Class A • Robinhood Token", quote: "USDG", mc: 10_170_000, change24h: 6.4, fees24h: 12_210, trades24h: 26009, vol24h: 24_410_000, ageHours: 74 * 24, lists: ["trending"] },
  { symbol: "PONS", name: "Pons", quote: "USDG", mc: 658_470_000, change24h: 11.6, fees24h: 70_230, trades24h: 33027, vol24h: 23_410_000, ageHours: 65 * 24, lists: ["trending", "established"] },
  { symbol: "NVDA", name: "NVIDIA • Robinhood Token", quote: "USDG", mc: 20_840_000, change24h: 1.2, fees24h: 9_830, trades24h: 25757, vol24h: 19_650_000, ageHours: 74 * 24, lists: ["trending", "established"] },
  { symbol: "META", name: "Meta Platforms • Robinhood Token", quote: "USDG", mc: 3_580_000, change24h: 1.2, fees24h: 43_460, trades24h: 36322, vol24h: 14_490_000, ageHours: 74 * 24, lists: ["trending", "established"] },
  { symbol: "GOOGL", name: "Alphabet Class A • Robinhood Token", quote: "USDG", mc: 5_290_000, change24h: 0.4, fees24h: 3_830, trades24h: 19615, vol24h: 7_660_000, ageHours: 74 * 24, lists: ["trending"] },
  { symbol: "CASHCAT", name: "Cash Cat", quote: "ETH", mc: 200_500_000, change24h: 28.0, fees24h: 18_950, trades24h: 11713, vol24h: 6_320_000, ageHours: 75 * 24, lists: ["trending", "established"] },
  { symbol: "AAPL", name: "Apple • Robinhood Token", quote: "USDG", mc: 5_270_000, change24h: 0.9, fees24h: 2_150, trades24h: 5453, vol24h: 4_300_000, ageHours: 74 * 24, lists: ["trending"] },
  { symbol: "musebook", name: "musebook", quote: "ETH", mc: 15_050_000, change24h: 58.8, fees24h: 37_610, trades24h: 24934, vol24h: 3_760_000, ageHours: 23, lists: ["trending"] },
  { symbol: "AI", name: "Artificial Inu", quote: "ETH", mc: 273_480_000, change24h: 3.6, fees24h: 33_060, trades24h: 1235, vol24h: 3_310_000, ageHours: 64 * 24, lists: ["trending"] },
  { symbol: "PING", name: "Fomo Ping", quote: "ETH", mc: 14_420_000, change24h: 26.4, fees24h: 22_620, trades24h: 4501, vol24h: 2_260_000, ageHours: 47 * 24, featured: true, lists: ["trending", "established"] },
  { symbol: "INU", name: "iNu", quote: "ETH", mc: 6_570_000, change24h: 73.1, fees24h: 16_260, trades24h: 7538, vol24h: 1_630_000, ageHours: 3 * 24, lists: ["trending", "established"] },
  { symbol: "SPY", name: "SPDR S&P 500 ETF Trust • Robinhood Token", quote: "USDG", mc: 24_270_000, change24h: 0.1, fees24h: null, trades24h: 1379, vol24h: 1_450_000, ageHours: 74 * 24, lists: ["trending", "established"] },
  { symbol: "PIPEDOG", name: "pipedog", quote: "ETH", mc: 30_320_000, change24h: 6.2, fees24h: 13_690, trades24h: 1145, vol24h: 1_370_000, ageHours: 50 * 24, lists: ["trending", "established"] },
  { symbol: "Index", name: "The Index", quote: "ETH", mc: 26_990_000, change24h: 17.0, fees24h: 13_370, trades24h: 1217, vol24h: 1_340_000, ageHours: 73 * 24, lists: ["trending", "established"] },
  { symbol: "HOOKR", name: "Hookr.fun", quote: "ETH", mc: 7_840_000, change24h: 48.5, fees24h: 2_620, trades24h: 2433, vol24h: 1_050_000, ageHours: 41 * 24, lists: ["trending", "established"] },
  { symbol: "QQQ", name: "Invesco QQQ • Robinhood Token", quote: "USDG", mc: 5_020_000, change24h: 0.5, fees24h: 483, trades24h: 2034, vol24h: 966_550, ageHours: 74 * 24, lists: ["trending", "established"] },
  { symbol: "PROLOGUE", name: "Prologue", quote: "ETH", mc: 7_890_000, change24h: 6.5, fees24h: 1_930, trades24h: 2187, vol24h: 773_340, ageHours: 30 * 24, lists: ["trending", "established"] },
  { symbol: "MOO", name: "Memory cow Moo", quote: "ETH", mc: 17_910_000, change24h: 13.9, fees24h: 6_580, trades24h: 1776, vol24h: 658_180, ageHours: 57 * 24, lists: ["trending"] },
  { symbol: "TSLA", name: "Tesla • Robinhood Token", quote: "USDG", mc: 4_550_000, change24h: 1.5, fees24h: 1_960, trades24h: 1130, vol24h: 654_590, ageHours: 74 * 24, lists: ["trending"] },
  { symbol: "NET", name: "NetNet", quote: "USDG", mc: 90_950_000, change24h: 23.7, fees24h: 6_510, trades24h: 1215, vol24h: 650_790, ageHours: 61 * 24, lists: ["trending"] },
  { symbol: "MEME", name: "A Meme Coin", quote: "ETH", mc: 33_070_000, change24h: 13.1, fees24h: 1_900, trades24h: 3626, vol24h: 632_750, ageHours: 10 * 24, lists: ["trending"] },
  { symbol: "Zerocoin", name: "Zerocoin", quote: "ETH", mc: 85_360, change24h: 774, fees24h: 60.8, trades24h: 1978, vol24h: 607_690, ageHours: 1, lists: ["trending"] },
  { symbol: "ZZZ", name: "ZZZ", quote: "ETH", mc: 23_300_000, change24h: 43.7, fees24h: 5_310, trades24h: 2080, vol24h: 531_160, ageHours: 11 * 24, lists: ["trending"] },
  { symbol: "TRENCHIES", name: "Trenchies", quote: "ETH", mc: 163_100, change24h: 1600, fees24h: 44.1, trades24h: 1820, vol24h: 441_490, ageHours: 1, lists: ["trending"] },
  { symbol: "HMM", name: "Thinking Cat", quote: "ETH", mc: 14_410_000, change24h: 28.0, fees24h: 4_090, trades24h: 1174, vol24h: 408_530, ageHours: 59 * 24, lists: ["trending"] },
  { symbol: "HOOD", name: "TheGreenHood", quote: "ETH", mc: 52_230_000, change24h: 8.6, fees24h: null, trades24h: 213, vol24h: 4_430_000, ageHours: 33 * 24, lists: ["established"] },
  { symbol: "CHUMP", name: "Chump Coin", quote: "ETH", mc: 26_900_000, change24h: -8.4, fees24h: 34_680, trades24h: 11902, vol24h: 3_470_000, ageHours: 47 * 24, lists: ["established"] },
  { symbol: "GME", name: "GameStop • Robinhood Token", quote: "USDG", mc: 3_380_000, change24h: 3.1, fees24h: 1_230, trades24h: 3950, vol24h: 2_450_000, ageHours: 75 * 24, lists: ["established"] },
  { symbol: "CRCL", name: "Circle Internet Group • Robinhood Token", quote: "USDG", mc: 5_420_000, change24h: -2.6, fees24h: 6_920, trades24h: 3036, vol24h: 2_310_000, ageHours: 74 * 24, lists: ["established"] },
  { symbol: "HIMS", name: "Hims & Hers Health • Robinhood Token", quote: "USDG", mc: 3_400_000, change24h: 0.6, fees24h: 6_630, trades24h: 1539, vol24h: 2_210_000, ageHours: 37 * 24, lists: ["established"] },
  { symbol: "AMC", name: "AMC Entertainment • Robinhood Token", quote: "USDG", mc: 3_370_000, change24h: 5.4, fees24h: 5_590, trades24h: 2542, vol24h: 1_860_000, ageHours: 37 * 24, lists: ["established"] },
  { symbol: "DOGO", name: "DogBull", quote: "ETH", mc: 13_670_000, change24h: 4.6, fees24h: null, trades24h: 89, vol24h: 1_670_000, ageHours: 37 * 24, lists: ["established"] },
  { symbol: "syrupUSDG", name: "syrupUSDG", quote: "ETH", mc: 99_880_000, change24h: -0.0, fees24h: 813, trades24h: 17, vol24h: 1_630_000, ageHours: 75 * 24, lists: ["established"] },
  { symbol: "WALLET", name: "Robinhood Wallet", quote: "ETH", mc: 58_910_000, change24h: 44.2, fees24h: 11_250, trades24h: 1952, vol24h: 1_130_000, ageHours: 68 * 24, lists: ["established"] },
  { symbol: "UP", name: "up", quote: "ETH", mc: 226_680_000, change24h: 24.1, fees24h: 9_430, trades24h: 770, vol24h: 942_800, ageHours: 67 * 24, lists: ["established"] },
  { symbol: "MU", name: "Micron Technology • Robinhood Token", quote: "USDG", mc: 4_670_000, change24h: -0.1, fees24h: 2_730, trades24h: 1040, vol24h: 911_580, ageHours: 74 * 24, lists: ["established"] },
  { symbol: "IF", name: "What If", quote: "ETH", mc: 11_650_000, change24h: -18.8, fees24h: 7_560, trades24h: 2640, vol24h: 756_250, ageHours: 67 * 24, lists: ["established"] },
  { symbol: "USDe", name: "USDe", quote: "ETH", mc: 323_570_000, change24h: 0.0, fees24h: 74.8, trades24h: 487, vol24h: 748_360, ageHours: 75 * 24, lists: ["established"] },
];

const sol: Draft[] = [
  { symbol: "PING", name: "Fomo Ping", quote: "SOL", mc: 14_420_000, change24h: 26.4, fees24h: 22_620, trades24h: 4501, vol24h: 2_260_000, ageHours: 47 * 24, featured: true, lists: ["trending", "established"] },
  { symbol: "BONK", name: "Bonk", quote: "SOL", mc: 892_400_000, change24h: 8.2, fees24h: 94_200, trades24h: 48210, vol24h: 41_200_000, ageHours: 90 * 24, lists: ["trending", "established"] },
  { symbol: "WIF", name: "dogwifhat", quote: "SOL", mc: 412_800_000, change24h: 12.4, fees24h: 38_400, trades24h: 22104, vol24h: 18_900_000, ageHours: 88 * 24, lists: ["trending", "established"] },
  { symbol: "JUP", name: "Jupiter", quote: "USDC", mc: 1_240_000_000, change24h: 3.1, fees24h: 52_100, trades24h: 18440, vol24h: 22_300_000, ageHours: 92 * 24, lists: ["trending", "established"] },
  { symbol: "RAY", name: "Raydium", quote: "SOL", mc: 618_000_000, change24h: 5.8, fees24h: 29_700, trades24h: 9102, vol24h: 9_840_000, ageHours: 95 * 24, lists: ["trending", "established"] },
  { symbol: "PYTH", name: "Pyth Network", quote: "USDC", mc: 544_000_000, change24h: 1.9, fees24h: 8_440, trades24h: 6401, vol24h: 4_120_000, ageHours: 91 * 24, lists: ["trending", "established"] },
  { symbol: "JTO", name: "Jito", quote: "SOL", mc: 378_000_000, change24h: 4.4, fees24h: 11_200, trades24h: 3880, vol24h: 3_560_000, ageHours: 80 * 24, lists: ["established"] },
  { symbol: "ORCA", name: "Orca", quote: "SOL", mc: 196_000_000, change24h: 6.7, fees24h: 7_180, trades24h: 2540, vol24h: 2_110_000, ageHours: 93 * 24, lists: ["established"] },
  { symbol: "RENDER", name: "Render", quote: "USDC", mc: 1_020_000_000, change24h: 2.2, fees24h: 14_600, trades24h: 5012, vol24h: 6_880_000, ageHours: 89 * 24, lists: ["trending", "established"] },
  { symbol: "W", name: "Wormhole", quote: "USDC", mc: 312_000_000, change24h: -1.4, fees24h: 4_920, trades24h: 2110, vol24h: 1_880_000, ageHours: 84 * 24, lists: ["established"] },
  { symbol: "POPCAT", name: "Popcat", quote: "SOL", mc: 268_000_000, change24h: 19.6, fees24h: 21_400, trades24h: 14220, vol24h: 8_640_000, ageHours: 70 * 24, lists: ["trending"] },
  { symbol: "MEW", name: "cat in a dogs world", quote: "SOL", mc: 184_000_000, change24h: 14.1, fees24h: 9_330, trades24h: 8704, vol24h: 3_990_000, ageHours: 62 * 24, lists: ["trending"] },
  { symbol: "PNUT", name: "Peanut the Squirrel", quote: "SOL", mc: 226_000_000, change24h: 9.8, fees24h: 12_700, trades24h: 11040, vol24h: 5_220_000, ageHours: 48 * 24, lists: ["trending"] },
  { symbol: "FARTCOIN", name: "Fartcoin", quote: "SOL", mc: 510_000_000, change24h: 22.0, fees24h: 41_800, trades24h: 19880, vol24h: 16_400_000, ageHours: 44 * 24, lists: ["trending", "established"] },
  { symbol: "TRUMP", name: "Official Trump", quote: "USDC", mc: 1_480_000_000, change24h: -3.2, fees24h: 66_200, trades24h: 27410, vol24h: 28_900_000, ageHours: 55 * 24, lists: ["trending", "established"] },
  { symbol: "MELANIA", name: "Melania Meme", quote: "USDC", mc: 92_400_000, change24h: 7.5, fees24h: 3_140, trades24h: 4201, vol24h: 1_220_000, ageHours: 55 * 24, lists: ["trending"] },
  { symbol: "MOODENG", name: "Moo Deng", quote: "SOL", mc: 148_000_000, change24h: 31.2, fees24h: 18_900, trades24h: 13220, vol24h: 6_010_000, ageHours: 38 * 24, lists: ["trending"] },
  { symbol: "GIGA", name: "Gigachad", quote: "SOL", mc: 88_200_000, change24h: 16.4, fees24h: 5_440, trades24h: 3888, vol24h: 1_540_000, ageHours: 51 * 24, lists: ["trending"] },
  { symbol: "RETARDIO", name: "Retardio", quote: "SOL", mc: 41_600_000, change24h: 44.8, fees24h: 4_210, trades24h: 6110, vol24h: 980_000, ageHours: 21 * 24, lists: ["trending"] },
  { symbol: "BOME", name: "BOOK OF MEME", quote: "SOL", mc: 132_000_000, change24h: 5.1, fees24h: 6_080, trades24h: 5402, vol24h: 2_040_000, ageHours: 66 * 24, lists: ["established"] },
  { symbol: "TNSR", name: "Tensor", quote: "USDC", mc: 74_800_000, change24h: -0.8, fees24h: 1_120, trades24h: 980, vol24h: 412_000, ageHours: 78 * 24, lists: ["established"] },
  { symbol: "DRIFT", name: "Drift", quote: "USDC", mc: 268_000_000, change24h: 2.9, fees24h: 8_880, trades24h: 2410, vol24h: 3_210_000, ageHours: 72 * 24, lists: ["established"] },
  { symbol: "IO", name: "io.net", quote: "USDC", mc: 196_000_000, change24h: 1.1, fees24h: 2_640, trades24h: 1340, vol24h: 890_000, ageHours: 69 * 24, lists: ["established"] },
  { symbol: "KMNO", name: "Kamino", quote: "SOL", mc: 224_000_000, change24h: 6.0, fees24h: 9_910, trades24h: 1880, vol24h: 2_760_000, ageHours: 61 * 24, lists: ["established"] },
  { symbol: "PENGU", name: "Pudgy Penguins", quote: "USDC", mc: 1_120_000_000, change24h: 10.8, fees24h: 48_200, trades24h: 22100, vol24h: 19_400_000, ageHours: 40 * 24, lists: ["trending", "established"] },
  { symbol: "GOAT", name: "Goatseus Maximus", quote: "SOL", mc: 96_500_000, change24h: 18.7, fees24h: 7_770, trades24h: 9012, vol24h: 2_880_000, ageHours: 34 * 24, lists: ["trending"] },
  { symbol: "ACT", name: "Act I The AI Prophecy", quote: "SOL", mc: 54_200_000, change24h: 9.3, fees24h: 2_210, trades24h: 2440, vol24h: 760_000, ageHours: 36 * 24, lists: ["trending"] },
  { symbol: "ZEREBRO", name: "Zerebro", quote: "SOL", mc: 38_900_000, change24h: 27.5, fees24h: 3_330, trades24h: 5110, vol24h: 1_040_000, ageHours: 18, lists: ["trending"] },
  { symbol: "ai16z", name: "ai16z", quote: "SOL", mc: 168_000_000, change24h: 15.2, fees24h: 11_800, trades24h: 7800, vol24h: 4_440_000, ageHours: 28 * 24, lists: ["trending", "established"] },
];

export const TOKENS: Token[] = [
  ...rh.map((d) => make("robinhood", d)),
  ...sol.map((d) => make("sol", d)),
];

const rhStakes: { symbol: string; tvl: number; rate7d: number | null; fees24h: number }[] = [
  { symbol: site.tokenSymbol || "PING", tvl: 5.0274, rate7d: 42.8, fees24h: 0.018 },
  { symbol: "INU", tvl: 3.3873, rate7d: 0, fees24h: 0 },
  { symbol: "NVDA", tvl: 0.6756, rate7d: 0, fees24h: 0 },
  { symbol: "CASHCAT", tvl: 0.4915, rate7d: 163.33, fees24h: 0.22 },
  { symbol: "PONS", tvl: 0.0011, rate7d: 0, fees24h: 0 },
  { symbol: "TSLA", tvl: 0.0004, rate7d: 0, fees24h: 0 },
  { symbol: "AAPL", tvl: 0.0001, rate7d: 0, fees24h: 0 },
  { symbol: "Index", tvl: 0, rate7d: null, fees24h: 0 },
  { symbol: "META", tvl: 0, rate7d: null, fees24h: 0 },
  { symbol: "HOOKR", tvl: 0.00008, rate7d: 0, fees24h: 0 },
  { symbol: "MEME", tvl: 0.00005, rate7d: 0, fees24h: 0 },
  { symbol: "SPY", tvl: 0, rate7d: null, fees24h: 0 },
  { symbol: "QQQ", tvl: 0, rate7d: null, fees24h: 0 },
];

const solStakes: { symbol: string; tvl: number; rate7d: number | null; fees24h: number }[] = [
  { symbol: site.tokenSymbol || "PING", tvl: 842.4, rate7d: 38.6, fees24h: 3.12 },
  { symbol: "BONK", tvl: 612.1, rate7d: 21.4, fees24h: 2.08 },
  { symbol: "JUP", tvl: 401.8, rate7d: 14.2, fees24h: 1.44 },
  { symbol: "WIF", tvl: 288.0, rate7d: 29.7, fees24h: 1.91 },
  { symbol: "RAY", tvl: 176.5, rate7d: 18.1, fees24h: 0.84 },
  { symbol: "FARTCOIN", tvl: 94.2, rate7d: 61.0, fees24h: 1.22 },
  { symbol: "PENGU", tvl: 66.4, rate7d: 24.8, fees24h: 0.51 },
  { symbol: "POPCAT", tvl: 22.1, rate7d: 44.0, fees24h: 0.28 },
  { symbol: "ORCA", tvl: 11.6, rate7d: 9.4, fees24h: 0.04 },
  { symbol: "ZEREBRO", tvl: 4.2, rate7d: 88.5, fees24h: 0.09 },
  { symbol: "ai16z", tvl: 0.8, rate7d: 12.0, fees24h: 0.01 },
  { symbol: "GOAT", tvl: 0, rate7d: null, fees24h: 0 },
];

export const STAKES: Stake[] = [
  ...rhStakes.map((s) => ({
    id: `robinhood-${s.symbol.toLowerCase()}-stake`,
    chain: "robinhood" as const,
    tokenId: `robinhood-${s.symbol.toLowerCase()}`,
    tvlQuote: s.tvl,
    rate7d: s.rate7d,
    fees24h: s.fees24h,
  })),
  ...solStakes.map((s) => ({
    id: `sol-${s.symbol.toLowerCase()}-stake`,
    chain: "sol" as const,
    tokenId: `sol-${s.symbol.toLowerCase()}`,
    tvlQuote: s.tvl,
    rate7d: s.rate7d,
    fees24h: s.fees24h,
  })),
];

export const PROTOCOL = {
  name: site.tokenName || "Fomo Ping",
  token: site.tokenSymbol || "PING",
  tagline:
    site.tokenInfo ||
    "You heard it. That's the entry. Fair-launch meme on Robinhood Chain with real fee-sharing pools — not an official Robinhood product.",
  claimFee: 0.075,
  chainIdRh: 4663,
  x: site.xUrl,
  discord: site.discordUrl,
  ponsUrl: site.ponsUrl,
  ponsId: site.ponsId,
  launchAt: site.launchAt,
  tokenInfo: site.tokenInfo,
  totals: {
    robinhood: { positions: 21441, fees: 3_201_988, tvl: 768_258, nativePrice: 2440.95, nativeLabel: "ETH Price" },
    sol: { positions: 18620, fees: 2_448_110, tvl: 1_124_400, nativePrice: 214.62, nativeLabel: "SOL Price" },
  },
};

export function tokensFor(chain: ChainId): Token[] {
  return TOKENS.filter((t) => t.chain === chain);
}

export function tokenById(id: string): Token | undefined {
  const direct = TOKENS.find((t) => t.id === id);
  if (direct) return direct;
  const lower = id.toLowerCase();
  return TOKENS.find((t) => {
    if (t.address.toLowerCase() === lower) return true;
    if (`${t.chain}-${t.address}`.toLowerCase() === lower) return true;
    return false;
  });
}

export function featuredToken(chain: ChainId): Token {
  return tokensFor(chain).find((t) => t.featured) ?? tokensFor(chain)[0];
}

export function mostTraded(chain: ChainId): Token {
  return [...tokensFor(chain)].sort((a, b) => b.trades24h - a.trades24h)[0];
}

export function highestVolume(chain: ChainId): Token {
  return [...tokensFor(chain)].sort((a, b) => b.vol24h - a.vol24h)[0];
}

export function stakesFor(chain: ChainId): Stake[] {
  return STAKES.filter((s) => s.chain === chain);
}

export function quoteUnit(chain: ChainId): string {
  return chain === "sol" ? "SOL" : "WETH";
}

export function quoteFilters(chain: ChainId): string[] {
  return chain === "sol" ? ["All", "SOL", "USDC"] : ["All", "ETH", "USDG"];
}
