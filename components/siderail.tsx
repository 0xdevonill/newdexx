"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChartLine,
  FileText,
  GraduationCap,
  Layers,
  Radio,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { PROTOCOL } from "@/lib/tokens";

const items = [
  { href: "/", label: "Ping", icon: Radio },
  { href: "/pools", label: "Pools", icon: ChartLine },
  { href: "/stakes", label: "Stakes", icon: Layers },
  { href: "/academy", label: "Academy", icon: GraduationCap },
  { href: "/positions", label: "Positions", icon: Wallet },
];

export function Siderail() {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav
      className={`siderail ${open ? "open" : ""}`}
      aria-label="Primary"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div className="rail-group">
        {items.map((it) => {
          const active =
            it.href === "/"
              ? path === "/"
              : path === it.href || path.startsWith(`${it.href}/`);
          const Icon = it.icon;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`rail-item ${active ? "active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              <span className="rail-ico">
                <Icon size={17} strokeWidth={1.9} />
              </span>
              <span className="rail-label">{it.label}</span>
            </Link>
          );
        })}
      </div>
      <div className="rail-group rail-group--end">
        <div className="rail-sep" aria-hidden />
        <a
          className="rail-item rail-social desktop-only"
          href={PROTOCOL.x}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${PROTOCOL.name} on X`}
        >
          <span className="rail-ico">
            <svg viewBox="0 0 24 24" width="17" height="17">
              <path
                fill="currentColor"
                d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
              />
            </svg>
          </span>
          <span className="rail-label">X</span>
        </a>
        <a
          className="rail-item rail-social desktop-only"
          href={PROTOCOL.discord}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${PROTOCOL.name} on Discord`}
        >
          <span className="rail-ico">
            <svg viewBox="0 0 24 24" width="17" height="17">
              <path
                fill="currentColor"
                d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.058a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.099.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.331c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"
              />
            </svg>
          </span>
          <span className="rail-label">Discord</span>
        </a>
        <Link href="/docs" className={`rail-item ${path === "/docs" ? "active" : ""}`}>
          <span className="rail-ico">
            <FileText size={17} strokeWidth={1.9} />
          </span>
          <span className="rail-label">Docs</span>
        </Link>
      </div>
    </nav>
  );
}
