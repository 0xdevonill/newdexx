"use client";

import Link from "next/link";
import { Header } from "@/components/header";
import { WalletUiProvider } from "@/components/wallet-button";
import { useAppState } from "@/lib/app-state";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { toasts } = useAppState();
  return (
    <WalletUiProvider>
    <div className="app-root">
      <Header />
      <main className="shell-main">{children}</main>
      <footer className="site-footer">
        <span>Independent crossing desk. Fares quoted through public Relay solvers.</span>
        <span>
          <Link href="/">Cross</Link>
          {" · "}
          <Link href="/log">Log</Link>
          {" · "}
          <Link href="/lanes">Lanes</Link>
        </span>
      </footer>
      <div className="toast-stack" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="toast">
            <div className="t-title">{t.title}</div>
            {t.body ? <div className="t-body">{t.body}</div> : null}
          </div>
        ))}
      </div>
    </div>
    </WalletUiProvider>
  );
}
