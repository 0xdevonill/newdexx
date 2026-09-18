import Link from "next/link";

export default function NotFound() {
  return (
    <div className="empty">
      <h1 className="page-title">This dock is empty</h1>
      <p className="muted">That route is not on the quay.</p>
      <p>
        <Link href="/">Back to the crossing desk</Link>
      </p>
    </div>
  );
}
