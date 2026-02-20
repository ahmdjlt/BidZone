// Navbar - top navigation bar with logo, nav links, auth buttons, and user menu
import Link from "next/link";

const navLinks = [
  { href: "/auctions", label: "Browse" },
  { href: "/auctions/create", label: "Sell" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 px-4 pt-6">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between rounded-3xl border border-blue-100/90 bg-white/85 px-5 py-3 shadow-[0_16px_40px_-26px_rgba(22,97,230,0.5)] backdrop-blur-xl sm:px-7">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f5ddd,#4ea2ff)] text-sm font-black tracking-[0.12em] text-white">
            BZ
          </span>
          <span className="text-lg font-semibold tracking-tight text-blue-950">
            BidZone
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-blue-950 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-blue-600"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="rounded-xl px-3 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-50"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_28px_-18px_rgba(8,72,184,0.95)] transition hover:bg-blue-700"
          >
            Join now
          </Link>
        </div>
      </div>
    </header>
  );
}
