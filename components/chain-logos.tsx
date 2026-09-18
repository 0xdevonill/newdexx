export function RhLogo({ size = 18 }: { size?: number }) {
  return (
    <svg
      className="chain-logo rh-logo"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden
    >
      <rect width="32" height="32" rx="9" fill="#00C805" />
      <path
        d="M16 6.2c2.2 5.2 4.8 10.4 9.2 17.6-3.1-1.8-6.1-2.7-9.2-2.7s-6.1.9-9.2 2.7C11.2 16.6 13.8 11.4 16 6.2Z"
        fill="#08140b"
      />
    </svg>
  );
}

export function SolLogo({ size = 18 }: { size?: number }) {
  return (
    <svg
      className="chain-logo sol-logo"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden
    >
      <rect width="32" height="32" rx="9" fill="#9945FF" />
      <path
        fill="#fff"
        d="M9.1 20.4h12.6l-2.5 2.7H6.6zM9.1 14.65h12.6l-2.5 2.7H6.6zM22.9 8.9H10.3L12.8 6.2h12.6z"
      />
    </svg>
  );
}
