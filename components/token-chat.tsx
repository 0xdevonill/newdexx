"use client";

import { useState } from "react";
import { useAppState } from "@/lib/app-state";
import { relativeTime, shortAddr } from "@/lib/format";
import type { StoredComment } from "@/lib/types";

export function TokenChat({
  tokenId,
  comments,
  onPosted,
}: {
  tokenId: string;
  comments: StoredComment[];
  onPosted: () => void;
}) {
  const { wallet, pushToast } = useAppState();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const send = async () => {
    if (!wallet) {
      pushToast("Connect to chat");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/tokens/${tokenId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: wallet, text }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Could not post");
      setText("");
      onPosted();
    } catch (err) {
      pushToast("Chat failed", err instanceof Error ? err.message : "Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="action-panel chat-box">
      <div className="ap-head">
        <h3>Live chat</h3>
        <span className="muted">{comments.length}</span>
      </div>
      <div className="chat-list">
        {comments.length === 0 ? (
          <p className="wallet-note" style={{ padding: "12px 14px" }}>
            No replies yet. First comment ages like fine wine.
          </p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="chat-row">
              <div className="chat-meta">
                <span>{shortAddr(c.user)}</span>
                <span>{relativeTime(c.createdAt)}</span>
              </div>
              <p>{c.text}</p>
            </div>
          ))
        )}
      </div>
      <form
        className="chat-form"
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
      >
        <input
          value={text}
          maxLength={280}
          placeholder={wallet ? "say something" : "connect to chat"}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" className="btn btn-sm" disabled={busy}>
          Post
        </button>
      </form>
    </section>
  );
}
