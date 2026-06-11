// BrandLogo - the BidZone gavel mark (matches app/icon.svg favicon)

interface BrandLogoProps {
  className?: string;
}

export default function BrandLogo({ className = "h-6 w-6" }: BrandLogoProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="bz-logo" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3b82f6" />
          <stop offset="1" stopColor="#1b6ff2" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="url(#bz-logo)" />
      <g stroke="#fff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="30.5" y="13.5" width="17" height="11" rx="2.2" transform="rotate(45 39 19)" fill="#fff" stroke="none" />
        <path d="M33 27 L20 40" />
        <path d="M16 48 H40" />
        <path d="M22 48 L28 42" />
        <path d="M34 48 L40 42" />
      </g>
    </svg>
  );
}
