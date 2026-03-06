// Footer - site footer with links, copyright, and social media icons
import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-border bg-card-bg/95">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">

        {/* Brand blurb */}
        <div className="space-y-3">
          <p className="text-lg font-semibold tracking-tight text-text-heading">BidZone</p>
          <p className="text-sm leading-relaxed text-text-body">
            A live marketplace where buyers compete and sellers maximize item value in real time.
          </p>
        </div>

        {/* Marketplace links */}
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-text-label">Marketplace</p>
          <Link href="/auctions"        className="block text-sm text-text-body hover:text-text-label">All auctions</Link>
          <Link href="/auctions/create" className="block text-sm text-text-body hover:text-text-label">Start selling</Link>
          <Link href="/my-bids"         className="block text-sm text-text-body hover:text-text-label">My bids</Link>
        </div>

        {/* Account links */}
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-text-label">Account</p>
          <Link href="/login"     className="block text-sm text-text-body hover:text-text-label">Sign in</Link>
          <Link href="/register"  className="block text-sm text-text-body hover:text-text-label">Create account</Link>
          <Link href="/dashboard" className="block text-sm text-text-body hover:text-text-label">Seller dashboard</Link>
        </div>

        {/* Live pulse callout */}
        <div className="space-y-3 rounded-2xl border border-border bg-accent-soft/65 p-4">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-text-label">Live pulse</p>
          <p className="text-sm text-text-body">New bids arrive every few seconds on active premium listings.</p>
          <span className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white">
            Real-time updates
          </span>
        </div>

      </div>
      <div className="border-t border-border/80 px-4 py-4 text-center text-xs text-text-muted">
        Copyright {year} BidZone. All rights reserved.
      </div>
    </footer>
  );
}
