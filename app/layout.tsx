import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { AppShell } from "@/components/app-shell";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppStateProvider } from "@/lib/app-state";
import { PROTOCOL } from "@/lib/protocol";
import { Web3Provider } from "@/components/web3-provider";
import "./globals.css";

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: PROTOCOL.name,
  description: PROTOCOL.tagline,
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${sans.variable} ${mono.variable} ${display.variable} dark h-full antialiased`}
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
