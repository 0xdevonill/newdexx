"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Home, Plus, User } from "lucide-react";
import { useState } from "react";
import { PROTOCOL } from "@/lib/protocol";
import { useAppState } from "@/lib/app-state";

export function Siderail() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const { wallet } = useAppState();
  const items = [
    { href: "/", label: "Home", icon: Home, exact: true },
    { href: "/create", label: "Create", icon: Plus },
    { href: wallet ? `/profile/${wallet}` : "/profile", label: "Profile", icon: User },
  ];

  return (
    <nav
      className={`siderail ${open ? "open" : ""}`}
      aria-label="Primary"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div className="rail-group">
        {items.map((it) => {
          const active = it.exact ? path === it.href : path === it.href || path.startsWith(`${it.href}/`);
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
