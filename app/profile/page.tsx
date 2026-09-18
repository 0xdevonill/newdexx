"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/app-state";

export default function ProfileIndex() {
  const { wallet } = useAppState();
  const router = useRouter();
  useEffect(() => {
    if (wallet) router.replace(`/profile/${wallet}`);
  }, [wallet, router]);
  return (
    <div className="empty">
      <h3>Connect a wallet</h3>
      <p>Your created tokens and holdings show up on your profile.</p>
    </div>
  );
}
