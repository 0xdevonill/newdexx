import Link from "next/link";
import { PROTOCOL } from "@/lib/tokens";

export default function NotFound() {
  return (
    <div className="empty">
      <h3>Page not found</h3>
      <p>That route is not part of {PROTOCOL.name}. Head back to the ping or the pool book.</p>
      <div className="tok-links">
        <Link href="/" className="btn btn-ping">
          Home
        </Link>
        <Link href="/pools" className="btn">
          Open pools
        </Link>
      </div>
    </div>
  );
}
