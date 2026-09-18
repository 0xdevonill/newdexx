import type { Metadata } from "next";
import { Fraunces, Figtree, JetBrains_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Web3Provider } from "@/components/web3-provider";
import { AppStateProvider } from "@/lib/app-state";
import { BRAND } from "@/lib/brand";
import "./globals.css";

const sans = Figtree({
  variable: "--font-sans",
  subsets: ["latin"],
});

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${BRAND.name} — ${BRAND.tagline}`,
  description: BRAND.description,
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html
      lang="en"
      data-theme="light"
      className={`${sans.variable} ${display.variable} ${mono.variable} light h-full antialiased`}
    >
      <body className="min-h-full">
        <Web3Provider>
          <AppStateProvider>
            <TooltipProvider>
              <AppShell>{children}</AppShell>
            </TooltipProvider>
          </AppStateProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
