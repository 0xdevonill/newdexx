"use client";

import { usePathname } from "next/navigation";
import { Background } from "@/components/background";
import { Siderail } from "@/components/siderail";
import { Topbar } from "@/components/topbar";
import { useAppState } from "@/lib/app-state";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { toasts } = useAppState();
  const path = usePathname();
  const landing = path === "/";
  return (
    <div className={`app-root${landing ? " is-landing" : ""}`} data-rk="">
      <Background />
      <Topbar />
      {landing ? null : <Siderail />}
      <div className="app-rail-shift">
        <main className="shell-main">{children}</main>
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
