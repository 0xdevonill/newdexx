"use client";

import { Background } from "@/components/background";
import { NetworkBanner } from "@/components/network-banner";
import { Siderail } from "@/components/siderail";
import { Topbar } from "@/components/topbar";
import { useAppState } from "@/lib/app-state";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { toasts } = useAppState();
  return (
    <div className="app-root" data-rk="">
      <Background />
      <Topbar />
      <Siderail />
      <div className="app-rail-shift">
        <main className="shell-main">
          <NetworkBanner />
          {children}
        </main>
      </div>
      <div className="toast-stack" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="toast">
            <div className="t-title">{t.title}</div>
            {t.body ? <div className="t-body">{t.body}</div> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
