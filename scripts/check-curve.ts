const WAD = 10n ** 18n;
const VIRTUAL_ETH = (125n * WAD) / 100n;
const GRADUATION_ETH = 5n * WAD;
const FEE_BPS = 100n;
const BPS = 10_000n;
const DEFAULT_SUPPLY = 1_000_000_000n * WAD;

function feeOn(amount) {
  return (amount * FEE_BPS) / BPS;
}

function quoteBuy(state, ethIn) {
  const fee = feeOn(ethIn);
  const net = ethIn - fee;
  if (!state.graduated) {
    const vEth = VIRTUAL_ETH + state.realEth;
    const k = vEth * state.tokenReserve;
    const newReserve = k / (vEth + net);
    const tokensOut = state.tokenReserve - newReserve;
    const next = {
      ...state,
      realEth: state.realEth + net,
      tokenReserve: newReserve,
    };
    if (next.realEth >= GRADUATION_ETH) {
      next.graduated = true;
      next.ammEth = next.realEth;
      next.ammToken = next.tokenReserve;
      next.tokenReserve = 0n;
    }
    return { tokensOut, fee, newState: next };
  }
  const out = (state.ammToken * net) / (state.ammEth + net);
  return {
    tokensOut: out,
    fee,
    newState: { ...state, ammEth: state.ammEth + net, ammToken: state.ammToken - out },
  };
}

function quoteSell(state, tokenIn) {
  const vEth = VIRTUAL_ETH + state.realEth;
  const k = vEth * state.tokenReserve;
  const newVEth = k / (state.tokenReserve + tokenIn);
  const gross = vEth - newVEth;
  const fee = feeOn(gross);
  return {
    ethOut: gross - fee,
    newState: {
      ...state,
      realEth: state.realEth - gross,
      tokenReserve: state.tokenReserve + tokenIn,
    },
  };
}

const start = { realEth: 0n, tokenReserve: DEFAULT_SUPPLY, graduated: false, ammEth: 0n, ammToken: 0n };
const startMc = (VIRTUAL_ETH * DEFAULT_SUPPLY) / start.tokenReserve;
if (startMc !== VIRTUAL_ETH) throw new Error("start MC");

const spend = (GRADUATION_ETH * BPS) / (BPS - FEE_BPS);
const bought = quoteBuy(start, spend);
if (!bought.newState.graduated) throw new Error("should graduate");
const soldPct = Number(bought.tokensOut * 10000n / DEFAULT_SUPPLY) / 100;
if (soldPct < 79 || soldPct > 81) throw new Error(`sold ${soldPct}`);

const mid = quoteBuy(start, WAD);
const back = quoteSell(mid.newState, mid.tokensOut);
if (back.ethOut >= WAD) throw new Error("fee not applied");

console.log("curve checks ok");
console.log("  start MC ETH", Number(startMc) / 1e18);
console.log("  sold %", soldPct);
