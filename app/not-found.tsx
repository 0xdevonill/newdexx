import Link from "next/link";

export default function NotFound() {
  return (
    <div className="empty">
      <h3>Page not found</h3>
      <p>That route is not part of Helix.fun.</p>
      <Link href="/" className="btn">
        Open the board
      </Link>
    </div>
  );
}
