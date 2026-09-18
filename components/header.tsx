"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun } from "lucide-react";
import { Logo } from "@/components/logo";
import { WalletButton } from "@/components/wallet-button";
import { useAppState } from "@/lib/app-state";
import { BRAND } from "@/lib/brand";

const LINKS = [
  { href: "/", label: "Cross" },
  { href: "/log", label: "Log" },
  { href: "/lanes", label: "Lanes" },
];

export function Header() {
  const pathname = usePathname();
  const { theme, setTheme } = useAppState();

  return (
      <header className="site-header">
        <div className="site-header-inner">
          <Link className="brand" href="/" aria-label={`${BRAND.name} home`}>
            <Logo className="brand-mark" />
            <span className="brand-word">
              Qu<span>ay</span>
            </span>
          </Link>
          <nav className="nav-links" aria-label="Primary">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={pathname === l.href ? "on" : ""}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            <button
              type="button"
              className="icon-btn"
              title={theme === "dark" ? "Switch to day" : "Switch to night"}
              aria-label={theme === "dark" ? "Switch to day" : "Switch to night"}
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <WalletButton />
          </div>
        </div>
      </header>
  );
}
