// Footer - site footer with links, copyright, and social media icons
import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-8 border-t border-border bg-card-bg/95">
      <div className="mx-auto grid w-full max-w-[1440px] gap-10 px-6 py-6 sm:grid-cols-2 sm:px-10 lg:grid-cols-3">

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


      </div>
      <div className="border-t border-border/80">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center justify-between gap-2 px-6 py-4 sm:flex-row sm:px-10">
          <p className="text-xs text-text-muted">Copyright {year} BidZone. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="text-xs text-text-muted hover:text-text-label transition-colors">Terms & Conditions</Link>
            <Link href="/privacy" className="text-xs text-text-muted hover:text-text-label transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
