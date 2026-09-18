import { PROTOCOL } from "@/lib/protocol";

export default function DocsPage() {
  return (
    <article className="docs-page">
      <h1>Helix.fun</h1>
      <p>
        A pump.fun-style meme launchpad for <strong>Robinhood Chain</strong> (EVM, chain id{" "}
        {PROTOCOL.chainId}). Anyone can mint an ERC-20 onto a constant-product bonding curve. When
        the curve has collected 5 ETH of real reserve, leftover tokens plus that ETH migrate into a
        Uniswap-style AMM. A hardcoded <strong>1% fee</strong> is taken on every buy and sell.
      </p>

      <h2>Network</h2>
      <table>
        <tbody>
          <tr>
            <th>Name</th>
            <td>Robinhood Chain</td>
          </tr>
          <tr>
            <th>Chain ID</th>
            <td>4663</td>
          </tr>
          <tr>
            <th>RPC</th>
            <td>{PROTOCOL.rpc}</td>
          </tr>
          <tr>
            <th>Explorer</th>
            <td>
              <a href={PROTOCOL.explorer}>{PROTOCOL.explorer.replace("https://", "")}</a>
            </td>
          </tr>
          <tr>
            <th>Gas token</th>
            <td>ETH</td>
          </tr>
        </tbody>
      </table>

      <h2>Bonding curve</h2>
      <p>
        Each token starts with a <em>virtual</em> 1.25 ETH reserve against its full supply. Buys add
        real ETH (minus the 1% fee) into the product invariant <code>k = virtualEth × tokenReserve</code>.
        Selling 80% of supply takes 5 ETH of real reserve. The remaining 20% plus those 5 ETH seed
        the AMM. Starting market cap is 1.25 ETH (~$3k). Graduation market cap is 31.25 ETH (~$76k
        at $2,440/ETH).
      </p>

      <h3>Fees</h3>
      <ul>
        <li>Create: 0.002 ETH, paid to the factory fee recipient.</li>
        <li>Trade: 1% of ETH in (buys) or ETH out (sells). Hardcoded as <code>FEE_BPS = 100</code>.</li>
        <li>AMM swaps after graduation use the same 1% fee.</li>
      </ul>

      <h2>Contracts</h2>
      <div className="docs-grid">
        <div className="doc-card">
          <h4>TokenFactory</h4>
          <p>Deploys MemeToken + BondingCurve. Stores the list of launches.</p>
        </div>
        <div className="doc-card">
          <h4>BondingCurve</h4>
          <p>x·y=k with virtual reserves. Calls the factory to graduate at 5 ETH.</p>
        </div>
        <div className="doc-card">
          <h4>SimpleAMM</h4>
          <p>Constant-product pool. Receives leftover tokens and ETH. LP is locked in the pair.</p>
        </div>
        <div className="doc-card">
          <h4>MemeToken</h4>
          <p>Minimal ERC-20. Entire supply is minted to the curve at creation.</p>
        </div>
      </div>
      <p>
        Source lives in <code>contracts/</code>. Deploy with Foundry using the script in{" "}
        <code>contracts/README.md</code>, then set <code>NEXT_PUBLIC_FACTORY_ADDRESS</code>. Until
        then the site runs an indexer that uses the same curve math so you can launch, trade, chat,
        and graduate locally.
      </p>

      <h2>Indexer</h2>
      <p>
        <code>lib/store.ts</code> keeps tokens, trades, holders, and comments. API routes under{" "}
        <code>/api/tokens</code> and <code>/api/profile</code> serve the board. When a factory
        address is configured, <code>lib/chain-sync.ts</code> pulls <code>TokenCreated</code> and{" "}
        <code>Graduated</code> logs from Robinhood RPC on each read.
      </p>
    </article>
  );
}
