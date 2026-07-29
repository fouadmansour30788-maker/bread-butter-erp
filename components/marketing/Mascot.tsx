// Friendly wheat-stalk mascot, matching the wheat logo mark used in the
// nav/footer — small recurring cameo, not a full illustration system.
export function Mascot({ size = 64, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-hidden>
      <path d="M50 21 C 40 10, 25 8, 18 14 C 28 20, 35 26, 42 32" fill="#2E6B45" />
      <path d="M50 21 C 60 10, 75 8, 82 14 C 72 20, 65 26, 58 32" fill="#2E6B45" />
      <ellipse cx="50" cy="56" rx="27" ry="33" fill="#E3A62F" />
      <circle cx="30" cy="61" r="5" fill="#C4890F" opacity="0.4" />
      <circle cx="70" cy="61" r="5" fill="#C4890F" opacity="0.4" />
      <circle cx="40" cy="53" r="4" fill="#122A1C" />
      <circle cx="60" cy="53" r="4" fill="#122A1C" />
      <path d="M38 65 Q50 75 62 65" stroke="#122A1C" strokeWidth="4" strokeLinecap="round" fill="none" />
    </svg>
  )
}
