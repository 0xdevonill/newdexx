import { PROTOCOL } from "@/lib/tokens";

export function Logo({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={className ? `brand-mark ${className}` : "brand-mark"}
      src="/logo.png"
      width={32}
      height={32}
      alt={PROTOCOL.name}
    />
  );
}
