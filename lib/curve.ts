import {
  BPS,
  DEFAULT_SUPPLY,
  ETH_USD,
  FEE_BPS,
  GRADUATION_ETH,
  VIRTUAL_ETH,
  WAD,
} from "@/lib/protocol";

export type CurveState = {
  realEth: bigint;
  tokenReserve: bigint;
  totalSupply: bigint;
  graduated: boolean;
  ammEth: bigint;
  ammToken: bigint;
};

export function emptyCurve(totalSupply = DEFAULT_SUPPLY): CurveState {
  return {
    realEth: 0n,
    tokenReserve: totalSupply,
    totalSupply,
    graduated: false,
    ammEth: 0n,
    ammToken: 0n,
  };
}

export function virtualEth(state: CurveState): bigint {
  return VIRTUAL_ETH + state.realEth;
}

export function feeOn(amount: bigint): bigint {
  return (amount * FEE_BPS) / BPS;
}

export function quoteBuy(state: CurveState, ethIn: bigint): {
  tokensOut: bigint;
  fee: bigint;
  net: bigint;
  newState: CurveState;
} {
  if (ethIn <= 0n) {
    return { tokensOut: 0n, fee: 0n, net: 0n, newState: state };
  }
  const fee = feeOn(ethIn);
  const net = ethIn - fee;
  if (!state.graduated) {
    const vEth = virtualEth(state);
    const k = vEth * state.tokenReserve;
    const newReserve = k / (vEth + net);
    const tokensOut = state.tokenReserve - newReserve;
    let next: CurveState = {
      ...state,
      realEth: state.realEth + net,
      tokenReserve: newReserve,
    };
    if (next.realEth >= GRADUATION_ETH) {
      next = graduate(next);
    }
    return { tokensOut, fee, net, newState: next };
  }
  const out = (state.ammToken * net) / (state.ammEth + net);
  return {
    tokensOut: out,
    fee,
    net,
    newState: {
      ...state,
      ammEth: state.ammEth + net,
      ammToken: state.ammToken - out,
    },
  };
}

export function quoteSell(state: CurveState, tokenIn: bigint): {
  ethOut: bigint;
  fee: bigint;
  gross: bigint;
  newState: CurveState;
} {
  if (tokenIn <= 0n) {
    return { ethOut: 0n, fee: 0n, gross: 0n, newState: state };
  }
  if (!state.graduated) {
    const vEth = virtualEth(state);
    const k = vEth * state.tokenReserve;
    const newVEth = k / (state.tokenReserve + tokenIn);
    const gross = vEth - newVEth;
    const fee = feeOn(gross);
    const ethOut = gross - fee;
    return {
      ethOut,
      fee,
      gross,
      newState: {
        ...state,
        realEth: state.realEth - gross,
        tokenReserve: state.tokenReserve + tokenIn,
      },
    };
  }
  const gross = (state.ammEth * tokenIn) / (state.ammToken + tokenIn);
  const fee = feeOn(gross);
  const ethOut = gross - fee;
  return {
    ethOut,
    fee,
    gross,
    newState: {
      ...state,
      ammEth: state.ammEth - gross,
      ammToken: state.ammToken + tokenIn,
    },
  };
}

export function graduate(state: CurveState): CurveState {
  if (state.graduated) return state;
  return {
    ...state,
    graduated: true,
    ammEth: state.realEth,
    ammToken: state.tokenReserve,
    tokenReserve: 0n,
  };
}

/** ETH wei that 1 whole token costs (18-decimal token). */
export function spotPriceWei(state: CurveState): bigint {
  if (state.graduated) {
    if (state.ammToken === 0n) return 0n;
    return (state.ammEth * WAD) / state.ammToken;
  }
  const reserve = state.tokenReserve;
  if (reserve === 0n) return 0n;
  return (virtualEth(state) * WAD) / reserve;
}

/** Fully diluted market cap in ETH wei. */
export function marketCapWei(state: CurveState): bigint {
  if (state.graduated) {
    if (state.ammToken === 0n) return 0n;
    return (state.ammEth * state.totalSupply) / state.ammToken;
  }
  const reserve = state.tokenReserve;
  if (reserve === 0n) return 0n;
  return (virtualEth(state) * state.totalSupply) / reserve;
}

export function marketCapUsd(state: CurveState, ethUsd = ETH_USD): number {
  return weiToEth(marketCapWei(state)) * ethUsd;
}

export function progressBps(state: CurveState): number {
  if (state.graduated) return Number(BPS);
  const p = (state.realEth * BPS) / GRADUATION_ETH;
  return Number(p > BPS ? BPS : p);
}

export function weiToEth(wei: bigint): number {
  const neg = wei < 0n;
  const abs = neg ? -wei : wei;
  const whole = abs / WAD;
  const frac = abs % WAD;
  const n = Number(whole) + Number(frac) / 1e18;
  return neg ? -n : n;
}

export function ethToWei(eth: number | string): bigint {
  const s = typeof eth === "number" ? eth.toString() : eth.trim();
  if (!s || s === ".") return 0n;
  const neg = s.startsWith("-");
  const raw = neg ? s.slice(1) : s;
  const [w = "0", f = ""] = raw.split(".");
  const frac = (f + "000000000000000000").slice(0, 18);
  const wei = BigInt(w || "0") * WAD + BigInt(frac || "0");
  return neg ? -wei : wei;
}

export function tokensToWei(amount: number | string, decimals = 18): bigint {
  return ethToWei(amount) / (10n ** BigInt(18 - decimals));
}

export function weiToTokens(wei: bigint): number {
  return weiToEth(wei);
}

export function curveFromStored(row: {
  realEth: string;
  tokenReserve: string;
  totalSupply: string;
  graduated: boolean;
  ammEth: string;
  ammToken: string;
}): CurveState {
  return {
    realEth: BigInt(row.realEth),
    tokenReserve: BigInt(row.tokenReserve),
    totalSupply: BigInt(row.totalSupply),
    graduated: row.graduated,
    ammEth: BigInt(row.ammEth),
    ammToken: BigInt(row.ammToken),
  };
}

export function curveToStored(state: CurveState) {
  return {
    realEth: state.realEth.toString(),
    tokenReserve: state.tokenReserve.toString(),
    totalSupply: state.totalSupply.toString(),
    graduated: state.graduated,
    ammEth: state.ammEth.toString(),
    ammToken: state.ammToken.toString(),
  };
}
