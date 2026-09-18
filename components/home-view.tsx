"use client";

import { BridgeProvider, useBridge } from "@/components/bridge-context";
import { BridgeWidget } from "@/components/bridge-widget";
import { TutorialPanel } from "@/components/tutorial-panel";
import { POPULAR_LANES } from "@/lib/catalog";

function LaneStrip() {
  const { fromChain, toChain, applyLane } = useBridge();
  return (
    <div className="lanes" aria-label="Popular lanes">
      {POPULAR_LANES.map((lane) => {
        const on = fromChain.id === lane.from && toChain.id === lane.to;
        return (
          <button
            key={lane.label}
            type="button"
            className={`lane ${on ? "on" : ""}`}
            onClick={() => applyLane(lane.from, lane.to)}
          >
            {lane.label}
          </button>
        );
      })}
    </div>
  );
}

function HomeInner() {
  return (
    <div className="home-grid">
      <div>
        <section className="hero">
          <h1>
            Dock on one chain.
            <br />
            <em>Land on another.</em>
          </h1>
          <p className="lede">
            Quay is a crossing desk, not a launchpad. Connect a real wallet, price a fare, and move
            tokens across fifty-plus EVM lanes — with a five-step boarding tutorial on this page.
          </p>
        </section>
        <TutorialPanel />
      </div>
      <div>
        <BridgeWidget />
        <LaneStrip />
      </div>
    </div>
  );
}

export function HomeView() {
  return (
    <BridgeProvider>
      <HomeInner />
    </BridgeProvider>
  );
}
