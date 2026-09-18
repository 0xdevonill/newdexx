import { catalog, FEATURED_CHAIN_IDS } from "@/lib/catalog";

/* eslint-disable @next/next/no-img-element -- remote Relay chain icons */

export default function LanesPage() {
  const featured = catalog.filter((c) => FEATURED_CHAIN_IDS.includes(c.id));
  const rest = catalog.filter((c) => !FEATURED_CHAIN_IDS.includes(c.id));
  return (
    <div>
      <h1 className="page-title">Lanes</h1>
      <p className="muted">
        Quay quotes EVM docks that public Relay solvers currently fill. Featured lanes sit up front;
        the rest of the mosaic is still boardable from the ticket.
      </p>
      <h2 style={{ fontFamily: "var(--font-display), serif", margin: "28px 0 0" }}>Featured docks</h2>
      <div className="chain-mosaic">
        {featured.map((c) => (
          <div key={c.id} className="chain-tile">
            <img src={c.iconUrl} alt="" width={28} height={28} style={{ borderRadius: 99 }} />
            <div>
              <strong>{c.displayName}</strong>
              <div className="muted">
                {c.native.symbol} · {c.id}
              </div>
            </div>
          </div>
        ))}
      </div>
      <h2 style={{ fontFamily: "var(--font-display), serif", margin: "32px 0 0" }}>Full mosaic</h2>
      <div className="chain-mosaic">
        {rest.map((c) => (
          <div key={c.id} className="chain-tile">
            <img src={c.iconUrl} alt="" width={28} height={28} style={{ borderRadius: 99 }} />
            <div>
              <strong>{c.displayName}</strong>
              <div className="muted">
                {c.native.symbol} · {c.id}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
