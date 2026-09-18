import type { Metadata } from "next";
import { Anton, Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { AppShell } from "@/components/app-shell";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppStateProvider } from "@/lib/app-state";
import { fetchLiveToken } from "@/lib/live-token";
import { PROTOCOL } from "@/lib/tokens";
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

const poster = Anton({
  variable: "--font-poster",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${PROTOCOL.name} ($${PROTOCOL.token})`,
    template: `%s · ${PROTOCOL.name}`,
  },
  description: PROTOCOL.tagline,
  icons: { icon: "/logo.png", apple: "/logo.png" },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const live = await fetchLiveToken();
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${sans.variable} ${mono.variable} ${display.variable} ${poster.variable} dark h-full antialiased`}
    >
      <body className="min-h-full">
        <Web3Provider>
          <AppStateProvider initialLive={live}>
            <TooltipProvider>
              <AppShell>{children}</AppShell>
            </TooltipProvider>
          </AppStateProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
