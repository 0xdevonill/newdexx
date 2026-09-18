"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useWriteContract } from "wagmi";
import { TOKEN_FACTORY_ABI } from "@/lib/abi";
import { CREATION_FEE, DEFAULT_SUPPLY, FACTORY_ADDRESS } from "@/lib/protocol";
import { useAppState } from "@/lib/app-state";
import { wallet as walletEnv } from "@/lib/site";
import { ROBINHOOD_CHAIN_ID } from "@/lib/robinhood-chain";
import { weiToEth } from "@/lib/curve";

async function fileToDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  const scale = Math.max(size / bitmap.width, size / bitmap.height);
  const w = bitmap.width * scale;
  const h = bitmap.height * scale;
  ctx.drawImage(bitmap, (size - w) / 2, (size - h) / 2, w, h);
  return canvas.toDataURL("image/jpeg", 0.72);
}

export function CreateForm() {
  const router = useRouter();
  const { wallet, pushToast } = useAppState();
  const { address, chainId } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const creator = address || wallet;
  const liveOnchain = Boolean(walletEnv.live && FACTORY_ADDRESS && chainId === ROBINHOOD_CHAIN_ID);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState("");
  const [form, setForm] = useState({
    name: "",
    symbol: "",
    description: "",
    twitter: "",
    telegram: "",
    website: "",
    supply: "1000000000",
    initialBuyEth: "0.05",
  });

  const set =
    (key: keyof typeof form) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2_000_000) {
      pushToast("Image too large", "Keep the logo under 2 MB.");
      return;
    }
    const url = await fileToDataUrl(file);
    setPreview(url);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!creator) {
      pushToast("Connect a wallet", "Token creation is tied to your address.");
      return;
    }
    setBusy(true);
    try {
      if (liveOnchain) {
        await writeContractAsync({
          address: FACTORY_ADDRESS as `0x${string}`,
          abi: TOKEN_FACTORY_ABI,
          functionName: "createToken",
          args: [
            form.name,
            form.symbol,
            form.description,
            preview || form.website,
            form.twitter,
            form.telegram,
            form.website,
            DEFAULT_SUPPLY,
          ],
          value: CREATION_FEE,
        });
      }
      const res = await fetch("/api/tokens/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, logo: preview, creator }),
      });
      const data = (await res.json()) as { error?: string; token?: { id: string } };
      if (!res.ok || !data.token) throw new Error(data.error || "Create failed");
      pushToast("Token launched", `${form.symbol} is live on the bonding curve.`);
      router.push(`/token/${data.token.id}`);
    } catch (err) {
      pushToast("Could not launch", err instanceof Error ? err.message : "Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="create-form" onSubmit={(e) => void submit(e)}>
      <div className="create-grid">
        <label className="logo-pick">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" />
          ) : (
            <span>Drop a logo</span>
          )}
          <input type="file" accept="image/*" onChange={(e) => void onFile(e)} />
        </label>
        <div className="create-fields">
          <label className="field">
            <span>Name</span>
            <input required maxLength={32} value={form.name} onChange={set("name")} placeholder="Hood Cat" />
          </label>
          <label className="field">
            <span>Ticker</span>
            <input required maxLength={10} value={form.symbol} onChange={set("symbol")} placeholder="HOODCAT" />
          </label>
          <label className="field">
            <span>Description</span>
            <textarea maxLength={500} rows={4} value={form.description} onChange={set("description")} placeholder="The cat that hopped the chain." />
          </label>
        </div>
      </div>
      <div className="create-socials">
        <label className="field">
          <span>Twitter</span>
          <input value={form.twitter} onChange={set("twitter")} placeholder="https://x.com/..." />
        </label>
        <label className="field">
          <span>Telegram</span>
          <input value={form.telegram} onChange={set("telegram")} placeholder="https://t.me/..." />
        </label>
        <label className="field">
          <span>Website</span>
          <input value={form.website} onChange={set("website")} placeholder="https://..." />
        </label>
      </div>
      <div className="create-socials">
        <label className="field">
          <span>Total supply</span>
          <input value={form.supply} onChange={set("supply")} />
        </label>
        <label className="field">
          <span>Initial buy (ETH)</span>
          <input value={form.initialBuyEth} onChange={set("initialBuyEth")} />
        </label>
      </div>
      <p className="wallet-note">
        Creation fee {weiToEth(CREATION_FEE)} ETH. 1% on every later trade. 80% of supply sells on the
        curve; 20% plus 5 ETH seed the AMM when the token graduates.
      </p>
      <button type="submit" className="btn" disabled={busy}>
        {busy ? "Launching…" : creator ? "Create token" : "Connect to create"}
      </button>
    </form>
  );
}
