"use client";

import { useAccount } from "wagmi";
import { useBridge, type Lesson } from "@/components/bridge-context";

const STEPS: { id: Lesson; title: string; body: string }[] = [
  {
    id: "wallet",
    title: "Dock a live wallet",
    body: "Connect MetaMask, Rabby, Coinbase Wallet, or WalletConnect. Quay never asks for a seed phrase.",
  },
  {
    id: "from",
    title: "Pick the departure dock",
    body: "Choose the chain where the tokens live now, then the asset you want to send.",
  },
  {
    id: "to",
    title: "Pick the arrival dock",
    body: "Same asset on another chain, or a different token. One fare can bridge, swap, or both.",
  },
  {
    id: "amount",
    title: "Set the cargo",
    body: "Type an amount or tap Max. The ticket stub prices time and fees before you sign.",
  },
  {
    id: "review",
    title: "Sign the crossing",
    body: "Confirm once in the wallet. Relayers fill the other side, usually in seconds.",
  },
];

export function TutorialPanel() {
  const { lesson, setLesson, parsedAmount } = useBridge();
  const { isConnected } = useAccount();

  const done = (id: Lesson) => {
    if (id === "wallet") return isConnected;
    if (id === "amount") return Boolean(parsedAmount && parsedAmount > 0n);
    if (id === "review") return lesson === "review" && Boolean(parsedAmount && parsedAmount > 0n);
    return STEPS.findIndex((s) => s.id === lesson) > STEPS.findIndex((s) => s.id === id);
  };

  return (
    <div className="tutorial">
      <div className="tutorial-kicker">How to board</div>
      {STEPS.map((step, i) => (
        <button
          key={step.id}
          type="button"
          className={`step ${lesson === step.id ? "on" : ""} ${done(step.id) ? "done" : ""}`}
          onClick={() => setLesson(step.id)}
        >
          <span className="step-num">{i + 1}</span>
          <span>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
          </span>
        </button>
      ))}
    </div>
  );
}
