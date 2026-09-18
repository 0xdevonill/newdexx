export function Logo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <rect x="6" y="11" width="3.4" height="14" rx="1" fill="currentColor" />
      <rect x="22.6" y="11" width="3.4" height="14" rx="1" fill="currentColor" />
      <rect x="5" y="8.5" width="22" height="4.2" rx="1.2" fill="currentColor" />
      <path
        d="M5 27.2c3.2-2 5.4-2 8 0s5.2 2 8.1 0 4.8-2 7.9 0"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
