import type { Metadata } from "next";
import { Landing } from "@/components/landing";
import { PROTOCOL } from "@/lib/tokens";

export const metadata: Metadata = {
  title: `${PROTOCOL.name} ($${PROTOCOL.token})`,
  description: PROTOCOL.tagline,
};

export default function Home() {
  return <Landing />;
}
